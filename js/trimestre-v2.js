/* ===============================
   MODULE: TRIMESTRE V2 (Beta 95)
   Gestion de l'onglet Trimestre restructuré

   Ce module gère la nouvelle interface de l'onglet Trimestre
   avec dropdowns et accordéons, tout en synchronisant avec
   les données existantes (cadreCalendrier, cours, etc.)
   =============================== */

(function() {
'use strict';

/* ===============================
   WRAPPERS NOTIFICATIONS
   (les fonctions originales sont dans evaluation.js / groupe.js,
    pas encore chargées quand ce module s'exécute)
   =============================== */

function afficherNotificationSucces(message, details) {
    if (typeof window.afficherNotificationSucces === 'function') {
        window.afficherNotificationSucces(message, details);
    } else {
    }
}

function afficherNotificationErreur(message, details) {
    if (typeof window.afficherNotificationErreur === 'function') {
        window.afficherNotificationErreur(message, details);
    } else {
        console.warn('[Trimestre V2] Erreur :', message, details || '');
    }
}

function afficherStatistiquesTrimestreV2() {
    // Lire depuis db avec clé namespacée
    let calendrier = null;
    try {
        calendrier = db.getSync(cle('calendrierComplet'), null);
    } catch (e) {
        console.error('[Trimestre V2] Erreur lecture calendrier:', e);
    }

    // Éléments originaux (masqués pour compatibilité)
    const elemSemaines = document.getElementById('v2-nombreSemaines');
    const elemJours = document.getElementById('v2-nombreJoursCours');
    const elemCongesReprises = document.getElementById('v2-statsCongesReprises');

    // Éléments sidebar (Beta 95.2)
    const elemSemainesSidebar = document.getElementById('v2-nombreSemainesSidebar');
    const elemJoursSidebar = document.getElementById('v2-nombreJoursCoursSidebar');
    const elemCongesReprisesSidebar = document.getElementById('v2-statsCongesReprisesSidebar');

    // Vérifier si le calendrier existe ET a des données
    if (!calendrier || typeof calendrier !== 'object' || Object.keys(calendrier).length === 0) {
        if (elemSemaines) elemSemaines.textContent = '0';
        if (elemJours) elemJours.textContent = '0';
        if (elemCongesReprises) elemCongesReprises.textContent = '';
        if (elemSemainesSidebar) elemSemainesSidebar.textContent = '0';
        if (elemJoursSidebar) elemJoursSidebar.textContent = '0';
        if (elemCongesReprisesSidebar) elemCongesReprisesSidebar.textContent = '';
        return;
    }

    // Compter les jours de cours, congés, reprises et trouver le max de numeroSemaine
    let joursCours = 0;
    let conges = 0;
    let reprises = 0;
    let maxSemaine = 0;

    Object.values(calendrier).forEach(jour => {
        if (jour.statut === 'cours') {
            joursCours++;
            if (jour.numeroSemaine && jour.numeroSemaine > maxSemaine) {
                maxSemaine = jour.numeroSemaine;
            }
        }
        if (jour.statut === 'reprise') {
            joursCours++;  // Les reprises comptent comme jours de cours
            reprises++;
            if (jour.numeroSemaine && jour.numeroSemaine > maxSemaine) {
                maxSemaine = jour.numeroSemaine;
            }
        }
        if (jour.statut === 'conge') conges++;
    });

    // Utiliser le numeroSemaine du calendrier (plus précis que diviser par 5)
    // Fallback sur division par 5 si pas de numeroSemaine
    const semaines = maxSemaine > 0 ? maxSemaine : Math.ceil(joursCours / 5);

    // Remplir éléments originaux (masqués)
    if (elemSemaines) elemSemaines.textContent = semaines;
    if (elemJours) elemJours.textContent = joursCours;

    // Remplir éléments sidebar (Beta 95.2)
    if (elemSemainesSidebar) elemSemainesSidebar.textContent = semaines;
    if (elemJoursSidebar) elemJoursSidebar.textContent = joursCours;

    // Générer le texte contextuel pour congés/reprises
    let texte = '';
    if (conges === 0 && reprises === 0) {
        texte = '(aucun congé)';
    } else if (reprises > 0 && conges > 0) {
        // Ex: "(incluant 2 reprises pour 2 congés)"
        const congeText = conges === 1 ? 'congé' : 'congés';
        const repriseText = reprises === 1 ? 'reprise' : 'reprises';
        texte = `(incluant ${reprises} ${repriseText} pour ${conges} ${congeText})`;
    } else if (conges > 0 && reprises === 0) {
        texte = `(${conges} congé${conges > 1 ? 's' : ''} non repris)`;
    } else if (reprises > 0 && conges === 0) {
        texte = `(${reprises} reprise${reprises > 1 ? 's' : ''})`;
    }

    if (elemCongesReprises) elemCongesReprises.textContent = texte;
    if (elemCongesReprisesSidebar) elemCongesReprisesSidebar.textContent = texte;
}



/**
 * Peuple les dropdowns du formulaire d'assemblage (5 éléments Beta 95.2)
 */
function populerDropdownsAssemblageV2() {

    // Beta 95.2: Dropdown Trimestres
    const selectTrimestre = document.getElementById('v2-gc-trimestre');
    if (selectTrimestre) {
        const trimestres = db.getSync('trimestres', []);
        const trimestreActif = db.getSync('trimestreActif', '');

        let html = '<option value="">— Choisir un trimestre —</option>';
        trimestres.forEach(t => {
            const nom = t.nom || t.id || 'Sans nom';
            const selected = (t.id === trimestreActif) ? ' selected' : '';
            html += `<option value="${echapperHtml(t.id)}"${selected}>${nom}</option>`;
        });
        selectTrimestre.innerHTML = html;
    } else {
    }

    // En mode démo legacy, les items démo sont dans les clés globales ;
    // on les affiche dans la section principale (pas d'optgroup séparé).
    const enDemoLegacy = typeof estEnModeDemo === 'function' && estEnModeDemo();

    // Dropdown Cours
    const selectCours = document.getElementById('v2-gc-cours');
    if (selectCours) {
        const cours = db.getSync('cours', []);
        const coursReels = enDemoLegacy ? cours : cours.filter(c => !c.isDemo);

        const labelCours = c => {
            const code = c.codeCours || c.sigle || c.code || '';
            const nom = c.nomCours || c.nom || c.titre || '';
            const label = code ? `${code}${nom ? ' - ' + nom : ''}` : nom;
            return label || `Cours ${c.id || 'inconnu'}`;
        };
        let html = '<option value="">— Choisir un cours —</option>';
        coursReels.forEach(c => {
            html += `<option value="${echapperHtml(c.id)}">${labelCours(c)}</option>`;
        });
        selectCours.innerHTML = html;

        if (!enDemoLegacy && typeof cleDemo === 'function' && typeof BibliothequeUI !== 'undefined') {
            const coursDemo = db.getSync(cleDemo('listeCours'), []) || [];
            BibliothequeUI.ajouterOptgroupDemo(selectCours, coursDemo, labelCours);
        }
    }

    // Dropdown Groupes d'étudiants
    const selectGroupe = document.getElementById('v2-gc-groupe');
    if (selectGroupe) {
        const cleEtud = cle('groupeEtudiants');
        const etudiants = db.getSync(cleEtud, []);

        // Extraire les groupes uniques
        const groupesSet = new Set();
        etudiants.forEach(e => {
            if (e.groupe) {
                groupesSet.add(String(e.groupe).padStart(5, '0'));
            }
        });

        const groupesTries = Array.from(groupesSet).sort();
        let html = '<option value="">— Choisir un groupe —</option>';
        groupesTries.forEach(grp => {
            const nbEtudiants = etudiants.filter(e => String(e.groupe).padStart(5, '0') === grp).length;
            html += `<option value="${grp}">${grp} (${nbEtudiants} étud.)</option>`;
        });
        selectGroupe.innerHTML = html;
    } else {
    }

    // Beta 95.2: Dropdown Horaires
    const selectHoraire = document.getElementById('v2-gc-horaire');
    if (selectHoraire) {
        const cleHoraires = cle('horaires');
        const horaires = db.getSync(cleHoraires, []);
        const horairesReels = enDemoLegacy ? horaires : horaires.filter(h => !h.isDemo);

        let html = '<option value="">— Choisir un horaire —</option>';
        horairesReels.forEach(h => {
            const nom = h.nom || h.id || 'Sans nom';
            html += `<option value="${echapperHtml(h.id)}">${nom}</option>`;
        });
        selectHoraire.innerHTML = html;

        if (!enDemoLegacy && typeof cleDemo === 'function' && typeof BibliothequeUI !== 'undefined') {
            const horairesDemo = db.getSync(cleDemo('horaires'), []) || [];
            BibliothequeUI.ajouterOptgroupDemo(selectHoraire, horairesDemo, h => h.nom || h.id || 'Sans nom');
        }
    }

    // Beta 95.2: Dropdown Enseignants (maintenant depuis liste unifiée)
    const selectEnseignant = document.getElementById('v2-gc-enseignant');
    if (selectEnseignant) {
        const enseignants = db.getSync('enseignants', []);
        const enseignantsReels = enDemoLegacy ? enseignants : enseignants.filter(e => !e.isDemo);

        const labelEns = e => (`${e.prenom || ''} ${e.nom || ''}`.trim() || e.id);
        let html = '<option value="">— Choisir un enseignant —</option>';
        enseignantsReels.forEach(e => {
            html += `<option value="${echapperHtml(e.id)}">${labelEns(e)}</option>`;
        });
        selectEnseignant.innerHTML = html;

        if (!enDemoLegacy && typeof cleDemo === 'function' && typeof BibliothequeUI !== 'undefined') {
            const ensDemo = db.getSync(cleDemo('enseignants'), []) || [];
            BibliothequeUI.ajouterOptgroupDemo(selectEnseignant, ensDemo, labelEns);
        }
    }

    // Beta 95.3: Dropdown Pratiques de notation (alignement Primo)
    // ✅ FIX (10 jan 2026) : N'affiche que les pratiques dans la sidebar (dansBibliotheque !== false)
    const selectPratique = document.getElementById('v2-gc-pratique');
    if (selectPratique) {
        // Les pratiques sont stockées dans 'pratiquesConfigurables' (module pratiques-gestion.js)
        const toutesPratiques = db.getSync('pratiquesConfigurables', []);
        // Filtrer pour n'afficher que les pratiques dans la sidebar
        const pratiques = enDemoLegacy
            ? toutesPratiques.filter(p => p.dansBibliotheque !== false)
            : toutesPratiques.filter(p => p.dansBibliotheque !== false && !p.isDemo);

        let html = '<option value="">— À compléter quand configurée —</option>';
        pratiques.forEach(p => {
            const nom = p.nom || p.id || 'Sans nom';
            html += `<option value="${echapperHtml(p.id)}">${nom}</option>`;
        });
        selectPratique.innerHTML = html;

        if (!enDemoLegacy && typeof cleDemo === 'function' && typeof BibliothequeUI !== 'undefined') {
            const pratiquesDemo = db.getSync(cleDemo('pratiquesConfigurables'), []) || [];
            BibliothequeUI.ajouterOptgroupDemo(selectPratique, pratiquesDemo, p => p.nom || p.id || 'Sans nom');
        }
    }
}
// Hub résiduel consommé par les sous-modules extraits (session A — 17 mai 2026).
window.populerDropdownsAssemblageV2 = populerDropdownsAssemblageV2;

/**
 * FIX #53 (1er fév 2026) : Met à jour les options du dropdown Format horaire
 * en fonction du nombre d'heures/semaine sélectionné
 */
function mettreAJourOptionsFormatHoraire() {
    const inputHeures = document.getElementById('heuresParSemaine');
    const selectFormat = document.getElementById('formatHoraire');

    if (!inputHeures || !selectFormat) return;

    const heures = parseInt(inputHeures.value) || 4;
    const valeurActuelle = selectFormat.value;

    // Trouver tous les diviseurs du nombre d'heures
    const diviseurs = [];
    for (let i = 1; i <= heures; i++) {
        if (heures % i === 0) {
            diviseurs.push(i);
        }
    }

    // Générer les options
    let html = '';
    diviseurs.forEach(d => {
        const periodes = d;
        const heuresParPeriode = heures / d;
        const value = `${periodes}x${heuresParPeriode}`;
        const label = periodes === 1
            ? `1 période de ${heuresParPeriode}h`
            : `${periodes} périodes de ${heuresParPeriode}h`;
        const selected = value === valeurActuelle ? ' selected' : '';
        html += `<option value="${value}"${selected}>${label}</option>`;
    });

    selectFormat.innerHTML = html;

    // Si la valeur actuelle n'existe plus, sélectionner la première option
    if (!selectFormat.value) {
        selectFormat.selectedIndex = 0;
    }

}

// Export pour le HTML
window.mettreAJourOptionsFormatHoraire = mettreAJourOptionsFormatHoraire;

// Exports globaux pour les fonctions groupe-cours

// [Chantier 1 — 6 fev 2026] chargerEtatDonneesDemoV2 + basculerDonneesDemoV2 supprimees (demantelement demo)

/* ===============================
   FORMAT HORAIRE DYNAMIQUE (6 jan 2026)
   Génère les options selon le nombre de périodes
   =============================== */

/**
 * Met à jour le dropdown Format horaire selon le nombre de périodes/semaine
 * Génère toutes les combinaisons possibles (diviseurs)
 */
function mettreAJourFormatHoraire() {
    const select = document.getElementById('v2-formatHoraire');
    const info = document.getElementById('v2-formatHoraire-info');
    const inputPeriodes = document.getElementById('v2-periodesParSemaine');

    if (!select || !inputPeriodes) return;

    const totalPeriodes = parseInt(inputPeriodes.value) || 4;
    const valeurActuelle = select.value;

    // Trouver tous les diviseurs du nombre de périodes
    const diviseurs = [];
    for (let i = 1; i <= totalPeriodes; i++) {
        if (totalPeriodes % i === 0) {
            diviseurs.push(i);
        }
    }

    // Générer les options
    let html = '';
    diviseurs.forEach(nbSeances => {
        const periodesParSeance = totalPeriodes / nbSeances;
        const value = `${nbSeances}x${periodesParSeance}`;
        const label = nbSeances === 1
            ? `1 séance de ${periodesParSeance} période${periodesParSeance > 1 ? 's' : ''}`
            : `${nbSeances} séances de ${periodesParSeance} période${periodesParSeance > 1 ? 's' : ''}`;
        html += `<option value="${value}">${label}</option>`;
    });

    select.innerHTML = html;

    // Restaurer la valeur si elle existe toujours
    if ([...select.options].some(opt => opt.value === valeurActuelle)) {
        select.value = valeurActuelle;
    }

    // Afficher la durée en heures/minutes
    mettreAJourInfoDuree();
}

/**
 * Affiche la durée totale en heures/minutes sous le dropdown
 */
function mettreAJourInfoDuree() {
    const info = document.getElementById('v2-formatHoraire-info');
    const inputPeriodes = document.getElementById('v2-periodesParSemaine');

    if (!info || !inputPeriodes) return;

    const totalPeriodes = parseInt(inputPeriodes.value) || 4;

    // Récupérer la durée d'une période (depuis horaire.js ou valeur par défaut)
    const dureePeriode = typeof obtenirDureePeriode === 'function'
        ? obtenirDureePeriode()
        : 55;

    const totalMinutes = totalPeriodes * dureePeriode;
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let texte = `= ${heures}h`;
    if (minutes > 0) texte += `${minutes.toString().padStart(2, '0')}`;
    texte += ` (${totalPeriodes} × ${dureePeriode} min)`;

    info.textContent = texte;
}


/* ===============================
   EXPORTS WINDOW
   =============================== */

// Exposer les fonctions au scope global
window.mettreAJourFormatHoraire = mettreAJourFormatHoraire;
window.mettreAJourInfoDuree = mettreAJourInfoDuree;
// Exports zone 1 (init + identification + calendrier + événements) migrés vers trimestre-v2-init.js (session A, 17 mai 2026).
// `afficherStatistiquesTrimestreV2` reste ici comme helper transversal.
window.afficherStatistiquesTrimestreV2 = afficherStatistiquesTrimestreV2;
// Exports zone 2 (liste trimestres) migrés vers trimestre-v2-liste.js (session A, 17 mai 2026).
// Exports de la zone 5 (séances + chargerHoraireGroupeActifV2) migrés vers
// trimestre-v2-horaires.js (session A, 17 mai 2026).
// [Chantier 1] exports demo supprimes
window.mettreAJourGuideGroupeCours = mettreAJourGuideGroupeCours;

/* ===============================
   GUIDE GROUPE-COURS : INDICATEURS D'ÉTAT
   =============================== */

/**
 * Met à jour les indicateurs d'état du guide groupe-cours
 * Vérifie si chaque étape est complétée : ○ (à faire) → ● (fait)
 */
function mettreAJourGuideGroupeCours() {
    const statusCours = document.getElementById('status-cours');
    const statusGroupe = document.getElementById('status-groupe');
    const statusHoraire = document.getElementById('status-horaire');
    const statusEtudiants = document.getElementById('status-etudiants');

    if (!statusCours) return; // Guide non présent sur la page

    // 1. Cours configuré ?
    const infoCours = db.getSync('infoCours', null);
    const coursOk = infoCours && (infoCours.sigle || infoCours.codeCours);
    statusCours.textContent = coursOk ? '●' : '○';
    statusCours.style.color = coursOk ? 'var(--vert-succes)' : 'var(--gris-moyen)';

    // 2. Groupe configuré ?
    const groupeOk = infoCours && infoCours.groupe;
    statusGroupe.textContent = groupeOk ? '●' : '○';
    statusGroupe.style.color = groupeOk ? 'var(--vert-succes)' : 'var(--gris-moyen)';

    // 3. Horaire configuré ?
    const cleHoraire = infoCours ? `seancesHoraire_${infoCours.id}` : null;
    let horaireOk = false;
    if (cleHoraire) {
        const seances = db.getSync(cleHoraire, []);
        horaireOk = seances && seances.length > 0;
    }
    statusHoraire.textContent = horaireOk ? '●' : '○';
    statusHoraire.style.color = horaireOk ? 'var(--vert-succes)' : 'var(--gris-moyen)';

    // 4. Étudiants importés ?
    const cleEtudiants = cle('groupeEtudiants');
    const etudiants = db.getSync(cleEtudiants, []);
    const etudiantsFiltres = infoCours ? etudiants.filter(e => e.coursId === infoCours.id) : etudiants;
    const etudiantsOk = etudiantsFiltres.length > 0;
    statusEtudiants.textContent = etudiantsOk ? '●' : '○';
    statusEtudiants.style.color = etudiantsOk ? 'var(--vert-succes)' : 'var(--gris-moyen)';

}

/* ===============================
   NAVIGATION VERS AIDE
   =============================== */

/**
 * Navigue vers la section AIDE et ouvre un accordéon spécifique
 * @param {string} idAccordeon - ID de l'accordéon à ouvrir (ex: 'aide-archivage')
 */
function allerVersAide(idAccordeon) {
    // 1. Naviguer vers la section AIDE
    if (typeof afficherSection === 'function') {
        afficherSection('aide');
    }

    // 2. Attendre un court délai pour que la section soit visible
    setTimeout(() => {
        const accordeon = document.getElementById('accordeon-' + idAccordeon);
        if (accordeon) {
            // 3. Ouvrir l'accordéon s'il est fermé
            const contenu = accordeon.querySelector('.accordeon-contenu');
            const chevron = accordeon.querySelector('.accordeon-chevron');
            if (contenu && contenu.classList.contains('u-hide')) {
                contenu.classList.remove('u-hide');
                if (chevron) chevron.textContent = '▼';
                accordeon.classList.add('ouvert');
            }

            // 4. Scroller vers l'accordéon
            accordeon.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.warn('[Trimestre V2] Accordéon non trouvé:', idAccordeon);
        }
    }, 100);
}


/* ===============================
   FONCTIONS MIGRÉES DE entites-ui.js
   (8 janvier 2026 - consolidation)
   =============================== */

// Variables d'état pour entités
let enseignantEnEditionUI = null;

/**
 * Peuple le dropdown "Groupe-cours actif" dans l'entête
 * 🆕 BETA 95.3 (10 jan 2026) : Ajoute section "Cours" pour voir tous les groupes fusionnés
 */
async function peuplerDropdownGroupeCoursActif() {
    const selectHeader = document.getElementById('selectGroupeCoursHeader');
    if (!selectHeader) return;

    const trimestres = db.getSync('trimestres', []);
    const trimestreActif = trimestres.find(t => t.actif);

    if (!trimestreActif) {
        selectHeader.innerHTML = '<option value="">-- Sélectionne un trimestre --</option>';
        return;
    }

    // Utiliser cle() pour cohérence avec sauvegarderGroupeCoursV2
    const cleGC = cle('groupesCours');
    const tousGroupesCours = db.getSync(cleGC, []);

    // 🆕 (10 jan 2026) : Filtrer les groupe-cours masqués (dansSidebar !== false)
    const groupesCours = tousGroupesCours.filter(gc => gc.dansSidebar !== false);

    let options = '<option value="">-- Sélectionner --</option>';

    if (groupesCours.length > 0) {
        const cours = db.getSync('cours', []);
        const enseignants = db.getSync('enseignants', []);
        const cleHoraires = cle('horaires');
        const horaires = db.getSync(cleHoraires, []);
        const gcActif = db.getSync('groupeCoursActif', null);

        // 🆕 BETA 95.3 : Grouper les groupe-cours par coursId pour la section "Cours"
        const coursMap = new Map();
        groupesCours.forEach(gc => {
            if (gc.coursId) {
                if (!coursMap.has(gc.coursId)) {
                    coursMap.set(gc.coursId, []);
                }
                coursMap.get(gc.coursId).push(gc);
            }
        });

        // Section Groupe-cours
        options += '<optgroup label="Groupe-cours">';
        groupesCours.forEach(gc => {
            const coursInfo = cours.find(c => c.id === gc.coursId);
            const ens = enseignants.find(e => e.id === gc.enseignantId) || {};
            const hor = horaires.find(h => h.id === gc.horaireId) || {};

            const sigle = coursInfo?.codeCours || coursInfo?.code || coursInfo?.sigle || null;
            const groupe = gc.groupe || gc.groupeNum || '00001';
            const nomEns = ens.prenom ? `${ens.prenom} ${(ens.nom || '').charAt(0)}.` : '';
            const nomHor = hor.nom || '';

            // 🆕 FIX (9 jan 2026) : Libellé lisible même sans cours
            let label = sigle ? `${sigle} gr.${groupe}` : `Groupe ${groupe}`;
            if (nomEns) label += ` - ${nomEns}`;
            if (nomHor) label += ` (${nomHor})`;

            const selected = gcActif && !gcActif.modeCours && gc.id === gcActif.id ? ' selected' : '';
            options += `<option value="${echapperHtml(gc.id)}"${selected}>${label}</option>`;
        });
        options += '</optgroup>';

        // 🆕 BETA 95.3 : Section Cours (tous groupes fusionnés)
        // Masquer en mode démo (un seul groupe-cours, pas besoin de la vue fusionnée)
        const trimestreActifDropdown = trimestres.find(t => t.actif);
        const estDemo = trimestreActifDropdown && trimestreActifDropdown.isDemo;
        if (coursMap.size > 0 && !estDemo) {
            options += '<optgroup label="Cours (tous groupes)">';
            coursMap.forEach((gcs, coursId) => {
                const coursInfo = cours.find(c => c.id === coursId);
                const sigle = coursInfo?.codeCours || coursInfo?.code || coursInfo?.sigle || coursId;
                const nbGroupes = gcs.length;
                const label = nbGroupes > 1 ? `${sigle} (${nbGroupes} groupes)` : sigle;
                const selected = gcActif && gcActif.modeCours && gcActif.coursId === coursId ? ' selected' : '';
                options += `<option value="cours:${coursId}"${selected}>${label}</option>`;
            });
            options += '</optgroup>';
        }
    }

    selectHeader.innerHTML = options;

    // 🆕 BETA 95.5 : Auto-sélection si aucun groupe-cours actif
    // Vérifie si le groupe-cours actuellement actif appartient au trimestre actif
    // 🔧 FIX (24 fév 2026) : Valider contre TOUS les groupe-cours, pas seulement ceux visibles dans la sidebar
    // Sinon un groupe masqué (dansSidebar=false) est considéré invalide et remplacé silencieusement
    const gcActif = db.getSync('groupeCoursActif', null);
    const gcActifValide = gcActif && tousGroupesCours.some(gc => gc.id === gcActif.id);

    if (!gcActifValide && groupesCours.length > 0) {
        // Sélectionner le premier groupe-cours du trimestre
        const premierGC = groupesCours[0];
        await changerGroupeCoursActifV2(premierGC.id);
        selectHeader.value = premierGC.id;
    } else if (gcActifValide) {
        // S'assurer que le dropdown reflète la sélection actuelle
        selectHeader.value = gcActif.modeCours ? `cours:${gcActif.coursId}` : gcActif.id;
    }
}

/**
 * Change le groupe-cours actif depuis le header
 */
async function changerGroupeCoursDepuisHeader(groupeCoursId) {
    if (typeof groupeCoursId === 'object' && groupeCoursId !== null) groupeCoursId = groupeCoursId.value;
    await changerGroupeCoursActifV2(groupeCoursId);
}

/**
 * Change le groupe-cours actif
 * 🆕 BETA 95.3 (10 jan 2026) : Supporte le mode "cours" (tous groupes fusionnés)
 */
async function changerGroupeCoursActifV2(valeur) {
    // DEBUG (11 jan 2026)

    if (!valeur) {
        db.setSync('groupeCoursActif', null);
        db.setSync('infoCours', null);
        return;
    }

    const trimestres = db.getSync('trimestres', []);
    const trimestreActif = trimestres.find(t => t.actif);
    if (!trimestreActif) return;

    // 🆕 BETA 95.3 : Détecter si c'est un mode cours (tous groupes)
    const estModeCours = valeur.startsWith('cours:');

    if (estModeCours) {
        // Mode COURS : tous les groupes fusionnés
        const coursId = valeur.replace('cours:', '');
        const cours = db.getSync('cours', []);

        const coursInfo = cours.find(c => c.id === coursId);

        const sigle = coursInfo?.codeCours || coursInfo?.code || coursInfo?.sigle || coursId;

        db.setSync('groupeCoursActif', {
            modeCours: true,
            coursId: coursId,
            trimestreId: trimestreActif.id,
            groupe: null,  // null = tous les groupes
            id: null,
            enseignantId: null,
            horaireId: null
        });

        // ✅ CORRIGÉ (11 jan 2026) : Utiliser setSync pour éviter problèmes localStorage saturé
        db.setSync('infoCours', {
            id: coursId,
            codeCours: sigle,
            nomCours: coursInfo?.nomCours || '',
            groupe: null,  // null = tous les groupes
            _modeCours: true
        });

        const selectHeader = document.getElementById('selectGroupeCoursHeader');
        if (selectHeader) selectHeader.value = valeur;

        if (typeof mettreAJourContexteEntete === 'function') {
            mettreAJourContexteEntete();
        }

        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Cours activé (tous groupes)');
        }

        if (typeof afficherCalendrierScolaire === 'function') {
            afficherCalendrierScolaire();
        }

        // 🆕 BETA 95.3 : Rafraîchir la liste des étudiants si visible
        // Réinitialiser le filtre groupe local (redondant avec le dropdown entête)
        const filtreGroupeCours = document.getElementById('filtre-groupe-liste');
        if (filtreGroupeCours) filtreGroupeCours.value = '';
        if (typeof afficherListeEtudiantsConsultation === 'function') {
            afficherListeEtudiantsConsultation();
        }

        // 🆕 BETA 95.6 : Rafraîchir le tableau de bord aperçu (badges nb étudiants)
        if (typeof chargerTableauBordApercu === 'function') {
            chargerTableauBordApercu();
        }

        // 🆕 BETA 95.6 : Rafraîchir le profil étudiant si affiché
        // Vérifie si la sous-section profil est active et si un DA est mémorisé
        const sousSectionProfil = document.getElementById('suivi-profil');
        if (sousSectionProfil && !sousSectionProfil.classList.contains('u-hide') && window.profilActuelDA) {
            if (typeof afficherProfilComplet === 'function') {
                // Récupérer la liste des étudiants du nouveau groupe-cours
                const etudiantsNouveauGC = typeof obtenirEtudiantsCoursActif === 'function'
                    ? obtenirEtudiantsCoursActif()
                    : [];
                // Si l'étudiant actuel n'est pas dans le nouveau groupe, afficher le premier de la liste
                const etudiantExiste = etudiantsNouveauGC.find(e => e.da === window.profilActuelDA);
                if (etudiantExiste) {
                    afficherProfilComplet(window.profilActuelDA);
                } else if (etudiantsNouveauGC.length > 0) {
                    // Trier et prendre le premier
                    etudiantsNouveauGC.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
                    const premierActif = etudiantsNouveauGC.find(e => !estEtudiantExclu(e));
                    if (premierActif) {
                        afficherProfilComplet(premierActif.da);
                    }
                }
            }
        }

        // 🆕 BETA 96.1 : Rafraîchir la boîte à outils si visible
        if (typeof window.initialiserTirage === 'function') {
            window.initialiserTirage();
        }
        if (typeof window.initialiserQuestions === 'function') {
            window.initialiserQuestions();
        }

        // 🆕 FIX (3 fév 2026) : Rafraîchir le module de saisie des présences si visible
        const sectionSaisiePresencesCours = document.getElementById('suivi-saisie');
        if (sectionSaisiePresencesCours && !sectionSaisiePresencesCours.classList.contains('u-hide')) {
            if (typeof initialiserModuleSaisiePresences === 'function') {
                initialiserModuleSaisiePresences();
            }
            if (typeof mettreAJourBoutonsNavigation === 'function') {
                mettreAJourBoutonsNavigation();
            }
        }

        // Rafraîchir la liste des évaluations
        if (typeof initialiserListeEvaluations === 'function') {
            initialiserListeEvaluations();
        }

        // Rafraîchir le module travaux si visible
        if (typeof travauxUI !== 'undefined') {
            var siC = document.getElementById('evaluations-contenu-import');
            if (siC && !siC.classList.contains('u-hide') && typeof travauxUI.afficherImport === 'function') travauxUI.afficherImport();
            var sfC = document.getElementById('evaluations-contenu-fichiers');
            if (sfC && !sfC.classList.contains('u-hide') && typeof travauxUI.afficherFichiers === 'function') travauxUI.afficherFichiers();
            var saC = document.getElementById('evaluations-contenu-archivage');
            if (saC && !saC.classList.contains('u-hide') && typeof travauxUI.afficherArchivage === 'function') travauxUI.afficherArchivage();
        }

        return;
    }

    // Mode GROUPE-COURS : un seul groupe
    const groupeCoursId = valeur;

    // ✅ CORRIGÉ (8 janvier 2026) : Utiliser cle() pour cohérence avec les autres fonctions
    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []);
    const gc = groupesCours.find(g => g.id === groupeCoursId);

    if (!gc) {
        console.warn('[Trimestre V2] Groupe-cours non trouvé:', groupeCoursId);
        return;
    }

    groupesCours.forEach(g => g.actif = (g.id === groupeCoursId));
    // ✅ CORRIGÉ (11 jan 2026) : Utiliser db.set pour synchroniser IndexedDB avant synchroniserInfoCours
    await db.set(cleGC, groupesCours);

    db.setSync('groupeCoursActif', {
        modeCours: false,
        id: gc.id,
        trimestreId: gc.trimestreId || trimestreActif.id,
        coursId: gc.coursId,
        enseignantId: gc.enseignantId,
        horaireId: gc.horaireId,
        groupe: gc.groupe || gc.groupeNum
    });

    // ✅ CORRIGÉ (11 jan 2026) : Mettre à jour infoCours directement (évite problèmes timing IndexedDB)
    const cours = db.getSync('cours', []);
    const coursInfo = cours.find(c => c.id === gc.coursId);
    const sigleGC = coursInfo?.codeCours || coursInfo?.code || coursInfo?.sigle || '';

    // ✅ Utiliser setSync car infoCours doit être lu de manière synchrone par obtenirEtudiantsCoursActif
    db.setSync('infoCours', {
        id: gc.coursId,  // ID du cours (pour compatibilité avec e.coursId des étudiants)
        codeCours: sigleGC,
        nomCours: coursInfo?.nomCours || '',
        groupe: gc.groupe || gc.groupeNum,
        _modeCours: false,
        _source: 'groupe-cours',
        _groupeCoursId: gc.id  // ID du groupe-cours
    });

    const selectHeader = document.getElementById('selectGroupeCoursHeader');
    if (selectHeader) selectHeader.value = groupeCoursId || '';

    if (typeof mettreAJourContexteEntete === 'function') {
        mettreAJourContexteEntete();
    }

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Groupe-cours activé');
    }

    // 🔧 FIX (30 mars 2026) : Synchroniser horaireHebdo avec le groupe actif
    // AVANT de regénérer le calendrier (sinon il utilise les horaires fusionnés)
    if (gc.horaireId) {
        var horaires = db.getSync(cle('horaires'), []);
        var horaireGC = horaires.find(function(h) { return h.id === gc.horaireId; });
        if (horaireGC && horaireGC.seances && horaireGC.seances.length > 0) {
            db.setSync(cle('horaireHebdo'), horaireGC.seances);
            db.setSync(cle('seancesHoraire'), horaireGC.seances);
            db.setSync('seancesHoraire', horaireGC.seances);
        }
    }

    // Regénérer le calendrier avec les bons jours
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }

    // 🆕 BETA 95.2 : Rafraîchir le calendrier si visible
    if (typeof afficherCalendrierScolaire === 'function') {
        afficherCalendrierScolaire();
    }

    // 🆕 BETA 95.3 : Rafraîchir la liste des étudiants si visible
    // Réinitialiser le filtre groupe local (redondant avec le dropdown entête)
    const filtreGroupeGC = document.getElementById('filtre-groupe-liste');
    if (filtreGroupeGC) filtreGroupeGC.value = '';
    if (typeof afficherListeEtudiantsConsultation === 'function') {
        afficherListeEtudiantsConsultation();
    }

    // 🆕 BETA 95.6 : Rafraîchir le tableau de bord aperçu (badges nb étudiants)
    if (typeof chargerTableauBordApercu === 'function') {
        chargerTableauBordApercu();
    }

    // 🆕 BETA 95.6 : Rafraîchir le profil étudiant si affiché
    // Vérifie si la sous-section profil est active et si un DA est mémorisé
    const sousSectionProfilGC = document.getElementById('suivi-profil');
    if (sousSectionProfilGC && !sousSectionProfilGC.classList.contains('u-hide') && window.profilActuelDA) {
        if (typeof afficherProfilComplet === 'function') {
            // Récupérer la liste des étudiants du nouveau groupe-cours
            const etudiantsNouveauGroupe = typeof obtenirEtudiantsCoursActif === 'function'
                ? obtenirEtudiantsCoursActif()
                : [];
            // Si l'étudiant actuel n'est pas dans le nouveau groupe, afficher le premier de la liste
            const etudiantExisteGC = etudiantsNouveauGroupe.find(e => e.da === window.profilActuelDA);
            if (etudiantExisteGC) {
                afficherProfilComplet(window.profilActuelDA);
            } else if (etudiantsNouveauGroupe.length > 0) {
                // Trier et prendre le premier
                etudiantsNouveauGroupe.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
                const premierActifGC = etudiantsNouveauGroupe.find(e => !estEtudiantExclu(e));
                if (premierActifGC) {
                    afficherProfilComplet(premierActifGC.da);
                }
            }
        }
    }

    // 🆕 BETA 96.1 : Rafraîchir la boîte à outils si visible
    if (typeof window.initialiserTirage === 'function') {
        window.initialiserTirage();
    }
    if (typeof window.initialiserQuestions === 'function') {
        window.initialiserQuestions();
    }

    // 🆕 FIX (3 fév 2026) : Rafraîchir le module de saisie des présences si visible
    // Les dates de séances dépendent de l'horaire du groupe-cours actif
    const sectionSaisiePresences = document.getElementById('suivi-saisie');
    if (sectionSaisiePresences && !sectionSaisiePresences.classList.contains('u-hide')) {
        if (typeof initialiserModuleSaisiePresences === 'function') {
            initialiserModuleSaisiePresences();
        }
        if (typeof mettreAJourBoutonsNavigation === 'function') {
            mettreAJourBoutonsNavigation();
        }
    }

    // Rafraîchir la liste des évaluations
    if (typeof initialiserListeEvaluations === 'function') {
        initialiserListeEvaluations();
    }

    // Rafraîchir le module travaux si visible
    if (typeof travauxUI !== 'undefined') {
        var siGC = document.getElementById('evaluations-contenu-import');
        if (siGC && !siGC.classList.contains('u-hide') && typeof travauxUI.afficherImport === 'function') travauxUI.afficherImport();
        var sfGC = document.getElementById('evaluations-contenu-fichiers');
        if (sfGC && !sfGC.classList.contains('u-hide') && typeof travauxUI.afficherFichiers === 'function') travauxUI.afficherFichiers();
        var saGC = document.getElementById('evaluations-contenu-archivage');
        if (saGC && !saGC.classList.contains('u-hide') && typeof travauxUI.afficherArchivage === 'function') travauxUI.afficherArchivage();
    }

}

