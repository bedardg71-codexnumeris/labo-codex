/* ===============================
   MODULE: TRIMESTRE V2 — INIT
   Refactor étape 3 session A (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 34-401 + 486-948 (zone 1 MODULES-MAP §2.4 sauf
   `afficherStatistiquesTrimestreV2` qui reste au résidu comme helper
   transversal).

   Périmètre : init + identification + cadre calendrier + journées sans
   cours (fusion #374 du 5 août 2026 : un seul jeu de fonctions événements,
   variable module-scope `evenementEnEditionV2`).

   Dépendances cross-module accédées via `window.X` (résidu chargé AVANT) :
   - `window.chargerDropdownCoursV2` (zone 3)
   - `window.chargerGroupeCoursV2` (zone 6)
   - `window.chargerListeEtudiantsV2` (zone 4)
   - `window.afficherStatistiquesTrimestreV2` (zone 1 mais resté résidu)
   =============================== */

(function() {
'use strict';

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Initialise l'onglet Trimestre v2
 * Appelé au chargement de la page
 */
function initialiserTrimestreV2() {

    // Charger l'identification du trimestre (nom, session, année)
    chargerIdentificationTrimestreV2();

    // Charger le cadre calendrier dans les nouveaux champs
    chargerCadreCalendrierV2();

    // Charger les événements (prévus et imprévus)
    chargerJourneesSansCoursV2();

    // Charger la liste des cours dans le dropdown
    window.chargerDropdownCoursV2();

    // Charger le profil enseignant (Beta 95.2) — extrait dans trimestre-v2-enseignants.js (session A, 17 mai 2026)
    if (typeof window.chargerProfilEnseignantV2 === 'function') {
        window.chargerProfilEnseignantV2();
    }

    // Charger les séances dans l'accordéon Horaire — extrait dans trimestre-v2-horaires.js (session A, 17 mai 2026)
    if (typeof window.chargerSeancesV2 === 'function') {
        window.chargerSeancesV2();
    }

    // Charger les horaires (Beta 95.2) — extrait dans trimestre-v2-horaires.js (session A, 17 mai 2026)
    if (typeof window.chargerHorairesV2 === 'function') {
        window.chargerHorairesV2();
    }

    // Charger les groupe-cours (Beta 95.2)
    window.chargerGroupeCoursV2();

    // 🆕 BETA 95.1 : Charger la durée de période sauvegardée
    if (typeof chargerDureePeriodeUI === 'function') {
        chargerDureePeriodeUI();
    }

    // Charger la liste des étudiants dans l'accordéon Groupes
    window.chargerListeEtudiantsV2();

    // Populer le dropdown trimestre et afficher le formulaire — extrait dans trimestre-v2-liste.js (session A, 17 mai 2026)
    if (typeof window.populerDropdownTrimestreV2 === 'function') {
        window.populerDropdownTrimestreV2();
    }
    if (typeof window.afficherFormulaireTrimestreActif === 'function') {
        window.afficherFormulaireTrimestreActif();
    }

    // Restaurer l'état des accordéons (ouvert/fermé) depuis localStorage
    if (typeof restaurerEtatAccordeons === 'function') {
        restaurerEtatAccordeons();
    }

}

/* ===============================
   IDENTIFICATION DU TRIMESTRE
   =============================== */

/**
 * Charge l'identification du trimestre actif dans les champs v2-
 */
function chargerIdentificationTrimestreV2() {
    const trimestre = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;

    const elemNom = document.getElementById('v2-nomTrimestre');
    const elemSession = document.getElementById('v2-sessionTrimestre');
    const elemAnnee = document.getElementById('v2-anneeTrimestre');

    if (trimestre) {
        if (elemNom) elemNom.value = trimestre.nom || '';
        if (elemSession) {
            // Convertir session : H → hiver, A → automne, E → ete
            const sessionMap = { 'H': 'hiver', 'A': 'automne', 'E': 'ete' };
            elemSession.value = sessionMap[trimestre.session] || '';
        }
        if (elemAnnee) elemAnnee.value = trimestre.annee || '';
    } else {
        // Pas de trimestre actif, vider les champs
        if (elemNom) elemNom.value = '';
        if (elemSession) elemSession.value = '';
        if (elemAnnee) elemAnnee.value = '';
    }
}

/**
 * #379 — Détecte si un trimestre possède des données namespacées.
 * Énumère les DEUX couches du stockage hybride (localStorage ET memoryCache) :
 * une clé peut vivre en memoryCache/IndexedDB seulement après une bascule
 * silencieuse sur quota (leçon du 5 août 2026, cf. migrerJourneesSansCours).
 * @param {string} trimestreId - id du trimestre (ex. 'h2026')
 * @returns {boolean} true si au moins une clé `<id>_…` existe
 */
function _trimestreADesDonnees(trimestreId) {
    var prefixe = trimestreId + '_';
    try {
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf(prefixe) === 0) return true;
        }
    } catch (e) { /* énumération best-effort */ }
    try {
        if (typeof db !== 'undefined' && db.memoryCache && typeof db.memoryCache.keys === 'function') {
            for (var cleCache of db.memoryCache.keys()) {
                if (cleCache && cleCache.indexOf(prefixe) === 0) return true;
            }
        }
    } catch (e2) { /* idem */ }
    return false;
}

