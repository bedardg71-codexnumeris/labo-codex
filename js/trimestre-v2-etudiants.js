/* ===============================
   MODULE: TRIMESTRE V2 — ÉTUDIANTS
   Refactor étape 3 session B (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 119-1014 (zone 4 MODULES-MAP §2.4) + handlers wrappers (anciennes
   lignes 3158-3164, déplacés ici car logique étudiants).

   Périmètre : CRUD étudiants + groupes + import/export CSV (TSV/CSV/coller),
   dropdown groupes, dispatch d'actions (Éditer/Supprimer + Inactivité/Décrochage),
   sauvegarde groupe d'étudiants + reset filtre, wrappers handlers dispatcher
   `data-on-change` (Phase 5 Lot 5.12a).

   Variables module-scope migrées : `donneesImportEnAttenteV2` (file d'attente
   import) et `etudiantEnEditionIndex` (index d'édition dans la liste complète).

   Dépendances cross-module accédées via `window.X` (résidu trimestre-v2.js
   chargé AVANT ce fichier dans index.html) :

   Note : `peuplerDropdownGroupeCours` (sans `Actif`) avec `typeof === 'function'`
   est défensif (legacy archivé `js/_archives/entites-ui.js`, ne sera jamais
   trouvé en production) — conservé pour préservation comportementale stricte.
   =============================== */

