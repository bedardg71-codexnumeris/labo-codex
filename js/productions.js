/* ===============================
   MODULE 04: GESTION DES PRODUCTIONS ET ÉVALUATIONS
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT CRITIQUE ⚠️
   INTERDICTION ABSOLUE de modifier les noms de fonctions.
   Les identifiants HTML et les clés localStorage sont protégés.
   Seuls les commentaires peuvent être modifiés/ajoutés.
   
   Contenu de ce module:
   - Affichage et gestion des productions (évaluations)
   - Ajout, modification, suppression de productions
   - Gestion des pondérations
   - Support des portfolios et artefacts
   - Réorganisation et verrouillage
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Variables du module 01-config.js:
   - productionEnEdition : ID de la production en cours d'édition
   - echapperHtml() : Fonction de sécurité XSS (si utilisée)
   
   Fonctions du module 14-utilitaires.js (si disponibles):
   - afficherNotificationSucces(message, details)
   - afficherNotificationErreur(message, details)
   
   Fonctions du module 02-navigation.js:
   - afficherSection(nomSection)
   - afficherSousSection(idSousSection)
   
   Éléments HTML requis:
   - #tableauEvaluationsContainer : Conteneur de la liste
   - #aucuneEvaluation : Message si vide
   - #formulaireProduction : Formulaire d'ajout/modification
   - #btnajouterProduction : Bouton d'ajout
   - #nombreEvaluations : Compteur
   - #ponderationTotale : Total pondération
   - #statutPonderation : Statut de la pondération
   - #typesEvaluations : Résumé des types
   - Tous les champs du formulaire (productionTitre, productionActivite, etc.)
   
   LocalStorage utilisé:
   - 'productions' : Array des productions/évaluations (namespacé par trimestre via cle())
   - 'grillesTemplates' : Array des grilles de critères (pour association)
   =============================== */

/**
 * 🆕 Beta 95.4 : Helper pour obtenir la clé namespacée des productions
 * Utilise cle() si disponible, sinon fallback sur 'productions'
 */
function getCleProductions() {
    return cle('productions');
}

/**
 * 🆕 Beta 95.4 : Helper pour obtenir la clé namespacée des grilles
 */
function getCleGrilles() {
    return cle('grillesTemplates');
}

/**
 * 🆕 Beta 98.3 : Résoudre l'échéance effective d'une production pour un groupe-cours donné
 * Supporte echeancesParGroupe (multi-groupe) avec fallback sur dateEcheance legacy
 *
 * @param {Object} production - La production avec dateEcheance et optionnellement echeancesParGroupe
 * @param {string} [groupeCoursId] - L'identifiant du groupe-cours (ex: "GC_abc")
 * @returns {{ date: string|null, assignee: boolean }} - Date effective et statut d'assignation
 */
function obtenirEcheanceEffective(production, groupeCoursId) {
    if (production.echeancesParGroupe && groupeCoursId) {
        const entree = production.echeancesParGroupe[groupeCoursId];
        if (entree) {
            return { date: entree.date || null, assignee: entree.assignee !== false };
        }
    }
    return { date: production.dateEcheance || null, assignee: true };
}

/**
 * 🆕 Beta 99.08 : Obtenir la date d'échéance la plus tôt parmi tous les groupes
 * Utilisé pour le tri dans la sidebar (sans contexte de groupe spécifique)
 * @param {Object} production - La production
 * @returns {string|null} Date YYYY-MM-DD la plus tôt, ou null
 */
function obtenirEcheancePlusTot(production) {
    let plusTot = production.dateEcheance || null;
    if (production.echeancesParGroupe) {
        for (const gcId in production.echeancesParGroupe) {
            const entree = production.echeancesParGroupe[gcId];
            if (entree && entree.date) {
                if (!plusTot || entree.date < plusTot) {
                    plusTot = entree.date;
                }
            }
        }
    }
    return plusTot;
}

/**
 * 🆕 Beta 99.08 : Handler pour le select de tri dans la sidebar
 */
function trierListeProductions() {
    afficherListeProductions();
}

/**
 * ✅ AJOUT (28 janvier 2026) : Détecter les doublons potentiels dans les productions
 * Retourne une liste des titres qui apparaissent plus d'une fois
 * @param {Array} productionsLocales - Productions de l'utilisateur
 * @param {Array} productionsBibliotheque - Productions de la bibliothèque partagée
 * @returns {Array} Liste des doublons {titre, count, ids}
 */
function detecterDoublonsProductions(productionsLocales, productionsBibliotheque) {
    const toutesProductions = [...productionsLocales, ...productionsBibliotheque];
    const parTitre = {};

    toutesProductions.forEach(prod => {
        const titre = (prod.titre || '').trim().toLowerCase();
        if (!titre) return;

        if (!parTitre[titre]) {
            parTitre[titre] = { titre: prod.titre, count: 0, ids: [] };
        }
        parTitre[titre].count++;
        parTitre[titre].ids.push(prod.id);
    });

    // Retourner uniquement ceux avec count > 1
    return Object.values(parTitre).filter(d => d.count > 1);
}

/**
 * ✅ AJOUT (28 janvier 2026) : Générer un badge de source pour une production
 * @param {Object} prod - La production
 * @param {Array} productionsLocales - Productions locales pour vérifier la source
 * @returns {string} HTML du badge
 */
function genererBadgeSourceProduction(prod, productionsLocales) {
    return BibliothequeUI.genererBadgeSource(prod, productionsLocales);
}

function genererIdCourtProduction(id) {
    return BibliothequeUI.genererIdCourt(id);
}

/* ===============================
   FONCTION: AFFICHER TABLEAU DES PRODUCTIONS
   Affiche toutes les productions avec leurs détails
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Affiche la liste complète des productions/évaluations
 * 
 * UTILISÉ PAR:
 * - initialiserModuleProductions() au chargement
 * - sauvegarderProduction() après ajout/modification
 * - supprimerProduction() après suppression
 * - monterEvaluation() et descendreEvaluation() après réorganisation
 * - afficherSousSection() quand on arrive sur reglages-productions
 * 
 * FONCTIONNEMENT:
 * 1. Charge les productions depuis localStorage ('productions')
 * 2. Charge les grilles depuis localStorage ('grillesTemplates')
 * 3. Si liste vide : affiche un message
 * 4. Sinon : génère le HTML pour chaque production
 * 5. Met à jour les statistiques (nombre, types)
 * 6. Gère l'affichage spécial pour les portfolios
 */
async function afficherTableauProductions() {
    const evaluations = await db.get(getCleProductions()) || [];
    const grilles = await db.get('grillesTemplates') || [];
    const container = document.getElementById('tableauEvaluationsContainer');

    if (evaluations.length === 0) {
        container.innerHTML = '<p class="text-muted prod-italic">Aucune évaluation définie.</p>';
        document.getElementById('typesEvaluations').innerHTML =
            '<span class="prod-texte-bleu-leger">Aucune évaluation configurée</span>';
        document.getElementById('nombreEvaluations').textContent = '0';
        return;
    }

    container.innerHTML = evaluations.map((prod, index) => {
        const grilleAssociee = grilles.find(g => g.id === prod.grilleId);
        const nomGrille = grilleAssociee ? grilleAssociee.nom : 'Aucune grille';

        // Style spécial pour Portfolio
        const estPortfolio = prod.type === 'portfolio';
        const bgColor = estPortfolio ? 'var(--bleu-carte)' : 'var(--bleu-tres-pale)';
        const borderColor = estPortfolio ? 'var(--bleu-moyen)' : 'var(--bleu-leger)';

        return `
        <div class="item-liste" style="background: ${bgColor}; border-color: ${borderColor}; border-width: 2px;">
            <div class="production-header">
                <strong class="production-titre">
                    ${estPortfolio ? '📁 ' : ''}${prod.titre}${(prod.activiteApprentissage || prod.description) ? ' - ' + (prod.activiteApprentissage || prod.description) : ''}
                </strong>
                <div class="production-actions">
                    ${index > 0 ?
                `<button data-action="monterEvaluation" data-param="${prod.id}" class="btn btn-principal">↑</button>` : ''}
                    ${index < evaluations.length - 1 ?
                `<button data-action="descendreEvaluation" data-param="${prod.id}" class="btn btn-principal">↓</button>` : ''}
                    <button data-action="modifierProduction" data-param="${prod.id}" class="btn btn-modifier">Modifier</button>
                    <button data-action="supprimerProduction" data-param="${prod.id}" class="btn btn-supprimer">Supprimer</button>
                </div>
            </div>
            <div class="production-champs-grille ${prod.type === 'artefact-portfolio' ? 'production-champs-grille-2col' : 'production-champs-grille-3col'}">
                <div>
                    <label class="production-champ-label">Type</label>
                    <input type="text" value="${getTypeLabel(prod.type)}" class="controle-form production-champ-input" readonly>
                </div>
                ${prod.type !== 'artefact-portfolio' ? `
                <div>
                    <label class="production-champ-label">Pondération</label>
                    <input type="text" value="${prod.ponderation}%" class="controle-form production-champ-input-bold" readonly>
                </div>
                ` : ''}
                ${!estPortfolio ? `
                <div>
                    <label class="production-champ-label">Grilles de critères</label>
                    <input type="text" value="${nomGrille}" class="controle-form ${!grilleAssociee ? 'production-champ-input-placeholder' : 'production-champ-input'}" readonly>
                </div>
                ` : ''}
            </div>
            ${estPortfolio && prod.artefactsIds && prod.artefactsIds.length > 0 ? `
                <div class="production-portfolio-info">
                    <strong>
                        ${prod.artefactsIds.length} artefacts sélectionnés
                    </strong> ·
                    ${prod.regles.nombreARetenir} à retenir pour note finale ·
                    Min. ${prod.regles.minimumCompletion} complétés requis
                </div>
            ` : ''}
            ${prod.objectif || prod.tache ? `
                <div class="production-details">
                    ${prod.objectif ? `<p><strong>Objectif:</strong> ${prod.objectif}</p>` : ''}
                    ${prod.tache ? `<p><strong>Tâche:</strong> ${prod.tache}</p>` : ''}
                </div>
            ` : ''}
        </div>
        `;
    }).join('');

    document.getElementById('nombreEvaluations').textContent = evaluations.length;
    mettreAJourResumeTypes(evaluations);
}

/* ===============================
   FONCTION: AFFICHER FORMULAIRE PRODUCTION
   Affiche le formulaire d'ajout ou de modification
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * 🆕 Beta 98.3 : Peuple le conteneur d'échéances par groupe-cours
 * Si plusieurs groupes partagent le même cours-entité, affiche une ligne par groupe
 * avec checkbox d'assignation + champ date. Sinon, reste en mode simple (champ legacy).
 *
 * @param {Object|null} production - La production en cours d'édition (null = nouvelle)
 */
function peuplerEcheancesParGroupe(production) {
    const containerMulti = document.getElementById('containerEcheancesGroupes');
    const champSimple = document.getElementById('champDateEcheance');
    const listeContainer = document.getElementById('listeEcheancesGroupes');

    if (!containerMulti || !champSimple || !listeContainer) return;

    // 🆕 Beta 98.4 : Lire les bornes du trimestre pour contraindre les date pickers
    const cadreCalendrier = db.getSync(cle('cadreCalendrier'), null);
    const dateMinTrimestre = cadreCalendrier ? cadreCalendrier.dateDebut : null;
    const dateMaxTrimestre = cadreCalendrier ? cadreCalendrier.finCours : null;

    // Appliquer min/max sur le champ date simple
    const inputSimple = document.getElementById('productionDateEcheance');
    if (inputSimple) {
        if (dateMinTrimestre) inputSimple.setAttribute('min', dateMinTrimestre);
        if (dateMaxTrimestre) inputSimple.setAttribute('max', dateMaxTrimestre);
    }

    // Identifier le coursId de la production (ou du cours actif pour une nouvelle)
    const coursIdProd = (production && production.coursId)
        ? production.coursId
        : (typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null);

    if (!coursIdProd) {
        // Pas de cours identifié — mode simple
        containerMulti.classList.add('u-hide');
        champSimple.style.display = '';
        return;
    }

    // Lire les groupes-cours du trimestre actif
    const groupesCours = db.getSync(cle('groupesCours'), []);

    // Trouver les groupes frères : tous les GC dont le coursId correspond à celui de la production
    // groupesCours.coursId pointe directement vers le cours-entité (clé 'cours' ou 'listeCours')
    const groupesFreres = groupesCours.filter(gc => gc.coursId === coursIdProd);

    if (groupesFreres.length <= 1) {
        // Un seul groupe — mode simple
        containerMulti.classList.add('u-hide');
        champSimple.style.display = '';

        // 🆕 Beta 98.4 : Indicateur de séance en mode simple
        if (inputSimple) {
            const groupeNum = groupesFreres.length === 1 ? (groupesFreres[0].groupe || groupesFreres[0].groupeNum || null) : null;
            let spanSimple = inputSimple.parentElement.querySelector('.info-seance-echeance');
            if (!spanSimple) {
                spanSimple = document.createElement('span');
                spanSimple.className = 'info-seance-echeance';
                spanSimple.style.cssText = 'font-size: 0.85em; color: var(--texte-secondaire, #999); display: block; margin-top: 2px;';
                inputSimple.parentElement.appendChild(spanSimple);
            }
            const spanRef = spanSimple; // capture pour le listener
            inputSimple.addEventListener('change', () => {
                afficherInfoSeanceEcheance(spanRef, inputSimple.value, coursIdProd, groupeNum);
            });
            if (inputSimple.value) {
                afficherInfoSeanceEcheance(spanRef, inputSimple.value, coursIdProd, groupeNum);
            }
        }
        return;
    }

    // Mode multi-groupe : cacher le champ simple, afficher le conteneur multi
    champSimple.style.display = 'none';
    containerMulti.classList.remove('u-hide');

    // Construire le HTML pour chaque groupe
    const echeancesParGroupe = (production && production.echeancesParGroupe) || {};

    listeContainer.innerHTML = groupesFreres.map(gc => {
        const entree = echeancesParGroupe[gc.id];
        const estAssigne = entree ? (entree.assignee !== false) : false;
        const dateVal = entree ? (entree.date || '') : '';
        // Extraire un label court (ex: "gr. 00002").
        // gc.groupe est la source de vérité partout dans l'app (sélecteur d'en-tête,
        // changerGroupeCoursActifV2). gc.groupeNum sert de fallback pour les anciens
        // enregistrements ; les deux peuvent diverger après import/migration.
        const numGroupe = gc.groupe || gc.groupeNum || '?';
        const labelGroupe = `gr. ${String(numGroupe).padStart(5, '0')}`;

        return `<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;" data-gc-id="${gc.id}">
            <label style="display: flex; align-items: center; gap: 6px; min-width: 140px; cursor: pointer;">
                <input type="checkbox" class="echeance-gc-checkbox" data-gc-id="${gc.id}"
                    ${estAssigne ? 'checked' : ''}>
                <span>${labelGroupe}</span>
            </label>
            <input type="date" class="controle-form echeance-gc-date" data-gc-id="${gc.id}"
                value="${dateVal}" style="width: 180px;"
                ${dateMinTrimestre ? `min="${dateMinTrimestre}"` : ''}
                ${dateMaxTrimestre ? `max="${dateMaxTrimestre}"` : ''}
                ${estAssigne ? '' : 'disabled'}>
            <span class="info-seance-echeance" data-gc-id="${gc.id}" style="font-size: 0.85em; color: var(--texte-secondaire, #999); white-space: nowrap;"></span>
        </div>`;
    }).join('');

    // Event listeners : activer/désactiver le champ date selon la checkbox
    listeContainer.querySelectorAll('.echeance-gc-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            const gcId = cb.dataset.gcId;
            const dateInput = listeContainer.querySelector(`.echeance-gc-date[data-gc-id="${gcId}"]`);
            if (dateInput) {
                dateInput.disabled = !cb.checked;
            }
        });
    });

    // 🆕 Beta 98.4 : Indicateur de séance à côté des dates
    // Construire un map gcId → groupeNum pour les lookups
    const mapGcGroupeNum = {};
    groupesFreres.forEach(gc => { mapGcGroupeNum[gc.id] = gc.groupe || gc.groupeNum || null; });

    // Multi-groupe : listener change + affichage initial
    listeContainer.querySelectorAll('.echeance-gc-date').forEach(dateInput => {
        const gcId = dateInput.dataset.gcId;
        const groupeNum = mapGcGroupeNum[gcId] || null;
        const spanInfo = listeContainer.querySelector(`.info-seance-echeance[data-gc-id="${gcId}"]`);

        dateInput.addEventListener('change', () => {
            afficherInfoSeanceEcheance(spanInfo, dateInput.value, coursIdProd, groupeNum);
        });
        // Affichage initial si une date est déjà renseignée
        if (dateInput.value) {
            afficherInfoSeanceEcheance(spanInfo, dateInput.value, coursIdProd, groupeNum);
        }
    });

    // 🆕 Beta 98.4 : Avertissement en temps réel si date hors trimestre
    if (dateMinTrimestre || dateMaxTrimestre) {
        const labelDebut = dateMinTrimestre ? formaterDateCourte(dateMinTrimestre) : '?';
        const labelFin = dateMaxTrimestre ? formaterDateCourte(dateMaxTrimestre) : '?';

        // Multi-groupe
        listeContainer.querySelectorAll('.echeance-gc-date').forEach(dateInput => {
            dateInput.addEventListener('change', () => {
                verifierDateHorsTrimestre(dateInput, dateMinTrimestre, dateMaxTrimestre, labelDebut, labelFin);
            });
        });

        // Simple
        if (inputSimple) {
            inputSimple.addEventListener('change', () => {
                verifierDateHorsTrimestre(inputSimple, dateMinTrimestre, dateMaxTrimestre, labelDebut, labelFin);
            });
        }
    }
}

/**
 * 🆕 Beta 98.4 : Vérifie si une date est hors bornes du trimestre et affiche/retire un avertissement
 */
function verifierDateHorsTrimestre(inputDate, dateMin, dateMax, labelDebut, labelFin) {
    // Retirer un éventuel warning existant
    const existant = inputDate.parentElement.querySelector('.warn-hors-trimestre');
    if (existant) existant.remove();

    const val = inputDate.value;
    if (!val) return;

    const horsMin = dateMin && val < dateMin;
    const horsMax = dateMax && val > dateMax;

    if (horsMin || horsMax) {
        const span = document.createElement('span');
        span.className = 'warn-hors-trimestre';
        span.style.cssText = 'color: var(--btn-annuler); font-size: 0.85em; display: block; margin-top: 2px;';
        span.textContent = `⚠ Hors trimestre (${labelDebut} – ${labelFin})`;
        inputDate.parentElement.appendChild(span);
    }
}

