/* ===============================
   MODULE PORTFOLIO: GESTION DES PORTFOLIOS ÉTUDIANTS
   
   Contenu:
   - Affichage du portfolio d'un étudiant
   - Liste des artefacts (remis/non remis)
   - Sélection des artefacts retenus pour note finale
   - Calcul notes provisoires et finales
   - Sauvegarde des sélections
   =============================== */

/* ===============================
   📋 DÉPENDANCES
   
   LocalStorage lu:
   - 'listeGrilles' : Array des productions (inclut portfolio + artefacts)
   - 'evaluationsSauvegardees' : Array des évaluations par étudiant
   - 'portfoliosEleves' : Object {da: {portfolioId: {artefactsRetenus: [...]}}}
   =============================== */

/**
 * Charge et affiche le portfolio détaillé d'un étudiant
 * @param {string} da - DA de l'étudiant
 */
function chargerPortfolioEleveDetail(da) {
    try {
        // Récupérer les données
        const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
        const portfolio = productions.find(p => p.type === 'portfolio');

        if (!portfolio) {
            document.getElementById('portfolioEleveDetail').innerHTML =
                '<p class="text-muted">Aucun portfolio configuré dans Réglages › Productions.</p>';
            return;
        }

        // Récupérer tous les artefacts-portfolio créés
        const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');

        // Récupérer les évaluations de cet élève
        const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
        const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);

        // Récupérer les sélections de portfolio
        const selectionsPortfolios = JSON.parse(localStorage.getItem('portfoliosEleves') || '{}');
        const selectionEleve = selectionsPortfolios[da]?.[portfolio.id] || { artefactsRetenus: [] };

        // Nombre total prévu (nouveau champ)
        const nombreTotal = portfolio.regles.nombreTotal || artefactsPortfolio.length;
        const minimumRequis = portfolio.regles.minimumCompletion || 7;
        const nombreARetenir = portfolio.regles.nombreARetenir || 3;

        // Construire la liste des artefacts avec leur statut
        const artefacts = [];
        
        // Ajouter les artefacts existants
        artefactsPortfolio.forEach(art => {
            const evaluation = evaluationsEleve.find(e => e.productionId === art.id);
            artefacts.push({
                id: art.id,
                titre: art.titre,
                description: art.description || '',
                remis: !!evaluation,
                note: evaluation?.noteFinale || null,
                niveau: evaluation?.niveauFinal || null,
                retenu: selectionEleve.artefactsRetenus.includes(art.id),
                existe: true
            });
        });

        // Ajouter les artefacts "à venir" si nécessaire
        const artefactsManquants = nombreTotal - artefactsPortfolio.length;
        for (let i = 0; i < artefactsManquants; i++) {
            artefacts.push({
                id: null,
                titre: `Artefact #${artefactsPortfolio.length + i + 1}`,
                description: 'À venir',
                remis: false,
                note: null,
                niveau: null,
                retenu: false,
                existe: false
            });
        }

        // Trier : artefacts remis en premier, puis existants, puis à venir
        artefacts.sort((a, b) => {
            if (a.remis && !b.remis) return -1;
            if (!a.remis && b.remis) return 1;
            if (a.existe && !b.existe) return -1;
            if (!a.existe && b.existe) return 1;
            return 0;
        });

        // ✨ SÉLECTION AUTOMATIQUE des meilleurs artefacts si aucune sélection manuelle
        if (selectionEleve.artefactsRetenus.length === 0) {
            // Récupérer les artefacts remis avec note, triés par note décroissante
            const artefactsRemisAvecNote = artefacts
                .filter(a => a.remis && a.note !== null)
                .sort((a, b) => b.note - a.note);

            // Sélectionner automatiquement les N meilleurs (N = nombreARetenir)
            const meilleurs = artefactsRemisAvecNote.slice(0, nombreARetenir);

            if (meilleurs.length > 0) {
                // Mettre à jour la sélection
                selectionEleve.artefactsRetenus = meilleurs.map(a => a.id);

                // Sauvegarder dans localStorage
                if (!selectionsPortfolios[da]) {
                    selectionsPortfolios[da] = {};
                }
                selectionsPortfolios[da][portfolio.id] = {
                    artefactsRetenus: selectionEleve.artefactsRetenus,
                    dateSelection: new Date().toISOString(),
                    auto: true // Flag pour indiquer sélection automatique
                };
                localStorage.setItem('portfoliosEleves', JSON.stringify(selectionsPortfolios));

                // Mettre à jour le flag retenu dans les artefacts
                artefacts.forEach(art => {
                    art.retenu = selectionEleve.artefactsRetenus.includes(art.id);
                });

                console.log(`✨ Sélection automatique : ${meilleurs.length} meilleur(s) artefact(s) sélectionné(s)`);
            }
        }

        // Statistiques
        const nbRemis = artefacts.filter(a => a.remis).length;
        const nbRetenus = selectionEleve.artefactsRetenus.length;

        // Calculer les notes
        const artefactsAvecNote = artefacts.filter(a => a.remis && a.note !== null);
        const noteProvisoire = artefactsAvecNote.length > 0
            ? artefactsAvecNote.reduce((sum, a) => sum + a.note, 0) / artefactsAvecNote.length
            : null;

        const artefactsRetenusAvecNote = artefacts.filter(a => a.retenu && a.note !== null);
        const noteFinale = nbRetenus === nombreARetenir && artefactsRetenusAvecNote.length > 0
            ? artefactsRetenusAvecNote.reduce((sum, a) => sum + a.note, 0) / artefactsRetenusAvecNote.length
            : null;

        // Générer le HTML
        const container = document.getElementById('portfolioEleveDetail');
        container.innerHTML = `
            <!-- Barre de progression -->
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Progression :</strong> ${nbRemis}/${minimumRequis} remis ${nombreTotal > minimumRequis ? `(${nombreTotal} artefacts prévus)` : ''}</span>
                    <span style="color: ${nbRemis >= minimumRequis ? 'green' : 'orange'};">
                        ${nbRemis >= minimumRequis ? '✓ Minimum atteint' : 'Minimum requis'}
                    </span>
                </div>
                <div style="background: #ddd; height: 10px; border-radius: 5px; overflow: hidden;">
                    <div style="background: var(--bleu-principal); height: 100%; width: ${Math.min((nbRemis / minimumRequis) * 100, 100)}%; 
                                transition: width 0.3s ease;"></div>
                </div>
                <p style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                    <strong>${nombreARetenir}</strong> artefacts à retenir pour la note finale
                </p>
            </div>

            <!-- Liste des artefacts -->
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--bleu-principal); margin-bottom: 15px;">📑 Artefacts du portfolio (${artefacts.length})</h4>
                ${artefacts.map((art, index) => `
                    <div style="padding: 15px; margin-bottom: 10px;
                                background: ${art.retenu ? 'linear-gradient(to right, #d4edda, #e8f5e9)' : (!art.existe ? '#f8f9fa' : 'white')};
                                border: ${art.retenu ? '3px' : '2px'} solid ${art.retenu ? '#28a745' : (art.existe ? '#ddd' : '#e0e0e0')};
                                border-radius: 8px; ${!art.remis ? 'opacity: 0.7;' : ''}
                                ${art.retenu ? 'box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);' : ''}
                                transition: all 0.3s ease;">
                        ${art.existe ? `
                        <label style="display: flex; align-items: start; cursor: ${art.remis ? 'pointer' : 'not-allowed'};">
                            <input type="checkbox"
                                   name="artefactRetenu"
                                   value="${art.id}"
                                   ${art.retenu ? 'checked' : ''}
                                   ${!art.remis ? 'disabled' : ''}
                                   onchange="toggleArtefactPortfolio('${da}', '${portfolio.id}', ${nombreARetenir})"
                                   style="margin-right: 15px; margin-top: 3px; transform: scale(1.4); accent-color: #28a745;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: ${art.retenu ? '#155724' : 'var(--bleu-principal)'}; margin-bottom: 5px;">
                                    ${echapperHtml(art.titre)}
                                </div>
                                ${art.description ? `<div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">${echapperHtml(art.description)}</div>` : ''}
                                <div style="display: flex; gap: 15px; font-size: 0.85rem;">
                                    ${art.remis
                                        ? `<span style="color: green;">✓ Remis</span>
                                           <span><strong>Note :</strong> ${art.note}/100</span>
                                           <span><strong>Niveau :</strong> ${echapperHtml(art.niveau)}</span>`
                                        : '<span style="color: #999;">— Non remis</span>'}
                                </div>
                            </div>
                        </label>
                        ` : `
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 18px; height: 18px; border: 2px dashed #ccc; border-radius: 3px;"></div>
                            <div style="flex: 1;">
                                <div style="font-weight: 500; color: #999; margin-bottom: 3px;">
                                    ${echapperHtml(art.titre)}
                                </div>
                                <div style="font-size: 0.85rem; color: #999; font-style: italic;">
                                    Artefact à venir (non encore créé dans Réglages › Productions)
                                </div>
                            </div>
                        </div>
                        `}
                    </div>
                `).join('')}
            </div>

            <!-- Calcul de la note -->
            <div style="padding: 20px; background: ${nbRetenus === nombreARetenir ? '#d4edda' : '#fff3cd'}; 
                        border-left: 4px solid ${nbRetenus === nombreARetenir ? '#28a745' : '#ffc107'}; 
                        border-radius: 8px;">
                <h4 style="margin-top: 0; color: ${nbRetenus === nombreARetenir ? '#155724' : '#856404'};">
                    ${nbRetenus === nombreARetenir ? '✓ Mode FINAL actif' : '⚠️ Mode PROVISOIRE'}
                </h4>
                
                ${noteProvisoire !== null 
                    ? `<p><strong>Note provisoire :</strong> ${noteProvisoire.toFixed(2)}/100 
                       <span style="font-size: 0.9rem; color: #666;">(moyenne de ${artefactsAvecNote.length} artefact${artefactsAvecNote.length > 1 ? 's' : ''})</span></p>` 
                    : ''}
                
                ${noteFinale !== null 
                    ? `<p style="font-size: 1.2rem;"><strong>Note finale :</strong> 
                       <span style="color: #28a745; font-size: 1.3rem;">${noteFinale.toFixed(2)}/100</span>
                       <span style="font-size: 0.9rem; color: #666;">(moyenne des ${nombreARetenir} retenus)</span></p>` 
                    : ''}
                
                <p style="margin-bottom: 0; color: ${nbRetenus === nombreARetenir ? '#155724' : '#856404'};">
                    ${nbRetenus === nombreARetenir
                        ? `Les ${nombreARetenir} artefacts sélectionnés déterminent la note finale`
                        : `Sélectionne ${nombreARetenir - nbRetenus} artefact${nombreARetenir - nbRetenus > 1 ? 's' : ''} supplémentaire${nombreARetenir - nbRetenus > 1 ? 's' : ''} pour activer le mode FINAL`}
                </p>
            </div>
        `;

    } catch (error) {
        console.error('Erreur chargement portfolio:', error);
        document.getElementById('portfolioEleveDetail').innerHTML =
            '<p style="color: red;">Erreur lors du chargement du portfolio.</p>';
    }
}

/**
 * Bascule la sélection d'un artefact pour le portfolio
 * @param {string} da - DA de l'étudiant
 * @param {string} portfolioId - ID du portfolio
 * @param {number} nombreARetenir - Nombre max d'artefacts à retenir
 */
function toggleArtefactPortfolio(da, portfolioId, nombreARetenir) {
    try {
        const checkboxes = document.querySelectorAll('input[name="artefactRetenu"]:checked');
        const artefactsRetenus = Array.from(checkboxes).map(cb => cb.value);

        // Limiter au nombre défini
        if (artefactsRetenus.length > nombreARetenir) {
            alert(`Tu ne peux sélectionner que ${nombreARetenir} artefact${nombreARetenir > 1 ? 's' : ''} maximum.`);
            event.target.checked = false;
            return;
        }

        // Sauvegarder la sélection
        let selectionsPortfolios = JSON.parse(localStorage.getItem('portfoliosEleves') || '{}');
        if (!selectionsPortfolios[da]) {
            selectionsPortfolios[da] = {};
        }

        selectionsPortfolios[da][portfolioId] = {
            artefactsRetenus: artefactsRetenus,
            dateSelection: new Date().toISOString()
        };

        localStorage.setItem('portfoliosEleves', JSON.stringify(selectionsPortfolios));

        // Recharger TOUT le profil pour mettre à jour les indices A-C-P-M-E-R
        if (typeof afficherProfilComplet === 'function') {
            afficherProfilComplet(da);

            // Rouvrir automatiquement le panneau Portfolio après rechargement
            if (typeof toggleDetailIndice === 'function') {
                toggleDetailIndice('P', da);
                console.log('✅ Panneau Portfolio rouvert automatiquement');
            }
        } else {
            // Fallback : recharger uniquement le portfolio
            chargerPortfolioEleveDetail(da);
        }

    } catch (error) {
        console.error('Erreur toggle artefact:', error);
        alert('Erreur lors de la sauvegarde');
    }
}

/* ===============================
   📌 NOTES
   =============================== */

/*
 * STRUCTURE DES DONNÉES:
 * 
 * listeGrilles (productions):
 * [
 *   {id, type: 'portfolio', regles: {nombreARetenir, minimumCompletion}, ...},
 *   {id, type: 'artefact-portfolio', titre, description, ...},
 *   ...
 * ]
 * 
 * evaluationsSauvegardees:
 * [
 *   {etudiantDA, productionId, noteFinale, niveauFinal, ...},
 *   ...
 * ]
 * 
 * portfoliosEleves:
 * {
 *   "DA123": {
 *     "PORTFOLIO_ID": {
 *       artefactsRetenus: ["ARTEFACT1", "ARTEFACT2"],
 *       dateSelection: "2025-10-10T..."
 *     }
 *   }
 * }
 */