/**
 * Sauvegarde l'identification du trimestre depuis les champs v2-
 * Crée un nouveau trimestre si nécessaire ou met à jour l'existant
 */
function sauvegarderIdentificationTrimestreV2() {
    const nom = document.getElementById('v2-nomTrimestre')?.value?.trim() || '';
    const session = document.getElementById('v2-sessionTrimestre')?.value || '';
    const annee = document.getElementById('v2-anneeTrimestre')?.value || '';

    // #390 (audit 5 août, rapport B7) : plus de retour SILENCIEUX — sous le
    // bouton Enregistrer unique (#306), l'utilisateur voyait ensuite « Cadre
    // du trimestre sauvegardé » et croyait l'identification enregistrée.
    if (!session || !annee) {
        notifications.erreur(
            'Identification incomplète',
            'Choisis la session et l\'année du trimestre — elles déterminent où ses données sont rangées.'
        );
        return;
    }

    // Convertir session : hiver → H, automne → A, ete → E
    const sessionMap = { 'hiver': 'H', 'automne': 'A', 'ete': 'E' };
    const sessionCode = sessionMap[session] || 'H';
    const id = `${sessionCode.toLowerCase()}${annee}`;

    // Générer le nom si vide
    const nomTrimestre = nom || `${session.charAt(0).toUpperCase() + session.slice(1)} ${annee}`;

    // Récupérer les trimestres existants
    const trimestres = db.getSync('trimestres', []);
    const index = trimestres.findIndex(t => t.actif === true);

    if (index >= 0) {
        // Mettre à jour le trimestre actif
        const ancienId = trimestres[index].id;

        // #379 — changer session/année change l'ID, donc le préfixe de TOUTES
        // les clés namespacées du trimestre. Aucune migration n'existe : sans
        // garde, les données restent sous l'ancien préfixe et « disparaissent »
        // (famille de l'incident « cartes perdues » du 4 août). Deux gardes :
        if (ancienId !== id) {
            // 1. Collision : l'id cible appartient déjà à un AUTRE trimestre
            //    du registre (deux entrées de même id = données partagées).
            const collision = trimestres.some(function(t, i) { return i !== index && t.id === id; });
            if (collision) {
                notifications.erreur(
                    'Trimestre déjà existant',
                    'Le trimestre « ' + id + ' » existe déjà dans le registre. Pour y travailler, active-le depuis la bibliothèque des trimestres au lieu de renommer celui-ci.'
                );
                chargerIdentificationTrimestreV2();
                return;
            }
            // 2. Orphelinage : des données vivent sous l'ancien préfixe.
            if (_trimestreADesDonnees(ancienId)) {
                notifications.erreur(
                    'Changement bloqué',
                    'Ce trimestre (« ' + ancienId + ' ») contient des données : changer sa session ou son année les rendrait invisibles. Crée plutôt un nouveau trimestre pour la nouvelle session.'
                );
                chargerIdentificationTrimestreV2();
                return;
            }
        }

        trimestres[index].id = id;
        trimestres[index].nom = nomTrimestre;
        trimestres[index].session = sessionCode;
        trimestres[index].annee = parseInt(annee);

        db.setSync('trimestres', trimestres);

        // Synchroniser les miroirs window.trimestreActif + clé storage
        window.trimestreActif = id;
        db.setSync('trimestreActif', id);

    } else {
        // #379 — même garde de collision à la création : ne jamais pousser un
        // doublon d'id dans le registre (un trimestre inactif peut déjà le porter).
        if (trimestres.some(function(t) { return t.id === id; })) {
            notifications.erreur(
                'Trimestre déjà existant',
                'Le trimestre « ' + id + ' » existe déjà — active-le depuis la bibliothèque des trimestres.'
            );
            return;
        }

        // Créer un nouveau trimestre
        const nouveauTrimestre = {
            id: id,
            nom: nomTrimestre,
            session: sessionCode,
            annee: parseInt(annee),
            dateCreation: new Date().toISOString().split('T')[0],
            actif: true
        };

        // Désactiver les autres trimestres
        trimestres.forEach(t => t.actif = false);
        trimestres.push(nouveauTrimestre);

        db.setSync('trimestres', trimestres);
        window.trimestreActif = id;
        db.setSync('trimestreActif', id);

    }

    // Rafraîchir la liste dans Gestion des trimestres (extrait dans trimestre-v2-liste.js — session A, 17 mai 2026)
    if (typeof window.afficherListeTrimestreGestion === 'function') {
        window.afficherListeTrimestreGestion();
    }

    // Rafraîchir le dropdown trimestre
    if (typeof window.populerDropdownTrimestreV2 === 'function') {
        window.populerDropdownTrimestreV2();
    }
}