(function() {
'use strict';

/* ===============================
   ACCORD SINGULIER / PLURIEL (helpers partagés)
   =============================== */

// 0 ou 1 → singulier ; ≥ 2 → pluriel. Réutilisé par trimestre-v2-cours.js.
function pluriel(n, singulier, plur) {
    return Math.abs(Number(n)) >= 2 ? plur : singulier;
}
// « N étudiant·e » / « N étudiant·es » selon l'accord.
function formaterNbEtudiants(n) {
    return n + ' ' + pluriel(n, 'étudiant·e', 'étudiant·es');
}
window.pluriel = pluriel;
window.formaterNbEtudiants = formaterNbEtudiants;

/* ===============================
   ACCORDÉON GROUPES / ÉTUDIANTS
   =============================== */

// Variable pour stocker les données en attente d'import
let donneesImportEnAttenteV2 = [];

// #872 (15 sept. 2026) — un groupe n'existe que comme numéro porté par des élèves. Celui que
// « + Nouveau groupe » vient de créer n'en a encore aucun : sans cette mémoire, le menu,
// reconstruit depuis les élèves, le perdait aussitôt. Liée à la clé du trimestre ; jamais écrite.
let groupesEnAttenteV2 = { cle: null, groupes: new Set() };

/**
 * Charge et affiche la liste des étudiants dans l'accordéon v2
 * ✅ CORRECTION (9 jan 2026): Converti en async pour lire depuis IndexedDB (source de vérité)
 */
async function chargerListeEtudiantsV2() {
    const conteneur = document.getElementById('v2-listeEtudiants');
    const nbTotal = document.getElementById('v2-nbEtudiantsTotal');
    const actionsEtudiants = document.getElementById('v2-actionsEtudiants');

    if (!conteneur) return;

    // Utiliser namespace cle() pour lire les données du trimestre actif
    const cleEtudiants = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Lire depuis IndexedDB pour éviter les données obsolètes de localStorage
    const tousLesEtudiants = await db.get(cleEtudiants) || [];

    // 🔍 DEBUG (9 jan 2026): Tracer la source des données

    // Mettre à jour le dropdown des groupes (avec tous les étudiants)
    populerDropdownGroupesV2(tousLesEtudiants);

    // Rafraîchir aussi le dropdown « Groupe associé » de l'éditeur d'horaire :
    // sinon un groupe créé/importé n'y apparaît qu'après réouverture du
    // formulaire (le select rendu n'était jamais repeuplé). Non destructif.
    if (typeof populerDropdownGroupesHoraireV2 === 'function') {
        populerDropdownGroupesHoraireV2(tousLesEtudiants);
    }
    // #872 : même oubli pour l'étape 3 du groupe-cours — un groupe importé n'y paraissait pas.
    if (typeof window.populerDropdownGroupesAssemblageV2 === 'function') {
        window.populerDropdownGroupesAssemblageV2();
    }

    // Filtrer par groupe si sélectionné
    const groupeFiltre = getGroupeSelectionneV2();
    const etudiants = groupeFiltre
        ? tousLesEtudiants.filter(e => normaliserNumeroGroupe(e.groupe) === groupeFiltre)
        : tousLesEtudiants;

    // Mettre à jour le compteur dans l'en-tête (total, pas filtré)
    if (nbTotal) nbTotal.textContent = formaterNbEtudiants(tousLesEtudiants.length);

    // Mettre à jour la carte résumé (avec les étudiants filtrés)
    mettreAJourResumeEtudiantsV2(etudiants);

    if (etudiants.length === 0) {
        const message = groupeFiltre
            ? `Aucun étudiant dans le groupe ${echapperHtml(groupeFiltre)}.`
            : 'Aucun étudiant. Utilise le formulaire ci-dessous ou l\'import plus bas.';
        conteneur.innerHTML = `<p class="etat-vide-liste">${message}</p>`;
        toggleDisplay(actionsEtudiants, tousLesEtudiants.length > 0);
        // Masquer le bouton supprimer groupe si pas d'étudiants
        const btnSupprimerGroupe = document.getElementById('v2-btnSupprimerGroupe');
        if (btnSupprimerGroupe) btnSupprimerGroupe.classList.add('u-hide');
        // #913 : la zone des résultats ultérieurs suit la liste, y compris quand elle se vide
        // (sinon elle garderait les élèves du trimestre ou du groupe d'avant).
        if (typeof window.afficherResultatsUlterieurs === 'function') window.afficherResultatsUlterieurs([]);
        return;
    }

    if (actionsEtudiants) actionsEtudiants.classList.remove('u-hide');

    // #885 : le bouton reste visible dès qu'il y a des élèves. Caché sous « Tous les groupes »,
    // Mathieu ne l'a jamais vu et a retiré ses élèves un par un. Il nomme le groupe visé ; sans
    // groupe choisi, il renvoie au menu (supprimerGroupeSelectionneV2).
    const btnSupprimerGroupe = document.getElementById('v2-btnSupprimerGroupe');
    if (btnSupprimerGroupe) {
        toggleDisplay(btnSupprimerGroupe, true);
        btnSupprimerGroupe.textContent = groupeFiltre ? `Supprimer le groupe ${groupeFiltre}` : 'Supprimer un groupe…';
    }

    // Mode anonymisation (bug du 14 sept. 2026, rencontre de la CoP) : cette liste lisait la
    // clé brute et affichait les vrais noms. Seules les RANGÉES passent par anonymiserDonnees
    // (modes.js) — `da` y reste le vrai DA, que portent les menus d'action ; le compteur et le
    // menu des groupes gardent la liste brute (des effectifs, des numéros). Pas de repli sur
    // la liste brute si anonymiserDonnees manquait : une erreur vaut mieux qu'un nom en clair.
    const enAnonymisation = db.getSync('modeApplication', 'normal') === 'anonymisation';
    const rangees = enAnonymisation ? anonymiserDonnees('groupeEtudiants', etudiants) : etudiants;

    // Trier par nom — en anonymisation, l'ordre aléatoire d'anonymiserDonnees est gardé
    // (comme dans groupe.js) : trier sur les pseudonymes ne dirait rien.
    if (!enAnonymisation) {
        rangees.sort((a, b) => {
            const nomA = `${a.nom || ''} ${a.prenom || ''}`.toLowerCase();
            const nomB = `${b.nom || ''} ${b.prenom || ''}`.toLowerCase();
            return nomA.localeCompare(nomB);
        });
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>DA</th>
                    <th>Grp</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>SA</th>
                    <th>Action</th>
                    <th>Remarque</th>
                </tr>
            </thead>
            <tbody>
    `;

    rangees.forEach((e, index) => {
        const sa = e.sa === 'Oui' || e.sa === true ? '<span class="icone-inline icone-inline--check" aria-label="Oui"></span>' : '';
        // Formater le groupe sur 5 chiffres (ex: 00001) — en anonymisation, le groupe est
        // déjà remplacé par anonymiserGroupe et s'affiche tel quel.
        const groupe = e.groupe ? (enAnonymisation ? e.groupe : normaliserNumeroGroupe(e.groupe)) : '—';
        // daAffichage : 'ANONYME' ou le vrai DA selon l'option d'affichage (modes.js).
        const daVisible = enAnonymisation ? e.daAffichage : e.da;
        const statut = e.statut || '';
        const classeStatut = statut === 'inactif' || statut === 'décrochage' ? ' etudiant-inactif' : '';
        // Règle de sécurité 1 : noms, DA et groupe viennent d'un collage Omnivox — échappés.
        html += `
            <tr class="${classeStatut}">
                <td>${echapperHtml(daVisible || '—')}</td>
                <td style="text-align: center;">${echapperHtml(groupe)}</td>
                <td>${echapperHtml(e.nom || '—')}</td>
                <td>${echapperHtml(e.prenom || '—')}</td>
                <td style="text-align: center;">${sa}</td>
                <td style="text-align: center;">
                    <select class="controle-form controle-form-compact" data-on-change="actionEtudiantV2Handler" data-da="${echapperHtml(e.da)}">
                        <option value="">—</option>
                        <option value="editer">Modifier</option>
                        <option value="supprimer">Supprimer</option>
                    </select>
                </td>
                <td style="text-align: center;">
                    <select class="controle-form controle-form-compact" data-on-change="remarqueEtudiantV2Handler" data-da="${echapperHtml(e.da)}">
                        <option value=""${!statut ? ' selected' : ''}>—</option>
                        <option value="inactif"${statut === 'inactif' ? ' selected' : ''}>Inactivité</option>
                        <option value="décrochage"${statut === 'décrochage' ? ' selected' : ''}>Décrochage</option>
                    </select>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    conteneur.innerHTML = html;

    // #913 : les résultats ultérieurs se saisissent sous cette liste, sur LES MÊMES rangées
    // (même filtre de groupe, même tri, mêmes noms anonymisés ; `da` reste le vrai DA).
    if (typeof window.afficherResultatsUlterieurs === 'function') window.afficherResultatsUlterieurs(rangees);
}

/**
 * Met à jour la carte résumé des étudiants (Beta 95.2)
 * @param {Array} etudiants - Liste des étudiants
 */
function mettreAJourResumeEtudiantsV2(etudiants) {
    const elemNbTotal = document.getElementById('v2-resumeNbTotal');
    const elemGroupes = document.getElementById('v2-resumeGroupes');
    const elemSA = document.getElementById('v2-resumeSA');
    const elemNbSA = document.getElementById('v2-resumeNbSA');

    // Nombre total (le grand nombre reste seul ; le mot accordé va dans le label)
    if (elemNbTotal) elemNbTotal.textContent = etudiants.length;
    const elemLabelEtud = document.getElementById('v2-resumeLabelEtudiants');
    if (elemLabelEtud) elemLabelEtud.textContent = pluriel(etudiants.length, 'étudiant·e', 'étudiant·es');

    // Répartition par groupe
    if (elemGroupes) {
        const groupesMap = {};
        etudiants.forEach(e => {
            const grp = e.groupe ? normaliserNumeroGroupe(e.groupe) : 'Sans groupe';
            groupesMap[grp] = (groupesMap[grp] || 0) + 1;
        });

        const groupesTries = Object.entries(groupesMap).sort((a, b) => a[0].localeCompare(b[0]));

        if (groupesTries.length === 0) {
            elemGroupes.innerHTML = '';
        } else if (groupesTries.length === 1) {
            elemGroupes.innerHTML = `<div class="resume-details-ligne"><span>Groupe ${echapperHtml(groupesTries[0][0])}</span></div>`;
        } else {
            let html = '';
            groupesTries.forEach(([grp, nb]) => {
                html += `<div class="resume-details-ligne"><span>Grp ${echapperHtml(grp)}</span><span>${nb}</span></div>`;
            });
            elemGroupes.innerHTML = html;
        }
    }

    // Services adaptés (SA)
    const nbSA = etudiants.filter(e => e.sa === 'Oui' || e.sa === true).length;
    toggleDisplay(elemSA, nbSA > 0);
    if (elemNbSA) {
        elemNbSA.textContent = formaterNbEtudiants(nbSA);
    }

    // Beta 95.3 : Top programmes (2-3 plus fréquents)
    const elemTopProgrammes = document.getElementById('v2-topProgrammes');
    if (elemTopProgrammes) {
        const programmesMap = {};
        etudiants.forEach(e => {
            const prog = e.programme ? String(e.programme).trim() : '';
            if (prog) {
                programmesMap[prog] = (programmesMap[prog] || 0) + 1;
            }
        });

        // Trier par fréquence décroissante, garder top 3
        const topProgrammes = Object.entries(programmesMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        if (topProgrammes.length === 0) {
            elemTopProgrammes.classList.add('u-hide');
        } else {
            elemTopProgrammes.classList.remove('u-hide');
            let html = '<div class="label-top">Programmes :</div>';
            topProgrammes.forEach(([prog, nb]) => {
                html += `<div class="programme-item"><span>${prog}</span><span>${nb}</span></div>`;
            });
            elemTopProgrammes.innerHTML = html;
        }
    }
}

/**
 * Peuple le dropdown de sélection des groupes
 * @param {Array} etudiants - Liste complète des étudiants
 */
function populerDropdownGroupesV2(etudiants) {
    const select = document.getElementById('v2-selectGroupe');
    if (!select) return;

    const valeurActuelle = select.value;

    // Extraire les groupes uniques
    const groupesSet = new Set();
    etudiants.forEach(e => {
        if (e.groupe) {
            groupesSet.add(normaliserNumeroGroupe(e.groupe));
        }
    });

    // #872 : les groupes créés mais encore vides, du trimestre affiché seulement.
    const groupesAvecEleves = new Set(groupesSet);
    if (groupesEnAttenteV2.cle === cle('groupeEtudiants')) {
        groupesEnAttenteV2.groupes.forEach(g => groupesSet.add(g));
    }

    const groupesTries = Array.from(groupesSet).sort();

    // Marqueur démo : un groupe est considéré démo si au moins un de ses
    // étudiants a isDemo=true. Cohérent avec le traitement des autres
    // sélecteurs latéraux (horaires, enseignants).
    const estGroupeDemo = (grp) => etudiants.some(e =>
        normaliserNumeroGroupe(e.groupe) === grp && e.isDemo === true
    );

    // Reconstruire les options
    let html = '<option value="">Tous les groupes</option>';
    groupesTries.forEach(grp => {
        const suffixeDemo = estGroupeDemo(grp) ? ' (démo)' : '';
        const suffixeVide = groupesAvecEleves.has(grp) ? '' : ' (vide)';
        // #872 : grp vient de la 2e colonne importée — échappé (echapperHtml tient aussi les
        // guillemets depuis #572 : il sert la valeur de l'attribut comme le texte).
        html += `<option value="${echapperHtml(grp)}">${echapperHtml(grp)}${suffixeDemo}${suffixeVide}</option>`;
    });
    select.innerHTML = html;

    // Restaurer la sélection : en priorité la valeur actuelle du DOM (évite
    // de casser une interaction en cours), sinon la valeur persistée par
    // trimestre (permet à entrerEnDemo de pré-sélectionner '0demo').
    if (valeurActuelle && groupesSet.has(valeurActuelle)) {
        select.value = valeurActuelle;
    } else {
        const groupeSauvegarde = db.getSync(cle('groupeSelectionne'), null);
        if (groupeSauvegarde && groupesSet.has(groupeSauvegarde)) {
            select.value = groupeSauvegarde;
        }
    }
}

/**
 * Filtre la liste des étudiants par groupe sélectionné
 * ✅ CORRECTION (9 jan 2026): Async pour supporter chargerListeEtudiantsV2 async
 */
async function filtrerParGroupeV2() {
    // Persister le choix pour le retour dans la section (pré-sélection démo)
    const select = document.getElementById('v2-selectGroupe');
    if (select) {
        db.setSync(cle('groupeSelectionne'), select.value || '');
    }
    // #872 : le formulaire d'ajout suit le groupe choisi. Laissé vide, il versait l'élève dans
    // le groupe du cours actif — « ça ne faisait qu'ajouter des élèves à mon premier groupe ».
    // En édition, le champ porte le groupe de la fiche ouverte : on n'y touche pas.
    if (etudiantEnEditionIndex < 0) {
        const champGroupe = document.getElementById('v2-etudiantGroupe');
        if (champGroupe) champGroupe.value = select?.value || '';
    }
    await chargerListeEtudiantsV2();
}

/**
 * Retourne le groupe actuellement sélectionné dans le dropdown
 */
function getGroupeSelectionneV2() {
    return document.getElementById('v2-selectGroupe')?.value || '';
}

/**
 * Charge les groupes d'un cours (ancien comportement, maintenant charge la liste)
 */
async function chargerGroupesCoursV2(coursId) {
    await chargerListeEtudiantsV2();
}

// Variable pour tracker l'index en cours d'édition (-1 = mode ajout)
let etudiantEnEditionIndex = -1;
// #382 — DA d'ORIGINE de l'étudiant en édition : l'index capturé à l'ouverture
// peut être périmé au moment de sauvegarder (liste modifiée entre-temps) ;
// on retrouve l'étudiant par ce DA, jamais par l'index seul.
let etudiantEnEditionDA = null;

/**
 * Soumet le formulaire étudiant (ajout ou modification)
 */
async function soumettreEtudiantV2() {
    const da = document.getElementById('v2-etudiantDA')?.value?.trim();
    const nom = document.getElementById('v2-etudiantNom')?.value?.trim();
    const prenom = document.getElementById('v2-etudiantPrenom')?.value?.trim();
    const programme = document.getElementById('v2-etudiantProgramme')?.value?.trim();
    const sa = document.getElementById('v2-etudiantSA')?.value;
    const groupeInput = document.getElementById('v2-etudiantGroupe')?.value?.trim();

    if (!nom || !prenom) {
        notifications.erreur('Le nom et le prénom sont obligatoires.');
        return;
    }

    const coursActif = db.getSync('infoCours', null);
    // L-9 (#749 lot 2) : padé À L'ÉCRITURE (« 1 » → « 00001 »), par la seule
    // normalisation partagée (modes.js) — les dix `padStart(5, '0')` de ce fichier
    // passent par elle aussi. Le stock déjà écrit en « 1 » n'est pas réécrit : les
    // lecteurs normalisent.
    const groupe = normaliserNumeroGroupe(groupeInput || coursActif?.groupe || '00001');

    const etudiant = {
        da: da || `DA${Date.now()}`,
        nom: nom,
        prenom: prenom,
        groupe: groupe,
        programme: programme || '',
        sa: sa || '',
        coursId: coursActif?.id || ''
    };

    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Utiliser async pour persistance fiable
    // #522 lot 5 — la liste est relue DANS la file : le refus de #382 (« la
    // liste a changé depuis l'ouverture du formulaire ») portait sur un
    // instantané lu hors file, donc il pouvait laisser passer une modification
    // concurrente survenue APRÈS sa lecture.
    let introuvable = false;
    let daEnDouble = null;
    await db.modifier(cleEtud, (lus) => {
        const etudiants = lus || [];

        // L-8 (#749 lot 2) : un DA déjà porté par une autre fiche est REFUSÉ — tout
        // le reste du code identifie un élève par son DA (findIndex(e => e.da === da)
        // ×5) ; deux fiches sous le même DA, c'est un élève qui en écrase un autre au
        // hasard. En édition, la fiche elle-même n'est pas un doublon.
        if (etudiant.da) {
            const autre = etudiants.find(e => e && String(e.da) === String(etudiant.da)
                && !(etudiantEnEditionIndex >= 0 && etudiantEnEditionDA !== null && String(e.da) === String(etudiantEnEditionDA)));
            if (autre) { daEnDouble = autre; return undefined; }
        }

        if (etudiantEnEditionIndex >= 0) {
            // Mode édition — #382 (audit 5 août, rapport B4) :
            // 1. retrouver l'étudiant par son DA d'ORIGINE (l'index capturé à
            //    l'ouverture écrivait sur le MAUVAIS étudiant si la liste avait
            //    changé entre-temps) ; refus explicite si introuvable (patron #332,
            //    jamais de faux succès silencieux) ;
            // 2. FUSIONNER au lieu de remplacer : l'objet reconstruit du formulaire
            //    ne porte que 7 champs — le remplacement effaçait `statut`
            //    (abandon/inactif réintégré aux moyennes en corrigeant une coquille)
            //    et tout autre champ hors formulaire.
            const indexReel = etudiantEnEditionDA !== null
                ? etudiants.findIndex(e => e.da === etudiantEnEditionDA)
                : -1;
            if (indexReel === -1) {
                introuvable = true;
                return undefined;
            }
            etudiants[indexReel] = { ...etudiants[indexReel], ...etudiant };
        } else {
            // Mode ajout : ajouter un nouvel étudiant
            etudiants.push(etudiant);
        }

        return etudiants;
    }, []);

    // Les messages vivent HORS du mutateur : la file ne porte que l'écriture.
    if (daEnDouble) {
        // Mots lus par les collègues — proposition Cowork du 11 sept., soumise à Grégoire.
        notifications.erreur('Ce DA est déjà dans le groupe : ' + ((daEnDouble.prenom || '') + ' ' + (daEnDouble.nom || '')).trim() + '.');
        return;
    }
    if (introuvable) {
        notifications.erreur('Étudiant introuvable', 'La liste a changé depuis l\'ouverture du formulaire. Resélectionne l\'étudiant avant d\'enregistrer.');
        return;
    }
    notifications.succes(`${prenom} ${nom} ${etudiantEnEditionIndex >= 0 ? 'modifié' : 'ajouté'}`);

    // Réinitialiser le formulaire et le mode
    reinitialiserFormEtudiantV2();
    chargerListeEtudiantsV2();
}

/**
 * Passe en mode édition pour un étudiant
 * 🆕 FIX (4 fév 2026) : Utiliser DA au lieu de l'index pour éviter décalage avec liste filtrée
 */
function editerEtudiantV2(da) {
    const cleEtud = cle('groupeEtudiants');
    const etudiants = db.getSync(cleEtud, []);
    const index = etudiants.findIndex(e => e.da === da);
    const etudiant = etudiants[index];

    if (!etudiant || index === -1) return;

    // Stocker l'index en édition (index dans la liste complète)
    etudiantEnEditionIndex = index;
    // #382 : mémoriser le DA d'origine — la sauvegarde retrouve l'étudiant
    // par ce DA, robuste aux changements de liste entre ouverture et save.
    etudiantEnEditionDA = etudiant.da ?? null;

    // Remplir le formulaire
    document.getElementById('v2-etudiantDA').value = etudiant.da || '';
    document.getElementById('v2-etudiantNom').value = etudiant.nom || '';
    document.getElementById('v2-etudiantPrenom').value = etudiant.prenom || '';
    document.getElementById('v2-etudiantGroupe').value = etudiant.groupe || '';
    document.getElementById('v2-etudiantProgramme').value = etudiant.programme || '';
    document.getElementById('v2-etudiantSA').value = etudiant.sa || '';

    // Changer l'apparence du formulaire
    const titre = document.getElementById('v2-formEtudiantTitre');
    const btnSoumettre = document.getElementById('v2-btnSoumettreEtudiant');
    const btnAnnuler = document.getElementById('v2-btnAnnulerEdition');
    const formContainer = document.getElementById('v2-formEtudiant');

    if (titre) titre.textContent = 'Modifier l\'étudiant·e';
    if (btnSoumettre) btnSoumettre.textContent = 'Enregistrer les modifications';
    if (btnAnnuler) btnAnnuler.classList.remove('u-hide');
    if (formContainer) formContainer.classList.add('mode-edition');

    // Scroller vers le formulaire
    formContainer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Annule l'édition et revient au mode ajout
 */
function annulerEditionEtudiantV2() {
    reinitialiserFormEtudiantV2();
}

/**
 * Réinitialise le formulaire en mode ajout
 */
function reinitialiserFormEtudiantV2() {
    etudiantEnEditionIndex = -1;
    etudiantEnEditionDA = null; // #382

    // Vider les champs
    document.getElementById('v2-etudiantDA').value = '';
    document.getElementById('v2-etudiantNom').value = '';
    document.getElementById('v2-etudiantPrenom').value = '';
    // #872 : après un ajout, l'élève suivant va dans le MÊME groupe (celui du menu), pas dans le
    // groupe du cours actif. « Tous les groupes » laisse le champ vide, comme avant.
    document.getElementById('v2-etudiantGroupe').value = getGroupeSelectionneV2();
    document.getElementById('v2-etudiantProgramme').value = '';
    document.getElementById('v2-etudiantSA').value = '';

    // Remettre l'apparence normale
    const titre = document.getElementById('v2-formEtudiantTitre');
    const btnSoumettre = document.getElementById('v2-btnSoumettreEtudiant');
    const btnAnnuler = document.getElementById('v2-btnAnnulerEdition');
    const formContainer = document.getElementById('v2-formEtudiant');

    if (titre) titre.textContent = 'Ajouter un·e étudiant·e';
    if (btnSoumettre) btnSoumettre.textContent = 'Ajouter l\'étudiant·e';
    if (btnAnnuler) btnAnnuler.classList.add('u-hide');
    if (formContainer) formContainer.classList.remove('mode-edition');
}

/**
 * Ajoute un étudiant (alias pour compatibilité)
 */
function ajouterEtudiantV2() {
    soumettreEtudiantV2();
}

/**
 * Crée un nouveau groupe (calcule le prochain numéro disponible)
 */
async function creerNouveauGroupeV2() {
    const cleEtud = cle('groupeEtudiants');
    const etudiants = db.getSync(cleEtud, []);
    if (groupesEnAttenteV2.cle !== cleEtud) groupesEnAttenteV2 = { cle: cleEtud, groupes: new Set() };

    // Numéros déjà pris : ceux que portent des élèves, et ceux des groupes créés encore vides
    const groupesExistants = new Set();
    etudiants.forEach(e => {
        if (e.groupe) {
            const num = parseInt(e.groupe, 10);
            if (!isNaN(num)) groupesExistants.add(num);
        }
    });
    groupesEnAttenteV2.groupes.forEach(g => groupesExistants.add(parseInt(g, 10)));

    // Calculer le prochain numéro disponible
    let prochainNumero = 1;
    while (groupesExistants.has(prochainNumero)) {
        prochainNumero++;
    }

    const nouveauGroupe = normaliserNumeroGroupe(prochainNumero);

    // Demander confirmation ou personnalisation
    const groupeSaisi = prompt(`Numéro du nouveau groupe (celui d'Omnivox) :`, nouveauGroupe);
    if (!groupeSaisi) return; // Annulé

    // #872 : un numéro Omnivox s'écrit en chiffres ; « Gr 2 » aurait donné le groupe « 0Gr 2 ».
    const saisie = String(groupeSaisi).trim();
    if (!/^\d{1,5}$/.test(saisie)) {
        notifications.erreur('Numéro de groupe invalide', 'Écris-le en chiffres, comme dans Omnivox (ex. 00002).');
        return;
    }
    const groupeFinal = normaliserNumeroGroupe(saisie);
    groupesEnAttenteV2.groupes.add(groupeFinal);
    db.setSync(cle('groupeSelectionne'), groupeFinal);

    // Réinitialiser le formulaire et pré-remplir le groupe
    reinitialiserFormEtudiantV2();
    document.getElementById('v2-etudiantGroupe').value = groupeFinal;

    // Ajouter l'option au dropdown si elle n'existe pas et la sélectionner
    const select = document.getElementById('v2-selectGroupe');
    if (select) {
        // Vérifier si l'option existe déjà
        let optionExiste = false;
        for (let opt of select.options) {
            if (opt.value === groupeFinal) {
                optionExiste = true;
                break;
            }
        }
        if (!optionExiste) {
            const newOption = document.createElement('option');
            newOption.value = groupeFinal;
            newOption.textContent = groupeFinal;
            select.appendChild(newOption);
        }
        select.value = groupeFinal;
        // Rafraîchir l'affichage pour montrer le groupe vide
        await chargerListeEtudiantsV2();
    }

    // Focus sur le premier champ
    document.getElementById('v2-etudiantDA')?.focus();

    notifications.succes(`Groupe ${groupeFinal} prêt. Ajoute des étudiants.`);
}

/**
 * Supprime un étudiant
 * 🆕 FIX (4 fév 2026) : Utiliser DA au lieu de l'index pour éviter décalage avec liste filtrée
 */
async function supprimerEtudiantV2(da) {
    // ✅ CORRECTION (31 déc 2025): Utiliser namespace
    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Utiliser async pour persistance fiable
    // ⚠ Lecture hors file, pour NOMMER l'étudiant dans la question. La
    // confirmation ne doit pas tenir la file ouverte : l'index est recalculé
    // dans le mutateur, car celui d'avant la question ne vaut plus rien.
    const etudiants = await db.get(cleEtud) || [];
    const index = etudiants.findIndex(e => e.da === da);
    const etudiant = etudiants[index];

    if (index === -1 || !confirm(`Supprimer ${etudiant?.prenom || ''} ${etudiant?.nom || ''} ?`)) return;

    await db.modifier(cleEtud, (lus) => {
        const liste = lus || [];
        const i = liste.findIndex(e => e.da === da);
        if (i === -1) return undefined;
        liste.splice(i, 1);
        return liste;
    }, []);

    chargerListeEtudiantsV2();

    notifications.succes('Étudiant supprimé');
}

/**
 * Dispatch des actions du select étudiant (Éditer, Supprimer, Inactivité, Décrochage, Réactiver)
 */
function actionEtudiantV2(selectElement, da) {
    var action = selectElement.value;
    selectElement.value = ''; // Réinitialiser le select

    if (!action) return;

    // Mode anonymisation : le formulaire d'édition et la question de suppression
    // nommeraient l'élève en clair. Même refus que groupe.js.
    if (db.getSync('modeApplication', 'normal') === 'anonymisation') {
        notifications.erreur('Modification impossible', 'Repasse en mode normal pour modifier ou supprimer un·e étudiant·e.');
        return;
    }

    switch (action) {
        case 'editer':
            editerEtudiantV2(da);
            break;
        case 'supprimer':
            supprimerEtudiantV2(da);
            break;
    }
}

/**
 * Gère le changement de remarque (Inactivité / Décrochage) via le select Remarque
 */
async function remarqueEtudiantV2(selectElement, da) {
    var nouveauStatut = selectElement.value;
    await changerStatutEtudiantV2(da, nouveauStatut);
}

/**
 * Change le statut d'un étudiant (inactif, decrochage, ou '' pour réactiver)
 * - Inactivité : signalée par le registrariat, l'étudiant est absent de plusieurs cours
 * - Décrochage : constat de l'enseignant, officieux, peut-être seulement dans ce cours
 * Dans les deux cas : résultats affichés jusqu'à la dernière présence,
 * mais évaluations et absences exclues des calculs du groupe.
 */
async function changerStatutEtudiantV2(da, nouveauStatut) {
    var cleEtud = cle('groupeEtudiants');

    // ⚠ Lecture hors file, pour NOMMER l'étudiant dans la question.
    var etudiants = await db.get(cleEtud) || [];
    var index = etudiants.findIndex(function(e) { return e.da === da; });

    if (index === -1) return;

    var etudiant = etudiants[index];
    var nomComplet = (etudiant.prenom || '') + ' ' + (etudiant.nom || '');

    if (nouveauStatut === 'inactif') {
        if (!confirm('Marquer ' + nomComplet.trim() + ' comme inactif ?\n\nSes résultats seront affichés jusqu\'à sa dernière présence, mais ne seront plus comptés dans les calculs du groupe.')) return;
    } else if (nouveauStatut === 'décrochage') {
        if (!confirm('Marquer ' + nomComplet.trim() + ' en décrochage ?\n\nSes résultats seront affichés jusqu\'à sa dernière présence, mais ne seront plus comptés dans les calculs du groupe.')) return;
    }

    await db.modifier(cleEtud, function(lus) {
        var liste = lus || [];
        var i = liste.findIndex(function(e) { return e.da === da; });
        if (i === -1) return undefined;
        liste[i].statut = nouveauStatut;
        return liste;
    }, []);

    chargerListeEtudiantsV2();

    if (nouveauStatut === 'inactif') {
        notifications.succes(nomComplet.trim() + ' marqué inactif');
    } else if (nouveauStatut === 'décrochage') {
        notifications.succes(nomComplet.trim() + ' marqué en décrochage');
    } else {
        notifications.succes(nomComplet.trim() + ' réactivé');
    }
}

/**
 * Importe un fichier CSV/TSV
 */
function importerFichierEtudiantsV2(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    // Lire d'abord en UTF-8 (cas standard : Excel, exports .csv UTF-8), puis
    // rebasculer en Windows-1252 (Omnivox, Excel français — FIX #49) seulement
    // si on détecte des caractères corrompus. Forcer Windows-1252 cassait les
    // fichiers UTF-8 (« Ã© » au lieu de « é »). Même logique que groupe.js.
    const reader = new FileReader();
    reader.onload = function(e) {
        const contenu = e.target.result;
        const aCaractereRemplacement = contenu.indexOf('�') !== -1;
        const aMojibake = /Ã©|Ã¨|Ã |Ãª|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ãˆ|Ã€|Ãœ|Ã"|Ã¢|Ã¯/.test(contenu);
        if (aCaractereRemplacement || aMojibake) {
            const readerLatin = new FileReader();
            readerLatin.onload = function(e2) { traiterDonneesImportV2(e2.target.result); };
            readerLatin.readAsText(fichier, 'windows-1252');
        } else {
            traiterDonneesImportV2(contenu);
        }
    };
    reader.readAsText(fichier, 'UTF-8');
}

/**
 * Prévisualise les données collées
 */
function previsualiserDonneesV2() {
    const donnees = document.getElementById('v2-donneesCollees')?.value?.trim();
    if (!donnees) {
        alert('Veuillez coller des données à importer.');
        return;
    }
    traiterDonneesImportV2(donnees);
}

/**
 * Traite les données importées pour prévisualisation
 */
/**
 * Découpe UNE ligne collée en colonnes : séparateur détecté (tabulation, point-virgule, virgule),
 * format Excel `="valeur"` et guillemets retirés. Pure ; partagée avec le sous-onglet Rencontres
 * (cadrage « Rencontres », 12 sept. 2026) — la même règle de lecture, pas un second parseur.
 * @param {string} ligne
 * @returns {string[]}
 */
function decouperLigneCollee(ligne) {
    const separateur = ligne.includes('\t') ? '\t' : (ligne.includes(';') ? ';' : ',');
    return ligne.split(separateur).map(c => {
        // Nettoyer format Excel ="valeur" (préserve zéros en tête)
        let val = c.trim();
        if (val.startsWith('="') && val.endsWith('"')) {
            val = val.slice(2, -1);
        } else if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        }
        return val.trim();
    });
}

/**
 * Lit une liste collée au format Omnivox (DA, groupe, nom, prénom, programme, [vide], SA) et rend
 * les fiches à importer. Pure ; les lignes de moins de quatre colonnes sont ignorées, comme avant.
 * Extraite de `traiterDonneesImportV2` pour le sous-onglet Rencontres — zéro changement de lecture.
 * @param {string} contenu
 * @returns {Array<{da:string, groupe:string, nom:string, prenom:string, programme:string, sa:string}>}
 */
function analyserListeEtudiantsCollee(contenu) {
    const fiches = [];
    String(contenu || '').trim().split('\n').forEach(ligne => {
        const colonnes = decouperLigneCollee(ligne);
        // #872 (15 sept. 2026) : une ligne d'en-tête n'est pas un élève. Notre propre export commence
        // par « DA,Groupe,Nom,… » : le réimporter créait un élève du groupe « Groupe ».
        if (/^da$/i.test(colonnes[0] || '') || /^groupe$/i.test(colonnes[1] || '')) return;
        if (colonnes.length >= 4) {
            // FIX #49 (1er fév 2026) : SA peut être en colonne 5 ou 6 selon le format Omnivox
            const saValue = (colonnes[5]?.trim() || colonnes[6]?.trim() || '').toUpperCase();
            const sa = (saValue === 'OUI' || saValue === 'SA' || saValue === 'X') ? 'Oui' : '';

            fiches.push({
                da: colonnes[0] || '',
                groupe: normaliserNumeroGroupe(colonnes[1] || '00001'),   // L-9 : padé à l'écriture
                nom: colonnes[2] || '',
                prenom: colonnes[3] || '',
                programme: colonnes[4] || '',
                sa: sa
            });
        }
    });
    return fiches;
}

function traiterDonneesImportV2(contenu) {
    donneesImportEnAttenteV2 = analyserListeEtudiantsCollee(contenu);

    if (donneesImportEnAttenteV2.length === 0) {
        alert('Aucune donnée valide trouvée. Vérifie le format.');
        return;
    }

    // Afficher la prévisualisation
    const previewZone = document.getElementById('v2-previewZone');
    const previewTable = document.getElementById('v2-previewTable');

    if (previewZone && previewTable) {
        let html = `
            <table class="tableau-blanc" style="width: 100%; font-size: 0.85rem;">
                <thead>
                    <tr>
                        <th>DA</th><th>Groupe</th><th>Nom</th><th>Prénom</th><th>Programme</th><th>SA</th>
                    </tr>
                </thead>
                <tbody>
        `;

        donneesImportEnAttenteV2.forEach(e => {
            const groupe = e.groupe ? normaliserNumeroGroupe(e.groupe) : '—';
            html += `
                <tr>
                    <td>${e.da}</td><td>${groupe}</td><td>${e.nom}</td><td>${e.prenom}</td><td>${e.programme}</td><td>${e.sa}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        previewTable.innerHTML = html;
        previewZone.classList.remove('u-hide');
    }
}

/**
 * Confirme l'import des données
 */
async function confirmerImportV2() {

    if (donneesImportEnAttenteV2.length === 0) {
        console.warn('⚠️ [confirmerImportV2] Aucune donnée en attente !');
        return;
    }

    const coursActif = db.getSync('infoCours', null);
    // ✅ CORRECTION (31 déc 2025): Utiliser namespace
    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Lire depuis IndexedDB pour avoir les données complètes
    // #522 lot 5 — la liste est relue DANS la file. security-ok: les entrées
    // viennent du fichier importé, déjà validé en amont ; seul `coursId` est
    // posé ici, depuis le cours actif.
    // L-8 (#749 lot 2) : un DA déjà présent dans le groupe n'est PAS dupliqué — il est
    // ignoré et compté ; la fiche existante ne bouge pas (réimporter le même fichier
    // n'ajoute rien). Les doublons INTERNES au fichier sont écartés de la même façon.
    let nbAjoutes = 0;
    let nbDejaPresents = 0;
    await db.modifier(cleEtud, (lus) => {
        const etudiants = lus || [];
        const dasPresents = new Set(etudiants.map(e => e && String(e.da)));

        donneesImportEnAttenteV2.forEach(e => {
            if (e.da && dasPresents.has(String(e.da))) { nbDejaPresents++; return; }
            if (e.da) dasPresents.add(String(e.da));
            etudiants.push({
                ...e,
                coursId: coursActif?.id || ''
            });
            nbAjoutes++;
        });

        return etudiants;
    }, []);

    // Vérification immédiate : le compte relu en base (tout le groupe), et le compte du lot importé.
    // #771 (6 sept. 2026) — la notification lisait `etudiants`, le paramètre du mutateur ci-dessus,
    // hors de portée ici : ReferenceError après l'écriture, aucune confirmation à l'écran.
    const verification = db.getSync(cleEtud, []).length;
    const nbImportes = nbAjoutes;

    // Nettoyer
    donneesImportEnAttenteV2 = [];
    document.getElementById('v2-previewZone').classList.add('u-hide');
    document.getElementById('v2-donneesCollees').value = '';
    document.getElementById('v2-fichierCsvEntree').value = '';

    // 🆕 Beta 95.3: Reset le filtre à "Tous les groupes" pour voir les nouveaux étudiants
    const selectGroupe = document.getElementById('v2-selectGroupe');
    if (selectGroupe) selectGroupe.value = '';

    chargerListeEtudiantsV2();

    // Mots lus par les collègues — proposition Cowork du 11 sept., soumise à Grégoire.
    notifications.succes(`${nbImportes} étudiant·e${nbImportes > 1 ? 's' : ''} ajouté·e${nbImportes > 1 ? 's' : ''}`
        + (nbDejaPresents > 0 ? `, ${nbDejaPresents} déjà présent·e${nbDejaPresents > 1 ? 's' : ''} (ignoré·e${nbDejaPresents > 1 ? 's' : ''})` : '')
        + ` — ${verification} au total dans le groupe`);

    // Mettre à jour le guide groupe-cours
}

/**
 * Annule l'import en cours
 */
function annulerImportV2() {
    donneesImportEnAttenteV2 = [];
    document.getElementById('v2-previewZone').classList.add('u-hide');
}

/**
 * Exporte les étudiants en CSV
 */
function exporterEtudiantsV2() {
    // ✅ CORRECTION (31 déc 2025): Utiliser namespace
    const cleEtud = cle('groupeEtudiants');
    const etudiants = db.getSync(cleEtud, []);
    if (etudiants.length === 0) {
        alert('Aucun étudiant à exporter.');
        return;
    }

    let csv = 'DA,Groupe,Nom,Prénom,Programme,SA\n';
    etudiants.forEach(e => {
        csv += `${e.da || ''},${e.groupe || ''},${e.nom || ''},${e.prenom || ''},${e.programme || ''},${e.sa || ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etudiants-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

/**
 * Réinitialise la liste des étudiants
 */
async function reinitialiserEtudiantsV2() {
    // ✅ CORRECTION (31 déc 2025): Utiliser namespace
    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Utiliser async pour persistance fiable
    // ⚠ CE SITE N'EST PAS EN COURSE, et l'outil de mesure le compte à tort :
    // la lecture ne sert qu'à CHIFFRER la question, et la valeur écrite est une
    // CONSTANTE (`[]`) qui n'en dérive pas. Un ajout concurrent pendant la
    // confirmation serait effacé — mais c'est ce que « supprimer tous les
    // étudiants » veut dire. Passer par la file ne changerait rien au résultat.
    const etudiants = await db.get(cleEtud) || [];
    if (!confirm(`Supprimer les ${etudiants.length} étudiant(s) ? Cette action est irréversible.`)) return;

    await db.set(cleEtud, []);
    chargerListeEtudiantsV2();

    notifications.succes('Liste réinitialisée');

    // Mettre à jour le guide groupe-cours
}

/**
 * Vide la liste des étudiants (alias de reinitialiser)
 * 🆕 BETA 95.2 : Fonction ajoutée pour l'accordéon groupe d'étudiants
 */
function viderListeEtudiantsV2() {
    reinitialiserEtudiantsV2();
}

/**
 * Supprime tous les étudiants du groupe sélectionné
 * 🆕 BETA 95.3 : Permet de supprimer un groupe entier
 */
async function supprimerGroupeSelectionneV2() {
    const groupeSelectionne = getGroupeSelectionneV2();
    if (!groupeSelectionne) {
        notifications.erreur('Choisis d\'abord un groupe', 'Sélectionne dans le menu « Groupe » celui à supprimer.');
        document.getElementById('v2-selectGroupe')?.focus();
        return;
    }

    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Utiliser async pour persistance fiable
    const tousLesEtudiants = await db.get(cleEtud) || [];

    // Compter les étudiants du groupe
    const etudiantsDuGroupe = tousLesEtudiants.filter(e =>
        normaliserNumeroGroupe(e.groupe) === groupeSelectionne
    );

    if (etudiantsDuGroupe.length === 0) {
        notifications.erreur('Aucun étudiant dans ce groupe.');
        return;
    }

    // #885 : un numéro Omnivox est propre à un cours — deux cours peuvent porter le même (#872,
    // mécanisme B). La suppression les emporte tous : la question le dit plutôt que de le taire.
    const nbCours = new Set(etudiantsDuGroupe.map(e => e.coursId || '')).size;
    const mentionCours = nbCours > 1 ? `, répartis dans ${nbCours} cours` : '';
    if (!confirm(`Supprimer les ${etudiantsDuGroupe.length} étudiant(s) du groupe ${groupeSelectionne}${mentionCours} ? Cette action est irréversible.`)) {
        return;
    }

    // Garder uniquement les étudiants des autres groupes. ⚠ Le filtre est
    // rejoué DANS la file : la liste d'avant la confirmation ne vaut plus rien,
    // et un étudiant ajouté pendant la question serait sinon effacé.
    await db.modifier(cleEtud, (lus) => {
        return (lus || []).filter(e =>
            normaliserNumeroGroupe(e.groupe) !== groupeSelectionne
        );
    }, []);

    // Reset le dropdown à "Tous les groupes"
    const selectGroupe = document.getElementById('v2-selectGroupe');
    if (selectGroupe) selectGroupe.value = '';

    chargerListeEtudiantsV2();

    notifications.succes(`Groupe ${groupeSelectionne} supprimé (${etudiantsDuGroupe.length} étudiant(s))`);

    // Mettre à jour le guide groupe-cours
}

/**
 * Sauvegarde le groupe d'étudiants et ouvre l'accordéon Horaire
 * 🆕 BETA 95.2 : Workflow groupe → horaire
 */
async function sauvegarderGroupeEtudiantsV2() {
    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Utiliser async pour persistance fiable
    const etudiants = await db.get(cleEtud) || [];

    if (etudiants.length === 0) {
        alert('Aucun étudiant dans le groupe. Importe d\'abord une liste.');
        return;
    }

    // Récupérer le numéro de groupe
    const coursActif = db.getSync('infoCours', {});
    const numeroGroupe = coursActif?.groupe || '00001';

    // S'assurer que tous les étudiants ont le bon numéro de groupe
    await db.modifier(cleEtud, (lus) => {
        const liste = lus || [];
        let modifie = false;
        liste.forEach(e => {
            if (!e.groupe || e.groupe === '' || e.groupe === '—') {
                e.groupe = numeroGroupe;
                modifie = true;
            }
        });

        // Rien à corriger : le mutateur rend `undefined`, aucune écriture.
        if (!modifie) return undefined;
        return liste;
    }, []);

    // Notification de succès
    notifications.succes(`Groupe ${numeroGroupe} sauvegardé (${etudiants.length} étudiants)`);

    // 🆕 BETA 95.2 : Rafraîchir le dropdown groupe-cours pour inclure ce groupe
    if (typeof peuplerDropdownGroupeCours === 'function') {
        peuplerDropdownGroupeCours();
    }

    // Mettre à jour le guide groupe-cours

    // Ouvrir l'accordéon Horaire pour continuer le workflow
    const accordeonHoraire = document.getElementById('accordeon-horaire');
    if (accordeonHoraire) {
        const contenu = accordeonHoraire.querySelector('.accordeon-contenu');
        const chevron = accordeonHoraire.querySelector('.accordeon-chevron');
        if (contenu && contenu.classList.contains('u-hide')) {
            contenu.classList.remove('u-hide');
            if (chevron) chevron.textContent = '▼';
        }
        // Scroll vers l'accordéon Horaire
        accordeonHoraire.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5 — Lot 5.12a)
   Adaptent la signature (el) du dispatcher change
   vers la signature (selectEl, da) des fonctions existantes.
   =============================== */

function actionEtudiantV2Handler(el) {
    actionEtudiantV2(el, el.dataset.da);
}

function remarqueEtudiantV2Handler(el) {
    remarqueEtudiantV2(el, el.dataset.da);
}

// Exports — 25 fonctions migrées du bloc exports résidu L2213-2237 + handlers 2222/2224.
window.chargerGroupesCoursV2 = chargerGroupesCoursV2;
window.chargerListeEtudiantsV2 = chargerListeEtudiantsV2;
window.ajouterEtudiantV2 = ajouterEtudiantV2;
window.supprimerEtudiantV2 = supprimerEtudiantV2;
window.editerEtudiantV2 = editerEtudiantV2;
window.actionEtudiantV2 = actionEtudiantV2;
window.actionEtudiantV2Handler = actionEtudiantV2Handler;
window.remarqueEtudiantV2 = remarqueEtudiantV2;
window.remarqueEtudiantV2Handler = remarqueEtudiantV2Handler;
window.changerStatutEtudiantV2 = changerStatutEtudiantV2;
window.soumettreEtudiantV2 = soumettreEtudiantV2;
window.annulerEditionEtudiantV2 = annulerEditionEtudiantV2;
window.creerNouveauGroupeV2 = creerNouveauGroupeV2;
window.filtrerParGroupeV2 = filtrerParGroupeV2;
window.importerFichierEtudiantsV2 = importerFichierEtudiantsV2;
window.previsualiserDonneesV2 = previsualiserDonneesV2;
window.confirmerImportV2 = confirmerImportV2;
window.annulerImportV2 = annulerImportV2;
window.exporterEtudiantsV2 = exporterEtudiantsV2;
window.reinitialiserEtudiantsV2 = reinitialiserEtudiantsV2;
window.supprimerGroupeSelectionneV2 = supprimerGroupeSelectionneV2;
window.viderListeEtudiantsV2 = viderListeEtudiantsV2;
// Cadrage « Rencontres » (12 sept. 2026) : la lecture d'une liste collée, partagée avec rencontres.js.
window.decouperLigneCollee = decouperLigneCollee;
window.analyserListeEtudiantsCollee = analyserListeEtudiantsCollee;

})();
