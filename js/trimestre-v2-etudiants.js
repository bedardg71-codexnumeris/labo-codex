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

/* ===============================
   RATTACHEMENT AU COURS (#887, 19 sept. 2026)
   Un élève appartient à un cours par `coursId` (modes.js, obtenirEtudiantsCoursActif). L'ajout et
   l'import le posaient depuis le cours actif sans le dire : Mathieu importait son 2e groupe « dans
   son 2e cours », les élèves rejoignaient le premier. La zone NOMME maintenant le cours, et
   l'import laisse en choisir un autre sur place — pour CET import seulement : `infoCours` n'est
   jamais écrit d'ici.
   =============================== */

/** Le code et le nom d'un cours, d'où qu'ils viennent : lu par la zone d'import ET par le menu Groupe. */
function _codeEtNomCoursV2(c) {
    return {
        code: (c && (c.codeCours || c.sigle || c.code)) || '',
        nom: (c && (c.nomCours || c.nom || c.titre)) || ''
    };
}

function _libelleCoursRattachementV2(c) {
    if (!c) return '';
    const { code, nom } = _codeEtNomCoursV2(c);
    return `${code} ${nom}`.trim() || `Cours ${c.id || 'sans identifiant'}`;
}

/**
 * Les cours offerts au rattachement : la bibliothèque `cours` (globale — la période vit dans le
 * groupe-cours, pas dans le cours), sans les cours de démonstration hors démo. Le cours actif y
 * figure toujours, même absent de la bibliothèque (`infoCours` est un miroir, cf. #916).
 * @returns {{actif: Object|null, cours: Array}}
 */
function _coursOffertsAuRattachementV2() {
    const infoCours = db.getSync('infoCours', null);
    const actif = infoCours && infoCours.id ? infoCours : null;
    const enDemo = typeof estEnModeDemo === 'function' && estEnModeDemo();
    const cours = (db.getSync('cours', []) || []).filter(c => c && c.id && (enDemo || !c.isDemo || (actif && c.id === actif.id)));
    if (actif && !cours.some(c => c.id === actif.id)) cours.unshift(actif);
    return { actif, cours };
}

/* ===============================
   UN GROUPE, C'EST UN NUMÉRO DANS UN COURS (#872, mécanisme B — 19 sept. 2026)
   Omnivox numérote les groupes PAR cours : deux cours portent chacun un « 00001 ». Le menu Groupe
   ne connaissait que le numéro — une seule entrée, élèves mêlés, et « Supprimer le groupe » qui
   emportait les deux. L'identité d'un groupe est le couple (coursId, numéro) : le menu porte une
   valeur composée, `getGroupeSelectionneV2` est son SEUL lecteur, et la liste, le compte, la
   suppression, « + Nouveau groupe » et le formulaire passent par lui. Rien n'est réécrit en base :
   une fiche sans `coursId` forme le groupe « sans cours » de son numéro.
   =============================== */

/** La valeur d'une entrée du menu. encodeURIComponent code aussi « | » : le couple se relit sans ambiguïté. */
function _valeurGroupeV2(coursId, groupe) {
    return encodeURIComponent(coursId || '') + '|' + encodeURIComponent(groupe || '');
}

/** @returns {{coursId: string, groupe: string}|null} null : « Tous les groupes », ou l'ancienne forme (numéro seul). */
function _lireValeurGroupeV2(valeur) {
    const v = String(valeur || '');
    const coupe = v.indexOf('|');
    if (coupe === -1) return null;
    try {
        return { coursId: decodeURIComponent(v.slice(0, coupe)), groupe: decodeURIComponent(v.slice(coupe + 1)) };
    } catch (e) {
        return null;
    }
}

/** La fiche est-elle du groupe choisi ? Le SEUL jugement d'appartenance de cet écran. */
function _ficheEstDuGroupeV2(e, sel) {
    return !!e && !!sel && String(e.coursId || '') === sel.coursId
        && normaliserNumeroGroupe(e.groupe) === sel.groupe;
}

/** Un cours par son id : la bibliothèque `cours` (globale), sinon le cours actif (miroir, cf. #916). */
function _coursParIdV2(coursId) {
    if (!coursId) return null;
    const trouve = (db.getSync('cours', []) || []).find(c => c && c.id === coursId);
    if (trouve) return trouve;
    const infoCours = db.getSync('infoCours', null);
    return infoCours && infoCours.id === coursId ? infoCours : null;
}

/**
 * Les libellés des groupes — mots de Grégoire (19 sept. 2026) : « 00001 · 601-101-MQ », « 00001 · sans
 * cours ». Le code seul (largeur du menu sur iPad) ; le nom s'ajoute quand deux cours de la liste
 * portent le même code. Un cours sans code est nommé ; un cours introuvable : « Cours <id> ».
 * @param {Array<{coursId: string, groupe: string}>} couples
 * @returns {Map<string, string>} valeur composée → libellé (sans les suffixes « (démo) » / « (vide) »)
 */
function _libellesGroupesV2(couples) {
    const parCours = new Map();
    couples.forEach(({ coursId }) => {
        if (coursId && !parCours.has(coursId)) parCours.set(coursId, _codeEtNomCoursV2(_coursParIdV2(coursId)));
    });
    const nbParCode = {};
    parCours.forEach(({ code }) => { if (code) nbParCode[code] = (nbParCode[code] || 0) + 1; });
    const libelles = new Map();
    couples.forEach(({ coursId, groupe }) => {
        let cours = 'sans cours';
        if (coursId) {
            const { code, nom } = parCours.get(coursId);
            cours = (code && nbParCode[code] > 1 ? `${code} ${nom}`.trim() : (code || nom)) || `Cours ${coursId}`;
        }
        libelles.set(_valeurGroupeV2(coursId, groupe), `${groupe} · ${cours}`);
    });
    return libelles;
}

/** Les couples (cours, numéro) que portent des fiches — une fiche sans numéro n'en forme aucun, comme avant. */
function _couplesDesFichesV2(etudiants) {
    const vus = new Map();
    (etudiants || []).forEach(e => {
        if (!e || !e.groupe) return;
        const couple = { coursId: String(e.coursId || ''), groupe: normaliserNumeroGroupe(e.groupe) };
        vus.set(_valeurGroupeV2(couple.coursId, couple.groupe), couple);
    });
    return vus;
}

/** Le libellé du groupe choisi, pour les phrases (suppression, liste vide, bouton). */
function _libelleGroupeChoisiV2(sel, etudiants) {
    const couples = _couplesDesFichesV2(etudiants);
    couples.set(_valeurGroupeV2(sel.coursId, sel.groupe), sel);
    return _libellesGroupesV2(Array.from(couples.values())).get(_valeurGroupeV2(sel.coursId, sel.groupe));
}

/**
 * La phrase au-dessus du formulaire. AJOUT : « un élève ajouté à la main l'est dans la liste qu'on
 * regarde » — le cours de l'entrée choisie au menu Groupe ; sous « Tous les groupes », le cours actif.
 * ÉDITION : la fiche GARDE son cours (#872 B — avant, l'enregistrer la rattachait au cours actif en
 * silence) ; la phrase dit le cours de la fiche.
 */