/**
 * #306 Lot 2 (3 juillet 2026) : point de persistance UNIQUE du Trimestre.
 * L'auto-save par champ (data-on-change) est retiré du HTML — seul le bouton
 * « Enregistrer » de la section appelle cette fonction, qui sauvegarde
 * l'identification PUIS le cadre (l'identification fixe l'id du trimestre
 * dont dépend cle('cadreCalendrier')).
 */
function sauvegarderTrimestreCompletV2() {
    sauvegarderIdentificationTrimestreV2();
    sauvegarderCadreCalendrierV2();
}

/* ===============================
   CADRE CALENDRIER
   =============================== */

/**
 * Charge les données du cadre calendrier dans les champs v2-
 */
function chargerCadreCalendrierV2() {
    const cadre = db.getSync(cle('cadreCalendrier'), null);

    // Mapping des IDs v2 vers les clés du cadre
    const champs = {
        'v2-debutTrimestre': 'dateDebut',
        'v2-finCours': 'finCours',
        'v2-finTrimestre': 'finTrimestre',
        'v2-remiseNotes': 'remiseNotes',
        'v2-semainePlanificationDebut': 'semainePlanificationDebut',
        'v2-semainePlanificationFin': 'semainePlanificationFin',
        'v2-semaineExamensDebut': 'semaineExamensDebut',
        'v2-semaineExamensFin': 'semaineExamensFin'
    };

    // Remplir ou vider les champs selon que le cadre existe ou non
    for (const [idElement, cleCadre] of Object.entries(champs)) {
        const element = document.getElementById(idElement);
        if (element) {
            element.value = (cadre && cadre[cleCadre]) ? cadre[cleCadre] : '';
        }
    }

    // Si pas de cadre, réinitialiser les statistiques et sortir
    if (!cadre) {
        const elemSemaines = document.getElementById('v2-nombreSemaines');
        const elemJours = document.getElementById('v2-nombreJoursCours');
        const elemStats = document.getElementById('v2-statsCongesReprises');
        if (elemSemaines) elemSemaines.textContent = '0';
        if (elemJours) elemJours.textContent = '0';
        if (elemStats) elemStats.textContent = '';
        return;
    }

    // Vérifier si le calendrier existe et correspond aux bornes actuelles
    const calendrier = db.getSync(cle('calendrierComplet'), null);
    const doitRegenerer = !calendrier ||
        (calendrier && cadre.dateDebut && !calendrier[cadre.dateDebut]) ||
        (calendrier && cadre.finTrimestre && !calendrier[cadre.finTrimestre]);

    if (doitRegenerer && cadre.dateDebut && cadre.finCours && cadre.finTrimestre) {
        if (typeof genererCalendrierComplet === 'function') {
            genererCalendrierComplet();
        }
    }

    // Mettre à jour les statistiques après un court délai
    setTimeout(() => {
        window.afficherStatistiquesTrimestreV2();
    }, 100);
}

