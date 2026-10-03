/* ===============================
   MODULE: TRIMESTRE V2 — HORAIRES
   Refactor étape 3 session A (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 3252-4073 (zone 5 MODULES-MAP §2.4).

   Périmètre : CRUD séances + horaires + format horaire (20 fonctions,
   2 variables module-scope `seanceEnEditionV2` et `horaireEnEditionId`).

   Dépendances cross-module accédées via `window.X` :
   - `window.populerDropdownsAssemblageV2` (hub résiduel)
   - `window.afficherStatistiquesTrimestreV2` (helper transversal résiduel)
   =============================== */

(function() {
'use strict';

/* ===============================
   ACCORDÉON HORAIRE
   =============================== */

/**
 * Duree de periode du trimestre courant, en minutes.
 *
 * ⚠ Les quatre conversions heures <-> periodes de ce fichier divisaient par un
 * `55` ECRIT EN DUR : le reglage « Duree d'une periode » ne les atteignait pas.
 * Regler 50 minutes ne changeait donc rien a l'affichage des seances ni au
 * total « per./semaine ». Corrige le 22 aout 2026 avec le passage du defaut a
 * 50 (demande de Gregoire) : ces calculs lisent desormais la valeur configuree.
 */
function dureePeriodeCourante() {
    return (typeof obtenirDureePeriode === 'function'
        ? obtenirDureePeriode()
        : (window.DUREE_PERIODE_DEFAUT || 50));
}

/**
 * Périodes d'UNE séance : on les LIT, on ne les mesure plus.
 *
 * #540 lot E2 (26 août 2026) : cette fonction dérivait les périodes des heures, avec la
 * même mesure que le calcul d'assiduité — ce qui fermait la divergence entre l'écran et
 * le calcul (lot C), mais laissait les deux également faux. Une période comprend sa
 * pause : la division ignorait 10 minutes par période, donc `08:00 → 11:00` rendait 4
 * là où la réponse est 3. Depuis E1, la séance PORTE son nombre de périodes ; il ne
 * reste qu'à le lire.
 *
 * #540 lot C (26 août 2026). Trois endroits de ce fichier mesuraient une séance à leur
 * façon, et tous trois se repliaient sur `2` quand ni `nombrePeriodes` ni `duree`
 * n'étaient présents. Or c'est le CAS COURANT : `sauvegarderHoraireV2` écrit ses séances
 * avec `{jour, heureDebut, heureFin, local}` — sans `duree`, sans `nombrePeriodes`. Les
 * horaires créés par le formulaire tombaient donc dans ce repli à CHAQUE affichage,
 * pendant que `calculerAssiduite` comptait, lui, les heures réelles (#538). L'écran
 * affichait une durée que le calcul ne reconnaissait pas.
 *
 * `mesurerDureeSeance` (saisie-presences.js) sait lire `duree`, `debut/fin` ET
 * `heureDebut/heureFin`. On l'emploie plutôt que d'en refaire une quatrième.
 *
 * @returns {number} périodes, ou 0 si la séance ne dit rien — jamais un nombre inventé.
 */
function periodesDeLaSeance(seance) {
    if (!seance) return 0;
    const p = parseInt(seance.nombrePeriodes, 10);
    return p > 0 ? p : 0;
}

/** Total hebdomadaire d'un horaire, lu à ses séances. 0 si elles ne disent rien. */
function periodesParSemaine(seances) {
    if (!Array.isArray(seances)) return 0;
    return seances.reduce((total, s) => total + periodesDeLaSeance(s), 0);
}

/**
 * Charge et affiche les séances dans l'accordéon Horaire v2
 * 🆕 BETA 95 : Affiche le cours actif et utilise obtenirSeancesHoraire()
 */
function chargerSeancesV2() {
    const conteneur = document.getElementById('v2-seancesContainer');
    if (!conteneur) return;

    // 🆕 BETA 95 : Utiliser obtenirSeancesHoraire() qui gère tous les fallbacks
    let horaire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire()
        : db.getSync(cle('horaireHebdo'), []);

    // 🆕 BETA 95 : Obtenir les infos du cours actif pour affichage
    let coursActifInfo = '';
    if (typeof obtenirCoursActifId === 'function') {
        const coursId = obtenirCoursActifId();
        if (coursId) {
            const infoCours = db.getSync('infoCours', null);
            if (infoCours) {
                // 🆕 FIX (4 fév 2026) : Priorité codeCours
                // CT-09 : infoCours vient d'un import (ZIP, collage CSV,
                // restauration Codex) et atterrit en innerHTML plus bas.
                const sigle = echapperHtml(infoCours.codeCours || infoCours.sigle || infoCours.code || '');
                const groupe = echapperHtml(infoCours.groupe || '');
                coursActifInfo = groupe ? `${sigle} (${groupe})` : sigle;
            }
        }
    }

    if (horaire.length === 0) {
        let messageVide = '<p class="text-muted text-italic">Aucune séance configurée. Clique sur « + Ajouter une séance » pour commencer.</p>';
        if (coursActifInfo) {
            messageVide = `<div class="alerte alerte-info" style="margin-bottom: 10px;">
                <strong>Cours actif :</strong> ${coursActifInfo}
            </div>` + messageVide;
        }
        conteneur.innerHTML = messageVide;
        return;
    }

    const joursNoms = { 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5 };
    const joursInverse = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

    // 🆕 BETA 95 : Afficher le cours actif en haut
    let html = '';
    if (coursActifInfo) {
        html += `<div class="alerte alerte-info" style="margin-bottom: 10px;">
            <strong>Horaire pour :</strong> ${coursActifInfo}
        </div>`;
    }

    // #540 lot C : total LU aux séances (le repli « + 2 » se déclenchait pour tout
    // horaire créé par le formulaire, qui n'écrit ni `duree` ni `nombrePeriodes`).
    const totalPeriodes = periodesParSemaine(horaire);

    html += `
        <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span class="text-muted"><strong>${horaire.length}</strong> séance(s) • <strong>${totalPeriodes}</strong> pér./semaine</span>
        </div>
        <div style="display: grid; gap: 8px;">
    `;

    horaire.forEach((s, index) => {
        const jourNom = s.jour || joursInverse[s.jourNum] || '?';
        const heureDebut = s.heureDebut || s.debut || '?';
        // #540 lot C : dérivées des heures de la séance, jamais supposées.
        const periodes = periodesDeLaSeance(s);
        const local = s.local || '';

        html += `
            <div class="item-carte-compact" style="display: flex; align-items: center; padding: 10px 15px; background: var(--bleu-tres-pale); border-radius: 6px;">
                <span style="width: 90px; font-weight: 600; color: var(--accent-primaire);">${echapperHtml(jourNom)}</span>
                <span style="flex: 1;">${echapperHtml(heureDebut)} (${periodes} pér.)</span>
                <span class="text-muted" style="width: 80px;">${echapperHtml(local)}</span>
                <div style="display: flex; gap: 5px;">
                    <button class="btn btn-modifier btn-sm" data-action="modifierSeanceV2" data-param="${index}" title="Modifier">Modifier</button>
                    <button class="btn btn-annuler btn-sm" data-action="supprimerSeanceV2" data-param="${index}" title="Supprimer">Suppr.</button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    conteneur.innerHTML = html;
    majResumeFormatHoraireV2();
}

/**
 * Résumé du format, LU aux lignes de séance réellement saisies.
 *
 * #540 lot C : il affichait `nbSeances × periodesParSeance`, le produit de deux
 * déclarations — donc « 2 séances × 3 périodes = 6 périodes/semaine » même quand les
 * six lignes disaient autre chose. Il lit désormais les heures, comme la carte résumé
 * et comme le calcul d'assiduité. Recâblé sur chaque champ d'heure (`data-on-change`)
 * pour suivre la saisie.
 */
/**
 * Périodes par semaine DÉCLARÉES par le devis du cours, pour un horaire donné.
 *
 * #540 lot D (26 août 2026) — LA DEMANDE D'ORIGINE DE GRÉGOIRE : « il faudrait que le
 * formulaire du cours demande la durée et que le tout soit confirmé par l'horaire ».
 *
 * ⮕ POURQUOI AUCUNE CONVERSION N'EST NÉCESSAIRE, ce qui n'allait pas de soi. La
 * pondération « 2-2-3 » compte des heures au sens du réseau collégial — et une « heure
 * de cours », au cégep, EST une période : 50 minutes d'enseignement plus 10 de pause,
 * soit environ 60 minutes à l'horaire. `(théorie + labo)` donne donc directement un
 * nombre de PÉRIODES par semaine, comparable tel quel au total de l'horaire. C'est le
 * seul endroit du chantier où les deux grandeurs se rencontrent sans qu'on ait à
 * traduire — et c'est ce qui rend ce recoupement possible après le lot E.
 *
 * Littérature 2-2-3 → 4 périodes ; philosophie 3-1-3 → 4 ; chimie 3-2-3 → 5.
 *
 * @param {Object} horaire - l'entité horaire (porte `groupeAssocie`)
 * @returns {{periodes:number, cours:Object}|null} null si la chaîne ne mène à aucun cours
 *          ou à aucune pondération lisible — on ne recoupe alors rien, et on se tait.
 */
function periodesDeclareesParLeCours(horaire) {
    if (!horaire || !horaire.groupeAssocie) return null;
    try {
        const groupesCours = db.getSync(cle('groupesCours'), []) || [];
        if (!Array.isArray(groupesCours)) return null;

        // `groupeAssocie` porte le numéro de groupe (« 00001 »), pas un id de GC.
        const gc = groupesCours.find(g => g && (
            g.groupe === horaire.groupeAssocie ||
            g.horaireId === horaire.id
        ));
        if (!gc || !gc.coursId) return null;

        const tousCours = db.getSync('cours', []) || [];
        const cours = tousCours.find(c => c && c.id === gc.coursId);
        if (!cours || !cours.ponderation) return null;

        // Le parseur du formulaire Cours reste le juge du format (#540 lot A).
        const pond = typeof window._parserPonderation === 'function'
            ? window._parserPonderation(cours.ponderation)
            : null;
        if (!pond) return null;

        return { periodes: pond.theorie + pond.labo, cours: cours };
    } catch (e) {
        return null;
    }
}

/**
 * Confronte le total de l'horaire à ce que le devis du cours déclare, et le DIT.
 *
 * #540 lot D. **Jamais bloquant** : un écart peut être légitime (cours intensif, semaine
 * de reprise, horaire en cours de saisie), et c'est l'enseignant qui sait. On informe,
 * on n'interdit pas — même règle que la jauge de planification.
 *
 * On se TAIT quand on ne sait pas : pas de cours associé, pas de pondération lisible, ou
 * horaire encore incomplet. Un signal qui parle sans savoir devient un signal qu'on
 * n'écoute plus.
 */
function majRecoupementHoraireV2(horaire) {
    const zone = document.getElementById('v2-hor-recoupement');
    if (!zone) return;

    const declare = periodesDeclareesParLeCours(horaire);
    if (!declare) { zone.textContent = ''; zone.className = 'texte-aide u-texte-075'; return; }

    const seances = (horaire && horaire.seances) || [];
    const incompletes = seances.filter(s => !(parseInt(s && s.nombrePeriodes, 10) > 0)).length;
    if (seances.length === 0 || incompletes > 0) {
        // L'horaire n'est pas en état d'être confronté : le dire, sans verdict.
        zone.textContent = '';
        zone.className = 'texte-aide u-texte-075';
        return;
    }

    const total = periodesParSemaine(seances);
    const code = declare.cours.codeCours || declare.cours.code || 'le cours';
    const pond = declare.cours.ponderation;

    if (total === declare.periodes) {
        zone.textContent = `Concorde avec le devis de ${code} (${pond}) : ${declare.periodes} périodes par semaine.`;
        zone.className = 'texte-aide u-texte-075 recoupement-concorde';
    } else {
        const ecart = total - declare.periodes;
        const sens = ecart > 0 ? 'de plus' : 'de moins';
        zone.textContent = `Écart avec le devis de ${code} (${pond}) : l'horaire compte `
            + `${total} période${total > 1 ? 's' : ''} par semaine, le devis en déclare `
            + `${declare.periodes}. Soit ${Math.abs(ecart)} ${sens}.`;
        zone.className = 'texte-aide u-texte-075 recoupement-ecart';
    }
}

function majResumeFormatHoraireV2() {
    const resumeElem = document.getElementById('v2-hor-formatResume');
    if (!resumeElem) return;

    // #540 lot E1 : le total additionne les périodes SAISIES. Il les mesurait aux heures
    // (lot C), ce qui valait mieux que le produit de deux déclarations, mais reposait sur
    // une conversion qui ignorait la pause.
    let total = 0;
    let nb = 0;
    let incompletes = 0;
    const seancesSaisies = [];
    for (let i = 0; document.getElementById(`v2-hor-seance-${i}-jour`); i++) {
        nb++;
        const brut = document.getElementById(`v2-hor-seance-${i}-periodes`)?.value;
        const p = parseInt(brut, 10);
        seancesSaisies.push({ nombrePeriodes: p > 0 ? p : undefined });
        if (p > 0) total += p; else incompletes++;
    }

    // #540 lot D : le recoupement suit la saisie, sur l'horaire en cours d'édition.
    if (horaireEnEditionId) {
        const horaires = db.getSync(cle('horaires'), []) || [];
        const enEdition = horaires.find(h => h && h.id === horaireEnEditionId);
        if (enEdition) {
            // On confronte ce qui est À L'ÉCRAN, pas ce qui est enregistré.
            majRecoupementHoraireV2({ ...enEdition, seances: seancesSaisies });
        }
    }

    const sSeance = nb > 1 ? 's' : '';
    if (incompletes > 0) {
        // On DIT ce qui manque plutôt que d'annoncer un total qui ne compte pas tout.
        resumeElem.textContent = `${nb} séance${sSeance} · ${incompletes} sans nombre de périodes`;
    } else {
        resumeElem.textContent = `${nb} séance${sSeance} · ${total} période${total > 1 ? 's' : ''}/semaine`;
    }
}

// Variable pour stocker l'index de la séance en édition
let seanceEnEditionV2 = null;

/**
 * Affiche le formulaire pour ajouter une nouvelle séance
 */
function afficherFormSeanceV2() {
    seanceEnEditionV2 = null;

    const formulaire = document.getElementById('v2-formAjoutSeance');
    const titre = document.getElementById('v2-titreFormSeance');
    const btnTexte = document.getElementById('v2-btnConfirmerSeance');

    if (formulaire) {
        formulaire.classList.remove('u-hide');
        if (titre) titre.textContent = 'Nouvelle séance';
        if (btnTexte) btnTexte.textContent = 'Ajouter';

        // Réinitialiser les champs
        setValue('v2-jourSeance', '');
        setValue('v2-debutSeance', '');
        setValue('v2-periodesSeance', '2');
        setValue('v2-localSeance', '');

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Modifie une séance existante
 * 🆕 BETA 95 : Utilise obtenirSeancesHoraire() pour support multi-cours
 */
function modifierSeanceV2(index) {
    const horaire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire()
        : db.getSync(cle('horaireHebdo'), []);
    const seance = horaire[index];

    if (!seance) {
        alert('Séance non trouvée.');
        return;
    }

    seanceEnEditionV2 = index;

    const formulaire = document.getElementById('v2-formAjoutSeance');
    const titre = document.getElementById('v2-titreFormSeance');
    const btnTexte = document.getElementById('v2-btnConfirmerSeance');

    if (formulaire) {
        formulaire.classList.remove('u-hide');
        if (titre) titre.textContent = 'Modifier la séance';
        if (btnTexte) btnTexte.textContent = 'Enregistrer';

        // Remplir les champs
        setValue('v2-jourSeance', seance.jour || '');
        setValue('v2-debutSeance', seance.heureDebut || seance.debut || '');
        // #540 lot C : dérivé des heures de la séance. `periodesDeLaSeance` sait lire
        // `nombrePeriodes`, `duree` ET `heureDebut/heureFin` — ce dernier cas étant celui
        // des séances créées par le formulaire, qui tombaient sur l'ancien repli à 2.
        const periodesValue = periodesDeLaSeance(seance);
        if (periodesValue > 0) setValue('v2-periodesSeance', String(periodesValue));
        setValue('v2-localSeance', seance.local || '');

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Annule le formulaire de séance
 */
function annulerFormSeanceV2() {
    seanceEnEditionV2 = null;
    const formulaire = document.getElementById('v2-formAjoutSeance');
    if (formulaire) formulaire.classList.add('u-hide');
}

/**
 * Confirme l'ajout ou la modification d'une séance
 * 🆕 BETA 95.1 : Utilise les périodes au lieu des heures
 */
function confirmerSeanceV2() {
    const jour = document.getElementById('v2-jourSeance')?.value;
    const debut = document.getElementById('v2-debutSeance')?.value;
    const periodes = document.getElementById('v2-periodesSeance')?.value;
    const local = document.getElementById('v2-localSeance')?.value?.trim() || '';

    // Validation
    if (!jour) {
        alert('Veuillez sélectionner un jour.');
        return;
    }
    if (!debut) {
        alert('Veuillez sélectionner une heure de début.');
        return;
    }
    if (!periodes) {
        alert('Veuillez sélectionner le nombre de périodes.');
        return;
    }

    // 🆕 BETA 95.1 : Convertir périodes en heures pour rétrocompatibilité
    const nombrePeriodes = parseInt(periodes);
    const dureeHeures = typeof periodesVersHeures === 'function'
        ? periodesVersHeures(nombrePeriodes)
        : (nombrePeriodes * dureePeriodeCourante()) / 60; // Repli : duree configuree

    // Calculer l'heure de fin
    const [heures, minutes] = debut.split(':').map(Number);
    const finHeures = heures + Math.floor(dureeHeures);
    const finMinutes = minutes + (dureeHeures % 1) * 60;
    const heureFin = `${String(finHeures + Math.floor(finMinutes / 60)).padStart(2, '0')}:${String(Math.round(finMinutes % 60)).padStart(2, '0')}`;

    const seance = {
        jour: jour,
        heureDebut: debut,
        heureFin: heureFin,
        nombrePeriodes: nombrePeriodes,  // 🆕 BETA 95.1
        duree: dureeHeures,              // Rétrocompatibilité
        local: local
    };

    // 🆕 BETA 95 : Lire l'horaire actuel avec obtenirSeancesHoraire()
    let horaire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire().slice() // Copie pour modification
        : db.getSync(cle('horaireHebdo'), []);

    if (seanceEnEditionV2 !== null) {
        // Modification
        horaire[seanceEnEditionV2] = seance;
    } else {
        // Ajout
        horaire.push(seance);
    }

    // Trier par jour puis par heure
    const ordreJours = { 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5 };
    horaire.sort((a, b) => {
        const jourA = ordreJours[a.jour] || 99;
        const jourB = ordreJours[b.jour] || 99;
        if (jourA !== jourB) return jourA - jourB;
        return (a.heureDebut || '').localeCompare(b.heureDebut || '');
    });

    // 🆕 BETA 95 : Sauvegarder dans la clé spécifique au cours
    const cleSauvegarde = typeof cleHoraire === 'function' ? cleHoraire() : cle('horaireHebdo');
    db.setSync(cleSauvegarde, horaire);

    // Notifier
    notifications.succes(seanceEnEditionV2 !== null ? 'Séance modifiée' : 'Séance ajoutée');

    // Fermer le formulaire et recharger
    annulerFormSeanceV2();
    chargerSeancesV2();

    // Régénérer les séances complètes si la fonction existe
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
    }

}

/**
 * Supprime une séance
 */
function supprimerSeanceV2(index) {
    if (!confirm('Supprimer cette séance ?')) return;

    // 🆕 BETA 95 : Utiliser les fonctions multi-cours
    let horaire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire().slice() // Copie pour modification
        : db.getSync(cle('horaireHebdo'), []);
    horaire.splice(index, 1);
    const cleSauvegarde = typeof cleHoraire === 'function' ? cleHoraire() : cle('horaireHebdo');
    db.setSync(cleSauvegarde, horaire);
    if (window.signalerEcritureUsager) window.signalerEcritureUsager(cleSauvegarde);   // lot F : geste hors témoin (supprimer une séance)

    notifications.succes('Séance supprimée');

    chargerSeancesV2();

    // Régénérer les séances complètes si la fonction existe
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
    }

}

/**
 * Charge l'horaire du groupe actif (compat avec ancien code)
 */
function chargerHoraireGroupeActifV2(numeroGroupe) {
    chargerSeancesV2();
}

/* ===============================
   GESTION DES HORAIRES (Beta 95.2)
   =============================== */

// Variable pour tracker l'horaire en édition
let horaireEnEditionId = null;

/**
 * Charge et affiche les horaires dans le dropdown
 * Beta 95.2 : Restaure le dernier horaire sélectionné
 */
function chargerHorairesV2() {
    populerDropdownHorairesV2();

    // Modèle « horaire propre au trimestre » (décision 29 mai 2026) : on ne lit QUE la
    // sélection namespacée du trimestre actif — plus de fallback non-namespacé qui pouvait
    // ramener un horaire d'un autre trimestre. Si aucun horaire valide pour ce trimestre,
    // on réinitialise FRANCHEMENT l'éditeur (état vide) au lieu de laisser un formulaire
    // périmé — sinon une sauvegarde ultérieure viserait le mauvais namespace (no-op
    // silencieux + perte de la modif).
    const horaireIdSauvegarde = db.getSync(cle('horaireSelectionne'), null);
    const horaires = db.getSync(cle('horaires'), []);
    const horaire = horaireIdSauvegarde ? horaires.find(h => h.id === horaireIdSauvegarde) : null;

    if (horaire) {
        const select = document.getElementById('v2-selectHoraire');
        if (select) select.value = horaire.id;
        mettreAJourCarteResumeHoraireV2(horaire);
        editerHoraireV2(horaire);
    } else {
        // Aucun horaire pour ce trimestre (ou sélection orpheline d'un autre trimestre) :
        // nettoyer la sélection et réinitialiser l'éditeur (afficherEtatVideHoraireV2 remet
        // horaireEnEditionId à null). On n'éditera jamais un horaire hors trimestre actif.
        if (horaireIdSauvegarde) db.setSync(cle('horaireSelectionne'), null);
        mettreAJourCarteResumeHoraireV2(null);
        afficherEtatVideHoraireV2();
    }
}

/**
 * Peuple le dropdown des horaires
 */
function populerDropdownHorairesV2() {
    const select = document.getElementById('v2-selectHoraire');
    if (!select) return;

    const cleHoraires = cle('horaires');
    const horaires = db.getSync(cleHoraires, []);
    const valeurActuelle = select.value;

    // En mode démo legacy, pas de séparation (comportement préservé).
    const enDemoLegacy = typeof estEnModeDemo === 'function' && estEnModeDemo();
    const reels = enDemoLegacy ? horaires : horaires.filter(h => !h.isDemo);

    let html = '<option value="">Sélectionner...</option>';
    reels.forEach(h => {
        // CT-09 : l'id était échappé, pas le nom — asymétrie sur la même ligne.
        html += `<option value="${echapperAttribut(h.id)}">${echapperHtml(h.nom || 'Sans nom')}</option>`;
    });
    select.innerHTML = html;

    // Section Démo (Plan 1 Phase 2.4) : seulement en mode normal
    if (!enDemoLegacy && typeof cleDemo === 'function' && typeof BibliothequeUI !== 'undefined') {
        const horairesDemo = db.getSync(cleDemo('horaires'), []) || [];
        BibliothequeUI.ajouterOptgroupDemo(select, horairesDemo, h => h.nom || 'Sans nom');
    }

    // Restaurer la sélection
    if (valeurActuelle) {
        select.value = valeurActuelle;
    }
}

/**
 * Appelé quand on change l'horaire sélectionné dans le dropdown
 */
function changerHoraireSelectionneV2(horaireId) {
    if (typeof horaireId === 'object' && horaireId && horaireId.value !== undefined) horaireId = horaireId.value;
    if (!horaireId) {
        // Aucun horaire sélectionné - afficher état vide
        db.setSync(cle('horaireSelectionne'), null);
        mettreAJourCarteResumeHoraireV2(null);
        afficherEtatVideHoraireV2();
        return;
    }

    const cleHoraires = cle('horaires');
    const horaires = db.getSync(cleHoraires, []);
    const horaire = horaires.find(h => h.id === horaireId);

    // 🔧 #466/CT-17 (21 août 2026) : id non résolvable = refus DIT (patron commun
    // aux 3 accordéons — le formulaire précédent restait affiché en silence).
    if (!horaire) {
        console.warn('[Horaire V2] Sélection non résolue :', horaireId);
        notifications.erreur('Horaire introuvable', 'Il n\'existe plus dans ce trimestre. La liste va se rafraîchir.');
        db.setSync(cle('horaireSelectionne'), null);
        populerDropdownHorairesV2();
        afficherEtatVideHoraireV2();
        return;
    }

    if (horaire) {
        // Sauvegarder la sélection pour persistance (Beta 95.2)
        db.setSync(cle('horaireSelectionne'), horaireId);
        mettreAJourCarteResumeHoraireV2(horaire);
        editerHoraireV2(horaire);
    }
}

/**
 * Met à jour la carte résumé de l'horaire
 * 🆕 (10 jan 2026) : Affiche local par séance
 */
function mettreAJourCarteResumeHoraireV2(horaire) {
    const carte = document.getElementById('v2-carteResumeHoraire');
    if (!carte) return;

    if (!horaire) {
        carte.innerHTML = '<p class="etat-vide-resume">Aucun horaire sélectionné</p>';
        return;
    }

    const nbSeances = horaire.seances?.length || 0;
    // #540 lot C : le total se LIT aux séances. Il valait `nbSeances × periodesParSeance`
    // — une déclaration uniforme jamais confrontée aux heures saisies : un horaire annoncé
    // « 2 périodes/séance » avec des séances de 08:00 à 11:00 affichait 4 périodes/semaine
    // et en pesait 8 au dénominateur de l'assiduité.
    const totalPeriodes = periodesParSemaine(horaire.seances);

    let seancesHtml = '';
    if (horaire.seances && horaire.seances.length > 0) {
        seancesHtml = '<ul>';
        horaire.seances.forEach(s => {
            // Une fin manquante se dérive des périodes de CETTE séance, pas du format
            // déclaré de l'horaire. 0 période → on ne fabrique pas d'heure de fin.
            const perSeance = periodesDeLaSeance(s);
            const heureFin = s.heureFin || (perSeance > 0 ? calculerHeureFin(s.heureDebut, perSeance) : '');
            // Afficher le local par séance (ou fallback vers local global pour anciennes données)
            const localSeance = s.local || horaire.local || '';
            const localInfo = localSeance ? ` (${echapperHtml(localSeance)})` : '';
            seancesHtml += `<li>${echapperHtml(s.jour)} ${echapperHtml(s.heureDebut)} - ${echapperHtml(heureFin)}${localInfo}</li>`;
        });
        seancesHtml += '</ul>';
    }

    carte.innerHTML = `
        <div class="resume-horaire-nom">${echapperHtml(horaire.nom || 'Sans nom')}</div>
        <div class="resume-horaire-details">
            <div>Format : ${nbSeances} séance${nbSeances > 1 ? 's' : ''}</div>
            <div>${totalPeriodes > 0 ? totalPeriodes + ' périodes/semaine' : 'durée non déterminée'}</div>
        </div>
        ${seancesHtml ? `<div class="resume-horaire-seances">${seancesHtml}</div>` : ''}
    `;
}

/**
 * Affiche l'état vide du formulaire
 */
function afficherEtatVideHoraireV2() {
    const etatVide = document.getElementById('v2-horaireEtatVide');
    const formulaire = document.getElementById('v2-formulaireHoraire');
    const carteResume = document.getElementById('v2-carteResumeHoraire');

    if (etatVide) etatVide.classList.remove('u-hide');
    if (formulaire) formulaire.classList.add('u-hide');
    // Afficher la carte résumé seulement en état vide (Beta 95.2)
    if (carteResume) carteResume.classList.remove('u-hide');
    horaireEnEditionId = null;
}

/**
 * Peuple le dropdown des groupes associés dans le formulaire horaire
 */
function populerDropdownGroupesHoraireV2(etudiantsOpt) {
    const select = document.getElementById('v2-hor-groupeAssocie');
    if (!select) return;

    // Utiliser les données fraîches si fournies (par chargerListeEtudiantsV2,
    // lues en async fiable), sinon relire en getSync.
    const etudiants = Array.isArray(etudiantsOpt) ? etudiantsOpt : db.getSync(cle('groupeEtudiants'), []);

    // Préserver la sélection en cours pour ne pas la perdre lors d'un
    // rafraîchissement (ex. import d'étudiants pendant l'édition d'un horaire).
    const valeurCourante = select.value;

    // Extraire les groupes uniques
    const groupesSet = new Set();
    etudiants.forEach(e => {
        if (e.groupe) {
            groupesSet.add(String(e.groupe).padStart(5, '0'));
        }
    });

    const groupesTries = Array.from(groupesSet).sort();
    let html = '<option value="">— Sélectionner un groupe —</option>';
    groupesTries.forEach(grp => {
        const nbEtudiants = etudiants.filter(e => String(e.groupe).padStart(5, '0') === grp).length;
        // CT-09 : grp vient du collage CSV des étudiants.
        html += `<option value="${echapperAttribut(grp)}">${echapperHtml(grp)} (${nbEtudiants} étud.)</option>`;
    });
    select.innerHTML = html;

    if (valeurCourante && groupesTries.indexOf(valeurCourante) !== -1) {
        select.value = valeurCourante;
    }
}

/**
 * Affiche le formulaire pour un nouvel horaire
 */
async function nouveauHoraireV2() {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('horaire'))) return;
    horaireEnEditionId = null;

    // Populer le dropdown des groupes
    populerDropdownGroupesHoraireV2();

    // Vider les champs (avec vérifications null pour robustesse)
    const champGroupe = document.getElementById('v2-hor-groupeAssocie');
    const champNom = document.getElementById('v2-hor-nom');
    const champNbSeances = document.getElementById('v2-hor-nbSeances');

    if (champGroupe) champGroupe.value = '';
    if (champNom) champNom.value = '';
    // Note: v2-hor-local supprimé (Beta 95.5) - le local est maintenant par séance
    if (champNbSeances) champNbSeances.value = '2';

    // Mettre à jour le titre
    const titre = document.getElementById('v2-titreFormHoraire');
    if (titre) titre.textContent = 'Nouvel horaire';
    rendreModeFicheHoraireV2(true);

    // Masquer le bouton supprimer (mode création)
    const btnSupprimer = document.getElementById('v2-btnSupprimerHoraire');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    // Générer les champs de séances
    mettreAJourSeancesHoraireV2();

    // Afficher le formulaire, masquer carte résumé (évite redondance - Beta 95.2)
    const etatVide = document.getElementById('v2-horaireEtatVide');
    const formulaire = document.getElementById('v2-formulaireHoraire');
    const carteResume = document.getElementById('v2-carteResumeHoraire');
    if (etatVide) etatVide.classList.add('u-hide');
    if (formulaire) formulaire.classList.remove('u-hide');
    if (carteResume) carteResume.classList.add('u-hide');

    // Désélectionner dans le dropdown
    const select = document.getElementById('v2-selectHoraire');
    if (select) select.value = '';
}

/**
 * Charge un horaire existant dans le formulaire pour édition
 * 🆕 (10 jan 2026) : Local par séance au lieu de global
 */
function editerHoraireV2(horaire) {
    horaireEnEditionId = horaire.id;

    // Populer le dropdown des groupes
    populerDropdownGroupesHoraireV2();

    // Remplir les champs
    const selectGroupe = document.getElementById('v2-hor-groupeAssocie');
    if (selectGroupe) selectGroupe.value = horaire.groupeAssocie || '';
    document.getElementById('v2-hor-nom').value = horaire.nom || '';
    document.getElementById('v2-hor-nbSeances').value = String(horaire.seances?.length || 2);

    // Mettre à jour le titre
    const titre = document.getElementById('v2-titreFormHoraire');
    if (titre) titre.textContent = 'Modifier l\'horaire';
    rendreModeFicheHoraireV2(false);

    // Afficher le bouton supprimer (mode édition)
    const btnSupprimer = document.getElementById('v2-btnSupprimerHoraire');
    if (btnSupprimer) btnSupprimer.classList.remove('u-hide');

    // Générer les champs de séances puis les remplir
    mettreAJourSeancesHoraireV2();

    // Remplir les séances existantes (avec local par séance)
    if (horaire.seances) {
        // Migration : si ancien format avec local global, le copier dans chaque séance
        const localGlobal = horaire.local || '';

        horaire.seances.forEach((s, i) => {
            const selectJour = document.getElementById(`v2-hor-seance-${i}-jour`);
            const inputDebut = document.getElementById(`v2-hor-seance-${i}-debut`);
            const inputFin = document.getElementById(`v2-hor-seance-${i}-fin`);
            const inputLocal = document.getElementById(`v2-hor-seance-${i}-local`);

            if (selectJour) selectJour.value = s.jour || 'Lundi';
            // #540 lot C : une séance qui ne dit rien laisse la proposition du formulaire
            // en place — on ne réécrit plus « 10:00 » par-dessus.
            if (inputDebut && s.heureDebut) inputDebut.value = s.heureDebut;
            if (inputFin && s.heureFin) inputFin.value = s.heureFin;

            // #540 lot E1 — LES SÉANCES D'AVANT N'ONT PAS DE `nombrePeriodes`.
            // Le formulaire n'écrivait que {jour, heureDebut, heureFin, local}. Pour les
            // compléter, on ne redivise PAS les heures : ce serait propager le faux qu'on
            // retire. On reprend `horaire.periodesParSeance` — le format que l'utilisateur
            // avait DÉCLARÉ pour cet horaire. Reprendre une déclaration n'est pas deviner ;
            // et elle reste sous ses yeux, modifiable, avant qu'il enregistre.
            const inputPeriodes = document.getElementById(`v2-hor-seance-${i}-periodes`);
            if (inputPeriodes) {
                const reprises = s.nombrePeriodes || horaire.periodesParSeance || '';
                inputPeriodes.value = reprises > 0 ? String(reprises) : '';
            }
            // Local par séance ou fallback vers local global (migration)
            if (inputLocal) inputLocal.value = s.local || localGlobal;
        });
        majResumeFormatHoraireV2();
    }

    // Afficher le formulaire, masquer carte résumé (évite redondance - Beta 95.2)
    const etatVide = document.getElementById('v2-horaireEtatVide');
    const formulaire = document.getElementById('v2-formulaireHoraire');
    const carteResume = document.getElementById('v2-carteResumeHoraire');
    if (etatVide) etatVide.classList.add('u-hide');
    if (formulaire) formulaire.classList.remove('u-hide');
    if (carteResume) carteResume.classList.add('u-hide');
}

/**
 * Lot E2 (D3) — un horaire existant s'enregistre tout seul : « Créer l'horaire » ne paraît
 * qu'en création.
 */
function rendreModeFicheHoraireV2(enCreation) {
    const btn = document.getElementById('v2-btnCreerHoraire');
    if (btn) btn.classList[enCreation ? 'remove' : 'add']('u-hide');
}

/**
 * Lot E2 : « la fiche est en création et porte une saisie » (ui-dialogues.js). Le jour et
 * les heures des séances naissent avec un défaut (08:00, 10:00) : ils ne comptent pas.
 */
function horaireEnCreationSaisi() {
    const formulaire = document.getElementById('v2-formulaireHoraire');
    if (!formulaire || formulaire.classList.contains('u-hide')) return false;
    if (horaireEnEditionId) return false;
    const val = (id) => String(document.getElementById(id)?.value || '').trim();
    if (val('v2-hor-nom') || val('v2-hor-groupeAssocie')) return true;
    for (let i = 0; document.getElementById(`v2-hor-seance-${i}-jour`); i++) {
        if (val(`v2-hor-seance-${i}-periodes`) || val(`v2-hor-seance-${i}-local`)) return true;
    }
    return false;
}
if (window.uiDialogues) window.uiDialogues.declarerFicheEnCreation('horaire', horaireEnCreationSaisi);

/** Lot E2 : choisir un horaire dans le menu ; pendant une création, la question de sortie. */
async function choisirHoraireV2(el) {
    const select = document.getElementById('v2-selectHoraire');
    const horaireId = (el && el.value !== undefined) ? el.value : select?.value;
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('horaire'))) {
        if (select) select.value = '';
        return;
    }
    changerHoraireSelectionneV2(horaireId);
}

/** Lot E2 (D3) : « Annuler » devient « Fermer » — il n'annulait rien. En création, la question. */
async function fermerFicheHoraireV2() {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('horaire'))) return;
    _fermerFormHoraireV2();
}

