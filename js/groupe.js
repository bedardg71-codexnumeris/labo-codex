/* ===============================
   MODULE 11: GESTION DU GROUPE D'ÉTUDIANTS
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère la liste complète des étudiants inscrits :
   ajout manuel, import CSV/TSV, modification, suppression, export.
   
   Contenu:
   - Ajout manuel d'étudiants
   - Import par fichier CSV/TSV
   - Import par copier-coller
   - Prévisualisation avant import
   - Modification via modal
   - Suppression avec confirmation
   - Filtrage par groupe
   - Export CSV
   - Réinitialisation complète
   - Statistiques par groupe
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES
   
   Modules requis (AVANT):
   - 01-config.js : echapperHtml()
   
   Éléments HTML requis:
   - Formulaire ajout: #etudiantDA, #etudiantGroupe, #etudiantNom, 
     #etudiantPrenom, #etudiantProgramme, #etudiantSA, #etudiantCAF
   - Import: #fichierCsvEntree, #donneesCollees, #previewZone, #previewTable
   - Liste: #students-tbody, #students-list-container, #no-students-msg
   - Statistiques: #nbEtudiantsTotal, #nbGroupes, #detailGroupes
   - Filtrage: #filtreGroupe, #compteurFiltres
   
   LocalStorage:
   - 'groupeEtudiants' : Array des étudiants
   =============================== */

/* ===============================
   🚀 INITIALISATION
   =============================== */

/**
 * Variable globale pour l'import temporaire
 */
let tempImportData = [];

/**
 * SUPPRIMÉ : Cette fonction écrasait celle de modes.js et empêchait l'anonymisation
 * La vraie fonction obtenirDonneesSelonMode() est définie dans modes.js
 * et gère correctement les modes Normal/Anonymisation
 */
// function obtenirDonneesSelonMode(cle) - SUPPRIMÉE, utiliser celle de modes.js

/**
 * sauvegarderDonneesSelonMode() - SUPPRIMÉE, utiliser celle de modes.js
 * La vraie fonction est définie dans modes.js et gère correctement :
 * - Le blocage en mode Anonymisation
 * - Les erreurs de quota (QuotaExceededError)
 */
// function sauvegarderDonneesSelonMode(cle, donnees) - SUPPRIMÉE

// [Chantier 1 — 6 fev 2026] filtrerEtudiantsParMode supprimee (doublon conflictuel de modes.js)

/**
 * ✅ CORRECTION CRITIQUE (Beta 95 - 2 jan 2026)
 * Obtient TOUS les étudiants sans filtrage par coursId
 * (pour sauvegarder correctement sans perdre les autres cours)
 */
function obtenirTousLesEtudiants() {
    const cleEffective = cle('groupeEtudiants');
    return db.getSync(cleEffective, []);
}

/**
 * ✅ CORRECTION CRITIQUE (Beta 95 - 2 jan 2026)
 * Sauvegarde TOUS les étudiants vers la clé namespacée
 * Préserve les étudiants des autres cours
 */
function sauvegarderTousLesEtudiants(etudiants) {
    const cleEffective = cle('groupeEtudiants');
    db.setSync(cleEffective, etudiants);
}

/**
 * Initialise le module
 */
function initialiserModuleGroupe() {

    const tbody = document.getElementById('students-tbody');
    if (!tbody) {
        return;
    }

    // DEBUG: Vérifier les données
    const donnees = obtenirDonneesSelonMode('groupeEtudiants');
    if (donnees.length > 0) {
    }

    afficherListeEtudiants();
    remplirSelectFiltreGroupe();

}

/* ===============================
   IMPORT CSV/TSV
   =============================== */

