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

/**
 * #366 (relais Cadre→Trimestre, 4 août 2026) : source UNIQUE du comptage des
 * statistiques de calendrier. Fonction PURE, partagée par trimestre-v2 (sidebar
 * + apercu) ET calendrier-vue (carte Légende) — remplace la communication par
 * le DOM (ids `nombreSemaines`/`nombreJoursCours` inexistants) et les
 * constantes de repli 15/75 qui affichaient un chiffre inventé.
 * @param {Object|null} calendrier - calendrierComplet ({date: {statut, numeroSemaine}})
 * @returns {{semaines:number, joursCours:number, conges:number, reprises:number}|null}
 *          null si aucun calendrier exploitable — l'appelant affiche un état
 *          vide explicite, jamais un chiffre par défaut.
 */
function calculerStatistiquesCalendrier(calendrier) {
    if (!calendrier || typeof calendrier !== 'object' || Object.keys(calendrier).length === 0) {
        return null;
    }
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

    // numeroSemaine du calendrier prioritaire ; repli division par 5
    const semaines = maxSemaine > 0 ? maxSemaine : Math.ceil(joursCours / 5);
    return { semaines: semaines, joursCours: joursCours, conges: conges, reprises: reprises };
}

/**
 * #369 (relais Cadre→Trimestre, 4 août 2026) : validation de cohérence des
 * bornes du trimestre. Fonction PURE — retourne une liste de messages
 * d'avertissement (vide = saisie cohérente, rester SILENCIEUX).
 * NON BLOQUANT par décision : un cégep peut avoir des cas légitimes qu'on
 * n'anticipe pas ; on signale, on explique, on laisse passer.
 * Ces champs se remplissent une fois en août et ne se revoient jamais —
 * une erreur de mois invisible se découvre en décembre (cas réel : remise
 * des notes saisie au 29/08 au lieu du 29/12).
 * @param {Object|null} cadre - cadreCalendrier ({dateDebut, finCours, ...})
 * @param {Array} evenements - événements prévus + imprévus fusionnés
 * @returns {string[]} messages (quoi + pourquoi/quoi faire, une phrase)
 */
function validerCadreTrimestre(cadre, evenements) {
    const avertissements = [];
    if (!cadre || typeof cadre !== 'object') return avertissements;
    // Les dates sont des chaînes YYYY-MM-DD : la comparaison lexicale suffit.
    const debut = cadre.dateDebut || cadre.debutTrimestre || '';
    const finCours = cadre.finCours || '';
    const finTrimestre = cadre.finTrimestre || '';

    // 1. Ordre des bornes principales
    if (debut && finCours && debut >= finCours) {
        avertissements.push(`La fin des cours réguliers (${finCours}) devrait suivre le début du trimestre (${debut}).`);
    }
    if (finCours && finTrimestre && finCours > finTrimestre) {
        avertissements.push(`La fin du trimestre (${finTrimestre}) devrait suivre la fin des cours réguliers (${finCours}).`);
    }

    // 2. Remise des notes avant la fin du trimestre (cas réel : erreur de mois)
    if (cadre.remiseNotes && finTrimestre && cadre.remiseNotes < finTrimestre) {
        avertissements.push(`La remise des notes (${cadre.remiseNotes}) précède la fin du trimestre (${finTrimestre}) — vérifie le mois saisi.`);
    }

    // 3-4. Semaines spéciales : borne partielle (ne JAMAIS deviner en silence —
    // une plage à une seule borne n'existe pas pour le calendrier, cf. #367)
    // puis plage hors des bornes du trimestre.
    const plages = [
        { nom: 'semaine de planification', debut: cadre.semainePlanificationDebut, fin: cadre.semainePlanificationFin },
        { nom: 'semaine d\'examens', debut: cadre.semaineExamensDebut, fin: cadre.semaineExamensFin }
    ];
    plages.forEach(p => {
        if (!!p.debut !== !!p.fin) {
            const manquant = p.debut ? 'de fin' : 'de début';
            avertissements.push(`La ${p.nom} n'a pas de date ${manquant} : elle sera ignorée du calendrier tant que les deux bornes ne sont pas saisies.`);
            return;
        }
        if (p.debut && p.fin) {
            if (p.debut > p.fin) {
                avertissements.push(`La ${p.nom} finit (${p.fin}) avant de commencer (${p.debut}).`);
            } else if ((debut && p.debut < debut) || (finTrimestre && p.fin > finTrimestre)) {
                avertissements.push(`La ${p.nom} (${p.debut} au ${p.fin}) déborde des bornes du trimestre.`);
            }
        }
    });

    // 5-6. Reprises : jour non ouvrable (silencieusement absente du calendrier
    // généré — cas réel : reprise saisie un samedi) et reprise avant son congé.
    (Array.isArray(evenements) ? evenements : []).forEach(evt => {
        if (!evt || !evt.dateReprise) return;
        const [a, m, j] = String(evt.dateReprise).split('-').map(Number);
        if (a && m && j) {
            const jourSem = new Date(a, m - 1, j).getDay();
            if (jourSem === 0 || jourSem === 6) {
                avertissements.push(`La reprise du ${evt.dateReprise} (« ${evt.description || 'sans description'} ») tombe une fin de semaine : elle n'apparaîtra pas au calendrier.`);
            }
        }
        if (evt.dateEvenement && evt.dateReprise <= evt.dateEvenement) {
            avertissements.push(`La reprise du ${evt.dateReprise} précède le congé qu'elle remplace (${evt.dateEvenement}).`);
        }
    });

    return avertissements;
}