/**
 * Sauvegarde le cadre calendrier depuis les champs v2-
 */
function sauvegarderCadreCalendrierV2() {
    const cadre = {
        dateDebut: document.getElementById('v2-debutTrimestre')?.value || '',
        finCours: document.getElementById('v2-finCours')?.value || '',
        finTrimestre: document.getElementById('v2-finTrimestre')?.value || '',
        remiseNotes: document.getElementById('v2-remiseNotes')?.value || '',
        semainePlanificationDebut: document.getElementById('v2-semainePlanificationDebut')?.value || '',
        semainePlanificationFin: document.getElementById('v2-semainePlanificationFin')?.value || '',
        semaineExamensDebut: document.getElementById('v2-semaineExamensDebut')?.value || '',
        semaineExamensFin: document.getElementById('v2-semaineExamensFin')?.value || ''
    };

    // Validation #215 : dateDebut + finCours + finTrimestre sont obligatoires.
    // Sans ces dates, les fonctions de semaine, échéances et snapshots cassent.
    const manquants = [];
    if (!cadre.dateDebut) manquants.push({ id: 'v2-debutTrimestre', label: 'Début du trimestre' });
    if (!cadre.finCours) manquants.push({ id: 'v2-finCours', label: 'Fin des cours réguliers' });
    if (!cadre.finTrimestre) manquants.push({ id: 'v2-finTrimestre', label: 'Fin du trimestre' });

    if (manquants.length > 0) {
        const details = manquants.map(c => '• ' + c.label).join('\n');
        notifications.erreur(
            'Dates obligatoires manquantes',
            'Renseigne ces champs avant de continuer :\n' + details
        );
        // Focus sur le premier champ vide
        const premier = document.getElementById(manquants[0].id);
        if (premier) premier.focus();
        return;
    }

    db.setSync(cle('cadreCalendrier'), cadre);

    // Régénérer le calendrier complet
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    } else {
        console.warn('[Trimestre V2] Fonction genererCalendrierComplet non disponible');
    }

    // Rafraîchir la vue calendaire si visible (sinon stale jusqu'au prochain changement d'onglet)
    if (typeof afficherCalendrierScolaire === 'function') {
        afficherCalendrierScolaire();
    }

    // Mettre à jour les statistiques après un délai pour laisser le temps à la synchronisation
    setTimeout(() => {
        window.afficherStatistiquesTrimestreV2();
    }, 300);

    // Notification
    notifications.succes('Cadre du trimestre sauvegardé');
}

/**
 * Réinitialise les bornes du trimestre aux valeurs vides
 */
function reinitialiserBornesTrimestreV2() {
    if (!confirm('Veux-tu vraiment réinitialiser les bornes du trimestre ?')) {
        return;
    }

    // Vider les champs de bornes
    const champs = [
        'v2-debutTrimestre',
        'v2-finCours',
        'v2-finTrimestre',
        'v2-remiseNotes'
    ];

    champs.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.value = '';
    });

    // Mettre à jour le storage
    let cadre = db.getSync(cle('cadreCalendrier')) || {};
    cadre.dateDebut = '';
    cadre.finCours = '';
    cadre.finTrimestre = '';
    cadre.remiseNotes = '';
    db.setSync(cle('cadreCalendrier'), cadre);

    // #390 (audit 5 août, rapport B5) : purger le calendrier généré — la
    // sidebar gardait « 15 sem. · 75 jours » après réinitialisation. NE PAS
    // régénérer ici : genererCalendrierComplet a des dates de repli en dur et
    // fabriquerait un calendrier fantôme sur des bornes vides.
    db.removeSync(cle('calendrierComplet'));
    if (typeof afficherCalendrierScolaire === 'function') {
        afficherCalendrierScolaire();
    }
    // Stats + avertissements à l'état vide (source unique #366)
    window.afficherStatistiquesTrimestreV2();

    // Notification
    notifications.succes('Bornes du trimestre réinitialisées');
}