/**
 * ✅ AMÉLIORATION (Beta 95.5) : Support multi-encodage pour fichiers Omnivox
 * ✅ CORRECTION (18 jan) : Détection améliorée des problèmes d'encodage
 * Tente UTF-8, puis Windows-1252 si caractères corrompus détectés
 */
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Essayer d'abord UTF-8
    const reader = new FileReader();
    reader.onload = function (e) {
        let content = e.target.result;

        // Détecter si l'encodage est corrompu :
        // - U+FFFD (�) : caractère de remplacement Unicode
        // - Séquences mojibake courantes (UTF-8 mal interprété)
        // - Absence d'accents français là où on en attendrait (heuristique)
        const hasReplacementChar = content.includes('\uFFFD');
        const hasMojibake = /Ã©|Ã¨|Ã |Ãª|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ãˆ|Ã€|Ãœ|Ã"|Ã¢|Ã¯/.test(content);

        // Heuristique : si on voit "etudiant" sans accent dans un contexte français, c'est suspect
        const looksLikeFrench = /groupe|etudiant|prenom|eleve|programme/i.test(content);
        const missingExpectedAccents = looksLikeFrench && !/[éèêëàâäùûüîïôöç]/i.test(content);

        const hasEncodingIssues = hasReplacementChar || hasMojibake || missingExpectedAccents;

        if (hasEncodingIssues) {

            // Relire avec Windows-1252 (encodage Omnivox/Excel français)
            const readerLatin = new FileReader();
            readerLatin.onload = function (e2) {
                parseAndPreview(e2.target.result);
            };
            readerLatin.readAsText(file, 'windows-1252');
        } else {
            parseAndPreview(content);
        }
    };
    reader.readAsText(file, 'UTF-8');
}

/**
 * Gère l'import par copier-coller
 */
function previewPastedData() {
    const content = document.getElementById('donneesCollees').value;
    if (!content.trim()) {
        notifications.erreur('Aucune donnée', 'Collez des données avant de prévisualiser');
        return;
    }
    parseAndPreview(content);
}

/**
 * Parse et affiche la prévisualisation
 * VERSION TOLÉRANTE : Accepte presque tous les formats
 * ✅ AMÉLIORATION (Beta 95.5) : Détection intelligente des en-têtes de colonnes
 */