/**
 * 🆕 Beta 98.4 : Affiche l'info de séance correspondant à une date d'échéance
 * Ex: "Sem. 4, lundi — 1re séance"
 *
 * @param {HTMLElement} spanInfo - Le <span> où afficher le texte
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @param {string|null} coursId - ID du cours
 * @param {string|null} groupeNum - Numéro du groupe (ex: "00002") pour filtrer les séances
 */
function afficherInfoSeanceEcheance(spanInfo, dateStr, coursId, groupeNum) {
    if (!spanInfo) return;
    spanInfo.textContent = '';

    if (!dateStr) return;

    // Jour de la semaine en français
    const dateObj = new Date(dateStr + 'T12:00:00');
    const jourSemaine = dateObj.toLocaleDateString('fr-CA', { weekday: 'long' });
    const jourMaj = jourSemaine.charAt(0).toUpperCase() + jourSemaine.slice(1);

    // Numéro de semaine depuis le calendrier complet
    const calendrier = db.getSync(cle('calendrierComplet'), {});
    const infoJour = calendrier[dateStr];
    let numSemaine = infoJour ? infoJour.numeroSemaine : null;

    // Fallback : déduire la semaine du voisinage si jour absent du calendrier
    if (!numSemaine) {
        const jourDeSemaine = dateObj.getDay();
        for (let delta = -6; delta <= 6; delta++) {
            if (delta === 0) continue;
            const voisin = new Date(dateObj);
            voisin.setDate(voisin.getDate() + delta);
            const voisinStr = voisin.toISOString().split('T')[0];
            const infoV = calendrier[voisinStr];
            if (infoV && infoV.numeroSemaine) {
                // Vérifier même semaine calendaire (même lundi)
                const lundiDate = new Date(dateObj);
                lundiDate.setDate(lundiDate.getDate() - ((jourDeSemaine + 6) % 7));
                const lundiVoisin = new Date(voisin);
                lundiVoisin.setDate(lundiVoisin.getDate() - ((voisin.getDay() + 6) % 7));
                if (lundiDate.toISOString().split('T')[0] === lundiVoisin.toISOString().split('T')[0]) {
                    numSemaine = infoV.numeroSemaine;
                    break;
                }
            }
        }
    }

    if (!numSemaine) {
        spanInfo.textContent = jourMaj;
        return;
    }

    // Rang de la séance dans la semaine, filtré par groupe
    let rang = 0;
    let total = 0;

    if (typeof obtenirSeancesCompletes === 'function') {
        const seancesCompletes = obtenirSeancesCompletes(coursId);

        // Filtrer par groupe si possible
        let datesGroupeSemaine = [];
        if (groupeNum) {
            datesGroupeSemaine = Object.entries(seancesCompletes)
                .filter(([date, seances]) => {
                    const info = calendrier[date];
                    if (!info || info.numeroSemaine !== numSemaine) return false;
                    return Array.isArray(seances) && seances.some(s => s.groupe === groupeNum);
                })
                .map(([date]) => date)
                .sort();
        }

        // Fallback : toutes les séances du cours si le filtre par groupe ne donne rien
        if (datesGroupeSemaine.length === 0) {
            datesGroupeSemaine = Object.entries(seancesCompletes)
                .filter(([date, seances]) => {
                    const info = calendrier[date];
                    if (!info || info.numeroSemaine !== numSemaine) return false;
                    return Array.isArray(seances) && seances.length > 0;
                })
                .map(([date]) => date)
                .sort();
        }

        rang = datesGroupeSemaine.indexOf(dateStr) + 1;
        total = datesGroupeSemaine.length;

        // Si la date n'est pas pile un jour de séance, trouver la séance la plus proche suivante
        if (rang === 0 && datesGroupeSemaine.length > 0) {
            const prochaine = datesGroupeSemaine.find(d => d >= dateStr);
            if (prochaine) {
                rang = datesGroupeSemaine.indexOf(prochaine) + 1;
            } else {
                // Après la dernière séance de la semaine
                rang = datesGroupeSemaine.length;
            }
        }
    }

    // Construire le label : "lundi 16 fév., 1re séance de la semaine 4"
    const dateCourte = (typeof formaterDateCourte === 'function') ? formaterDateCourte(dateStr) : '';
    const prefixe = `${jourMaj.toLowerCase()} ${dateCourte}`;

    if (rang > 0) {
        const ordinaux = ['', '1re', '2e', '3e', '4e', '5e'];
        const ordinal = ordinaux[rang] || `${rang}e`;
        spanInfo.textContent = `${prefixe}, ${ordinal} séance de la semaine ${numSemaine}`;
    } else {
        spanInfo.textContent = `${prefixe}, semaine ${numSemaine}`;
    }
}

/**
 * 🆕 Beta 98.3 : Lire les échéances par groupe depuis le formulaire multi-groupe
 * @returns {Object|null} echeancesParGroupe ou null si mode simple
 */
function lireEcheancesParGroupeDepuisFormulaire() {
    const containerMulti = document.getElementById('containerEcheancesGroupes');
    if (!containerMulti || containerMulti.classList.contains('u-hide')) return null;

    const listeContainer = document.getElementById('listeEcheancesGroupes');
    if (!listeContainer) return null;

    const result = {};
    const checkboxes = listeContainer.querySelectorAll('.echeance-gc-checkbox');
    checkboxes.forEach(cb => {
        const gcId = cb.dataset.gcId;
        const dateInput = listeContainer.querySelector(`.echeance-gc-date[data-gc-id="${gcId}"]`);
        result[gcId] = {
            assignee: cb.checked,
            date: (dateInput && dateInput.value) ? dateInput.value : null
        };
    });

    return Object.keys(result).length > 0 ? result : null;
}

/**
 * Affiche et configure le formulaire de production
 *
 * @param {string} id - ID de la production à modifier (null pour création)
 *
 * UTILISÉ PAR:
 * - Bouton "Ajouter une production"
 * - modifierEvaluation(id) pour édition
 * 
 * FONCTIONNEMENT:
 * 1. Affiche le formulaire
 * 2. Cache le bouton d'ajout
 * 3. Si id fourni : mode modification
 *    - Charge les données de la production
 *    - Remplit les champs du formulaire
 *    - Change le titre et le texte du bouton
 * 4. Sinon : mode création
 *    - Vide tous les champs
 *    - Titre "Nouvelle production"
 * 5. Charge la liste des grilles disponibles
 */
async function afficherFormProduction(id) {

    const form = document.getElementById('formulaireProduction');
    const btnAjouter = document.getElementById('btnajouterProduction');
    const titre = document.getElementById('titreFormEvaluation');
    const btnTexte = document.getElementById('btnTexteEvaluation');

    // Afficher le formulaire et cacher le bouton d'ajout (si les éléments existent)
    if (form) form.classList.remove('u-hide');
    if (btnAjouter) btnAjouter.classList.add('u-hide');

    // Charger la liste des grilles dans le select (si l'élément existe)
    const selectGrille = document.getElementById('productionGrille');
    const selectGrilleInline = document.getElementById('productionGrilleInline');


    if (selectGrille || selectGrilleInline) {
        // 🆕 Beta 95.4 : Utiliser la clé namespacée pour n'afficher que les grilles du trimestre
        const cleGrilles = cle('grillesTemplates');
        const grilles = await db.get(cleGrilles) || [];

        const optionsHtml = '<option value="">Aucune</option>' +
            grilles.map(g => `<option value="${g.id}">${g.nom}</option>`).join('');

        if (selectGrille) {
            selectGrille.innerHTML = optionsHtml;
        }
        if (selectGrilleInline) {
            selectGrilleInline.innerHTML = optionsHtml;
        }
    }

    // 🆕 Peupler le select Échelle de performance
    const selectEchelle = document.getElementById('productionEchelle');
    if (selectEchelle) {
        const echelles = await db.get('echellesTemplates') || [];
        selectEchelle.innerHTML = '<option value="">Aucune</option>' +
            echelles.map(e => `<option value="${e.id}">${e.nom}</option>`).join('');
    }

    // 🆕 Peupler le select Cartouche (dépend de la grille sélectionnée)
    const selectCartouche = document.getElementById('productionCartouche');
    const peuplerCartouchesProduction = async (grilleId) => {
        if (!selectCartouche) return;
        if (!grilleId) {
            selectCartouche.innerHTML = '<option value="">Aucune</option>';
            return;
        }
        const cartouches = await db.get(`cartouches_${grilleId}`) || [];
        selectCartouche.innerHTML = '<option value="">Aucune</option>' +
            cartouches.map(c => `<option value="${c.id}">${echapperHtml(c.nom)}</option>`).join('');
    };

    // Listener : repeupler cartouches quand la grille change
    if (selectGrille) {
        selectGrille.addEventListener('change', () => peuplerCartouchesProduction(selectGrille.value));
    }

    // Peupler cartouches avec la grille initiale (si déjà sélectionnée)
    if (selectGrille && selectGrille.value) {
        await peuplerCartouchesProduction(selectGrille.value);
    }

    if (id) {
        // Mode modification
        // 🆕 Beta 95.4 : Utiliser la clé namespacée pour le trimestre actif
        const cleProductions = cle('productions');
        const evaluations = await db.get(cleProductions) || [];

        // Debug détaillé de la recherche
        evaluations.forEach((e, idx) => {
            const match = e.id === id;
        });

        const prod = evaluations.find(e => e.id === id);

        if (prod) {
            productionEnEdition = id;
            if (titre) titre.textContent = 'Modifier l\'évaluation';
            if (btnTexte) btnTexte.textContent = 'Sauvegarder';

            document.getElementById('productionTitre').value = prod.titre;
            document.getElementById('productionActivite').value = prod.activiteApprentissage || prod.description || '';
            document.getElementById('productionType').value = prod.type;
            document.getElementById('productionPonderation').value = prod.ponderation;
            if (selectGrille) selectGrille.value = prod.grilleId || '';

            // 🆕 Pré-remplir échelle et cartouche depuis la production
            if (selectEchelle && prod.echelleId) selectEchelle.value = prod.echelleId;
            if (prod.grilleId) {
                await peuplerCartouchesProduction(prod.grilleId);
                if (selectCartouche && prod.cartoucheId) selectCartouche.value = prod.cartoucheId;
            }

            document.getElementById('productionObjectif').value = prod.objectif || '';
            document.getElementById('productionTache').value = prod.tache || '';

            // ✨ NOUVEAU (Beta 94 - 10 déc 2025): Charger date d'échéance
            document.getElementById('productionDateEcheance').value = prod.dateEcheance || '';

            // 🆕 Beta 98.3 : Échéances par groupe-cours (multi-groupe)
            peuplerEcheancesParGroupe(prod);

            // 🆕 Beta 95.4 : Catégorie (Sélection/Obligatoire) déplacée vers Structure des évaluations
            // La catégorie est maintenant gérée via checkboxes dans Pratiques → Structure des évaluations

            // Gérer l'affichage des champs spécifiques au type
            gererChangementTypeProduction();

            // Synchroniser la grille inline si c'est un artefact de portfolio
            const selectGrilleInline = document.getElementById('productionGrilleInline');
            if (selectGrilleInline && prod.type === 'artefact-portfolio') {
                selectGrilleInline.value = prod.grilleId || '';
            }

            // Si c'est un portfolio, pas de configuration supplémentaire
            // Les règles de calcul (nombreARetenir, etc.) sont dans Réglages → Pratique de notation
            if (prod.type === 'portfolio') {
            }

            // Afficher les checkboxes de pratiques compatibles
            const checkboxesContainer = document.getElementById('checkboxesPratiquesProduction');
            if (checkboxesContainer && typeof GabaritsUtils !== 'undefined') {
                checkboxesContainer.innerHTML = GabaritsUtils.genererCheckboxesPratiques('production', prod.pratiquesCompatibles || []);
            }
        } else {
            // Production non trouvée
            console.error('❌ Production non trouvée avec ID:', id);
            console.error('IDs disponibles:', evaluations.map(e => ({ id: e.id, titre: e.titre })));

            if (typeof afficherNotificationErreur === 'function') {
                afficherNotificationErreur('Évaluation introuvable', `ID: ${id}`);
            } else {
                alert('Erreur : Évaluation introuvable');
            }
            return;
        }
    } else {
        // Mode ajout
        productionEnEdition = null;
        if (titre) titre.textContent = 'Nouvelle production';
        if (btnTexte) btnTexte.textContent = 'Ajouter';

        // Réinitialiser les champs
        document.getElementById('productionTitre').value = '';
        document.getElementById('productionActivite').value = '';
        document.getElementById('productionType').value = '';
        document.getElementById('productionPonderation').value = '';
        if (selectGrille) selectGrille.value = '';
        if (selectEchelle) selectEchelle.value = '';
        if (selectCartouche) selectCartouche.innerHTML = '<option value="">Aucune</option>';
        document.getElementById('productionObjectif').value = '';
        document.getElementById('productionTache').value = '';

        // ✨ NOUVEAU (Beta 94 - 10 déc 2025): Réinitialiser date d'échéance
        document.getElementById('productionDateEcheance').value = '';

        // 🆕 Beta 98.3 : Échéances par groupe-cours (multi-groupe)
        peuplerEcheancesParGroupe(null);

        // Réinitialiser les checkboxes de pratiques compatibles
        const checkboxesContainer = document.getElementById('checkboxesPratiquesProduction');
        if (checkboxesContainer && typeof GabaritsUtils !== 'undefined') {
            checkboxesContainer.innerHTML = GabaritsUtils.genererCheckboxesPratiques('production', []);
        }

        // Réinitialiser les champs portfolio
        const portfolioNombreRetenir = document.getElementById('portfolioNombreRetenir');
        const portfolioMinimumCompleter = document.getElementById('portfolioMinimumCompleter');
        if (portfolioNombreRetenir) portfolioNombreRetenir.value = 3;
        if (portfolioMinimumCompleter) portfolioMinimumCompleter.value = 7;

        // Réinitialiser l'affichage
        gererChangementTypeProduction();
    }
}

/* ===============================
   FONCTION: SAUVEGARDER PRODUCTION
   Enregistre une production (création ou modification)
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Sauvegarde une production dans localStorage
 * 
 * UTILISÉ PAR:
 * - Bouton "Ajouter" ou "Sauvegarder" du formulaire
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les valeurs des champs
 * 2. Valide les champs obligatoires
 * 3. Si productionEnEdition existe : modification
 *    - Trouve la production existante
 *    - Met à jour ses propriétés
 * 4. Sinon : création
 *    - Génère un nouvel ID unique
 *    - Ajoute à la liste
 * 5. Gère les données spécifiques aux portfolios
 * 6. Sauvegarde dans localStorage
 * 7. Ferme le formulaire
 * 8. Rafraîchit l'affichage
 * 9. Affiche une notification de succès
 */