/**
 * #369 : rend les avertissements de cohérence dans la zone au-dessus du bouton
 * Enregistrer (emplacement prévu lors du retrait de l'info-box, #372).
 * Silencieux quand tout est cohérent : zone masquée, aucun bruit.
 */
function afficherAvertissementsCadreV2() {
    const zone = document.getElementById('v2-avertissementsCadre');
    if (!zone) return;
    const cadre = db.getSync(cle('cadreCalendrier'), null);
    const evenements = db.getSync(cle('journeesSansCours'), []);
    const avertissements = validerCadreTrimestre(cadre, evenements);
    if (avertissements.length === 0) {
        zone.classList.add('u-hide');
        zone.innerHTML = '';
        return;
    }
    zone.innerHTML = '<strong>À vérifier</strong> (rien n\'est bloqué) :<ul class="u-mt-8" style="margin-bottom: 0; padding-left: 20px;">'
        + avertissements.map(msg => '<li>' + echapperHtml(msg) + '</li>').join('')
        + '</ul>';
    zone.classList.remove('u-hide');
}

function afficherStatistiquesTrimestreV2() {
    // #369 : rafraîchir les avertissements au même rythme que les statistiques
    // (après chaque save, chargement de section, ajout/retrait d'événement).
    afficherAvertissementsCadreV2();

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

    // Comptage : source unique #366 (fonction pure partagée)
    const stats = calculerStatistiquesCalendrier(calendrier);
    if (!stats) {
        if (elemSemaines) elemSemaines.textContent = '0';
        if (elemJours) elemJours.textContent = '0';
        if (elemCongesReprises) elemCongesReprises.textContent = '';
        if (elemSemainesSidebar) elemSemainesSidebar.textContent = '0';
        if (elemJoursSidebar) elemJoursSidebar.textContent = '0';
        if (elemCongesReprisesSidebar) elemCongesReprisesSidebar.textContent = '';
        return;
    }
    const semaines = stats.semaines;
    const joursCours = stats.joursCours;
    const conges = stats.conges;
    const reprises = stats.reprises;

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
        const toutesPratiques = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);
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

// Export pour le HTML

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
window.calculerStatistiquesCalendrier = calculerStatistiquesCalendrier;
window.validerCadreTrimestre = validerCadreTrimestre;
window.afficherAvertissementsCadreV2 = afficherAvertissementsCadreV2;
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
