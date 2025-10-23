/* ===============================
   MODULE 15: PROFIL DÉTAILLÉ D'UN ÉTUDIANT
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère l'affichage complet du profil individuel
   d'un étudiant dans la section Étudiants › Profil.
   
   Contenu de ce module:
   - Affichage des informations de l'étudiant
   - Gestion du portfolio d'apprentissage
   - Sélection des artefacts à retenir
   - Calcul des notes provisoires et finales
   - (À développer) Historique d'assiduité
   - (À développer) Indices A-C-P détaillés
   - (À développer) Graphiques de progression
   =============================== */

/* ===============================
   📋 DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : echapperHtml()
   - 02-navigation.js : afficherSousSection()
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   - afficherSousSection() (depuis 02-navigation.js)
   
   Éléments HTML requis:
   - #contenuProfilEtudiant : Conteneur principal du profil
   - #portfolioEleveDetail : Conteneur du portfolio
   - #etudiants-profil : Sous-section (gérée par 02-navigation.js)
   
   LocalStorage utilisé:
   - 'groupeEtudiants' : Array des étudiants
   - 'listeGrilles' : Array des productions (dont artefacts)
   - 'evaluationsSauvegardees' : Array des évaluations
   - 'portfoliosEleves' : Object avec sélections d'artefacts
   
   COMPATIBILITÉ:
   - ES6+ requis
   - Navigateurs modernes
   - Pas de dépendances externes
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module de profil étudiant
 * Appelée automatiquement par 99-main.js au chargement
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent
 * 2. Attache les événements si nécessaire
 * 
 * NOTE: Ce module est principalement appelé par d'autres modules
 * via afficherProfilComplet(da)
 */
function initialiserModuleProfilEtudiant() {
    console.log('👤 Initialisation du module Profil Étudiant');

    // Vérifier que le conteneur existe
    const container = document.getElementById('contenuProfilEtudiant');
    if (!container) {
        console.log('   ⚠️  Conteneur profil non trouvé, initialisation reportée');
        return;
    }

    console.log('   ✅ Module Profil Étudiant initialisé');
}

/**
 * Calcule tous les indices pour un étudiant
 * @param {string} da - Numéro de DA
 * @returns {Object} - Objet avec tous les indices
 */
function calculerTousLesIndices(da) {
    // INDICE A : Assiduité
    const A = calculerAssiduitéGlobale(da) / 100; // Convertir en proportion 0-1

    // INDICE C : Complétion
    const C = calculerTauxCompletion(da) / 100; // Convertir en proportion 0-1

    // INDICE P : Performance (3 meilleurs artefacts - PAN)
    const P = calculerPerformancePAN(da);

    // INDICES COMPOSITES
    const M = (A + C) / 2; // Mobilisation
    const E = A * C * P;   // Engagement
    const R = 1 - E;       // Risque

    return {
        A: Math.round(A * 100), // Retour en pourcentage pour affichage
        C: Math.round(C * 100),
        P: Math.round(P * 100),
        M: Math.round(M * 100),
        E: E.toFixed(2),
        R: R.toFixed(2)
    };
}

/**
 * Calcule la performance PAN basée sur les artefacts SÉLECTIONNÉS dans le portfolio
 * @param {string} da - Numéro de DA
 * @returns {number} - Performance en proportion 0-1
 */
function calculerPerformancePAN(da) {
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da && e.noteFinale);

    if (evaluationsEleve.length === 0) {
        return 0;
    }

    // 🆕 PRIORITÉ 1 : Utiliser les artefacts SÉLECTIONNÉS dans le portfolio
    const selectionsPortfolios = JSON.parse(localStorage.getItem('portfoliosEleves') || '{}');
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
    const portfolio = productions.find(p => p.type === 'portfolio');

    if (portfolio && selectionsPortfolios[da]?.[portfolio.id]) {
        const selectionEleve = selectionsPortfolios[da][portfolio.id];
        const artefactsRetenus = selectionEleve.artefactsRetenus;

        if (artefactsRetenus.length > 0) {
            // Filtrer les évaluations pour ne garder que les artefacts sélectionnés
            const evaluationsRetenues = evaluationsEleve.filter(e =>
                artefactsRetenus.includes(e.productionId)
            );

            if (evaluationsRetenues.length > 0) {
                // Calculer la moyenne des artefacts sélectionnés
                const moyenne = evaluationsRetenues.reduce((sum, e) => sum + e.noteFinale, 0) / evaluationsRetenues.length;
                console.log(`📊 Indice P calculé depuis ${evaluationsRetenues.length} artefact(s) sélectionné(s): ${moyenne.toFixed(1)}%`);
                return moyenne / 100; // Retourner en proportion 0-1
            }
        }
    }

    // FALLBACK : Si pas de sélection, prendre les 3 meilleures notes (comportement par défaut)
    const meilleuresNotes = evaluationsEleve
        .map(e => e.noteFinale)
        .sort((a, b) => b - a)
        .slice(0, 3);

    const moyenne = meilleuresNotes.reduce((sum, note) => sum + note, 0) / meilleuresNotes.length;
    console.log(`📊 Indice P calculé depuis les ${meilleuresNotes.length} meilleure(s) note(s): ${moyenne.toFixed(1)}%`);
    return moyenne / 100; // Retourner en proportion 0-1
}

/**
 * Obtient la couleur selon le taux (en pourcentage)
 * @param {number} taux - Taux en pourcentage (0-100)
 * @returns {string} - Code couleur
 */