async function sauvegarderProduction() {
    const titre = document.getElementById('productionTitre').value.trim();
    const activiteApprentissage = document.getElementById('productionActivite').value.trim();
    const type = document.getElementById('productionType').value;
    const ponderation = parseInt(document.getElementById('productionPonderation').value) || 0;
    const objectif = document.getElementById('productionObjectif').value.trim();
    const tache = document.getElementById('productionTache').value.trim();

    // ✨ NOUVEAU (Beta 94 - 10 déc 2025): Date d'échéance
    // 🆕 Beta 98.3 : Lire les échéances multi-groupe si disponible
    const echeancesParGroupe = lireEcheancesParGroupeDepuisFormulaire();
    let dateEcheance;
    if (echeancesParGroupe) {
        // Synchroniser dateEcheance legacy avec la date du groupe actif
        const infoCoursActif = db.getSync('infoCours', null);
        const gcActifId = infoCoursActif ? (infoCoursActif._groupeCoursId || infoCoursActif.id || null) : null;
        const entreeActive = gcActifId ? echeancesParGroupe[gcActifId] : null;
        dateEcheance = (entreeActive && entreeActive.date) ? entreeActive.date : null;
        // Si aucun groupe actif trouvé, prendre la première date assignée
        if (!dateEcheance) {
            const premiereAssignee = Object.values(echeancesParGroupe).find(e => e.assignee && e.date);
            dateEcheance = premiereAssignee ? premiereAssignee.date : null;
        }
    } else {
        dateEcheance = document.getElementById('productionDateEcheance').value || null;
    }

    // Lire la grille depuis le select (même élément pour tous les types)
    const grille = document.getElementById('productionGrille');
    const grilleId = grille ? grille.value : '';

    // 🆕 Lire échelle et cartouche depuis les selects
    const echelleSelect = document.getElementById('productionEchelle');
    const echelleId = echelleSelect ? echelleSelect.value : '';
    const cartoucheSelect = document.getElementById('productionCartouche');
    const cartoucheId = cartoucheSelect ? cartoucheSelect.value : '';

    // ✅ NOUVEAU (Beta 94): Validation incluant dateEcheance obligatoire
    if (!titre || !type || (type !== 'artefact-portfolio' && ponderation === 0)) {
        alert('Veuillez remplir tous les champs obligatoires (Titre, Type et Pondération)');
        return;
    }

    // Les portfolios conteneurs n'ont pas d'échéance - seuls les artefacts individuels en ont
    // 🆕 Beta 98.3 : En mode multi-groupe, au moins un groupe assigné doit avoir une date
    const auMoinsUneDateAssignee = echeancesParGroupe
        ? Object.values(echeancesParGroupe).some(e => e.assignee && e.date)
        : !!dateEcheance;
    if (!auMoinsUneDateAssignee && type !== 'portfolio') {
        alert('La date d\'échéance est obligatoire pour les productions (sauf portfolios conteneurs)');
        return;
    }

    // 🆕 Beta 98.4 : Avertissement si dates hors bornes du trimestre
    if (type !== 'portfolio') {
        const cadreCalendrier = db.getSync(cle('cadreCalendrier'), null);
        const dateMinTri = cadreCalendrier ? cadreCalendrier.dateDebut : null;
        const dateMaxTri = cadreCalendrier ? cadreCalendrier.finCours : null;

        if (dateMinTri || dateMaxTri) {
            const horsLimites = [];

            if (echeancesParGroupe) {
                // Mode multi-groupe : vérifier chaque groupe assigné
                const groupesCours = db.getSync(cle('groupesCours'), []);
                for (const [gcId, entree] of Object.entries(echeancesParGroupe)) {
                    if (!entree.assignee || !entree.date) continue;
                    const horsMin = dateMinTri && entree.date < dateMinTri;
                    const horsMax = dateMaxTri && entree.date > dateMaxTri;
                    if (horsMin || horsMax) {
                        const gc = groupesCours.find(g => g.id === gcId);
                        const numGroupe = gc ? (gc.groupe || gc.groupeNum || '?') : '?';
                        const label = `gr. ${String(numGroupe).padStart(5, '0')}`;
                        horsLimites.push(`${label} (${entree.date})`);
                    }
                }
            } else if (dateEcheance) {
                // Mode simple
                const horsMin = dateMinTri && dateEcheance < dateMinTri;
                const horsMax = dateMaxTri && dateEcheance > dateMaxTri;
                if (horsMin || horsMax) {
                    horsLimites.push(dateEcheance);
                }
            }

            if (horsLimites.length > 0) {
                const labelDebut = dateMinTri ? formaterDateCourte(dateMinTri) : '?';
                const labelFin = dateMaxTri ? formaterDateCourte(dateMaxTri) : '?';
                const msg = horsLimites.length === 1
                    ? `L'échéance ${horsLimites[0]} est en dehors du trimestre (${labelDebut} – ${labelFin}). Sauvegarder quand même ?`
                    : `Les échéances suivantes sont en dehors du trimestre (${labelDebut} – ${labelFin}) :\n- ${horsLimites.join('\n- ')}\n\nSauvegarder quand même ?`;
                if (!confirm(msg)) return;
            }
        }
    }

    // 🆕 Beta 95.4 : Utiliser la clé namespacée pour le trimestre actif
    const cleProductions = cle('productions');
    let evaluations = await db.get(cleProductions) || [];

    // ✅ AJOUT (6 jan 2026) : Vérification des doublons
    const idActuel = productionEnEdition || null;
    const productionActuelle = idActuel ? evaluations.find(e => e.id === idActuel) : null;
    const isCreation = !productionEnEdition;
    const isNameChange = productionActuelle && productionActuelle.titre !== titre;

    if ((isCreation || isNameChange) && typeof verifierEtGererDoublon === 'function') {
        const resultat = await verifierEtGererDoublon('production', titre, evaluations.map(e => ({ ...e, nom: e.titre })), idActuel);

        if (resultat === null) {
            // Utilisateur a annulé
            return;
        }

        if (resultat && resultat.action === 'renommer') {
            document.getElementById('productionTitre').value = resultat.nouveauNom;
            // Mettre à jour la variable locale
            arguments[0] = resultat.nouveauNom; // Ne fonctionne pas, utiliser variable
        }

        if (resultat && resultat.action === 'ecraser') {
            // Supprimer la production existante avec le même titre
            evaluations = evaluations.filter(e => e.titre !== titre);
        }
    }

    // Re-lire le titre en cas de renommage
    const titreFinal = document.getElementById('productionTitre').value.trim();

    // ✅ CORRECTION CRITIQUE (Beta 95 - 27 déc 2025) : Ajouter coursId
    const coursId = typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null;
    if (!coursId) {
        console.warn('[Productions] ⚠️ Aucun cours actif - production créée sans coursId');
    }

    // Lire les pratiques compatibles
    const pratiquesCompatibles = typeof GabaritsUtils !== 'undefined'
        ? GabaritsUtils.lirePratiquesSelectionnees('production')
        : [];

    // Préparer l'objet de base
    // 🆕 Beta 95.4 : Catégorie déplacée vers Structure des évaluations
    // Préserver la catégorie existante si modification, sinon null pour nouvelle production
    const existingProd = evaluations.find(p => p.id === productionEnEdition);
    const categorieExistante = existingProd?.categorie || null;

    let productionData = {
        titre: titreFinal,  // ✅ Utilise titreFinal en cas de renommage
        activiteApprentissage,
        description: activiteApprentissage,  // Rétrocompat exports existants
        type,
        ponderation,
        objectif,
        tache,
        grilleId,
        echelleId,        // 🆕 Persistance échelle dans le gabarit
        cartoucheId,      // 🆕 Persistance cartouche dans le gabarit
        dateEcheance,     // ✨ NOUVEAU (Beta 94 - 10 déc 2025)
        echeancesParGroupe: echeancesParGroupe || undefined,  // 🆕 Beta 98.3 : multi-groupe
        pratiquesCompatibles,  // Pratiques de notation compatibles
        verrouille: false,
        dansBibliotheque: true,  // ✅ AJOUT (8 décembre 2025) - Nouvelle production dans bibliothèque par défaut
        coursId,  // ✅ CRITIQUE (Beta 95) : Lier la production au cours actif
        categorie: categorieExistante  // 🆕 Beta 95.4 : Préservée, gérée via Structure des évaluations
    };

    // Si c'est un Portfolio, ajouter les données spécifiques
    if (type === 'portfolio') {
        // ✅ CORRECTION Phase 3: Les règles de calcul ne sont PLUS sauvegardées ici
        // Elles sont configurées dans Réglages → Pratique de notation → Configuration PAN

        // Pas besoin de stocker artefactsIds - sera détecté dynamiquement
        productionData.modeCalcul = 'provisoire';
    }

    if (productionEnEdition) {
        // Modifier la production existante
        const index = evaluations.findIndex(e => e.id === productionEnEdition);
        if (index !== -1) {
            evaluations[index] = {
                ...evaluations[index],
                ...productionData
            };
            // 🆕 Beta 99.05 : Mise à jour dateModification systématique
            evaluations[index].dateModification = new Date().toISOString();

            // 🆕 Beta 95.4 : Ajouter contributeur si l'utilisateur actif n'est pas l'auteur
            if (typeof ajouterContributeurSiNecessaire === 'function') {
                evaluations[index] = ajouterContributeurSiNecessaire(evaluations[index]);
            }

        } else {
            console.error('❌ Index non trouvé pour ID:', productionEnEdition);
        }
    } else {
        // Ajouter nouvelle production
        productionData.id = genererIdUnique('PROD_');
        // 🆕 Beta 99.05 : Dates de création et modification
        productionData.dateCreation = new Date().toISOString();
        productionData.dateModification = new Date().toISOString();

        // Auteur CC = identité de l'utilisateur (Plan 1 §4.4)
        if (!productionData.metadata_cc) productionData.metadata_cc = {};
        productionData.metadata_cc.auteur_original = obtenirIdentiteCCUtilisateur();
        productionData.metadata_cc.date_creation = new Date().toISOString().split('T')[0];
        if (!productionData.metadata_cc.contributeurs) productionData.metadata_cc.contributeurs = [];

        evaluations.push(productionData);
    }

    await db.set(cleProductions, evaluations);

    // 🆕 BETA 95.1 : Garder l'ID pour réafficher après sauvegarde
    const idSauvegarde = productionEnEdition || productionData.id;

    annulerFormProduction();
    await afficherTableauProductions();
    await afficherToutesLesProductionsParType();
    await mettreAJourPonderationTotale();

    // Afficher la notification de succès si la fonction existe
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(productionEnEdition ?
            'Production modifiée avec succès !' :
            'Production ajoutée avec succès !');
    }

    // Mettre à jour le statut des modalités si la fonction existe
    if (typeof mettreAJourStatutModalites === 'function') {
        mettreAJourStatutModalites();
    }

    // Mettre à jour le select des productions dans le module Évaluation
    if (typeof window.chargerProductionsDansSelect === 'function') {
        window.chargerProductionsDansSelect();
    }

    // Mettre à jour le filtre de production dans la liste des évaluations
    if (typeof window.rechargerFiltreProduction === 'function') {
        window.rechargerFiltreProduction();
    }

    productionEnEdition = null;

    // 🆕 BETA 95.1 : Réouvrir la production en mode édition pour qu'elle reste visible
    if (idSauvegarde && typeof modifierProduction === 'function') {
        setTimeout(() => {
            modifierProduction(idSauvegarde);
        }, 100);
    }
}

/* ===============================
   ❌ FONCTION: ANNULER FORMULAIRE
   Cache le formulaire et réinitialise l'état
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Annule l'ajout ou la modification d'une production
 * 
 * UTILISÉ PAR:
 * - Bouton "Annuler" du formulaire
 * - sauvegarderProduction() après succès
 * 
 * FONCTIONNEMENT:
 * 1. Cache le formulaire
 * 2. Réaffiche le bouton d'ajout
 * 3. Réinitialise la variable productionEnEdition
 */
function annulerFormProduction() {
    // Cacher le formulaire
    const form = document.getElementById('formulaireProduction');
    if (form) form.classList.add('u-hide');

    // Réafficher le bouton d'ajout (si l'élément existe - pas présent dans layout sidebar)
    const btnAjouter = document.getElementById('btnajouterProduction');
    if (btnAjouter) btnAjouter.classList.remove('u-hide');

    // Réinitialiser la variable d'édition
    productionEnEdition = null;
}

/* ===============================
   FONCTION: MODIFIER ÉVALUATION
   Lance la modification d'une production
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Lance la modification d'une production existante
 *
 * @param {string} id - ID de la production à modifier
 *
 * UTILISÉ PAR:
 * - Bouton "Modifier" dans la liste des productions
 *
 * FONCTIONNEMENT:
 * Appelle simplement afficherFormProduction() avec l'ID
 *
 * NOTE: Renommée de modifierEvaluation() en modifierProduction()
 * pour éviter conflit avec la fonction du même nom dans evaluation.js
 */
async function modifierProduction(id) {
    await afficherFormProduction(id);
}

/* ===============================
   FONCTION: SUPPRIMER PRODUCTION
   Supprime une production après confirmation
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Supprime une production de la liste
 * 
 * @param {string} id - ID de la production à supprimer
 * 
 * UTILISÉ PAR:
 * - Bouton "Supprimer" dans la liste des productions
 * 
 * FONCTIONNEMENT:
 * 1. Demande confirmation
 * 2. Charge la liste des productions
 * 3. Filtre pour retirer la production ciblée
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'affichage
 * 6. Met à jour les pondérations
 */
async function supprimerProduction(id) {
    if (confirm('Es-tu sûr de vouloir supprimer cette production ?')) {
        let evaluations = await db.get(getCleProductions()) || [];
        evaluations = evaluations.filter(e => e.id !== id);

        await db.set(getCleProductions(), evaluations);
        await afficherTableauProductions();
        await afficherToutesLesProductionsParType();
        await mettreAJourPonderationTotale();

        // Mettre à jour le statut des modalités si la fonction existe
        if (typeof mettreAJourStatutModalites === 'function') {
            mettreAJourStatutModalites();
        }
    }
}

/* ===============================
   🔒 FONCTION: VERROUILLER ÉVALUATION
   Bascule le statut de verrouillage
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Bascule le verrouillage d'une production
 * 
 * @param {string} id - ID de la production
 * 
 * UTILISÉ PAR:
 * - Checkbox "Verrouiller" dans la liste
 * 
 * FONCTIONNEMENT:
 * 1. Charge la liste des productions
 * 2. Trouve la production ciblée
 * 3. Inverse son statut de verrouillage
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'affichage
 */
async function verrouillerEvaluation(id) {

    let evaluations = await db.get(getCleProductions()) || [];

    // Debug détaillé de la recherche
    evaluations.forEach((e, idx) => {
        const match = e.id === id;
    });

    const index = evaluations.findIndex(e => e.id === id);

    if (index !== -1) {
        evaluations[index].verrouille = !evaluations[index].verrouille;
        await db.set(getCleProductions(), evaluations);
        await afficherTableauProductions();
        await afficherToutesLesProductionsParType();

        // Notification de succès
        if (typeof afficherNotificationSucces === 'function') {
            const statut = evaluations[index].verrouille ? 'verrouillée' : 'déverrouillée';
            afficherNotificationSucces(`Production ${statut}`);
        }
    } else {
        // Si l'évaluation n'est pas trouvée, afficher une erreur
        console.error('❌ Production non trouvée!');
        console.error('ID recherché:', id);
        console.error('IDs disponibles:', evaluations.map(e => ({ id: e.id, titre: e.titre })));

        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur('Évaluation introuvable', `ID: ${id}`);
        } else {
            alert('Erreur : Évaluation introuvable');
        }
    }
}

/* ===============================
   FONCTION: MONTER ÉVALUATION
   Déplace une production vers le haut
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Monte une production d'une position dans la liste
 * 
 * @param {string} id - ID de la production
 * 
 * UTILISÉ PAR:
 * - Bouton "↑" dans la liste
 * 
 * FONCTIONNEMENT:
 * 1. Charge la liste des productions
 * 2. Trouve l'index de la production
 * 3. Si pas en première position : échange avec la précédente
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'affichage
 */
async function monterEvaluation(id) {
    let evaluations = await db.get(getCleProductions()) || [];
    const index = evaluations.findIndex(e => e.id === id);

    if (index > 0) {
        [evaluations[index - 1], evaluations[index]] = [evaluations[index], evaluations[index - 1]];
        await db.set(getCleProductions(), evaluations);
        await afficherTableauProductions();
        await afficherToutesLesProductionsParType();
    }
}

/* ===============================
   FONCTION: DESCENDRE ÉVALUATION
   Déplace une production vers le bas
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Descend une production d'une position dans la liste
 * 
 * @param {string} id - ID de la production
 * 
 * UTILISÉ PAR:
 * - Bouton "↓" dans la liste
 * 
 * FONCTIONNEMENT:
 * 1. Charge la liste des productions
 * 2. Trouve l'index de la production
 * 3. Si pas en dernière position : échange avec la suivante
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'affichage
 */
async function descendreEvaluation(id) {
    let evaluations = await db.get(getCleProductions()) || [];
    const index = evaluations.findIndex(e => e.id === id);

    if (index < evaluations.length - 1) {
        [evaluations[index], evaluations[index + 1]] = [evaluations[index + 1], evaluations[index]];
        await db.set(getCleProductions(), evaluations);
        await afficherTableauProductions();
        await afficherToutesLesProductionsParType();
    }
}

/* ===============================
   🎯 FONCTION: GÉRER CHANGEMENT TYPE
   Adapte l'UI selon le type de production
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Gère l'affichage conditionnel selon le type de production
 * 
 * UTILISÉ PAR:
 * - Select "Type" du formulaire (événement onchange)
 * - afficherFormProduction() lors du chargement
 * 
 * FONCTIONNEMENT:
 * 1. Récupère le type sélectionné
 * 2. Réinitialise l'affichage des sections
 * 3. Si "portfolio" :
 *    - Affiche les champs de configuration
 *    - Masque la sélection de grille
 * 4. Si "artefact-portfolio" :
 *    - Masque la pondération
 *    - Affiche un message informatif
 * 5. Sinon : affichage standard
 */
function gererChangementTypeProduction() {
    const type = document.getElementById('productionType').value;

    // ═══════════════════════════════════════════════════════════
    // DÉFINITIONS DES TYPES DE PRODUCTION
    // ═══════════════════════════════════════════════════════════
    const definitions = {
        'examen': '<strong>Examen :</strong> Évaluation écrite en temps limité, en classe, sous supervision.',
        'travail': '<strong>Travail écrit :</strong> Production écrite sur période étendue, à la maison ou en classe.',
        'quiz': '<strong>Quiz/Test :</strong> Évaluation courte, sous forme de questionnaire à choix multiples ou de réponses à développement.',
        'laboratoire': '<strong>Laboratoire :</strong> Travail pratique en laboratoire avec rapport.',
        'presentation': '<strong>Présentation :</strong> Production orale devant un auditoire, généralement unidirectionnelle.',
        'entrevue': '<strong>Entrevue :</strong> Production orale devant un individu, généralement bidirectionnelle.',
        'projet': '<strong>Projet :</strong> Production complexe et multi-tâches selon un processus.',
        'stage': '<strong>Stage :</strong> Expérience pratique dans une entreprise pour découvrir un métier, un secteur ou valider un projet professionnel. Le stage vise l\'apprentissage (découverte/exploration) plutôt que la production. Sa durée varie de quelques heures à quelques semaines et il est suivi par un tuteur.',
        'autre': '<strong>Autre :</strong> Tout autre type de production (participation, activités, etc.).',
        'portfolio': '<strong>Portfolio (conteneur) :</strong> Regroupement d\'artefacts permettant d\'évaluer la progression. Le portfolio inclura automatiquement toutes les productions de type «Artefact». Il n\'est pas comptabilisé dans l\'indice de <strong>Complétion (C)</strong>.',
        'artefact-portfolio': '<strong>Artefact :</strong> Production ciblée sur une tâche de nature variée et rattachée au portfolio.<br><br>Les artefacts n\'ont pas de pondération propre. C\'est le portfolio conteneur qui définit la pondération globale.<br><br><em>Pour paramétrer la valeur des artefacts, allez dans « Structure des évaluations » dans les Pratiques de notation.</em>'
    };

    // Éléments Définition (carte dynamique)
    const carteDefinition = document.getElementById('carteDefinitionType');
    const texteDefinition = document.getElementById('texteDefinitionType');

    // Éléments Pondération (Ligne 3 gauche)
    const inputPonderation = document.getElementById('productionPonderation');
    const notePonderation = document.getElementById('notePonderation');

    // Éléments Grille (Ligne 3 droite)
    const selectGrille = document.getElementById('productionGrille');
    const noteGrille = document.getElementById('noteGrille');

    // Éléments Date d'échéance (Section 5)
    const inputDateEcheance = document.getElementById('productionDateEcheance');
    const asterisqueDateEcheance = document.getElementById('asterisqueDateEcheance');
    const noteExplicativeDateEcheance = document.getElementById('noteExplicativeDateEcheance');

    // Ancien élément (compatibilité)
    const champsPortfolio = document.getElementById('champsPortfolio');

    // ═══════════════════════════════════════════════════════════
    // RÉINITIALISER : affichage par défaut
    // ═══════════════════════════════════════════════════════════

    // Masquer la carte définition par défaut
    if (carteDefinition) carteDefinition.classList.add('u-hide');

    // Pondération : actif et visible par défaut
    const groupePonderation = inputPonderation?.closest('.groupe-form');
    if (groupePonderation) {
        groupePonderation.style.display = ''; // Réafficher si masqué
    }
    if (inputPonderation) {
        inputPonderation.disabled = false;
        inputPonderation.style.opacity = '1';
        inputPonderation.style.cursor = 'text';
    }
    if (notePonderation) {
        notePonderation.classList.add('u-hide');
        notePonderation.innerHTML = '';
    }

    // Grille : actif par défaut
    if (selectGrille) {
        selectGrille.disabled = false;
        selectGrille.style.opacity = '1';
        selectGrille.style.cursor = 'pointer';
    }
    if (noteGrille) {
        noteGrille.classList.add('u-hide');
        noteGrille.innerHTML = '';
    }

    // Date d'échéance : actif par défaut
    if (inputDateEcheance) {
        inputDateEcheance.disabled = false;
        inputDateEcheance.style.opacity = '1';
        inputDateEcheance.style.cursor = 'pointer';
    }
    if (asterisqueDateEcheance) asterisqueDateEcheance.classList.remove('u-hide');
    if (noteExplicativeDateEcheance) {
        noteExplicativeDateEcheance.innerHTML = 'Cette date fixe les indices <strong>C</strong> (Complétion) et <strong>P</strong> (Performance) pour les suivis longitudinaux.';
    }

    if (champsPortfolio) champsPortfolio.classList.add('u-hide');

    // ═══════════════════════════════════════════════════════════
    // AFFICHER LA DÉFINITION si un type est sélectionné
    // ═══════════════════════════════════════════════════════════
    if (type && definitions[type]) {
        if (carteDefinition) carteDefinition.classList.remove('u-hide');
        if (texteDefinition) texteDefinition.innerHTML = definitions[type];
    }

    // ═══════════════════════════════════════════════════════════
    // APPLIQUER : configuration spécifique selon le type
    // ═══════════════════════════════════════════════════════════
    if (type === 'portfolio') {
        // PORTFOLIO CONTENEUR
        // Note explicative pour la pondération (champ reste actif)
        if (notePonderation) {
            notePonderation.classList.remove('u-hide');
            notePonderation.innerHTML = 'Les règles de calcul du portfolio se configurent dans <strong>Construction de la note → Pratique de notation</strong>.';
        }

        // Griser la grille de critères + note
        if (selectGrille) {
            selectGrille.disabled = true;
            selectGrille.style.opacity = '0.5';
            selectGrille.style.cursor = 'not-allowed';
            selectGrille.value = '';
        }
        if (noteGrille) {
            noteGrille.classList.remove('u-hide');
            noteGrille.innerHTML = 'Ce n\'est pas le portfolio comme tel qui est évalué, mais les artefacts qui le composent.';
        }

        // Griser la date d'échéance + note
        if (inputDateEcheance) {
            inputDateEcheance.disabled = true;
            inputDateEcheance.style.opacity = '0.5';
            inputDateEcheance.style.cursor = 'not-allowed';
            inputDateEcheance.value = '';
        }
        if (asterisqueDateEcheance) asterisqueDateEcheance.classList.add('u-hide');
        if (noteExplicativeDateEcheance) {
            noteExplicativeDateEcheance.innerHTML = 'Le portfolio conteneur n\'a pas de date d\'échéance. Seuls les <strong>artefacts individuels</strong> ont une date d\'échéance.';
        }

    } else if (type === 'artefact-portfolio') {
        // ARTEFACT DE PORTFOLIO
        // 🆕 Beta 95.4 : Masquer complètement le champ pondération (info dans la carte définition)
        if (groupePonderation) {
            groupePonderation.classList.add('u-hide');
        }
        if (notePonderation) {
            notePonderation.classList.add('u-hide');
        }

        // Note explicative pour la grille (champ reste actif)
        if (noteGrille) {
            noteGrille.classList.remove('u-hide');
            noteGrille.innerHTML = 'Chaque artefact peut avoir sa propre grille de critères.';
        }

    } else if (type) {
        // PRODUCTION STANDARD (examen, travail, quiz, laboratoire, présentation, projet, autre)
        // Note explicative pour la pondération
        if (notePonderation) {
            notePonderation.classList.remove('u-hide');
            notePonderation.innerHTML = 'Pour une évaluation formative, utilisez une pondération de 0%.';
        }
    }
}

