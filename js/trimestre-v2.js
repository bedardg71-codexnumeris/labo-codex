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
   (les fonctions originales sont dans evaluation.js,
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

    // 5-6. Reprises : jour de fin de semaine (#399/L8 : désormais HONORÉE comme
    // jour de cours — l'avertissement reste, en transparence, pour confirmer que
    // c'est voulu) et reprise avant son congé.
    (Array.isArray(evenements) ? evenements : []).forEach(evt => {
        if (!evt || !evt.dateReprise) return;
        const [a, m, j] = String(evt.dateReprise).split('-').map(Number);
        if (a && m && j) {
            const jourSem = new Date(a, m - 1, j).getDay();
            if (jourSem === 0 || jourSem === 6) {
                avertissements.push(`La reprise du ${evt.dateReprise} (« ${evt.description || 'sans description'} ») tombe une fin de semaine : elle sera comptée comme un jour de cours — vérifie que c'est voulu.`);
            }
        }
        if (evt.dateEvenement && evt.dateReprise <= evt.dateEvenement) {
            avertissements.push(`La reprise du ${evt.dateReprise} précède le congé qu'elle remplace (${evt.dateEvenement}).`);
        }
    });

    // 7. #393 (audit 5 août) : deux journées sans cours à la même date —
    // presque toujours une double saisie ; la seconde écrase la première dans
    // les maps du générateur de calendrier, en silence.
    const datesVues = new Set();
    (Array.isArray(evenements) ? evenements : []).forEach(evt => {
        if (!evt || !evt.dateEvenement) return;
        if (datesVues.has(evt.dateEvenement)) {
            avertissements.push(`Deux journées sans cours portent la même date (${evt.dateEvenement}) — vérifie s'il s'agit d'une double saisie.`);
        }
        datesVues.add(evt.dateEvenement);
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
 * Peuple le menu « numéro de groupe » (étape 3) du formulaire d'assemblage.
 * #872 (15 sept. 2026) : extrait du hub ci-dessous pour que la liste d'élèves le rappelle — un
 * import ou un ajout n'arrivait jamais à l'étape 3 (« 00007 (28 étud.) » seul après un import).
 * Garde la sélection en cours : un groupe-cours en édition ne perd pas son groupe.
 */
function populerDropdownGroupesAssemblageV2() {
    const selectGroupe = document.getElementById('v2-gc-groupe');
    if (!selectGroupe) return;
    const valeurActuelle = selectGroupe.value;
    const cleEtud = cle('groupeEtudiants');
    const etudiants = db.getSync(cleEtud, []);

    // Extraire les groupes uniques
    const groupesSet = new Set();
    etudiants.forEach(e => {
        if (e.groupe) {
            groupesSet.add(String(e.groupe).padStart(5, '0'));
        }
    });

    // #925 (lot 6, 11 oct. 2026) : le COMPTE suit le cours du champ 2. Deux cours peuvent avoir chacun
    // leur « 00001 » : sans ce filtre, « 00001 (N étud.) » additionnait les deux. Une fiche sans coursId
    // (stock d'avant #887) compte partout, comme `obtenirEtudiantsCoursActif` l'accepte. La LISTE des
    // numéros, elle, reste entière : un groupe-cours enregistré ne perd jamais le sien à l'édition.
    const coursChoisi = document.getElementById('v2-gc-cours')?.value || '';
    const duCours = e => !coursChoisi || !e.coursId || e.coursId === coursChoisi;

    const groupesTries = Array.from(groupesSet).sort();
    let html = '<option value="">— Choisir un groupe —</option>';
    groupesTries.forEach(grp => {
        const nbEtudiants = etudiants.filter(e => duCours(e) && String(e.groupe).padStart(5, '0') === grp).length;
        // CT-09 : grp vient du collage CSV des étudiants.
        html += `<option value="${echapperAttribut(grp)}">${echapperHtml(grp)} (${nbEtudiants} étud.)</option>`;
    });
    selectGroupe.innerHTML = html;
    if (valeurActuelle && groupesSet.has(valeurActuelle)) selectGroupe.value = valeurActuelle;
}

/**
 * Peuple les dropdowns du formulaire d'assemblage (5 éléments Beta 95.2)
 */
function populerDropdownsAssemblageV2() {

    // Beta 95.2: Dropdown Trimestres
    const selectTrimestre = document.getElementById('v2-gc-trimestre');
    if (selectTrimestre) {
        // #477 (CT-19) : la liste du menu, sans doublon d'id (dédoublonnée à la lecture, jamais réécrite).
        const trimestres = typeof window.obtenirTrimestres === 'function' ? window.obtenirTrimestres() : db.getSync('trimestres', []);
        const trimestreActif = db.getSync('trimestreActif', '');

        let html = '<option value="">— Choisir un trimestre —</option>';
        trimestres.forEach(t => {
            const nom = t.nom || t.id || 'Sans nom';
            const selected = (t.id === trimestreActif) ? ' selected' : '';
            html += `<option value="${echapperHtml(t.id)}"${selected}>${echapperHtml(nom)}</option>`;
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
        // #846 (12 sept. 2026) : le champ 2 ne suit PAS le contexte actif — il nomme ce qu'on choisit,
        // et ce menu offre toujours les deux natures. Un seul mot, sur un cours comme sur un service.
        let html = '<option value="">— Choisir un cours ou un service —</option>';
        coursReels.forEach(c => {
            html += `<option value="${echapperHtml(c.id)}">${echapperHtml(labelCours(c))}</option>`;
        });
        selectCours.innerHTML = html;

        if (!enDemoLegacy && typeof cleDemo === 'function' && typeof BibliothequeUI !== 'undefined') {
            const coursDemo = db.getSync(cleDemo('listeCours'), []) || [];
            BibliothequeUI.ajouterOptgroupDemo(selectCours, coursDemo, labelCours);
        }
    }

    // Dropdown Groupes d'étudiants
    populerDropdownGroupesAssemblageV2();

    // Beta 95.2: Dropdown Horaires
    const selectHoraire = document.getElementById('v2-gc-horaire');
    if (selectHoraire) {
        const cleHoraires = cle('horaires');
        const horaires = db.getSync(cleHoraires, []);
        const horairesReels = enDemoLegacy ? horaires : horaires.filter(h => !h.isDemo);

        let html = '<option value="">— Choisir un horaire —</option>';
        horairesReels.forEach(h => {
            const nom = h.nom || h.id || 'Sans nom';
            html += `<option value="${echapperHtml(h.id)}">${echapperHtml(nom)}</option>`;
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
        // #841 (12 sept. 2026) : l'option vide nomme la personne du contexte actif (point unique js/mots-nature.js).
        let html = '<option value="">' + motsNatureContexteActif().choisirPersonneGC + '</option>';
        enseignantsReels.forEach(e => {
            html += `<option value="${echapperHtml(e.id)}">${echapperHtml(labelEns(e))}</option>`;
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
        const toutesPratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
        // Filtrer pour n'afficher que les pratiques dans la sidebar
        const pratiques = enDemoLegacy
            ? toutesPratiques.filter(p => p.dansBibliotheque !== false)
            : toutesPratiques.filter(p => p.dansBibliotheque !== false && !p.isDemo);

        let html = '<option value="">— À compléter quand configurée —</option>';
        pratiques.forEach(p => {
            const nom = p.nom || p.id || 'Sans nom';
            html += `<option value="${echapperHtml(p.id)}">${echapperHtml(nom)}</option>`;
        });
        selectPratique.innerHTML = html;

        if (!enDemoLegacy && typeof cleDemo === 'function' && typeof BibliothequeUI !== 'undefined') {
            const pratiquesDemo = db.getSync(cleDemo('pratiquesConfigurables'), []) || [];
            BibliothequeUI.ajouterOptgroupDemo(selectPratique, pratiquesDemo, p => p.nom || p.id || 'Sans nom');
        }
    }

    // Retour testeur du 18 sept. 2026 : ce hub est rejoué après chaque
    // enregistrement de cours, d'enseignant·e ou d'horaire — la barre suit.
    mettreAJourBarreContexte();
}
// Hub résiduel consommé par les sous-modules extraits (session A — 17 mai 2026).
window.populerDropdownsAssemblageV2 = populerDropdownsAssemblageV2;
window.populerDropdownGroupesAssemblageV2 = populerDropdownGroupesAssemblageV2; // #872

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
 * #1149, lot 3a (24 oct. 2026) : le dessin et le clic passent par le composant commun
 * (js/chaine-etapes.js) ; `#barreConvergence` n'est plus que son conteneur. Le clic était
 * écouté sur tout le document (`.bc-etape`) : il aurait attrapé ceux de la chaîne des grilles.
 */
function mettreAJourBarreContexte() {
    const barre = document.getElementById('barreConvergence');
    if (!barre || typeof db === 'undefined' || !db.getSync || typeof ChaineEtapes === 'undefined') return;

    // #642 (12 oct. 2026) : plus d'alias local `cle` (il masquait le helper) ; `window.cle`
    // est posé par trimestres.js, chargé avant.
    // Les mots du contexte (cours ou service) : ceux que `appliquerMotsNatureCadre` pose aussi.
    const mots = typeof motsNatureContexteActif === 'function' ? motsNatureContexteActif() : {};
    const nb = (cleLue) => (db.getSync(cleLue, []) || []).length;
    const etape = (id, libelle, n, suffixe) => ({ id, libelle, reglee: n > 0, info: n > 0 ? n + suffixe : '' });
    const enseignants = db.getSync('enseignants', []) || [];
    const premier = enseignants[0];
    const etapes = [
        { id: 'trimestre', libelle: 'Trimestre', reglee: !!db.getSync('trimestreActif', null),
          info: db.getSync('trimestreActif', '') ? 'Actif' : '' },
        Object.assign(etape('cours', mots.Objet || 'Cours', nb('cours'), ' cours'), { motNature: 'Objet' }),
        { id: 'enseignant', libelle: mots.Personne || 'Enseignant·e', motNature: 'Personne', reglee: !!premier,
          info: premier && premier.nom ? premier.prenom + ' ' + premier.nom : '' },
        etape('etudiants', 'Étudiant·es', nb(cle('groupeEtudiants')), ' étud.'),
        etape('horaire', 'Horaire', nb(cle('horaires')), ' hor.'),
        Object.assign(etape('groupe-cours', 'Groupe-cours', nb(cle('groupesCours')), ' GC'), { arrivee: true })
    ];

    ChaineEtapes.dessiner(barre, etapes, { surClic: ouvrirAccordeonDeLEtape, prefixeIdInfo: 'bc-info-' });
}

/** L'accordéon que chaque étape de la barre ouvre. */
const ACCORDEON_DE_L_ETAPE = {
    'trimestre': 'accordeon-gestion-trimestres',
    'cours': 'accordeon-cours',
    'enseignant': 'accordeon-enseignant',
    'etudiants': 'accordeon-groupe-etudiants',
    'horaire': 'accordeon-horaire',
    'groupe-cours': 'accordeon-groupe-cours'
};

// Clic sur une étape : scroll vers l'accordéon et l'ouvrir
function ouvrirAccordeonDeLEtape(idEtape) {
    const accordeon = document.getElementById(ACCORDEON_DE_L_ETAPE[idEtape]);
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
}

window.mettreAJourBarreContexte = mettreAJourBarreContexte;

/* ===============================
   INITIALISATION AUTOMATIQUE
   =============================== */

// Initialiser quand le DOM est prêt et que db est disponible
document.addEventListener('DOMContentLoaded', function() {
    // ✅ CORRIGÉ (8 janvier 2026) : Attendre window.dbReady (synchronisation IndexedDB → localStorage terminée)
    // Avant, on vérifiait db.getSync qui existe AVANT la fin de la synchronisation
    //
    // #414 (8 août 2026) : ce site était DÉJÀ correct — il est passé au
    // portillon commun sans changer de sémantique. C'est le but du cliquet :
    // une seule façon d'attendre la DB, donc plus aucune variante manuelle où
    // se cacher (l'audit de #414 a trouvé trois familles de défauts parce qu'il
    // y avait neuf écritures différentes du même geste).
    window.auDbPret(function() {
        initialiserTrimestreV2();
        mettreAJourBarreContexte();
    });
});

})();