function obtenirCouleurIndice(taux) {
    if (taux >= 85) return 'var(--risque-minimal)'; // Vert
    if (taux >= 70) return 'var(--risque-modere)';  // Jaune
    return 'var(--risque-tres-eleve)';              // Rouge
}

/**
 * Obtient l'emoji selon le taux
 * @param {number} taux - Taux en pourcentage (0-100)
 * @returns {string} - Emoji
 */
function obtenirEmojiIndice(taux) {
    if (taux >= 85) return '🟢';
    if (taux >= 70) return '🟡';
    return '🔴';
}

/**
 * Obtient les détails d'assiduité pour un étudiant
 * @param {string} da - Numéro de DA
 * @returns {Object} - Détails d'assiduité
 */
/**
 * Obtient les détails d'assiduité pour un étudiant
 * MODIFIÉ : Tri chronologique (plus ancien en premier)
 * 
 * @param {string} da - Numéro de DA
 * @returns {Object} - Détails d'assiduité
 */
function obtenirDetailsAssiduite(da) {
    // Utiliser les fonctions du module 09-2-saisie-presences.js
    const heuresPresentes = calculerTotalHeuresPresence(da, null);

    // Compter le nombre de séances RÉELLEMENT SAISIES (au moins un élève présent)
    const presences = JSON.parse(localStorage.getItem('presences') || '[]');

    // Obtenir toutes les dates uniques pour lesquelles une saisie a été faite
    const datesSaisies = new Set();
    presences.forEach(p => {
        if (p.da === da && p.heures !== null && p.heures !== undefined) {
            datesSaisies.add(p.date);
        }
    });

    const nombreSeances = datesSaisies.size;
    const dureeSeance = obtenirDureeMaxSeance();
    const heuresOffertes = nombreSeances * dureeSeance;

    // Récupérer les séances configurées
    const seances = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');

    // Détecter les absences (totales ET partielles)
    const absences = [];

    // Pour chaque date avec saisie
    datesSaisies.forEach(dateCours => {
        const presenceEleve = presences.find(p => p.da === da && p.date === dateCours);

        if (!presenceEleve || presenceEleve.heures === null || presenceEleve.heures === undefined) {
            // Absence totale (aucun enregistrement ou heures null)
            const seance = seances.find(s => s.date === dateCours);
            absences.push({
                date: dateCours,
                heuresPresence: 0,
                heuresManquees: dureeSeance,
                seance: seance
            });
        } else if (presenceEleve.heures < dureeSeance) {
            // Présence partielle (retard/départ anticipé)
            const seance = seances.find(s => s.date === dateCours);
            absences.push({
                date: dateCours,
                heuresPresence: presenceEleve.heures,
                heuresManquees: dureeSeance - presenceEleve.heures,
                seance: seance
            });
        }
    });

    // 🆕 MODIFIÉ : Trier par date CROISSANTE (plus ancien en premier)
    absences.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
        heuresPresentes,
        heuresOffertes,
        nombreSeances,
        absences
    };
}


/**
 * Formate une date ISO en format lisible
 * @param {string} dateISO - Date au format ISO
 * @returns {string} - Date formatée
 */
function formaterDate(dateISO) {
    if (!dateISO) return 'N/A';
    const date = new Date(dateISO + 'T12:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-CA', options);
}

/* ===============================
   📊 AFFICHAGE DU PROFIL COMPLET
   =============================== */

/**
 * Affiche le profil complet d'un étudiant avec dashboard simplifié
 * VERSION 4 - Fusion Performance + Portfolio
 * 
 * MODIFIÉ : Suppression de la carte Portfolio séparée
 */
/**
 * Affiche le profil complet d'un étudiant avec dashboard simplifié
 * VERSION 5 - Option 3 : Carte Portfolio unique
 * 
 * MODIFIÉ : 
 * - Suppression de la carte C (Complétion)
 * - Carte P renommée "Portfolio" affiche la Performance
 * - Détails du portfolio incluent C et P
 * - Grille de 5 colonnes au lieu de 6
 */
/**
 * Version simplifiée de afficherProfilComplet - SANS LA LÉGENDE
 */