/**
 * Synchronise les deux selects de grille (inline et séparée)
 */
function synchroniserGrilles() {
    const grilleStandard = document.getElementById('productionGrille');
    const grilleInline = document.getElementById('productionGrilleInline');

    if (grilleStandard && grilleInline) {
        // Copier les options si nécessaire
        if (grilleInline.options.length === 1) { // Seulement "Aucune"
            grilleInline.innerHTML = grilleStandard.innerHTML;
        }
        // Synchroniser la valeur sélectionnée
        grilleInline.value = grilleStandard.value;
    }
}

/* ===============================
   📁 FONCTION: CHARGER ARTEFACTS DISPONIBLES
   Liste les artefacts pour un portfolio
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Charge et affiche les artefacts disponibles pour un portfolio
 * 
 * UTILISÉ PAR:
 * - Interface de gestion de portfolio (usage futur)
 * 
 * FONCTIONNEMENT:
 * 1. Charge toutes les productions
 * 2. Filtre celles de type "artefact-portfolio"
 * 3. Si aucun : affiche un message
 * 4. Sinon : génère des checkboxes pour chaque artefact
 */
async function chargerArtefactsDisponibles() {
    const evaluations = await db.get(getCleProductions()) || [];
    const artefacts = evaluations.filter(p => p.type === 'artefact-portfolio');
    const container = document.getElementById('listeArtefactsDisponibles');

    if (!container) return;

    if (artefacts.length === 0) {
        container.innerHTML = '<p class="text-muted prod-italic">Aucun artefact de type "Artefact d\'un portfolio" n\'existe encore. Crée-les d\'abord.</p>';
        return;
    }

    container.innerHTML = artefacts.map(art => `
        <label style="display: block; padding: 8px; margin-bottom: 5px; 
               background: var(--bleu-tres-pale); border-radius: 4px; cursor: pointer;">
            <input type="checkbox" name="artefactPortfolio" value="${art.id}"
                   class="u-mr-10">
            <strong>${art.description || art.titre}</strong>
        </label>
    `).join('');
}

/* ===============================
   FONCTION: METTRE À JOUR PONDÉRATION TOTALE
   Calcule et affiche la pondération totale
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Calcule la pondération totale et met à jour l'affichage
 * 
 * UTILISÉ PAR:
 * - afficherTableauProductions() après chargement
 * - sauvegarderProduction() après ajout/modification
 * - supprimerProduction() après suppression
 * 
 * FONCTIONNEMENT:
 * 1. Charge toutes les productions
 * 2. Filtre les artefacts-portfolio (ne comptent pas)
 * 3. Calcule la somme des pondérations
 * 4. Affiche le total
 * 5. Affiche un statut coloré :
 *    - Vert si = 100%
 *    - Rouge si > 100%
 *    - Orange si < 100%
 */
async function mettreAJourPonderationTotale() {
    const productions = await db.get(getCleProductions()) || [];

    // Ignorer les artefacts-portfolio dans le calcul (ils font partie du Portfolio)
    const productionsComptees = productions.filter(p => p.type !== 'artefact-portfolio');

    const total = productionsComptees.reduce((sum, prod) => sum + (prod.ponderation || 0), 0);

    document.getElementById('ponderationTotale').textContent = total + '%';

    const statut = document.getElementById('statutPonderation');
    if (total === 100) {
        statut.textContent = '✓ Pondération correcte';
        statut.style.color = 'var(--vert-succes)';
    } else if (total > 100) {
        statut.textContent = `${total - 100}% en trop`;
        statut.style.color = 'var(--rouge-erreur)';
    } else {
        statut.textContent = `${100 - total}% manquant`;
        statut.style.color = 'var(--btn-annuler)';
    }
}

/* ===============================
   📈 FONCTION: METTRE À JOUR RÉSUMÉ TYPES
   Génère le résumé des types de productions
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Génère un résumé textuel des types de productions
 * 
 * @param {Array} evaluations - Liste des productions
 * 
 * UTILISÉ PAR:
 * - afficherTableauProductions() après affichage
 * 
 * FONCTIONNEMENT:
 * 1. Compte les occurrences de chaque type
 * 2. Génère un texte du type "2 examens, 1 portfolio, 3 travaux"
 * 3. Affiche dans l'élément #typesEvaluations
 */
function mettreAJourResumeTypes(evaluations) {
    const compteurTypes = {};
    evaluations.forEach(prod => {
        compteurTypes[prod.type] = (compteurTypes[prod.type] || 0) + 1;
    });

    const resume = Object.entries(compteurTypes)
        .map(([type, count]) => `${count} ${getTypeLabel(type).toLowerCase()}${count > 1 ? 's' : ''}`)
        .join(', ');

    document.getElementById('typesEvaluations').textContent = resume || 'Aucune évaluation';
}

/* ===============================
   FONCTION: GET TYPE LABEL
   Retourne le libellé d'un type de production
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Convertit un code de type en libellé lisible
 * 
 * @param {string} type - Code du type
 * @returns {string} - Libellé du type
 * 
 * UTILISÉ PAR:
 * - afficherTableauProductions() pour l'affichage
 * - mettreAJourResumeTypes() pour le résumé
 * 
 * TYPES DISPONIBLES:
 * - examen : Examen
 * - travail : Travail écrit
 * - quiz : Quiz/Test
 * - presentation : Présentation
 * - portfolio : 📁 Portfolio (conteneur)
 * - artefact-portfolio : Artefact d'un portfolio
 * - autre : Autre
 */
function getTypeLabel(type) {
    const labels = {
        'examen': 'Examen',
        'travail': 'Travail écrit',
        'quiz': 'Quiz/Test',
        'presentation': 'Présentation',
        'portfolio': '📁 Portfolio (conteneur)',
        'artefact-portfolio': 'Artefact d\'un portfolio',
        'autre': 'Autre'
    };
    return labels[type] || type;
}

/* ===============================
   📁 FONCTION: GÉRER PORTFOLIO (PLACEHOLDER)
   Fonctionnalité à développer
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Gère un portfolio (fonctionnalité à venir)
 * 
 * @param {string} id - ID du portfolio
 * 
 * NOTE: Cette fonction est un placeholder pour une fonctionnalité future
 * qui permettra de gérer en détail les portfolios et leurs artefacts
 */
function gererPortfolio(id) {
    alert('Fonctionnalité "Gérer le portfolio" à venir.\nPortfolio ID: ' + id);
    // TODO: Créer une interface dédiée pour gérer les portfolios
    // - Sélectionner les artefacts inclus
    // - Définir les règles de sélection
    // - Gérer le mode provisoire/final
}

/* ===============================
   NOUVELLE VUE HIÉRARCHIQUE
   Affichage groupé par type de production
   =============================== */

/**
 * Affiche toutes les productions regroupées par type
 *
 * GROUPES:
 * 1. Portfolio + artefacts (portfolio et artefact-portfolio)
 * 2. Évaluations sommatives (examen, travail, quiz, presentation, autre)
 * 3. Évaluations formatives (types avec '-formatif')
 *
 * FONCTIONNEMENT:
 * - Utilise <details> pour sections repliables
 * - Chaque section affiche ses productions
 * - Bouton contextuel pour ajouter une production au type
 */