function parseAndPreview(content) {
    try {

        // ÉTAPE 1 : Normaliser les sauts de ligne
        content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // ÉTAPE 2 : Détecter intelligemment le séparateur
        const detecterSeparateur = (ligne) => {
            const separateurs = ['\t', ';', ',', '|'];
            let meilleurSep = '\t';
            let maxColonnes = 0;

            for (const sep of separateurs) {
                const colonnes = ligne.split(sep).length;
                if (colonnes > maxColonnes) {
                    maxColonnes = colonnes;
                    meilleurSep = sep;
                }
            }
            return meilleurSep;
        };

        const lines = content.trim().split('\n').filter(l => l.trim());
        if (lines.length === 0) {
            notifications.erreur('Fichier vide', 'Le fichier ne contient aucune données.');
            return;
        }

        // Détecter séparateur sur première ligne non-vide
        const separator = detecterSeparateur(lines[0]);

        // ✅ NOUVEAU (Beta 95.5) : Détection intelligente des en-têtes
        // Mapping des noms de colonnes possibles vers nos champs internes
        // ✅ CORRECTION (18 jan) : Ajout headers Omnivox ("No de DA", "Nom de l'étudiant", etc.)
        const mappingColonnes = {
            da: ['da', 'no de da', 'code permanent', 'code_permanent', 'codepermanent', 'no', 'numero', 'numéro', 'id'],
            groupe: ['groupe', 'group', 'gr', 'section', 'classe'],
            nom: ['nom', 'nom de l\'etudiant', 'nom de l\'élève', 'name', 'nom de famille', 'nom_famille', 'last name', 'lastname', 'family name'],
            prenom: ['prenom', 'prénom', 'prenom de l\'etudiant', 'prénom de l\'étudiant', 'prenom de l\'élève', 'prénom de l\'élève', 'firstname', 'first name', 'given name'],
            programme: ['programme', 'program', 'prog', 'prog.', 'code programme', 'code_programme'],
            sa: ['sa', 's.a.', 's.a', 'services adaptés', 'services adaptes', 'services_adaptes', 'service adapté', 'service adapte', 'adaptation', 'accommodations', 'accomodations', 'mesures', 'mesures adaptees', 'mesures adaptées'],
            // #790 — « mesure d'aide » est le libellé affiché depuis le 8 sept. 2026 ; les
            // anciens en-têtes restent reconnus, sinon les fichiers d'élèves déjà
            // constitués cesseraient de se relire.
            caf: ['caf', 'mesure d\'aide', 'mesure aide', 'centre d\'aide', 'centre aide', 'aide francais', 'aide français', 'cote', 'côte', 'cote r', 'score']
        };

        // Fonction pour normaliser un texte (pour comparaison)
        const normaliser = (texte) => {
            return texte.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Retirer accents
                .trim();
        };

        // Fonction pour trouver l'index d'une colonne par son nom
        const trouverIndexColonne = (headers, champRecherche) => {
            const variantes = mappingColonnes[champRecherche] || [champRecherche];
            for (let i = 0; i < headers.length; i++) {
                const headerNorm = normaliser(headers[i]);
                for (const variante of variantes) {
                    if (headerNorm === normaliser(variante) || headerNorm.includes(normaliser(variante))) {
                        return i;
                    }
                }
            }
            return -1;
        };

        // Analyser la première ligne pour voir si c'est un en-tête
        const premiereLigneParts = lines[0].split(separator).map(p => p.trim().replace(/^"|"$/g, ''));
        const estEnTete = premiereLigneParts.some(p => {
            const pNorm = normaliser(p);
            // Vérifier si au moins un champ ressemble à un en-tête connu
            return Object.values(mappingColonnes).flat().some(v => pNorm.includes(normaliser(v)));
        });

        let colonneMapping = null;
        let lignesATraiter = lines;

        if (estEnTete) {
            colonneMapping = {
                da: trouverIndexColonne(premiereLigneParts, 'da'),
                groupe: trouverIndexColonne(premiereLigneParts, 'groupe'),
                nom: trouverIndexColonne(premiereLigneParts, 'nom'),
                prenom: trouverIndexColonne(premiereLigneParts, 'prenom'),
                programme: trouverIndexColonne(premiereLigneParts, 'programme'),
                sa: trouverIndexColonne(premiereLigneParts, 'sa'),
                caf: trouverIndexColonne(premiereLigneParts, 'caf')
            };
            lignesATraiter = lines.slice(1); // Ignorer la ligne d'en-tête
        } else {
        }

        tempImportData = [];
        let ligneSautees = 0;

        lignesATraiter.forEach((line, index) => {
            if (!line.trim()) return;

            // Split avec le séparateur détecté
            let parts = line.split(separator).map(p => {
                // Nettoyer format Excel ="valeur" (préserve zéros en tête)
                let val = p.trim();
                if (val.startsWith('="') && val.endsWith('"')) {
                    val = val.slice(2, -1);
                } else if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.slice(1, -1);
                }
                return val.trim();
            });

            // TOLÉRANCE : Si moins de 4 colonnes, essayer d'autres séparateurs
            if (parts.length < 4) {
                for (const altSep of ['\t', ';', ',']) {
                    const altParts = line.split(altSep).map(p => {
                        let val = p.trim();
                        if (val.startsWith('="') && val.endsWith('"')) {
                            val = val.slice(2, -1);
                        } else if (val.startsWith('"') && val.endsWith('"')) {
                            val = val.slice(1, -1);
                        }
                        return val.trim();
                    });
                    if (altParts.length >= 4) {
                        parts = altParts;
                        break;
                    }
                }
            }

            // TOLÉRANCE : Accepter même avec seulement Nom et Prénom
            if (parts.length >= 2) {
                // ✅ CORRECTION CRITIQUE (Beta 95 - 27 déc 2025) : Ajouter coursId
                const coursId = typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null;

                let student;

                if (colonneMapping) {
                    // ✅ Mode intelligent avec mapping de colonnes
                    student = {
                        id: genererIdUnique('ETU_'),
                        da: colonneMapping.da >= 0 ? (parts[colonneMapping.da] || '') : '',
                        groupe: colonneMapping.groupe >= 0 ? (parts[colonneMapping.groupe] || '1') : '1',
                        nom: colonneMapping.nom >= 0 ? (parts[colonneMapping.nom] || '') : '',
                        prenom: colonneMapping.prenom >= 0 ? (parts[colonneMapping.prenom] || '') : '',
                        programme: colonneMapping.programme >= 0 ? (parts[colonneMapping.programme] || '---') : '---',
                        sa: colonneMapping.sa >= 0 ? (parts[colonneMapping.sa] || '') : '',
                        caf: colonneMapping.caf >= 0 ? (parts[colonneMapping.caf] || '') : '',
                        coursId: coursId
                    };
                } else {
                    // Mode classique par position fixe
                    student = {
                        id: genererIdUnique('ETU_'),
                        da: parts[0] || `AUTO-${Date.now() + index}`,
                        groupe: parts[1] || '1',
                        nom: parts[2] || parts[0] || '', // Si pas de DA, premier champ = nom
                        prenom: parts[3] || parts[1] || '', // Si pas de groupe, deuxième champ = prénom
                        programme: parts[4] || '---',
                        sa: parts[5] || '',
                        caf: parts[6] || '',
                        coursId: coursId
                    };
                }

                // #914 (19 sept. 2026) : les deux replis « AUTO- » + horodatage de ce bloc fabriquent un DA,
                // ce que Grégoire interdit — mais `parseAndPreview` n'a plus d'appelant vivant (mesuré :
                // `donneesCollees`, `fichierCsvEntree`, `previewZone` absents d'index.html ; l'import du
                // Cadre passe par trimestre-v2-etudiants.js). À retirer avec le bloc, pas à réveiller.
                // Nettoyer le DA (retirer espaces, lettres parasites)
                student.da = student.da.replace(/[^0-9]/g, '');
                if (!student.da) student.da = `AUTO-${Date.now() + index}`;

                // Nettoyer Services adaptés (accepter Oui/O/X/✓/Y/Yes/Vrai/True)
                // 🆕 FIX (4 fév 2026) : Accepter plus de variantes pour SA
                if (student.sa && /^(oui|o|x|✓|1|y|yes|vrai|true|v)$/i.test(student.sa.trim())) {
                    student.sa = 'Oui';
                }

                // Validation minimale : au moins un nom ou prénom
                if (student.nom || student.prenom) {
                    tempImportData.push(student);
                } else {
                    ligneSautees++;
                }
            } else {
                ligneSautees++;
            }
        });


        if (tempImportData.length === 0) {
            notifications.erreur('Aucune donnée valide',
                'Impossible de trouver des noms d\'étudiants.\n' +
                'Format attendu (flexible) :\n' +
                '- Minimum : Nom, Prénom\n' +
                '- Complet : DA, Groupe, Nom, Prénom, Programme, SA');
            return;
        }

        afficherPrevisualisation(tempImportData, `Import de ${tempImportData.length} étudiant(s)`);

    } catch (error) {
        notifications.erreur('Erreur de parsing', error.message);
        console.error('Erreur parsing:', error);
    }
}