function afficherProfilComplet(da) {
    console.log('👤 Affichage du profil pour DA:', da);

    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const eleve = etudiants.find(e => e.da === da);

    if (!eleve) {
        alert('Élève introuvable');
        return;
    }

    if (typeof afficherSousSection === 'function') {
        afficherSousSection('tableau-bord-profil');
    }

    const container = document.getElementById('contenuProfilEtudiant');
    if (!container) {
        console.error('❌ Élément #contenuProfilEtudiant introuvable');
        return;
    }

    // Calculer tous les indices
    const indices = calculerTousLesIndices(da);

    // Générer le HTML du profil avec dashboard simplifié
    container.innerHTML = `
        <!-- EN-TÊTE -->
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid var(--bleu-pale);">
            <h2 style="color: var(--bleu-principal); margin-bottom: 10px;">
                ${echapperHtml(eleve.prenom)} ${echapperHtml(eleve.nom)}
            </h2>
            <div style="display: flex; gap: 20px; flex-wrap: wrap; color: #666; font-size: 0.95rem;">
                <span><strong>DA:</strong> ${echapperHtml(eleve.da)}</span>
                <span><strong>Groupe:</strong> ${echapperHtml(eleve.groupe || 'Non défini')}</span>
                <span><strong>Programme:</strong> ${echapperHtml(eleve.programme || 'Non défini')}</span>
                ${eleve.sa === 'Oui' ? '<span style="color: var(--bleu-principal);">✓ SA</span>' : ''}
                ${eleve.caf === 'Oui' ? '<span style="color: var(--bleu-principal);">✓ CAF</span>' : ''}
            </div>
        </div>
        
        <!-- DASHBOARD DES INDICES - 6 COLONNES -->
        <div class="carte" style="background: var(--bleu-tres-pale); border: 2px solid var(--bleu-principal); padding: 15px;">
            <h3 style="margin-bottom: 15px;">📊 Indices de suivi</h3>

            <!-- GRILLE : 6 COLONNES (A-C-P-M-E-R) -->
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
                <!-- CARTE A (Assiduité) -->
                <div id="carte-indice-A" onclick="toggleDetailIndice('A', '${da}')"
                     style="background: white; padding: 12px 8px; border-radius: 6px; text-align: center;
                            border: 2px solid ${obtenirCouleurIndice(indices.A)}; cursor: pointer;
                            transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                        Assiduité
                    </div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: ${obtenirCouleurIndice(indices.A)}; margin: 8px 0;">
                        ${indices.A}%
                    </div>
                    <div style="font-weight: bold; color: var(--bleu-principal); font-size: 0.85rem; margin-bottom: 8px;">
                        Indice A
                    </div>
                    <div style="font-size: 0.75rem; color: var(--bleu-moyen);">
                        Voir détails →
                    </div>
                </div>

                <!-- CARTE C (Complétion) -->
                <div id="carte-indice-C" onclick="toggleDetailIndice('C', '${da}')"
                     style="background: white; padding: 12px 8px; border-radius: 6px; text-align: center;
                            border: 2px solid ${obtenirCouleurIndice(indices.C)}; cursor: pointer;
                            transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                        Complétion
                    </div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: ${obtenirCouleurIndice(indices.C)}; margin: 8px 0;">
                        ${indices.C}%
                    </div>
                    <div style="font-weight: bold; color: var(--bleu-principal); font-size: 0.85rem; margin-bottom: 8px;">
                        Indice C
                    </div>
                    <div style="font-size: 0.75rem; color: var(--bleu-moyen);">
                        Voir détails →
                    </div>
                </div>

                <!-- CARTE P (Performance) -->
                <div id="carte-indice-P" onclick="toggleDetailIndice('P', '${da}')"
                     style="background: white; padding: 12px 8px; border-radius: 6px; text-align: center;
                            border: 2px solid ${obtenirCouleurIndice(indices.P)}; cursor: pointer;
                            transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                        Performance
                    </div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: ${obtenirCouleurIndice(indices.P)}; margin: 8px 0;">
                        ${indices.P}%
                    </div>
                    <div style="font-weight: bold; color: var(--bleu-principal); font-size: 0.85rem; margin-bottom: 8px;">
                        Indice P
                    </div>
                    <div style="font-size: 0.75rem; color: var(--bleu-moyen);">
                        Voir détails →
                    </div>
                </div>
                
                <!-- CARTE M -->
                <div id="carte-indice-M" style="background: white; padding: 12px 8px; border-radius: 6px; text-align: center; 
                            border: 2px solid ${obtenirCouleurIndice(indices.M)};">
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                        Mobilisation
                    </div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: ${obtenirCouleurIndice(indices.M)}; margin: 8px 0;">
                        ${indices.M}%
                    </div>
                    <div style="font-weight: bold; color: var(--bleu-principal); font-size: 0.85rem; margin-bottom: 8px;">
                        Indice M
                    </div>
                    <div style="font-size: 0.7rem; color: var(--bleu-leger);">
                        (A+C)/2
                    </div>
                </div>
                
                <!-- CARTE E -->
                <div id="carte-indice-E" style="background: white; padding: 12px 8px; border-radius: 6px; text-align: center; 
                            border: 2px solid var(--bleu-moyen);">
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                        Engagement
                    </div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: var(--bleu-moyen); margin: 8px 0;">
                        ${indices.E}
                    </div>
                    <div style="font-weight: bold; color: var(--bleu-principal); font-size: 0.85rem; margin-bottom: 8px;">
                        Indice E
                    </div>
                    <div style="font-size: 0.7rem; color: var(--bleu-leger);">
                        A×C×P
                    </div>
                </div>
                
                <!-- CARTE R -->
                <div id="carte-indice-R" style="background: white; padding: 12px 8px; border-radius: 6px; text-align: center; 
                            border: 2px solid ${indices.R > 0.7 ? 'var(--risque-tres-eleve)' : indices.R > 0.4 ? 'var(--risque-modere)' : 'var(--risque-minimal)'};">
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                        Risque d'échec
                    </div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: ${indices.R > 0.7 ? 'var(--risque-tres-eleve)' : indices.R > 0.4 ? 'var(--risque-modere)' : 'var(--risque-minimal)'}; margin: 8px 0;">
                        ${indices.R}
                    </div>
                    <div style="font-weight: bold; color: var(--bleu-principal); font-size: 0.85rem; margin-bottom: 8px;">
                        Indice R
                    </div>
                    <div style="font-size: 0.7rem; color: var(--bleu-leger);">
                        1-E
                    </div>
                </div>
            </div>
            
            <!-- PANNEAU DE DÉTAILS -->
            <div id="panneau-details-indice" style="display: none; margin: 15px 0 0 0; padding: 15px; 
                 background: white; border-radius: 6px; border: 2px solid var(--bleu-principal); 
                 border-top-width: 4px; position: relative; animation: slideDown 0.3s ease;">
                <button onclick="fermerDetailIndice()" 
                        style="position: absolute; top: 10px; right: 10px; background: none; 
                               border: none; font-size: 1.5rem; cursor: pointer; color: #666; 
                               width: 30px; height: 30px; border-radius: 50%; 
                               transition: background 0.2s;"
                        onmouseover="this.style.background='#f0f0f0'"
                        onmouseout="this.style.background='none'">
                    ×
                </button>
                <div id="contenu-detail-indice">
                    <!-- Contenu dynamique -->
                </div>
            </div>
            
            <!-- 🆕 LÉGENDE SUPPRIMÉE -->
        </div>
    `;

    console.log('✅ Profil affiché pour:', eleve.prenom, eleve.nom);
}