/**
 * Réinitialise les semaines spéciales aux valeurs vides
 */
function reinitialiserSemainesSpecialesV2() {
    if (!confirm('Veux-tu vraiment réinitialiser les semaines spéciales ?')) {
        return;
    }

    // Vider les champs de semaines spéciales
    const champs = [
        'v2-semainePlanificationDebut',
        'v2-semainePlanificationFin',
        'v2-semaineExamensDebut',
        'v2-semaineExamensFin'
    ];

    champs.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.value = '';
    });

    // Mettre à jour le storage
    let cadre = db.getSync(cle('cadreCalendrier')) || {};
    cadre.semainePlanificationDebut = '';
    cadre.semainePlanificationFin = '';
    cadre.semaineExamensDebut = '';
    cadre.semaineExamensFin = '';
    db.setSync(cle('cadreCalendrier'), cadre);

    // #390 (audit 5 août, rapport B5) : les semaines spéciales influencent le
    // statut des jours — régénérer le calendrier (bornes toujours présentes)
    // et rafraîchir stats + avertissements, comme le fait la sauvegarde.
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }
    if (typeof afficherCalendrierScolaire === 'function') {
        afficherCalendrierScolaire();
    }
    window.afficherStatistiquesTrimestreV2();

    // Notification
    notifications.succes('Semaines spéciales réinitialisées');
}

/**
 * Affiche les statistiques du trimestre dans les spans v2-
 */
/* ===============================
   ÉVÉNEMENTS PRÉVUS/IMPRÉVUS
   =============================== */

/**
 * Charge et affiche les événements prévus
 */
/* ===============================
   JOURNÉES SANS COURS — fusion #374+#373 (relais 4 août 2026)
   Une carte, un formulaire, UNE clé `journeesSansCours` (les anciennes
   clés evenementsPrevus/evenementsImprevus sont fusionnées au boot par
   migrerJourneesSansCours, js/migrations.js). Natures : institutionnel /
   ferie / personnel. Reprise optionnelle, interdite sur personnel
   (convention §3.0).
   =============================== */

function chargerJourneesSansCoursV2() {
    const evenements = db.getSync(cle('journeesSansCours'), []);
    const conteneur = document.getElementById('v2-journeesSansCoursContainer');
    const compteur = document.getElementById('v2-nombreJourneesSansCours');

    if (compteur) compteur.textContent = evenements.length;
    if (!conteneur) return;

    if (evenements.length === 0) {
        conteneur.innerHTML = '';
        return;
    }

    // Tri chronologique : la liste se lit comme le trimestre se déroule
    const tries = [...evenements].sort((a, b) => String(a.dateEvenement).localeCompare(String(b.dateEvenement)));
    let html = '';
    tries.forEach(evt => {
        html += genererCarteEvenementV2(evt);
    });

    conteneur.innerHTML = html;
}

const BADGES_NATURE_V2 = {
    institutionnel: '<span class="badge-categorie-evenement badge-institutionnel">Institutionnel</span>',
    ferie: '<span class="badge-categorie-evenement badge-ferie">Férié</span>',
    personnel: '<span class="badge-categorie-evenement badge-personnel">Personnel</span>'
};

/**
 * Génère le HTML d'une carte journée sans cours (mode compact)
 */