function rafraichirRattachementEtudiantsV2() {
    const phrase = document.getElementById('v2-ajoutRattachement');
    if (!phrase) return;
    if (etudiantEnEditionIndex >= 0) {
        const fiche = (db.getSync(cle('groupeEtudiants'), []) || []).find(e => e && e.da === etudiantEnEditionDA);
        const coursId = String((fiche && fiche.coursId) || '');
        phrase.textContent = coursId
            ? 'Rattaché·e à : ' + (_libelleCoursRattachementV2(_coursParIdV2(coursId)) || `Cours ${coursId}`)
            : 'Rattaché·e à aucun cours.';
        return;
    }
    const cours = _coursDeLAjoutV2();
    phrase.textContent = cours.id
        ? 'Sera rattaché·e à : ' + (_libelleCoursRattachementV2(_coursParIdV2(cours.id)) || `Cours ${cours.id}`)
        : (cours.duMenu
            ? 'L\'étudiant·e ne sera rattaché·e à aucun cours.'
            : 'Aucun cours actif : l\'étudiant·e ne sera rattaché·e à aucun cours.');
}

/** Le cours d'un AJOUT à la main : celui de l'entrée choisie au menu Groupe, sinon le cours actif. */
function _coursDeLAjoutV2() {
    const sel = getGroupeSelectionneV2();
    if (sel) return { id: sel.coursId, duMenu: true };
    const { actif } = _coursOffertsAuRattachementV2();
    return { id: actif ? actif.id : '', duMenu: false };
}

/** Le menu de la zone d'import : les cours offerts, le cours actif choisi au départ. */
function _peuplerMenuRattachementImportV2() {
    const bloc = document.getElementById('v2-importRattachement');
    const select = document.getElementById('v2-importCoursCible');
    const sansCours = document.getElementById('v2-importSansCours');
    if (!select) return;
    const { actif, cours } = _coursOffertsAuRattachementV2();
    let html = actif ? '' : '<option value="">Aucun cours</option>';
    cours.forEach(c => {
        const mention = actif && c.id === actif.id ? ' (cours actif)' : '';
        html += `<option value="${echapperHtml(c.id)}">${echapperHtml(_libelleCoursRattachementV2(c) + mention)}</option>`;
    });
    select.innerHTML = html;
    select.value = actif ? actif.id : '';
    // Un trimestre sans aucun cours : la zone le dit, et l'import reste possible (coursId vide).
    if (bloc) bloc.classList.toggle('u-hide', cours.length === 0);
    if (sansCours) sansCours.classList.toggle('u-hide', cours.length > 0);
}

/**
 * Le cours visé par CET import : la valeur du menu, si elle nomme un cours offert ; sinon le cours
 * actif (menu absent, vide ou périmé) ; sans cours actif, rien — l'option « Aucun cours ».
 */
function _coursCibleImportV2() {
    const { actif, cours } = _coursOffertsAuRattachementV2();
    const choisi = String(document.getElementById('v2-importCoursCible')?.value || '');
    return cours.find(c => c.id === choisi) || actif;
}

/* ===============================
   LE DA À L'IMPORT (décision de Grégoire, 19 sept. 2026 : même règle qu'au formulaire, #914)
   Une ligne dont le DA n'a pas sept chiffres, espaces retirés, n'est PAS importée : l'aperçu la
   marque, le bouton compte les autres, le message final la nomme. Un DA déjà dans la liste du
   trimestre, ou répété dans le collage, est ignoré comme avant (L-8, #749) — et l'aperçu le dit
   (« Déjà inscrit·e ce trimestre »),
   pour que le compte du bouton soit vrai.
   =============================== */

// Mot validé par Grégoire (19 sept. 2026, retouche de Cowork) : la vérification couvre tout le TRIMESTRE, tous
// cours confondus — « dans la liste » aurait fait croire à une erreur pour un·e élève inscrit·e à un autre cours.
// Constante unique : le jugement la pose, la confirmation la compte.
const MOTIF_IMPORT_DEJA_INSCRIT = 'Déjà inscrit·e ce trimestre';

/**
 * Juge chaque ligne collée contre la liste en base. Pure.
 * @returns {Array<{fiche: Object, motif: string}>} motif vide = la ligne sera importée
 */
function _jugerLignesImportV2(lignes, etudiantsPresents) {
    const dasPresents = new Set((etudiantsPresents || []).map(e => e && String(e.da)));
    return (lignes || []).map(ligne => {
        const da = String(ligne.da == null ? '' : ligne.da).replace(/\s+/g, '');
        const fiche = { ...ligne, da };
        if (!/^\d{7}$/.test(da)) return { fiche, motif: da ? 'DA invalide' : 'DA manquant' };
        if (dasPresents.has(da)) return { fiche, motif: MOTIF_IMPORT_DEJA_INSCRIT };
        dasPresents.add(da);
        return { fiche, motif: '' };
    });
}

/**
 * Charge et affiche la liste des étudiants dans l'accordéon v2
 * ✅ CORRECTION (9 jan 2026): Converti en async pour lire depuis IndexedDB (source de vérité)
 */