/**
 * Lot E2 (D3) — un champ d'un horaire EXISTANT (séances comprises) s'enregistre au
 * changement, par le même écrivain que la création. En création, rien.
 */
function sauvegarderChampHoraireV2() {
    if (!horaireEnEditionId) return false;
    return sauvegarderHoraireV2();
}

/** Lot E2 : un refus de vérification, par le témoin commun. */
function _refuserHoraireV2(phrase, geste) {
    if (window.temoinEnregistrement) {
        window.temoinEnregistrement.nonEnregistre(window.raisonPourTemoin(phrase), geste, cle('horaires'));
    }
    return false;
}

/**
 * Referme le formulaire horaire (ex-annulerFormHoraireV2, sans question).
 */
function _fermerFormHoraireV2() {
    afficherEtatVideHoraireV2();

    // Désélectionner dans le dropdown
    const select = document.getElementById('v2-selectHoraire');
    if (select) select.value = '';
    mettreAJourCarteResumeHoraireV2(null);
}

/**
 * L'écrivain unique d'un horaire : « Créer l'horaire » en création, chaque champ en
 * modification (lot E2, D3). Mêmes vérifications dans les deux cas ; un refus dit
 * « Non enregistré – ‹geste› : ‹raison› » par le témoin commun.
 * 🆕 (10 jan 2026) : Local par séance au lieu de global
 * @returns {boolean} true si l'horaire a été écrit
 */