function genererCarteEvenementV2(evt) {
    // #370 (relais 4 août) : « Reprise Lundi le 2026-09-10 » se lisait comme si
    // la reprise avait lieu un lundi — or Lundi désigne l'HORAIRE adopté ce
    // jour-là. Date d'abord, horaire entre parenthèses.
    const horaireRepris = (evt.horaireReprise || '').replace('Horaire du ', '');
    const repriseInfo = evt.dateReprise ?
        `<div style="font-size: 0.85rem; color: var(--gris-moyen); margin-top: 4px;">
            → Reprise le <strong>${echapperHtml(evt.dateReprise)}</strong>${horaireRepris ? ` (horaire du <strong>${echapperHtml(horaireRepris.toLowerCase())}</strong>)` : ''}
        </div>` : '';

    const badgeCat = BADGES_NATURE_V2[evt.categorie] || BADGES_NATURE_V2.institutionnel;

    return `
    <div class="item-carte-compact" style="margin-bottom: 12px; padding: 12px 15px; background: var(--bleu-tres-pale); border-radius: 8px; border-left: 4px solid var(--accent-primaire);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px;">
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <strong style="font-size: 1rem;">${echapperHtml(evt.description || '')}</strong>
                    ${badgeCat}
                    <span style="color: var(--accent-primaire); font-weight: 500;">${echapperHtml(evt.dateEvenement || '')}</span>
                </div>
                ${repriseInfo}
            </div>
            <div style="display: flex; gap: 8px; flex-shrink: 0;">
                <button data-action="modifierEvenementV2" data-param="${echapperHtml(evt.id || '')}" class="btn btn-secondaire btn-sm" style="padding: 6px 12px; font-size: 0.85rem;">Modifier</button>
                <button data-action="supprimerEvenementV2" data-param="${echapperHtml(evt.id || '')}" class="btn btn-supprimer btn-sm" style="padding: 6px 12px; font-size: 0.85rem;">Suppr.</button>
            </div>
        </div>
    </div>`;
}

// ID de la journée en cours d'édition (null = mode ajout)
let evenementEnEditionV2 = null;

/**
 * Affiche le formulaire d'ajout (champs réinitialisés)
 */
function afficherFormEvenementV2() {
    evenementEnEditionV2 = null;
    const form = document.getElementById('v2-formEvenement');
    if (!form) return;

    setValue('v2-dateEvenement', '');
    setValue('v2-descriptionEvenement', '');
    setValue('v2-categorieEvenement', 'institutionnel');
    setValue('v2-horaireReprise', '');
    setValue('v2-dateReprise', '');
    majAffichageRepriseV2();

    const btn = document.getElementById('v2-btnConfirmerEvenement');
    if (btn) btn.textContent = 'Ajouter';

    form.classList.remove('u-hide');
}

function majAffichageRepriseV2() {
    const cat = document.getElementById('v2-categorieEvenement')?.value || 'institutionnel';
    const bloc = document.getElementById('v2-blocReprise');
    if (!bloc) return;
    // Convention §3.0 : pas de reprise sur événement personnel.
    // Férié et institutionnel : reprise optionnelle (grève = institutionnel
    // SANS reprise, ça doit rester exprimable — on n'exige jamais la reprise).
    if (cat === 'personnel') {
        bloc.style.display = 'none';
        setValue('v2-horaireReprise', '');
        setValue('v2-dateReprise', '');
    } else {
        bloc.style.display = 'grid';
    }
}

/**
 * Pré-remplit le formulaire pour modifier une journée existante
 */
function modifierEvenementV2(id) {
    const evenements = db.getSync(cle('journeesSansCours'), []);
    const evt = evenements.find(e => e.id === id);

    if (!evt) {
        alert('Journée introuvable');
        return;
    }

    evenementEnEditionV2 = id;
    const form = document.getElementById('v2-formEvenement');
    if (!form) return;

    setValue('v2-dateEvenement', evt.dateEvenement || '');
    setValue('v2-descriptionEvenement', evt.description || '');
    setValue('v2-categorieEvenement', evt.categorie || 'institutionnel');
    setValue('v2-horaireReprise', evt.horaireReprise || '');
    setValue('v2-dateReprise', evt.dateReprise || '');
    majAffichageRepriseV2();

    const btn = document.getElementById('v2-btnConfirmerEvenement');
    if (btn) btn.textContent = 'Sauvegarder';

    form.classList.remove('u-hide');
}

/**
 * Confirme l'ajout ou la modification d'une journée sans cours
 */