async function chargerListeEtudiantsV2() {
    const conteneur = document.getElementById('v2-listeEtudiants');
    const nbTotal = document.getElementById('v2-nbEtudiantsTotal');
    const actionsEtudiants = document.getElementById('v2-actionsEtudiants');

    if (!conteneur) return;

    // #887 : le formulaire d'ajout nomme le cours de rattachement.
    rafraichirRattachementEtudiantsV2();

    // Utiliser namespace cle() pour lire les données du trimestre actif
    const cleEtudiants = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Lire depuis IndexedDB pour éviter les données obsolètes de localStorage
    const tousLesEtudiants = await db.get(cleEtudiants) || [];

    // 🔍 DEBUG (9 jan 2026): Tracer la source des données

    // Mettre à jour le dropdown des groupes (avec tous les étudiants)
    populerDropdownGroupesV2(tousLesEtudiants);

    // Retour testeur du 18 sept. 2026 : la barre du haut n'était recalculée
    // qu'au démarrage et au changement de trimestre. Posé AVANT le retour
    // « liste vide » plus bas, pour que vider la liste décoche aussi l'étape.
    if (typeof window.mettreAJourBarreContexte === 'function') {
        window.mettreAJourBarreContexte();
    }

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
    // #872 B : l'entrée choisie est un couple (cours, numéro) — jamais le numéro seul.
    const groupeFiltre = getGroupeSelectionneV2();
    const libelleFiltre = groupeFiltre ? _libelleGroupeChoisiV2(groupeFiltre, tousLesEtudiants) : '';
    const etudiants = groupeFiltre
        ? tousLesEtudiants.filter(e => _ficheEstDuGroupeV2(e, groupeFiltre))
        : tousLesEtudiants;

    // Mettre à jour le compteur dans l'en-tête (total, pas filtré)
    if (nbTotal) nbTotal.textContent = formaterNbEtudiants(tousLesEtudiants.length);

    // Mettre à jour la carte résumé (avec les étudiants filtrés)
    mettreAJourResumeEtudiantsV2(etudiants);

    if (etudiants.length === 0) {
        const message = groupeFiltre
            ? `Aucun étudiant dans le groupe ${echapperHtml(libelleFiltre)}.`
            : 'Aucun étudiant. Utilise le formulaire ci-dessous ou l\'import plus bas.';
        conteneur.innerHTML = `<p class="etat-vide-liste">${message}</p>`;
        toggleDisplay(actionsEtudiants, tousLesEtudiants.length > 0);
        // Masquer le bouton supprimer groupe si pas d'étudiants
        const btnSupprimerGroupe = document.getElementById('v2-btnSupprimerGroupe');
        if (btnSupprimerGroupe) btnSupprimerGroupe.classList.add('u-hide');
        return;
    }

    if (actionsEtudiants) actionsEtudiants.classList.remove('u-hide');

    // #885 : le bouton reste visible dès qu'il y a des élèves. Caché sous « Tous les groupes »,
    // Mathieu ne l'a jamais vu et a retiré ses élèves un par un. Il nomme le groupe visé ; sans
    // groupe choisi, il renvoie au menu (supprimerGroupeSelectionneV2).
    const btnSupprimerGroupe = document.getElementById('v2-btnSupprimerGroupe');
    if (btnSupprimerGroupe) {
        toggleDisplay(btnSupprimerGroupe, true);
        btnSupprimerGroupe.textContent = groupeFiltre ? `Supprimer le groupe ${libelleFiltre}` : 'Supprimer un groupe…';
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
                        <!-- Mots de Grégoire (19 sept. 2026). La valeur reste vide : option neutre, pour que « Modifier » déclenche toujours change. -->
                        <option value="">Choisir…</option>
                        <option value="editer">Modifier</option>
                        <option value="supprimer">Supprimer</option>
                    </select>
                </td>
                <td style="text-align: center;">
                    <select class="controle-form controle-form-compact" data-on-change="remarqueEtudiantV2Handler" data-da="${echapperHtml(e.da)}">
                        <!-- Valeur vide = aucune remarque : la choisir efface le statut. -->
                        <option value=""${!statut ? ' selected' : ''}>Aucune</option>
                        <option value="inactif"${statut === 'inactif' ? ' selected' : ''}>Inactivité</option>
                        <option value="décrochage"${statut === 'décrochage' ? ' selected' : ''}>Décrochage</option>
                    </select>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    conteneur.innerHTML = html;
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
        // #872 B : un groupe est un couple (cours, numéro). Le cours n'est nommé que si le numéro
        // est porté par deux cours — partout ailleurs la carte se lit comme avant.
        const couples = _couplesDesFichesV2(etudiants);
        const libelles = _libellesGroupesV2(Array.from(couples.values()));
        const nbParNumero = {};
        couples.forEach(c => { nbParNumero[c.groupe] = (nbParNumero[c.groupe] || 0) + 1; });
        const groupesMap = {};
        etudiants.forEach(e => {
            let grp = 'Sans groupe';
            if (e.groupe) {
                const numero = normaliserNumeroGroupe(e.groupe);
                grp = nbParNumero[numero] > 1 ? libelles.get(_valeurGroupeV2(String(e.coursId || ''), numero)) : numero;
            }
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

    // #872 B : une entrée par couple (cours, numéro) — deux cours qui portent chacun un « 00001 »
    // donnent deux entrées.
    const couples = _couplesDesFichesV2(etudiants);

    // #872 : les groupes créés mais encore vides, du trimestre affiché seulement.
    const valeursAvecEleves = new Set(couples.keys());
    if (groupesEnAttenteV2.cle === cle('groupeEtudiants')) {
        groupesEnAttenteV2.groupes.forEach(v => {
            const couple = _lireValeurGroupeV2(v);
            if (couple && !couples.has(v)) couples.set(v, couple);
        });
    }

    const libelles = _libellesGroupesV2(Array.from(couples.values()));
    // Tri : par numéro, puis par libellé (donc par cours).
    const valeursTriees = Array.from(couples.keys()).sort((a, b) =>
        couples.get(a).groupe.localeCompare(couples.get(b).groupe) || libelles.get(a).localeCompare(libelles.get(b)));

    // Marqueur démo : un groupe est considéré démo si au moins un de ses
    // étudiants a isDemo=true. Cohérent avec le traitement des autres
    // sélecteurs latéraux (horaires, enseignants).
    const estGroupeDemo = (couple) => etudiants.some(e => _ficheEstDuGroupeV2(e, couple) && e.isDemo === true);

    // Reconstruire les options
    let html = '<option value="">Tous les groupes</option>';
    valeursTriees.forEach(v => {
        const suffixeDemo = estGroupeDemo(couples.get(v)) ? ' (démo)' : '';
        const suffixeVide = valeursAvecEleves.has(v) ? '' : ' (vide)';
        // #872 : le numéro vient de la 2e colonne importée, le code du cours d'une saisie — échappés
        // (echapperHtml tient aussi les guillemets depuis #572 : il sert la valeur de l'attribut
        // comme le texte).
        html += `<option value="${echapperHtml(v)}">${echapperHtml(libelles.get(v))}${suffixeDemo}${suffixeVide}</option>`;
    });
    select.innerHTML = html;

    // Restaurer la sélection : en priorité la valeur actuelle du DOM (évite
    // de casser une interaction en cours), sinon la valeur persistée par
    // trimestre (permet à entrerEnDemo de pré-sélectionner '0demo').
    if (valeurActuelle && couples.has(valeurActuelle)) {
        select.value = valeurActuelle;
    } else {
        select.value = _valeurDepuisPersisteeV2(db.getSync(cle('groupeSelectionne'), null), couples);
    }
}

/**
 * La valeur persistée → une entrée du menu. L'ANCIENNE forme (le numéro seul, dont le « 0demo »
 * qu'écrit entrerEnDemo) reste lue : elle choisit l'entrée de ce numéro si elle est UNIQUE ;
 * portée par deux cours, elle ne désigne plus personne — « Tous les groupes ». Rien n'est réécrit.
 */
function _valeurDepuisPersisteeV2(persistee, couples) {
    if (!persistee) return '';
    if (couples.has(persistee)) return persistee;
    if (_lireValeurGroupeV2(persistee)) return '';
    const candidates = Array.from(couples.keys()).filter(v => couples.get(v).groupe === normaliserNumeroGroupe(persistee));
    return candidates.length === 1 ? candidates[0] : '';
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
        if (champGroupe) champGroupe.value = getGroupeSelectionneV2()?.groupe || '';
    }
    await chargerListeEtudiantsV2();
}

/**
 * Le groupe choisi au menu : le couple (cours, numéro), ou null sous « Tous les groupes ».
 * #872 B : SEUL lecteur de la valeur du menu — personne ne compare plus le numéro seul.
 * @returns {{coursId: string, groupe: string}|null}
 */
function getGroupeSelectionneV2() {
    return _lireValeurGroupeV2(document.getElementById('v2-selectGroupe')?.value);
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
 * Lot E2 (D3) : un refus de vérification, par le témoin commun (« Non enregistré – ‹geste› :
 * ‹raison› »), au lieu d'un toast d'erreur.
 */
function _refuserEtudiantV2(phrase, geste) {
    if (window.temoinEnregistrement) {
        window.temoinEnregistrement.nonEnregistre(window.raisonPourTemoin(phrase), geste, cle('groupeEtudiants'));
    }
    return false;
}

/** Lot E2 : « le formulaire d'ajout porte une saisie » (ui-dialogues.js). Le groupe est prérempli : il ne compte pas. */
function etudiantEnAjoutSaisi() {
    if (etudiantEnEditionIndex >= 0) return false;
    return ['v2-etudiantDA', 'v2-etudiantNom', 'v2-etudiantPrenom', 'v2-etudiantProgramme', 'v2-etudiantDateArrivee']
        .some(id => String(document.getElementById(id)?.value || '').trim());
}
if (window.uiDialogues) window.uiDialogues.declarerFicheEnCreation('eleve', etudiantEnAjoutSaisi);

/**
 * Lot E2 (D3) — un champ d'une fiche EXISTANTE s'enregistre au changement, par le même
 * écrivain que l'ajout (mêmes vérifications : DA #914, doublon L-8, fiche retrouvée #382).
 * Dans le formulaire d'ajout, rien : c'est « Ajouter l'étudiant·e » qui écrit.
 */
async function sauvegarderChampEtudiantV2() {
    if (etudiantEnEditionIndex < 0) return false;
    return soumettreEtudiantV2();
}

/** Lot E2 (D3) : « Annuler » devient « Fermer » — retour au formulaire d'ajout. */
function fermerFicheEtudiantV2() {
    reinitialiserFormEtudiantV2();
}

/**
 * L'écrivain unique d'une fiche d'élève : « Ajouter l'étudiant·e » en ajout, chaque champ en
 * modification (lot E2, D3). Un refus parle par le témoin ; le message de l'ajout ne part
 * qu'après l'écriture ; une modification ne dit que « Enregistré » (le témoin).
 * @returns {Promise<boolean>} true si la fiche a été écrite
 */
async function soumettreEtudiantV2() {
    const edition = etudiantEnEditionIndex >= 0;
    const geste = edition ? 'Modifier l\'étudiant·e' : 'Ajouter l\'étudiant·e';
    let da = document.getElementById('v2-etudiantDA')?.value?.trim();
    let nom = document.getElementById('v2-etudiantNom')?.value?.trim();
    let prenom = document.getElementById('v2-etudiantPrenom')?.value?.trim();
    // Lot A de l'enregistrement : identité masquée en anonymisation (`editerEtudiantV2`) — les
    // champs vides à l'écran ne disent rien de la fiche : son DA, son nom et son prénom sont
    // réécrits tels qu'ils sont en base.
    const identiteMasquee = document.getElementById('v2-etudiantNom')?.dataset?.masqueAnonymisation === '1';
    // Lot E2 (décision de Grégoire, 28 sept. 2026) : le DA d'une fiche EXISTANTE ne se modifie pas — il
    // relie ses évaluations et ses présences. Il vient de la fiche, jamais du champ (en lecture seule).
    if (edition && etudiantEnEditionDA !== null) da = String(etudiantEnEditionDA).trim();
    if (identiteMasquee && etudiantEnEditionDA !== null) {
        const fiche = (db.getSync(cle('groupeEtudiants'), []) || []).find(e => e.da === etudiantEnEditionDA);
        if (fiche) { da = String(fiche.da).trim(); nom = fiche.nom; prenom = fiche.prenom; }
    }
    const programme = document.getElementById('v2-etudiantProgramme')?.value?.trim();
    const sa = document.getElementById('v2-etudiantSA')?.value;
    const caf = document.getElementById('v2-etudiantCAF')?.value;   // #792 : « Mesure d'aide »
    const groupeInput = document.getElementById('v2-etudiantGroupe')?.value?.trim();
    // #735 (lot D, 19 sept. 2026) : date d'arrivée FACULTATIVE, « AAAA-MM-JJ » (le format d'un champ date, et
    // celui des dates de présences). Vide : la clé n'est PAS écrite sur la fiche — une fiche sans date se lit
    // comme avant, et aucune fiche existante n'en reçoit une.
    const dateArriveeSaisie = document.getElementById('v2-etudiantDateArrivee')?.value || '';
    const dateArrivee = /^\d{4}-\d{2}-\d{2}$/.test(dateArriveeSaisie) ? dateArriveeSaisie : '';

    if (!nom || !prenom) {
        return _refuserEtudiantV2('Le nom et le prénom sont obligatoires.', geste);
    }

    // #914 (19 sept. 2026) — règle de Grégoire : « Aucune DA ne devrait être inventé de toute pièce dans
    // l'application. Il n'existe qu'un seul format, et c'est celui créé par le collège » : sept chiffres.
    // Avant, un DA vide devenait « DA » + horodatage, en silence — et en édition, un DA effacé à l'écran
    // changeait l'identifiant de l'élève (évaluations et présences orphelines). Le DA est jugé à la
    // CRÉATION ; en édition il ne change plus (lot E2, plus haut) : un DA déjà en base et non conforme
    // (« DEMO015 » du pack démo, stock d'avant) se garde tel quel, et sa fiche reste modifiable.
    const daInchange = etudiantEnEditionIndex >= 0 && etudiantEnEditionDA !== null
        && da === String(etudiantEnEditionDA).trim();
    if (!daInchange && !/^\d{7}$/.test(da || '')) {
        // La phrase commence par « Le » : le témoin met l'initiale en minuscule (« dA » sinon).
        return _refuserEtudiantV2('Le DA est ' + (da ? 'invalide' : 'manquant') +
            ' : c\'est celui du collège, sept chiffres, rien d\'autre.', geste);
    }

    const coursActif = db.getSync('infoCours', null);
    // L-9 (#749 lot 2) : padé À L'ÉCRITURE (« 1 » → « 00001 »), par la seule
    // normalisation partagée (modes.js) — les dix `padStart(5, '0')` de ce fichier
    // passent par elle aussi. Le stock déjà écrit en « 1 » n'est pas réécrit : les
    // lecteurs normalisent.
    const groupe = normaliserNumeroGroupe(groupeInput || coursActif?.groupe || '00001');

    const etudiant = {
        // #914 : inchangé en édition, le DA d'ORIGINE est réécrit tel qu'il est en base (type et
        // espaces compris) — la fusion ne touche pas à l'identifiant.
        da: daInchange ? etudiantEnEditionDA : da,
        nom: nom,
        prenom: prenom,
        groupe: groupe,
        programme: programme || '',
        sa: sa || '',
        caf: caf || ''
    };
    // #872 B : à l'AJOUT, l'élève rejoint le cours de l'entrée choisie au menu Groupe (« la liste
    // qu'on regarde »), sinon le cours actif. En ÉDITION, `coursId` n'est PAS dans l'objet : la
    // fusion garde celui de la fiche (absent compris). Avant, enregistrer une fiche la rattachait
    // au cours actif en silence — c'était le seul geste de l'écran qui déplaçait un élève.
    if (etudiantEnEditionIndex < 0) etudiant.coursId = _coursDeLAjoutV2().id;
    if (dateArrivee) etudiant.dateArrivee = dateArrivee;

    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Utiliser async pour persistance fiable
    // #522 lot 5 — la liste est relue DANS la file : le refus de #382 (« la
    // liste a changé depuis l'ouverture du formulaire ») portait sur un
    // instantané lu hors file, donc il pouvait laisser passer une modification
    // concurrente survenue APRÈS sa lecture.
    let introuvable = false;
    let daEnDouble = null;
    // Lot E2 : par le témoin commun (modifierEtAnnoncer relance un échec après l'avoir dit).
    try {
    await modifierEtAnnoncer(cleEtud, (lus) => {
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
            // #735 : la fusion garde les champs hors formulaire — une date d'arrivée EFFACÉE à l'écran
            // doit donc être retirée explicitement, sinon l'ancienne survivrait.
            if (!dateArrivee) delete etudiants[indexReel].dateArrivee;
        } else {
            // Mode ajout : ajouter un nouvel étudiant
            etudiants.push(etudiant);
        }

        return etudiants;
    }, [], { geste });
    } catch (e) { return false; }

    // Les messages vivent HORS du mutateur : la file ne porte que l'écriture.
    if (daEnDouble) {
        // Mots lus par les collègues — proposition Cowork du 11 sept., soumise à Grégoire ; lot E2 : par le témoin.
        return _refuserEtudiantV2('Ce DA est déjà dans le groupe : ' + _nomAfficheV2(daEnDouble) + '.', geste);
    }
    if (introuvable) {
        return _refuserEtudiantV2('Étudiant·e introuvable : la liste a changé depuis l\'ouverture du formulaire. Resélectionne l\'étudiant·e.', geste);
    }
    // Mots tranchés par Grégoire le 28 sept. (13 h 30), patron du lot : « Étudiant·e « … » ajouté·e. »
    if (!edition) notifications.succes(`Étudiant·e «\u00a0${_nomAfficheV2({ da: etudiant.da, prenom, nom })}\u00a0» ajouté·e.`);

    // #735 : l'assiduité se compte depuis la date d'arrivée — le magasin des indices A suit la fiche
    // (même producteur qu'après une saisie de présences ; il enchaîne C et P).
    if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
        try { calculerEtSauvegarderIndicesAssiduite(); } catch (e) { console.warn('[Étudiants] Recalcul de l\'assiduité impossible :', e); }
    }

    // Ajout : le formulaire revient à l'ajout suivant. Modification : la fiche reste ouverte (lot E2).
    if (!edition) reinitialiserFormEtudiantV2();
    chargerListeEtudiantsV2();
    return true;
}

function _anonymisationV2() {
    return typeof window.estModeAnonymisation === 'function' && window.estModeAnonymisation();
}

// Le nom d'une fiche tel que l'écran peut le dire : son pseudonyme en anonymisation.
function _nomAfficheV2(fiche) {
    if (_anonymisationV2()) return (typeof anonymiserNom === 'function' && anonymiserNom(fiche && fiche.da)) || '---';
    return (((fiche && fiche.prenom) || '') + ' ' + ((fiche && fiche.nom) || '')).trim();
}

// Lot A de l'enregistrement (26 sept. 2026) — les champs d'identité de la fiche, non modifiables
// et masqués en anonymisation. Le marqueur dit à `soumettreEtudiantV2` de reprendre la base.
const _CHAMPS_IDENTITE_V2 = { 'v2-etudiantDA': null, 'v2-etudiantNom': null, 'v2-etudiantPrenom': null };
function _masquerIdentiteV2(masquer) {
    Object.keys(_CHAMPS_IDENTITE_V2).forEach(id => {
        const champ = document.getElementById(id);
        if (!champ || !champ.dataset) return;
        if (!masquer && champ.dataset.masqueAnonymisation !== '1') return;   // rien à rendre
        if (_CHAMPS_IDENTITE_V2[id] === null) _CHAMPS_IDENTITE_V2[id] = champ.placeholder || '';
        champ.disabled = masquer;
        champ.placeholder = masquer ? window.MENTION_MASQUE_ANONYMISATION : _CHAMPS_IDENTITE_V2[id];
        if (masquer) champ.dataset.masqueAnonymisation = '1';
        else delete champ.dataset.masqueAnonymisation;
    });
}

/**
 * Lot E2 (décision de Grégoire, 28 sept. 2026) — le DA d'une fiche existante est en lecture seule,
 * et une phrase sous le champ dit pourquoi. `readOnly` (et non `disabled`, que tient l'anonymisation) :
 * le DA reste lisible et sélectionnable, jamais modifiable. L'écrivain, lui, ne lit plus le champ en
 * modification (soumettreEtudiantV2) : ni le clavier ni le formulaire ne changent le DA.
 */
function _verrouillerDAV2(verrouille) {
    const champ = document.getElementById('v2-etudiantDA');
    if (champ) champ.readOnly = !!verrouille;
    const aide = document.getElementById('v2-etudiantDAAide');
    if (aide && aide.classList) aide.classList[verrouille ? 'remove' : 'add']('u-hide');
    // #976 : « Corriger le DA… » sur une fiche existante — pas en anonymisation, où le DA ne se montre pas.
    const btn = document.getElementById('v2-btnCorrigerDA');
    if (btn && btn.classList) btn.classList[verrouille && !_anonymisationV2() ? 'remove' : 'add']('u-hide');
}

/**
 * #976 (lot 7 du chantier de l'enregistrement, 8 oct. 2026) — « Corriger le DA… » : tout ce
 * que porte l'ancien DA dans le trimestre actif passe sous le nouveau (`js/correction-da.js`).
 * Le codex est proposé d'abord (règle du 1er oct., même porte que les suppressions) ; la
 * fenêtre montre l'ancien DA, ce qui sera déplacé (compté par la passe à blanc) et la
 * portée ; le témoin dit l'issue. Une correction interrompue se reprend ici, vers le même DA.
 * Mots proposés, à Grégoire avant la release.
 * @returns {Promise<boolean>} true si le DA a été corrigé
 */
async function corrigerDAEtudiantV2() {
    const geste = 'Corriger le DA';
    if (etudiantEnEditionDA === null || _anonymisationV2() || !window.CorrectionDA) return false;
    const ancien = etudiantEnEditionDA;
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('corrigerDA'))) return false;
    const mesure = window.CorrectionDA.passeABlanc(ancien, '');
    if (!mesure.fiche) {
        return _refuserEtudiantV2('Étudiant·e introuvable : la liste a changé depuis l\'ouverture de la fiche.', geste);
    }
    const marque = mesure.fiche[window.CorrectionDA.MARQUE] || null;
    const c = mesure.comptes;
    const lignes = [
        'DA actuel : ' + String(ancien),
        '',
        'Passera sous le nouveau DA, dans ce trimestre seulement :',
        '• ' + c.evaluations + ' ' + pluriel(c.evaluations, 'évaluation', 'évaluations'),
        '• ' + c.presences + ' ' + pluriel(c.presences, 'présence', 'présences'),
        '• ' + c.copies + ' ' + pluriel(c.copies, 'copie', 'copies'),
        '• ' + c.resultats + ' ' + pluriel(c.resultats, 'résultat calculé', 'résultats calculés') + ' (indices, portfolio, interventions)',
        '',
        'Les autres trimestres et les archives gardent l\'ancien DA.'
    ];
    // Décision de Grégoire (8 oct., 14 h 50) : les trois globales suivent ; la fenêtre les compte quand il y en a.
    const hors = [];
    if (c.jetons) hors.push('• ' + c.jetons + ' ' + pluriel(c.jetons, 'jeton', 'jetons'));
    if (c.denotation) hors.push('• ' + c.denotation + ' ' + pluriel(c.denotation, 'jugement de dénotation', 'jugements de dénotation'));
    if (c.longitudinal) hors.push('• ' + c.longitudinal + ' ' + pluriel(c.longitudinal, 'entrée au suivi longitudinal', 'entrées au suivi longitudinal'));
    if (hors.length) lignes.push('', 'Suivent aussi :', ...hors);   // mots validés par Grégoire, 8 oct., 15 h 41
    if (marque) lignes.push('', 'Une correction vers ' + String(marque.vers) + ' s\'est arrêtée en chemin : ce DA la termine.');
    lignes.push('', 'Nouveau DA :');
    const saisie = await uiDialogues.demanderSaisie({
        titre: 'Corriger le DA de ' + _nomAfficheV2(mesure.fiche),
        message: lignes.join('\n'),
        preformate: true,
        valeurInitiale: marque ? String(marque.vers) : '',
        placeholder: '1234567',
        texteConfirmer: 'Corriger le DA'
    });
    if (saisie === null) return false;
    const nouveau = String(saisie).trim();
    const res = await window.CorrectionDA.corriger(ancien, nouveau, { geste });
    if (!res.ok) {
        if (res.refus) return _refuserEtudiantV2(res.refus, geste);
        if (window.temoinEnregistrement) window.temoinEnregistrement.nonEnregistre(res.raison, geste, cle('groupeEtudiants'));
        chargerListeEtudiantsV2();
        return false;
    }
    // La fiche reste ouverte, sous son nouveau DA.
    etudiantEnEditionDA = nouveau;
    const champ = document.getElementById('v2-etudiantDA');
    if (champ) champ.value = nouveau;
    chargerListeEtudiantsV2();
    return true;
}