/**
 * Affiche la prévisualisation
 */
function afficherPrevisualisation(data, titre) {
    const previewZone = document.getElementById('previewZone');
    const previewTable = document.getElementById('previewTable');

    if (!previewZone || !previewTable) return;

    const tableHtml = `
        <table class="tableau-blanc">
            <thead>
                <tr>
                    <th>DA</th>
                    <th style="text-align: center;">Groupe</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Programme</th>
                    <th style="text-align: center;">SA</th>
                </tr>
            </thead>
            <tbody>
                ${data.map((s, index) => `
                    <tr>
                        <td>${echapperHtml(s.da)}</td>
                        <td style="text-align: center;">${echapperHtml(s.groupe)}</td>
                        <td>${echapperHtml(s.nom)}</td>
                        <td>${echapperHtml(s.prenom)}</td>
                        <td>${echapperHtml(s.programme || '---')}</td>
                        <td style="text-align: center;">${s.sa === 'Oui' ? '<span class="icone-inline icone-inline--check" aria-label="Oui"></span>' : ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    previewTable.innerHTML = tableHtml;
    previewZone.classList.remove('u-hide');
}

/**
 * Confirme et effectue l'import
 */
function confirmImport() {
    if (tempImportData.length === 0) {
        notifications.erreur('Aucune donnée', 'Aucune donnée à importer');
        return;
    }

    try {
        // 🔧 CORRECTION CRITIQUE (9 janvier 2026) : Lire TOUTES les données sans filtrage
        // obtenirDonneesSelonMode filtre par coursId, ce qui causait la perte des étudiants d'autres cours
        const cleEtudiants = cle('groupeEtudiants');
        let students = db.getSync(cleEtudiants, []);
        const ancienTotal = students.length;

        // Vérifier doublons DA
        const dasExistants = students.map(s => s.da);
        const nouveauxDAs = tempImportData.map(s => s.da);
        const doublons = nouveauxDAs.filter(da => dasExistants.includes(da) && !da.startsWith('AUTO-'));

        if (doublons.length > 0) {
            if (!confirm(`${doublons.length} DA en double détecté(s).\nContinuer ?`)) {
                return;
            }
        }

        students = students.concat(tempImportData);
        db.setSync(cleEtudiants, students);

        const details = `Groupe : ${ancienTotal} → ${students.length} étudiant·es (+ ${tempImportData.length})`;
        notifications.succes('Importation réussie !', details);

        // Nettoyer
        tempImportData = [];
        document.getElementById('previewZone').classList.add('u-hide');
        document.getElementById('donneesCollees').value = '';
        document.getElementById('fichierCsvEntree').value = '';

        afficherListeEtudiants();
        remplirSelectFiltreGroupe();

    } catch (error) {
        notifications.erreur('Erreur lors de l\'importation', error.message);
        console.error('Erreur importation:', error);
    }
}

/**
 * Annule l'import
 */
function cancelImport() {
    tempImportData = [];
    document.getElementById('previewZone').classList.add('u-hide');
    document.getElementById('donneesCollees').value = '';
    document.getElementById('fichierCsvEntree').value = '';
}

/* ===============================
   AFFICHAGE ET FILTRAGE
   =============================== */

/**
 * Affiche la liste des étudiants
 */
function afficherListeEtudiants() {
    try {
        mettreAJourStatistiquesGroupes();
        remplirSelectFiltreGroupe();
        filtrerParGroupe();

    } catch (error) {
        console.error('Erreur affichage liste:', error);
    }
}

/**
 * Met à jour les statistiques des groupes
 */
function mettreAJourStatistiquesGroupes() {
    try {
        // BETA 95 : Filtrer par cours actif pour éviter contamination entre trimestres
        const students = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants') || []);

        // Compteur total
        const compteurTotal = document.getElementById('nbEtudiantsTotal');
        if (compteurTotal) {
            compteurTotal.textContent = students.length;
        }

        // Grouper par groupe
        const groupes = {};
        students.forEach(s => {
            const groupe = s.groupe || 'Sans groupe';
            if (!groupes[groupe]) {
                groupes[groupe] = 0;
            }
            groupes[groupe]++;
        });

        // Trier les groupes
        const groupesTriés = Object.keys(groupes).sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.localeCompare(b);
        });

        // Nombre de groupes
        const compteurGroupes = document.getElementById('nbGroupes');
        if (compteurGroupes) {
            compteurGroupes.textContent = groupesTriés.length;
        }

        // Détail par groupe
        const detailGroupes = document.getElementById('detailGroupes');
        if (detailGroupes) {
            if (groupesTriés.length === 0) {
                detailGroupes.innerHTML = '<em>Aucun groupe configuré</em>';
            } else {
                const detailHtml = groupesTriés.map(groupe => {
                    const effectif = groupes[groupe];
                    const pluriel = effectif > 1 ? 's' : '';
                    // CT-09 : `groupe` vient du collage CSV des étudiants.
                    return `<strong>Groupe ${echapperHtml(groupe)}</strong> : ${effectif} étudiant·e${pluriel}`;
                }).join(' • ');

                detailGroupes.innerHTML = detailHtml;
            }
        }

    } catch (error) {
        console.error('Erreur statistiques:', error);
    }
}