function sauvegarderHoraireV2() {
    const creation = !horaireEnEditionId;
    const geste = creation ? 'Créer l\'horaire' : 'Modifier l\'horaire';
    const groupeAssocie = document.getElementById('v2-hor-groupeAssocie')?.value;
    const nom = document.getElementById('v2-hor-nom')?.value?.trim();
    const nbSeances = parseInt(document.getElementById('v2-hor-nbSeances')?.value) || 2;

    if (!groupeAssocie) {
        // #478 (b) : un groupe n'a pas de bouton « Créer » — il naît de la première fiche
        // d'étudiant·e qui porte son numéro. Menu VIDE ⇒ on dit où ça se passe ; menu garni
        // mais rien de choisi ⇒ le refus d'avant suffit. Les mots sont approuvés par Grégoire
        // (13 sept. 2026) : l'accordéon est nommé tel qu'il s'affiche.
        // ⚠ LE GESTE D'ABORD, l'explication ensuite. Porte 2.3b (13 sept.) : la bulle disparaît
        // après la PREMIÈRE phrase — dans l'ordre inverse, l'accordéon n'était jamais lu.
        const selectGroupe = document.getElementById('v2-hor-groupeAssocie');
        const aucunGroupe = !selectGroupe || !Array.from(selectGroupe.options).some(o => o.value);
        // Lot E2 : les mêmes phrases, par le témoin (il reste affiché : la seconde est lue).
        if (aucunGroupe) {
            return _refuserHoraireV2(
                'Aucun groupe d\'étudiant·es pour l\'instant. ' +
                'Ajoute ou importe ta liste dans l\'accordéon « Groupe d\'étudiant·es », juste au-dessus. ' +
                'Un groupe apparaît dans ce menu dès qu\'un·e étudiant·e y est inscrit·e.', geste);
        }
        return _refuserHoraireV2('Choisis le groupe associé.', geste);
    }

    if (!nom) {
        return _refuserHoraireV2('Le nom de l\'horaire est requis.', geste);
    }

    // Collecter les séances (avec local par séance)
    //
    // #540 lot C : ces deux replis (`|| '08:00'`, `|| '10:00'`) FABRIQUAIENT une séance de
    // deux heures à partir de champs vides — et cette séance-là entre ensuite au
    // dénominateur de l'assiduité par `obtenirHeuresPrevuesParHoraire`. Un horaire ne
    // s'invente pas : un début manquant est REFUSÉ et dit ; une fin manquante se dérive du
    // format déclaré, qui pilote désormais vraiment la saisie.
    const seances = [];
    for (let i = 0; i < nbSeances; i++) {
        const jour = document.getElementById(`v2-hor-seance-${i}-jour`)?.value || 'Lundi';
        const heureDebut = document.getElementById(`v2-hor-seance-${i}-debut`)?.value || '';
        const local = document.getElementById(`v2-hor-seance-${i}-local`)?.value?.trim() || '';

        if (!heureDebut) {
            return _refuserHoraireV2(`Séance ${i + 1} : heure de début manquante. ` +
                'Sans elle, la durée de la séance ne peut pas être calculée ; c\'est cette durée qui sert à l\'assiduité.', geste);
        }

        const heureFin = document.getElementById(`v2-hor-seance-${i}-fin`)?.value || '';
        if (!heureFin) {
            return _refuserHoraireV2(`Séance ${i + 1} : heure de fin manquante. Elle situe la séance dans la journée.`, geste);
        }

        // #540 lot E1 : le nombre de périodes est SAISI, jamais déduit des heures — une
        // période comprend sa pause, et la convention varie d'un cégep à l'autre. C'est
        // ce nombre qui fait le dénominateur de l'assiduité : on le refuse absent plutôt
        // que d'en proposer un.
        const nombrePeriodes = parseInt(document.getElementById(`v2-hor-seance-${i}-periodes`)?.value, 10);
        if (!(nombrePeriodes > 0)) {
            return _refuserHoraireV2(`Séance ${i + 1} : nombre de périodes manquant. ` +
                'C\'est lui qui compte au dénominateur de l\'assiduité ; il ne se déduit pas des heures, puisqu\'une période comprend sa pause.', geste);
        }

        seances.push({ jour, heureDebut, heureFin, nombrePeriodes, local });
    }

    const cleHoraires = cle('horaires');
    // Une COPIE : modifier l'objet du cache de `db` avant une écriture qui échoue le
    // laisserait faux en mémoire (lot E2, même règle que le registre des trimestres).
    let horaires = JSON.parse(JSON.stringify(db.getSync(cleHoraires, []) || []));
    let idEcrit = horaireEnEditionId;

    if (horaireEnEditionId) {
        // Modification
        const index = horaires.findIndex(h => h.id === horaireEnEditionId);
        if (index < 0) {
            // Sentinelle défensive (modèle « horaire propre au trimestre », 29 mai 2026) :
            // l'horaire édité n'est pas dans le trimestre actif. Ne devrait plus arriver
            // depuis que l'éditeur est réinitialisé au changement de trimestre
            // (changerTrimestreActifV2 + chargerHorairesV2). Sans ce garde, la branche ne
            // faisait RIEN tout en affichant « modifié » → modification silencieusement perdue.
            console.warn('[Horaire V2] Sauvegarde refusée : horaire', horaireEnEditionId, 'absent du trimestre actif', cleHoraires);
            return _refuserHoraireV2('Il n\'appartient pas au trimestre actif. Bascule sur son trimestre pour le modifier.', geste);
        }
        horaires[index] = {
            ...horaires[index],
            groupeAssocie,
            nom,
            seances
        };
        // #540 lot E1 : `periodesParSeance` n'est plus ÉCRIT — chaque séance porte le
        // sien. On ne le SUPPRIME pas des fiches existantes pour autant : il y reste
        // lisible, et sert justement à pré-remplir les séances d'avant au chargement.
        // Supprimer l'ancien champ local global s'il existe (migration)
        delete horaires[index].local;
    } else {
        // Ajout
        const nouvelHoraire = {
            id: genererIdUnique('HOR_'),
            groupeAssocie,
            nom,
            seances
        };
        horaires.push(nouvelHoraire);
        idEcrit = nouvelHoraire.id;
    }

    // Lot E2 (D3) : par le témoin commun ; le message du geste ne part qu'après l'écriture.
    if (!sauvegarderDonneesSelonMode('horaires', horaires, { geste })) return false;
    horaireEnEditionId = idEcrit;
    if (creation) notifications.succes(`Horaire «\u00a0${nom}\u00a0» créé.`);

    // 🆕 FIX (22 jan 2026) : Synchroniser horaireHebdo pour que le calendrier reconnaisse les jours de cours
    // Fusionner les séances de TOUS les horaires pour couvrir tous les groupes-cours
    // CT-04 (21 août 2026) : dédup par (jour, heure) via la source unique
    // fusionnerSeancesHoraires — la dédup par jour seul perdait la 2e séance
    // d'un même jour (deux groupes, deux heures).
    const toutesSeances = fusionnerSeancesHoraires(horaires);
    // Écriture DÉRIVÉE de celle ci-dessus : discrète (un seul « Enregistré »), un échec est dit.
    sauvegarderDonneesSelonMode('horaireHebdo', toutesSeances, { geste, discret: true });

    // Regénérer le calendrier avec les nouveaux jours de cours
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }

    // Rafraîchir l'interface
    populerDropdownHorairesV2();
    const select = document.getElementById('v2-selectHoraire');
    if (select) select.value = horaireEnEditionId;

    const horaire = horaires.find(h => h.id === horaireEnEditionId);
    mettreAJourCarteResumeHoraireV2(horaire);

    // Porte terrain 2.4 (21 août 2026) : apres une CREATION, le formulaire
    // restait en mode creation — titre « Nouvel horaire », bouton « Creer », et
    // surtout AUCUN bouton Supprimer. Poser `select.value` par code ne declenche
    // pas l'evenement `change`, donc `changerHoraireSelectionneV2` ne passait
    // jamais le formulaire en mode edition : l'horaire qu'on venait de creer
    // etait insupprimable tant qu'on n'avait pas selectionne un AUTRE horaire
    // puis fait demi-tour. Signale au terrain : « il n'y a pas de possibilite de
    // supprimer l'horaire ». On bascule donc explicitement en mode edition, par
    // la meme fonction que le dropdown (source unique, pas de logique doublee).
    if (horaire) editerHoraireV2(horaire);

    // 🆕 (10 jan 2026) : Rafraîchir le dropdown horaires dans Groupe-cours
    window.populerDropdownsAssemblageV2();
    return true;
}

