/* ===============================
   MODULE: TRIMESTRE V2 — COURS
   Refactor étape 3 session B (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 118-1081 (zone 3 MODULES-MAP §2.4).

   Périmètre : CRUD cours + synthèses sidebar (cours, enseignant, groupe-étudiants,
   horaire, groupe-cours), formulaire cours, dropdown pratiques de notation,
   helper `setValue` partagé via `window.setValue` (consommé aussi par
   trimestre-v2-init.js et trimestre-v2-horaires.js — fix régression 22 mai 2026).

   Variable module-scope `coursEnEditionV2` migrée ici (consommée uniquement par
   les fonctions de la zone 3).

   Dépendances cross-module accédées via `window.X` (résidu trimestre-v2.js
   chargé AVANT ce fichier dans index.html) :
   - `window.populerDropdownsAssemblageV2` (hub résiduel)
   - `window.mettreAJourGuideGroupeCours` (helper transversal résiduel)
   - `window.mettreAJourFormatHoraire` (résidu, zone format horaire)
   - `window.chargerGroupesCoursV2` (extrait dans trimestre-v2-etudiants.js
     également en session B, chargé après ce fichier)
   =============================== */

(function() {
'use strict';

/* ===============================
   ACCORDÉON COURS
   =============================== */

/**
 * Charge la liste des cours dans le dropdown
 * Filtre par trimestre actif (Beta 95)
 */
function _tupleCoursNaturel(c) {
    const code = (c.codeCours || c.sigle || c.code || '').toString().trim().toUpperCase();
    if (!code) return null;
    const session = (c.session || '').toString().charAt(0).toUpperCase();
    const annee = (c.annee || '').toString().trim();
    if (!session || !annee) return code; // tuple dégradé (legacy minimal)
    return `${code}|${session}${annee}`;
}

function _migrerListeCoursVersCoursV2() {
    const anciensListeCours = db.getSync('listeCours', []);
    if (!Array.isArray(anciensListeCours) || anciensListeCours.length === 0) return;

    const coursExistants = db.getSync('cours', []);
    const tuplesV2 = new Map();
    coursExistants.forEach(c => {
        const t = _tupleCoursNaturel(c);
        if (t) tuplesV2.set(t, c);
    });
    const idsV2 = new Set(coursExistants.filter(c => c.id).map(c => c.id));

    const ajoutsLegacy = [];
    const doublonsIgnores = [];

    anciensListeCours.forEach(c => {
        const t = _tupleCoursNaturel(c);
        if (t && tuplesV2.has(t)) {
            doublonsIgnores.push({ tuple: t, legacyId: c.id, v2Id: tuplesV2.get(t).id });
        } else if (!t) {
            if (c.id && !idsV2.has(c.id)) ajoutsLegacy.push(c);
        } else {
            ajoutsLegacy.push(c);
            tuplesV2.set(t, c);
        }
    });

    if (ajoutsLegacy.length > 0) {
        db.setSync('cours', [...coursExistants, ...ajoutsLegacy]); // security-ok: cours legacy locaux, déjà persistés dans listeCours
        console.info(`[Migration listeCours] ${ajoutsLegacy.length} cours legacy fusionné(s) dans « cours »`);
    }
    db.setSync('listeCours', []); // security-ok: vidage clé legacy après migration

    if (doublonsIgnores.length > 0) {
        console.warn(
            `[Migration listeCours] ${doublonsIgnores.length} doublon(s) détecté(s) et ignoré(s) — V2 préservée`,
            doublonsIgnores
        );
        if (typeof notifications !== 'undefined' && notifications.info) {
            notifications.info(
                `Migration cours : ${doublonsIgnores.length} doublon(s) ignoré(s)`,
                'La version V2 a été préservée. Détails dans la console.'
            );
        }
    }
}

function chargerDropdownCoursV2() {
    const select = document.getElementById('v2-selectCours');
    if (!select) return;

    // Migration one-shot listeCours (legacy) → cours (canonique V2), fusion par tuple naturel
    _migrerListeCoursVersCoursV2();

    const tousCours = db.getSync('cours', []);
    const coursActif = db.getSync('infoCours', null);

    // Obtenir le trimestre actif
    const trimestreActifId = typeof obtenirTrimestreId === 'function' ? obtenirTrimestreId() : '';

    // Helper: dériver trimestreId depuis session+annee
    const deriverTrimestreId = (cours) => {
        if (!cours) return null;
        if (cours.trimestreId) return cours.trimestreId;
        if (cours.session && cours.annee) {
            // Gère les cas où session est "H" ou "A" (1 lettre)
            const s = cours.session.length === 1 ? cours.session.toLowerCase() : cours.session.charAt(0).toLowerCase();
            return s + cours.annee;
        }
        // Essayer de parser session combinée (ex: "H2026", "A2025")
        if (cours.session && /^[AH]\d{4}$/i.test(cours.session)) {
            return cours.session.toLowerCase();
        }
        return null;
    };

    // Helper: obtenir le texte d'affichage d'un cours
    // 🆕 BETA 95.2 : Le groupe ne fait plus partie du cours (entité indépendante)
    // 🆕 FIX (4 fév 2026) : Ajouter c.code pour compatibilité Primo
    const obtenirTexteCours = (c) => {
        const sigle = c.codeCours || c.sigle || c.code || c.numero || '';
        const titre = c.nomCours || c.titre || c.nom || '';
        const texte = `${sigle} ${titre}`.trim();
        return texte || `Cours ${c.id || 'sans identifiant'}`;
    };

    // Filtrer les cours par trimestre actif
    // Critères d'inclusion:
    // 1. trimestreId correspond exactement
    // 2. trimestreId dérivé (session+annee) correspond
    // 3. Pas de trimestreId ni session/annee (rétrocompatibilité)
    const coursFiltres = trimestreActifId
        ? tousCours.filter(c => {
            const trimestreDerive = deriverTrimestreId(c);
            const inclus = trimestreDerive === trimestreActifId || trimestreDerive === null;
            if (!inclus) {
            }
            return inclus;
        })
        : tousCours;

    select.innerHTML = '<option value="">Sélectionner un cours...</option>';

    // Déterminer le cours à sélectionner
    let coursAfficher = [...coursFiltres];
    let coursASelectionner = null;

    // Vérifier si infoCours correspond au trimestre actif
    const trimestreInfoCours = coursActif ? deriverTrimestreId(coursActif) : null;
    const infoCoursDansTrimestre = !trimestreActifId || trimestreInfoCours === trimestreActifId || trimestreInfoCours === null;

    if (coursActif && infoCoursDansTrimestre) {
        // infoCours est dans le bon trimestre
        if (!coursAfficher.find(c => c.id === coursActif.id)) {
            // Pas dans la liste, l'ajouter
            coursAfficher.unshift(coursActif);
        }
        coursASelectionner = coursActif;
    } else if (coursFiltres.length > 0) {
        // infoCours n'est pas dans le bon trimestre, utiliser le premier cours filtré
        coursASelectionner = coursFiltres[0];

        // Mettre à jour infoCours avec le bon cours
        db.setSync('infoCours', coursASelectionner);
    }

    if (coursAfficher.length === 0) {
        // Aucun cours disponible pour ce trimestre
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Aucun cours pour ce trimestre';
        option.disabled = true;
        select.appendChild(option);

        // IMPORTANT: Réinitialiser infoCours pour éviter d'afficher des données d'un autre trimestre
        db.setSync('infoCours', null);

        // Vider l'affichage des détails du cours
        viderAffichageCoursV2();

        // Cacher les boutons Modifier et Dupliquer
        const btnModifier = document.getElementById('v2-btnModifierCours');
        const btnDupliquer = document.getElementById('v2-btnDupliquerCours');
        if (btnModifier) btnModifier.classList.add('u-hide');
        if (btnDupliquer) btnDupliquer.classList.add('u-hide');
    } else {
        let coursSelectionne = false;

        coursAfficher.forEach((c, index) => {
            const option = document.createElement('option');
            option.value = c.id || `cours-${index}`;
            const texteBase = obtenirTexteCours(c);
            const estActif = coursActif && c.id === coursActif.id;
            option.textContent = estActif ? `${texteBase} (actif)` : texteBase;

            // Sélectionner le cours déterminé (coursASelectionner)
            if (coursASelectionner && c.id === coursASelectionner.id) {
                option.selected = true;
                coursSelectionne = true;
            }
            select.appendChild(option);
        });

        // Section Démo (Plan 1 Phase 2.4) : cours Labo Codex en lecture seule.
        // Skip en mode démo legacy : les cours démo sont déjà dans la clé globale,
        // pas de section séparée à afficher (sera retiré en Plan 1 Phase 5).
        const enDemoLegacy = typeof estEnModeDemo === 'function' && estEnModeDemo();
        if (!enDemoLegacy && typeof cleDemo === 'function' && typeof BibliothequeUI !== 'undefined') {
            const coursDemo = db.getSync(cleDemo('listeCours'), []) || [];
            BibliothequeUI.ajouterOptgroupDemo(select, coursDemo, obtenirTexteCours);
        }

        // Si aucun cours sélectionné mais qu'il y en a, sélectionner le premier
        if (!coursSelectionne && coursAfficher.length > 0) {
            select.options[1].selected = true;
            coursASelectionner = coursAfficher[0];
            coursSelectionne = true;
        }

        // Afficher le formulaire avec le cours sélectionné (Beta 95.2)
        if (coursSelectionne && coursASelectionner) {
            changerCoursSelectionneV2(coursASelectionner.id);
        }

        // Afficher les boutons Modifier et Dupliquer si un cours est sélectionné
        const btnModifier = document.getElementById('v2-btnModifierCours');
        const btnDupliquer = document.getElementById('v2-btnDupliquerCours');
        toggleDisplay(btnModifier, coursSelectionne);
        toggleDisplay(btnDupliquer, coursSelectionne);
    }
}

/**
 * Change le cours sélectionné
 */
function changerCoursSelectionneV2(coursId) {
    if (typeof coursId === 'object' && coursId && coursId.value !== undefined) coursId = coursId.value;
    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    const listeGroupes = document.getElementById('v2-listeGroupes');
    const btnSupprimer = document.getElementById('v2-btnSupprimerCours');

    if (!coursId) {
        // Afficher l'état vide
        if (etatVide) etatVide.classList.remove('u-hide');
        if (formulaire) formulaire.classList.add('u-hide');
        if (listeGroupes) listeGroupes.innerHTML = '<p class="text-muted">Sélectionne un cours pour voir ses groupes.</p>';
        if (btnSupprimer) btnSupprimer.classList.add('u-hide');
        afficherSyntheseCours(null);  // Beta 95.3 : vider la synthèse
        coursEnEditionV2 = null;
        _cacherBandeauEdition();
        _mettreAJourBoutonActiverCours(null);
        return;
    }

    // Charger les détails du cours
    const cours = db.getSync('cours', []);
    let coursSelectionne = cours.find(c => c.id === coursId);

    if (coursSelectionne) {
        // Afficher le formulaire en mode édition
        coursEnEditionV2 = coursId;
        _afficherBandeauEdition(coursSelectionne.codeCours || coursSelectionne.sigle || coursSelectionne.code);
        _mettreAJourBoutonActiverCours(coursId);
        if (etatVide) etatVide.classList.add('u-hide');
        if (formulaire) formulaire.classList.remove('u-hide');
        if (btnSupprimer) btnSupprimer.classList.remove('u-hide');

        // Mettre à jour le titre
        const titre = document.getElementById('v2-titreFormCours');
        const btnTexte = document.getElementById('v2-btnTexteCours');
        if (titre) titre.textContent = 'Modifier le cours';
        if (btnTexte) btnTexte.textContent = 'Enregistrer';

        // Remplir le formulaire
        remplirFormCoursV2(coursSelectionne);
        afficherSyntheseCours(coursSelectionne);  // Beta 95.3 : synthèse sidebar
        if (typeof window.chargerGroupesCoursV2 === 'function') {
            window.chargerGroupesCoursV2(coursId);
        }
    }
}

/**
 * Supprime le cours actuellement sélectionné
 * Beta 95.2 (8 jan 2026)
 */
function supprimerCoursV2() {
    if (!coursEnEditionV2) {
        console.warn('[Trimestre V2] Aucun cours sélectionné pour suppression');
        return;
    }

    // Chercher le cours dans la clé canonique
    let cours = db.getSync('cours', []);
    let coursObj = cours.find(c => c.id === coursEnEditionV2);

    if (!coursObj) {
        console.warn('[Trimestre V2] Cours non trouvé:', coursEnEditionV2);
        return;
    }

    // Confirmation
    // 🆕 FIX (4 fév 2026) : Priorité codeCours
    const nomCours = coursObj.codeCours || coursObj.sigle || coursObj.code || coursObj.id;
    const titreCours = coursObj.nomCours || coursObj.nom || coursObj.titre || '';
    if (!confirm(`Supprimer le cours "${nomCours} - ${titreCours}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Supprimer de la liste
    const coursFiltres = cours.filter(c => c.id !== coursEnEditionV2);
    db.setSync('cours', coursFiltres);

    // Nettoyer infoCours si le cours supprimé était le cours actif
    const coursActif = db.getSync('infoCours', null);
    if (coursActif && coursActif.id === coursEnEditionV2) {
        db.setSync('infoCours', null);
    }

    // Réinitialiser l'interface
    coursEnEditionV2 = null;
    _cacherBandeauEdition();
    _mettreAJourBoutonActiverCours(null);
    chargerDropdownCoursV2();

    // Masquer le bouton supprimer et afficher l'état vide
    const btnSupprimer = document.getElementById('v2-btnSupprimerCours');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    if (etatVide) etatVide.classList.remove('u-hide');
    if (formulaire) formulaire.classList.add('u-hide');

    // Notification
    notifications.succes('Cours supprimé', `${nomCours} - ${titreCours}`);

    // Beta 95.2: Rafraîchir le dropdown Cours dans la section Groupe-cours
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }
}

/**
 * Vide l'affichage du cours et du groupe d'étudiants
 * Appelé quand il n'y a aucun cours pour le trimestre actif
 */
function viderAffichageCoursV2() {

    // Vider l'aperçu du cours
    const apercuCours = document.getElementById('v2-apercuCours');
    if (apercuCours) {
        apercuCours.innerHTML = '<p class="text-muted">Sélectionne un cours pour voir ses détails.</p>';
    }

    // Vider les statistiques du groupe
    const nbEtudiants = document.getElementById('v2-nbEtudiantsTotal');
    if (nbEtudiants) nbEtudiants.textContent = '0';

    const groupeCoursElem = document.getElementById('v2-groupeCours');
    if (groupeCoursElem) groupeCoursElem.textContent = '—';

    // Vider la liste des étudiants
    const listeEtudiants = document.getElementById('v2-listeEtudiants');
    if (listeEtudiants) {
        listeEtudiants.innerHTML = '<p class="text-muted text-italic">Aucun cours sélectionné pour ce trimestre.</p>';
    }

    // Vider la liste des groupes
    const listeGroupes = document.getElementById('v2-listeGroupes');
    if (listeGroupes) {
        listeGroupes.innerHTML = '<p class="text-muted">Aucun cours sélectionné.</p>';
    }

    // Vider l'horaire
    const listeSeances = document.getElementById('v2-listeSeances');
    if (listeSeances) {
        listeSeances.innerHTML = '<p class="text-muted">Aucun cours sélectionné.</p>';
    }
}

/**
 * Affiche les détails d'un cours (aperçu)
 * 🆕 BETA 95.2 : Simplifié - affiche uniquement les informations du cours
 * (Enseignant, Horaire, Session sont dans leurs sections respectives)
 */
function afficherDetailsCoursV2(cours) {
    const conteneur = document.getElementById('v2-apercuCours');
    if (!conteneur) return;

    // Normaliser le sigle (codeCours, sigle, code ou numero)
    // 🆕 FIX (4 fév 2026) : Priorité codeCours, ajouter code pour Primo
    const sigle = cours.codeCours || cours.sigle || cours.code || cours.numero || '—';

    // Normaliser le nom du cours
    const nomCours = cours.titre || cours.nomCours || '—';

    // Discipline
    const discipline = cours.discipline || '—';

    // Compétence
    const competence = cours.competence || '—';
    const numeroCompetence = cours.numeroCompetence || '';

    // Éléments de compétence (afficher seulement si présents)
    const elementsCompetence = cours.elementsCompetence || '';

    conteneur.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
                <label class="text-muted">Code du cours</label>
                <div style="font-weight: 600; font-size: 1.1rem; color: var(--accent-primaire);">${sigle}</div>
            </div>
            <div>
                <label class="text-muted">Nom du cours</label>
                <div style="font-weight: 600;">${nomCours}</div>
            </div>
            <div>
                <label class="text-muted">Discipline</label>
                <div>${discipline}</div>
            </div>
            <div>
                <label class="text-muted">Compétence${numeroCompetence ? ` (${numeroCompetence})` : ''}</label>
                <div>${competence}</div>
            </div>
        </div>
        ${elementsCompetence ? `
        <div style="margin-top: 15px;">
            <label class="text-muted">Éléments de compétence</label>
            <div style="font-size: 0.9rem; white-space: pre-line;">${elementsCompetence}</div>
        </div>
        ` : ''}
    `;
}

// Variable pour stocker l'ID du cours en édition
let coursEnEditionV2 = null;

function _afficherBandeauEdition(codeCours) {
    const bandeau = document.getElementById('v2-bandeauModeEdition');
    const codeSpan = document.getElementById('v2-bandeauCodeCours');
    if (codeSpan) codeSpan.textContent = codeCours || '(sans code)';
    if (bandeau) bandeau.classList.remove('u-hide');
}

function _cacherBandeauEdition() {
    const bandeau = document.getElementById('v2-bandeauModeEdition');
    if (bandeau) bandeau.classList.add('u-hide');
}

function _mettreAJourBoutonActiverCours(coursId) {
    const btn = document.getElementById('v2-btnActiverCours');
    if (!btn) return;
    if (!coursId) {
        btn.classList.add('u-hide');
        return;
    }
    const infoCours = db.getSync('infoCours', null);
    const dejaActif = infoCours && infoCours.id === coursId;
    if (dejaActif) {
        btn.classList.add('u-hide');
    } else {
        btn.classList.remove('u-hide');
    }
}

function activerCoursV2() {
    if (!coursEnEditionV2) {
        console.warn('[Trimestre V2] Aucun cours sélectionné pour activation');
        return;
    }
    let tousLesCours = db.getSync('cours', []);
    const cible = tousLesCours.find(c => c.id === coursEnEditionV2);
    if (!cible) {
        console.warn('[Trimestre V2] Cours non trouvé pour activation:', coursEnEditionV2);
        return;
    }
    // Invariant single-active : ce cours actif, les autres non
    tousLesCours.forEach(c => { c.actif = (c.id === coursEnEditionV2); });
    db.setSync('cours', tousLesCours);
    db.setSync('infoCours', cible);

    notifications.succes('Cours activé', cible.codeCours || cible.nomCours || cible.id);

    _mettreAJourBoutonActiverCours(coursEnEditionV2);
    if (typeof chargerDropdownCoursV2 === 'function') chargerDropdownCoursV2();
    if (typeof window.peuplerDropdownGroupeCoursActif === 'function') {
        window.peuplerDropdownGroupeCoursActif();
    }
}

/**
 * Affiche le formulaire pour créer un nouveau cours
 */
async function afficherFormCoursV2() {
    await nouveauCoursV2();
}

/**
 * Crée un nouveau cours (affiche le formulaire vide)
 * 🆕 BETA 95.2
 */
async function nouveauCoursV2() {
    coursEnEditionV2 = null;
    _cacherBandeauEdition();
    _mettreAJourBoutonActiverCours(null);

    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    const titre = document.getElementById('v2-titreFormCours');
    const btnTexte = document.getElementById('v2-btnTexteCours');
    const selectCours = document.getElementById('v2-selectCours');

    // Désélectionner dans le dropdown
    if (selectCours) selectCours.value = '';

    // Afficher le formulaire
    if (etatVide) etatVide.classList.add('u-hide');
    if (formulaire) formulaire.classList.remove('u-hide');
    if (titre) titre.textContent = 'Nouveau cours';
    if (btnTexte) btnTexte.textContent = 'Enregistrer';

    // Réinitialiser tous les champs
    reinitialiserFormCoursV2();

    // Masquer le bouton Supprimer (mode création)
    const btnSupprimer = document.getElementById('v2-btnSupprimerCours');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

}

/**
 * Modifie le cours actuellement sélectionné
 */
async function modifierCoursSelectionneV2() {
    const selectCours = document.getElementById('v2-selectCours');
    const coursId = selectCours?.value;

    if (!coursId) {
        alert('Veuillez sélectionner un cours à modifier.');
        return;
    }

    // Trouver le cours
    const cours = db.getSync('cours', []);
    const coursSelectionne = cours.find(c => c.id === coursId) || db.getSync('infoCours', null);

    if (!coursSelectionne) {
        alert('Cours non trouvé.');
        return;
    }

    coursEnEditionV2 = coursId;
    _afficherBandeauEdition(coursSelectionne.codeCours || coursSelectionne.sigle || coursSelectionne.code);
    _mettreAJourBoutonActiverCours(coursId);

    const formulaire = document.getElementById('v2-formulaireCours');
    const apercu = document.getElementById('v2-apercuCours');
    const titre = document.getElementById('v2-titreFormCours');
    const btnTexte = document.getElementById('v2-btnTexteCours');

    if (formulaire) {
        formulaire.classList.remove('u-hide');
        if (apercu) apercu.classList.add('u-hide');
        if (titre) titre.textContent = 'Modifier le cours';
        if (btnTexte) btnTexte.textContent = 'Enregistrer';

        // ✅ AJOUT (2 jan 2026) : Charger le dropdown des pratiques AVANT de remplir
        await chargerDropdownPratiquesCours();

        // Remplir les champs avec les données du cours
        remplirFormCoursV2(coursSelectionne);

        // Afficher le bouton Supprimer (mode édition)
        const btnSupprimer = document.getElementById('v2-btnSupprimerCours');
        if (btnSupprimer) btnSupprimer.style.display = '';

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Duplique le cours actuellement sélectionné
 * Crée une copie avec un nouvel ID et ouvre le formulaire en mode création
 */
function dupliquerCoursSelectionneV2() {
    const selectCours = document.getElementById('v2-selectCours');
    const coursId = selectCours?.value;

    if (!coursId) {
        alert('Veuillez sélectionner un cours à dupliquer.');
        return;
    }

    // Trouver le cours
    const cours = db.getSync('cours', []);
    const coursSelectionne = cours.find(c => c.id === coursId) || db.getSync('infoCours', null);

    if (!coursSelectionne) {
        alert('Cours non trouvé.');
        return;
    }

    // Ouvrir le formulaire en mode création (pas d'édition)
    coursEnEditionV2 = null;
    _cacherBandeauEdition();
    _mettreAJourBoutonActiverCours(null);

    const formulaire = document.getElementById('v2-formulaireCours');
    const apercu = document.getElementById('v2-apercuCours');
    const titre = document.getElementById('v2-titreFormCours');
    const btnTexte = document.getElementById('v2-btnTexteCours');

    if (formulaire) {
        formulaire.classList.remove('u-hide');
        if (apercu) apercu.classList.add('u-hide');
        if (titre) titre.textContent = 'Dupliquer le cours';
        if (btnTexte) btnTexte.textContent = 'Créer la copie';

        // Remplir les champs avec les données du cours existant
        remplirFormCoursV2(coursSelectionne);

        // Modifier le nom pour indiquer que c'est une copie
        const nomCours = document.getElementById('v2-nomCours');
        if (nomCours && nomCours.value) {
            nomCours.value = nomCours.value + ' (copie)';
        }

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }

}

/**
 * Remplit le formulaire avec les données d'un cours
 * Gère différents formats de données (Beta 95)
 */
function _remplirChampsInfosCours(cours) {
    setValue('v2-codeCours', cours.codeCours || cours.sigle || cours.code || '');
    setValue('v2-nomCours', cours.titre || cours.nomCours || '');
    setValue('v2-numeroCompetence', cours.numeroCompetence || '');
    setValue('v2-competence', cours.competence || '');
    setValue('v2-disciplineCours', cours.discipline || '');
    setValue('v2-elementsCompetence', cours.elementsCompetence || '');
}

function _remplirChampsEnseignant(cours) {
    const enseignant = cours.enseignant || {};
    setValue('v2-prenomEnseignant', cours.prenomEnseignant || enseignant.prenom || '');
    setValue('v2-nomEnseignant', cours.nomEnseignant || enseignant.nom || '');
    setValue('v2-courrielEnseignant', cours.courriel || enseignant.courriel || '');
    setValue('v2-disciplineEnseignant', cours.discipline || enseignant.discipline || '');
    setValue('v2-departement', cours.departement || enseignant.departement || '');
    setValue('v2-institutionEnseignant', cours.institution || enseignant.institution || '');
}

function _remplirChampsSessionHoraire(cours) {
    setValue('v2-session', cours.session || 'H');
    setValue('v2-annee', cours.annee || new Date().getFullYear());
    const periodes = cours.periodesParSemaine || cours.heuresParSemaine || cours.heuresHebdo || 4;
    setValue('v2-periodesParSemaine', periodes);
    if (typeof window.mettreAJourFormatHoraire === 'function') {
        window.mettreAJourFormatHoraire();
    }
    setValue('v2-formatHoraire', cours.formatHoraire || '2x2');
}

function remplirFormCoursV2(cours) {
    _remplirChampsInfosCours(cours);
    _remplirChampsEnseignant(cours);
    _remplirChampsSessionHoraire(cours);
    setValue('v2-pratiqueIdCours', cours.pratiqueId || 'pan-standards');
}

/**
 * Affiche la synthèse du cours dans la sidebar (Beta 95.3)
 * Synthèse concise: nom, discipline, compétence
 */
function afficherSyntheseCours(cours) {
    const sidebar = document.getElementById('v2-apercuCoursSidebar');
    if (!sidebar) return;

    if (!cours) {
        sidebar.innerHTML = '<p class="etat-vide-resume">Aucun cours sélectionné</p>';
        return;
    }

    // 🆕 FIX (4 fév 2026) : Priorité codeCours
    const code = cours.codeCours || cours.sigle || cours.code || '';
    const nom = cours.nomCours || cours.titre || cours.nom || '';
    const discipline = cours.discipline || '—';
    const competence = cours.numeroCompetence || cours.competence || '—';

    const infoCours = db.getSync('infoCours', null);
    const estActif = infoCours && infoCours.id === cours.id;
    const badgeActif = estActif ? '<div class="apercu-badge-actif">Cours actif</div>' : '';

    sidebar.innerHTML = `
        ${badgeActif}
        <div class="apercu-titre">${echapperHtml(nom)}</div>
        <div class="apercu-code">${echapperHtml(code)}</div>
        <div class="apercu-detail">Discipline : ${echapperHtml(discipline)}</div>
        <div class="apercu-detail">Compétence : ${echapperHtml(competence)}</div>
    `;
}

/**
 * 🆕 Beta 95.3 : Synthèse Enseignant dans sidebar
 * Affiche : Prénom Nom, Courriel, Institution - Département
 */
function afficherSyntheseEnseignant(enseignant) {
    const elemNom = document.getElementById('enseignant-resume-nom');
    const elemCourriel = document.getElementById('enseignant-resume-courriel');
    const elemInstitution = document.getElementById('enseignant-resume-institution');

    if (!elemNom) return;

    if (!enseignant) {
        if (elemNom) elemNom.textContent = '—';
        if (elemCourriel) elemCourriel.textContent = '';
        if (elemInstitution) elemInstitution.textContent = '';
        return;
    }

    const nom = `${enseignant.prenom || ''} ${enseignant.nom || ''}`.trim() || '—';
    const courriel = enseignant.courriel || '';
    const institution = enseignant.institution || '';
    const departement = enseignant.departement || '';
    const instDept = [institution, departement].filter(Boolean).join(' — ');

    if (elemNom) elemNom.textContent = nom;
    if (elemCourriel) elemCourriel.textContent = courriel;
    if (elemInstitution) elemInstitution.textContent = instDept;
}

/**
 * 🆕 Beta 95.3 : Synthèse Groupe Étudiants dans sidebar
 * Affiche : X étudiants, Y en SA, Top programmes
 */
function afficherSyntheseGroupeEtudiants() {
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];

    // Mettre à jour les compteurs existants
    const elemTotal = document.getElementById('v2-resumeNbTotal');
    const elemNbTotal = document.getElementById('v2-nbEtudiantsTotal');
    const elemSA = document.getElementById('v2-resumeNbSA');
    const conteneurSA = document.getElementById('v2-resumeSA');
    const elemProgrammes = document.getElementById('v2-topProgrammes');

    const total = etudiants.length;
    const nbSA = etudiants.filter(e => e.sa === true || e.sa === 'oui' || e.sa === 'Oui' || e.SA === true).length;

    // Compter les programmes
    const programmes = {};
    etudiants.forEach(e => {
        const prog = e.programme || e.programmeEtudes || 'Non spécifié';
        programmes[prog] = (programmes[prog] || 0) + 1;
    });
    const topProgrammes = Object.entries(programmes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // Mettre à jour l'affichage
    if (elemTotal) elemTotal.textContent = total;
    if (elemNbTotal) elemNbTotal.textContent = total;

    if (conteneurSA) {
        toggleDisplay(conteneurSA, nbSA > 0);
        if (elemSA) elemSA.textContent = nbSA;
    }

    if (elemProgrammes) {
        if (topProgrammes.length > 0 && total > 0) {
            elemProgrammes.classList.remove('u-hide');
            elemProgrammes.innerHTML = '<strong style="font-size: 0.75rem;">Programmes :</strong><br>' +
                topProgrammes.map(([prog, nb]) => `<span style="font-size: 0.75rem;">${echapperHtml(prog)} (${nb})</span>`).join('<br>');
        } else {
            elemProgrammes.classList.add('u-hide');
        }
    }
}

/**
 * 🆕 Beta 95.3 : Synthèse Horaire dans sidebar
 * Affiche : X séances/sem, Y heures, Jours
 */
function afficherSyntheseHoraire(horaire) {
    const sidebar = document.getElementById('v2-carteResumeHoraire');
    if (!sidebar) return;

    if (!horaire || !horaire.seances || horaire.seances.length === 0) {
        sidebar.innerHTML = '<p class="etat-vide-resume">Aucun horaire sélectionné</p>';
        return;
    }

    const seances = horaire.seances || [];
    const nbSeances = seances.length;

    // Calculer les heures totales
    let totalMinutes = 0;
    const joursSet = new Set();
    const joursNoms = { 'lundi': 'Lun', 'mardi': 'Mar', 'mercredi': 'Mer', 'jeudi': 'Jeu', 'vendredi': 'Ven', 'samedi': 'Sam' };

    seances.forEach(s => {
        if (s.heureDebut && s.heureFin) {
            const [h1, m1] = s.heureDebut.split(':').map(Number);
            const [h2, m2] = s.heureFin.split(':').map(Number);
            totalMinutes += (h2 * 60 + m2) - (h1 * 60 + m1);
        }
        if (s.jour) {
            joursSet.add(joursNoms[s.jour.toLowerCase()] || s.jour.substring(0, 3));
        }
    });

    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const heuresStr = minutes > 0 ? `${heures}h${minutes}` : `${heures}h`;
    const joursStr = Array.from(joursSet).join(', ');

    sidebar.innerHTML = `
        <div class="apercu-titre">${horaire.nom || 'Horaire'}</div>
        <div class="apercu-detail">${nbSeances} séance${nbSeances > 1 ? 's' : ''}/sem. • ${heuresStr}</div>
        <div class="apercu-detail">Jours : ${joursStr || '—'}</div>
    `;
}

/**
 * 🆕 Beta 95.3 : Synthèse Groupe-cours dans sidebar
 * Affiche : Code cours - Groupe, Enseignant, Séances/étudiants, Pratique
 */
function afficherSyntheseGroupeCours(gc) {
    const sidebar = document.getElementById('v2-carteResumeGroupeCours');
    if (!sidebar) return;

    if (!gc) {
        sidebar.innerHTML = '<p class="etat-vide-resume">Aucun groupe-cours sélectionné</p>';
        return;
    }

    // Récupérer les entités liées
    const cours = db.getSync('cours', []);
    const enseignants = db.getSync('enseignants', []);
    // 🆕 FIX (1er fév 2026) : Utiliser cle() pour namespacing (horaires est dans CLES_NAMESPACEES)
    const cleHoraires = cle('horaires');
    const horaires = db.getSync(cleHoraires, []);
    const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);

    const coursInfo = cours.find(c => c.id === gc.coursId);
    const ens = enseignants.find(e => e.id === gc.enseignantId);
    const hor = horaires.find(h => h.id === gc.horaireId);
    const prat = pratiques.find(p => p.id === gc.pratiqueId);

    // Construire le libellé
    const codeCours = coursInfo?.codeCours || coursInfo?.sigle || null;
    const groupe = gc.groupe || gc.groupeNum || '00001';
    const titre = codeCours ? `${codeCours} — Groupe ${groupe}` : `Groupe ${groupe}`;

    const nomEns = ens ? `${ens.prenom || ''} ${ens.nom || ''}`.trim() : '—';
    const nbSeances = hor?.seances?.length || 0;
    const nomPratique = prat?.nom || gc.pratiqueId || '—';

    // Score de complétude
    const elements = [gc.coursId, gc.enseignantId, gc.horaireId, gc.pratiqueId, gc.groupe];
    const complets = elements.filter(Boolean).length;

    sidebar.innerHTML = `
        <div class="apercu-titre">${echapperHtml(titre)}</div>
        <div class="apercu-detail">${echapperHtml(nomEns)}</div>
        <div class="apercu-detail">${nbSeances} séance${nbSeances !== 1 ? 's' : ''}/sem.</div>
        <div class="apercu-detail">Pratique : ${echapperHtml(nomPratique)}</div>
        <div class="apercu-completude" style="font-size: 0.75rem; color: ${complets === 5 ? 'var(--vert-principal)' : 'var(--orange-principal)'}; margin-top: 5px;">
            ${complets}/5 éléments configurés
        </div>
    `;
}

/**
 * Réinitialise le formulaire cours
 * 🆕 FIX (1er fév 2026) : Utilise le trimestre actif pour session et année
 */
function reinitialiserFormCoursV2() {
    const champs = [
        'v2-codeCours', 'v2-nomCours', 'v2-numeroCompetence', 'v2-competence', 'v2-disciplineCours',
        'v2-elementsCompetence', 'v2-prenomEnseignant', 'v2-nomEnseignant', 'v2-courrielEnseignant',
        'v2-disciplineEnseignant', 'v2-departement', 'v2-institutionEnseignant'
    ];
    champs.forEach(id => setValue(id, ''));

    // 🆕 FIX (1er fév 2026) : Session et année depuis le trimestre actif
    // Corrige le bug où un cours pour A2025 était sauvegardé comme H2026
    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;
    let session = 'H';
    let annee = new Date().getFullYear();

    if (trimestreActif) {
        // Extraire session et année depuis l'ID du trimestre (ex: "a2025" → session="A", année=2025)
        const match = trimestreActif.id.match(/^([aeh])(\d{4})$/i);
        if (match) {
            session = match[1].toUpperCase();
            annee = parseInt(match[2]);
        } else if (trimestreActif.session && trimestreActif.annee) {
            // Fallback sur les propriétés du trimestre
            session = trimestreActif.session.charAt(0).toUpperCase();
            annee = trimestreActif.annee;
        }
    }

    setValue('v2-session', session);
    setValue('v2-annee', annee);
    // ✅ MODIFIÉ (6 jan 2026) : Périodes au lieu d'heures
    setValue('v2-periodesParSemaine', 4);
    if (typeof window.mettreAJourFormatHoraire === 'function') {
        window.mettreAJourFormatHoraire();
    }
    setValue('v2-formatHoraire', '2x2');
    // ✅ AJOUT (2 jan 2026) : Pratique par défaut
    setValue('v2-pratiqueIdCours', 'pan-standards');
}

/**
 * ✅ AJOUT (2 jan 2026) : Charge le dropdown des pratiques depuis la sidebar
 * Affiche les pratiques de pratiquesConfigurables (celles dans la sidebar)
 */
async function chargerDropdownPratiquesCours() {
    const select = document.getElementById('v2-pratiqueIdCours');
    if (!select) return;

    // Valeur actuelle pour la restaurer après le rechargement
    const valeurActuelle = select.value;

    // Option par défaut
    let html = '<option value="">-- Sélectionner une pratique --</option>';

    // Charger les pratiques depuis pratiquesConfigurables (même source que la sidebar)
    let pratiques = [];
    try {
        pratiques = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);
        // Filtrer les pratiques dans la bibliothèque (affichées dans la sidebar)
        pratiques = pratiques.filter(p => p.dansBibliotheque !== false);
    } catch (e) {
        console.warn('[trimestre-v2] Erreur chargement pratiques:', e);
    }

    // Ajouter les pratiques disponibles
    if (pratiques.length > 0) {
        pratiques.forEach(p => {
            const badge = p.pratiques?.[0] || p.type || '';
            const badgeHtml = badge ? `[${badge}] ` : '';
            html += `<option value="${echapperHtml(p.id)}">${badgeHtml}${p.nom || 'Sans titre'}</option>`;
        });
    } else {
        html += '<option value="" disabled>Aucune pratique configurée</option>';
        html += '<option value="" disabled>→ Ajouter via Construction > Pratiques de notation</option>';
    }

    select.innerHTML = html;

    // Restaurer la valeur précédente si elle existe encore
    if (valeurActuelle) {
        const optionExiste = Array.from(select.options).some(o => o.value === valeurActuelle);
        if (optionExiste) {
            select.value = valeurActuelle;
        }
    }

}

/**
 * Utilitaire pour définir la valeur d'un champ
 */
function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

/**
 * Annule le formulaire et revient à l'aperçu
 */
function annulerFormCoursV2() {
    coursEnEditionV2 = null;
    _cacherBandeauEdition();
    _mettreAJourBoutonActiverCours(null);

    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    const selectCours = document.getElementById('v2-selectCours');

    // Afficher l'état vide
    if (etatVide) etatVide.classList.remove('u-hide');
    if (formulaire) formulaire.classList.add('u-hide');

    // Désélectionner dans le dropdown
    if (selectCours) selectCours.value = '';

    reinitialiserFormCoursV2();
}

/**
 * Sauvegarde le cours (création ou modification)
 */
function _lireChampsInfosCoursDOM() {
    return {
        codeCours: document.getElementById('v2-codeCours')?.value?.trim(),
        nomCours: document.getElementById('v2-nomCours')?.value?.trim(),
        discipline: document.getElementById('v2-disciplineCours')?.value?.trim(),
        numeroCompetence: document.getElementById('v2-numeroCompetence')?.value?.trim() || '',
        competence: document.getElementById('v2-competence')?.value?.trim() || '',
        elementsCompetence: document.getElementById('v2-elementsCompetence')?.value?.trim() || ''
    };
}

function _lireChampsEnseignantDOM() {
    return {
        prenomEnseignant: document.getElementById('v2-prenomEnseignant')?.value?.trim() || '',
        nomEnseignant: document.getElementById('v2-nomEnseignant')?.value?.trim() || '',
        courriel: document.getElementById('v2-courrielEnseignant')?.value?.trim() || '',
        departement: document.getElementById('v2-departement')?.value?.trim() || '',
        institution: document.getElementById('v2-institutionEnseignant')?.value?.trim() || ''
    };
}

function _lireChampsSessionDOM() {
    return {
        session: document.getElementById('v2-session')?.value || 'H',
        annee: document.getElementById('v2-annee')?.value || new Date().getFullYear(),
        periodesParSemaine: parseInt(document.getElementById('v2-periodesParSemaine')?.value) || 4,
        formatHoraire: document.getElementById('v2-formatHoraire')?.value || '2x2',
        pratiqueId: document.getElementById('v2-pratiqueIdCours')?.value || 'pan-standards'
    };
}

function _lireDonneesFormCoursV2() {
    return {
        ..._lireChampsInfosCoursDOM(),
        ..._lireChampsEnseignantDOM(),
        ..._lireChampsSessionDOM()
    };
}

function _obtenirGroupeCoursExistant() {
    let groupe = '00001';
    if (coursEnEditionV2) {
        const coursListe = db.getSync('cours', []);
        const coursExistant = coursListe.find(c => c.id === coursEnEditionV2);
        if (coursExistant?.groupe) {
            groupe = String(coursExistant.groupe).padStart(5, '0');
        }
    }
    return groupe;
}

function _construireObjetCoursV2(d, groupe) {
    const trimestreId = `${d.session.toLowerCase()}${d.annee}`;
    return {
        id: coursEnEditionV2 || `${trimestreId}-${d.codeCours}-${groupe}`,
        sigle: d.codeCours,
        codeCours: d.codeCours,
        titre: d.nomCours,
        nomCours: d.nomCours,
        numeroCompetence: d.numeroCompetence,
        competence: d.competence,
        discipline: d.discipline,
        elementsCompetence: d.elementsCompetence,
        enseignant: {
            prenom: d.prenomEnseignant,
            nom: d.nomEnseignant,
            courriel: d.courriel,
            discipline: d.discipline,
            departement: d.departement,
            institution: d.institution
        },
        session: d.session,
        annee: d.annee,
        periodesParSemaine: d.periodesParSemaine,
        formatHoraire: d.formatHoraire,
        groupe: groupe,
        pratiqueId: d.pratiqueId
    };
}

function _persisterCoursV2(cours) {
    let tousLesCours = db.getSync('cours', []);
    if (coursEnEditionV2) {
        const index = tousLesCours.findIndex(c => c.id === coursEnEditionV2);
        if (index >= 0) {
            const actifPrecedent = tousLesCours[index].actif === true;
            tousLesCours[index] = { ...tousLesCours[index], ...cours, actif: actifPrecedent };
        } else {
            tousLesCours.push({ ...cours, actif: false });
        }
    } else {
        const estPremier = tousLesCours.length === 0;
        tousLesCours.push({ ...cours, actif: estPremier });
    }
    db.setSync('cours', tousLesCours);

    // Re-synchroniser infoCours si on a modifié le cours actuellement actif
    const infoCoursActuel = db.getSync('infoCours', null);
    if (coursEnEditionV2 && infoCoursActuel && infoCoursActuel.id === coursEnEditionV2) {
        const coursMaj = tousLesCours.find(c => c.id === coursEnEditionV2);
        if (coursMaj) db.setSync('infoCours', coursMaj);
    }

    // Auto-activation : uniquement le PREMIER cours créé.
    // Pour activer un autre cours après coup, utiliser le bouton « Activer ce cours ».
    if (!coursEnEditionV2 && tousLesCours.length === 1) {
        db.setSync('infoCours', tousLesCours[0]);
    }
}

function _postSauvegardeCoursV2(cours) {
    notifications.succes(coursEnEditionV2 ? 'Cours modifié avec succès' : 'Cours créé avec succès');
    annulerFormCoursV2();
    chargerDropdownCoursV2();
    const selectCours = document.getElementById('v2-selectCours');
    if (selectCours) {
        selectCours.value = cours.id;
        changerCoursSelectionneV2(cours.id);
    }
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }
    if (typeof window.mettreAJourGuideGroupeCours === 'function') {
        window.mettreAJourGuideGroupeCours();
    }
}

function sauvegarderCoursV2() {
    const d = _lireDonneesFormCoursV2();

    if (!d.codeCours) {
        alert('Veuillez renseigner le code du cours.');
        return;
    }
    if (!d.discipline) {
        alert('Veuillez renseigner la discipline.');
        return;
    }

    const groupe = _obtenirGroupeCoursExistant();
    const cours = _construireObjetCoursV2(d, groupe);
    _persisterCoursV2(cours);
    _postSauvegardeCoursV2(cours);
}

/**
 * Ouvre la modal pour créer un nouveau cours
 */
function ouvrirModalNouveauCours() {
    afficherFormCoursV2();
}

// Exports — 18 fonctions migrées du bloc exports résidu L3177-3194.
window.chargerDropdownCoursV2 = chargerDropdownCoursV2;
window.changerCoursSelectionneV2 = changerCoursSelectionneV2;
window.viderAffichageCoursV2 = viderAffichageCoursV2;
window.afficherDetailsCoursV2 = afficherDetailsCoursV2;
window.afficherFormCoursV2 = afficherFormCoursV2;
window.nouveauCoursV2 = nouveauCoursV2;
window.supprimerCoursV2 = supprimerCoursV2;
window.activerCoursV2 = activerCoursV2;
window.modifierCoursSelectionneV2 = modifierCoursSelectionneV2;
window.dupliquerCoursSelectionneV2 = dupliquerCoursSelectionneV2;
window.annulerFormCoursV2 = annulerFormCoursV2;
window.sauvegarderCoursV2 = sauvegarderCoursV2;
window.chargerDropdownPratiquesCours = chargerDropdownPratiquesCours;
window.afficherSyntheseCours = afficherSyntheseCours;
window.afficherSyntheseEnseignant = afficherSyntheseEnseignant;
window.afficherSyntheseGroupeEtudiants = afficherSyntheseGroupeEtudiants;
window.afficherSyntheseHoraire = afficherSyntheseHoraire;
window.afficherSyntheseGroupeCours = afficherSyntheseGroupeCours;
window.ouvrirModalNouveauCours = ouvrirModalNouveauCours;

// Helper partagé via window pour les autres sous-modules trimestre-v2-*
// (init.js, horaires.js) — sinon ReferenceError cross-IIFE.
// Régression silencieuse du refactor 17 mai 2026 corrigée 22 mai 2026.
window.setValue = setValue;

})();