function confirmerEvenementV2() {
    const dateEvenement = document.getElementById('v2-dateEvenement')?.value;
    const description = document.getElementById('v2-descriptionEvenement')?.value?.trim();
    const categorie = document.getElementById('v2-categorieEvenement')?.value || 'institutionnel';
    let horaireReprise = document.getElementById('v2-horaireReprise')?.value || '';
    let dateReprise = document.getElementById('v2-dateReprise')?.value || '';

    // Convention §3.0 : pas de reprise sur événement personnel
    if (categorie === 'personnel') {
        horaireReprise = '';
        dateReprise = '';
    }

    if (!dateEvenement || !description) {
        alert('Veuillez remplir la date et la description.');
        return;
    }

    if (dateReprise && !horaireReprise) {
        alert('Veuillez indiquer quel jour de cours est remplacé.');
        return;
    }

    const evenements = db.getSync(cle('journeesSansCours'), []);

    if (evenementEnEditionV2) {
        const index = evenements.findIndex(e => e.id === evenementEnEditionV2);
        if (index !== -1) {
            evenements[index] = {
                id: evenementEnEditionV2,
                dateEvenement,
                description,
                categorie,
                horaireReprise,
                dateReprise
            };
        }
    } else {
        evenements.push({
            id: genererIdUnique('EVT_'),
            dateEvenement,
            description,
            categorie,
            horaireReprise,
            dateReprise
        });
    }

    db.setSync(cle('journeesSansCours'), evenements); // security-ok: filtrage local d'une liste existante (suppression par id) // security-ok: saisie locale du formulaire (champs value/trim), pas de source externe
    rafraichirApresChangementEvenementV2(evenementEnEditionV2 ? 'Journée modifiée' : 'Journée ajoutée');
    annulerFormEvenementV2();
}

/**
 * Ferme le formulaire sans sauvegarder
 */
function annulerFormEvenementV2() {
    evenementEnEditionV2 = null;
    const form = document.getElementById('v2-formEvenement');
    if (form) form.classList.add('u-hide');
}

/**
 * Supprime une journée sans cours
 */
function supprimerEvenementV2(id) {
    if (!confirm('Veux-tu vraiment supprimer cette journée sans cours ?')) return;

    let evenements = db.getSync(cle('journeesSansCours'), []);
    evenements = evenements.filter(e => e.id !== id);
    db.setSync(cle('journeesSansCours'), evenements);

    rafraichirApresChangementEvenementV2('Journée supprimée');
}

/**
 * Régénère calendrier + séances et rafraîchit toutes les vues après un
 * changement dans les journées sans cours (point unique, ex-dupliqué ×3).
 */
function rafraichirApresChangementEvenementV2(messageSucces) {
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
    }
    if (typeof afficherCalendrierScolaire === 'function') {
        afficherCalendrierScolaire();
    }
    chargerJourneesSansCoursV2();
    window.afficherStatistiquesTrimestreV2();
    notifications.succes(messageSucces);
}

// Exports — 21 fonctions migrées du bloc principal résidu (L4007-4026 originelles
// + L2814 pour sauvegarderIdentificationTrimestreV2 isolé).
window.initialiserTrimestreV2 = initialiserTrimestreV2;
window.chargerIdentificationTrimestreV2 = chargerIdentificationTrimestreV2;
window.sauvegarderIdentificationTrimestreV2 = sauvegarderIdentificationTrimestreV2;
window.chargerCadreCalendrierV2 = chargerCadreCalendrierV2;
window.sauvegarderCadreCalendrierV2 = sauvegarderCadreCalendrierV2;
window.sauvegarderTrimestreCompletV2 = sauvegarderTrimestreCompletV2;
window.reinitialiserBornesTrimestreV2 = reinitialiserBornesTrimestreV2;
window.reinitialiserSemainesSpecialesV2 = reinitialiserSemainesSpecialesV2;
window.chargerJourneesSansCoursV2 = chargerJourneesSansCoursV2;
window.afficherFormEvenementV2 = afficherFormEvenementV2;
window.modifierEvenementV2 = modifierEvenementV2;
window.supprimerEvenementV2 = supprimerEvenementV2;
window.confirmerEvenementV2 = confirmerEvenementV2;
window.annulerFormEvenementV2 = annulerFormEvenementV2;
window.majAffichageRepriseV2 = majAffichageRepriseV2;

})();