async function afficherToutesLesProductionsParType() {
    const container = document.getElementById('vueProductionsParType');
    if (!container) return;

    const productions = await db.get(getCleProductions()) || [];
    const grilles = await db.get('grillesTemplates') || [];

    if (productions.length === 0) {
        container.innerHTML = `
            <div class="production-vide">
                <p>Aucune production définie</p>
                <small>Ajoute une production en utilisant les boutons ci-dessous</small>
            </div>
        `;
        return;
    }

    // Grouper les productions
    const portfolio = productions.find(p => p.type === 'portfolio');
    const artefacts = productions.filter(p => p.type === 'artefact-portfolio');
    const sommatives = productions.filter(p =>
        !p.type.includes('formatif') &&
        p.type !== 'portfolio' &&
        p.type !== 'artefact-portfolio'
    );
    const formatives = productions.filter(p => p.type.includes('formatif'));

    /**
     * Fonction helper pour générer le HTML d'une production (format compact optimisé)
     */
    function genererHtmlProduction(prod, index, total) {
        // Debug: vérifier si la production a un ID
        if (!prod.id) {
            console.error('❌ Production sans ID détectée:', prod);
            console.error('   Titre:', prod.titre);
            console.error('   Type:', prod.type);
        }

        const grilleAssociee = grilles.find(g => g.id === prod.grilleId);
        const nomGrille = grilleAssociee ? grilleAssociee.nom : 'Aucune grille';
        const estPortfolio = prod.type === 'portfolio';
        const estArtefact = prod.type === 'artefact-portfolio';
        const bgColor = estPortfolio ? 'var(--bleu-carte)' : 'white';
        const borderColor = estPortfolio ? 'var(--accent-primaire)' : estArtefact ? 'var(--bleu-leger)' : 'var(--orange-accent)';

        return `
            <div class="item-liste" style="background: ${bgColor}; margin-bottom: 8px; padding: 12px 15px;
                 border-left: 4px solid ${borderColor};">
                <div class="production-compact-header">
                    <div class="prod-flex-1">
                        <div class="production-compact-titre">
                            ${estPortfolio ? '📁 ' : ''}${echapperHtml(prod.titre)}${(prod.activiteApprentissage || prod.description) ? ' - ' + echapperHtml(prod.activiteApprentissage || prod.description) : ''}
                        </div>
                        <div class="production-compact-meta">
                            ${getTypeLabel(prod.type)}
                            ${!estArtefact ? `<span class="production-separateur">•</span>
                            <strong class="production-ponderation">${prod.ponderation}%</strong>` : ''}
                            ${!estPortfolio && nomGrille !== 'Aucune grille' ? `<span class="production-separateur">•</span>
                            ${echapperHtml(nomGrille)}` : ''}
                        </div>
                        ${estPortfolio && prod.artefactsIds && prod.artefactsIds.length > 0 ? `
                            <div class="production-compact-meta u-mt-6">
                                📦 ${prod.artefactsIds.length} artefacts • ${prod.regles.nombreARetenir} à retenir • Min. ${prod.regles.minimumCompletion} complétés
                            </div>
                        ` : ''}
                        ${prod.objectif || prod.tache ? `
                            <div class="production-compact-meta u-mt-6">
                                ${prod.objectif ? `✴️ ${echapperHtml(prod.objectif)}` : ''}
                                ${prod.objectif && prod.tache ? ' • ' : ''}
                                ${prod.tache ? `✏️ ${echapperHtml(prod.tache)}` : ''}
                            </div>
                        ` : ''}
                    </div>
                    <div style="white-space: nowrap; margin-left: 15px;">
                        ${index > 0 ?
                            `<button data-action="monterEvaluation" data-param="${prod.id}" class="btn btn-principal"
                             style="padding: 4px 8px; font-size: 0.8rem; margin-right: 3px;">↑</button>` : ''}
                        ${index < total - 1 ?
                            `<button data-action="descendreEvaluation" data-param="${prod.id}" class="btn btn-principal"
                             style="padding: 4px 8px; font-size: 0.8rem; margin-right: 3px;">↓</button>` : ''}
                        <button data-action="modifierProduction" data-param="${prod.id || 'ERROR_NO_ID'}" class="btn btn-modifier"
                                style="padding: 4px 10px; font-size: 0.8rem; margin-right: 3px;">Modifier</button>
                        <button data-action="supprimerProduction" data-param="${prod.id}" class="btn btn-supprimer"
                                style="padding: 4px 10px; font-size: 0.8rem;">Supprimer</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Construire le HTML
    let html = '';

    // Section 1: Portfolio + Artefacts
    if (portfolio || artefacts.length > 0) {
        html += `
            <details class="production-section" open style="margin-bottom: 20px; border: 2px solid var(--bleu-moyen);
                     border-radius: 8px; background: var(--surface-conteneur, #162c36); overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--accent-primaire) 0%, var(--bleu-moyen) 100%);
                         color: white; font-weight: 600; font-size: 1.05rem; cursor: pointer;
                         user-select: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>📁 Portfolio et artefacts</span>
                    <span class="prod-texte-secondaire">
                        ${portfolio ? '1 portfolio' : ''}${portfolio && artefacts.length > 0 ? ' · ' : ''}${artefacts.length > 0 ? `${artefacts.length} artefact${artefacts.length > 1 ? 's' : ''}` : ''}
                    </span>
                </summary>
                <div class="prod-p-15">
                    ${portfolio ? genererHtmlProduction(portfolio, 0, 1) : ''}
                    ${artefacts.map((art, idx) => genererHtmlProduction(art, idx, artefacts.length)).join('')}
                    ${!portfolio ? `
                        <button class="btn btn-confirmer" data-action="ajouterProductionAuType" data-param="portfolio" class="u-mt-10">
                            + Ajouter un portfolio
                        </button>
                    ` : ''}
                    <button class="btn btn-confirmer" data-action="ajouterProductionAuType" data-param="artefact-portfolio" style="margin-top: 10px; margin-left: 10px;">
                        + Ajouter un artefact
                    </button>
                </div>
            </details>
        `;
    }

    // Section 2: Évaluations sommatives
    if (sommatives.length > 0) {
        html += `
            <details class="production-section" open style="margin-bottom: 20px; border: 2px solid var(--bleu-moyen);
                     border-radius: 8px; background: var(--surface-conteneur, #162c36); overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--accent-primaire) 0%, var(--bleu-moyen) 100%);
                         color: white; font-weight: 600; font-size: 1.05rem; cursor: pointer;
                         user-select: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>📝 Évaluations sommatives</span>
                    <span class="prod-texte-secondaire">
                        ${sommatives.length} évaluation${sommatives.length > 1 ? 's' : ''}
                    </span>
                </summary>
                <div class="prod-p-15">
                    ${sommatives.map((prod, idx) => genererHtmlProduction(prod, idx, sommatives.length)).join('')}
                    <button class="btn btn-confirmer" data-action="ajouterProductionAuType" data-param="examen" class="u-mt-10">
                        + Ajouter une évaluation sommative
                    </button>
                </div>
            </details>
        `;
    }

    // Section 3: Évaluations formatives
    if (formatives.length > 0) {
        html += `
            <details class="production-section" style="margin-bottom: 20px; border: 2px solid var(--bleu-moyen);
                     border-radius: 8px; background: var(--surface-conteneur, #162c36); overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--accent-primaire) 0%, var(--bleu-moyen) 100%);
                         color: white; font-weight: 600; font-size: 1.05rem; cursor: pointer;
                         user-select: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>📝 Évaluations formatives</span>
                    <span class="prod-texte-secondaire">
                        ${formatives.length} évaluation${formatives.length > 1 ? 's' : ''}
                    </span>
                </summary>
                <div class="prod-p-15">
                    ${formatives.map((prod, idx) => genererHtmlProduction(prod, idx, formatives.length)).join('')}
                    <button class="btn btn-confirmer" data-action="ajouterProductionAuType" data-param="examen-formatif" class="u-mt-10">
                        + Ajouter une évaluation formative
                    </button>
                </div>
            </details>
        `;
    }

    container.innerHTML = html;
}

/**
 * Ajoute une production du type spécifié
 *
 * @param {string} type - Type de production à créer
 *
 * FONCTIONNEMENT:
 * 1. Ouvre le formulaire
 * 2. Pré-sélectionne le type
 * 3. Scroll vers le formulaire
 */
async function ajouterProductionAuType(type) {
    // Ouvrir le formulaire d'ajout
    await afficherFormProduction(null);

    // Pré-sélectionner le type
    const selectType = document.getElementById('productionType');
    if (selectType) {
        selectType.value = type;
        // Déclencher l'événement change pour adapter l'interface
        gererChangementTypeProduction();
    }

    // Scroll vers le formulaire
    const form = document.getElementById('formulaireProduction');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/* ===============================
   🚀 FONCTION D'INITIALISATION
   Point d'entrée du module
   ⚠️ NE PAS RENOMMER - Appelée par 99-main.js
   =============================== */

/**
 * Initialise le module Productions au chargement
 * 
 * APPELÉ PAR:
 * - 99-main.js dans la section des chargements conditionnels
 * 
 * FONCTIONNEMENT:
 * 1. Log de démarrage
 * 2. Vérifie si on est sur la sous-section productions
 * 3. Si oui : charge l'affichage et les données
 * 4. Attache les événements si nécessaire
 * 5. Log de succès
 * 
 * ÉVÉNEMENTS À GÉRER:
 * - Aucun événement global pour l'instant
 * - Les événements sont inline dans le HTML (onclick)
 * - À moderniser éventuellement avec addEventListener
 */
/**
 * Migration des productions existantes vers le système de bibliothèque
 * ✅ AJOUT (8 décembre 2025) : Support système bibliothèque avec sidebar
 *
 * Ajoute le flag dansBibliotheque: true à toutes les productions existantes
 * qui n'ont pas encore ce flag (migration une seule fois)
 */
async function migrerProductionsVersBibliotheque() {
    const productions = await db.get(getCleProductions()) || [];

    let nbMigrees = 0;
    productions.forEach(prod => {
        if (prod.dansBibliotheque === undefined) {
            prod.dansBibliotheque = true;
            nbMigrees++;
        }
    });

    if (nbMigrees > 0) {
        await db.set(getCleProductions(), productions);
    }
}

function initialiserModuleProductions() {

    // ✅ AJOUT (8 décembre 2025) : Migration vers système bibliothèque
    migrerProductionsVersBibliotheque();

    // ✅ CORRECTION (8 décembre 2025) : Afficher la sidebar sans condition
    // comme pour les autres sections (Cours, Grilles, Échelles, Cartouches)
    const container = document.getElementById('sidebarListeProductions');
    if (container) {
        afficherListeProductions();
    } else {
    }

    // Afficher aussi l'ancienne vue si on est sur la page productions
    const sousSection = document.querySelector('#conception-productions');
    if (sousSection && sousSection.classList.contains('active')) {
        afficherTableauProductions();
        mettreAJourPonderationTotale();
    }

    // Pas d'événements globaux à attacher pour l'instant
    // Les événements sont gérés via les attributs onclick dans le HTML

}

/* ===============================
   GESTIONNAIRE DE BIBLIOTHÈQUE
   ✅ AJOUT (8 décembre 2025)
   =============================== */

/**
 * Affiche le modal gestionnaire de bibliothèque de productions
 * Permet d'ajouter/retirer des productions de la sidebar
 *
 * SECTIONS:
 * 1. Productions dans ma sélection (avec bouton "Retirer")
 * 2. Productions disponibles à ajouter (bibliothèque + productions retirées)
 */
async function preparerDonneesBibliothequeProductions() {
    if (typeof obtenirToutesLesProductionsBibliotheque !== 'function') {
        return null;
    }

    const productionsUtilisateur = await db.get(getCleProductions()) || [];
    const productionsDansSelection = productionsUtilisateur.filter(p => p.dansBibliotheque !== false);
    const productionsRetirees = productionsUtilisateur.filter(p => p.dansBibliotheque === false);
    const toutesProductionsBiblio = await obtenirToutesLesProductionsBibliotheque();
    const doublonsDetectes = detecterDoublonsProductions(productionsUtilisateur, toutesProductionsBiblio);

    // Section 1
    const cartesSection1 = productionsDansSelection.map(prod => ({
        nom: `${BibliothequeUI.formaterTitreDemo(prod.titre, BibliothequeUI.estItemDemo(prod))}${(prod.activiteApprentissage || prod.description) ? ' - ' + (prod.activiteApprentissage || prod.description) : ''}`,
        id: prod.id,
        badgeSource: BibliothequeUI.genererBadgeSource(prod, productionsDansSelection),
        metadonnees: `Type: ${getTypeLabel(prod.type)} • Pondération: ${prod.ponderation}%${prod.objectif ? ' • Objectif: ' + prod.objectif : ''}`,
        inspireDe: BibliothequeUI.formaterInspireDe(prod),
        boutons: [
            { label: 'Dupliquer', onclick: `dupliquerProductionBibliotheque('${prod.id}')`, classe: 'btn-confirmer', title: 'Créer une copie' },
            { label: 'Exporter', onclick: `partagerProduction('${prod.id}')`, classe: 'btn-secondaire', title: 'Exporter en JSON' },
            { label: 'Retirer', onclick: `retirerProductionDeBibliotheque('${prod.id}')`, classe: 'btn-secondaire', title: 'Retirer de la barre latérale (données conservées)' },
            { label: 'Supprimer', onclick: `supprimerProductionDefinitivement('${prod.id}')`, classe: 'btn-supprimer', title: 'Supprimer définitivement' }
        ]
    }));

    // Section 2 : fusionner retirées + bibliothèque, exclure celles déjà en sélection
    const toutesProductionsDisponibles = [...toutesProductionsBiblio, ...productionsRetirees];
    const disciplinesSet = new Set();
    const cartesSection2 = [];
    const parDiscipline = {};

    toutesProductionsDisponibles.forEach(prod => {
        if (productionsDansSelection.find(p => p.id === prod.id)) return;
        const discipline = prod.discipline || 'Autres';
        disciplinesSet.add(discipline);
        if (!parDiscipline[discipline]) parDiscipline[discipline] = [];
        parDiscipline[discipline].push(prod);
    });

    const disciplines = Array.from(disciplinesSet).sort();

    Object.keys(parDiscipline).sort().forEach(discipline => {
        parDiscipline[discipline].forEach(prod => {
            cartesSection2.push({
                nom: `${BibliothequeUI.formaterTitreDemo(prod.titre, BibliothequeUI.estItemDemo(prod))}${(prod.activiteApprentissage || prod.description) ? ' - ' + (prod.activiteApprentissage || prod.description) : ''}`,
                id: prod.id,
                badgeSource: BibliothequeUI.genererBadgeSource(prod, productionsUtilisateur),
                metadonnees: (function(a){return `Type: ${getTypeLabel(prod.type)} • Pondération: ${prod.ponderation}%${a ? ' • ' + a : ''}`;})(BibliothequeUI.formaterAttribution(prod)),
                inspireDe: BibliothequeUI.formaterInspireDe(prod),
                description: prod.objectif ? 'Objectif: ' + prod.objectif : '',
                dejaPresent: false,
                classeItem: 'production-disponible-item',
                dataAttrs: `data-discipline="${prod.discipline || 'Autres'}"`,
                boutons: [
                    { label: 'Ajouter à ma sélection', onclick: `ajouterProductionIndividuelle('${prod.id}')`, classe: 'btn-confirmer', title: 'Ajouter cette production à ta sélection' },
                    { label: 'Supprimer', onclick: `supprimerProductionDeBibliothequePartagee('${prod.id}')`, classe: 'btn-supprimer', title: 'Supprimer définitivement de la bibliothèque', showAlways: true }
                ],
                groupe: discipline
            });
        });
    });

    // Import trimestre
    const trimestresDisponibles = listerTrimestresAvecProductions();
    const sectionImportTrimestre = trimestresDisponibles.length > 0 ? { trimestres: trimestresDisponibles } : null;

    return {
        cartesSection1,
        cartesSection2,
        doublonsDetectes,
        disciplines,
        sectionImportTrimestre,
        nombreSelection: productionsDansSelection.length
    };
}

async function afficherBibliothequeProductions() {
    if (typeof obtenirToutesLesProductionsBibliotheque !== 'function') {
        alert('Le module bibliothèque n\'est pas chargé.\n\nVérifiez que le fichier productions-bibliotheque.js est bien chargé.');
        return;
    }

    const data = await preparerDonneesBibliothequeProductions();
    if (!data) return;

    // Section 1
    let contenuSection1 = '';
    if (data.cartesSection1.length === 0) {
        contenuSection1 = '<p style="color: var(--gris-clair); font-style: italic;">Aucune production dans la barre latérale</p>';
    } else {
        data.cartesSection1.forEach(carte => {
            contenuSection1 += BibliothequeUI.renderCarteSelection(carte);
        });
    }

    const boutonsApresSection1 = `
        <div style="margin-top: 15px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <button data-action="ajouterMesProductionsALaBibliotheque" class="btn btn-principal">Ajouter mes productions à la bibliothèque</button>
            <button data-action="exporterProductions" class="btn btn-secondaire">Exporter toutes mes productions</button>
            <button data-action="ouvrirFilePickerImportProductions" class="btn btn-secondaire">Importer des productions</button>
            <input type="file" id="fichier-import-productions-modal" accept=".json" style="display: none;" data-on-change="importerProductions">
        </div>`;

    // Section import trimestre
    let sectionImportTrimestre = '';
    if (data.sectionImportTrimestre) {
        const trimestres = data.sectionImportTrimestre.trimestres;
        sectionImportTrimestre = `
            <div style="margin-top: 20px; padding: 15px; background: var(--gris-tres-pale); border-radius: 6px; border: 1px solid var(--bordure-claire);">
                <h4 style="color: var(--accent-primaire); font-size: 1rem; margin: 0 0 10px 0;">Importer depuis un autre trimestre</h4>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <select id="selectTrimestreImport" class="controle-form" style="flex: 1; min-width: 200px;" data-on-change="mettreAJourFiltreCoursTrimestreProductions">
                        <option value="">-- Choisir un trimestre --</option>
                        ${trimestres.map(t => `<option value="${t.cle}">${t.nom} (${t.nombre} production${t.nombre > 1 ? 's' : ''})</option>`).join('')}
                    </select>
                    <select id="selectCoursImportProductions" class="controle-form" style="flex: 1; min-width: 150px; display: none;">
                        <option value="">Tous les cours</option>
                    </select>
                    <button data-action="afficherProductionsTrimestreModal" class="btn btn-secondaire btn-compact">Voir les productions</button>
                    <button data-action="importerToutTrimestreModal" class="btn btn-principal btn-compact">Tout importer</button>
                </div>
                <div id="previewProductionsTrimestre" style="margin-top: 10px; display: none;"></div>
            </div>`;
    }

    // Filtres Section 2
    const filtresHTML = `
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; color: var(--gris-moyen); font-weight: 500;">Filtrer par discipline :</label>
            <select id="filtreDisciplineProductions" data-on-change="filtrerProductionsParDiscipline" class="controle-form" style="max-width: 300px;">
                <option value="">Toutes les disciplines</option>
                ${data.disciplines.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
        </div>`;

    // Section 2
    let contenuSection2 = '';
    let groupeCourant = null;
    data.cartesSection2.forEach(carte => {
        if (carte.groupe && carte.groupe !== groupeCourant) {
            groupeCourant = carte.groupe;
            contenuSection2 += `<h4 style="color: var(--gris-moyen); font-size: 0.95rem; margin-top: 15px; margin-bottom: 10px; border-bottom: 1px solid var(--bordure-claire); padding-bottom: 5px;">${groupeCourant}</h4>`;
        }
        contenuSection2 += BibliothequeUI.renderCarteDisponible(carte);
    });

    BibliothequeUI.creerModal({
        modalId: 'modalBibliothequeProductions',
        titre: 'Bibliothèque de productions',
        sousTitre: 'Gérez les productions affichées dans la barre latérale.',
        onFermer: 'fermerModalBibliothequeProductions',
        doublonsHTML: BibliothequeUI.renderAvertissementDoublons(data.doublonsDetectes),
        titreSection1: `Productions dans ta sélection (${data.nombreSelection})`,
        contenuSection1: contenuSection1,
        boutonsApresSection1: boutonsApresSection1,
        sectionImportTrimestre: sectionImportTrimestre,
        titreSection2: 'Productions disponibles à ajouter à la barre latérale',
        filtresSection2: filtresHTML,
        contenuIdListe2: 'listeProductionsDisponibles',
        contenuSection2: contenuSection2
    });
}

/**
 * Ajoute une production individuelle au cours actuel (depuis la bibliothèque ou productions retirées)
 */
async function ajouterProductionIndividuelle(id) {
    try {
        let productions = await db.get(getCleProductions()) || [];
        let prod = productions.find(p => p.id === id);

        // Si pas trouvée dans le cours actuel, chercher dans la bibliothèque partagée
        if (!prod) {
            const bibliotheque = await obtenirToutesLesProductionsBibliotheque();
            const prodBiblio = bibliotheque.find(p => p.id === id);

            if (!prodBiblio) {
                alert('Production introuvable dans le cours actuel ni dans la bibliothèque.');
                return;
            }

            // Copier la production de la bibliothèque vers le cours actuel
            // Générer un nouvel ID pour éviter les conflits
            const nouvelId = genererIdUnique('PROD_');
            prod = {
                ...prodBiblio,
                id: nouvelId,
                idOriginal: prodBiblio.id, // Garder trace de l'original
                dansBibliotheque: true,
                dateImport: new Date().toISOString()
            };

            // Ajouter aux productions du cours
            productions.push(prod);
            await db.set(getCleProductions(), productions);

        } else {
            // Production déjà dans le cours, juste la marquer comme visible
            prod.dansBibliotheque = true;
            await db.set(getCleProductions(), productions);
        }

        // Rafraîchir modal et sidebar
        fermerModalBibliothequeProductions();
        await afficherListeProductions();
        await afficherBibliothequeProductions();

        alert(`✅ "${prod.titre}" ajoutée à ton cours !`);
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert('Erreur lors de l\'ajout de la production');
    }
}

/**
 * Ajoute toutes les productions du cours actuel à la bibliothèque partagée
 * Permet de rendre ses productions disponibles pour tous les trimestres
 */
async function ajouterMesProductionsALaBibliotheque() {
    try {
        // Récupérer les productions du cours actuel
        const productions = await db.get(getCleProductions()) || [];

        if (productions.length === 0) {
            alert('Aucune production à ajouter.\n\nCrée d\'abord des productions dans ton cours actuel.');
            return;
        }

        // Confirmer avec l'utilisateur
        const confirmation = confirm(
            `Veux-tu ajouter tes ${productions.length} production(s) à la bibliothèque partagée ?\n\n` +
            `Elles seront disponibles dans tous tes trimestres et pourront être partagées avec des collègues.`
        );

        if (!confirmation) {
            return;
        }

        // Importer dans la bibliothèque partagée
        const resultat = await importerDansBibliotheque(productions);

        // Rafraîchir l'affichage
        fermerModalBibliothequeProductions();
        await afficherBibliothequeProductions();

        // Message de confirmation
        if (resultat.ajoutees > 0) {
            alert(`✅ ${resultat.ajoutees} production(s) ajoutée(s) à la bibliothèque !\n\n` +
                  (resultat.existantes > 0 ? `${resultat.existantes} étai(en)t déjà présente(s).` : ''));
        } else {
            alert(`Toutes tes productions étaient déjà dans la bibliothèque.`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout à la bibliothèque:', error);
        alert('Erreur lors de l\'ajout des productions à la bibliothèque.');
    }
}

/**
 * 🆕 Beta 95.3 : Mettre à jour le dropdown filtre cours quand un trimestre est sélectionné
 */
function mettreAJourFiltreCoursTrimestreProductions() {
    const selectTrimestre = document.getElementById('selectTrimestreImport');
    const selectCours = document.getElementById('selectCoursImportProductions');
    const preview = document.getElementById('previewProductionsTrimestre');

    if (!selectTrimestre || !selectCours) return;

    const cleSelectionnee = selectTrimestre.value;

    // Réinitialiser et masquer si aucun trimestre sélectionné
    if (!cleSelectionnee) {
        selectCours.innerHTML = '<option value="">Tous les cours</option>';
        selectCours.classList.add('u-hide');
        if (preview) preview.classList.add('u-hide');
        return;
    }

    // Récupérer les productions du trimestre
    const productions = obtenirProductionsTrimestre(cleSelectionnee);

    // Extraire les cours uniques
    const coursMap = new Map();
    productions.forEach(prod => {
        if (prod.coursId) {
            // Essayer de récupérer le nom du cours
            const nomCours = prod.sigleCours || prod.coursNom || prod.coursId;
            coursMap.set(prod.coursId, nomCours);
        }
    });

    // Peupler le dropdown cours
    let optionsHTML = '<option value="">Tous les cours</option>';
    coursMap.forEach((nom, id) => {
        optionsHTML += `<option value="${id}">${nom}</option>`;
    });
    selectCours.innerHTML = optionsHTML;

    // Afficher le dropdown seulement s'il y a des cours
    toggleDisplay(selectCours, coursMap.size > 0);

    // Masquer le preview
    if (preview) preview.classList.add('u-hide');
}

/**
 * Affiche un aperçu des productions d'un trimestre dans la modal
 * 🆕 Beta 95.3 : Avec support du filtre par cours
 */
function afficherProductionsTrimestreModal() {
    const select = document.getElementById('selectTrimestreImport');
    const selectCours = document.getElementById('selectCoursImportProductions');
    const preview = document.getElementById('previewProductionsTrimestre');

    if (!select || !preview) return;

    const cleSelectionnee = select.value;
    if (!cleSelectionnee) {
        preview.classList.add('u-hide');
        return;
    }

    let productions = obtenirProductionsTrimestre(cleSelectionnee);

    // 🆕 Beta 95.3 : Filtrer par cours si sélectionné
    const coursFiltre = selectCours?.value || '';
    if (coursFiltre) {
        productions = productions.filter(p => p.coursId === coursFiltre);
    }

    if (productions.length === 0) {
        preview.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucune production trouvée.</p>';
        preview.classList.remove('u-hide');
        return;
    }

    let html = '<div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--bordure-claire); border-radius: 4px; padding: 10px;">';
    productions.forEach(prod => {
        const coursLabel = prod.sigleCours || prod.coursNom || '';
        html += `
            <div style="padding: 8px; border-bottom: 1px solid var(--bordure-claire); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${prod.titre || 'Sans titre'}</strong>
                    ${(prod.activiteApprentissage || prod.description) ? ` - ${prod.activiteApprentissage || prod.description}` : ''}
                    <br><small style="color: var(--gris-moyen);">Type: ${prod.type || 'N/A'} • Pondération: ${prod.ponderation || 0}%${coursLabel ? ' • ' + coursLabel : ''}</small>
                </div>
                <button data-action="importerUneProductionTrimestre" data-param="${cleSelectionnee}" data-param2="${prod.id}" class="btn btn-confirmer btn-tres-compact">
                    Importer
                </button>
            </div>
        `;
    });
    html += '</div>';

    preview.innerHTML = html;
    preview.classList.remove('u-hide');
}

/**
 * Importe toutes les productions d'un trimestre dans la bibliothèque
 * 🆕 Beta 95.3 : Avec support du filtre par cours
 */
async function importerToutTrimestreModal() {
    const select = document.getElementById('selectTrimestreImport');
    const selectCours = document.getElementById('selectCoursImportProductions');

    if (!select || !select.value) {
        alert('Veuillez d\'abord sélectionner un trimestre.');
        return;
    }

    const cleSelectionnee = select.value;
    const codeTrimestre = cleSelectionnee.replace('_productions', '');
    const nomTrimestre = formaterNomTrimestre(codeTrimestre);

    let productions = obtenirProductionsTrimestre(cleSelectionnee);

    // 🆕 Beta 95.3 : Filtrer par cours si sélectionné
    const coursFiltre = selectCours?.value || '';
    if (coursFiltre) {
        productions = productions.filter(p => p.coursId === coursFiltre);
    }

    if (productions.length === 0) {
        alert('Aucune production à importer' + (coursFiltre ? ' pour ce cours.' : ' dans ce trimestre.'));
        return;
    }

    const coursLabel = coursFiltre ? ` du cours sélectionné` : '';
    const confirmation = confirm(
        `Veux-tu importer les ${productions.length} production(s)${coursLabel} de ${nomTrimestre} dans la bibliothèque partagée ?`
    );

    if (!confirmation) return;

    const resultat = await importerDansBibliotheque(productions);

    // Rafraîchir l'affichage
    fermerModalBibliothequeProductions();
    await afficherBibliothequeProductions();

    alert(`✅ Import terminé !\n\n${resultat.ajoutees} production(s) ajoutée(s).\n${resultat.existantes} déjà présente(s).`);
}

/**
 * Importe une seule production d'un trimestre dans la bibliothèque
 */
async function importerUneProductionTrimestre(cleTrimestre, productionId) {
    const productions = obtenirProductionsTrimestre(cleTrimestre);
    const prod = productions.find(p => p.id === productionId);

    if (!prod) {
        alert('Production introuvable.');
        return;
    }

    const resultat = await ajouterALaBibliotheque(prod);

    if (resultat) {
        // Rafraîchir l'affichage
        fermerModalBibliothequeProductions();
        await afficherBibliothequeProductions();
        alert(`✅ "${prod.titre}" ajoutée à la bibliothèque !`);
    } else {
        alert('Cette production est déjà dans la bibliothèque.');
    }
}

/**
 * Partage une production avec la communauté
 * Demande les métadonnées CC enrichies et marque la production comme partagée
 */
async function partagerProduction(id) {
    try {
        const productions = await db.get(getCleProductions()) || [];
        const prod = productions.find(p => p.id === id);

        if (!prod) {
            alert('Production introuvable');
            return;
        }

        // Demander métadonnées CC enrichies
        const metadata = await demanderMetadonneesEnrichies('production', prod.titre);
        if (!metadata) {
            return; // Annulé par l'utilisateur
        }

        // Marquer comme partagée (retirer de ma sélection)
        prod.dansBibliotheque = false;

        // Ajouter métadonnées CC
        prod.metadata_cc = metadata;

        // Sauvegarder
        await db.set(getCleProductions(), productions);

        // Rafraîchir modal et sidebar
        fermerModalBibliothequeProductions();
        await afficherListeProductions();
        await afficherBibliothequeProductions();

        alert('Production partagée avec succès !\n\nElle est maintenant disponible dans la section "Productions disponibles à ajouter".');
    } catch (error) {
        console.error('Erreur lors du partage:', error);
        alert('Erreur lors du partage de la production');
    }
}

/**
 * Retire une production de la bibliothèque (soft delete)
 */
async function retirerProductionDeBibliotheque(id) {
    if (!confirm('Retirer cette production de ta sélection ?\n\nElle ne sera plus affichée dans la barre latérale mais restera disponible dans le gestionnaire.')) {
        return;
    }

    try {
        const productions = await db.get(getCleProductions()) || [];
        const production = productions.find(p => p.id === id);

        if (!production) {
            throw new Error('Production introuvable');
        }

        production.dansBibliotheque = false;

        await db.set(getCleProductions(), productions);


        fermerModalBibliothequeProductions();
        await afficherBibliothequeProductions();
        await afficherListeProductions();

    } catch (error) {
        console.error('Erreur lors du retrait:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * ✅ AJOUT (28 janvier 2026) : Supprimer définitivement une production (hard delete)
 * @param {string} id - ID de la production à supprimer
 */
async function supprimerProductionDefinitivement(id) {
    const productions = await db.get(getCleProductions()) || [];
    const production = productions.find(p => p.id === id);

    if (!production) return;

    // Confirmation
    if (!confirm(`Supprimer définitivement la production «${production.titre}» ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Suppression définitive du store local
    const nouvellesProductions = productions.filter(p => p.id !== id);
    await db.set(getCleProductions(), nouvellesProductions);

    // Suppression du store partagé
    if (typeof retirerDeLaBibliotheque === 'function') {
        await retirerDeLaBibliotheque(id);
    }

    // Rafraîchir UI
    fermerModalBibliothequeProductions();
    await afficherBibliothequeProductions();
    await afficherListeProductions();

}

/**
 * Supprimer une production de la bibliothèque partagée uniquement (Section 2)
 * @param {string} id - ID de la production à supprimer
 */
async function supprimerProductionDeBibliothequePartagee(id) {
    const biblio = typeof obtenirToutesLesProductionsBibliotheque === 'function'
        ? await obtenirToutesLesProductionsBibliotheque()
        : [];
    const prod = biblio.find(p => p.id === id);
    if (!prod) return;

    if (!confirm(`Supprimer définitivement «${prod.titre || 'Sans titre'}» de la bibliothèque partagée ?\n\nCette action est irréversible.`)) return;

    await retirerDeLaBibliotheque(id);

    fermerModalBibliothequeProductions();
    await afficherBibliothequeProductions();
}

/**
 * ✅ AJOUT (28 janvier 2026) : Dupliquer une production dans la bibliothèque
 * @param {string} id - ID de la production à dupliquer
 */
async function dupliquerProductionBibliotheque(id) {
    const productions = await db.get(getCleProductions()) || [];
    const production = productions.find(p => p.id === id);

    if (!production) {
        alert('Production introuvable');
        return;
    }

    // Créer une copie avec un nouvel ID. La copie devient un nouvel original
    // de l'utilisateur ; trace d'origine `inspireDe` (respect CC BY). Si la
    // source était une démo, la copie perd le flag isDemo. Le champ nom de
    // production est `titre`, donc inspireDe.nom reçoit production.titre.
    const nouvelleProduction = {
        ...production,
        id: genererIdUnique('PROD_'),
        titre: `${production.titre} (copie)`,
        auteur: BibliothequeUI.obtenirAuteurActif(),
        isDemo: false,
        inspireDe: {
            nom: production.titre || 'Inconnu',
            auteur: production.auteur || 'Inconnu',
            date: new Date().toISOString().slice(0, 10)
        },
        dansBibliotheque: true,
        dateCreation: new Date().toISOString()
    };

    // Supprimer les métadonnées de partage
    delete nouvelleProduction.metadata_cc;
    delete nouvelleProduction.auteurOriginal;

    // Ajouter à la liste
    productions.push(nouvelleProduction);
    await db.set(getCleProductions(), productions);

    // Rafraîchir UI
    fermerModalBibliothequeProductions();
    await afficherBibliothequeProductions();
    await afficherListeProductions();

}

/**
 * Ajoute les productions sélectionnées à la bibliothèque
 */
async function ajouterProductionsABibliotheque() {
    const checkboxes = document.querySelectorAll('#listeProductionsDisponibles input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert('Veuillez sélectionner au moins une production à ajouter.');
        return;
    }

    try {
        const productions = await db.get(getCleProductions()) || [];
        let ajoutees = 0;

        checkboxes.forEach(checkbox => {
            const id = checkbox.value;
            const productionData = JSON.parse(checkbox.dataset.production);

            // Vérifier si la production existe déjà
            const prodExistante = productions.find(p => p.id === id);
            if (prodExistante) {
                // Réactiver si elle était retirée
                if (prodExistante.dansBibliotheque === false) {
                    prodExistante.dansBibliotheque = true;
                    ajoutees++;
                } else {
                }
            } else {
                // Ajouter nouvelle production de la bibliothèque
                productions.push({
                    ...productionData,
                    dansBibliotheque: true
                });
                ajoutees++;
            }
        });

        await db.set(getCleProductions(), productions);


        fermerModalBibliothequeProductions();
        await afficherListeProductions();
        await afficherTableauProductions();
        await mettreAJourPonderationTotale();

        if (ajoutees > 0) {
            alert(`${ajoutees} production(s) ajoutée(s) avec succès !`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * Filtre les productions disponibles par discipline
 * ✅ AJOUT (8 décembre 2025)
 */
function filtrerProductionsParDiscipline() {
    const select = document.getElementById('filtreDisciplineProductions');
    const disciplineSelectionnee = select ? select.value : '';

    const items = document.querySelectorAll('.production-disponible-item');
    const titresDisciplines = document.querySelectorAll('#listeProductionsDisponibles h4');

    if (!disciplineSelectionnee) {
        // Afficher tout
        items.forEach(item => toggleDisplay(item, true));
        titresDisciplines.forEach(titre => toggleDisplay(titre, true));
    } else {
        // Filtrer par discipline
        items.forEach(item => {
            const discipline = item.dataset.discipline;
            toggleDisplay(item, discipline === disciplineSelectionnee);
        });

        // Afficher/cacher les titres de discipline selon le filtre
        titresDisciplines.forEach(titre => {
            const disciplineTitre = titre.textContent.trim();
            toggleDisplay(titre, disciplineTitre === disciplineSelectionnee);
        });
    }
}

/**
 * Ferme le modal bibliothèque
 */
function fermerModalBibliothequeProductions() {
    BibliothequeUI.fermerModal('modalBibliothequeProductions');
}

/* ===============================
   EXPORT/IMPORT AVEC LICENCE CC
   =============================== */

/**
 * Exporte les productions avec métadonnées Creative Commons
 * Les exports incluent uniquement la structure des productions,
 * JAMAIS les données d'étudiants ou les évaluations individuelles
 *
 * FONCTIONNEMENT:
 * 1. Charge toutes les productions depuis localStorage
 * 2. Ajoute métadonnées CC BY-NC-SA 4.0 (auteur, licence, version)
 * 3. Génère nom de fichier avec watermark CC
 * 4. Télécharge le fichier JSON
 *
 * FORMAT EXPORT:
 * {
 *   metadata: { licence, auteur_original, version, date, ... },
 *   contenu: { productions: [...] }
 * }
 */
async function exporterProductions() {
    const toutesProductions = await db.get(getCleProductions()) || [];

    // ✅ MODIFIÉ (6 jan 2026) : Utiliser détection heuristique pour filtrer démo + importées
    const productions = typeof filtrerRessourcesNonDemo === 'function'
        ? filtrerRessourcesNonDemo(toutesProductions, 'production')
        : toutesProductions.filter(p => !p.estDemo && !p.auteurOriginal);
    const nbExclues = toutesProductions.length - productions.length;

    if (productions.length === 0) {
        if (nbExclues > 0) {
            alert(`Aucune production personnelle à exporter.\n\n${nbExclues} production(s) exclue(s) car elles proviennent du matériel démo ou d'imports de collègues.`);
        } else {
            alert('Aucune production à exporter.');
        }
        return;
    }

    // Informer si des productions ont été exclues
    let infoExclusion = '';
    if (nbExclues > 0) {
        infoExclusion = ` (${nbExclues} exclue(s) : démo/importées)`;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Productions pédagogiques',
        `${productions.length} production(s)${infoExclusion}`
    );

    if (!metaEnrichies) {
        return;
    }

    // Emballer avec métadonnées CC enrichies
    const donnees = ajouterMetadonnéesCC(
        { productions: productions },
        'productions',
        'Productions pédagogiques',
        metaEnrichies
    );

    // Générer nom de fichier avec watermark CC
    const nomFichier = genererNomFichierCC(
        'productions',
        'Productions-pedagogiques',
        donnees.metadata.version
    );

    // Télécharger
    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`${productions.length} production(s) exportée(s) avec succès`);
    }
}

/**
 * Exporte la production actuellement en cours d'édition
 */
async function exporterProductionActive() {
    // Récupérer l'ID de la production depuis le sidebar actif
    const itemActif = document.querySelector('.sidebar-item.active');
    if (!itemActif) {
        alert('Aucune production sélectionnée à exporter.');
        return;
    }

    const productionId = itemActif.getAttribute('data-id');
    if (!productionId) {
        alert('Impossible de déterminer la production à exporter.');
        return;
    }

    const productions = await db.get(getCleProductions()) || [];
    const production = productions.find(p => p.id === productionId);

    if (!production) {
        alert('Production introuvable.');
        return;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Production pédagogique',
        production.activiteApprentissage || production.description || production.titre || 'Production'
    );

    if (!metaEnrichies) {
        return;
    }

    // Préparer le contenu pour l'export
    let contenuExport = { ...production };

    // Si la production a été importée avec des métadonnées CC, ajouter l'utilisateur actuel comme contributeur
    if (production.metadata_cc) {
        // Demander le nom de l'utilisateur s'il modifie le matériel
        const nomUtilisateur = prompt(
            'Tu vas exporter un matériel créé par ' + production.metadata_cc.auteur_original + '.\n\n' +
            'Entre ton nom pour être crédité comme contributeur :\n' +
            '(Laisse vide si tu n\'as fait aucune modification)'
        );

        if (nomUtilisateur && nomUtilisateur.trim()) {
            // Ajouter le contributeur
            const contributeurs = production.metadata_cc.contributeurs || [];
            contributeurs.push({
                nom: nomUtilisateur.trim(),
                date: new Date().toISOString().split('T')[0],
                modifications: 'Modifications et adaptations'
            });

            // Créer les métadonnées enrichies
            contenuExport.metadata_cc = {
                ...production.metadata_cc,
                contributeurs: contributeurs
            };
        }
    }

    // Ajouter les métadonnées CC enrichies
    const exportAvecCC = ajouterMetadonnéesCC(
        contenuExport,
        'production',
        production.activiteApprentissage || production.description || production.titre || 'Production',
        metaEnrichies
    );

    const json = JSON.stringify(exportAvecCC, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // 🆕 Beta 95.3 : Nommage standardisé
    const nomExport = typeof genererNomFichierExport === 'function'
        ? genererNomFichierExport('production', { nom: production.activiteApprentissage || production.description || production.titre, discipline: production.discipline, inclureLicence: true })
        : `production-${(production.activiteApprentissage || production.description || production.titre || 'production').replace(/[^a-z0-9]/gi, '-')}-CC-BY-SA-${new Date().toISOString().split('T')[0]}.json`;
    a.download = nomExport;
    a.click();
    URL.revokeObjectURL(url);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Production "${production.activiteApprentissage || production.description || production.titre}" exportée avec succès`);
    }
}

/**
 * Importe un fichier JSON pour remplacer la production actuellement en cours d'édition
 * NOUVEAU (Beta 92): Support métadonnées Creative Commons
 */
async function importerDansProductionActive(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Récupérer l'ID de la production active
    const itemActif = document.querySelector('.sidebar-item.active');
    if (!itemActif) {
        alert('Aucune production sélectionnée. Veuillez d\'abord sélectionner une production à remplacer.');
        event.target.value = ''; // Reset input
        return;
    }

    const productionId = itemActif.getAttribute('data-id');
    if (!productionId) {
        alert('Impossible de déterminer la production à remplacer.');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Valider que c'est bien une production
            if (!donnees || typeof donnees !== 'object') {
                alert('Le fichier JSON n\'est pas valide.');
                event.target.value = '';
                return;
            }

            // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata CC)
            let productionImportee;
            let metadata = null;

            if (donnees.contenu) {
                // Nouveau format avec CC metadata
                metadata = donnees.metadata;
                productionImportee = donnees.contenu;
            } else {
                // Ancien format direct
                productionImportee = donnees;
            }

            // Afficher badge CC si présent
            let messageConfirmation = '';
            if (metadata && metadata.licence && metadata.licence.includes("CC")) {
                messageConfirmation = `📋 Matériel sous licence ${metadata.licence}\n` +
                    `👤 Auteur: ${metadata.auteur_original}\n` +
                    `📅 Créé le: ${metadata.date_creation}\n\n`;
            }

            // Confirmer le remplacement
            const confirmation = confirm(
                messageConfirmation +
                `⚠️ ATTENTION: Cette action va remplacer la production actuelle.\n\n` +
                `Veux-tu continuer ?`
            );

            if (!confirmation) {
                event.target.value = '';
                return;
            }

            // Récupérer les productions
            const productions = await db.get(getCleProductions()) || [];
            const index = productions.findIndex(p => p.id === productionId);

            if (index === -1) {
                alert('Production introuvable.');
                event.target.value = '';
                return;
            }

            // Préserver l'ID original et remplacer les données
            const productionMiseAJour = {
                ...productionImportee,
                id: productionId // Garder l'ID original
            };

            // Préserver les métadonnées CC si présentes
            if (metadata) {
                productionMiseAJour.metadata_cc = metadata;
            }

            // Remplacer dans le tableau
            productions[index] = productionMiseAJour;

            // Sauvegarder
            await db.set(getCleProductions(), productions);

            // Recharger la production dans le formulaire
            await afficherFormProduction(productionId);

            // Rafraîchir la liste
            await afficherListeProductions();

            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces('Production importée et remplacée avec succès');
            } else {
                alert('Production importée et remplacée avec succès !');
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('Erreur lors de la lecture du fichier JSON. Assure-toi qu\'il s\'agit d\'un fichier valide.');
        } finally {
            event.target.value = ''; // Reset input
        }
    };

    reader.readAsText(file);
}

/**
 * Importe des productions depuis un fichier JSON avec gestion CC
 *
 * FONCTIONNEMENT:
 * 1. Lit le fichier JSON sélectionné
 * 2. Vérifie et affiche la licence CC (si présente)
 * 3. Valide la structure des données
 * 4. Fusionne avec productions existantes
 * 5. Rafraîchit l'interface
 *
 * GESTION LICENCE:
 * - Affiche badge CC si licence présente
 * - Avertit si pas de licence (droit d'auteur classique)
 * - Demande confirmation avant import
 *
 * @param {Event|HTMLElement} eventOuEl - Événement de changement ou élément input (delegation)
 */
function importerProductions(eventOuEl) {
    var target = eventOuEl.target || eventOuEl;
    const file = target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Vérifier licence CC et afficher badge
            const estCC = verifierLicenceCC(donnees);

            let message = estCC ?
                '<div style="margin-bottom: 15px;">' + genererBadgeCC(donnees.metadata) + '</div>' :
                '';

            message += '<p><strong>Veux-tu importer ces productions ?</strong></p>';

            // Créer modal avec badge CC
            // z-index: 10001 pour passer au-dessus des modaux de bibliothèque (10000)
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div class="modal-js-overlay" style="z-index: 10001;">
                    <div class="modal-js-contenu" style="max-width: 600px; padding: 20px;">
                        ${message}
                        <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                            <button class="btn btn-annuler" data-action="fermerModalImportProductions">Annuler</button>
                            <button class="btn btn-confirmer" data-action="confirmerEtFermerImportProductions">Importer</button>
                        </div>
                    </div>
                </div>
            `;
            // Stocker les données pour éviter problèmes de sérialisation
            window._productionsImportEnAttente = donnees;
            document.body.appendChild(modal);

            // Avertir si pas de licence CC
            if (!estCC) {
                avertirSansLicence(donnees);
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('❌ Erreur lors de la lecture du fichier.\n' + error.message);
        }
    };
    reader.readAsText(file);

    // Réinitialiser l'input pour permettre le même fichier
    event.target.value = '';
}

/**
 * Confirme l'import et fusionne les productions
 * Fonction helper appelée depuis le modal de confirmation
 * PHASE 3.3: Détection de dépendances manquantes (Beta 91)
 */
window.confirmerImportProductions = async function(donnees) {
    try {
        // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata)
        let productionsImportees;

        if (donnees.contenu) {
            // Nouveau format avec CC metadata
            if (donnees.contenu.productions) {
                // Batch export: { metadata, contenu: { productions: [...] } }
                productionsImportees = donnees.contenu.productions;
            } else {
                // Individual export: { metadata, contenu: { ...production... } }
                // Préserver metadata_cc dans la production
                const production = { ...donnees.contenu };
                production.metadata_cc = donnees.metadata;
                productionsImportees = [production];
            }
        } else {
            // Ancien format direct
            productionsImportees = donnees.productions || [donnees];
        }

        if (!Array.isArray(productionsImportees)) {
            throw new Error('Format invalide: productions doit être un tableau');
        }

        // PHASE 3.3: Détecter les dépendances manquantes (grilles référencées)
        const grillesExistantes = await db.get('grillesTemplates') || [];
        const idsGrillesExistants = new Set(grillesExistantes.map(g => g.id));
        const grillesManquantes = [];

        productionsImportees.forEach(prod => {
            if (prod.grilleId && !idsGrillesExistants.has(prod.grilleId)) {
                // Grille manquante détectée
                if (!grillesManquantes.includes(prod.grilleId)) {
                    grillesManquantes.push(prod.grilleId);
                }
            }
        });

        // Avertir l'utilisateur si des dépendances manquent
        if (grillesManquantes.length > 0) {
            const nbGrillesManquantes = grillesManquantes.length;
            const message = `⚠️ Attention : ${nbGrillesManquantes} grille(s) de critères manquante(s)\n\n` +
                `Les productions importées font référence à des grilles qui n'existent pas encore dans ton système.\n\n` +
                `Grilles manquantes :\n${grillesManquantes.map(id => `  • ${id}`).join('\n')}\n\n` +
                `Tu peux continuer l'import, mais ces productions ne fonctionneront correctement qu'après avoir importé les grilles manquantes.\n\n` +
                `Continuer quand même ?`;

            if (!confirm(message)) {
                return;
            }

        }

        // ✅ CORRIGÉ (8 janvier 2026) : Ajouter UNIQUEMENT dans bibliothequeProductions
        // L'utilisateur consulte puis choisit lesquelles ajouter à sa barre latérale
        const CLE_BIBLIOTHEQUE = window.CLE_BIBLIOTHEQUE_PRODUCTIONS || 'bibliothequeProductions';
        let bibliotheque = await db.get(CLE_BIBLIOTHEQUE) || [];

        let nbAjoutees = 0;
        let nbMisesAJour = 0;

        // Fusionner dans la bibliothèque partagée uniquement
        productionsImportees.forEach(prod => {
            const indexBiblio = bibliotheque.findIndex(p => p.id === prod.id);
            if (indexBiblio >= 0) {
                bibliotheque[indexBiblio] = { ...prod, dateAjoutBiblio: bibliotheque[indexBiblio].dateAjoutBiblio };
                nbMisesAJour++;
            } else {
                bibliotheque.push({ ...prod, dateAjoutBiblio: new Date().toISOString() });
                nbAjoutees++;
            }
        });

        // Sauvegarder uniquement la bibliothèque
        await db.set(CLE_BIBLIOTHEQUE, bibliotheque);

        // Rafraîchir le modal de bibliothèque s'il est ouvert
        if (document.getElementById('modalBibliothequeProductions')) {
            if (typeof afficherBibliothequeProductions === 'function') {
                await afficherBibliothequeProductions();
            }
        }

        let message = `✅ Import réussi !\n\n`;
        if (nbAjoutees > 0) message += `${nbAjoutees} nouvelle(s) production(s) ajoutée(s).\n`;
        if (nbMisesAJour > 0) message += `${nbMisesAJour} production(s) mise(s) à jour.\n`;
        message += `\nConsulte "Productions disponibles" pour les ajouter à ta barre latérale.`;
        alert(message);

    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('❌ Erreur lors de l\'import.\n' + error.message);
    }
};

/* ===============================
   🆕 ASSISTANT DE MIGRATION CATÉGORIES (Beta 95.4)

   Détecte les productions sans catégorie et propose
   une assignation rapide (Sélection ou Obligatoire)
   =============================== */

/**
 * Vérifie si des productions nécessitent une migration de catégorie
 * et affiche un assistant si nécessaire
 *
 * @returns {boolean} - true si des productions sans catégorie existent
 */
async function verifierMigrationCategories() {
    const productions = await db.get(getCleProductions()) || [];

    // Filtrer les productions sans catégorie (exclure portfolio conteneur et formatifs)
    const sansCategorie = productions.filter(p =>
        !p.categorie &&
        p.type !== 'portfolio' &&
        !p.type?.endsWith('-formatif')
    );

    if (sansCategorie.length === 0) {
        return false;
    }

    return true;
}

/**
 * Affiche l'assistant de migration des catégories
 * Permet d'assigner rapidement des catégories aux productions existantes
 */
async function afficherAssistantMigrationCategories() {
    const productions = await db.get(getCleProductions()) || [];

    // Filtrer les productions sans catégorie
    const sansCategorie = productions.filter(p =>
        !p.categorie &&
        p.type !== 'portfolio' &&
        !p.type?.endsWith('-formatif')
    );

    if (sansCategorie.length === 0) {
        alert('✅ Toutes les productions ont déjà une catégorie assignée.');
        return;
    }

    // Générer le contenu du modal
    const lignesHTML = sansCategorie.map((prod, index) => `
        <tr>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                ${echapperHtml(prod.titre || 'Sans titre')}
                ${(prod.activiteApprentissage || prod.description) ? `<br><small style="color: var(--gris-moyen);">${echapperHtml(prod.activiteApprentissage || prod.description)}</small>` : ''}
            </td>
            <td style="text-align: center;">${getTypeLabel(prod.type)}</td>
            <td style="text-align: center;">
                <select id="migration-cat-${prod.id}" class="controle-form" style="min-width: 150px;">
                    <option value="">-- Non définie --</option>
                    <option value="selection">Sélection</option>
                    <option value="obligatoire">Obligatoire</option>
                </select>
            </td>
        </tr>
    `).join('');

    const modalHTML = `
        <div id="modal-migration-categories" class="modal-overlay" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999;">
            <div class="modal-contenu" style="background: var(--surface-conteneur, #162c36); border-radius: var(--radius-grand); max-width: 700px; width: 95%; max-height: 80vh; overflow: auto; padding: 24px;">
                <h3 style="margin-top: 0; color: var(--accent-primaire);">🔄 Migration des catégories</h3>
                <p style="color: var(--gris-fonce); margin-bottom: 20px;">
                    <strong>${sansCategorie.length}</strong> production(s) n'ont pas encore de catégorie assignée.
                    Assignez-leur une catégorie pour activer le calcul Sélection/Obligatoires.
                </p>

                <div style="margin-bottom: 20px; padding: 12px; background: var(--bleu-tres-pale); border-radius: var(--radius-moyen);">
                    <strong>Actions rapides :</strong>
                    <button type="button" data-action="assignerToutesMigration" data-param="selection" class="btn-secondaire" style="margin-left: 10px;">
                        Tout en Sélection
                    </button>
                    <button type="button" data-action="assignerToutesMigration" data-param="obligatoire" class="btn-secondaire" style="margin-left: 8px;">
                        Tout en Obligatoire
                    </button>
                </div>

                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--gris-tres-clair); border-bottom: 2px solid var(--gris-clair);">
                            <th style="padding: 10px; text-align: left;">Production</th>
                            <th style="padding: 10px; text-align: center;">Type</th>
                            <th style="padding: 10px; text-align: center;">Catégorie</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lignesHTML}
                    </tbody>
                </table>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gris-clair);">
                    <button type="button" data-action="fermerModalMigration" class="btn btn-annuler">Annuler</button>
                    <button type="button" data-action="sauvegarderMigrationCategories" class="btn btn-confirmer">
                        💾 Sauvegarder
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insérer le modal dans le DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Assigne une catégorie à toutes les productions dans le modal de migration
 * @param {string} categorie - 'selection' ou 'obligatoire'
 */
function assignerToutesMigration(categorie) {
    const selects = document.querySelectorAll('[id^="migration-cat-"]');
    selects.forEach(select => {
        select.value = categorie;
    });
}

/**
 * Ferme le modal de migration
 */
function fermerModalMigration() {
    const modal = document.getElementById('modal-migration-categories');
    if (modal) {
        modal.remove();
    }
}

/**
 * Sauvegarde les catégories assignées via l'assistant de migration
 */
async function sauvegarderMigrationCategories() {
    const productions = await db.get(getCleProductions()) || [];
    let nbMises = 0;

    // Parcourir les selects du modal
    const selects = document.querySelectorAll('[id^="migration-cat-"]');
    selects.forEach(select => {
        const prodId = select.id.replace('migration-cat-', '');
        const categorie = select.value;

        if (categorie) {
            const prod = productions.find(p => p.id === prodId);
            if (prod) {
                prod.categorie = categorie;
                nbMises++;
            }
        }
    });

    if (nbMises > 0) {
        await db.set(getCleProductions(), productions);

        // Notification
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces(`${nbMises} catégorie(s) assignée(s)`, 'Les productions ont été mises à jour.');
        } else {
            alert(`✅ ${nbMises} catégorie(s) assignée(s) avec succès !`);
        }

        // Rafraîchir l'affichage si visible
        if (typeof afficherTableauProductions === 'function') {
            afficherTableauProductions();
        }
    }

    fermerModalMigration();
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Fermer le modal d'import productions (bouton Annuler) */
function fermerModalImportProductions() {
    var overlay = document.querySelector('.modal-js-overlay');
    if (overlay && overlay.parentElement) overlay.parentElement.remove();
}

/** Confirmer import + fermer modal */
function confirmerEtFermerImportProductions() {
    window.confirmerImportProductions(window._productionsImportEnAttente);
    delete window._productionsImportEnAttente;
    fermerModalImportProductions();
}

/** Ouvrir le file picker import */
function ouvrirFilePickerImportProductions() {
    var input = document.getElementById('fichier-import-productions-modal');
    if (input) input.click();
}

/* ===============================
   EXPORT DES FONCTIONS GLOBALES
   =============================== */

window.afficherTableauProductions = afficherTableauProductions;
window.afficherToutesLesProductionsParType = afficherToutesLesProductionsParType;
window.ajouterProductionAuType = ajouterProductionAuType;
window.afficherFormProduction = afficherFormProduction;
window.sauvegarderProduction = sauvegarderProduction;
window.annulerFormProduction = annulerFormProduction;
window.modifierProduction = modifierProduction;
window.supprimerProduction = supprimerProduction;
window.verrouillerEvaluation = verrouillerEvaluation;
window.monterEvaluation = monterEvaluation;
window.descendreEvaluation = descendreEvaluation;
window.gererChangementTypeProduction = gererChangementTypeProduction;
window.chargerArtefactsDisponibles = chargerArtefactsDisponibles;
window.mettreAJourPonderationTotale = mettreAJourPonderationTotale;
window.getTypeLabel = getTypeLabel;
window.gererPortfolio = gererPortfolio;
window.initialiserModuleProductions = initialiserModuleProductions;

// Export/Import avec licence CC
window.exporterProductions = exporterProductions;
window.exporterProductionActive = exporterProductionActive;
window.importerDansProductionActive = importerDansProductionActive;
window.importerProductions = importerProductions;

// Nouvelles fonctions sidebar (Beta 80.5+)
window.afficherListeProductions = afficherListeProductions;
// window.filtrerListeProductions = filtrerListeProductions; // Fonction commentée (Beta 92)
window.chargerProductionPourModif = chargerProductionPourModif;

/**
 * Phase 4.B : fork une production démo et charge la copie en édition.
 */
async function dupliquerEtEditerProduction(id) {
    const cleProductions = getCleProductions();
    const productions = await db.get(cleProductions) || [];
    const production = productions.find(p => p.id === id);
    if (!production) return;

    const copie = BibliothequeUI.forkerItem(production, 'PROD_');
    // Les productions utilisent `titre` plutôt que `nom`
    if (production.titre) copie.titre = production.titre + ' (copie)';
    productions.push(copie);
    await db.set(cleProductions, productions);

    if (typeof afficherListeProductions === 'function') {
        await afficherListeProductions();
    }
    await chargerProductionPourModif(copie.id);

    const titreField = document.getElementById('productionTitre');
    if (titreField) {
        titreField.focus();
        titreField.select();
    }
}
window.dupliquerEtEditerProduction = dupliquerEtEditerProduction;
window.creerNouvelleProduction = creerNouvelleProduction;
window.dupliquerProduction = dupliquerProduction;
window.dupliquerProductionActive = dupliquerProductionActive;
window.supprimerProductionActive = supprimerProductionActive;
window.chargerGrillesDisponiblesPourProduction = chargerGrillesDisponiblesPourProduction;

// Gestionnaire de bibliothèque (Beta 93 + Beta 95)
window.afficherBibliothequeProductions = afficherBibliothequeProductions;
window.retirerProductionDeBibliotheque = retirerProductionDeBibliotheque;
window.ajouterProductionsABibliotheque = ajouterProductionsABibliotheque;
window.filtrerProductionsParDiscipline = filtrerProductionsParDiscipline;
window.fermerModalBibliothequeProductions = fermerModalBibliothequeProductions;
window.ajouterProductionIndividuelle = ajouterProductionIndividuelle;
window.partagerProduction = partagerProduction;
window.ajouterMesProductionsALaBibliotheque = ajouterMesProductionsALaBibliotheque;
window.afficherProductionsTrimestreModal = afficherProductionsTrimestreModal;
window.importerToutTrimestreModal = importerToutTrimestreModal;
window.importerUneProductionTrimestre = importerUneProductionTrimestre;
window.mettreAJourFiltreCoursTrimestreProductions = mettreAJourFiltreCoursTrimestreProductions; // 🆕 Beta 95.3
window.supprimerProductionDefinitivement = supprimerProductionDefinitivement;
window.supprimerProductionDeBibliothequePartagee = supprimerProductionDeBibliothequePartagee;
window.dupliquerProductionBibliotheque = dupliquerProductionBibliotheque;

// 🆕 Beta 95.4 : Assistant de migration des catégories
window.verifierMigrationCategories = verifierMigrationCategories;

// 🆕 Beta 98.3 : Échéances par groupe-cours
window.obtenirEcheanceEffective = obtenirEcheanceEffective;
window.afficherAssistantMigrationCategories = afficherAssistantMigrationCategories;
window.assignerToutesMigration = assignerToutesMigration;
window.fermerModalMigration = fermerModalMigration;
window.sauvegarderMigrationCategories = sauvegarderMigrationCategories;

// Wrappers délégation (Phase 5)
window.fermerModalImportProductions = fermerModalImportProductions;
window.confirmerEtFermerImportProductions = confirmerEtFermerImportProductions;
window.ouvrirFilePickerImportProductions = ouvrirFilePickerImportProductions;

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES DE CE MODULE:
 * - 01-config.js (productionEnEdition)
 * - 02-navigation.js (afficherSection, afficherSousSection)
 * - 14-utilitaires.js (notifications - optionnel)
 * 
 * MODULES QUI DÉPENDENT DE CELUI-CI:
 * - 05-grilles.js (peut lier des grilles aux productions)
 * - Modules d'évaluation (utilisent les productions définies)
 * 
 * ORDRE DE CHARGEMENT:
 * Ce module DOIT être chargé APRÈS 01-config.js et 02-navigation.js
 * 
 * LOCALSTORAGE UTILISÉ:
 * - 'productions' : Array des productions/évaluations
 *   Structure: [{ id, titre, description, type, ponderation, grilleId, objectif, tache, verrouille }, ...]
 *   Note: Le nom 'productions' est historique et sera peut-être renommé
 * - 'grillesTemplates' : Array des grilles de critères (pour association)
 * 
 * FONCTIONS EXPORTÉES (accessibles globalement):
 * - afficherTableauProductions()
 * - afficherFormProduction(id)
 * - sauvegarderProduction()
 * - annulerFormProduction()
 * - modifierEvaluation(id)
 * - supprimerProduction(id)
 * - verrouillerEvaluation(id)
 * - monterEvaluation(id)
 * - descendreEvaluation(id)
 * - gererChangementTypeProduction()
 * - chargerArtefactsDisponibles()
 * - mettreAJourPonderationTotale()
 * - mettreAJourResumeTypes(evaluations)
 * - getTypeLabel(type)
 * - gererPortfolio(id)
 * - initialiserModuleProductions()
 * 
 * ÉLÉMENTS HTML REQUIS:
 * Voir la section <!-- Sous-section : Productions --> dans index.html
 * 
 * AMÉLIORATIONS FUTURES:
 * - Moderniser les événements (remplacer onclick par addEventListener)
 * - Implémenter complètement la gestion des portfolios
 * - Ajouter validation côté client plus robuste
 * - Permettre le glisser-déposer pour réorganiser
 * - Ajouter des filtres (par type, par pondération)
 */

/* ===============================
   FONCTIONS SIDEBAR (Beta 80.5+)
   Layout 2 colonnes avec navigation latérale
   =============================== */

/**
 * Affiche la liste des productions dans la sidebar
 *
 * FONCTIONNEMENT:
 * 1. Récupère les productions depuis localStorage
 * 2. Récupère les grilles pour afficher le nom de la grille associée
 * 3. Génère le HTML pour chaque production
 * 4. Affiche le badge de type et la pondération
 * 5. Boutons Dupliquer (violet) et Supprimer (rouge)
 */
async function afficherListeProductions(filtreType = '') {
    // 🆕 Beta 95.4 : Utiliser la clé namespacée pour le trimestre actif
    const cleProductions = cle('productions');
    const cleGrilles = cle('grillesTemplates');
    const productions = await db.get(cleProductions) || [];
    const grilles = await db.get(cleGrilles) || [];
    const container = document.getElementById('sidebarListeProductions');


    if (!container) {
        return;
    }

    // ✅ AJOUT (8 décembre 2025) : Filtrer uniquement les productions dans la bibliothèque
    const productionsDansBibliotheque = productions.filter(p => p.dansBibliotheque !== false);

    // Filtrer selon le type si nécessaire
    let productionsFiltrees = productionsDansBibliotheque;
    if (filtreType) {
        if (filtreType === 'sommative') {
            productionsFiltrees = productionsDansBibliotheque.filter(p =>
                !p.type.includes('formatif') && p.type !== 'portfolio' && p.type !== 'artefact-portfolio'
            );
        } else if (filtreType === 'formative') {
            productionsFiltrees = productionsDansBibliotheque.filter(p => p.type.includes('formatif'));
        } else if (filtreType === 'portfolio') {
            productionsFiltrees = productionsDansBibliotheque.filter(p =>
                p.type === 'portfolio' || p.type === 'artefact-portfolio'
            );
        }
    }

    // ✅ CORRECTION (8 décembre 2025) : Ne plus générer le bouton bibliothèque
    // car il est maintenant dans le HTML (comme pour Cours, Grilles, etc.)

    // 🆕 Beta 99.08 : Tri des productions dans la sidebar
    const selectTri = document.getElementById('triProductions');
    const tri = selectTri ? selectTri.value : '';
    if (tri) {
        productionsFiltrees = [...productionsFiltrees].sort((a, b) => {
            if (tri === 'titre') {
                return (a.titre || '').localeCompare(b.titre || '', 'fr');
            } else if (tri === 'type') {
                return (a.type || '').localeCompare(b.type || '', 'fr');
            } else if (tri === 'echeance') {
                const dateA = obtenirEcheancePlusTot(a) || '9999';
                const dateB = obtenirEcheancePlusTot(b) || '9999';
                return dateA.localeCompare(dateB);
            }
            return 0;
        });
    }

    if (productionsFiltrees.length === 0) {
        container.innerHTML = '<p class="text-muted text-italic" style="font-size: 0.9rem; text-align: center; padding: 20px 10px;">Crée une nouvelle production ou puise dans la bibliothèque</p>';
        return;
    }

    const html = productionsFiltrees.map(prod => {
        const titre = prod.titre || 'Sans titre';
        // ✅ MODIF (28 janvier 2026) : Afficher l'activité d'apprentissage sous le titre
        const activite = prod.activiteApprentissage || prod.description || '';

        // 🆕 Beta 95.4 : Badges uniformisés avec grilles/échelles
        // Générer badges pratiques compatibles (utilise gabarits-utils.js)
        const badgesPratiques = typeof GabaritsUtils !== 'undefined'
            ? GabaritsUtils.genererBadgesPratiques(prod)
            : '';

        // Badge de pondération (sauf pour portfolio conteneur et artefacts)
        const ponderationBadge = (prod.type !== 'portfolio' && prod.type !== 'artefact-portfolio' && prod.ponderation)
            ? `<span class="badge-caracteristique">${prod.ponderation}%</span>`
            : '';

        return `
            <div class="sidebar-item" data-id="${prod.id}" data-action="chargerProductionPourModif" data-param="${prod.id}">
                <div class="sidebar-item-titre">${echapperHtml(titre)}</div>
                ${activite ? `<div class="sidebar-item-activite">${echapperHtml(activite)}</div>` : ''}
                <div class="sidebar-item-badges">
                    ${badgesPratiques}
                    ${ponderationBadge}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * Filtre la liste des productions par type
 * Appelée par le select de filtre dans la sidebar
 * DÉSACTIVÉ : Filtre retiré de l'interface (Beta 92)
 */
/*
function filtrerListeProductions() {
    const select = document.getElementById('filtreTypeProduction');
    if (!select) return;

    const filtreType = select.value;
    afficherListeProductions(filtreType);
}
*/

/**
 * Charge une production pour modification dans le formulaire
 * Appelée par le clic sur un item de la sidebar
 */
async function chargerProductionPourModif(id) {

    // Masquer le message d'accueil
    const accueil = document.getElementById('accueilProductions');
    if (accueil) accueil.classList.add('u-hide');

    // Afficher le formulaire
    const formulaire = document.getElementById('formulaireProduction');
    if (formulaire) formulaire.classList.remove('u-hide');

    // Afficher les boutons Dupliquer, Supprimer et Export PDF (mode édition)
    const btnDupliquer = document.getElementById('btnDupliquerProduction');
    const btnSupprimer = document.getElementById('btnSupprimerProduction');
    const btnExportPDFProd = document.getElementById('btnExporterPDFProduction');
    if (btnDupliquer) btnDupliquer.classList.remove('u-hide');
    if (btnSupprimer) btnSupprimer.classList.remove('u-hide');
    if (btnExportPDFProd) btnExportPDFProd.classList.remove('u-hide');

    // Appeler afficherFormProduction pour charger les données
    await afficherFormProduction(id);

    // ✅ AJOUT (6 jan 2026) : Afficher le panneau métadonnées
    const panneauMeta = document.getElementById('panneauMetadonneesProduction');
    const productions = await db.get(getCleProductions()) || [];
    const production = productions.find(p => p.id === id);
    if (panneauMeta && typeof genererPanneauMetadonnees === 'function' && production) {
        panneauMeta.innerHTML = genererPanneauMetadonnees(production, 'production');
    }

    // Phase 4.B : mode lecture seule si item démo
    const conteneurProd = document.getElementById('formulaireProduction');
    if (conteneurProd && production && typeof BibliothequeUI !== 'undefined' && BibliothequeUI.appliquerModeLectureSeuleDemo) {
        BibliothequeUI.appliquerModeLectureSeuleDemo(conteneurProd, production, 'dupliquerEtEditerProduction', 'Dupliquer pour créer ma production');
    }

    // Highlighter l'item actif
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    const itemActif = document.querySelector(`.sidebar-item[data-id="${id}"]`);
    if (itemActif) {
        itemActif.classList.add('active');
    }

    // Mettre à jour les métriques - DÉSACTIVÉ (cartes métriques supprimées)
    // const productions = db.getSync('productions', []);
    // const production = productions.find(p => p.id === id);
    // mettreAJourMetriquesProduction(production);
}

/**
 * Crée une nouvelle production (formulaire vide)
 * Appelée par le bouton "+ Nouvelle production"
 */
function creerNouvelleProduction() {
    // Masquer le message d'accueil
    const accueil = document.getElementById('accueilProductions');
    if (accueil) accueil.classList.add('u-hide');

    // Afficher le formulaire
    const formulaire = document.getElementById('formulaireProduction');
    if (formulaire) formulaire.classList.remove('u-hide');

    // Cacher les boutons Dupliquer, Supprimer et Export PDF (mode création)
    const btnDupliquer = document.getElementById('btnDupliquerProduction');
    const btnSupprimer = document.getElementById('btnSupprimerProduction');
    const btnExportPDFNew = document.getElementById('btnExporterPDFProduction');
    if (btnDupliquer) btnDupliquer.classList.add('u-hide');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');
    if (btnExportPDFNew) btnExportPDFNew.classList.add('u-hide');

    // Réinitialiser le formulaire
    document.getElementById('productionActivite').value = '';
    document.getElementById('productionTitre').value = '';
    document.getElementById('productionType').value = '';
    document.getElementById('productionPonderation').value = '';
    document.getElementById('productionGrille').value = '';
    document.getElementById('productionObjectif').value = '';
    document.getElementById('productionTache').value = '';

    // ✅ AJOUT (6 jan 2026) : Vider le panneau métadonnées (mode création)
    const panneauMeta = document.getElementById('panneauMetadonneesProduction');
    if (panneauMeta) panneauMeta.innerHTML = '';

    // Réinitialiser les champs portfolio et les notes explicatives
    const champsPortfolio = document.getElementById('champsPortfolio');
    if (champsPortfolio) champsPortfolio.classList.add('u-hide');

    // Réinitialiser la date d'échéance
    const inputDateEcheance = document.getElementById('productionDateEcheance');
    if (inputDateEcheance) inputDateEcheance.value = '';

    // Réinitialiser le contexte facultatif
    const productionContexte = document.getElementById('productionContexte');
    if (productionContexte) productionContexte.value = '';

    // Appeler gererChangementTypeProduction pour réinitialiser tous les états
    // (cartes contextuelles, notes, champs grisés, etc.)
    gererChangementTypeProduction();

    // Réinitialiser les checkboxes de pratiques compatibles
    const checkboxesContainer = document.getElementById('checkboxesPratiquesProduction');
    if (checkboxesContainer && typeof GabaritsUtils !== 'undefined') {
        checkboxesContainer.innerHTML = GabaritsUtils.genererCheckboxesPratiques('production', []);
    }

    // Changer le titre et le bouton
    document.getElementById('btnTexteEvaluation').textContent = 'Ajouter';

    // Réinitialiser productionEnEdition
    productionEnEdition = null;

    // Réinitialiser les métriques - DÉSACTIVÉ (cartes métriques supprimées)
    // mettreAJourMetriquesProduction(null);

    // Retirer le highlight de tous les items
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Charger les grilles disponibles (avec petit délai pour laisser le DOM se mettre à jour)
    setTimeout(async () => {
        await chargerGrillesDisponiblesPourProduction();
    }, 50);
}

// SUPPRIMÉ: Définition dupliquée de chargerProductionPourModif
// Cette fonction est maintenant définie une seule fois aux lignes 1286-1318
// La duplication causait un bug où productionEnEdition n'était pas défini correctement

/**
 * Met le highlight sur la production active dans la sidebar
 *
 * @param {string} id - ID de la production active
 */
function definirProductionActive(id) {
    // Retirer le highlight de tous les items
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Ajouter le highlight à l'item actif
    const itemActif = document.querySelector(`.sidebar-item[data-id="${id}"]`);
    if (itemActif) {
        itemActif.classList.add('active');
    }
}

/**
 * DÉSACTIVÉ - Met à jour les cartes métriques avec les infos de la production
 * Les cartes métriques ont été supprimées (redondantes avec le formulaire)
 *
 * @param {object|null} production - Production à afficher (ou null pour réinitialiser)
 */
/*
function mettreAJourMetriquesProduction(production) {
    const grilles = db.getSync('grillesTemplates', []);

    if (!production) {
        document.getElementById('ponderationProdMetrique').textContent = '-';
        document.getElementById('typeProdMetrique').textContent = '-';
        document.getElementById('grilleProdMetrique').textContent = '-';
        return;
    }

    // Pondération
    const ponderation = production.type === 'artefact-portfolio' ? 'N/A' : `${production.ponderation || 0}%`;
    document.getElementById('ponderationProdMetrique').textContent = ponderation;

    // Type
    const typeLabel = getTypeLabel(production.type);
    document.getElementById('typeProdMetrique').textContent = typeLabel;

    // Grille
    const grille = grilles.find(g => g.id === production.grilleId);
    const nomGrille = grille ? grille.nom : 'Aucune';
    document.getElementById('grilleProdMetrique').textContent = nomGrille;
}
*/

/**
 * Charge les grilles disponibles dans les selects de production
 * (Fonction helper pour éviter la duplication de code)
 * NOTE: Renommée pour éviter conflit avec chargerGrillesDisponibles() de pratiques.js
 */
async function chargerGrillesDisponiblesPourProduction() {
    // 🆕 Beta 95.4 : Utiliser la clé namespacée pour n'afficher que les grilles du trimestre actif
    const cleGrilles = cle('grillesTemplates');
    const grilles = await db.get(cleGrilles) || [];
    const selectStandard = document.getElementById('productionGrille');
    const selectInline = document.getElementById('productionGrilleInline');


    if (!selectStandard && !selectInline) {
        console.warn('⚠️ Aucun sélecteur de grille trouvé!');
        return;
    }

    const optionsHtml = '<option value="">Aucune</option>' +
        grilles.map(g => `<option value="${g.id}">${g.nom}</option>`).join('');

    if (selectStandard) {
        selectStandard.innerHTML = optionsHtml;
    }

    if (selectInline) {
        selectInline.innerHTML = optionsHtml;
    }
}

/**
 * Duplique une production existante
 *
 * @param {string} id - ID de la production à dupliquer
 */
async function dupliquerProduction(id) {
    const productions = await db.get(getCleProductions()) || [];
    const production = productions.find(p => p.id === id);

    if (!production) return;

    // Créer une copie avec un nouvel ID. La copie devient un nouvel original
    // de l'utilisateur ; trace d'origine `inspireDe` (respect CC BY).
    const copie = {
        ...production,
        id: genererIdUnique('PROD_'),
        activiteApprentissage: `${production.activiteApprentissage || production.description || ''} (copie)`,
        description: `${production.activiteApprentissage || production.description || ''} (copie)`,
        auteur: BibliothequeUI.obtenirAuteurActif(),
        isDemo: false,
        inspireDe: {
            nom: production.titre || production.activiteApprentissage || 'Inconnu',
            auteur: production.auteur || 'Inconnu',
            date: new Date().toISOString().slice(0, 10)
        },
        verrouille: false
    };

    productions.push(copie);
    await db.set(getCleProductions(), productions);

    // Recharger la liste
    await afficherListeProductions();
    await chargerProductionPourModif(copie.id);

    // Mettre à jour le select des productions dans le module Évaluation
    if (typeof window.chargerProductionsDansSelect === 'function') {
        window.chargerProductionsDansSelect();
    }

    // Mettre à jour le filtre de production dans la liste des évaluations
    if (typeof window.rechargerFiltreProduction === 'function') {
        window.rechargerFiltreProduction();
    }

    alert(`Production "${copie.activiteApprentissage || copie.description}" dupliquée avec succès`);
}

/**
 * Duplique la production actuellement en édition
 * Appelée par le bouton "Dupliquer" dans le formulaire
 */
async function dupliquerProductionActive() {
    if (!productionEnEdition) {
        alert('Aucune production en cours d\'édition');
        return;
    }
    await dupliquerProduction(productionEnEdition);
}

/**
 * Supprime la production actuellement en édition
 * Appelée par le bouton "Supprimer" dans le formulaire
 */
async function supprimerProductionActive() {
    if (!productionEnEdition) {
        alert('Aucune production en cours d\'édition');
        return;
    }

    if (!confirm('Es-tu sûr de vouloir supprimer cette production ?')) {
        return;
    }

    let productions = await db.get(getCleProductions()) || [];
    productions = productions.filter(e => e.id !== productionEnEdition);

    await db.set(getCleProductions(), productions);

    // Fermer le formulaire et retourner à l'accueil
    annulerFormProduction();

    // Recharger la liste
    await afficherListeProductions();
    await afficherToutesLesProductionsParType();
    await mettreAJourPonderationTotale();

    // Mettre à jour le statut des modalités si la fonction existe
    if (typeof mettreAJourStatutModalites === 'function') {
        mettreAJourStatutModalites();
    }

    // Mettre à jour le select des productions dans le module Évaluation
    if (typeof window.chargerProductionsDansSelect === 'function') {
        window.chargerProductionsDansSelect();
    }

    // Mettre à jour le filtre de production dans la liste des évaluations
    if (typeof window.rechargerFiltreProduction === 'function') {
        window.rechargerFiltreProduction();
    }

    alert('Production supprimée avec succès');
}

/**
 * Adapte la fonction sauvegarderProduction existante pour le nouveau layout
 * Cette fonction override la fonction originale pour ajouter le support sidebar
 */
const sauvegarderProductionOriginale = window.sauvegarderProduction;
window.sauvegarderProduction = async function() {
    // Appeler la fonction originale
    if (typeof sauvegarderProductionOriginale === 'function') {
        await sauvegarderProductionOriginale();
    }

    // Recharger la sidebar
    await afficherListeProductions();

    // Mettre à jour les métriques
    const id = window.productionEnCoursEdition;
    if (id) {
        const productions = await db.get(getCleProductions()) || [];
        const production = productions.find(p => p.id === id);
        if (production) {
            // mettreAJourMetriquesProduction(production); // DÉSACTIVÉ (cartes métriques supprimées)
            definirProductionActive(id);
        }
    }
};

/**
 * Adapte la fonction annulerFormProduction pour le nouveau layout
 */
const annulerFormProductionOriginale = window.annulerFormProduction;
window.annulerFormProduction = function() {
    // Masquer le formulaire
    const formulaire = document.getElementById('formulaireProduction');
    if (formulaire) formulaire.classList.add('u-hide');

    const options = document.getElementById('optionsImportExportProductions');
    if (options) options.classList.add('u-hide');

    // Afficher le message d'accueil
    const accueil = document.getElementById('accueilProductions');
    if (accueil) accueil.classList.remove('u-hide');

    // Retirer le highlight
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Réinitialiser l'ID d'édition
    window.productionEnCoursEdition = null;
};

/**
 * Adapte la fonction supprimerProduction pour le nouveau layout
 */
const supprimerProductionOriginale = window.supprimerProduction;
window.supprimerProduction = async function(id) {
    if (!confirm('Supprimer cette production ?')) return;

    const productions = await db.get(getCleProductions()) || [];
    const index = productions.findIndex(p => p.id === id);

    if (index === -1) return;

    productions.splice(index, 1);
    await db.set(getCleProductions(), productions);

    // Recharger la sidebar
    await afficherListeProductions();

    // Masquer le formulaire si c'était la production affichée
    if (window.productionEnCoursEdition === id) {
        annulerFormProduction();
    }

    alert('Production supprimée');
};

/**
 * Importe une liste de productions externes (archives, voûte, etc.).
 * Pattern symétrique à importerGrillesExternes / importerEchellesExternes.
 *
 * @param {Array} nouvellesProductions - Productions à importer
 * @param {Object} [options]
 * @param {boolean} [options.remplacer=false] - Remplacer si même ID
 * @param {boolean} [options.silencieux=false] - Ne pas rafraîchir l'UI
 * @returns {number} nombre de productions ajoutées/mises à jour
 */
window.importerProductionsExternes = function(nouvellesProductions, options) {
    if (!nouvellesProductions || nouvellesProductions.length === 0) return 0;
    options = options || {};

    var cleProductions = (typeof getCleProductions === 'function')
        ? getCleProductions()
        : (typeof cle === 'function' ? cle('productions') : 'productions');

    var productions = db.getSync(cleProductions, []) || [];
    if (!Array.isArray(productions)) productions = [];
    var compteur = 0;

    for (var i = 0; i < nouvellesProductions.length; i++) {
        var prod = nouvellesProductions[i];
        if (!prod || !prod.id) continue;
        var index = productions.findIndex(function(p) { return p.id === prod.id; });

        if (index >= 0) {
            if (options.remplacer) {
                productions[index] = prod;
                compteur++;
            }
        } else {
            productions.push(prod);
            compteur++;
        }
    }

    if (compteur > 0) {
        db.setSync(cleProductions, productions);

        if (!options.silencieux) {
            if (typeof afficherListeProductions === 'function') afficherListeProductions();
        }
    }

    return compteur;
};

})();