/**
 * Remplit le select de filtrage
 */
function remplirSelectFiltreGroupe() {
    try {
        // BETA 95 : Filtrer par cours actif pour éviter contamination entre trimestres
        const students = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants') || []);
        const selectFiltre = document.getElementById('filtreGroupe');

        if (!selectFiltre) return;

        // Extraire les groupes uniques
        const groupes = new Set();
        students.forEach(s => {
            if (s.groupe && s.groupe.trim() !== '') {
                groupes.add(s.groupe.trim());
            }
        });

        // Trier
        const groupesTriés = Array.from(groupes).sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.localeCompare(b);
        });

        // Générer les options
        let optionsHtml = '<option value="">Tous les groupes</option>';
        groupesTriés.forEach(groupe => {
            const count = students.filter(s => s.groupe === groupe).length;
            optionsHtml += `<option value="${echapperHtml(groupe)}">Groupe ${echapperHtml(groupe)} (${count} étudiant·es)</option>`;
        });

        selectFiltre.innerHTML = optionsHtml;

    } catch (error) {
        console.error('Erreur remplissage filtre:', error);
    }
}

/**
 * Filtre l'affichage par groupe
 */
function filtrerParGroupe() {
    try {
        const selectFiltre = document.getElementById('filtreGroupe');
        const groupeSelectionné = selectFiltre ? selectFiltre.value : '';

        // BETA 95 : Filtrer par cours actif pour éviter contamination entre trimestres
        const students = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants') || []);

        const tbody = document.getElementById('students-tbody');
        const container = document.getElementById('students-list-container');
        const noMsg = document.getElementById('no-students-msg');
        const compteurFiltres = document.getElementById('compteurFiltres');

        if (!tbody) {
            return;
        }

        // Filtrer
        const etudiantsFiltres = groupeSelectionné
            ? students.filter(s => s.groupe === groupeSelectionné)
            : students;

        // Compteur
        if (compteurFiltres) {
            if (groupeSelectionné) {
                compteurFiltres.textContent = `(${etudiantsFiltres.length} sur ${students.length})`;
                compteurFiltres.style.color = 'var(--accent-primaire)';
                compteurFiltres.style.fontWeight = 'bold';
            } else {
                compteurFiltres.textContent = '';
            }
        }

        // Afficher ou masquer
        if (etudiantsFiltres.length === 0) {
            if (container) container.classList.add('u-hide');
            if (noMsg) {
                noMsg.classList.remove('u-hide');
                if (groupeSelectionné) {
                    noMsg.innerHTML = `
                        <p style="font-size: 1.1rem; margin-bottom: 10px;">🔍 Aucun·e étudiant·e dans le groupe ${echapperHtml(groupeSelectionné)}</p>
                        <p style="font-size: 0.9rem;">Désélectionne le groupe dans le filtre pour voir tous les étudiants.</p>
                    `;
                } else {
                    noMsg.innerHTML = `
                        <p style="font-size: 1.1rem; margin-bottom: 10px;">📭 Aucun·e étudiant·e dans le groupe</p>
                        <p style="font-size: 0.9rem;">
                            Utilise le formulaire ci-dessus ou l'import pour ajouter des étudiant·es
                        </p>
                    `;
                }
            }
            return;
        }

        if (container) container.classList.remove('u-hide');
        if (noMsg) noMsg.classList.add('u-hide');

        // Trier alphabétiquement par nom, puis par prénom (sauf en mode anonymisation)
        const modeActif = db.getSync('mode_actuel', 'normal');
        if (modeActif !== 'anonymisation') {
            etudiantsFiltres.sort((a, b) => {
                const nomA = a.nom.toLowerCase();
                const nomB = b.nom.toLowerCase();
                if (nomA < nomB) return -1;
                if (nomA > nomB) return 1;
                // Si noms identiques, trier par prénom
                const prenomA = a.prenom.toLowerCase();
                const prenomB = b.prenom.toLowerCase();
                return prenomA.localeCompare(prenomB);
            });
        }

        // Générer le tableau
        tbody.innerHTML = etudiantsFiltres.map(s => {
            // Utiliser daAffichage si disponible (mode anonymisation), sinon DA réel
            const daAfficher = s.daAffichage || s.da;
            const daEchappe = echapperHtml(daAfficher);
            const groupeEchappe = echapperHtml(s.groupe);
            const nomEchappe = echapperHtml(s.nom);
            const prenomEchappe = echapperHtml(s.prenom);
            const programmeEchappe = echapperHtml(s.programme || '');

            return `
                <tr style="cursor: pointer; transition: background-color 0.2s ease;">
                    <td class="td-left-100">${daEchappe}</td>
                    <td class="td-center-80"><strong>${groupeEchappe}</strong></td>
                    <td class="td-left-auto">${nomEchappe}</td>
                    <td class="td-left-auto">${prenomEchappe}</td>
                    <td class="td-left-100">${programmeEchappe}</td>
                    <td class="td-center-60">${s.sa === 'Oui' ? '<span class="icone-inline icone-inline--check" aria-label="Oui"></span>' : ''}</td>
                    <td class="td-center-60">${s.caf === 'Oui' ? '<span class="icone-inline icone-inline--check" aria-label="Oui"></span>' : ''}</td>
                    <td class="td-center-200">
                        <button data-action="modifier" data-da="${s.da}" class="btn btn-modifier btn-tres-compact"
                                style="margin-right: 4px;">
                            Modifier
                        </button>
                        <button data-action="supprimer" data-da="${s.da}" class="btn btn-supprimer btn-tres-compact">
                            Supprimer
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Effet de survol géré par CSS (plus fiable pour adaptation par mode)

    } catch (error) {
        console.error('Erreur filtrage:', error);
    }

    // Attacher les event listeners aux boutons
    attacherEventListenersEtudiants();
}

/* ===============================
   MODIFICATION
   =============================== */

/**
/**
 * Modifie un étudiant (utilise le DA)
 */
/**
 * Modifie un étudiant (utilise le DA)
 */
function modifierEtudiant(da) {
    const verrouille = db.getSync('groupeVerrouille', false);
    if (verrouille) {
        alert('D\u00e9verrouillez le groupe avant de le modifier');
        return;
    }

    try {
        const students = obtenirDonneesSelonMode('groupeEtudiants');
        const student = students.find(s => s.da === da);

        if (!student) {
            notifications.erreur('Erreur', 'Étudiant·e introuvable');
            return;
        }

        // Stocker le DA de l'étudiant en cours de modification
        sessionStorage.setItem('etudiantEnModification', da);

        // Remplir le formulaire
        document.getElementById('etudiantDA').value = student.da || '';
        document.getElementById('etudiantGroupe').value = student.groupe || '';
        document.getElementById('etudiantNom').value = student.nom || '';
        document.getElementById('etudiantPrenom').value = student.prenom || '';
        document.getElementById('etudiantProgramme').value = student.programme || '';
        document.getElementById('etudiantSA').value = student.sa || '';
        document.getElementById('etudiantCAF').value = student.caf || '';

        // Ouvrir le formulaire et scroller
        // D'abord chercher dans l'accordéon V2 Groupe, sinon dans le legacy
        const accordeonGroupe = document.getElementById('accordeon-groupe');
        let formulaire = null;
        if (accordeonGroupe) {
            formulaire = accordeonGroupe.querySelector('details');
        }
        if (!formulaire) {
            // Fallback legacy
            formulaire = document.querySelector('#reglages-groupe-legacy details');
        }
        if (!formulaire) {
            // Dernier recours - premier details de la page
            formulaire = document.querySelector('details');
        }

        if (formulaire) {
            formulaire.open = true;
            formulaire.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Changer le texte du bouton
        let btnAjouter = null;
        if (accordeonGroupe) {
            btnAjouter = accordeonGroupe.querySelector('button[data-action="ajouterEtudiant"]');
        }
        if (!btnAjouter) {
            btnAjouter = document.querySelector('button[data-action="ajouterEtudiant"]');
        }

        if (btnAjouter) {
            btnAjouter.innerHTML = '<span class="icone-inline icone-inline--check" aria-hidden="true"></span>Mettre à jour';
            btnAjouter.style.background = 'var(--orange-accent)';
        }

        notifications.succes('Modification en cours', 'Modifiez les champs et cliquez sur "Mettre à jour"');

    } catch (error) {
        notifications.erreur('Erreur modification', error.message);
        console.error('Erreur modification:', error);
    }
}

/* ===============================
   EXPORT
   =============================== */

/**
 * Exporte les données en CSV
 */
function exportStudentsData() {
    try {
        const students = obtenirDonneesSelonMode('groupeEtudiants');

        if (students.length === 0) {
            notifications.erreur('Aucune donnée', 'Aucun·e étudiant·e à exporter');
            return;
        }

        // Générer CSV
        // #790 — l'en-tête porte le nom neuf ; la CLÉ `caf` ne bouge pas, et
        // `mappingColonnes` reconnaît « mesure d'aide » à la relecture. Un fichier
        // exporté aujourd'hui se réimporte donc, et ceux d'hier aussi.
        let csv = 'DA,Groupe,Nom,Prénom,Programme,SA,Mesure d\'aide\n';
        students.forEach(s => {
            csv += `${s.da},${s.groupe},${s.nom},${s.prenom},${s.programme || ''},${s.sa || ''},${s.caf || ''}\n`;
        });

        // Télécharger
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `groupe_etudiants_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        notifications.succes('Export réussi !', `${students.length} étudiant·es exporté·es`);

    } catch (error) {
        notifications.erreur('Erreur export', error.message);
        console.error('Erreur export:', error);
    }
}

/* ===============================
   🔄 RÉINITIALISATION
   =============================== */

/**
 * Réinitialise toutes les données
 */
function resetStudentsData() {
    if (!confirm('⚠️ ATTENTION !\n\nCette action va supprimer TOUS les étudiants de façon IRRÉVERSIBLE.\n\nVeux-tu vraiment continuer ?')) {
        return;
    }

    if (!confirm('Dernière confirmation :\nTu vas perdre toutes les données du groupe.\n\nContinuer ?')) {
        return;
    }

    try {
        db.removeSync('groupeEtudiants');

        // Forcer la mise à jour immédiate des statistiques
        mettreAJourStatistiquesGroupes();
        remplirSelectFiltreGroupe();

        // Afficher message vide
        const container = document.getElementById('students-list-container');
        const noMsg = document.getElementById('no-students-msg');
        if (container) container.classList.add('u-hide');
        if (noMsg) {
            noMsg.classList.remove('u-hide');
            noMsg.innerHTML = `
                <p style="font-size: 1.1rem; margin-bottom: 10px;">📭 Aucun·e étudiant·e dans le groupe</p>
                <p style="font-size: 0.9rem;">
                    Utilise le formulaire ci-dessus ou l'import pour ajouter des étudiant·es
                </p>
            `;
        }

        notifications.succes('Groupe réinitialisé', 'Toutes les données ont été supprimées');

    } catch (error) {
        notifications.erreur('Erreur réinitialisation', error.message);
        console.error('Erreur reset:', error);
    }
}

/**
 * Attache les event listeners aux boutons d'actions
 */
function attacherEventListenersEtudiants() {
    const tbody = document.getElementById('students-tbody');
    if (!tbody) return;

    // Délégation d'événements sur le tbody
    tbody.addEventListener('click', function (e) {
        const bouton = e.target.closest('button[data-action]');
        if (!bouton) return;

        const action = bouton.dataset.action;
        const da = bouton.dataset.da;

        if (action === 'modifier') {
            modifierEtudiant(da);
        } else if (action === 'supprimer') {
            supprimerEtudiant(da);
        }
    });
}

/**
 * Supprime un étudiant du groupe
 * @param {string} id - DA ou ID de l'étudiant
 */
function supprimerEtudiant(id) {
    const verrouille = db.getSync('groupeVerrouille', false);
    if (verrouille) {
        alert('D\u00e9verrouillez le groupe avant de supprimer');
        return;
    }

    // 🔧 CORRECTION CRITIQUE (9 janvier 2026) : Lire TOUTES les données sans filtrage
    // obtenirDonneesSelonMode filtre par coursId, ce qui causait la perte des étudiants d'autres cours
    const cleEtudiants = cle('groupeEtudiants');
    let students = db.getSync(cleEtudiants, []);
    const etudiantASupprimer = students.find(s => (s.id == id || s.da == id));

    if (!etudiantASupprimer) {
        alert('Étudiant·e non trouvé·e');
        return;
    }

    if (confirm(`Es-tu sûr de vouloir supprimer ${etudiantASupprimer.nom}, ${etudiantASupprimer.prenom} ?`)) {
        try {
            students = students.filter(s => !(s.id == id || s.da == id));
            db.setSync(cleEtudiants, students);
            afficherListeEtudiants();

        } catch (error) {
            alert(`Erreur lors de la suppression: ${error.message}`);
        }
    }
}

// ============================================
// EXPORT DES FONCTIONS GLOBALES
// ============================================

window.initialiserModuleGroupe = initialiserModuleGroupe;
window.supprimerEtudiant = supprimerEtudiant;
window.modifierEtudiant = modifierEtudiant;
window.afficherListeEtudiants = afficherListeEtudiants;
window.resetStudentsData = resetStudentsData;
window.exportStudentsData = exportStudentsData;

// Fonctions d'import (utilisées par l'accordéon Groupe dans Trimestre V2)
window.handleFileImport = handleFileImport;
window.previewPastedData = previewPastedData;
window.confirmImport = confirmImport;
window.cancelImport = cancelImport;
window.filtrerParGroupe = filtrerParGroupe;



/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES:
 * - 01-config.js (echapperHtml)
 * - utils-notifications.js (window.notifications.succes/erreur)
 * 
 * MODULES DÉPENDANTS:
 * - 03-etudiants.js : Lit 'groupeEtudiants' pour afficher les profils
 * 
 * ORDRE DE CHARGEMENT:
 * 1. 01-config.js
 * 2. 14-utilitaires.js
 * 3. Ce module (11-groupe.js)
 * 4. 99-main.js (initialisation)
 * 
 * LOCALSTORAGE:
 * - 'groupeEtudiants' : Array [{id, da, groupe, nom, prenom, programme, sa, caf}, ...]
 * 
 * INITIALISATION:
 * Appelée automatiquement par 99-main.js via initialiserModuleGroupe()
 */

})();