/* ===============================
   📁 GESTION DU PORTFOLIO
   =============================== */

/* ⚠️ CODE SUPPRIMÉ - 23 octobre 2025
 *
 * Les fonctions chargerPortfolioDetail() et toggleArtefactPortfolio()
 * étaient dupliquées dans ce fichier.
 *
 * UTILISER DÉSORMAIS les fonctions de portfolio.js:
 * - chargerPortfolioEleveDetail(da)
 * - toggleArtefactPortfolio(da, portfolioId, nombreARetenir)
 *
 * Ces fonctions sont globalement accessibles et gèrent le portfolio étudiant.
 * Les appels HTML (onchange) utilisent automatiquement les fonctions de portfolio.js.
 */

/**
* Génère le HTML de la section assiduité
    * @param { string } da - Numéro de DA
        * @returns { string } - HTML de la section
            */
/**
 * Génère le HTML de la section assiduité avec dates cliquables
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
/**
 * Génère le HTML de la section assiduité avec layout horizontal
 * VERSION SIMPLIFIÉE : absences affichées côte à côte
 * 
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionAssiduite(da) {
    const details = obtenirDetailsAssiduite(da);
    const taux = details.heuresOffertes > 0 
        ? (details.heuresPresentes / details.heuresOffertes * 100).toFixed(1)
        : 0;

    return `
        <!-- STATISTIQUES avec classes CSS natives -->
        <div class="grille-statistiques mb-2">
            <div class="carte-metrique">
                <strong>${details.heuresPresentes}h</strong>
                <span>Présentes</span>
            </div>
            <div class="carte-metrique">
                <strong>${details.heuresOffertes}h</strong>
                <span>Offertes</span>
            </div>
            <div class="carte-metrique">
                <strong>${taux}%</strong>
                <span>Taux d'assiduité</span>
            </div>
            <div class="carte-metrique">
                <strong>${details.nombreSeances}</strong>
                <span>Séances</span>
            </div>
        </div>
        
        <!-- LISTE DES ABSENCES -->
        ${details.absences.length > 0 ? `
            <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
                📅 Absences et retards
            </h4>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${details.absences.map(abs => {
                    const date = new Date(abs.date + 'T12:00:00');
                    const options = { weekday: 'short', day: 'numeric', month: 'short' };
                    const dateFormatee = date.toLocaleDateString('fr-CA', options);
                    const estAbsenceComplete = abs.heuresPresence === 0;
                    const icone = estAbsenceComplete ? '🔴' : '🟡';
                    const bordure = estAbsenceComplete ? '#dc3545' : '#ffc107';
                    
                    return `
                        <div style="flex: 0 0 auto; min-width: 180px; padding: 10px 12px; 
                                    background: var(--bleu-tres-pale); border-left: 3px solid ${bordure}; 
                                    border-radius: 4px; cursor: pointer;"
                             onclick="naviguerVersPresenceAvecDate('${abs.date}')"
                             onmouseover="this.style.background='#e0e8f0'"
                             onmouseout="this.style.background='var(--bleu-tres-pale)'">
                            <div style="color: var(--bleu-principal); font-weight: 500; margin-bottom: 3px;">
                                ${icone} ${dateFormatee}
                            </div>
                            <div style="font-size: 0.9rem; color: #666;">
                                ${estAbsenceComplete 
                                    ? `${abs.heuresManquees}h manquées` 
                                    : `${abs.heuresPresence}h / ${abs.heuresPresence + abs.heuresManquees}h`
                                }
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : `
            <div style="text-align: center; padding: 20px; background: #d4edda; border-radius: 6px; color: #155724;">
                <div style="font-size: 2rem;">✅</div>
                <div style="font-weight: 500;">Assiduité parfaite !</div>
            </div>
        `}
    `;
}



/**
 * Génère le HTML de la section performance
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionPerformance(da) {
    const meilleures = obtenirDetailsPerformance(da);

    if (meilleures.length === 0) {
        return `
            <div style="padding: 20px; background: var(--bleu-tres-pale); border-radius: 6px; text-align: center;">
                <p style="color: #666;">Aucune évaluation disponible pour le moment</p>
            </div>
        `;
    }

    const moyenne = meilleures.reduce((sum, m) => sum + m.note, 0) / meilleures.length;

    return `
        <div style="padding: 15px; background: var(--bleu-tres-pale); border-radius: 6px;">
            <div style="background: white; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">
                    Moyenne PAN (${meilleures.length} meilleur${meilleures.length > 1 ? 's' : ''} artefact${meilleures.length > 1 ? 's' : ''})
                </div>
                <div style="font-size: 3rem; font-weight: bold; color: ${obtenirCouleurIndice(moyenne)};">
                    ${moyenne.toFixed(1)}/100
                </div>
            </div>
            
            <h4 style="color: var(--bleu-principal); margin-bottom: 15px;">
                🏆 Les ${meilleures.length} meilleur${meilleures.length > 1 ? 's' : ''} artefact${meilleures.length > 1 ? 's' : ''}
            </h4>
            
            ${meilleures.map((art, index) => `
                <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid ${obtenirCouleurIndice(art.note)};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">
                                #${index + 1} · ${echapperHtml(art.titre)}
                            </div>
                            <div style="font-size: 0.85rem; color: #666;">
                                Évalué le ${formaterDate(art.dateEvaluation)}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.8rem; font-weight: bold; color: ${obtenirCouleurIndice(art.note)};">
                                ${art.note}/100
                            </div>
                            <div style="font-size: 0.9rem; color: var(--bleu-moyen); font-weight: bold;">
                                ${art.niveau}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
            
            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; font-size: 0.9rem; color: #666;">
                <strong>ℹ️ Principe PAN :</strong> La note finale est calculée sur la moyenne des 3 meilleurs artefacts 
                plutôt que sur la moyenne de tous les artefacts.
            </div>
        </div>
    `;
}

/**
 * Variable globale pour suivre quel indice est actuellement affiché
 */
