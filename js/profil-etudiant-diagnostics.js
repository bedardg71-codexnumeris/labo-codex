/**
 * profil-etudiant-diagnostics.js
 *
 * Sous-module extrait de profil-etudiant.js (session B refactor, 18 mai 2026).
 *
 * Périmètre : génération HTML des diagnostics SRPNF / Critères / Générique,
 * blocs RLO (Profil, Évolution, Gestes cognitifs, Note),
 * onglets de développement.
 *
 * 11 fonctions, 11 exports window.X (convention systématique session A décision b).
 *
 * Appels privés résiduels (helpers, calculs, rapport) résolvent via chaîne de
 * scope global (window.X exposés par les sous-modules chargés AVANT celui-ci).
 *
 * @see SESSION.md — Récap session B
 * @see audit/refactoring-prep/MODULES-MAP.md §2.3
 */
(function () {
    'use strict';

/**
 * Génère le HTML du diagnostic des forces et défis par critère SRPNF
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML du diagnostic
 */
function genererDiagnosticCriteres(da) {
    // NOUVEAU Beta 90 : Utiliser la pratique active
    const pratique = typeof obtenirPratiqueActive === 'function' ? obtenirPratiqueActive() : null;

    if (!pratique) {
        console.error('[ProfilEtudiant] Aucune pratique active trouvée');
        return '';
    }

    // Obtenir les défis selon la pratique
    const defisInfo = pratique.detecterDefis(da);


    // Si aucune donnée, ne rien afficher
    if (!defisInfo || (!defisInfo.defis && !defisInfo.forces)) {
        return '';
    }

    // Adapter l'affichage selon le type de pratique
    if (defisInfo.type === 'srpnf') {
        return genererDiagnosticSRPNF(da, defisInfo);
    } else if (defisInfo.type === 'generique') {
        return genererDiagnosticGenerique(da, defisInfo);
    }

    return '';
}

/**
 * Génère le diagnostic SRPNF (PAN-Standards)
 */
function genererDiagnosticSRPNF(da, defisInfo) {
    // Recalculer moyennes pour l'affichage détaillé (compatibilité)
    const moyennes = calculerMoyennesCriteres(da);

    if (!moyennes) {
        return '';
    }

    const diagnostic = defisInfo; // Utiliser les défis de la pratique

    // Fonction helper pour obtenir la couleur selon le score
    const obtenirCouleurScore = (score) => {
        if (score >= 0.85) return 'var(--bleu-clair)'; // Bleu
        if (score >= 0.75) return 'var(--vert-succes)'; // Vert
        if (score >= 0.7125) return 'var(--vert-succes)'; // Vert (force)
        if (score >= 0.65) return 'var(--btn-annuler)'; // Jaune
        return 'var(--orange-accent)'; // Orange
    };

    return `
        <!-- DIAGNOSTIC CRITÈRES SRPNF -->
        <h4 class="profil-titre-bleu-mt20">
            Diagnostic par critère (seuil force&nbsp;: 0.7125)
        </h4>

        <!-- Tableau des scores par critère -->
        <div class="profil-carte-simple">
            <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 10px; font-size: 0.9rem;">
                ${criteresDeLaGrillePourAffichage().map(critere => {
                    // #529 — les critères viennent de la GRILLE, et leur nom
                    // est celui que l'utilisateur a écrit. La cascade de
                    // ternaires qui vivait ici traduisait cinq clés en cinq
                    // libellés : pour toute autre grille, elle rendait
                    // « Français » quel que soit le critère (le dernier `:`
                    // était sans condition).
                    const nomCritere = echapperHtml(critere.nom);
                    const score = moyennes[critere.cle];

                    if (score === null) return '';

                    const pourcentage = Math.round(score * 100);
                    const couleur = obtenirCouleurScore(score);
                    const estForce = score >= 0.7125;
                    const estDefi = score < 0.7125;

                    return `
                        <div style="font-weight: 500; color: var(--gris-fonce);">${nomCritere}</div>
                        <div class="u-text-center">
                            <span style="display: inline-block; min-width: 50px; padding: 4px 10px;
                                         background: ${couleur}22; color: ${couleur};
                                         border-radius: 4px; font-weight: bold;">
                                ${pourcentage}%
                            </span>
                        </div>
                        <div style="text-align: right; font-size: 0.85rem; color: ${estForce ? 'var(--vert-succes)' : estDefi ? 'var(--orange-accent)' : 'var(--gris-moyen)'};">
                            ${estForce ? 'Force' : estDefi ? 'Défi' : '—'}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- [Phase 6] Ancien encadré "Indice de Blocage" supprimé — remplacé par encadreSuivi (IPB × direction) -->

        <!-- Résumé forces et défis par niveau IDME -->
        ${(() => {
            // ✅ Extraire dynamiquement les critères depuis la grille de référence
            const grille = obtenirGrilleReferenceDepistage();
            if (!grille || !grille.criteres || grille.criteres.length === 0) {
                return `<div class="info-box info-box--attention" style="margin-bottom: 10px;">
                    <div style="font-weight: bold; color: var(--alerte-texte-attention);">Aucune grille de référence configurée</div>
                </div>`;
            }

            const criteresDynamiques = grille.criteres.map(c => {
                const cleNormalisee = c.nom.toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '');
                return {
                    nom: c.nom,
                    score: diagnostic.moyennesCriteres?.[cleNormalisee] ?? 0
                };
            }).filter(c => c.score > 0); // Exclure les critères sans données

            // Grouper par niveau IDME
            const parNiveau = {
                'E': [],
                'M': [],
                'D': [],
                'I': []
            };

            criteresDynamiques.forEach(critere => {
                const pourcentage = critere.score * 100;
                const niveau = obtenirNiveauIDMEDepuisPourcentage(pourcentage);
                parNiveau[niveau].push({ ...critere, pourcentage });
            });

            let html = '';

            // Afficher Forces E (Étendu) - Bleu
            if (parNiveau['E'].length > 0) {
                const couleur = obtenirCouleurNiveauIDME('E');
                html += `
                    <div style="background: ${couleur}22; border-left: 4px solid ${couleur}; padding: 12px; margin-bottom: 10px;">
                        <div style="font-weight: bold; color: ${couleur}; margin-bottom: 6px;">
                            ${parNiveau['E'].length > 1 ? 'Forces exceptionnelles (E)' : 'Force exceptionnelle (E)'}
                            ${parNiveau['E'].length > 1 ? ` (${parNiveau['E'].length})` : ''}
                        </div>
                        <div style="color: ${couleur}; font-size: 0.9rem;">
                            ${parNiveau['E'].map(c => `<strong>${echapperHtml(c.nom)}</strong> (${Math.round(c.pourcentage)}%)`).join(', ')}
                        </div>
                    </div>
                `;
            }

            // Afficher Forces M (Maîtrisé) - Vert
            if (parNiveau['M'].length > 0) {
                const couleur = obtenirCouleurNiveauIDME('M');
                html += `
                    <div style="background: ${couleur}22; border-left: 4px solid ${couleur}; padding: 12px; margin-bottom: 10px;">
                        <div style="font-weight: bold; color: ${couleur}; margin-bottom: 6px;">
                            ${parNiveau['M'].length > 1 ? 'Forces identifiées (M)' : 'Force identifiée (M)'}
                            ${parNiveau['M'].length > 1 ? ` (${parNiveau['M'].length})` : ''}
                        </div>
                        <div style="color: ${couleur}; font-size: 0.9rem;">
                            ${parNiveau['M'].map(c => `<strong>${echapperHtml(c.nom)}</strong> (${Math.round(c.pourcentage)}%)`).join(', ')}
                        </div>
                    </div>
                `;
            }

            // Afficher Défis D (Développement) - Orange
            if (parNiveau['D'].length > 0) {
                const couleur = obtenirCouleurNiveauIDME('D');
                html += `
                    <div style="background: ${couleur}22; border-left: 4px solid ${couleur}; padding: 12px; margin-bottom: 10px;">
                        <div style="font-weight: bold; color: ${couleur}; margin-bottom: 6px;">
                            ${parNiveau['D'].length > 1 ? 'Défis en développement (D)' : 'Défi en développement (D)'}
                            ${parNiveau['D'].length > 1 ? ` (${parNiveau['D'].length})` : ''}
                        </div>
                        <div style="color: ${couleur}; font-size: 0.9rem;">
                            ${parNiveau['D'].map(c => `<strong>${echapperHtml(c.nom)}</strong> (${Math.round(c.pourcentage)}%)`).join(', ')}
                        </div>
                    </div>
                `;
            }

            // Afficher Défis I (Incomplet) - Rouge
            if (parNiveau['I'].length > 0) {
                const couleur = obtenirCouleurNiveauIDME('I');
                html += `
                    <div style="background: ${couleur}22; border-left: 4px solid ${couleur}; padding: 12px; margin-bottom: 15px;">
                        <div style="font-weight: bold; color: ${couleur}; margin-bottom: 6px;">
                            ${parNiveau['I'].length > 1 ? 'Défis critiques (I)' : 'Défi critique (I)'}
                            ${parNiveau['I'].length > 1 ? ` (${parNiveau['I'].length})` : ''}
                        </div>
                        <div style="color: ${couleur}; font-size: 0.9rem;">
                            ${parNiveau['I'].map(c => `<strong>${echapperHtml(c.nom)}</strong> (${Math.round(c.pourcentage)}%)`).join(', ')}
                        </div>
                        <div style="margin-top: 8px; font-size: 0.85rem; color: ${couleur};">
                            Cibler les efforts sur ${parNiveau['I'].length > 1 ? 'ces critères' : 'ce critère'}
                            pour maximiser l'impact des interventions.
                        </div>
                    </div>
                `;
            }

            // Message si aucun critère avec données
            if (criteresDynamiques.length === 0) {
                html = `
                    <div class="info-box info-box--attention" style="margin-bottom: 10px;">
                        <div style="font-weight: bold; color: var(--alerte-texte-attention);">
                            Aucune donnée disponible pour l'analyse des critères
                        </div>
                    </div>
                `;
            }

            return html;
        })()}
    `;
}

/**
 * Génère le diagnostic génériques (Sommative)
 */
function genererDiagnosticGenerique(da, defisInfo) {

    if (defisInfo.defis.length === 0 && !defisInfo.tendance) {
        return `
            <div class="info-box info-box--succes" style="margin-bottom: 10px;">
                <div style="font-weight: bold; color: var(--vert-succes);">
                    Aucun défi majeur identifié
                </div>
                <div style="color: var(--vert-succes); font-size: 0.9rem; margin-top: 6px;">
                    Performance satisfaisante. Continuer le suivi régulier et encourager la constance.
                </div>
            </div>
        `;
    }

    let html = `
        <!-- DIAGNOSTIC DÉFIS GÉNÉRIQUES -->
        <h4 class="profil-titre-bleu-mt20">
            Défis identifiés
        </h4>
    `;

    // Afficher les défis
    defisInfo.defis.forEach(defi => {
        let couleur, titre, contenu;

        if (defi.type === 'note-faible') {
            couleur = defi.priorite === 'haute' ? '#dc3545' : '#ff9800';
            titre = `Note faible : ${defi.production}`;
            contenu = `
                <div class="profil-texte-detail-gris">
                    Note obtenue : <strong style="color: ${couleur};">${defi.note}%</strong> (seuil : ${defi.seuil}%)
                </div>
                <div class="profil-texte-detail-compact">
                    Recommandation : Envisager une reprise avec jeton ou un rattrapage ciblé.
                </div>
            `;
        } else if (defi.type === 'tendance-baisse') {
            couleur = '#ff9800';
            titre = 'Tendance à la baisse détectée';
            contenu = `
                <div class="profil-texte-detail-gris">
                    Variation : <strong style="color: ${couleur};">${defi.variation.toFixed(1)}%</strong>
                    <br>
                    Moyenne récente : ${defi.moyenneRecente.toFixed(1)}%
                    <br>
                    Moyenne ancienne : ${defi.moyenneAncienne.toFixed(1)}%
                </div>
                <div class="profil-texte-detail-compact">
                    Recommandation : Identifier les causes de la baisse et ajuster les stratégies d'apprentissage.
                </div>
            `;
        } else if (defi.type === 'irregularite') {
            couleur = '#ffc107';
            titre = 'Irrégularité des résultats';
            contenu = `
                <div class="profil-texte-detail-gris">
                    Écart-type : <strong style="color: ${couleur};">${defi.ecartType.toFixed(1)}</strong>
                    <br>
                    Moyenne : ${defi.moyenne.toFixed(1)}%
                </div>
                <div class="profil-texte-detail-compact">
                    Recommandation : Travailler la régularité et la constance dans les efforts.
                </div>
            `;
        }

        html += `
            <div style="background: linear-gradient(to right, ${couleur}22, ${couleur}11);
                        border-left: 4px solid ${couleur}; padding: 12px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: ${couleur}; margin-bottom: 6px;">
                    ${titre}
                </div>
                ${contenu}
            </div>
        `;
    });

    // Afficher tendance si disponible et pas déjà affichée
    if (defisInfo.tendance && !defisInfo.defis.find(d => d.type === 'tendance-baisse')) {
        const tendance = defisInfo.tendance;
        let couleurTendance, texteTendance;

        if (tendance.direction === 'hausse') {
            couleurTendance = '#28a745';
            texteTendance = 'Tendance à la hausse';
        } else if (tendance.direction === 'baisse') {
            couleurTendance = '#ff9800';
            texteTendance = 'Tendance légère à la baisse';
        } else {
            couleurTendance = '#2196f3';
            texteTendance = 'Tendance stable';
        }

        html += `
            <div style="background: linear-gradient(to right, ${couleurTendance}22, ${couleurTendance}11);
                        border-left: 4px solid ${couleurTendance}; padding: 12px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: ${couleurTendance}; margin-bottom: 6px;">
                    ${texteTendance}
                </div>
                <div style="font-size: 0.9rem; color: var(--gris-fonce);">
                    Variation : ${tendance.variation > 0 ? '+' : ''}${tendance.variation.toFixed(1)}%
                    (${tendance.moyenneAncienne.toFixed(1)}% → ${tendance.moyenneRecente.toFixed(1)}%)
                </div>
            </div>
        `;
    }

    // Afficher statistiques si disponibles
    if (defisInfo.statistiques) {
        const stats = defisInfo.statistiques;
        html += `
            <div style="background: var(--surface-conteneur, #142428); padding: 12px; border-radius: 6px; border: 1px solid var(--bordure-claire); margin-bottom: 10px;">
                <div style="font-weight: bold; color: var(--accent-primaire); margin-bottom: 8px;">
                    Statistiques descriptives
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9rem;">
                    <div>Moyenne : <strong>${stats.moyenne.toFixed(1)}%</strong></div>
                    <div>Écart-type : <strong>${stats.ecartType.toFixed(1)}</strong></div>
                    <div>Minimum : <strong>${stats.min}%</strong></div>
                    <div>Maximum : <strong>${stats.max}%</strong></div>
                </div>
            </div>
        `;
    }

    return html;
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

/**
 * Génère les barres de progression SRPNF (Forces et défis parmi les critères).
 * Indépendant du portfolio — utilise les moyennes SRPNF de l'étudiant.
 * Depuis la refonte onglets (avril 2026), le graphique critères est rendu
 * séparément dans l'onglet « Critères » ; cette fonction ne l'inclut plus.
 * @param {string} da - Numéro DA
 * @returns {string} - HTML des barres + encadré suivi des fondamentaux
 */
function _genererBarresSRPNF(da) {

    // ⮕ #575 (lot 4 du plan SOLO, rapport §3 n° 5) — LA CINQUIÈME TABLE IDME A
    // ÉTÉ RETIRÉE D'ICI, ET L'ÉCHELLE N'EST PLUS DEVINÉE.
    //
    // Ce qui vivait là : `echelles.find(e => e.active) || echelles[0]` — « l'échelle
    // active, sinon la première » — et, si elle manquait, un repli
    // `I 0-64 / D 65-74 / M 75-84 / E 85-100` avec ses quatre couleurs, plus le
    // calcul du dégradé. Le tout en DOUBLE avec `_obtenirNiveauxEtGradientSRPNF`
    // (`profil-etudiant-sections-affichage.js`), à deux lignes près. L'audit du
    // 27 août donnait cette fonction pour « probablement morte » : elle est
    // vivante (`genererSectionPerformance` l'appelle).
    //
    // ⮕ Le calcul vit maintenant une seule fois, dans
    // `niveauxEtGradientDesEvaluations` : l'échelle COMMUNE des évaluations de
    // l'élève (pas 3b de #542), qui refuse de choisir quand elles divergent et
    // dit pourquoi. Sans elle : fond neutre, pas de légende, cause au survol.
    const { niveaux, gradientCSS, message: messageEchelle } = (typeof niveauxEtGradientDesEvaluations === 'function')
        ? niveauxEtGradientDesEvaluations(da)
        : { niveaux: [], gradientCSS: 'var(--gris-pale, #e9e9e9)', message: '' };
    const survolBarre = messageEchelle ? ` title="${echapperHtml(messageEchelle)}"` : '';

    // Calculer moyennes SRPNF
    const moyennes = calculerMoyennesCriteres(da);
    const directions = calculerDirectionsCriteres(da);

    // Générer les barres
    const barresHTML = criteresDeLaGrillePourAffichage().map(critere => {
        // #529 — voir le bloc jumeau plus haut : mêmes cinq clés littérales,
        // même cascade de ternaires, même angle mort.
        const nomCritere = echapperHtml(critere.nom);

        const score = moyennes?.[critere.cle];
        // Pas de donnée => pas de barre. Jamais une barre à 0 % : « aucune
        // évaluation » et « zéro » se liraient pareil.
        if (typeof score !== 'number' || isNaN(score)) return '';

        const pourcentage = Math.round(score * 100);
        const direction = directions ? directions[critere.cle] : null;
        const symboleDirection = direction && direction.symbole ? direction.symbole : '';

        const pointsHTML = `<div class="critere-point" style="left: ${Math.min(pourcentage, 100)}%;"></div>`;
        const symbolesHTML = symboleDirection ? `<div style="position: absolute; left: ${Math.min(pourcentage, 100)}%; transform: translateX(-50%); top: -32px; font-size: 1.2rem; font-weight: bold; color: var(--gris-fonce);" title="${direction.interpretation}">${symboleDirection}</div>` : '';

        return `
            <div class="critere-container">
                <div class="critere-header">
                    <span class="critere-nom" style="min-width: 120px;">${nomCritere}</span>
                    <span class="critere-valeur" style="margin-left: auto; font-weight: 600;">${pourcentage}%</span>
                </div>
                <div class="critere-barre-gradient" style="background: ${gradientCSS};"${survolBarre}>
                    ${symbolesHTML}
                    ${pointsHTML}
                </div>
            </div>
        `;
    }).join('');

    // Légende
    const legendeHTML = `
        <div class="legende-idme-container">
            ${niveaux.map(n => {
                const pos = (n.min + n.max) / 2;
                // #575 — code et nom viennent de l'échelle de l'utilisateur : ils
                // sont échappés, comme partout ailleurs. La couleur, elle, est
                // filtrée à la construction de `niveaux` (un `echapperHtml` ne
                // neutraliserait pas une injection CSS).
                return `<div class="legende-idme-item" style="left: ${pos}%; color: ${n.couleur};">
                    <span class="legende-idme-code">${echapperHtml(n.code)}</span>
                    <span class="legende-idme-nom">${echapperHtml(n.nom)}</span>
                </div>`;
            }).join('')}
        </div>
    `;

    // Contenu des barres ou message
    let contenuBarres = '';
    if (!barresHTML || barresHTML.trim() === '') {
        // ⚠ #806 — deuxième exemplaire du même chemin faux (l'autre était dans
        // `profil-etudiant-sections-affichage.js`). Les deux citaient « Conception
        // → Pratiques de notation » ; le réglage est dans « Labo → Outils
        // d'observation ». Deux copies d'une phrase, deux occasions de se tromper :
        // la phrase vient maintenant du diagnostic #550, qui en est la seule source.
        const lectureGrille = (typeof diagnostiquerGrilleReferenceDepistage === 'function')
            ? diagnostiquerGrilleReferenceDepistage()
            : { grille: null, raison: null, message: '' };
        if (!lectureGrille.grille || lectureGrille.raison) {
            contenuBarres = `<div class="info-box info-box--attention" style="margin: 15px 0;">
                <strong style="color: var(--alerte-texte-attention);">Configuration requise</strong>
                <p style="margin: 5px 0 0; color: var(--alerte-texte-attention); font-size: 0.9rem;">
                    ${echapperHtml(lectureGrille.message || '')}
                </p>
            </div>`;
        } else {
            contenuBarres = `<div class="info-box info-box--info" style="margin: 15px 0;">
                <strong style="color: var(--alerte-texte-information);">Aucune donnée disponible</strong>
                <p style="margin: 5px 0 0; color: var(--alerte-texte-information); font-size: 0.9rem;">
                    Aucune évaluation complétée avec des critères correspondant à la grille de référence.
                </p>
            </div>`;
        }
    } else {
        contenuBarres = barresHTML + legendeHTML;
    }

    // Encadré « Suivi de l'apprentissage des fondamentaux » retiré (17 avril 2026)
    // Raison : recoupement partiel avec le bloc « Consolidation », lui-même
    // retiré le 10 septembre 2026 avec tout le module (jamais concluant).
    // Le diagnostic IPB × direction peut être réinjecté dans l'onglet
    // Accompagnement plus tard au besoin.

    return `
        <div class="section-titre">Forces et défis parmi les critères</div>
        <div style="margin: 20px 0;">${contenuBarres}</div>
    `;
}

/**
 * Bloc « Profil ACO (actions cognitives observées) » — étape 8.
 * Affiché dans « Développement des habiletés », conditionné au toggle
 * `activerActionsRLO` et à la présence d'au moins une évaluation avec
 * annotations d'actions RLO pour cet étudiant.
 */
function genererBlocProfilRLO(da) {
    if (typeof actionsRLO === 'undefined' || !actionsRLO.agregerProfilRLOEtudiant) return '';
    const profil = actionsRLO.agregerProfilRLOEtudiant(da);
    if (!profil) return '';

    const entete = `
        <div class="u-flex-between-mb15">
            <div>
                <strong style="font-size:1.05rem;">Profil ACO (actions cognitives observées)</strong>
                <div class="texte-muted" style="font-size:0.8rem; margin-top:2px;">
                    ${profil.nbEvaluationsObservees} évaluation${profil.nbEvaluationsObservees > 1 ? 's' : ''} annotée${profil.nbEvaluationsObservees > 1 ? 's' : ''} sur ${profil.nbEvaluations}
                </div>
            </div>
            ${profil.total > 0 ? `
                <div style="text-align:right; font-size:0.85rem; color:var(--texte-secondaire);">
                    <span>${profil.total} tampon${profil.total > 1 ? 's' : ''} observé${profil.total > 1 ? 's' : ''}</span>
                </div>
            ` : ''}
        </div>`;

    // État vide : aucune annotation `action-*` observée sur les évaluations du DA.
    if (profil.total === 0) {
        return `
            <section class="bloc-rlo-cumulatif">
                ${entete}
                <div class="info-box info-box--info" style="margin: 0;">
                    <div style="display: flex; gap: 10px; align-items: start;">
                        <div style="flex: 1;">
                            <strong style="color: var(--alerte-texte-information); display: block; margin-bottom: 5px;">Aucune action cognitive observée</strong>
                            <p style="margin: 0; color: var(--alerte-texte-information); font-size: 0.9rem; line-height: 1.5;">
                                Pose des tampons <strong>Repérage</strong>, <strong>Liaison</strong> ou <strong>Ouverture</strong>
                                (ou les tampons en difficulté) sur les travaux annotés pour alimenter ce profil.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    const ligneCognitive = [
        { nom: 'Repérage',  n: profil.reperage },
        { nom: 'Liaison',   n: profil.liaison },
        { nom: 'Ouverture', n: profil.ouverture }
    ];
    const ligneDifficulte = [
        { nom: 'Incertain', n: profil.incertain },
        { nom: 'Incomplet', n: profil.incomplet },
        { nom: 'Inexact',   n: profil.inexact }
    ];

    const maxCog = Math.max(profil.reperage, profil.liaison, profil.ouverture, 1);
    const maxDif = Math.max(profil.incertain, profil.incomplet, profil.inexact, 1);

    const rendreBarre = (items, maxVal, couleur) => items.map(i => {
        const pct = Math.round((i.n / maxVal) * 100);
        return `
            <div style="display:grid; grid-template-columns: 100px 1fr 40px; gap:8px; align-items:center; margin-bottom:4px;">
                <span style="font-size:0.8rem; color:var(--texte-secondaire);">${i.nom}</span>
                <div style="background:var(--surface-conteneur); border-radius:3px; height:10px; position:relative; overflow:hidden;">
                    <div style="background:${couleur}; height:100%; width:${pct}%; transition:width 300ms ease;"></div>
                </div>
                <span style="font-size:0.9rem; font-weight:600; text-align:right;">${i.n}</span>
            </div>`;
    }).join('');

    const pctCog = Math.round((profil.totalCognitifs / profil.total) * 100);
    const pctDif = 100 - pctCog;

    return `
        <section class="bloc-rlo-cumulatif">
            ${entete}
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
                        <span style="font-size:0.8rem; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:var(--texte-secondaire);">Gestes cognitifs</span>
                        <span style="font-size:0.8rem; color:var(--texte-secondaire);">${profil.totalCognitifs} · ${pctCog}%</span>
                    </div>
                    ${rendreBarre(ligneCognitive, maxCog, 'var(--bleu-principal, #3b82f6)')}
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
                        <span style="font-size:0.8rem; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:var(--texte-secondaire);">Gestes en difficulté</span>
                        <span style="font-size:0.8rem; color:var(--texte-secondaire);">${profil.totalDifficultes} · ${pctDif}%</span>
                    </div>
                    ${rendreBarre(ligneDifficulte, maxDif, 'var(--orange-accent, #f59e0b)')}
                </div>
            </div>
        </section>
    `;
}

/**
 * Conteneur unique des blocs RLO pour l'onglet « Gestes cognitifs ».
 * Fusionne le cumulatif et le graphique d'évolution dans une seule carte
 * (au lieu de deux cartes empilées), avec un séparateur visuel entre les deux
 * blocs et la note discrète d'interprétation placée à la fin.
 */
function genererConteneurGestesCognitifs(da) {
    const cumulatif = genererBlocProfilRLO(da);
    const evolution = genererBlocEvolutionRLO(da);
    const note      = genererNoteRLO(da);
    if (!cumulatif && !evolution && !note) return '';

    const separateur = (cumulatif && evolution)
        ? '<hr class="bloc-rlo-separateur">'
        : '';

    return `
        <div class="bloc-rlo-conteneur">
            ${cumulatif}
            ${separateur}
            ${evolution}
            ${note}
        </div>
    `;
}

/**
 * Note discrète d'interprétation des données RLO — spécification 17 avril 2026.
 * Affichée après le dernier élément RLO visible (bloc cumulatif ou graphique).
 * Condition : toggle actif ET ≥ 1 évaluation avec des tampons `action-*` observés.
 */
function genererNoteRLO(da) {
    if (typeof actionsRLO === 'undefined' || !actionsRLO.agregerProfilRLOEtudiant) return '';
    const profil = actionsRLO.agregerProfilRLOEtudiant(da);
    if (!profil || profil.total === 0) return '';
    return `
        <p class="profil-note-rlo">
            Ces données reflètent les observations posées lors de l'annotation. Elles ne constituent pas un relevé exhaustif des gestes cognitifs présents dans la production.
        </p>
    `;
}

/**
 * Onglets « Développement des habiletés » — trois vues : Critères, Forces et défis,
 * Gestes cognitifs. Réduit le scroll vertical en scindant les trois pavés.
 * Persistance de l'onglet actif via localStorage (`profilOngletDeveloppementActif`).
 * L'onglet Gestes cognitifs est omis si le toggle `activerActionsRLO` est désactivé.
 */
function genererOngletsDeveloppement(da, contenus) {
    const ongletRLOActif = typeof obtenirPreference === 'function' &&
        obtenirPreference('activerActionsRLO') === true;
    const CLE_PERSISTANCE = 'profilOngletDeveloppementActif';
    const onglets = [
        { id: 'criteres',         libelle: 'Critères',          contenu: contenus.criteres || '' },
        { id: 'forces-defis',     libelle: 'Forces et défis',   contenu: contenus.forcesDefis || '' }
    ];
    if (ongletRLOActif) {
        onglets.push({ id: 'gestes-cognitifs', libelle: 'Gestes cognitifs',
            contenu: contenus.gestesCognitifs || '' });
    }

    const actifPersiste = db.getSync(CLE_PERSISTANCE, null);
    let idActif = onglets.find(o => o.id === actifPersiste) ? actifPersiste : 'criteres';
    if (!onglets.find(o => o.id === idActif)) idActif = 'criteres';

    const boutons = onglets.map(o => {
        const actif = o.id === idActif;
        return `<button type="button" role="tab" class="onglet-developpement-tab${actif ? ' actif' : ''}"
            data-action="changerOngletDeveloppement"
            data-param="${o.id}" data-param2="${da}"
            aria-selected="${actif}" aria-controls="panel-dev-${o.id}-${da}"
            id="tab-dev-${o.id}-${da}">${o.libelle}</button>`;
    }).join('');

    const panels = onglets.map(o => {
        const actif = o.id === idActif;
        return `<div class="onglet-developpement-panel" role="tabpanel"
            id="panel-dev-${o.id}-${da}" aria-labelledby="tab-dev-${o.id}-${da}"
            data-panel="${o.id}"${actif ? '' : ' hidden'}>${o.contenu}</div>`;
    }).join('');

    return `
        <div class="onglets-developpement" data-da="${da}">
            <div class="onglets-developpement-tabs" role="tablist">${boutons}</div>
            ${panels}
        </div>
    `;
}

/**
 * Bascule l'onglet actif de « Développement des habiletés ».
 * Persisté dans localStorage. Si le panel devenu visible contient un canvas
 * Chart.js non encore rendu (création différée parent display:none), relance
 * la création du graphique approprié.
 * @param {string} idOnglet - 'criteres' | 'forces-defis' | 'gestes-cognitifs'
 * @param {string} da
 */
function changerOngletDeveloppement(idOnglet, da) {
    if (!idOnglet || !da) return;
    const conteneur = document.querySelector('.onglets-developpement[data-da="' + da + '"]');
    if (!conteneur) return;

    conteneur.querySelectorAll('.onglet-developpement-tab').forEach(btn => {
        const actif = btn.dataset.param === idOnglet;
        btn.classList.toggle('actif', actif);
        btn.setAttribute('aria-selected', actif ? 'true' : 'false');
    });
    conteneur.querySelectorAll('.onglet-developpement-panel').forEach(panel => {
        const actif = panel.dataset.panel === idOnglet;
        if (actif) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
    });

    db.setSync('profilOngletDeveloppementActif', idOnglet);

    // Chart.js ne rend pas dans un parent caché : relancer au besoin
    setTimeout(function() {
        if (idOnglet === 'criteres') {
            const canvas = document.getElementById('graphique-criteres-' + da);
            if (canvas && typeof creerGraphiqueCriteres === 'function') {
                creerGraphiqueCriteres(canvas.id, da);
            }
        } else if (idOnglet === 'gestes-cognitifs') {
            const canvas = document.getElementById('graphique-evolution-rlo-' + da);
            if (canvas && typeof creerGraphiqueEvolutionRLO === 'function') {
                creerGraphiqueEvolutionRLO(canvas.id, da);
            }
        }
    }, 50);
}

/**
 * Graphique d'évolution des gestes cognitifs (Repérage / Liaison / Ouverture)
 * — spec SPEC-EXPORT-GRAPHIQUE-RLO.md, étape 9.
 *
 * Affiché sous le bloc cumulatif « Profil ACO » quand :
 *   - toggle `activerActionsRLO` actif ;
 *   - préférence `afficherGraphiques` non désactivée ;
 *   - au moins 2 évaluations avec tampons `action-*` (ratios calculables).
 */
function genererBlocEvolutionRLO(da) {
    if (typeof actionsRLO === 'undefined' || !actionsRLO.obtenirEvolutionRLOEtudiant) return '';
    if (typeof obtenirPreference === 'function' && obtenirPreference('afficherGraphiques') === false) return '';

    const donnees = actionsRLO.obtenirEvolutionRLOEtudiant(da);
    if (!donnees || donnees.nbObserves < 2) return '';

    const canvasId = 'graphique-evolution-rlo-' + da;
    setTimeout(function() {
        if (typeof creerGraphiqueEvolutionRLO === 'function') {
            creerGraphiqueEvolutionRLO(canvasId, da);
        }
    }, 120);

    // Terme dépendant des réglages de l'utilisateur (artefact / production / ...)
    const termeSingulierMaj = typeof obtenirTermeProduction === 'function'
        ? obtenirTermeProduction('singulier', true) : 'Artefact';
    const termeSing = typeof obtenirTermeProduction === 'function'
        ? obtenirTermeProduction('singulier') : 'artefact';
    const prefixeCourt = termeSing.charAt(0).toUpperCase()
        + termeSing.substring(1, 3).toLowerCase() + '.';

    // Équivalent textuel (accessible) : tableau des ratios par production
    const lignesAccessibles = donnees.artefacts.map(function(a) {
        const r = a.ratios;
        const niv = a.niveauFinal ? echapperHtml(a.niveauFinal) : '—';
        const cellTete = `<th scope="row">${prefixeCourt} ${a.numero}</th>`;
        if (!r) {
            return `<tr>${cellTete}<td>${niv}</td><td colspan="3">Non observé</td></tr>`;
        }
        return `<tr>${cellTete}<td>${niv}</td>`
            + `<td>${r.reperage.toFixed(1)} %</td>`
            + `<td>${r.liaison.toFixed(1)} %</td>`
            + `<td>${r.ouverture.toFixed(1)} %</td></tr>`;
    }).join('');

    return `
        <section class="bloc-rlo-evolution">
            <div class="u-flex-between-mb15">
                <div>
                    <strong style="font-size:1.05rem;">Évolution des gestes cognitifs</strong>
                    <div class="texte-muted" style="font-size:0.8rem; margin-top:2px;">
                        Ratios Repérage / Liaison / Ouverture par artefact
                    </div>
                </div>
            </div>
            <div style="background: var(--surface-conteneur, #142428); padding: 12px; border-radius: 6px; height: 260px;">
                <canvas id="${canvasId}" aria-label="Graphique d'évolution des gestes cognitifs"></canvas>
            </div>
            <details style="margin-top:8px;">
                <summary class="texte-muted" style="font-size:0.8rem; cursor:pointer;">Voir les données en tableau</summary>
                <table style="margin-top:8px; width:100%; font-size:0.85rem; border-collapse:collapse;">
                    <caption style="position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0);">Ratios cognitifs par artefact</caption>
                    <thead>
                        <tr>
                            <th scope="col">${termeSingulierMaj}</th>
                            <th scope="col">IDME</th>
                            <th scope="col">Repérage</th>
                            <th scope="col">Liaison</th>
                            <th scope="col">Ouverture</th>
                        </tr>
                    </thead>
                    <tbody>${lignesAccessibles}</tbody>
                </table>
            </details>
        </section>
    `;
}


    // === EXPORTS window.X (convention systématique session A décision b) ===
    window.genererDiagnosticCriteres        = genererDiagnosticCriteres;
    window.genererDiagnosticSRPNF           = genererDiagnosticSRPNF;
    window.genererDiagnosticGenerique       = genererDiagnosticGenerique;
    window._genererBarresSRPNF              = _genererBarresSRPNF;
    window.genererBlocProfilRLO             = genererBlocProfilRLO;
    window.genererConteneurGestesCognitifs  = genererConteneurGestesCognitifs;
    window.genererNoteRLO                   = genererNoteRLO;
    window.genererOngletsDeveloppement      = genererOngletsDeveloppement;
    window.changerOngletDeveloppement       = changerOngletDeveloppement;
    window.genererBlocEvolutionRLO          = genererBlocEvolutionRLO;
})();