/**
 * Passe en mode édition pour un étudiant
 * 🆕 FIX (4 fév 2026) : Utiliser DA au lieu de l'index pour éviter décalage avec liste filtrée
 */
async function editerEtudiantV2(da) {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('eleve'))) return;
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

    // Remplir le formulaire — en anonymisation, DA, nom et prénom restent vides et non modifiables
    // (lot A de l'enregistrement) : ni affichés, ni réécrits autrement que depuis la base.
    const masquer = _anonymisationV2();
    document.getElementById('v2-etudiantDA').value = masquer ? '' : (etudiant.da || '');
    document.getElementById('v2-etudiantNom').value = masquer ? '' : (etudiant.nom || '');
    document.getElementById('v2-etudiantPrenom').value = masquer ? '' : (etudiant.prenom || '');
    _masquerIdentiteV2(masquer);
    _verrouillerDAV2(true);
    document.getElementById('v2-etudiantGroupe').value = etudiant.groupe || '';
    document.getElementById('v2-etudiantProgramme').value = etudiant.programme || '';
    document.getElementById('v2-etudiantSA').value = etudiant.sa || '';
    document.getElementById('v2-etudiantCAF').value = etudiant.caf || '';
    const champDateArriveeEdition = document.getElementById('v2-etudiantDateArrivee');
    if (champDateArriveeEdition) champDateArriveeEdition.value = etudiant.dateArrivee || '';   // #735

    // Changer l'apparence du formulaire
    const titre = document.getElementById('v2-formEtudiantTitre');
    const btnSoumettre = document.getElementById('v2-btnSoumettreEtudiant');
    const btnAnnuler = document.getElementById('v2-btnAnnulerEdition');
    const formContainer = document.getElementById('v2-formEtudiant');

    if (titre) titre.textContent = 'Modifier l\'étudiant·e';
    // Lot E2 (D3) : une fiche existante s'enregistre toute seule — plus de bouton « Enregistrer
    // les modifications » ; « Fermer » (ex-« Annuler ») ramène au formulaire d'ajout.
    if (btnSoumettre) btnSoumettre.classList.add('u-hide');
    if (btnAnnuler) btnAnnuler.classList.remove('u-hide');
    if (formContainer) formContainer.classList.add('mode-edition');
    rafraichirRattachementEtudiantsV2();   // #872 B : la phrase dit le cours de LA FICHE

    // Scroller vers le formulaire
    formContainer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Réinitialise le formulaire en mode ajout
 */