/**
 * Peuple le dropdown des enseignants
 */
async function peuplerDropdownEnseignants() {
    const select = document.getElementById('v2-selectEnseignant');
    const selectGC = document.getElementById('v2-gc-enseignant');
    if (!select) return;

    let enseignants = [];
    if (typeof EnseignantsEntite !== 'undefined') {
        enseignants = await EnseignantsEntite.obtenirTous();
    }

    let options = '<option value="">Sélectionner un enseignant·e</option>';
    enseignants.forEach(ens => {
        const libelle = typeof EnseignantsEntite !== 'undefined'
            ? EnseignantsEntite.genererLibelle(ens)
            : `${ens.prenom} ${ens.nom}`;
        options += `<option value="${echapperHtml(ens.id)}">${libelle}</option>`;
    });

    select.innerHTML = options;
    if (selectGC) {
        selectGC.innerHTML = options.replace('Sélectionner', '-- Sélectionner');
    }
}

/**
 * Change l'enseignant sélectionné (affiche aperçu)
 */
function changerEnseignantSelectionneV2(enseignantId) {
    const btnModifier = document.getElementById('v2-btnModifierEnseignant');
    const apercu = document.getElementById('v2-apercuEnseignant');

    if (!enseignantId) {
        if (btnModifier) btnModifier.classList.add('u-hide');
        if (apercu) apercu.innerHTML = '<p class="text-muted">Sélectionne un enseignant·e pour voir ses détails.</p>';
        return;
    }

    if (btnModifier) btnModifier.style.display = '';

    if (typeof EnseignantsEntite !== 'undefined') {
        EnseignantsEntite.obtenirParId(enseignantId).then(ens => {
            if (!ens || !apercu) return;
            apercu.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <div><strong>Nom :</strong> ${echapperHtml(ens.prenom)} ${echapperHtml(ens.nom)}</div>
                    <div><strong>Courriel :</strong> ${echapperHtml(ens.courriel || '-')}</div>
                    <div><strong>Institution :</strong> ${echapperHtml(ens.institution || '-')}</div>
                    <div><strong>Département :</strong> ${echapperHtml(ens.departement || '-')}</div>
                    <div><strong>Discipline :</strong> ${echapperHtml(ens.discipline || '-')}</div>
                    <div><strong>Site web :</strong> ${ens.siteWeb ? `<a href="${echapperHtml(ens.siteWeb)}" target="_blank">${echapperHtml(ens.siteWeb)}</a>` : '-'}</div>
                </div>
            `;
        });
    }
}

/**
 * Affiche le formulaire d'ajout d'enseignant
 */
function afficherFormEnseignantV2() {
    enseignantEnEditionUI = null;

    const fields = ['v2-ens-prenom', 'v2-ens-nom', 'v2-ens-courriel', 'v2-ens-institution', 'v2-ens-departement', 'v2-ens-discipline', 'v2-ens-siteWeb'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const titre = document.getElementById('v2-titreFormEnseignant');
    const btnTexte = document.getElementById('v2-btnTexteEnseignant');
    if (titre) titre.textContent = 'Nouvel enseignant·e';
    if (btnTexte) btnTexte.textContent = 'Ajouter';

    const form = document.getElementById('v2-formulaireEnseignant');
    const apercu = document.getElementById('v2-apercuEnseignant');
    if (form) form.classList.remove('u-hide');
    if (apercu) apercu.classList.add('u-hide');
}

/**
 * Modifie l'enseignant sélectionné
 */
async function modifierEnseignantSelectionneV2() {
    const enseignantId = document.getElementById('v2-selectEnseignant')?.value;
    if (!enseignantId || typeof EnseignantsEntite === 'undefined') return;

    const ens = await EnseignantsEntite.obtenirParId(enseignantId);
    if (!ens) return;

    enseignantEnEditionUI = enseignantId;

    const mapping = {
        'v2-ens-prenom': ens.prenom,
        'v2-ens-nom': ens.nom,
        'v2-ens-courriel': ens.courriel,
        'v2-ens-institution': ens.institution,
        'v2-ens-departement': ens.departement,
        'v2-ens-discipline': ens.discipline,
        'v2-ens-siteWeb': ens.siteWeb
    };
    Object.entries(mapping).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    });

    const titre = document.getElementById('v2-titreFormEnseignant');
    const btnTexte = document.getElementById('v2-btnTexteEnseignant');
    if (titre) titre.textContent = 'Modifier l\'enseignant·e';
    if (btnTexte) btnTexte.textContent = 'Enregistrer';

    const form = document.getElementById('v2-formulaireEnseignant');
    const apercu = document.getElementById('v2-apercuEnseignant');
    if (form) form.classList.remove('u-hide');
    if (apercu) apercu.classList.add('u-hide');
}

/**
 * Affiche le formulaire d'ajout d'horaire (version UI)
 */
function afficherFormHoraireV2() {
    horaireEnEditionId = null;
    seancesTempV2 = [];

    const fields = { 'v2-hor-nom': '', 'v2-hor-local': '', 'v2-hor-nbSeances': '2', 'v2-hor-periodesParSeance': '2' };
    Object.entries(fields).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });

    const titre = document.getElementById('v2-titreFormHoraire');
    const btnTexte = document.getElementById('v2-btnTexteHoraire');
    if (titre) titre.textContent = 'Nouvel horaire';
    if (btnTexte) btnTexte.textContent = 'Ajouter';

    // Peupler dropdown groupe associé
    window.populerDropdownGroupesHoraireV2();

    window.mettreAJourSeancesHoraireV2();

    const form = document.getElementById('v2-formulaireHoraire');
    if (form) form.classList.remove('u-hide');
}

/**
 * Modifie l'horaire sélectionné
 */
async function modifierHoraireSelectionneV2() {
    const horaireId = document.getElementById('v2-selectHoraire')?.value;
    if (!horaireId || typeof HorairesEntite === 'undefined') return;

    const hor = await HorairesEntite.obtenirParId(horaireId);
    if (!hor) return;

    horaireEnEditionId = horaireId;
    seancesTempV2 = [...(hor.seances || [])];

    document.getElementById('v2-hor-nom').value = hor.nom || '';
    document.getElementById('v2-hor-local').value = hor.local || '';
    document.getElementById('v2-hor-nbSeances').value = String(hor.nbSeances || hor.seances?.length || 2);
    document.getElementById('v2-hor-periodesParSeance').value = String(hor.periodesParSeance || 2);

    // Groupe associé
    const selectGroupe = document.getElementById('v2-hor-groupeAssocie');
    if (selectGroupe) {
        window.populerDropdownGroupesHoraireV2();
        selectGroupe.value = hor.groupeAssocie || '';
    }

    afficherSeancesHoraireV2();
    mettreAJourResumeFormatHoraireV2();

    const titre = document.getElementById('v2-titreFormHoraire');
    const btnTexte = document.getElementById('v2-btnTexteHoraire');
    if (titre) titre.textContent = 'Modifier l\'horaire';
    if (btnTexte) btnTexte.textContent = 'Enregistrer';

    const form = document.getElementById('v2-formulaireHoraire');
    if (form) form.classList.remove('u-hide');
}

/**
 * Met à jour le résumé du format horaire
 */
function mettreAJourResumeFormatHoraireV2() {
    const nbSeances = parseInt(document.getElementById('v2-hor-nbSeances')?.value) || 2;
    const periodesParSeance = parseInt(document.getElementById('v2-hor-periodesParSeance')?.value) || 2;
    const totalPeriodes = nbSeances * periodesParSeance;

    const resumeElem = document.getElementById('v2-hor-formatResume');
    if (resumeElem) {
        resumeElem.textContent = `${nbSeances} séance${nbSeances > 1 ? 's' : ''} × ${periodesParSeance} période${periodesParSeance > 1 ? 's' : ''} = ${totalPeriodes} périodes/semaine`;
    }
}

/**
 * Affiche le formulaire de création de groupe-cours
 */
function afficherFormGroupeCoursV2() {
    const fields = ['v2-gc-cours', 'v2-gc-groupe'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const titre = document.getElementById('v2-titreFormGroupeCours');
    if (titre) titre.textContent = 'Nouveau groupe-cours';

    if (typeof window.afficherTrimestreGroupeCoursV2 === 'function') {
        window.afficherTrimestreGroupeCoursV2();
    }

    const form = document.getElementById('v2-formulaireGroupeCours');
    if (form) form.classList.remove('u-hide');
}

/**
 * Active un groupe-cours
 */
async function activerGroupeCoursV2(groupeCoursId) {
    const trimestreActif = window.trimestreActif || obtenirTrimestreActif()?.id;
    if (!trimestreActif) return;

    try {
        if (typeof GroupeCoursEntite !== 'undefined') {
            await GroupeCoursEntite.activer(trimestreActif, groupeCoursId);
            await GroupeCoursEntite.synchroniserInfoCours(trimestreActif);
        }

        rafraichirListeGroupeCoursV2();
        await peuplerDropdownGroupeCoursActif();

        if (typeof chargerCoursSelectV2 === 'function') {
            chargerCoursSelectV2();
        }

    } catch (err) {
        console.error('[Trimestre V2] Erreur activation groupe-cours:', err);
        alert('Erreur lors de l\'activation');
    }
}

/**
 * Supprime un groupe-cours (ancienne version - redirige vers la nouvelle)
 * @deprecated Utiliser supprimerGroupeCoursV2() sans paramètre
 */
async function _supprimerGroupeCoursV2_legacy(groupeCoursId) {
    // Redirige vers la nouvelle fonction qui utilise groupeCoursEnEditionId.
    // Post-session-B (17 mai 2026) : `supprimerGroupeCoursV2` extraite vers
    // trimestre-v2-groupes-cours.js, appel via `window.X`.
    if (typeof window.supprimerGroupeCoursV2 === 'function') {
        window.supprimerGroupeCoursV2();
    }
}

/**
 * Met à jour l'aperçu du groupe-cours
 */
async function mettreAJourApercuGroupeCours() {
    const coursId = document.getElementById('v2-gc-cours')?.value;
    const groupe = document.getElementById('v2-gc-groupe')?.value;
    const apercuSpan = document.getElementById('v2-gc-apercu-texte');

    if (!apercuSpan) return;

    if (!coursId || !groupe) {
        apercuSpan.textContent = 'Complétez les champs obligatoires pour voir l\'aperçu';
        apercuSpan.className = 'text-muted';
        return;
    }

    // Récupérer infos cours
    // 🆕 FIX (4 fév 2026) : Chercher dans toutes les sources, ajouter code pour Primo
    let cours = null;
    if (typeof CoursEntite !== 'undefined') {
        cours = await CoursEntite.obtenirParId(coursId);
    }
    if (!cours) {
        const coursCollection = db.getSync('cours', []);
        cours = coursCollection.find(c => c.id === coursId || c.sigle === coursId || c.code === coursId);
    }

    // 🆕 FIX (9 jan 2026) : Libellé lisible même sans cours
    const sigle = cours?.codeCours || cours?.sigle || cours?.code || null;
    const apercu = sigle ? `${sigle} gr.${groupe}` : `Groupe ${groupe}`;

    apercuSpan.textContent = apercu;
    apercuSpan.className = '';
    apercuSpan.style.color = 'var(--accent-primaire)';
    apercuSpan.style.fontWeight = '500';
}

/**
 * Accès rapide au calendrier depuis le bandeau groupe-cours
 * 🆕 BETA 95.2
 */
function accederCalendrierRapide() {
    // Naviguer vers la section Contexte (calendrier)
    if (typeof afficherSection === 'function') {
        afficherSection('calendrier');
    }
    // Puis vers la sous-section Calendrier (avec délai pour laisser le DOM se mettre à jour)
    setTimeout(() => {
        if (typeof afficherSousSection === 'function') {
            afficherSousSection('calendrier-vue');
        }
    }, 100);
}

// Exports des fonctions migrées
window.accederCalendrierRapide = accederCalendrierRapide;
window.peuplerDropdownGroupeCoursActif = peuplerDropdownGroupeCoursActif;
window.changerGroupeCoursDepuisHeader = changerGroupeCoursDepuisHeader;
window.changerGroupeCoursActifV2 = changerGroupeCoursActifV2;
window.peuplerDropdownEnseignants = peuplerDropdownEnseignants;
window.changerEnseignantSelectionneV2 = changerEnseignantSelectionneV2;
window.afficherFormEnseignantV2 = afficherFormEnseignantV2;
window.modifierEnseignantSelectionneV2 = modifierEnseignantSelectionneV2;
window.afficherFormHoraireV2 = afficherFormHoraireV2;
window.modifierHoraireSelectionneV2 = modifierHoraireSelectionneV2;
window.mettreAJourResumeFormatHoraireV2 = mettreAJourResumeFormatHoraireV2;
window.afficherFormGroupeCoursV2 = afficherFormGroupeCoursV2;
window.activerGroupeCoursV2 = activerGroupeCoursV2;
window.mettreAJourApercuGroupeCours = mettreAJourApercuGroupeCours;

/* ===============================
   BARRE DE CONVERGENCE (statut configuration)
   =============================== */

/**
 * Met à jour la barre de convergence en haut de la page Trimestre.
 * Vérifie l'état de chaque composante et affiche complété/incomplet.
 */
function mettreAJourBarreContexte() {
    const barre = document.getElementById('barreConvergence');
    if (!barre || typeof db === 'undefined' || !db.getSync) return;

    const cle = window.cle || (k => k);

    // Vérifier chaque composante
    const etapes = {
        'trimestre': {
            ok: !!db.getSync('trimestreActif', null),
            info: db.getSync('trimestreActif', '') ? 'Actif' : ''
        },
        'cours': {
            ok: (db.getSync('cours', []) || []).length > 0,
            info: (() => { const n = (db.getSync('cours', []) || []).length; return n > 0 ? n + ' cours' : ''; })()
        },
        'enseignant': {
            ok: (db.getSync('enseignants', []) || []).length > 0,
            info: (() => { const e = db.getSync('enseignants', []) || []; return e.length > 0 && e[0].nom ? e[0].prenom + ' ' + e[0].nom : ''; })()
        },
        'etudiants': {
            ok: (db.getSync(cle('groupeEtudiants'), []) || []).length > 0,
            info: (() => { const n = (db.getSync(cle('groupeEtudiants'), []) || []).length; return n > 0 ? n + ' étud.' : ''; })()
        },
        'horaire': {
            ok: (db.getSync(cle('horaires'), []) || []).length > 0,
            info: (() => { const n = (db.getSync(cle('horaires'), []) || []).length; return n > 0 ? n + ' hor.' : ''; })()
        },
        'groupe-cours': {
            ok: (db.getSync(cle('groupesCours'), []) || []).length > 0,
            info: (() => { const n = (db.getSync(cle('groupesCours'), []) || []).length; return n > 0 ? n + ' GC' : ''; })()
        }
    };

    // Appliquer l'état visuel à chaque étape
    const boutons = barre.querySelectorAll('.bc-etape');
    let precedentComplet = true;

    boutons.forEach(btn => {
        const id = btn.dataset.etape;
        const etat = etapes[id];
        if (!etat) return;

        // Toggle classe complété
        btn.classList.toggle('bc-complet', etat.ok);

        // Mettre à jour le compteur
        const infoEl = btn.querySelector('.bc-info');
        if (infoEl) infoEl.textContent = etat.info;

        // Mettre à jour la liaison précédente
        const liaisonPrecedente = btn.previousElementSibling;
        if (liaisonPrecedente && liaisonPrecedente.classList.contains('bc-liaison')) {
            liaisonPrecedente.classList.toggle('bc-liaison-ok', precedentComplet && etat.ok);
        }

        precedentComplet = etat.ok;
    });
}

// Click handler : scroll vers l'accordéon et l'ouvrir
document.addEventListener('click', function(e) {
    const etape = e.target.closest('.bc-etape');
    if (!etape) return;

    const accordeonId = etape.dataset.accordeon;
    if (!accordeonId) return;

    const accordeon = document.getElementById(accordeonId);
    if (!accordeon) return;

    // Ouvrir si fermé
    if (accordeon.classList.contains('ferme')) {
        const header = accordeon.querySelector('.accordeon-header');
        if (header && typeof toggleAccordeonV2 === 'function') {
            toggleAccordeonV2(header);
        }
    }

    // Scroll avec un léger délai pour laisser l'accordéon s'ouvrir
    setTimeout(function() {
        accordeon.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
});

window.mettreAJourBarreContexte = mettreAJourBarreContexte;

/* ===============================
   INITIALISATION AUTOMATIQUE
   =============================== */

// Initialiser quand le DOM est prêt et que db est disponible
document.addEventListener('DOMContentLoaded', function() {
    // ✅ CORRIGÉ (8 janvier 2026) : Attendre window.dbReady (synchronisation IndexedDB → localStorage terminée)
    // Avant, on vérifiait db.getSync qui existe AVANT la fin de la synchronisation
    if (window.dbReady) {
        initialiserTrimestreV2();
        mettreAJourBarreContexte();
    } else {
        // Attendre l'événement db-ready (déclenché après syncToLocalStorageCache)
        window.addEventListener('db-ready', function() {
            initialiserTrimestreV2();
            mettreAJourBarreContexte();
        }, { once: true });
    }
});

})();