/**
 * Supprime l'horaire en cours d'édition
 * Beta 95.2 - Les horaires changent à chaque trimestre, pas de banque nécessaire
 */
async function supprimerHoraireV2() {
    if (!horaireEnEditionId) {
        notifications.erreur('Aucun horaire sélectionné');
        return;
    }

    const cleHoraires = cle('horaires');
    let horaires = db.getSync(cleHoraires, []);
    const horaire = horaires.find(h => h.id === horaireEnEditionId);

    if (!horaire) {
        notifications.erreur('Horaire introuvable');
        return;
    }

    // Confirmation
    const nomHoraire = horaire.nom || 'cet horaire';
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('horaire'))) return;
    if (!confirm(`Supprimer l'horaire "${nomHoraire}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Supprimer de la liste
    // #1007 : relue après l'attente de la fenêtre ; celle d'avant ne vaut plus rien.
    horaires = db.getSync(cleHoraires, []).filter(h => h.id !== horaireEnEditionId);
    db.setSync(cleHoraires, horaires);
    if (window.signalerEcritureUsager) window.signalerEcritureUsager(cleHoraires);   // lot F : geste hors témoin (supprimer un horaire)

    // 🆕 FIX (22 jan 2026) : Resynchroniser horaireHebdo après suppression
    // CT-04 : même source unique qu'à la sauvegarde.
    const toutesSeances = fusionnerSeancesHoraires(horaires);
    const cleHoraireHebdo = cle('horaireHebdo');
    db.setSync(cleHoraireHebdo, toutesSeances);
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }

    // Effacer la sélection sauvegardée
    db.setSync(cle('horaireSelectionne'), null);

    // Réinitialiser l'interface
    horaireEnEditionId = null;
    afficherEtatVideHoraireV2();
    populerDropdownHorairesV2();
    mettreAJourCarteResumeHoraireV2(null);

    // 🆕 (10 jan 2026) : Rafraîchir le dropdown horaires dans Groupe-cours
    window.populerDropdownsAssemblageV2();


    notifications.succes(`Horaire "${nomHoraire}" supprimé`);
}
window.supprimerHoraireV2 = supprimerHoraireV2;
window.majResumeFormatHoraireV2 = majResumeFormatHoraireV2;
// #540 lot D — le recoupement horaire ↔ devis du cours.
window.majRecoupementHoraireV2 = majRecoupementHoraireV2;
window.periodesDeclareesParLeCours = periodesDeclareesParLeCours;
window.periodesDeLaSeance = periodesDeLaSeance;
window.periodesParSemaine = periodesParSemaine;

/**
 * Met à jour les champs de séances selon le nombre sélectionné
 * 🆕 (10 jan 2026) : Ajout du champ Local par séance
 */
function mettreAJourSeancesHoraireV2() {
    const conteneur = document.getElementById('v2-hor-seances');
    const nbSeances = parseInt(document.getElementById('v2-hor-nbSeances')?.value) || 2;

    if (!conteneur) return;

    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    let html = '';

    // #540 lot E1 — CHAQUE SÉANCE PORTE SES PÉRIODES (décision de Grégoire, 26 août 2026,
    // après le lot C).
    //
    // ⮕ POURQUOI ON A CESSÉ DE DÉDUIRE. Une période de cégep, c'est l'enseignement PLUS
    // la pause : 50 + 10 ici, 55 + 5 ailleurs. Diviser une durée d'horloge par la seule
    // durée d'enseignement donnait 4 périodes pour un bloc de 08:00 à 11:00, qui en fait
    // trois — et l'erreur croissait avec la durée : cinq périodes pour un bloc de quatre
    // heures. Ce n'était pas un défaut d'affichage : ce nombre EST le dénominateur de
    // l'assiduité, donc un élève pouvait être compté absent d'une période inexistante.
    //
    // ⮕ CE QUI REMPLACE LA DÉDUCTION. Les heures et le nombre de périodes sont DEUX
    // données, toutes deux lues sur l'horaire officiel, qu'aucune convention ne relie de
    // façon portable. On les demande donc toutes les deux, et on ne convertit plus rien.
    //
    // ⮕ CE QUI PORTE UN DÉFAUT, ET CE QUI N'EN PORTE PAS. Le jour et l'heure de début
    // sont des défauts de formulaire : visibles, modifiables, sans effet sur un calcul
    // tant qu'ils ne sont pas relus en silence. Le nombre de périodes, lui, naît VIDE —
    // c'est la donnée qui pilote le dénominateur, elle se saisit à l'œil ouvert. La
    // sauvegarde la refuse absente plutôt que d'en proposer une.
    const DEBUT_PAR_DEFAUT = '08:00';
    const FIN_PAR_DEFAUT = '10:00';

    // #888 — le mot « pér. » reste à côté de la case, en dehors d'elle. En placeholder, il
    // disparaissait à la saisie, et le « 2 » restant ne disait plus ce qu'il compte (le
    // `title` n'existe pas au toucher). Décision de Grégoire, 17 sept. 2026 : ni rangée ni
    // largeur ajoutées, donc le mot se loge dans la colonne des périodes.

    for (let i = 0; i < nbSeances; i++) {
        const jourDefaut = jours[i % jours.length];
        html += `
            <div class="seance-horaire-ligne">
                <label>Séance ${i + 1}</label>
                <select id="v2-hor-seance-${i}-jour" class="controle-form" data-on-change="sauvegarderChampHoraireV2">
                    ${jours.map(j => `<option value="${j}" ${j === jourDefaut ? 'selected' : ''}>${j}</option>`).join('')}
                </select>
                <input type="time" id="v2-hor-seance-${i}-debut" class="controle-form" value="${DEBUT_PAR_DEFAUT}" data-on-change="sauvegarderChampHoraireV2">
                <span>à</span>
                <input type="time" id="v2-hor-seance-${i}-fin" class="controle-form" value="${FIN_PAR_DEFAUT}" data-on-change="sauvegarderChampHoraireV2">
                <div class="seance-horaire-periodes">
                    <input type="number" id="v2-hor-seance-${i}-periodes" class="controle-form controle-form-compact"
                           min="1" max="8" step="1" title="Nombre de périodes de cette séance"
                           aria-describedby="v2-hor-seance-${i}-periodes-unite"
                           data-on-input="majResumeFormatHoraireV2" data-on-change="sauvegarderChampHoraireV2">
                    <span id="v2-hor-seance-${i}-periodes-unite" class="seance-horaire-unite">pér.</span>
                </div>
                <input type="text" id="v2-hor-seance-${i}-local" class="controle-form" placeholder="Local" data-on-change="sauvegarderChampHoraireV2">
            </div>
        `;
    }

    conteneur.innerHTML = html;

    // Lot E2 (28 sept. 2026) — LES DÉFAUTS SE POSENT, ILS NE S'HÉRITENT PAS. Mesuré dans WebKit :
    // une ligne régénérée par innerHTML, aux mêmes identifiants, reprenait l'heure et les
    // périodes de la ligne qu'elle remplaçait (le jour, lui, revenait au défaut). Invisible
    // tant qu'un seul geste régénérait ; depuis qu'un horaire existant s'enregistre au
    // changement du nombre de séances, « + Nouvel horaire » héritait de l'horaire précédent
    // (CT-01). Les valeurs sont donc posées ici, explicitement ; les appelants qui remplissent
    // (édition, changement de format) le font APRÈS.
    for (let i = 0; i < nbSeances; i++) {
        const poser = (suffixe, valeur) => {
            const champ = document.getElementById(`v2-hor-seance-${i}-${suffixe}`);
            if (champ) champ.value = valeur;
        };
        poser('jour', jours[i % jours.length]);
        poser('debut', DEBUT_PAR_DEFAUT);
        poser('fin', FIN_PAR_DEFAUT);
        poser('periodes', '');
        poser('local', '');
    }
}

/**
 * Handler des selects « Nombre de séances » et « Périodes par séance » (CT-01).
 * La régénération des lignes repart des défauts : sans capture préalable, un
 * simple changement de format écrasait les séances déjà saisies et
 * « Enregistrer » persistait les défauts en silence. On photographie donc les
 * valeurs du DOM avant la régénération, puis on les restitue ligne à ligne ;
 * seules les lignes ajoutées prennent les défauts.
 */
function changerFormatSeancesHoraireV2() {
    const saisies = [];
    for (let i = 0; document.getElementById(`v2-hor-seance-${i}-jour`); i++) {
        saisies.push({
            jour: document.getElementById(`v2-hor-seance-${i}-jour`).value,
            heureDebut: document.getElementById(`v2-hor-seance-${i}-debut`)?.value || '',
            heureFin: document.getElementById(`v2-hor-seance-${i}-fin`)?.value || '',
            // #540 lot E1 : les périodes se photographient comme le reste — sans quoi
            // changer le nombre de séances effacerait une saisie, exactement le défaut
            // que CT-01 (#460) a fermé pour les heures.
            periodes: document.getElementById(`v2-hor-seance-${i}-periodes`)?.value || '',
            local: document.getElementById(`v2-hor-seance-${i}-local`)?.value || ''
        });
    }

    mettreAJourSeancesHoraireV2();

    saisies.forEach((s, i) => {
        const selectJour = document.getElementById(`v2-hor-seance-${i}-jour`);
        if (!selectJour) return; // ligne retirée par la réduction du nombre de séances
        selectJour.value = s.jour;
        const inputDebut = document.getElementById(`v2-hor-seance-${i}-debut`);
        const inputFin = document.getElementById(`v2-hor-seance-${i}-fin`);
        const inputLocal = document.getElementById(`v2-hor-seance-${i}-local`);
        if (inputDebut) inputDebut.value = s.heureDebut;
        if (inputFin) inputFin.value = s.heureFin;
        if (inputLocal) inputLocal.value = s.local;
        const inputPeriodes = document.getElementById(`v2-hor-seance-${i}-periodes`);
        if (inputPeriodes) inputPeriodes.value = s.periodes;
    });
    majResumeFormatHoraireV2();
    // Lot E2 : sur un horaire existant, le nouveau nombre de séances s'enregistre (une séance
    // ajoutée sans périodes est refusée et dite, jusqu'à ce qu'elle soit remplie).
    sauvegarderChampHoraireV2();
}

/**
 * Calcule l'heure de fin à partir de l'heure de début et du nombre de périodes
 */
function calculerHeureFin(heureDebut, nbPeriodes) {
    if (!heureDebut) return '';
    // #540 lot C : `dureePeriodeCourante()` lit la valeur CONFIGURÉE (clé `dureePeriode`,
    // écrite par `definirDureePeriode`). L'ancienne lecture ne voyait que le select de
    // l'écran Horaire : appelée depuis un autre écran, elle retombait sur le défaut alors
    // qu'un réglage existait.
    const dureePeriode = dureePeriodeCourante();
    const [h, m] = heureDebut.split(':').map(Number);
    const totalMinutes = h * 60 + m + (nbPeriodes * dureePeriode);
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Exports globaux pour les fonctions horaire
window.nouveauHoraireV2 = nouveauHoraireV2;
window.changerHoraireSelectionneV2 = changerHoraireSelectionneV2;
window.fermerFicheHoraireV2 = fermerFicheHoraireV2;
window.choisirHoraireV2 = choisirHoraireV2;
window.sauvegarderHoraireV2 = sauvegarderHoraireV2;
window.sauvegarderChampHoraireV2 = sauvegarderChampHoraireV2;
window.rendreModeFicheHoraireV2 = rendreModeFicheHoraireV2;
window.mettreAJourSeancesHoraireV2 = mettreAJourSeancesHoraireV2;
window.changerFormatSeancesHoraireV2 = changerFormatSeancesHoraireV2;
window.chargerHorairesV2 = chargerHorairesV2;
// #478 (b) : lu par `chargerListeEtudiantsV2` (trimestre-v2-etudiants.js), une AUTRE IIFE.
// Sans cet export, son `typeof` rendait toujours faux : un groupe ajouté n'apparaissait
// dans « Groupe associé » qu'en rouvrant le formulaire (mesuré le 13 sept. 2026).
window.populerDropdownGroupesHoraireV2 = populerDropdownGroupesHoraireV2;
// Exports migrés du bloc principal résidu (lignes 4524-4530 originelles).
window.chargerHoraireGroupeActifV2 = chargerHoraireGroupeActifV2;
window.chargerSeancesV2 = chargerSeancesV2;
window.afficherFormSeanceV2 = afficherFormSeanceV2;
window.modifierSeanceV2 = modifierSeanceV2;
window.annulerFormSeanceV2 = annulerFormSeanceV2;
window.confirmerSeanceV2 = confirmerSeanceV2;
window.supprimerSeanceV2 = supprimerSeanceV2;

})();