function reinitialiserFormEtudiantV2() {
    etudiantEnEditionIndex = -1;
    etudiantEnEditionDA = null; // #382

    // Vider les champs
    _masquerIdentiteV2(false);
    _verrouillerDAV2(false);
    document.getElementById('v2-etudiantDA').value = '';
    document.getElementById('v2-etudiantNom').value = '';
    document.getElementById('v2-etudiantPrenom').value = '';
    // #872 : après un ajout, l'élève suivant va dans le MÊME groupe (celui du menu), pas dans le
    // groupe du cours actif. « Tous les groupes » laisse le champ vide, comme avant.
    document.getElementById('v2-etudiantGroupe').value = getGroupeSelectionneV2()?.groupe || '';
    document.getElementById('v2-etudiantProgramme').value = '';
    document.getElementById('v2-etudiantSA').value = '';
    document.getElementById('v2-etudiantCAF').value = '';
    const champDateArriveeVide = document.getElementById('v2-etudiantDateArrivee');
    if (champDateArriveeVide) champDateArriveeVide.value = '';   // #735

    // Remettre l'apparence normale
    const titre = document.getElementById('v2-formEtudiantTitre');
    const btnSoumettre = document.getElementById('v2-btnSoumettreEtudiant');
    const btnAnnuler = document.getElementById('v2-btnAnnulerEdition');
    const formContainer = document.getElementById('v2-formEtudiant');

    if (titre) titre.textContent = 'Ajouter un·e étudiant·e';
    if (btnSoumettre) btnSoumettre.classList.remove('u-hide');
    if (btnAnnuler) btnAnnuler.classList.add('u-hide');
    if (formContainer) formContainer.classList.remove('mode-edition');
    rafraichirRattachementEtudiantsV2();   // #872 B : retour à la phrase de l'ajout
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

    // #872 B : le groupe naît dans le COURS ACTIF, et son numéro se juge dans ce cours — le cours B
    // peut avoir son « 00001 » même si le cours A en a un (Mathieu : « un groupe par cours »).
    const coursIdDuGroupe = _coursOffertsAuRattachementV2().actif?.id || '';

    // Numéros déjà pris DANS CE COURS : ceux que portent des élèves, et ceux des groupes créés encore vides
    const groupesExistants = new Set();
    etudiants.forEach(e => {
        if (e.groupe && String(e.coursId || '') === coursIdDuGroupe) {
            const num = parseInt(e.groupe, 10);
            if (!isNaN(num)) groupesExistants.add(num);
        }
    });
    groupesEnAttenteV2.groupes.forEach(v => {
        const couple = _lireValeurGroupeV2(v);
        if (couple && couple.coursId === coursIdDuGroupe) groupesExistants.add(parseInt(couple.groupe, 10));
    });

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
    const valeurFinale = _valeurGroupeV2(coursIdDuGroupe, groupeFinal);
    groupesEnAttenteV2.groupes.add(valeurFinale);
    db.setSync(cle('groupeSelectionne'), valeurFinale);

    // Réinitialiser le formulaire et pré-remplir le groupe
    reinitialiserFormEtudiantV2();
    document.getElementById('v2-etudiantGroupe').value = groupeFinal;

    // Ajouter l'option au dropdown si elle n'existe pas et la sélectionner
    const select = document.getElementById('v2-selectGroupe');
    if (select) {
        // Vérifier si l'option existe déjà
        let optionExiste = false;
        for (let opt of select.options) {
            if (opt.value === valeurFinale) {
                optionExiste = true;
                break;
            }
        }
        if (!optionExiste) {
            // Option provisoire : chargerListeEtudiantsV2, juste dessous, reconstruit le menu et son libellé.
            const newOption = document.createElement('option');
            newOption.value = valeurFinale;
            newOption.textContent = groupeFinal;
            select.appendChild(newOption);
        }
        select.value = valeurFinale;
        // Rafraîchir l'affichage pour montrer le groupe vide
        await chargerListeEtudiantsV2();
    }

    // Focus sur le premier champ
    document.getElementById('v2-etudiantDA')?.focus();

    notifications.succes(`Groupe ${_libelleGroupeChoisiV2({ coursId: coursIdDuGroupe, groupe: groupeFinal }, etudiants)} prêt. Ajoute des étudiants.`);
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

    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (index !== -1 && typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('eleve'))) return;
    if (index === -1 || !confirm(`Supprimer ${_nomAfficheV2(etudiant)} ?`)) return;

    // Lot E2 : par le témoin commun ; rien d'autre ne change à la suppression.
    let supprime = false;
    try {
        await modifierEtAnnoncer(cleEtud, (lus) => {
            const liste = lus || [];
            const i = liste.findIndex(e => e.da === da);
            if (i === -1) return undefined;
            liste.splice(i, 1);
            supprime = true;
            return liste;
        }, [], { geste: 'Supprimer l\'étudiant·e' });
    } catch (e) { return; }

    // #1012, l'élève désinscrit (décision de Grégoire, 2 oct. 2026) : supprimer, c'est
    // désinscrire ; on garde son DA pour qu'un ancien fichier ne le ramène pas (l'import par
    // cases lit cette trace). Seul ce geste l'écrit : le décrochage et l'inactivité sont des
    // statuts, l'élève reste dans la liste. `db` n'écrit pas deux clés d'un seul geste : la
    // trace suit la fiche ; si elle échoue, le témoin le dit et l'import fait comme avant.
    if (supprime) {
        try {
            await modifierEtAnnoncer(cle('elevesDesinscrits'), (lus) => {
                const trace = Array.isArray(lus) ? lus : [];
                const date = new Date().toISOString();
                const deja = trace.find(t => t && String(t.da) === String(da));
                if (deja) deja.date = date;
                else trace.push({ da: da, date: date });
                return trace;
            }, [], { geste: 'Supprimer l\'étudiant·e', discret: true });
        } catch (e) { /* le témoin l'a dit */ }
    }

    chargerListeEtudiantsV2();

    if (supprime) notifications.succes('Étudiant supprimé');
}