let indiceActif = null;

/**
 * Toggle l'affichage des détails d'un indice avec lien visuel + grisage des autres cartes
 * MODIFIÉ : Le case 'P' affiche maintenant le portfolio complet
 */
/**
 * Toggle l'affichage des détails d'un indice
 * MODIFIÉ : Case 'C' supprimé, case 'P' affiche portfolio avec stats C et P
 */
function toggleDetailIndice(indice, da) {
    const panneau = document.getElementById('panneau-details-indice');
    const contenu = document.getElementById('contenu-detail-indice');

    if (!panneau || !contenu) {
        console.error('❌ Éléments du panneau de détails introuvables');
        return;
    }

    // Si on clique sur le même indice, fermer
    if (indiceActif === indice && panneau.style.display === 'block') {
        fermerDetailIndice();
        return;
    }

    // Mettre à jour l'indice actif
    indiceActif = indice;

    // GRISER toutes les cartes sauf celle active
    const toutesLesCartes = ['A', 'C', 'P', 'M', 'E', 'R'];
    toutesLesCartes.forEach(ind => {
        const carte = document.getElementById(`carte-indice-${ind}`);
        if (carte) {
            if (ind === indice) {
                carte.style.opacity = '1';
                carte.style.filter = 'none';
            } else {
                carte.style.opacity = '0.4';
                carte.style.filter = 'grayscale(50%)';
            }
        }
    });

    // Récupérer la couleur de la carte cliquée
    const carteCliquee = document.getElementById(`carte-indice-${indice}`);
    let couleurBordure = 'var(--bleu-principal)';
    if (carteCliquee) {
        const style = window.getComputedStyle(carteCliquee);
        couleurBordure = style.borderColor;
    }

    // Appliquer la couleur de bordure au panneau
    panneau.style.borderTopColor = couleurBordure;
    panneau.style.borderTopWidth = '4px';

    // Générer le contenu selon l'indice
    let html = '';
    switch (indice) {
        case 'A':
            html = `
                <h3 style="color: var(--bleu-principal); margin-bottom: 15px; padding-right: 40px;">
                    📅 Assiduité détaillée
                </h3>
                ${genererSectionAssiduite(da)}
            `;
            break;
        case 'C':
            html = `
                <h3 style="color: var(--bleu-principal); margin-bottom: 15px; padding-right: 40px;">
                    ✅ Complétion détaillée
                </h3>
                ${genererSectionCompletion(da)}
            `;
            break;
        case 'P':
            html = `
                <h3 style="color: var(--bleu-principal); margin-bottom: 15px; padding-right: 40px;">
                    📊 Performance détaillée
                </h3>
                ${genererSectionPerformance(da)}
            `;
            break;
    }

    contenu.innerHTML = html;
    panneau.style.display = 'block';

    // Scroll smooth vers le panneau
    setTimeout(() => {
        panneau.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

/**
 * Ferme le panneau de détails
 * MODIFIÉ : Liste des cartes mise à jour sans C
 */
function fermerDetailIndice() {
    const panneau = document.getElementById('panneau-details-indice');
    if (panneau) {
        panneau.style.display = 'none';
        indiceActif = null;
    }

    // RETIRER le grisage de toutes les cartes (liste mise à jour)
    const toutesLesCartes = ['A', 'P', 'M', 'E', 'R'];
    toutesLesCartes.forEach(ind => {
        const carte = document.getElementById(`carte-indice-${ind}`);
        if (carte) {
            carte.style.opacity = '1';
            carte.style.filter = 'none';
        }
    });
}


/**
 * Génère le HTML de la section Complétion détaillée
 *
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionCompletion(da) {
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');

    // Identifier les artefacts-portfolio réellement donnés
    const artefactsPortfolioIds = new Set(artefactsPortfolio.map(a => a.id));
    const artefactsDonnes = [];

    evaluations.forEach(evaluation => {
        if (artefactsPortfolioIds.has(evaluation.productionId)) {
            if (!artefactsDonnes.find(a => a.id === evaluation.productionId)) {
                const production = artefactsPortfolio.find(p => p.id === evaluation.productionId);
                if (production) {
                    artefactsDonnes.push(production);
                }
            }
        }
    });

    if (artefactsDonnes.length === 0) {
        return `
            <div class="text-muted" style="text-align: center; padding: 30px;">
                <p>📝 Aucun artefact de portfolio évalué pour le moment</p>
            </div>
        `;
    }

    // Récupérer les évaluations de l'élève
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);

    // Construire la liste des artefacts avec leur statut
    const artefacts = artefactsDonnes.map(art => {
        const evaluation = evaluationsEleve.find(e => e.productionId === art.id);
        return {
            id: art.id,
            titre: art.titre,
            remis: !!evaluation,
            note: evaluation?.noteFinale || null,
            niveau: evaluation?.niveauFinal || null
        };
    }).sort((a, b) => {
        if (a.remis && !b.remis) return -1;
        if (!a.remis && b.remis) return 1;
        return a.titre.localeCompare(b.titre);
    });

    const nbTotal = artefacts.length;
    const nbRemis = artefacts.filter(a => a.remis).length;
    const tauxCompletion = Math.round((nbRemis / nbTotal) * 100);
    const indices = calculerTousLesIndices(da);

    return `
        <!-- STATISTIQUES -->
        <div class="grille-statistiques mb-2">
            <div class="carte-metrique">
                <strong>${nbRemis}/${nbTotal}</strong>
                <span>Artefacts remis</span>
            </div>
            <div class="carte-metrique">
                <strong>${tauxCompletion}%</strong>
                <span>Taux de complétion</span>
            </div>
            <div class="carte-metrique">
                <strong>${indices.C}%</strong>
                <span>Indice C</span>
            </div>
        </div>

        <!-- LISTE DES ARTEFACTS -->
        <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
            📝 Artefacts du portfolio (${nbTotal})
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${artefacts.map(art => {
                const icone = art.remis ? '✅' : '⏳';
                const bordure = art.remis ? 'var(--risque-minimal)' : '#ddd';
                const fond = art.remis ? '#d4edda' : '#f5f5f5';

                return `
                    <div style="flex: 0 0 auto; min-width: 200px; max-width: 250px; padding: 12px;
                                background: ${fond};
                                border-left: 3px solid ${bordure}; border-radius: 4px;
                                ${!art.remis ? 'opacity: 0.6;' : ''}">
                        <div style="color: ${art.remis ? '#155724' : '#666'}; font-weight: 500; margin-bottom: 5px;">
                            ${icone} ${echapperHtml(art.titre)}
                        </div>
                        ${art.remis ? `
                            <div style="font-size: 0.9rem; color: #666;">
                                <strong>${art.note}/100</strong>${art.niveau ? ` · ${art.niveau}` : ''}
                            </div>
                        ` : `
                            <div class="text-muted" style="font-size: 0.9rem;">Non remis</div>
                        `}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Génère le HTML de la section Performance (Portfolio) - VERSION CORRIGÉE
 *
 * CORRECTION : Ne compte QUE les artefacts réellement évalués
 * (au moins une évaluation existe pour cet artefact)
 *
 * COHÉRENCE avec calculerTauxCompletion() :
 * - Les deux fonctions utilisent maintenant la même logique
 * - Un artefact créé mais jamais évalué ne compte pas
 *
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionPerformance(da) {
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
    const portfolio = productions.find(p => p.type === 'portfolio');

    if (!portfolio) {
        return `
            <div class="text-muted" style="text-align: center; padding: 30px;">
                <p>📋 Aucun portfolio configuré</p>
            </div>
        `;
    }

    // Récupérer TOUS les artefacts créés
    const tousLesArtefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');
    
    if (tousLesArtefactsPortfolio.length === 0) {
        return `
            <div class="text-muted" style="text-align: center; padding: 30px;">
                <p>📝 Aucun artefact de portfolio créé</p>
            </div>
        `;
    }

    // ✅ CORRECTION : Identifier les artefacts RÉELLEMENT ÉVALUÉS
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const productionsEvaluees = new Set();
    evaluations.forEach(evaluation => {
        productionsEvaluees.add(evaluation.productionId);
    });

    // ✅ Ne considérer QUE les artefacts qui ont été évalués (au moins 1 élève)
    const artefactsPortfolio = tousLesArtefactsPortfolio.filter(art => 
        productionsEvaluees.has(art.id)
    );

    // Récupérer les évaluations et sélections de l'élève
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);
    const selectionsPortfolios = JSON.parse(localStorage.getItem('portfoliosEleves') || '{}');
    const selectionEleve = selectionsPortfolios[da]?.[portfolio.id] || { artefactsRetenus: [] };

    // Construire la liste des artefacts (seulement ceux évalués)
    const artefacts = artefactsPortfolio.map(art => {
        const evaluation = evaluationsEleve.find(e => e.productionId === art.id);
        return {
            id: art.id,
            titre: art.titre,
            remis: !!evaluation,
            note: evaluation?.noteFinale || null,
            niveau: evaluation?.niveauFinal || null,
            retenu: selectionEleve.artefactsRetenus.includes(art.id)
        };
    }).sort((a, b) => {
        if (a.remis && !b.remis) return -1;
        if (!a.remis && b.remis) return 1;
        return a.titre.localeCompare(b.titre);
    });

    // ✨ SÉLECTION AUTOMATIQUE des meilleurs artefacts si aucune sélection manuelle
    const nombreARetenir = portfolio.regles.nombreARetenir || 3;
    if (selectionEleve.artefactsRetenus.length === 0) {
        const artefactsRemisAvecNote = artefacts
            .filter(a => a.remis && a.note !== null)
            .sort((a, b) => b.note - a.note);

        const meilleurs = artefactsRemisAvecNote.slice(0, nombreARetenir);

        if (meilleurs.length > 0) {
            selectionEleve.artefactsRetenus = meilleurs.map(a => a.id);

            if (!selectionsPortfolios[da]) {
                selectionsPortfolios[da] = {};
            }
            selectionsPortfolios[da][portfolio.id] = {
                artefactsRetenus: selectionEleve.artefactsRetenus,
                dateSelection: new Date().toISOString(),
                auto: true
            };
            localStorage.setItem('portfoliosEleves', JSON.stringify(selectionsPortfolios));

            // Mettre à jour le flag retenu
            artefacts.forEach(art => {
                art.retenu = selectionEleve.artefactsRetenus.includes(art.id);
            });
        }
    }

    const nbTotal = artefacts.length;  // ✅ Maintenant basé sur les artefacts ÉVALUÉS
    const nbRemis = artefacts.filter(a => a.remis).length;
    const nbRetenus = selectionEleve.artefactsRetenus.length;
    const indices = calculerTousLesIndices(da);
    
    // Note basée sur les 3 meilleurs
    const artefactsRemisAvecNote = artefacts.filter(a => a.remis && a.note !== null);
    const top3 = artefactsRemisAvecNote.sort((a, b) => b.note - a.note).slice(0, 3);
    const noteTop3 = top3.length > 0 
        ? (top3.reduce((sum, a) => sum + a.note, 0) / top3.length).toFixed(1) 
        : null;
    const selectionComplete = nbRetenus === portfolio.regles.nombreARetenir;

    return `
        <!-- STATISTIQUES avec classes CSS natives -->
        <div class="grille-statistiques mb-2">
            <div class="carte-metrique">
                <strong>${nbRemis}/${nbTotal}</strong>
                <span>Artefacts remis</span>
            </div>
            <div class="carte-metrique">
                <strong>${indices.C}%</strong>
                <span>Complétion (C)</span>
            </div>
            <div class="carte-metrique">
                <strong>${indices.P}%</strong>
                <span>Performance (P)</span>
            </div>
            <div class="carte-metrique">
                <strong>${noteTop3 || '--'}${noteTop3 ? '/100' : ''}</strong>
                <span>Note (top 3)</span>
            </div>
        </div>
        
        <!-- TITRE AVEC INSTRUCTION INTÉGRÉE -->
        <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
            📝 Artefacts (${nbTotal})
            ${!selectionComplete ? `
                <span style="font-weight: normal; color: #666; font-size: 0.9rem;">
                    · Sélectionnez ${portfolio.regles.nombreARetenir} artefacts pour construire la note finale (${nbRetenus}/${portfolio.regles.nombreARetenir})
                </span>
            ` : `
                <span style="font-weight: normal; color: var(--risque-minimal); font-size: 0.9rem;">
                    · ${portfolio.regles.nombreARetenir} artefacts sélectionnés ✓
                </span>
            `}
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${artefacts.map(art => {
                const iconeStatut = !art.remis ? '⏳' : '📄';
                const fondCouleur = art.retenu
                    ? 'linear-gradient(to right, #d4edda, #e8f5e9)'
                    : (art.remis ? 'var(--bleu-tres-pale)' : '#f5f5f5');
                const bordure = art.retenu ? '#28a745' : (art.remis ? 'var(--bleu-moyen)' : '#ddd');
                const couleurTitre = art.retenu ? '#155724' : 'var(--bleu-principal)';
                const fondHover = art.retenu ? '#c3e6cb' : '#e0e8f0';

                return `
                    <div style="flex: 0 0 auto; min-width: 200px; max-width: 250px; padding: 12px;
                                background: ${fondCouleur};
                                border-left: ${art.retenu ? '4px' : '3px'} solid ${bordure};
                                border-radius: 4px;
                                ${!art.remis ? 'opacity: 0.6;' : ''}
                                ${art.retenu ? 'box-shadow: 0 2px 6px rgba(40, 167, 69, 0.2);' : ''}
                                transition: all 0.3s ease;"
                         onmouseover="this.style.background='${fondHover}'"
                         onmouseout="this.style.background='${fondCouleur}'">
                        <label style="display: flex; gap: 8px; cursor: ${art.remis ? 'pointer' : 'not-allowed'};">
                            <input type="checkbox"
                                   name="artefactRetenu"
                                   value="${art.id}"
                                   ${art.retenu ? 'checked' : ''}
                                   ${!art.remis ? 'disabled' : ''}
                                   onchange="toggleArtefactPortfolio('${da}', '${portfolio.id}', ${portfolio.regles.nombreARetenir})"
                                   style="margin-top: 2px; accent-color: #28a745;">
                            <div style="flex: 1;">
                                <div style="color: ${couleurTitre}; font-weight: 500; margin-bottom: 5px;">
                                    ${iconeStatut} ${echapperHtml(art.titre)}
                                </div>
                                ${art.remis ? `
                                    <div style="font-size: 0.9rem; color: #666;">
                                        <strong>${art.note}/100</strong>${art.niveau ? ` · ${art.niveau}` : ''}
                                    </div>
                                ` : `
                                    <div class="text-muted">Non remis</div>
                                `}
                            </div>
                        </label>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Génère le HTML de la section assiduité - VERSION CSS NATIVE
 */
function genererSectionAssiduite(da) {
    const details = obtenirDetailsAssiduite(da);
    const taux = details.heuresOffertes > 0 
        ? (details.heuresPresentes / details.heuresOffertes * 100).toFixed(1)
        : 0;

    return `
        <!-- STATISTIQUES avec classes CSS natives -->
        <div class="grille-statistiques mb-2">
            <div class="carte-metrique">
                <strong>${details.heuresPresentes}h</strong>
                <span>Présentes</span>
            </div>
            <div class="carte-metrique">
                <strong>${details.heuresOffertes}h</strong>
                <span>Offertes</span>
            </div>
            <div class="carte-metrique">
                <strong>${taux}%</strong>
                <span>Taux d'assiduité</span>
            </div>
            <div class="carte-metrique">
                <strong>${details.nombreSeances}</strong>
                <span>Séances</span>
            </div>
        </div>
        
        <!-- LISTE DES ABSENCES -->
        ${details.absences.length > 0 ? `
            <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
                📅 Absences et retards
            </h4>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${details.absences.map(abs => {
                    const date = new Date(abs.date + 'T12:00:00');
                    const options = { weekday: 'short', day: 'numeric', month: 'short' };
                    const dateFormatee = date.toLocaleDateString('fr-CA', options);
                    const estAbsenceComplete = abs.heuresPresence === 0;
                    const icone = estAbsenceComplete ? '🔴' : '🟡';
                    const bordure = estAbsenceComplete ? '#dc3545' : '#ffc107';
                    
                    return `
                        <div style="flex: 0 0 auto; min-width: 180px; padding: 10px 12px; 
                                    background: var(--bleu-tres-pale); border-left: 3px solid ${bordure}; 
                                    border-radius: 4px; cursor: pointer;"
                             onclick="naviguerVersPresenceAvecDate('${abs.date}')"
                             onmouseover="this.style.background='#e0e8f0'"
                             onmouseout="this.style.background='var(--bleu-tres-pale)'">
                            <div style="color: var(--bleu-principal); font-weight: 500; margin-bottom: 3px;">
                                ${icone} ${dateFormatee}
                            </div>
                            <div style="font-size: 0.9rem; color: #666;">
                                ${estAbsenceComplete 
                                    ? `${abs.heuresManquees}h manquées` 
                                    : `${abs.heuresPresence}h / ${abs.heuresPresence + abs.heuresManquees}h`
                                }
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : `
            <div style="text-align: center; padding: 20px; background: #d4edda; border-radius: 6px; color: #155724;">
                <div style="font-size: 2rem;">✅</div>
                <div style="font-weight: 500;">Assiduité parfaite !</div>
            </div>
        `}
    `;
}

/**
 * Navigue vers la section Présences › Saisie avec une date pré-sélectionnée
 * @param {string} dateStr - Date au format YYYY-MM-DD
 */
function naviguerVersPresenceAvecDate(dateStr) {
    console.log('🔀 Navigation vers Présences › Saisie avec date:', dateStr);

    // 1. Afficher la section Présences
    if (typeof afficherSection === 'function') {
        afficherSection('presences');
    }

    // 2. Afficher la sous-section Saisie
    if (typeof afficherSousSection === 'function') {
        afficherSousSection('presences-saisie');
    }

    // 3. Attendre que le DOM soit mis à jour, puis pré-sélectionner la date
    setTimeout(() => {
        const inputDate = document.getElementById('date-cours');
        if (inputDate) {
            inputDate.value = dateStr;

            // Déclencher l'événement change pour charger le tableau de cette date
            const event = new Event('change', { bubbles: true });
            inputDate.dispatchEvent(event);

            console.log('✅ Date pré-sélectionnée:', dateStr);

            // Scroll vers le haut pour voir le formulaire
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.error('❌ Input #date-cours introuvable');
        }
    }, 300);
}

/**
 * Formate une date ISO en format court lisible (ex: "Lun 21 oct. 2024")
 * @param {string} dateISO - Date au format YYYY-MM-DD
 * @returns {string} - Date formatée
 */
function formaterDateCourte(dateISO) {
    if (!dateISO) return 'N/A';
    const date = new Date(dateISO + 'T12:00:00');
    const options = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    };
    return date.toLocaleDateString('fr-CA', options);
}

/* ===============================
   📌 SECTIONS À DÉVELOPPER
   =============================== */

// TODO: Ajouter fonction afficherIndicesACP(da)
// TODO: Ajouter fonction afficherHistoriqueAssiduité(da)
// TODO: Ajouter fonction afficherGraphiquesProgression(da)
// TODO: Ajouter fonction afficherEvaluationsDetaillees(da)

/**
 * Toggle l'affichage d'une section détaillée
 * @param {string} sectionId - ID de la section à afficher/cacher
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const isVisible = section.style.display !== 'none';
        section.style.display = isVisible ? 'none' : 'block';

        // Changer l'icône du titre
        const titre = section.previousElementSibling;
        if (titre) {
            titre.textContent = titre.textContent.replace(
                isVisible ? '▼' : '▶',
                isVisible ? '▶' : '▼'
            );
        }
    }
}

/* ===============================
   📌 EXPORTS (accessibles globalement)
   =============================== */

// Les fonctions sont automatiquement disponibles globalement
// car non encapsulées dans un module ES6