/**
 * Dispatch des actions du select étudiant (Éditer, Supprimer, Inactivité, Décrochage, Réactiver)
 */
function actionEtudiantV2(selectElement, da) {
    var action = selectElement.value;
    selectElement.value = ''; // Réinitialiser le select

    if (!action) return;

    // Lot A de l'enregistrement (26 sept. 2026) : plus de refus en anonymisation. Le formulaire
    // masque l'identité (`editerEtudiantV2`), la question de suppression nomme le pseudonyme.

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
    var nomComplet = _nomAfficheV2(etudiant);

    if (nouveauStatut === 'inactif') {
        if (!confirm('Marquer ' + nomComplet.trim() + ' comme inactif ?\n\nSes résultats seront affichés jusqu\'à sa dernière présence, mais ne seront plus comptés dans les calculs du groupe.')) return;
    } else if (nouveauStatut === 'décrochage') {
        if (!confirm('Marquer ' + nomComplet.trim() + ' en décrochage ?\n\nSes résultats seront affichés jusqu\'à sa dernière présence, mais ne seront plus comptés dans les calculs du groupe.')) return;
    }

    // Lot E2 : par le témoin commun ; le message du geste ne part qu'après l'écriture.
    try {
        await modifierEtAnnoncer(cleEtud, function(lus) {
            var liste = lus || [];
            var i = liste.findIndex(function(e) { return e.da === da; });
            if (i === -1) return undefined;
            liste[i].statut = nouveauStatut;
            return liste;
        }, [], { geste: 'Modifier l\'étudiant·e' });
    } catch (e) { return; }

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
    const donnees = document.getElementById('v2-donneesCollees')?.value || '';
    if (!donnees.trim()) {
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
    // DA à l'import (19 sept. 2026) : pas de `trim()` sur le collage entier — il avalait la tabulation de tête
    // d'une PREMIÈRE ligne sans DA, ses colonnes glissaient d'un cran et la ligne écartée était mal nommée.
    String(contenu || '').split('\n').forEach(ligne => {
        if (!ligne.trim()) return;
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
        const jugees = _jugerLignesImportV2(donneesImportEnAttenteV2, db.getSync(cle('groupeEtudiants'), []));
        const nbAImporter = jugees.filter(j => !j.motif).length;
        const nbEcartees = jugees.length - nbAImporter;

        let html = `
            <table class="tableau-blanc" style="width: 100%; font-size: 0.85rem;">
                <thead>
                    <tr>
                        <th>DA</th><th>Groupe</th><th>Nom</th><th>Prénom</th><th>Programme</th><th>SA</th><th>À l'import</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // #923 — règle de sécurité n° 1 : tout ce qui vient du collage est échappé avant d'entrer
        // dans l'aperçu (la liste dessinée après l'import l'était déjà).
        jugees.forEach(({ fiche: e, motif }) => {
            const groupe = e.groupe ? normaliserNumeroGroupe(e.groupe) : '—';
            html += `
                <tr${motif ? ' class="ligne-import-ecartee"' : ''}>
                    <td>${echapperHtml(e.da)}</td><td>${echapperHtml(groupe)}</td><td>${echapperHtml(e.nom)}</td><td>${echapperHtml(e.prenom)}</td><td>${echapperHtml(e.programme)}</td><td>${echapperHtml(e.sa)}</td><td>${motif ? '<strong>' + echapperHtml(motif) + '</strong>' : ''}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        previewTable.innerHTML = html;

        const noteEcartees = document.getElementById('v2-importLignesEcartees');
        if (noteEcartees) {
            noteEcartees.textContent = nbEcartees > 0
                ? `${nbEcartees} ${pluriel(nbEcartees, 'ligne ne sera pas importée', 'lignes ne seront pas importées')}. Le DA est celui du collège : sept chiffres, rien d'autre.`
                : '';
            noteEcartees.classList.toggle('u-hide', nbEcartees === 0);
        }
        const btnConfirmer = document.getElementById('v2-btnConfirmerImport');
        if (btnConfirmer) {
            btnConfirmer.textContent = nbAImporter > 0 ? `Importer ${formaterNbEtudiants(nbAImporter)}` : 'Aucune ligne à importer';
            btnConfirmer.disabled = nbAImporter === 0;
        }

        _peuplerMenuRattachementImportV2();
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

    // #887 : le cours visé est celui que la zone NOMME (menu), pas le cours actif en silence.
    // `infoCours` n'est pas écrit : choisir une cible ne change pas d'écran actif.
    const coursCible = _coursCibleImportV2();
    // ✅ CORRECTION (31 déc 2025): Utiliser namespace
    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Lire depuis IndexedDB pour avoir les données complètes
    // #522 lot 5 — la liste est relue DANS la file, et les lignes y sont REJUGÉES : l'aperçu a pu
    // vieillir. security-ok: seules les lignes au DA de sept chiffres entrent ; `coursId` vient
    // d'un cours offert par le menu.
    // L-8 (#749 lot 2) : un DA déjà présent dans le groupe n'est PAS dupliqué — il est
    // ignoré et compté ; la fiche existante ne bouge pas (réimporter le même fichier
    // n'ajoute rien). Les doublons INTERNES au fichier sont écartés de la même façon.
    let nbAjoutes = 0;
    let nbDejaPresents = 0;
    let ecartees = [];
    // Lot E2 : par le témoin commun ; le compte rendu de l'import ne part qu'après l'écriture.
    try {
    await modifierEtAnnoncer(cleEtud, (lus) => {
        const etudiants = lus || [];
        nbAjoutes = 0; nbDejaPresents = 0; ecartees = [];

        _jugerLignesImportV2(donneesImportEnAttenteV2, etudiants).forEach(({ fiche, motif }) => {
            if (motif === MOTIF_IMPORT_DEJA_INSCRIT) { nbDejaPresents++; return; }
            if (motif) { ecartees.push({ fiche, motif }); return; }
            etudiants.push({
                ...fiche,
                coursId: coursCible?.id || ''
            });
            nbAjoutes++;
        });

        // Rien à écrire : le mutateur rend `undefined`, aucune écriture.
        return nbAjoutes > 0 ? etudiants : undefined;
    }, [], { geste: 'Importer la liste' });
    } catch (e) { return; }

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

    // Mots lus par les collègues — proposition Cowork du 11 sept., soumise à Grégoire ; le cours
    // nommé et les lignes écartées : proposition du 19 sept. (#887, DA à l'import).
    const message = `${nbImportes} étudiant·e${nbImportes > 1 ? 's' : ''} ajouté·e${nbImportes > 1 ? 's' : ''}`
        + (nbImportes > 0 && coursCible ? ` à ${_libelleCoursRattachementV2(coursCible)}` : '')
        + (nbDejaPresents > 0 ? `, ${nbDejaPresents} déjà présent·e${nbDejaPresents > 1 ? 's' : ''} (ignoré·e${nbDejaPresents > 1 ? 's' : ''})` : '')
        + ` — ${verification} au total dans le groupe`;
    if (ecartees.length === 0) {
        notifications.succes(message);
        return;
    }
    // Les lignes écartées sont NOMMÉES : l'enseignant·e sait qui reste à ajouter à la main.
    const NB_NOMMEES = 8;
    const nommees = ecartees.slice(0, NB_NOMMEES).map(({ fiche, motif }) =>
        `${(fiche.nom + ' ' + fiche.prenom).trim() || 'ligne sans nom'} (${motif})`).join(', ');
    const reste = ecartees.length - NB_NOMMEES;
    const details = `${ecartees.length} ${pluriel(ecartees.length, 'ligne écartée', 'lignes écartées')} : ${nommees}`
        + (reste > 0 ? `, et ${reste} ${pluriel(reste, 'autre', 'autres')}` : '') + '.';
    if (nbImportes > 0) notifications.warning(message, details);
    else notifications.erreur('Aucun·e étudiant·e importé·e', details);
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
 * #1007 (2 oct. 2026) : avant « Vider la liste » et « Supprimer un groupe… », un codex à part
 * (`Codex.ecrireAPartAvantSuppression`). Module du codex absent : false, rien n'est supprimé.
 * @returns {Promise<boolean>} true seulement si le codex à part est écrit
 */
async function _codexAPartAvantSuppressionEtudiants(premierePhrase) {
    if (typeof Codex === 'undefined' || !Codex || typeof Codex.ecrireAPartAvantSuppression !== 'function') return false;
    return await Codex.ecrireAPartAvantSuppression(premierePhrase);
}

/** « tes 12 étudiant·es » / « ton étudiant·e » ; `ses`/`son` pour un groupe. */
function _sesEtudiantsV2(n, possessifs) {
    return n === 1 ? possessifs[0] + ' étudiant·e' : possessifs[1] + ' ' + n + ' étudiant·es';
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
    // #1007 : le codex à part d'abord ; la confirmation ensuite, telle qu'avant.
    if (!(await _codexAPartAvantSuppressionEtudiants(
        `Vider la liste efface pour de bon toute la liste : ${_sesEtudiantsV2(etudiants.length, ['ton', 'tes'])}, de tous les groupes.`
    ))) return;
    if (!confirm(`Supprimer les ${etudiants.length} étudiant(s) ? Cette action est irréversible.`)) return;

    // Lot E2 : par le témoin commun ; le message ne part qu'après l'écriture.
    try {
        await modifierEtAnnoncer(cleEtud, () => [], [], { geste: 'Vider la liste' });
    } catch (e) { return; }
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

    // Compter les étudiants du groupe — #872 B : le couple (cours, numéro), jamais le numéro seul.
    const etudiantsDuGroupe = tousLesEtudiants.filter(e => _ficheEstDuGroupeV2(e, groupeSelectionne));
    const libelleGroupe = _libelleGroupeChoisiV2(groupeSelectionne, tousLesEtudiants);

    if (etudiantsDuGroupe.length === 0) {
        notifications.erreur('Aucun étudiant dans ce groupe.');
        return;
    }

    // #872 B : la question nomme le groupe par son libellé (numéro ET cours). Le « 00001 » d'un
    // autre cours n'est pas touché — la mention « répartis dans N cours » de #885 n'a plus d'objet.
    // #1007 : le codex à part d'abord ; la confirmation ensuite, telle qu'avant.
    if (!(await _codexAPartAvantSuppressionEtudiants(
        `Supprimer le groupe « ${libelleGroupe} » efface pour de bon ${_sesEtudiantsV2(etudiantsDuGroupe.length, ['son', 'ses'])}.`
    ))) return;
    if (!confirm(`Supprimer les ${etudiantsDuGroupe.length} étudiant(s) du groupe ${libelleGroupe} ? Cette action est irréversible.`)) {
        return;
    }

    // Garder uniquement les étudiants des autres groupes. ⚠ Le filtre est
    // rejoué DANS la file : la liste d'avant la confirmation ne vaut plus rien,
    // et un étudiant ajouté pendant la question serait sinon effacé.
    // Lot E2 : par le témoin commun ; le message ne part qu'après l'écriture.
    try {
        await modifierEtAnnoncer(cleEtud, (lus) => {
            return (lus || []).filter(e => !_ficheEstDuGroupeV2(e, groupeSelectionne));
        }, [], { geste: 'Supprimer le groupe' });
    } catch (e) { return; }

    // Reset le dropdown à "Tous les groupes"
    const selectGroupe = document.getElementById('v2-selectGroupe');
    if (selectGroupe) selectGroupe.value = '';

    chargerListeEtudiantsV2();

    notifications.succes(`Groupe ${libelleGroupe} supprimé (${etudiantsDuGroupe.length} étudiant(s))`);

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
    notifications.succes(`Groupe ${numeroGroupe} enregistré (${etudiants.length} étudiants)`);

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
window.fermerFicheEtudiantV2 = fermerFicheEtudiantV2;
window.corrigerDAEtudiantV2 = corrigerDAEtudiantV2; // #976
window.sauvegarderChampEtudiantV2 = sauvegarderChampEtudiantV2;
window.creerNouveauGroupeV2 = creerNouveauGroupeV2;
window.filtrerParGroupeV2 = filtrerParGroupeV2;
window.importerFichierEtudiantsV2 = importerFichierEtudiantsV2;
window.previsualiserDonneesV2 = previsualiserDonneesV2;
window.confirmerImportV2 = confirmerImportV2;
window.annulerImportV2 = annulerImportV2;
window.rafraichirRattachementEtudiantsV2 = rafraichirRattachementEtudiantsV2; // #887 : rappelée quand le cours actif change
window.exporterEtudiantsV2 = exporterEtudiantsV2;
window.reinitialiserEtudiantsV2 = reinitialiserEtudiantsV2;
window.supprimerGroupeSelectionneV2 = supprimerGroupeSelectionneV2;
window.viderListeEtudiantsV2 = viderListeEtudiantsV2;
// Cadrage « Rencontres » (12 sept. 2026) : la lecture d'une liste collée, partagée avec rencontres.js.
window.decouperLigneCollee = decouperLigneCollee;
window.analyserListeEtudiantsCollee = analyserListeEtudiantsCollee;

})();
