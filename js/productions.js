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
   - notifications.succes(message, details)
   - notifications.erreur(message, details)
   
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
 * LES TYPES DE PRODUCTION — table unique (25 août 2026).
 *
 * ⚠⚠ POURQUOI UNE CONSTANTE ET NON TROIS LISTES. Avant ce jour, la liste des
 * types vivait à trois endroits qui avaient DIVERGÉ, chacun en silence :
 *
 *   1. le `<select id="productionType">` d'`index.html` — 12 types, c'est ce
 *      que Grégoire voit en créant une production, donc la vérité de fait ;
 *   2. `getTypeLabel()` ci-dessous — 8 types. `laboratoire`, `entrevue`,
 *      `projet` et `stage` n'y étaient pas : ils s'affichaient en identifiant
 *      brut et minuscule (« laboratoire ») partout où le type est montré ;
 *   3. `typesOrdre` du sélecteur « Production » de la carte d'alignement
 *      (`planification-carte.js`) — 5 types. Conséquence mesurée le 25 août :
 *      AUCUN artefact, AUCUN portfolio, aucun laboratoire, aucune présentation,
 *      aucune entrevue, aucun stage, aucune évaluation terminale ne pouvait
 *      être rattaché à un bloc Évaluation de la carte. Les productions étaient
 *      chargées, regroupées, puis jamais rendues — sans un mot dans la console.
 *
 * ⮕ Le pont carte ↔ productions existait ; il ne pouvait tout simplement pas
 * porter le type de production sur lequel repose tout le portfolio.
 *
 * ▣ DEUX LIBELLÉS, ET C'EST VOULU — même patron que `VISEES_EVALUATION` dans
 * `planification-carte.js`. `libelle` est le libellé de CHOIX : celui du
 * formulaire, celui des sélecteurs, court parce qu'il vit dans un `<option>`
 * déjà classé sous son `<optgroup>`. `libelleLong` est le libellé de LECTURE,
 * rendu par `getTypeLabel()` là où le type est montré hors de tout groupe et
 * doit se suffire à lui-même. Absent = les deux sont identiques.
 *
 * ⚠ `prefixeAffichage` porte le 📁 historique du portfolio. Il est ici pour
 * être VU : la règle « zéro emoji » du projet le condamne, mais le retirer
 * change un libellé d'interface (et `productions.js:207` en pose un second,
 * séparément) — c'est un geste à trancher avec Grégoire, pas un effet de bord
 * de ce chantier-ci.
 *
 * ⚠ `ponderationPropre: false` n'invente aucune règle : il NOMME celle que
 * l'interface affiche déjà (« Les artefacts n'ont pas de pondération propre.
 * C'est le portfolio conteneur qui définit la pondération globale »), que
 * `validerChampsProduction` applique en n'exigeant pas la pondération d'un
 * artefact, et que `getAvertissementsStructure` redit à voix haute (« sa
 * pondération n'est pas utilisée par le calcul »).
 *
 * ⮕ L'ORDRE DES ENTRÉES EST SIGNIFIANT : c'est celui du formulaire, et la
 * sentinelle `types-production-source-unique` le vérifie option par option.
 * Ajouter un type au `<select>` sans l'ajouter ici fait ROUGIR le test — c'est
 * exactement la dérive silencieuse qu'on vient de payer.
 */
const TYPES_PRODUCTION = [
    { id: 'examen',             libelle: 'Examen',                groupe: 'Évaluations' },
    { id: 'travail',            libelle: 'Travail écrit',         groupe: 'Évaluations' },
    { id: 'quiz',               libelle: 'Quiz/Test',             groupe: 'Évaluations' },
    { id: 'laboratoire',        libelle: 'Laboratoire',           groupe: 'Évaluations' },
    { id: 'presentation',       libelle: 'Présentation',          groupe: 'Évaluations' },
    { id: 'entrevue',           libelle: 'Entrevue',              groupe: 'Évaluations' },
    { id: 'projet',             libelle: 'Projet',                groupe: 'Évaluations' },
    { id: 'stage',              libelle: 'Stage',                 groupe: 'Évaluations' },
    { id: 'autre',              libelle: 'Autre',                 groupe: 'Évaluations' },
    { id: 'portfolio',          libelle: 'Portfolio (conteneur)', groupe: 'Portfolio',
      prefixeAffichage: '📁 ' },
    { id: 'artefact-portfolio', libelle: 'Artefact',              groupe: 'Portfolio',
      libelleLong: 'Artefact d\'un portfolio', ponderationPropre: false },
    { id: 'terminale',          libelle: 'Évaluation terminale',  groupe: 'Évaluation terminale' }
];

/** L'entrée de table d'un type, ou null si le type est inconnu. */
function typeProduction(id) {
    return TYPES_PRODUCTION.find(t => t.id === id) || null;
}

/**
 * Vrai si ce type porte une pondération qui lui est propre. Défaut : oui —
 * seul l'artefact dit explicitement le contraire.
 */
function typePorteSaPonderation(id) {
    const t = typeProduction(id);
    return t ? t.ponderationPropre !== false : true;
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
 * #486 (24 août 2026) : une production SANS échéance assignée est un état
 * LÉGITIME, pas un formulaire à moitié rempli. Le gabarit est préparé, les
 * consignes ne sont pas encore transmises aux étudiant·es. C'est déjà la
 * sémantique affichée par le mode multi-groupe (« Décoché = les étudiant·es
 * n'ont pas encore reçu le travail »), déjà la lecture faite par TOUS les
 * consommateurs en aval (graphiques C/P, calendrier, jetons, synthèse,
 * export PDF) qui filtrent sur `assignee && !!date` avant de compter quoi que
 * ce soit, et déjà la position du format de partage, qui classe `dateEcheance`
 * parmi les champs LOCAUX interdits d'export (partage-schemas.js).
 *
 * Cette fonction est le pendant de `obtenirEcheanceEffective` : elle répond
 * « aucun groupe n'a d'échéance assignée », donc « rien n'est dû nulle part ».
 * Elle en reprend volontairement la lecture d'`assignee` (`!== false`, une
 * entrée muette vaut assignée) pour qu'un badge « à planifier » ne puisse
 * JAMAIS contredire ce que le calendrier affiche comme dû.
 *
 * @param {Object} production
 * @returns {boolean} true si aucune échéance n'est assignée
 */
function aucuneEcheanceAssignee(production) {
    if (!production) return false;
    if (production.echeancesParGroupe) {
        return !Object.values(production.echeancesParGroupe)
            .some(e => e && e.assignee !== false && e.date);
    }
    return !production.dateEcheance;
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
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const container = document.getElementById('tableauEvaluationsContainer');

    if (evaluations.length === 0) {
        container.innerHTML = '<p class="text-muted prod-italic">Aucune évaluation définie.</p>';
        document.getElementById('typesEvaluations').innerHTML =
            '<span class="prod-texte-bleu-leger">Aucune évaluation configurée</span>';
        document.getElementById('nombreEvaluations').textContent = '0';
        afficherAvertissementsProductions([]); // #394 : zone « À vérifier » muette
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
                    ${estPortfolio ? '📁 ' : ''}${echapperHtml(prod.titre)}${(prod.activiteApprentissage || prod.description) ? ' - ' + echapperHtml(prod.activiteApprentissage || prod.description) : ''}
                </strong>
                <div class="production-actions">
                    ${window.boutonsReordonnerBloc({
                        actionHaut: 'monterEvaluation', actionBas: 'descendreEvaluation',
                        param: prod.id, premier: index === 0,
                        dernier: index === evaluations.length - 1, quoi: 'cette production'
                    })}
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
                    <input type="text" value="${echapperHtml(nomGrille)}" class="controle-form ${!grilleAssociee ? 'production-champ-input-placeholder' : 'production-champ-input'}" readonly>
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
                    ${prod.objectif ? `<p><strong>Objectif:</strong> ${echapperHtml(prod.objectif)}</p>` : ''}
                    ${prod.tache ? `<p><strong>Tâche:</strong> ${echapperHtml(prod.tache)}</p>` : ''}
                </div>
            ` : ''}
        </div>
        `;
    }).join('');

    document.getElementById('nombreEvaluations').textContent = evaluations.length;
    mettreAJourResumeTypes(evaluations);

    // #394 : avertissements de cohérence STD (zone « À vérifier », patron #369)
    afficherAvertissementsProductions(evaluations);
}

/* ===============================
   #394 — AVERTISSEMENTS DE COHÉRENCE STD (patron #369, non bloquants)
   Décision D1 (Grégoire, 5 août 2026), règles 3 et 5 :
   - transparence : production pondérée non participante et pondération obtenue
     par complément → avertissement, jamais un silence ;
   - migration legacy : terminale restée en type 'travail'/'examen' → JAMAIS de
     conversion automatique ; cas non ambigu → bouton « Typer comme terminale »
     (geste explicite) ; cas ambigu → liste + renvoi au formulaire.
   =============================== */

/**
 * Valide la cohérence d'un corpus de productions pour le calcul STD.
 * Fonction PURE (testable sans DOM) : retourne une liste d'avertissements
 * { message, productionId? } — productionId présent UNIQUEMENT pour le cas
 * « candidate terminale non ambiguë » (alimente le bouton de conversion).
 *
 * @param {Array} productions - productions du trimestre (cours actif)
 * @returns {Array<{message: string, productionId?: string}>}
 */
function validerProductionsStd(productions) {
    const avertissements = [];
    if (!Array.isArray(productions) || productions.length === 0) return avertissements;

    const terminale = (typeof identifierProductionTerminale === 'function')
        ? identifierProductionTerminale(productions)
        : (window.identifierProductionTerminale ? window.identifierProductionTerminale(productions) : null);
    const conteneur = productions.find(p => p && p.type === 'portfolio');
    const nomDe = (p) => p.titre || p.activiteApprentissage || p.description || p.id;

    // Candidates au rôle de terminale : pondérées, hors conteneur/artefacts/terminale.
    const candidates = productions.filter(p =>
        p &&
        p.type !== 'terminale' &&
        p.type !== 'portfolio' &&
        p.type !== 'artefact-portfolio' &&
        typeof p.ponderation === 'number' && p.ponderation > 0
    );

    if (terminale) {
        // Règle 3a : les pondérées non participantes n'entrent pas dans le calcul.
        candidates.forEach(p => {
            avertissements.push({
                message: `« ${nomDe(p)} » porte une pondération (${p.ponderation} %) mais n'entre pas dans le calcul STD : seuls le pool d'artefacts et l'évaluation terminale comptent.`
            });
        });
        // Règle 3a bis : pondération posée sur un artefact du pool (ignorée aussi).
        productions
            .filter(p => p && p.type === 'artefact-portfolio' && typeof p.ponderation === 'number' && p.ponderation > 0)
            .forEach(p => {
                avertissements.push({
                    message: `« ${nomDe(p)} » est un artefact du pool : sa pondération (${p.ponderation} %) n'est pas utilisée par le calcul.`
                });
            });
        // Pondération de la terminale manquante → note non constructible.
        if (terminale.ponderation == null) {
            avertissements.push({
                message: `L'évaluation terminale « ${nomDe(terminale)} » n'a pas de pondération : la note finale n'est pas constructible tant qu'elle n'est pas saisie.`
            });
        } else if (!conteneur) {
            // Règle 3b : pondération du pool obtenue par complément.
            avertissements.push({
                message: `Aucune production « Portfolio (conteneur) » : le pool d'artefacts vaut le complément de la terminale, soit ${Math.max(0, 100 - terminale.ponderation)} % (100 − ${terminale.ponderation}). C'est permis — vérifie que c'est voulu.`
            });
        }
    } else if (candidates.length === 1) {
        // Règle 5 : cas NON ambigu → geste explicite offert, jamais de conversion auto.
        avertissements.push({
            message: `« ${nomDe(candidates[0])} » est pondérée (${candidates[0].ponderation} %) mais son type est « ${getTypeLabel(candidates[0].type)} » : sans le type « Évaluation terminale », elle n'entre pas dans le calcul STD.`,
            productionId: candidates[0].id
        });
    } else if (candidates.length > 1) {
        // Règle 5 : cas ambigu → nommer, renvoyer au formulaire, ne pas choisir.
        const noms = candidates.map(p => `« ${nomDe(p)} »`).join(', ');
        avertissements.push({
            message: `${candidates.length} productions pondérées sans évaluation terminale typée : ${noms}. Choisis laquelle est l'évaluation terminale dans son formulaire (type « Évaluation terminale ») — l'outil ne choisit pas à ta place.`
        });
    }

    return avertissements;
}

/** La pratique active du groupe-cours est-elle de famille STD ? */
function _pratiqueActiveEstStd() {
    // Lot N1b (21 sept. 2026) : l'instance que rend LA résolution ; sans pratique, pas de zone « À vérifier ».
    const inst = (typeof resoudrePratiqueActive === 'function') ? resoudrePratiqueActive().pratique : null;
    return !!(inst && typeof inst.obtenirCode === 'function' && inst.obtenirCode() === 'STD');
}

/**
 * Rend la zone « À vérifier » de la section Productions (patron #369) :
 * silencieuse quand la saisie est cohérente ou que la pratique active
 * n'est pas STD (les rôles pool/terminale ne s'appliquent qu'à elle).
 */
function afficherAvertissementsProductions(productions) {
    const zone = document.getElementById('zone-avertissements-productions');
    if (!zone) return;
    const avertissements = _pratiqueActiveEstStd() ? validerProductionsStd(productions || []) : [];
    if (avertissements.length === 0) {
        zone.classList.add('u-hide');
        zone.innerHTML = '';
        return;
    }
    zone.innerHTML = '<strong>À vérifier</strong> (rien n\'est bloqué) :<ul class="u-mt-8" style="margin-bottom: 0; padding-left: 20px;">'
        + avertissements.map(a => '<li>' + echapperHtml(a.message)
            + (a.productionId
                ? ' <button class="btn btn-secondaire btn-tres-compact" data-action="typerProductionCommeTerminale" data-param="' + echapperHtml(a.productionId) + '" data-confirm="Typer cette production comme évaluation terminale ? Elle entrera dans le calcul STD avec sa pondération.">Typer comme terminale</button>'
                : '')
            + '</li>').join('')
        + '</ul>';
    zone.classList.remove('u-hide');
}

/**
 * #394 (règle 5) : conversion PAR GESTE EXPLICITE d'une production legacy en
 * évaluation terminale. Offerte seulement dans le cas non ambigu (une seule
 * candidate, aucune terminale typée) ; regarde l'état au moment du clic.
 */
async function typerProductionCommeTerminale(productionId) {
    const productionsListe = await db.get(getCleProductions()) || [];
    const prod = productionsListe.find(p => p && p.id === productionId);
    if (!prod) {
        alert('Production introuvable — recharge la section Productions.');
        return;
    }
    const dejaTypee = productionsListe.find(p => p && p.type === 'terminale');
    if (dejaTypee) {
        alert('Une évaluation terminale est déjà typée (« ' + (dejaTypee.titre || dejaTypee.id) + ' ») : une seule par trimestre. Rien n\'a été modifié.');
        return;
    }
    // ⚠ Le test « une seule terminale par trimestre » est REJOUÉ dans la file :
    // vérifié hors file, deux clics concurrents en typeraient deux.
    // security-ok: réécriture de la liste déjà en stockage, seul le champ type
    // (valeur fixe locale) change.
    const ecritLotF = await db.modifier(getCleProductions(), (lues) => {
        const liste = lues || [];
        const cible = liste.find(p => p && p.id === productionId);
        if (!cible) return undefined;
        if (liste.find(p => p && p.type === 'terminale')) return undefined;
        cible.type = 'terminale';
        return liste;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(getCleProductions());   // lot F : geste hors témoin (typerProductionCommeTerminale)

    // Recalculer les indices avec le nouveau rôle, puis rafraîchir la vue.
    if (typeof calculerEtStockerIndicesCP === 'function') calculerEtStockerIndicesCP();
    if (typeof afficherListeProductions === 'function') afficherListeProductions();
    await afficherTableauProductions();
}

/* ===============================
   FONCTION: AFFICHER FORMULAIRE PRODUCTION
   Affiche le formulaire d'ajout ou de modification
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/* ===============================
   CHAMPS SUPPLÉMENTAIRES DU GABARIT (#499, 25 août 2026)
   =============================== */

/**
 * ⚠⚠ ACCÈS DÉFENSIF AUX TROIS CHAMPS ANCRÉS (#500, 25 août 2026).
 *
 * `productionObjectif`, `productionTache` et `productionDetailTache` étaient
 * écrits en dur dans `index.html` : `getElementById(...).value` ne pouvait pas
 * rendre null, et onze sites le faisaient sans garde.
 *
 * ⮕ Depuis que ces champs sont RENDUS par `rendreBlocsConsignes`, ils
 * n'existent qu'après le rendu. Un accès direct qui arrive avant devient une
 * exception qui casse l'OUVERTURE de la fiche — pas un simple champ vide.
 * Ces deux helpers font qu'un champ absent donne '' à la lecture et ne fait
 * rien à l'écriture : la fiche s'ouvre, même incomplète, et le défaut se voit
 * au lieu de tout arrêter.
 */
function valeurChampGabarit(id) {
    const el = document.getElementById(id);
    return el && typeof el.value === 'string' ? el.value : '';
}

function poserValeurChampGabarit(id, valeur) {
    const el = document.getElementById(id);
    if (el) el.value = valeur == null ? '' : valeur;
}

/**
 * ⚠⚠ POURQUOI CES CHAMPS EXISTENT. Le gabarit offrait quatre blocs figés —
 * objectif, tâche, détail, échéance. Le document de consignes de Grégoire en
 * demande d'autres, propres à sa matière : « Format et mise en page », « Remise
 * du travail », « À vérifier ». Les ajouter en dur au formulaire aurait résolu
 * SON cas et laissé le suivant sans réponse ; ce sont donc des blocs qu'il
 * NOMME lui-même.
 *
 * ⚠ PORTÉE : par production, jamais partagés (décision de Grégoire, 25 août).
 * Une définition unique au niveau du cours aurait évité la retape, mais
 * corriger un champ aurait alors changé TOUTES les productions — y compris
 * celles dont les consignes sont déjà entre les mains des étudiant·es. L'étape D
 * offrira une reprise par COPIE : la commodité sans l'effet à distance.
 *
 * ▣ LE DOM EST LA SOURCE PENDANT L'ÉDITION. `_blocsConsignes` ne sert qu'à
 * ajouter, retirer et déplacer ; avant chaque re-rendu on RELIT les champs de
 * l'écran. Sans cette relecture, taper un titre puis cliquer « + Nouveau champ »
 * effacerait ce qu'on vient d'écrire — la saisie vit dans le DOM, pas dans
 * l'état.
 */
let _blocsConsignes = [];

/**
 * LES TROIS BLOCS ANCRÉS (#500, 25 août 2026).
 *
 * ⚠⚠ POURQUOI ILS NE SONT PAS DEVENUS DES CHAMPS LIBRES. `objectif`, `tache` et
 * `detailTache` sont lus à 53 endroits, dans cinq modules — dont la rétroaction
 * et la synthèse, qui composent les commentaires reçus par les étudiant·es. Les
 * fondre dans `champsPersonnalises` aurait demandé de migrer les productions
 * existantes ET de réécrire ces 53 sites, y compris le texte de rétroactions
 * déjà transmises. Décision de Grégoire, 25 août : même FORME, nom et ordre
 * modifiables, clé de stockage intouchée.
 *
 * ⮕ Ils gardent donc leurs identifiants HTML : tout ce qui les lit continue de
 * les trouver. Ce qui change est où et comment ils sont dessinés.
 * ⮕ Ils ne sont pas supprimables : les retirer casserait ce qui les lit
 *   ailleurs. Les masquer du document se fait déjà par les cases de l'aperçu.
 *
 * ⚠ `tooltip` et `aide` sont conservés tels quels : l'accompagnement fonctionne
 * par DÉLÉGATION d'événements (`closest('[data-tooltip]')`), donc ces attributs
 * gardent leur effet sur du HTML rendu après coup.
 */
const BLOCS_ANCRES = [
    {
        cle: 'objectif', champId: 'productionObjectif', rows: 3,
        titreDefaut: "Objectif d'apprentissage",
        note: "À la fin de cette activité, l'étudiant·e sera capable de...",
        placeholder: 'Ex: Reconnaître le propos du texte',
        tooltip: 'cn-prod-objectif', aide: 'objectif-verbes-actifs',
        // #507 — recommandé : `_rendreOptionsProduction` n'écrit la ligne
        // « Objectif : … » de la rétroaction QUE si ce champ est rempli. Vide,
        // la ligne ne manque pas : elle n'existe pas, et personne ne le dit.
        recommande: true
    },
    {
        cle: 'tache', champId: 'productionTache', rows: 3,
        titreDefaut: 'Description de la tâche',
        note: "La tâche permet de démontrer l'atteinte de l'objectif...",
        placeholder: 'Ex: Rédiger un texte de 500 mots...',
        tooltip: 'cn-prod-tache', aide: null,
        recommande: true   // #507 — même raison : la ligne « Tâche : … » de la rétroaction
    },
    {
        cle: 'detailTache', champId: 'productionDetailTache', rows: 5,
        titreDefaut: 'Détail de la tâche',
        note: "Les consignes précises remises à l'étudiant·e : étapes, contraintes, format attendu.",
        placeholder: 'Ex : format APA, 4 à 6 pages, sources primaires obligatoires…',
        tooltip: 'cn-prod-detail-tache', aide: 'detail-tache-qualite'
    }
];

const ancreParCle = (cle) => BLOCS_ANCRES.find(b => b.cle === cle) || null;

/** Le titre d'un bloc ancré : celui que Grégoire a écrit, ou celui d'origine. */
function titreBlocAncre(production, cle) {
    const perso = production && production.titresBlocs && production.titresBlocs[cle];
    if (perso && String(perso).trim()) return String(perso).trim();
    const ancre = ancreParCle(cle);
    return ancre ? ancre.titreDefaut : cle;
}

/**
 * L'ordre des blocs à l'écran et dans le document.
 *
 * ⚠ Un ordre enregistré peut être INCOMPLET ou PÉRIMÉ : un champ libre supprimé
 * y laisse son id, un champ ajouté depuis n'y figure pas. On repart donc de ce
 * qui EXISTE, en suivant l'ordre connu quand il s'applique — plutôt que de
 * faire confiance à une liste qui a pu vieillir.
 */
function ordreBlocsConsignes(production) {
    const existants = BLOCS_ANCRES.map(b => b.cle)
        .concat((production && Array.isArray(production.champsPersonnalises)
            ? production.champsPersonnalises : []).map(c => c.id));

    const memorise = (production && Array.isArray(production.ordreBlocs)) ? production.ordreBlocs : [];
    const connus = memorise.filter(id => existants.indexOf(id) !== -1);
    const nouveaux = existants.filter(id => connus.indexOf(id) === -1);
    return connus.concat(nouveaux);
}

/** Le champ vide, tel qu'on l'ajoute. */
function nouveauChampPersonnalise() {
    const id = (typeof window.genererIdUnique === 'function')
        ? window.genererIdUnique('CHP_')
        : 'CHP_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    return { id: id, titre: '', contenu: '' };
}

/**
 * RELIT L'ÉCRAN — il fait foi tant que la fiche est ouverte.
 *
 * ⚠ Chaque bloc rendu porte `data-champ-id` ; les ancrés portent en plus
 * `data-ancre`. C'est cette marque, et non l'ordre ou la classe, qui dit à quoi
 * on a affaire : un bloc ancré ne part pas dans `champsPersonnalises`, son
 * contenu vit dans `objectif` / `tache` / `detailTache`.
 *
 * @returns {Array<{ref: string, ancre: Object|null, titre: string, contenu: string}>}
 */
function lireBlocsConsignesDepuisFormulaire() {
    const liste = document.getElementById('champsPersonnalisesListe');
    if (!liste) return _blocsConsignes.slice();

    const lus = [];
    liste.querySelectorAll('.champ-perso').forEach(bloc => {
        const ref = bloc.getAttribute('data-champ-id');
        const cleAncre = bloc.getAttribute('data-ancre');
        const champTitre = bloc.querySelector('.champ-perso-titre');
        const champContenu = bloc.querySelector(
            cleAncre ? '.champ-perso-contenu-ancre' : '.champ-perso-contenu');
        lus.push({
            ref: ref,
            ancre: cleAncre ? ancreParCle(cleAncre) : null,
            titre: champTitre ? champTitre.value : '',
            contenu: champContenu ? champContenu.value : ''
        });
    });
    return lus;
}

/** Les blocs LIBRES seuls, sous la forme attendue par la production. */
function lireChampsPersonnalisesDepuisFormulaire() {
    return lireBlocsConsignesDepuisFormulaire()
        .filter(b => !b.ancre)
        .map(b => ({ id: b.ref, titre: b.titre, contenu: b.contenu }));
}

/**
 * Ce qui part dans la production : les champs SANS TITRE sont écartés.
 *
 * ⚠ Un bloc sans nom n'a pas sa place dans un document de consignes — il
 * s'afficherait comme un bandeau vide au-dessus d'un texte orphelin. Un champ
 * nommé mais vide, en revanche, est CONSERVÉ : c'est une section qu'on prépare.
 */
function champsPersonnalisesAEnregistrer() {
    return lireChampsPersonnalisesDepuisFormulaire()
        .filter(c => c.titre && c.titre.trim())
        .map(c => ({ id: c.id, titre: c.titre.trim(), contenu: c.contenu || '' }));
}

/**
 * Les titres que Grégoire a réécrits sur les blocs ancrés.
 * ⚠ Un titre identique au défaut n'est PAS enregistré : un défaut n'est pas un
 * choix, et le figer empêcherait un libellé d'évoluer avec l'application.
 */
function titresBlocsAEnregistrer() {
    const titres = {};
    lireBlocsConsignesDepuisFormulaire().forEach(bloc => {
        if (!bloc.ancre) return;
        const pose = (bloc.titre || '').trim();
        if (pose && pose !== bloc.ancre.titreDefaut) titres[bloc.ancre.cle] = pose;
    });
    return titres;
}

/** L'ordre posé à l'écran, tel qu'il devra être relu. */
function ordreBlocsAEnregistrer() {
    return lireBlocsConsignesDepuisFormulaire()
        .filter(b => b.ancre || (b.titre && b.titre.trim()))
        .map(b => b.ref);
}

function rendreBlocsConsignes() {
    const liste = document.getElementById('champsPersonnalisesListe');
    if (!liste) return;

    liste.innerHTML = _blocsConsignes.map((bloc, index) => {
        const premier = index === 0;
        const dernier = index === _blocsConsignes.length - 1;
        // ⚠⚠ #504 (25 août 2026) — ON REPREND LE PATRON DE L'APPLICATION, ON N'EN
        // INVENTE PAS UN. Le premier jet posait des `btn btn-secondaire` portant
        // des entités `&uarr;`/`&darr;` : deux boutons de pleine taille pour un
        // geste secondaire, et une flèche typographique là où le reste de
        // l'application met une icône. Le réordonnancement a déjà sa forme ici
        // — `pipeline-btn-reorder` et les chevrons (travaux-ui.js) — et la
        // suppression aussi : `btn-delete-icon` sur l'icône de corbeille.
        // Réutiliser ces deux-là, c'est ce qui rend les écrans semblables.
        // #504 — les mêmes boutons que les critères d'une grille et les niveaux
        // d'une échelle : un seul rendu (`main.js`), cinq appels. Le prochain
        // bloc réordonnable le reprendra sans avoir à deviner la convention.
        const fleches = window.boutonsReordonnerBloc({
            actionHaut: 'deplacerBlocConsigneHaut', actionBas: 'deplacerBlocConsigneBas',
            param: bloc.ref, premier: premier, dernier: dernier, quoi: 'ce bloc'
        });

        if (bloc.ancre) {
            const a = bloc.ancre;
            const boutonAide = a.aide
                ? `<button class="btn-aide-contextuelle" data-aide="${echapperHtml(a.aide)}" aria-label="Aide contextuelle"><span class="icone-info-aide taille-bouton" aria-hidden="true"></span></button>`
                : '';
            return `
        <div class="champ-perso champ-perso-ancre" data-champ-id="${echapperHtml(a.cle)}" data-ancre="${echapperHtml(a.cle)}"
             style="border: 1px solid var(--bordure-moyenne, #ccc); border-radius: var(--rayon-moyen, 6px); padding: 12px;">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;" data-tooltip="${echapperHtml(a.tooltip)}">
                <input type="text" class="controle-form champ-perso-titre" style="flex: 1;"
                    value="${echapperHtml(bloc.titre)}">
                ${boutonAide}${fleches}
            </div>
            <p class="u-texte-petit" style="color: var(--gris-moyen); margin: 0 0 6px 0">${echapperHtml(a.note)}${a.recommande ? ' <span class="champ-recommande" title="Recommandé : sans ce champ, l\'en-tête des rétroactions perd cette ligne, en silence">*</span>' : ''}</p>
            <textarea id="${echapperHtml(a.champId)}" class="controle-form champ-perso-contenu-ancre" rows="${a.rows}"
                placeholder="${echapperHtml(a.placeholder)}">${echapperHtml(bloc.contenu)}</textarea>
        </div>`;
        }

        return `
        <div class="champ-perso" data-champ-id="${echapperHtml(bloc.ref)}"
             style="border: 1px solid var(--bordure-moyenne, #ccc); border-radius: var(--rayon-moyen, 6px); padding: 12px;">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
                <input type="text" class="controle-form champ-perso-titre" style="flex: 1;"
                    placeholder="Nom du champ — ex : Remise du travail"
                    value="${echapperHtml(bloc.titre)}">
                ${fleches}
                ${window.boutonRetirerBloc({
                    action: 'supprimerChampPersonnalise', param: bloc.ref,
                    titre: 'Retirer ce champ'
                })}
            </div>
            <textarea class="controle-form champ-perso-contenu" rows="3"
                placeholder="Ce que ce bloc dira aux étudiant·es">${echapperHtml(bloc.contenu)}</textarea>
        </div>`;
    }).join('');
}

/** Compat : l'ancien nom appelle le nouveau rendu. */
function rendreChampsPersonnalises() { rendreBlocsConsignes(); }

function ajouterChampPersonnalise() {
    // ⚠ Relire AVANT d'ajouter : le re-rendu écraserait sinon la saisie en cours.
    _blocsConsignes = lireBlocsConsignesDepuisFormulaire();
    const neuf = nouveauChampPersonnalise();
    _blocsConsignes.push({ ref: neuf.id, ancre: null, titre: '', contenu: '' });
    rendreBlocsConsignes();

    // Le curseur va dans le champ qu'on vient de créer : sans ça, il faut viser
    // à la souris un bloc qui vient d'apparaître en bas de page.
    const liste = document.getElementById('champsPersonnalisesListe');
    const titres = liste ? liste.querySelectorAll('.champ-perso-titre') : [];
    if (titres.length > 0 && typeof titres[titres.length - 1].focus === 'function') {
        titres[titres.length - 1].focus();
    }
}

/**
 * ⚠ Un bloc ANCRÉ ne se supprime pas : `objectif`, `tache` et `detailTache`
 * sont lus par la rétroaction et les exports. Le bouton n'existe pas sur ces
 * blocs ; ce garde-fou tient si l'appel vient d'ailleurs.
 */
function supprimerChampPersonnalise(ref) {
    if (ancreParCle(ref)) return;
    _blocsConsignes = lireBlocsConsignesDepuisFormulaire().filter(b => b.ref !== ref);
    rendreBlocsConsignes();
    // Lot E3 (D3) : sur une production existante, retirer un bloc s'enregistre.
    if (productionEnEdition) enregistrerProductionModifiee();
}

function deplacerBlocConsigneHaut(ref) { deplacerBlocConsigne(ref, -1); }
function deplacerBlocConsigneBas(ref) { deplacerBlocConsigne(ref, 1); }

function deplacerBlocConsigne(ref, sens) {
    const blocs = lireBlocsConsignesDepuisFormulaire();
    const i = blocs.findIndex(b => b.ref === ref);
    const j = i + Number(sens);
    if (i < 0 || j < 0 || j >= blocs.length) return;
    const tmp = blocs[i]; blocs[i] = blocs[j]; blocs[j] = tmp;
    _blocsConsignes = blocs;
    rendreBlocsConsignes();
    // Lot E3 (D3) : sur une production existante, l'ordre s'enregistre.
    if (productionEnEdition) enregistrerProductionModifiee();
}

/** Compat : l'ancien nom, gardé le temps que les appels existants s'alignent. */
function deplacerChampPersonnalise(ref, sens) { deplacerBlocConsigne(ref, sens); }

/**
 * Remplit la zone à l'ouverture d'une fiche. `null` = production neuve.
 *
 * ⚠ Les trois ancrés sont TOUJOURS présents, même vides : ce sont eux qui
 * portent l'objectif, la tâche et le détail, et onze sites les cherchent par
 * identifiant. Leur absence ne serait pas une fiche allégée, ce serait une
 * fiche cassée.
 */
function peuplerBlocsConsignes(production) {
    const libres = (production && Array.isArray(production.champsPersonnalises))
        ? production.champsPersonnalises : [];
    const parId = {};
    libres.forEach(c => { parId[c.id] = c; });

    _blocsConsignes = ordreBlocsConsignes(production).map(ref => {
        const ancre = ancreParCle(ref);
        if (ancre) {
            return {
                ref: ancre.cle, ancre: ancre,
                titre: titreBlocAncre(production, ancre.cle),
                contenu: (production && production[ancre.cle]) || ''
            };
        }
        const libre = parId[ref];
        return {
            ref: ref, ancre: null,
            titre: (libre && libre.titre) || '',
            contenu: (libre && libre.contenu) || ''
        };
    });
    rendreBlocsConsignes();
}

/** Compat : l'ancien nom appelle le nouveau peuplement. */
function peuplerChampsPersonnalises(production) { peuplerBlocsConsignes(production); }

/**
 * LA CASE « CONSIGNES TRANSMISES », EN MODE SIMPLE (#494, 25 août 2026).
 *
 * ⚠⚠ POURQUOI ELLE MANQUAIT, ET POURQUOI ELLE NE PEUT PLUS MANQUER. Le mode
 * multi-groupe porte cette case depuis Beta 98.3 ; le mode simple, jamais.
 * `obtenirEcheanceEffective` y répondait `assignee: true` EN DUR, et c'était
 * défendable : tant que poser la date demandait un geste, une date saisie
 * VALAIT la transmission des consignes.
 *
 * ⮕ Le 25 août (#493), la date s'est mise à arriver toute seule depuis la carte
 * d'alignement. L'équivalence a sauté : une production simplement PLANIFIÉE
 * devenait TRANSMISE, entrait au calendrier, dans les indices C et P et dans
 * les snapshots, et perdait son badge « à planifier » sans qu'aucune consigne
 * ne soit partie. L'automatisme a rendu nécessaire la donnée que la supposition
 * remplaçait.
 *
 * ▣ UN SEUL MODÈLE D'ASSIGNATION. La case écrit `echeancesParGroupe` avec son
 * unique entrée — exactement ce que produit le mode multi. Pas de champ
 * parallèle : deux modèles pour la même notion, c'est la dette que la règle
 * zéro-dette du projet interdit, et c'est deux endroits où le badge et le
 * calendrier peuvent se mettre à se contredire.
 *
 * ⚠ RÉTRO-COMPAT : une production d'avant ce jour n'a qu'un `dateEcheance`.
 * Sa case s'affiche cochée si cette date existe — c'est la sémantique sous
 * laquelle Grégoire l'a saisie. Rien de ses données n'est réécrit tant qu'il
 * n'enregistre pas.
 *
 * ⚠ Sans groupe-cours identifié, pas de case : il n'y a rien à assigner, et
 * le repli legacy d'`obtenirEcheanceEffective` reste seul en piste.
 */
function poserCaseAssignationSimple(inputSimple, production, groupeCoursId) {
    const parent = inputSimple && inputSimple.parentElement;
    if (!parent) return;

    const existante = parent.querySelector('.echeance-simple-assignee');
    if (existante) existante.remove();
    if (!groupeCoursId) return;

    const entree = production && production.echeancesParGroupe
        ? production.echeancesParGroupe[groupeCoursId]
        : null;
    // Entrée muette ⇒ assignée, comme partout ailleurs (`obtenirEcheanceEffective`).
    // Pas d'entrée ⇒ on lit le legacy : une date saisie valait transmission.
    const assignee = entree
        ? (entree.assignee !== false)
        : !!(production && production.dateEcheance);

    // ⚠ UN SEUL NŒUD POSÉ, UN SEUL NŒUD RETIRÉ (correctif du 25 août). Le
    // premier jet insérait la case ET sa note comme deux frères, mais n'en
    // retirait qu'un : rouvrir la fiche empilait une note de plus à chaque fois.
    // La note vit DANS la zone — l'orphelin n'est plus possible, il n'est plus
    // seulement évité.
    const zone = document.createElement('div');
    zone.className = 'echeance-simple-assignee';
    zone.style.cssText = 'margin-bottom: 6px;';

    const ligne = document.createElement('div');
    ligne.className = 'echeance-simple-ligne';
    ligne.style.cssText = 'display: flex; align-items: center; gap: 6px;';

    const case_ = document.createElement('input');
    case_.type = 'checkbox';
    case_.id = 'productionEcheanceAssignee';
    case_.className = 'echeance-simple-checkbox';
    case_.setAttribute('data-gc-id', groupeCoursId);
    case_.checked = assignee;

    const etiquette = document.createElement('label');
    etiquette.setAttribute('for', 'productionEcheanceAssignee');
    etiquette.style.cssText = 'cursor: pointer; font-weight: normal; margin: 0;';
    etiquette.textContent = 'Consignes transmises';

    ligne.appendChild(case_);
    ligne.appendChild(etiquette);
    zone.appendChild(ligne);

    const note = document.createElement('p');
    note.className = 'echeance-simple-note u-texte-petit';
    note.style.cssText = 'color: var(--gris-moyen); margin: 2px 0 0 0; line-height: 1.4;';
    note.textContent = 'Décoché = les étudiant·es n\'ont pas encore reçu le travail. La date peut être posée d\'avance : elle ne compte qu\'une fois la case cochée.';
    zone.appendChild(note);

    parent.insertBefore(zone, inputSimple);

    // #930 (22 sept. 2026) — LE CHAMP DATE NE SUIT PLUS LA CASE. Jusqu'ici, décocher
    // grisait le champ (« sans transmission, le champ ne se saisit pas »), et
    // `gererChangementTypeProduction`, appelé juste après à l'ouverture de la
    // fiche, le réactivait sans condition : la fiche s'ouvrait éditable, un aller-
    // retour sur la case la verrouillait, et Grégoire ne pouvait plus changer la
    // date. Décision de Grégoire ce jour : une date PRÉVUE se pose sans
    // transmission ; la case seule décide de ce qui entre dans C, P et le
    // calendrier (U4 de la sentinelle #494, inchangé). Un seul écrivain du
    // `disabled` reste : le type (portfolio conteneur).
}

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
        // #468/CO-17 : masquer ne suffit pas — on VIDE. Un conteneur masqué qui
        // garde les cases de la production précédente est une ligne de plus où
        // des échéances peuvent repasser.
        listeContainer.innerHTML = '';
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
        listeContainer.innerHTML = '';  // #468/CO-17 : voir plus haut

        // 🆕 Beta 98.4 : Indicateur de séance en mode simple
        if (inputSimple) {
            // #493 — le contexte de groupe voyage d'un bloc : c'est l'identité du
            // groupe-cours (`groupeCoursId`) qui donne son horaire, pas le numéro.
            const contexteSimple = {
                coursId: coursIdProd,
                groupeCoursId: groupesFreres.length === 1 ? groupesFreres[0].id : null
            };

            // #494 — la case « consignes transmises », jusqu'ici réservée au
            // mode multi-groupe. Voir `poserCaseAssignationSimple`.
            poserCaseAssignationSimple(inputSimple, production, contexteSimple.groupeCoursId);
            let spanSimple = inputSimple.parentElement.querySelector('.info-seance-echeance');
            if (!spanSimple) {
                spanSimple = document.createElement('span');
                spanSimple.className = 'info-seance-echeance';
                spanSimple.style.cssText = 'font-size: 0.85em; color: var(--texte-secondaire, #999); display: block; margin-top: 2px;';
                inputSimple.parentElement.appendChild(spanSimple);
            }
            const spanRef = spanSimple; // capture pour le listener
            inputSimple.addEventListener('change', () => {
                afficherInfoSeanceEcheance(spanRef, inputSimple.value, contexteSimple);
            });
            if (inputSimple.value) {
                afficherInfoSeanceEcheance(spanRef, inputSimple.value, contexteSimple);
            }

            // #493 — la carte d'alignement propose la date, si elle en connaît une.
            brancherPropositionDeLaCarte(inputSimple, spanRef,
                production && production.id, contexteSimple);
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
        // `groupeNum` est le champ d'identité canonique (#130/#306) : écrit par
        // sauvegarderGroupeCoursV2 et cohérent avec `nom`. `|| groupe` = filet
        // transitoire pour un enregistrement non encore purgé (cf.
        // GroupeCoursEntite.normaliserCanonique).
        const numGroupe = gc.groupeNum || '?';
        const labelGroupe = `gr. ${String(numGroupe).padStart(5, '0')}`;

        return `<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;" data-gc-id="${gc.id}">
            <label style="display: flex; align-items: center; gap: 6px; min-width: 140px; cursor: pointer;">
                <input type="checkbox" class="echeance-gc-checkbox" data-gc-id="${gc.id}"
                    ${estAssigne ? 'checked' : ''}>
                <span>${labelGroupe}</span>
            </label>
            <input type="date" class="controle-form echeance-gc-date" data-gc-id="${gc.id}"
                data-tooltip="cn-prod-echeance-mg"
                value="${dateVal}" style="width: 180px;"
                ${dateMinTrimestre ? `min="${dateMinTrimestre}"` : ''}
                ${dateMaxTrimestre ? `max="${dateMaxTrimestre}"` : ''}>
            <span class="info-seance-echeance" data-gc-id="${gc.id}" style="font-size: 0.85em; color: var(--texte-secondaire, #999); white-space: nowrap;"></span>
        </div>`;
    }).join('');

    // #930 — le champ date d'un groupe ne suit plus sa case : une date prévue se
    // pose sans transmission, la case seule décide qu'elle est due (voir
    // `poserCaseAssignationSimple`, même règle en mode simple).

    // 🆕 Beta 98.4 : Indicateur de séance à côté des dates
    // (#493 : la table gcId → groupeNum a disparu avec le filtre qu'elle servait.
    //  C'est l'identité du groupe-cours qui donne l'horaire, pas son numéro.)

    // Multi-groupe : listener change + affichage initial
    listeContainer.querySelectorAll('.echeance-gc-date').forEach(dateInput => {
        const gcId = dateInput.dataset.gcId;
        const contexteGroupe = { coursId: coursIdProd, groupeCoursId: gcId };
        const spanInfo = listeContainer.querySelector(`.info-seance-echeance[data-gc-id="${gcId}"]`);

        dateInput.addEventListener('change', () => {
            afficherInfoSeanceEcheance(spanInfo, dateInput.value, contexteGroupe);
        });
        // Affichage initial si une date est déjà renseignée
        if (dateInput.value) {
            afficherInfoSeanceEcheance(spanInfo, dateInput.value, contexteGroupe);
        }

        // #493 — chaque groupe reçoit SA date : même semaine, même rang de
        // séance, mais l'horaire du groupe décide du jour. C'est ce qui donne
        // lundi au gr. 00002 et mardi au gr. 00008 pour la même case de la carte.
        brancherPropositionDeLaCarte(dateInput, spanInfo,
            production && production.id, contexteGroupe);
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
        span.innerHTML = `<span class="icone-inline icone-inline--warning" aria-hidden="true"></span>Hors trimestre (${echapperHtml(labelDebut)} – ${echapperHtml(labelFin)})`;
        inputDate.parentElement.appendChild(span);
    }
}

/**
 * LES DATES DE SÉANCE D'UNE SEMAINE, POUR UN GROUPE (25 août 2026).
 *
 * ⚠⚠ UNE SEULE LISTE, DEUX LECTURES — c'est tout l'intérêt de l'avoir extraite.
 *   • `indexOf(date) + 1` donne le RANG : c'est le libellé « 2e séance de la
 *     semaine 4 » sous le champ d'échéance ;
 *   • `[rang - 1]` donne la DATE : c'est ce que la carte d'alignement propose
 *     quand sa leçon est posée en semaine 4, séance B.
 * Deux fonctions distinctes auraient pu diverger d'une séance et faire dire à
 * l'écran le contraire de la carte, sur la date que lisent ses étudiant·es.
 *
 * ⚠⚠ D'OÙ VIENNENT LES SÉANCES, ET POURQUOI PAS DE `obtenirSeancesCompletes`.
 * La source par groupe est `obtenirSeancesCompletesDuGroupe(groupeCoursId)`,
 * qui lit la clé `seancesCompletes_gc_<id>` — un horaire par groupe-cours,
 * comme le fait déjà `construireHoraireDeLecons` pour l'export du plan de cours.
 *
 * ⮕ Le premier jet filtrait `obtenirSeancesCompletes(coursId)` sur
 * `seance.groupe === groupeNum`, et ne trouvait JAMAIS rien. Deux raisons, et
 * la première suffit : `obtenirSeancesCompletes` rend déjà la table du
 * groupe-cours ACTIF (cf. `cleSeancesCompletes`), donc filtrer encore par
 * groupe est un second filtre sur une table déjà filtrée ; et `seance.groupe`
 * est un champ de saisie d'horaire, laissé vide dans le cas courant. Le repli
 * « toutes les séances du cours » que portait le code d'origine n'était donc
 * pas un secours exceptionnel : c'était le chemin normal, et c'est ce qui
 * rendait le libellé juste malgré le filtre inopérant.
 *
 * ⚠ `replierSurLeCours` — À MANIER AVEC PRÉCAUTION. Quand aucune séance n'est
 * trouvée pour le groupe, on peut retomber sur l'horaire du cours. C'est bon
 * pour un LIBELLÉ, qui informe et n'engage rien ; c'est mauvais pour une DATE
 * D'ÉCHÉANCE dérivée, qui serait alors celle d'un autre groupe. La dérivation
 * passe donc `false` et préfère ne rien proposer.
 *
 * @param {Object} contexte - { coursId, groupeCoursId }
 * @param {number} numSemaine
 * @param {boolean} replierSurLeCours - Voir ci-dessus. Défaut : false.
 * @returns {Array<string>} dates 'AAAA-MM-JJ' triées, [] si rien
 */
function datesSeancesDeLaSemaine(contexte, numSemaine, replierSurLeCours = false) {
    const ctx = contexte || {};
    const semaine = parseInt(numSemaine, 10);
    if (isNaN(semaine)) return [];

    // 1. La source juste : l'horaire du groupe-cours.
    if (ctx.groupeCoursId && typeof obtenirSeancesCompletesDuGroupe === 'function') {
        const dates = datesDeLaSemaineDansTable(
            obtenirSeancesCompletesDuGroupe(ctx.groupeCoursId), semaine);
        if (dates.length > 0) return dates;
    }

    // 2. À défaut seulement — et jamais pour une échéance dérivée.
    if (!replierSurLeCours) return [];
    if (typeof obtenirSeancesCompletes !== 'function') return [];
    return datesDeLaSemaineDansTable(obtenirSeancesCompletes(ctx.coursId), semaine);
}

/**
 * Les dates d'une table `date -> [séances]` qui tombent dans cette semaine.
 *
 * ⚠ Le numéro de semaine est lu sur la SÉANCE, pas dans `calendrierComplet` :
 * c'est `genererSeancesCompletes` qui l'y a posé, à partir de ce même
 * calendrier, pour ce groupe-là. Passer par la séance évite qu'une entrée de
 * calendrier partagée entre groupes fasse entrer une date étrangère.
 */
function datesDeLaSemaineDansTable(parDate, semaine) {
    if (!parDate || typeof parDate !== 'object') return [];
    return Object.keys(parDate)
        .filter(date => {
            const seances = parDate[date];
            return Array.isArray(seances) && seances.length > 0 &&
                parseInt(seances[0].numeroSemaine, 10) === semaine;
        })
        .sort();   // Tri lexicographique = tri chronologique en AAAA-MM-JJ.
}

/**
 * La date de la n-ième rencontre d'une semaine, pour un groupe. C'est la
 * traduction de « semaine 4, séance B » en « mardi 17 février ».
 *
 * ⚠ Rend null plutôt qu'une date approchante quand le rang n'existe pas dans
 * cette semaine-là — rang 3 sur une semaine à deux rencontres, semaine hors
 * trimestre, groupe sans horaire saisi. Une échéance absente se voit et se
 * corrige ; une échéance fausse se découvre le jour de la remise.
 *
 * @returns {string|null} 'AAAA-MM-JJ' ou null
 */
function dateSeanceDuRang(contexte, numSemaine, rang) {
    const r = parseInt(rang, 10);
    if (isNaN(r) || r < 1) return null;
    const dates = datesSeancesDeLaSemaine(contexte, numSemaine, false);
    return r <= dates.length ? dates[r - 1] : null;
}

/**
 * LA DATE QUE LA CARTE PROPOSE pour cette production, dans ce groupe.
 * Null dès qu'un maillon manque — pas de carte, production non rattachée à un
 * bloc Évaluation, leçon sans semaine ni rang, groupe sans séance à ce rang.
 * Tous ces cas sont NORMAUX : ils laissent simplement le champ à la saisie.
 *
 * @returns {string|null} 'AAAA-MM-JJ'
 */
function dateEcheanceProposeeParLaCarte(productionId, contexte) {
    const carte = window.planificationCarte;
    if (!carte || typeof carte.positionCarteDeLaProduction !== 'function') return null;

    const position = carte.positionCarteDeLaProduction(productionId, (contexte || {}).coursId);
    if (!position) return null;

    return dateSeanceDuRang(contexte, position.semaine, position.rangSeance);
}

/**
 * 🆕 Beta 98.4 : Affiche l'info de séance correspondant à une date d'échéance
 * Ex: "Sem. 4, lundi — 1re séance"
 *
 * @param {HTMLElement} spanInfo - Le <span> où afficher le texte
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @param {Object} contexte - { coursId, groupeCoursId } — le groupe décide du
 *   rang : deux groupes du même cours ne se rencontrent pas les mêmes jours,
 *   donc « 2e séance » ne désigne pas la même date pour les deux.
 */
function afficherInfoSeanceEcheance(spanInfo, dateStr, contexte) {
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

    // Rang de la séance dans la semaine, filtré par groupe.
    // ⮕ La liste vient de `datesSeancesDeLaSemaine` — LA MÊME que celle qui
    //   sert à dériver une date depuis la carte d'alignement. Deux lectures
    //   d'une seule liste : le libellé ne peut pas dire « 2e séance » là où la
    //   carte a posé « B ».
    let rang = 0;
    let total = 0;

    const datesGroupeSemaine = datesSeancesDeLaSemaine(contexte, numSemaine, true);
    if (datesGroupeSemaine.length > 0) {
        rang = datesGroupeSemaine.indexOf(dateStr) + 1;
        total = datesGroupeSemaine.length;

        // Si la date n'est pas pile un jour de séance, trouver la séance la plus proche suivante
        if (rang === 0) {
            const prochaine = datesGroupeSemaine.find(d => d >= dateStr);
            // Après la dernière séance de la semaine : on rattache à la dernière.
            rang = prochaine ? datesGroupeSemaine.indexOf(prochaine) + 1 : datesGroupeSemaine.length;
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
 * LA CARTE PROPOSE, GRÉGOIRE DISPOSE (#493, 25 août 2026).
 *
 * Branche une proposition de date sur UN champ d'échéance. Trois situations,
 * et une seule écrit quelque chose :
 *   • champ vide          ⇒ la date de la carte s'y installe ;
 *   • champ = proposition ⇒ rien à dire, l'écran est déjà d'accord ;
 *   • champ ≠ proposition ⇒ l'écart est DIT, avec de quoi l'adopter d'un clic.
 *
 * ⚠⚠ UNE DATE SAISIE N'EST JAMAIS ÉCRASÉE. C'est la décision de Grégoire du
 * 25 août, et elle tient à ce qu'une échéance n'est pas une donnée d'affichage :
 * elle part dans les consignes de ses étudiant·es. Déplacer une leçon dans la
 * carte ne doit pas réécrire en silence une date déjà transmise — mais ne rien
 * dire du tout laisserait la carte et l'écran se contredire sans témoin. D'où
 * l'écart montré plutôt qu'appliqué.
 *
 * ⚠ LA CASE N'EST PAS TOUCHÉE. « Cocher = consignes transmises » : écrire une
 * date ne transmet rien. Un gabarit pré-rempli mais non coché garde son badge
 * « à planifier » (#486) et n'entre ni au calendrier ni dans les indices C et P
 * — ce qui est exactement l'état d'une production préparée, pas encore remise.
 */
function brancherPropositionDeLaCarte(inputDate, spanInfo, productionId, contexte) {
    if (!inputDate || !productionId) return;

    const proposee = dateEcheanceProposeeParLaCarte(productionId, contexte);
    if (!proposee) return;   // Pas de carte, pas de rattachement, pas de rang : champ manuel.

    if (!inputDate.value) {
        inputDate.value = proposee;
        if (spanInfo) afficherInfoSeanceEcheance(spanInfo, proposee, contexte);
        return;
    }

    if (inputDate.value === proposee) return;

    afficherEcartAvecLaCarte(inputDate, spanInfo, proposee, contexte);
}

/**
 * L'écart entre la date saisie et celle que la carte propose, avec le bouton
 * qui l'adopte. Construit en DOM (createElement + textContent) plutôt qu'en
 * `innerHTML` : rien de ce qui entre ici n'est du texte libre, et le geste
 * évite d'ouvrir une porte de plus dans un écran de saisie.
 */
function afficherEcartAvecLaCarte(inputDate, spanInfo, proposee, contexte) {
    const parent = inputDate.parentElement;
    if (!parent) return;

    const ancien = parent.querySelector('.echeance-ecart-carte');
    if (ancien) ancien.remove();

    const zone = document.createElement('span');
    zone.className = 'echeance-ecart-carte';
    zone.style.cssText = 'font-size: 0.85em; color: var(--texte-secondaire, #999); display: inline-flex; align-items: center; gap: 6px; margin-left: 8px;';

    const texte = document.createElement('span');
    texte.textContent = `La carte situe cette remise le ${libelleJourEtDate(proposee)}.`;
    zone.appendChild(texte);

    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'btn-lien-echeance-carte';
    bouton.textContent = 'Utiliser cette date';
    bouton.style.cssText = 'background: none; border: none; padding: 0; font-size: inherit; color: var(--lien, #0066cc); text-decoration: underline; cursor: pointer;';
    bouton.addEventListener('click', () => {
        inputDate.value = proposee;
        if (spanInfo) afficherInfoSeanceEcheance(spanInfo, proposee, contexte);
        zone.remove();
        // Lot E3 (D3) : une valeur posée par script n'émet aucun « change » ; sans
        // lui, la date choisie ne s'enregistrerait pas sur une production existante.
        inputDate.dispatchEvent(new Event('change', { bubbles: true }));
    });
    zone.appendChild(bouton);

    parent.appendChild(zone);
}

/** « lundi 16 févr. » — le format déjà employé sous les champs d'échéance. */
function libelleJourEtDate(dateStr) {
    const dateObj = new Date(dateStr + 'T12:00:00');
    const jour = dateObj.toLocaleDateString('fr-CA', { weekday: 'long' });
    const courte = (typeof formaterDateCourte === 'function') ? formaterDateCourte(dateStr) : dateStr;
    return `${jour} ${courte}`;
}

/**
 * 🆕 Beta 98.3 : Lire les échéances par groupe depuis le formulaire multi-groupe
 * @returns {Object|null} echeancesParGroupe ou null si mode simple
 */
function lireEcheancesParGroupeDepuisFormulaire() {
    const containerMulti = document.getElementById('containerEcheancesGroupes');

    // #494 — le mode simple écrit le MÊME modèle, avec une seule entrée. Sans
    // ce chemin, la case « consignes transmises » serait cochée à l'écran et
    // perdue à l'enregistrement : le formulaire retomberait sur le legacy, où
    // `assignee` vaut true en dur — soit exactement le contraire de ce que
    // Grégoire vient de décocher.
    if (!containerMulti || containerMulti.classList.contains('u-hide')) {
        const caseSimple = document.getElementById('productionEcheanceAssignee');
        const gcId = caseSimple ? caseSimple.getAttribute('data-gc-id') : null;
        if (!gcId) return null;   // Pas de groupe : rien à assigner, legacy seul.

        const inputSimple = document.getElementById('productionDateEcheance');
        return {
            [gcId]: {
                assignee: caseSimple.checked,
                date: (inputSimple && inputSimple.value) ? inputSimple.value : null
            }
        };
    }

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
// 🆕 Peupler le select Cartouche (dépend de la grille sélectionnée)
// Extrait de afficherFormProduction lors de la réduction de complexité (refactor étape 4, 16 mai 2026)
async function peuplerCartouchesProduction(grilleId) {
    const selectCartouche = document.getElementById('productionCartouche');
    if (!selectCartouche) return;
    if (!grilleId) {
        selectCartouche.innerHTML = '<option value="">Aucune</option>';
        return;
    }
    const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
    // security-ok: id et nom passent par echapperHtml dans l'interpolation interne
    selectCartouche.innerHTML = '<option value="">Aucune</option>' +
        cartouches.map(c => `<option value="${echapperHtml(c.id)}">${echapperHtml(c.nom)}</option>`).join('');
}

// #453 §3 — pose une référence (grilleId/echelleId/cartoucheId) dans un
// <select> en la PRÉSERVANT quand elle ne se résout pas. Un <select> à qui on
// assigne un id absent de ses options retombe SILENCIEUSEMENT sur '' ; le
// prochain enregistrement relisait ce '' et l'écrivait — la référence était
// blanchie sur disque, et la preuve de la cause effacée avec elle (27 champs
// perdus mesurés le 11 août 2026, relevé r2). Ici, l'id non résolu est
// réinjecté comme option visible « ⚠ introuvable » : il fait l'aller-retour
// affichage → disque intact, et seul un choix EXPLICITE de l'utilisateur
// peut désormais l'effacer.
function poserReferenceSelect(select, id, libelle) {
    if (!select) return;
    select.value = id || '';
    if (!id || select.value === id) return;
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = '⚠ ' + libelle + ' introuvable (' + id + ')';
    opt.className = 'option-reference-introuvable';
    select.appendChild(opt);
    select.value = id;
    console.warn(`⚠️ [productions] ${libelle} référencée mais introuvable dans les options — référence préservée, jamais blanchie (#453) : ${id}`);
}

// Pré-remplit le formulaire en mode modification (refactor étape 4, 16 mai 2026)
async function prerenseignerFormulaireProduction(prod) {
    const titre = document.getElementById('titreFormEvaluation');
    const selectGrille = document.getElementById('productionGrille');
    const selectEchelle = document.getElementById('productionEchelle');
    const selectCartouche = document.getElementById('productionCartouche');

    productionEnEdition = prod.id;
    if (titre) titre.textContent = 'Modifier l\'évaluation';
    rendreModeFicheProduction(false);   // Lot E3 (D3) : elle s'enregistre toute seule

    document.getElementById('productionTitre').value = prod.titre;
    document.getElementById('productionActivite').value = prod.activiteApprentissage || prod.description || '';
    document.getElementById('productionType').value = prod.type;
    document.getElementById('productionPonderation').value = prod.ponderation;
    poserReferenceSelect(selectGrille, prod.grilleId, 'grille');

    // 🆕 Pré-remplir échelle et cartouche depuis la production
    if (prod.echelleId) poserReferenceSelect(selectEchelle, prod.echelleId, 'échelle');
    if (prod.grilleId) {
        await peuplerCartouchesProduction(prod.grilleId);
        if (prod.cartoucheId) poserReferenceSelect(selectCartouche, prod.cartoucheId, 'cartouche');
    }

    poserValeurChampGabarit('productionObjectif', prod.objectif);
    poserValeurChampGabarit('productionTache', prod.tache);
    poserValeurChampGabarit('productionDetailTache', prod.detailTache);
    peuplerChampsPersonnalises(prod);                                        // #499

    // ✨ NOUVEAU (Beta 94 - 10 déc 2025): Charger date d'échéance
    document.getElementById('productionDateEcheance').value = prod.dateEcheance || '';

    // #790 — l'état du marqueur diagnostique. Sans cette ligne, rouvrir une
    // production cochée montrerait une case VIDE, et le simple fait d'enregistrer
    // la décocherait : le formulaire dirait « false » avec l'assurance de quelqu'un
    // qui a lu, alors qu'il n'a fait que ne pas être rempli.
    const caseDiagnostique = document.getElementById('productionDiagnostique');
    if (caseDiagnostique) {
        caseDiagnostique.checked = window.ProductionDiagnostique
            ? window.ProductionDiagnostique.estDiagnostique(prod)
            : prod.diagnostique === true;
    }

    // 🆕 Beta 98.3 : Échéances par groupe-cours (multi-groupe)
    peuplerEcheancesParGroupe(prod);

    // Gérer l'affichage des champs spécifiques au type
    gererChangementTypeProduction();

    // Synchroniser la grille inline si c'est un artefact de portfolio
    const selectGrilleInline = document.getElementById('productionGrilleInline');
    if (selectGrilleInline && prod.type === 'artefact-portfolio') {
        poserReferenceSelect(selectGrilleInline, prod.grilleId, 'grille');
    }

}

// Réinitialise le formulaire en mode ajout (refactor étape 4, 16 mai 2026)
function reinitialiserFormulaireProduction() {
    const titre = document.getElementById('titreFormEvaluation');
    const selectGrille = document.getElementById('productionGrille');
    const selectEchelle = document.getElementById('productionEchelle');
    const selectCartouche = document.getElementById('productionCartouche');

    productionEnEdition = null;
    if (titre) titre.textContent = 'Nouvelle production';
    rendreModeFicheProduction(true);    // Lot E3 (D3) : rien n'existe avant « Créer la production »

    // Réinitialiser les champs
    document.getElementById('productionTitre').value = '';
    document.getElementById('productionActivite').value = '';
    document.getElementById('productionType').value = '';
    document.getElementById('productionPonderation').value = '';
    if (selectGrille) selectGrille.value = '';
    if (selectEchelle) selectEchelle.value = '';
    if (selectCartouche) selectCartouche.innerHTML = '<option value="">Aucune</option>';
    poserValeurChampGabarit('productionObjectif', '');
    poserValeurChampGabarit('productionTache', '');
    poserValeurChampGabarit('productionDetailTache', '');

    // ✨ NOUVEAU (Beta 94 - 10 déc 2025): Réinitialiser date d'échéance
    document.getElementById('productionDateEcheance').value = '';

    // #790 — une fiche neuve n'hérite pas du marqueur de la précédente.
    const caseDiagnostiqueNeuve = document.getElementById('productionDiagnostique');
    if (caseDiagnostiqueNeuve) caseDiagnostiqueNeuve.checked = false;

    // 🆕 Beta 98.3 : Échéances par groupe-cours (multi-groupe)
    peuplerChampsPersonnalises(null);                                        // #499 — une fiche neuve n'hérite pas des champs de la précédente
    peuplerEcheancesParGroupe(null);

    // Réinitialiser les champs portfolio
    const portfolioNombreRetenir = document.getElementById('portfolioNombreRetenir');
    const portfolioMinimumCompleter = document.getElementById('portfolioMinimumCompleter');
    if (portfolioNombreRetenir) portfolioNombreRetenir.value = 3;
    if (portfolioMinimumCompleter) portfolioMinimumCompleter.value = 7;

    // Réinitialiser l'affichage
    gererChangementTypeProduction();
}

async function afficherFormProduction(id) {

    const form = document.getElementById('formulaireProduction');
    const btnAjouter = document.getElementById('btnajouterProduction');

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
            grilles.map(g => `<option value="${echapperHtml(g.id)}">${echapperHtml(g.nom)}</option>`).join('');

        if (selectGrille) {
            selectGrille.innerHTML = optionsHtml;
        }
        if (selectGrilleInline) {
            selectGrilleInline.innerHTML = optionsHtml;
        }
    }

    // 🆕 Peupler le select Échelle de performance
    await peuplerEchellesProduction();

    // Lot E3 : repeupler les cartouches quand la grille change se fait dans
    // `surChangementFormulaireProduction`, AVANT l'écriture de la fiche : sinon la
    // cartouche de l'ancienne grille s'écrirait avec la nouvelle.

    // Peupler cartouches avec la grille initiale (si déjà sélectionnée)
    if (selectGrille && selectGrille.value) {
        await peuplerCartouchesProduction(selectGrille.value);
    }

    if (id) {
        // Mode modification
        // 🆕 Beta 95.4 : Utiliser la clé namespacée pour le trimestre actif
        const cleProductions = cle('productions');
        const evaluations = await db.get(cleProductions) || [];

        const prod = evaluations.find(e => e.id === id);

        if (prod) {
            await prerenseignerFormulaireProduction(prod);
        } else {
            // Production non trouvée
            console.error('❌ Production non trouvée avec ID:', id);
            console.error('IDs disponibles:', evaluations.map(e => ({ id: e.id, titre: e.titre })));

            notifications.erreur('Évaluation introuvable', `ID: ${id}`);
            return;
        }
    } else {
        // Mode ajout
        reinitialiserFormulaireProduction();
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

// Helpers privés extraits de sauvegarderProduction lors de la réduction de complexité
// (refactor étape 4, 16 mai 2026). Cyc 80 → ~9 dans la fonction principale.

// Lit toutes les valeurs du formulaire de production (dates multi-groupe incluses)
function lireDonneesFormulaireProduction() {
    const titre = document.getElementById('productionTitre').value.trim();
    const activiteApprentissage = document.getElementById('productionActivite').value.trim();
    const type = document.getElementById('productionType').value;
    const ponderation = parseInt(document.getElementById('productionPonderation').value) || 0;
    const objectif = valeurChampGabarit('productionObjectif').trim();
    const tache = valeurChampGabarit('productionTache').trim();
    const detailTache = valeurChampGabarit('productionDetailTache').trim();

    // ✨ NOUVEAU (Beta 94 - 10 déc 2025): Date d'échéance
    // 🆕 Beta 98.3 : Lire les échéances multi-groupe si disponible
    const echeancesParGroupe = lireEcheancesParGroupeDepuisFormulaire();
    let dateEcheance;
    if (echeancesParGroupe) {
        // Synchroniser dateEcheance legacy avec la date du groupe actif
        const infoCoursActif = db.getSync('infoCours', null);
        const gcActifId = obtenirIdContexteActif(infoCoursActif);
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

    const grille = document.getElementById('productionGrille');
    const grilleId = grille ? grille.value : '';
    const echelleSelect = document.getElementById('productionEchelle');
    const echelleId = echelleSelect ? echelleSelect.value : '';
    const cartoucheSelect = document.getElementById('productionCartouche');
    const cartoucheId = cartoucheSelect ? cartoucheSelect.value : '';

    // #499 — les blocs que Grégoire a nommés lui-même.
    const champsPersonnalises = champsPersonnalisesAEnregistrer();
    // #500 — les titres qu'il a réécrits sur les blocs ancrés, et l'ordre posé.
    const titresBlocs = titresBlocsAEnregistrer();
    const ordreBlocs = ordreBlocsAEnregistrer();

    // #790 — le marqueur diagnostique. `null` quand la case n'est PAS RENDUE, jamais
    // `false` : c'est « je ne sais pas », et `construireProductionData` ne posera
    // alors rien. Distinguer les deux n'est pas de la coquetterie — un `false` rendu
    // par un formulaire partiel DÉCOCHERAIT la case sur la production existante, et
    // ferait recompter un travail que l'enseignant avait sorti des calculs. C'est
    // exactement le motif de #785, mesuré ce matin sur les présences.
    const caseDiagnostique = document.getElementById('productionDiagnostique');
    const diagnostique = caseDiagnostique ? !!caseDiagnostique.checked : null;

    return { titre, activiteApprentissage, type, ponderation, objectif, tache, detailTache,
             champsPersonnalises, titresBlocs, ordreBlocs, diagnostique,
             echeancesParGroupe, dateEcheance, grilleId, echelleId, cartoucheId };
}

// Valide les champs obligatoires (alerte + retourne false si manquant)
//
// #486 (24 août 2026) — LA DATE D'ÉCHÉANCE N'EST PLUS UNE CONDITION DE
// SAUVEGARDE. Elle l'était depuis Beta 94, et c'était une garde de trop :
// Grégoire prépare TOUTES ses productions avant de les transmettre, et poser
// l'échéance est précisément l'acte de transmission. Exiger la date pour
// enregistrer, c'est exiger d'avoir déjà distribué le travail pour avoir le
// droit de le préparer — la planification devenait impossible.
//
// La règle contredisait aussi l'écran qu'elle gardait : sous « Échéances par
// groupe », l'interface annonce depuis Beta 98.3 que « Décoché = les
// étudiant·es n'ont pas encore reçu le travail » — un état déclaré légitime,
// que la sauvegarde refusait pourtant d'enregistrer.
//
// Rien en aval ne dépend de cette garde : tous les lecteurs d'échéance
// filtrent déjà sur `assignee && !!date` (voir `aucuneEcheanceAssignee`). Une
// production sans date n'est pas une donnée cassée, c'est une production qui
// n'est due nulle part — exactement comme un portfolio conteneur, dispensé de
// date depuis toujours. Le gabarit sans échéance se signale désormais dans la
// barre latérale par le badge « à planifier » (productions-liste.js), pour
// qu'un oubli reste visible sans être bloquant.
/**
 * #518 (26 août 2026) — UN BLOC REMPLI MAIS SANS NOM DISPARAISSAIT EN SILENCE.
 *
 * `champsPersonnalisesAEnregistrer` écarte les blocs sans titre, et la règle se
 * défend : un bloc sans nom s'afficherait comme un bandeau vide au-dessus d'un
 * texte orphelin, dans le document remis aux étudiant·es. Mais ce qui était
 * écarté, c'était du texte TAPÉ — et rien ne le disait.
 *
 * Verdict de Grégoire (D4, 26 août) : AVERTIR. Ni refus bloquant, ni titre
 * inventé par l'application — le contenu d'un bloc appartient à son auteur, et
 * c'est à lui de trancher.
 *
 * ⚠ Une fenêtre, pas un bandeau : il y a une question à poser et une réponse à
 * attendre. C'est la doctrine du projet depuis la migration des confirmations —
 * le bandeau annonce ce qui EST FAIT, la fenêtre demande ce qu'on VEUT faire.
 *
 * ⚠ On lit les blocs BRUTS du formulaire, pas `donnees.champsPersonnalises` :
 * ceux-là sont déjà filtrés, et un bloc écarté n'y figure plus. Chercher
 * l'oubli dans la liste dont il a été retiré ne l'aurait jamais trouvé.
 */
function compterBlocsOrphelins() {
    if (typeof lireChampsPersonnalisesDepuisFormulaire !== 'function') return 0;
    return lireChampsPersonnalisesDepuisFormulaire()
        .filter(c => !String(c.titre || '').trim() && String(c.contenu || '').trim()).length;
}

// Lot E3 : la question ne se pose plus qu'à la création (« Créer la production ») ;
// une fiche existante le dit par le témoin (`enregistrerProductionModifiee`).
function validerBlocsNommes() {
    const orphelins = compterBlocsOrphelins();
    if (orphelins === 0) return true;

    const message = orphelins === 1
        ? 'Un bloc de consignes est rempli mais n\'a pas de nom : il ne sera pas conservé.\n\n'
          + 'Créer quand même ?'
        : orphelins + ' blocs de consignes sont remplis mais n\'ont pas de nom : ils ne '
          + 'seront pas conservés.\n\nCréer quand même ?';
    return confirm(message);
}

// Lot E3 (D0 point 2, D3) : les gestes nommés par le témoin commun.
const GESTE_CREER_PRODUCTION = 'Créer la production';
const GESTE_MODIFIER_PRODUCTION = 'Modifier la production';

/**
 * Lot E3 : la raison d'un refus, dite par le témoin (« Non enregistré – ‹geste› :
 * ‹raison› ») au lieu d'une alerte ; '' quand rien ne manque.
 */
function raisonChampsObligatoiresProduction(d) {
    if (!d.titre) return 'le nom de la production est requis.';
    if (!d.type) return 'choisis le type de la production.';
    if (d.type !== 'artefact-portfolio' && d.ponderation === 0) return 'la pondération est requise : plus de 0 %.';
    return '';
}

function validerChampsObligatoiresProduction(d, geste = GESTE_CREER_PRODUCTION) {
    const raison = raisonChampsObligatoiresProduction(d);
    if (!raison) return true;
    if (window.temoinEnregistrement) window.temoinEnregistrement.nonEnregistre(raison, geste, cle('productions'));
    return false;
}

// 🆕 Beta 98.4 : Vérifie les dates vs bornes du trimestre (confirm si hors limites)
function validerEcheancesDansTrimestre(d) {
    if (d.type === 'portfolio') return true;

    const cadreCalendrier = db.getSync(cle('cadreCalendrier'), null);
    const dateMinTri = cadreCalendrier ? cadreCalendrier.dateDebut : null;
    const dateMaxTri = cadreCalendrier ? cadreCalendrier.finCours : null;
    if (!dateMinTri && !dateMaxTri) return true;

    const horsLimites = [];

    if (d.echeancesParGroupe) {
        // Mode multi-groupe : vérifier chaque groupe assigné
        const groupesCours = db.getSync(cle('groupesCours'), []);
        for (const [gcId, entree] of Object.entries(d.echeancesParGroupe)) {
            if (!entree.assignee || !entree.date) continue;
            const horsMin = dateMinTri && entree.date < dateMinTri;
            const horsMax = dateMaxTri && entree.date > dateMaxTri;
            if (horsMin || horsMax) {
                const gc = groupesCours.find(g => g.id === gcId);
                const numGroupe = gc ? (gc.groupeNum || '?') : '?';
                const label = `gr. ${String(numGroupe).padStart(5, '0')}`;
                horsLimites.push(`${label} (${entree.date})`);
            }
        }
    } else if (d.dateEcheance) {
        const horsMin = dateMinTri && d.dateEcheance < dateMinTri;
        const horsMax = dateMaxTri && d.dateEcheance > dateMaxTri;
        if (horsMin || horsMax) {
            horsLimites.push(d.dateEcheance);
        }
    }

    if (horsLimites.length === 0) return true;

    const labelDebut = dateMinTri ? formaterDateCourte(dateMinTri) : '?';
    const labelFin = dateMaxTri ? formaterDateCourte(dateMaxTri) : '?';
    const msg = horsLimites.length === 1
        ? `L'échéance ${horsLimites[0]} est en dehors du trimestre (${labelDebut} – ${labelFin}). Créer quand même ?`
        : `Les échéances suivantes sont en dehors du trimestre (${labelDebut} – ${labelFin}) :\n- ${horsLimites.join('\n- ')}\n\nCréer quand même ?`;
    return confirm(msg);
}

// ✅ AJOUT (6 jan 2026) : Vérifie les doublons de titre (dialogue utilisateur).
// Retourne { evaluations, titre, annule } — annule=true si l'utilisateur ferme le dialogue.
async function gererDoublonProduction(titre, evaluations, idActuel) {
    const productionActuelle = idActuel ? evaluations.find(e => e.id === idActuel) : null;
    const isCreation = !idActuel;
    const isNameChange = productionActuelle && productionActuelle.titre !== titre;

    if (!(isCreation || isNameChange) || typeof verifierEtGererDoublon !== 'function') {
        return { evaluations, titre, annule: false };
    }

    const resultat = await verifierEtGererDoublon('production', titre, evaluations.map(e => ({ ...e, nom: e.titre })), idActuel);
    if (resultat === null) {
        return { evaluations, titre, annule: true };
    }

    let nouvelEvaluations = evaluations;
    let nouveauTitre = titre;
    if (resultat && resultat.action === 'renommer') {
        document.getElementById('productionTitre').value = resultat.nouveauNom;
        nouveauTitre = resultat.nouveauNom;
    }
    if (resultat && resultat.action === 'ecraser') {
        nouvelEvaluations = evaluations.filter(e => e.titre !== titre);
    }
    return { evaluations: nouvelEvaluations, titre: nouveauTitre, annule: false };
}

// Construit l'objet productionData prêt à être inséré dans evaluations.
//
// #468/CO-17 (21 août 2026) — `idEnEdition` décide de ce que l'objet CONTIENT.
// L'objet est fusionné par spread sur la production existante
// (`{...existante, ...productionData}`) : tout champ présent ici ÉCRASE. Les
// champs d'ÉTAT (verrouille / dansBibliotheque / coursId) n'ont donc leur place
// qu'à la CRÉATION — sinon la moindre retouche de titre déverrouillait la
// production, la faisait réapparaître si elle avait été retirée, et la
// RÉASSIGNAIT au cours actif du moment (mécanisme d'entretien du bug #346).
function construireProductionData(d, evaluations, idEnEdition) {
    const estModification = !!idEnEdition;

    // ✅ CORRECTION CRITIQUE (Beta 95 - 27 déc 2025) : Ajouter coursId
    const coursId = typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null;
    if (!coursId && !estModification) {
        console.warn('[Productions] ⚠️ Aucun cours actif - production créée sans coursId');
    }

    // 🆕 Beta 95.4 : Préserver la catégorie existante si modification, sinon null
    const existingProd = evaluations.find(p => p.id === idEnEdition);
    const categorieExistante = existingProd?.categorie || null;

    const productionData = {
        titre: d.titre,
        activiteApprentissage: d.activiteApprentissage,
        description: d.activiteApprentissage,  // Rétrocompat exports existants
        type: d.type,
        ponderation: d.ponderation,
        objectif: d.objectif,
        tache: d.tache,
        detailTache: d.detailTache,
        champsPersonnalises: d.champsPersonnalises || [],   // #499
        titresBlocs: d.titresBlocs || {},                  // #500 — seulement ce qui diffère du défaut
        ordreBlocs: d.ordreBlocs || [],                    // #500
        grilleId: d.grilleId,
        echelleId: d.echelleId,        // 🆕 Persistance échelle dans le gabarit
        cartoucheId: d.cartoucheId,    // 🆕 Persistance cartouche dans le gabarit
        dateEcheance: d.dateEcheance,  // ✨ NOUVEAU (Beta 94 - 10 déc 2025)
        // Volet C (3 sept. 2026) — `pratiquesCompatibles` ne se SAISIT plus, mais
        // ne se SUPPRIME d'aucune donnée : une production déjà enregistrée garde
        // la valeur qu'elle portait (tarir n'est pas réparer).
        ...(existingProd && existingProd.pratiquesCompatibles !== undefined
            ? { pratiquesCompatibles: existingProd.pratiquesCompatibles } : {}),
        categorie: categorieExistante  // 🆕 Beta 95.4
    };

    // 🆕 Beta 98.3 : multi-groupe.
    // #468/CO-17 : la clé n'est POSÉE que si le formulaire a quelque chose à
    // dire. `lireEcheancesParGroupeDepuisFormulaire` rend `null` quand le
    // conteneur multi est masqué (mode simple, un seul groupe frère, cours non
    // résolu) — c'est « je ne sais pas », jamais « efface ». Or un `undefined`
    // dans un spread ÉCRASE : une retouche de titre détruisait les dates par
    // groupe sans le dire.
    if (d.echeancesParGroupe) {
        productionData.echeancesParGroupe = d.echeancesParGroupe;
    }

    // #790 — LE MARQUEUR DIAGNOSTIQUE N'EST PAS UN CHAMP D'ÉTAT COMME LES AUTRES.
    // `verrouille`, `dansBibliotheque` et `coursId` ne se posent qu'à la CRÉATION
    // (voir l'entête) : les reposer à chaque retouche a produit le bug #346. Celui-ci
    // est l'inverse — il DOIT pouvoir se cocher sur une production déjà créée ET
    // ÉVALUÉE, puisque c'est le cas d'usage même : l'enseignant a déjà fait produire
    // et corrigé le travail quand il décide qu'il ne comptera pas.
    // ⮕ La garde n'est donc pas « à la création seulement », mais « seulement si le
    // formulaire avait quelque chose à dire ». `lireDonneesFormulaireProduction` rend
    // `null` quand la case n'est pas rendue ; un `undefined` dans le spread ÉCRASE,
    // et un `false` deviné décocherait la case sans que personne ne l'ait demandé.
    if (d.diagnostique !== null && d.diagnostique !== undefined) {
        productionData.diagnostique = !!d.diagnostique;
    }

    // #468/CO-17 : champs d'ÉTAT — à la création seulement (voir l'entête).
    if (!estModification) {
        productionData.verrouille = false;
        productionData.dansBibliotheque = true;  // ✅ AJOUT (8 décembre 2025)
        productionData.coursId = coursId;        // ✅ CRITIQUE (Beta 95)
    }

    if (d.type === 'portfolio') {
        // ✅ CORRECTION Phase 3: Les règles de calcul sont configurées dans Réglages
        productionData.modeCalcul = 'provisoire';
    }
    return productionData;
}

/**
 * Lot E3 (D3) — après une modification enregistrée : la barre latérale (nom, type,
 * pondération), le total et les avertissements STD suivent. La fiche reste ouverte,
 * telle quelle : aucune réouverture, qui déplacerait le curseur.
 */
async function rafraichirApresModificationProduction() {
    await afficherTableauProductions();
    await mettreAJourPonderationTotale();
    await afficherListeProductions();
    // La barre latérale est redessinée : l'élément de la fiche ouverte reste surligné.
    if (productionEnEdition) {
        const item = document.querySelector(`.sidebar-item[data-id="${productionEnEdition}"]`);
        if (item) item.classList.add('active');
    }
    if (typeof window.chargerProductionsDansSelect === 'function') window.chargerProductionsDansSelect();
    if (typeof window.rechargerFiltreProduction === 'function') window.rechargerFiltreProduction();
}

const GESTE_COCHER_CONSIGNES = 'Cocher la case';

/**
 * #1010 (4 oct. 2026) — COCHER « CONSIGNES TRANSMISES » DEPUIS L'ÉCRAN D'ÉVALUATION.
 *
 * Le bouton du bandeau (`mettreAJourSignalConsignes`, evaluation.js) écrit ICI, sur
 * son clic seulement : c'est le geste de l'enseignant, jamais une écriture d'office
 * (décision de Grégoire du 1er oct. : pas de coche automatique). Le modèle est celui
 * de la case de la fiche (`lireEcheancesParGroupeDepuisFormulaire`) : une entrée
 * `echeancesParGroupe[gcId]` dont seul `assignee` change — la date reste la sienne.
 *
 * ⚠ LA FICHE OUVERTE RELIT TOUT LE FORMULAIRE à chaque changement
 * (`enregistrerProductionModifiee`). Si c'est celle de cette production, sa case
 * décochée réécrirait `assignee: false` au prochain champ touché : on la coche aussi.
 *
 * @param {string} productionId
 * @param {string} groupeCoursId - l'id du groupe-cours, celui que la case de la fiche écrit
 * @returns {Promise<boolean>} true si la production a été écrite
 */
async function marquerConsignesTransmises(productionId, groupeCoursId) {
    if (!productionId || !groupeCoursId) return false;
    let ecrit;
    try {
        ecrit = await modifierEtAnnoncer(cle('productions'), (lues) => {
            const productions = Array.isArray(lues) ? lues : [];
            const index = productions.findIndex(p => p && p.id === productionId);
            if (index === -1) return undefined;
            const production = productions[index];
            const entree = (production.echeancesParGroupe || {})[groupeCoursId];
            if (!entree || entree.assignee !== false) return undefined;   // rien à cocher
            productions[index] = {
                ...production,
                echeancesParGroupe: { ...production.echeancesParGroupe, [groupeCoursId]: { ...entree, assignee: true } },
                dateModification: new Date().toISOString()
            };
            return productions;
        }, [], { geste: GESTE_COCHER_CONSIGNES });
    } catch (e) {
        return false;   // le témoin a dit l'échec
    }
    if (!ecrit) return false;

    if (productionEnEdition === productionId) {
        const caseFiche = document.querySelector(`#productionEcheanceAssignee[data-gc-id="${groupeCoursId}"], .echeance-gc-checkbox[data-gc-id="${groupeCoursId}"]`);
        if (caseFiche) caseFiche.checked = true;
    }
    return true;
}

/**
 * Lot E3 (D3, D0 point 2) — UNE PRODUCTION EXISTANTE S'ENREGISTRE TOUTE SEULE.
 *
 * Un seul écrivain, appelé à chaque changement du formulaire : il relit TOUT le
 * formulaire, comme « Enregistrer » le faisait, et l'écrit par le témoin commun. Les
 * gardes restent celles du bouton d'avant : `construireProductionData` ne repose
 * jamais les champs d'état (#468) ni un marqueur diagnostique non rendu (#790) ; les
 * références non résolues font l'aller-retour (#453).
 *
 * ⚠ Aucune évaluation n'est touchée : une évaluation porte sa propre grille, son
 * échelle, sa cartouche et ses critères (`evaluation-sauvegarde.js`). Changer la
 * grille ou la pondération d'une production évaluée écrit la production, rien d'autre.
 *
 * Refus, par le témoin et sans écriture : un champ obligatoire vide ; le nom d'une
 * autre production refusé à la question du doublon (le nom revient). Un bloc de
 * consignes rempli sans nom : le reste s'écrit, le témoin dit que ce bloc n'est pas
 * conservé (« un refus n'est jamais suivi d'un succès »).
 * Une échéance hors du trimestre s'écrit : l'avertissement sous le champ le dit déjà
 * (`verifierDateHorsTrimestre`) ; la question ne se pose plus qu'à la création.
 *
 * @param {Element} [champ] - le champ qui a changé
 * @returns {Promise<boolean>} true si la production a été écrite
 */
async function enregistrerProductionModifiee(champ) {
    const id = productionEnEdition;
    if (!id) return false;
    const cleProductions = cle('productions');
    const temoin = window.temoinEnregistrement;

    const donnees = lireDonneesFormulaireProduction();
    if (!validerChampsObligatoiresProduction(donnees, GESTE_MODIFIER_PRODUCTION)) return false;

    // Le nom : la question du doublon, comme au bouton d'avant (elle ne se pose que
    // si le nom a changé). Sa réponse « Annuler » remet le nom enregistré.
    let idsRetires = [];
    if (champ && champ.id === 'productionTitre') {
        const lues = await db.get(cleProductions) || [];
        const resultat = await gererDoublonProduction(donnees.titre, lues, id);
        if (resultat.annule) {
            const stockee = lues.find(e => e.id === id);
            if (stockee) champ.value = stockee.titre || '';
            return false;
        }
        donnees.titre = resultat.titre;
        idsRetires = lues.filter(e => !resultat.evaluations.some(x => x.id === e.id)).map(e => e.id);
    }
    // Une autre fiche a été ouverte pendant la question : ce qu'on a lu n'est plus la sienne.
    if (productionEnEdition !== id) return false;

    const orphelins = compterBlocsOrphelins();
    let introuvable = false;
    let ecrit;
    try {
        ecrit = await modifierEtAnnoncer(cleProductions, (lues) => {
            const evaluations = (lues || []).filter(e => !idsRetires.includes(e.id));
            const index = evaluations.findIndex(e => e.id === id);
            if (index === -1) { introuvable = true; return undefined; }
            const productionData = construireProductionData(donnees, evaluations, id);
            evaluations[index] = { ...evaluations[index], ...productionData };
            // 🆕 Beta 99.05 : Mise à jour dateModification systématique
            evaluations[index].dateModification = new Date().toISOString();
            // 🆕 Beta 95.4 : Ajouter contributeur si l'utilisateur actif n'est pas l'auteur
            if (typeof ajouterContributeurSiNecessaire === 'function') {
                evaluations[index] = ajouterContributeurSiNecessaire(evaluations[index]);
            }
            return evaluations;
        }, [], { geste: GESTE_MODIFIER_PRODUCTION, discret: orphelins > 0 });
    } catch (e) {
        return false;   // le témoin a dit l'échec
    }

    if (introuvable) {
        if (temoin) temoin.nonEnregistre('cette production n\'est plus dans le trimestre actif. Ferme la fiche et rouvre-la depuis la liste.', GESTE_MODIFIER_PRODUCTION, cleProductions);
        return false;
    }
    if (!ecrit) return false;
    if (orphelins > 0 && temoin) {
        temoin.nonEnregistre(orphelins === 1
            ? 'un bloc de consignes est rempli mais n\'a pas de nom ; il n\'est pas conservé. Donne-lui un nom.'
            : orphelins + ' blocs de consignes sont remplis mais n\'ont pas de nom ; ils ne sont pas conservés. Donne-leur un nom.',
            GESTE_MODIFIER_PRODUCTION, cleProductions);
    }
    await rafraichirApresModificationProduction();
    return true;
}

/**
 * Lot E3 — l'écouteur unique du formulaire. En création, il ne fait que suivre la
 * grille (les cartouches) : rien n'est écrit avant « Créer la production ».
 */
async function surChangementFormulaireProduction(champ) {
    // La grille d'abord : ses cartouches remplacent celles de l'ancienne grille,
    // AVANT que la fiche ne soit relue et écrite.
    if (champ && champ.id === 'productionGrille') await peuplerCartouchesProduction(champ.value);
    // Les autres écouteurs du même changement agissent d'abord : le type adapte les
    // champs (`gererChangementTypeProduction`, par le dispatcher du document).
    await new Promise(resolve => setTimeout(resolve, 0));
    if (!productionEnEdition) return;
    const formulaire = document.getElementById('formulaireProduction');
    if (!formulaire || formulaire.classList.contains('u-hide')) return;
    await enregistrerProductionModifiee(champ);
}

function brancherEnregistrementProduction() {
    const formulaire = document.getElementById('formulaireProduction');
    if (!formulaire || typeof formulaire.addEventListener !== 'function') return;
    formulaire.addEventListener('change', (e) => { surChangementFormulaireProduction(e.target); });
}

/**
 * Lot E3 (D3) — une production existante montre « Fermer » seul ; une production
 * en création montre aussi « Créer la production ».
 */
function rendreModeFicheProduction(enCreation) {
    const btnCreer = document.getElementById('btnCreerProduction');
    if (btnCreer) btnCreer.classList[enCreation ? 'remove' : 'add']('u-hide');
}

/**
 * Lot E3 : « ma fiche est en création et porte une saisie » — lu par la question de
 * sortie et par le `beforeunload` communs (`ui-dialogues.js`).
 */
function productionEnCreationSaisie() {
    const formulaire = document.getElementById('formulaireProduction');
    if (productionEnEdition || !formulaire || formulaire.classList.contains('u-hide')) return false;
    const d = lireDonneesFormulaireProduction();
    const dates = Object.values(d.echeancesParGroupe || {}).some(e => e && e.date);
    return !!(d.titre || d.activiteApprentissage || d.type || d.ponderation || d.grilleId
        || d.echelleId || d.cartoucheId || d.objectif || d.tache || d.detailTache
        || d.champsPersonnalises.length || compterBlocsOrphelins() || d.dateEcheance || dates);
}
if (window.uiDialogues) window.uiDialogues.declarerFicheEnCreation('production', productionEnCreationSaisie);

/** Lot E3 (D3) : « Fermer » (il n'annulait rien) — avec la question, en création. */
async function fermerFicheProduction() {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('production'))) return;
    window.annulerFormProduction();
}

/**
 * Lot E3 (D3) — « Créer la production ». Une production existante ne passe plus par
 * ici : elle s'enregistre champ par champ (`enregistrerProductionModifiee`).
 */
async function sauvegarderProduction() {
    if (productionEnEdition) return enregistrerProductionModifiee();

    const donnees = lireDonneesFormulaireProduction();

    if (!validerChampsObligatoiresProduction(donnees)) return;
    // #518 — après les champs obligatoires (qui bloquent), avant l'écriture :
    // on n'empile pas deux fenêtres, et l'avertissement porte sur ce qui va
    // réellement partir.
    if (!validerBlocsNommes()) return;
    if (!validerEcheancesDansTrimestre(donnees)) return;

    // 🆕 Beta 95.4 : Utiliser la clé namespacée pour le trimestre actif
    const cleProductions = cle('productions');

    // ⚠ Cette lecture sert à POSER LA QUESTION du doublon, pas de base à
    // l'écriture : `gererDoublonProduction` peut attendre l'utilisateur, et tout
    // ce qui s'enregistre pendant serait écrasé par la collection lue avant.
    const evaluationsLues = await db.get(cleProductions) || [];

    const resultatDoublons = await gererDoublonProduction(donnees.titre, evaluationsLues, null);
    if (resultatDoublons.annule) return;
    donnees.titre = resultatDoublons.titre;

    // Ce que la gestion du doublon a RETIRÉ, relevé PAR IDENTIFIANT : le retrait
    // est rejoué dans la file, sur la collection de l'instant. Reprendre la liste
    // qu'elle rend remettrait en place tout ce qui a été enregistré entre-temps.
    const idsRetires = evaluationsLues
        .filter(e => !resultatDoublons.evaluations.some(x => x.id === e.id))
        .map(e => e.id);

    // Lot E3 (D0 point 2) : par le témoin commun ; le message du geste ne part
    // qu'après l'écriture.
    let productionData = null;
    let ecrit;
    try {
        ecrit = await modifierEtAnnoncer(cleProductions, (lues) => {
            const evaluations = (lues || []).filter(e => !idsRetires.includes(e.id));

            productionData = construireProductionData(donnees, evaluations, null);
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
            return evaluations;
        }, [], { geste: GESTE_CREER_PRODUCTION });
    } catch (e) {
        return;   // le témoin a dit l'échec ; la fiche reste ouverte, saisie comprise
    }
    if (!ecrit || !productionData) return;

    notifications.succes(`Production «\u00a0${productionData.titre}\u00a0» créée.`);

    // La fiche fermée d'abord (plus rien « en création »), puis rouverte : elle existe.
    annulerFormProduction();
    await afficherTableauProductions();
    await afficherToutesLesProductionsParType();
    await mettreAJourPonderationTotale();
    if (typeof window.chargerProductionsDansSelect === 'function') window.chargerProductionsDansSelect();
    if (typeof window.rechargerFiltreProduction === 'function') window.rechargerFiltreProduction();

    // #626 (31 août 2026) — fusion des couches d'override (constat M4). Ce
    // rafraîchissement de la barre latérale vivait dans un wrapper posé en fin de
    // fichier, qui rappelait la fonction ci-dessus puis l'ajoutait. Une seule
    // couche désormais ; l'ordre des deux gestes est inchangé.
    await afficherListeProductions();
    // 🆕 BETA 95.1 : la production reste visible, ouverte comme une fiche existante
    // (Dupliquer, Supprimer, « Fermer »).
    if (typeof window.chargerProductionPourModif === 'function') {
        await window.chargerProductionPourModif(productionData.id);
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

    let statutApres = null;
    let idsAuMomentDuRefus = null;
    await db.modifier(getCleProductions(), (lues) => {
        const evaluations = lues || [];
        const index = evaluations.findIndex(e => e.id === id);
        if (index === -1) {
            // Relevé pour le message de refus : la liste telle qu'elle était à
            // l'instant du refus, pas celle d'avant.
            idsAuMomentDuRefus = evaluations.map(e => ({ id: e.id, titre: e.titre }));
            return undefined;
        }

        evaluations[index].verrouille = !evaluations[index].verrouille;
        statutApres = evaluations[index].verrouille;
        return evaluations;
    }, []);

    if (statutApres !== null) {
        await afficherTableauProductions();
        await afficherToutesLesProductionsParType();

        // Notification de succès. ⚠ Le statut vient du MUTATEUR : la collection
        // lue n'existe plus ici, et c'est voulu — l'état annoncé est celui qui
        // a réellement été écrit, pas celui d'un instantané d'avant.
        const statut = statutApres ? 'verrouillée' : 'déverrouillée';
        notifications.succes(`Production ${statut}`);
    } else {
        // Si l'évaluation n'est pas trouvée, afficher une erreur
        console.error('❌ Production non trouvée!');
        console.error('ID recherché:', id);
        console.error('IDs disponibles:', idsAuMomentDuRefus);

        notifications.erreur('Évaluation introuvable', `ID: ${id}`);
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
 * - Chevron « monter » dans la liste
 * 
 * FONCTIONNEMENT:
 * 1. Charge la liste des productions
 * 2. Trouve l'index de la production
 * 3. Si pas en première position : échange avec la précédente
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'affichage
 */
async function monterEvaluation(id) {
    let deplacee = false;
    await db.modifier(getCleProductions(), (lues) => {
        const evaluations = lues || [];
        const index = evaluations.findIndex(e => e.id === id);
        if (index <= 0) return undefined;

        [evaluations[index - 1], evaluations[index]] = [evaluations[index], evaluations[index - 1]];
        deplacee = true;
        return evaluations;
    }, []);
    if (deplacee && window.annoncerEcritureUsager) window.annoncerEcritureUsager(getCleProductions());   // lot F : geste hors témoin (monterEvaluation)

    if (deplacee) {
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
 * - Chevron « descendre » dans la liste
 * 
 * FONCTIONNEMENT:
 * 1. Charge la liste des productions
 * 2. Trouve l'index de la production
 * 3. Si pas en dernière position : échange avec la suivante
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'affichage
 */
async function descendreEvaluation(id) {
    let deplacee = false;
    const ecritLotF = await db.modifier(getCleProductions(), (lues) => {
        const evaluations = lues || [];
        const index = evaluations.findIndex(e => e.id === id);

        // ⚠ `index === -1` PASSAIT ce test : la condition `index < length - 1`
        // est vraie pour -1. L'échange écrivait alors `evaluations[0] = undefined`
        // et l'enregistrait. Non atteignable depuis les chevrons (l'id vient de
        // la ligne affichée), donc latent — mais destructeur. Fermé ici.
        if (index === -1 || index >= evaluations.length - 1) return undefined;

        [evaluations[index], evaluations[index + 1]] = [evaluations[index + 1], evaluations[index]];
        deplacee = true;
        return evaluations;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(getCleProductions());   // lot F : geste hors témoin (descendreEvaluation)

    if (deplacee) {
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
        'artefact-portfolio': '<strong>Artefact :</strong> Production ciblée sur une tâche de nature variée et rattachée au portfolio.<br><br>Les artefacts n\'ont pas de pondération propre. C\'est le portfolio conteneur qui définit la pondération globale.<br><br><em>Pour paramétrer la valeur des artefacts, allez dans « Structure des évaluations » dans les Pratiques de notation.</em>',
        'terminale': '<strong>Évaluation terminale :</strong> Production qui clôt la session et qui s\'ajoute au portfolio dans le calcul de la note finale. Sa pondération est explicite (par exemple 40 %) et elle se combine au portfolio (par exemple 60 %) pour produire la note finale.<br><br>Une seule production de ce type par trimestre.'
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
        // u-hide est posé par le type artefact ; style.display ne peut pas
        // l'annuler (u-hide est !important), il faut retirer la classe.
        groupePonderation.classList.remove('u-hide');
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
        noteExplicativeDateEcheance.innerHTML = 'Cette date fixe les indices <strong>C</strong> (Complétion) et <strong>P</strong> (Performance) pour les suivis longitudinaux. Facultative, et posable d\'avance : elle ne compte qu\'une fois les consignes transmises.';
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
            <input type="checkbox" name="artefactPortfolio" value="${echapperHtml(art.id)}"
                   class="u-mr-10">
            <strong>${echapperHtml(art.description || art.titre)}</strong>
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
        statut.innerHTML = '<span class="icone-inline icone-inline--check" aria-hidden="true"></span>Pondération correcte';
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
    // Libellé de LECTURE (cf. TYPES_PRODUCTION) : `libelleLong` s'il existe,
    // `libelle` sinon, préfixe d'affichage compris. Les quatre types qui
    // manquaient à l'ancienne table locale — laboratoire, entrevue, projet,
    // stage — cessent du même coup de s'afficher en identifiant brut.
    const t = typeProduction(type);
    if (!t) return type;  // Type inconnu : on rend l'entrée telle quelle.
    return (t.prefixeAffichage || '') + (t.libelleLong || t.libelle);
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
    const grilles = await db.get(cle('grillesTemplates')) || [];

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
                                ${prod.objectif ? `<span class="icone-info-aide taille-inline" aria-hidden="true"></span> ${echapperHtml(prod.objectif)}` : ''}
                                ${prod.objectif && prod.tache ? ' • ' : ''}
                                ${prod.tache ? `✏️ ${echapperHtml(prod.tache)}` : ''}
                            </div>
                        ` : ''}
                    </div>
                    <div style="white-space: nowrap; margin-left: 15px;">
                        ${window.boutonsReordonnerBloc({
                            actionHaut: 'monterEvaluation', actionBas: 'descendreEvaluation',
                            param: prod.id, premier: index === 0,
                            dernier: index === total - 1, quoi: 'cette production'
                        })}
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
                        <button class="btn btn-confirmer u-mt-10" data-action="ajouterProductionAuType" data-param="portfolio">
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
                    <button class="btn btn-confirmer u-mt-10" data-action="ajouterProductionAuType" data-param="examen">
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
                    <button class="btn btn-confirmer u-mt-10" data-action="ajouterProductionAuType" data-param="examen-formatif">
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

    await db.modifier(getCleProductions(), (lues) => {
        const productions = lues || [];

        let nbMigrees = 0;
        productions.forEach(prod => {
            if (prod.dansBibliotheque === undefined) {
                prod.dansBibliotheque = true;
                nbMigrees++;
            }
        });

        // Rien à migrer : le mutateur rend `undefined`, aucune écriture.
        if (nbMigrees === 0) return undefined;
        return productions;
    }, []);
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
   EXPORT DES FONCTIONS GLOBALES
   =============================== */

window.afficherTableauProductions = afficherTableauProductions;
window.afficherToutesLesProductionsParType = afficherToutesLesProductionsParType;
window.ajouterProductionAuType = ajouterProductionAuType;
window.afficherFormProduction = afficherFormProduction;
window.sauvegarderProduction = sauvegarderProduction;
// Lot E3 (D3) : créer ou modifier.
window.enregistrerProductionModifiee = enregistrerProductionModifiee;
window.marquerConsignesTransmises = marquerConsignesTransmises;
window.surChangementFormulaireProduction = surChangementFormulaireProduction;
window.fermerFicheProduction = fermerFicheProduction;
window.rendreModeFicheProduction = rendreModeFicheProduction;
window.productionEnCreationSaisie = productionEnCreationSaisie;
window.raisonChampsObligatoiresProduction = raisonChampsObligatoiresProduction;
brancherEnregistrementProduction();
// #468/CO-17 : exportée pour la sentinelle (création vs modification).
window.construireProductionData = construireProductionData;
// #468/CO-17 : exportée pour la sentinelle ET pour creerNouvelleProduction
// (productions-liste.js), qui doit remettre le bloc d'échéances à neuf.
window.peuplerEcheancesParGroupe = peuplerEcheancesParGroupe;
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
window.TYPES_PRODUCTION = TYPES_PRODUCTION;                                 // 25 août 2026 — table unique des types (sélecteurs, sentinelle)
window.typeProduction = typeProduction;
window.typePorteSaPonderation = typePorteSaPonderation;
window.gererPortfolio = gererPortfolio;
window.initialiserModuleProductions = initialiserModuleProductions;
window.getCleProductions = getCleProductions; // Exposé pour sous-module productions-import-export.js
window.poserReferenceSelect = poserReferenceSelect; // #453 §3 — exposé pour la sentinelle (tests/unit)

// Export/Import avec licence CC → extraits dans productions-import-export.js (refactor 16 mai 2026)
// Sidebar + CRUD utilisateur → extraits dans productions-liste.js (refactor 16 mai 2026)

window.chargerGrillesDisponiblesPourProduction = chargerGrillesDisponiblesPourProduction;

// Gestionnaire de bibliothèque (UI) → extrait dans productions-bibliotheque-ui.js (refactor 16 mai 2026)
// 🆕 Beta 95.4 : Assistant de migration des catégories → extrait dans productions-import-export.js (refactor 16 mai 2026)

// 🆕 Beta 98.3 : Échéances par groupe-cours
window.obtenirEcheanceEffective = obtenirEcheanceEffective;
window.obtenirEcheancePlusTot = obtenirEcheancePlusTot;                     // #930 — le tri « échéance » de la barre latérale vit dans productions-liste.js ; sans cet export, ReferenceError depuis le 16 mai 2026
window.aucuneEcheanceAssignee = aucuneEcheanceAssignee;                    // #486 — badge « à planifier » + sentinelle (tests/unit)
window.datesSeancesDeLaSemaine = datesSeancesDeLaSemaine;                   // #493 — la liste unique (rang ⇄ date)
window.dateSeanceDuRang = dateSeanceDuRang;                                 // #493 — « semaine 4, séance B » → « mardi 17 février »
window.dateEcheanceProposeeParLaCarte = dateEcheanceProposeeParLaCarte;     // #493 — ce que la carte propose, par groupe
window.datesDeLaSemaineDansTable = datesDeLaSemaineDansTable;               // #493 — filtre d'une table horaire par semaine
window.brancherPropositionDeLaCarte = brancherPropositionDeLaCarte;         // #493 — le geste : proposer sans écraser
window.valeurChampGabarit = valeurChampGabarit;                             // #500 — un champ rendu peut ne pas être là
window.poserValeurChampGabarit = poserValeurChampGabarit;
window.ajouterChampPersonnalise = ajouterChampPersonnalise;
window.deplacerBlocConsigne = deplacerBlocConsigne;
window.deplacerBlocConsigneHaut = deplacerBlocConsigneHaut;
window.deplacerBlocConsigneBas = deplacerBlocConsigneBas;                         // #500 — ancrés et libres se déplacent ensemble
window.peuplerBlocsConsignes = peuplerBlocsConsignes;
window.lireBlocsConsignesDepuisFormulaire = lireBlocsConsignesDepuisFormulaire;
window.titresBlocsAEnregistrer = titresBlocsAEnregistrer;
window.ordreBlocsAEnregistrer = ordreBlocsAEnregistrer;
window.titreBlocAncre = titreBlocAncre;
window.ordreBlocsConsignes = ordreBlocsConsignes;
window.BLOCS_ANCRES = BLOCS_ANCRES;                 // #499 — bouton « + Nouveau champ »
window.supprimerChampPersonnalise = supprimerChampPersonnalise;
window.deplacerChampPersonnalise = deplacerChampPersonnalise;
window.peuplerChampsPersonnalises = peuplerChampsPersonnalises;
window.champsPersonnalisesAEnregistrer = champsPersonnalisesAEnregistrer;
window.validerBlocsNommes = validerBlocsNommes;                              // #518
window.lireChampsPersonnalisesDepuisFormulaire = lireChampsPersonnalisesDepuisFormulaire;
window.poserCaseAssignationSimple = poserCaseAssignationSimple;             // #494 — « consignes transmises » en mode simple
window.lireEcheancesParGroupeDepuisFormulaire = lireEcheancesParGroupeDepuisFormulaire;   // #494 — sentinelle : l'écran et l'enregistrement disent la même chose
window.validerChampsObligatoiresProduction = validerChampsObligatoiresProduction; // #486 — exposé pour la sentinelle (tests/unit)
// #394 : avertissements de cohérence STD (fonction pure + rendu) et conversion
// par geste explicite (bouton « Typer comme terminale », dispatcher data-action)
window.validerProductionsStd = validerProductionsStd;
window.afficherAvertissementsProductions = afficherAvertissementsProductions;
window.typerProductionCommeTerminale = typerProductionCommeTerminale;

// Wrappers délégation (Phase 5) → extraits dans productions-import-export.js (refactor 16 mai 2026)

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
        grilles.map(g => `<option value="${echapperHtml(g.id)}">${echapperHtml(g.nom)}</option>`).join('');

    if (selectStandard) {
        selectStandard.innerHTML = optionsHtml;
    }

    if (selectInline) {
        selectInline.innerHTML = optionsHtml;
    }

    // Peupler aussi le select Échelle de performance. Le chemin « Nouvelle
    // production » (creerNouvelleProduction) n'appelait que les grilles, d'où
    // un select Échelle resté vide (seulement « Aucune »).
    await peuplerEchellesProduction();

    // Cartouches : dépendantes de la grille sélectionnée. Le chemin « Nouvelle
    // production » n'attachait pas le repeuplement au changement de grille (il
    // ne vivait que dans afficherFormProduction) → cartouches inertes. On
    // (ré)attache via onchange (idempotent, productionGrille n'a pas d'autre
    // handler de changement) + peuplement initial selon la grille courante.
    if (selectStandard) {
        selectStandard.onchange = function() { peuplerCartouchesProduction(selectStandard.value); };
        await peuplerCartouchesProduction(selectStandard.value);
    }
}

/**
 * Peuple le select « Échelle de performance » du formulaire de production.
 * Les échelles sont stockées globalement (`echellesTemplates`), comme dans la
 * biblio Échelles — pas de namespace de trimestre (contrairement aux grilles).
 */
async function peuplerEchellesProduction() {
    const selectEchelle = document.getElementById('productionEchelle');
    if (!selectEchelle) return;
    const echelles = await db.get(cle('echellesTemplates')) || [];
    selectEchelle.innerHTML = '<option value="">Aucune</option>' +
        echelles.map(e => `<option value="${echapperHtml(e.id)}">${echapperHtml(e.nom)}</option>`).join('');
}


/**
 * Adapte la fonction annulerFormProduction pour le nouveau layout
 *
 * ⚠ #633 — CETTE COUCHE RESTE, ET C'EST DÉLIBÉRÉ. #626 a fusionné les deux
 * autres couches d'override de ce fichier (constat M4) mais PAS celle-ci : ses
 * deux corps sont vivants, pas un seul. Ce wrapper est atteint depuis `window`
 * (data-action « annulerFormProduction », productions-liste.js) ; la fonction
 * plus haut est atteinte depuis l'IIFE (fin de `sauvegarderProduction`, et le
 * `supprimerProduction` ci-dessous), où le nom résout vers le module, pas vers
 * `window`. Les deux corps DIFFÈRENT : celui-ci ne remet pas `productionEnEdition`
 * à null, l'autre ne touche ni les options, ni l'accueil, ni le surlignage.
 * Fusionner change quatre sites d'appel et répare au passage un défaut latent
 * (le surlignage de la barre latérale survit à la suppression de la production
 * affichée) : c'est un changement de comportement, il demande son propre item et
 * un test manuel. Ne pas le faire ici.
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
};

/**
 * Supprime une production après confirmation.
 *
 * ⚠ NE PAS RENOMMER - Référencé dans noms_stables.json
 *
 * UTILISÉ PAR : bouton « Supprimer » de la liste (data-action).
 *
 * #626 (31 août 2026) — couche unique (constat M4). Il existait plus haut dans
 * ce fichier une SECONDE définition, plus ancienne, que ce bloc écrasait sur
 * `window` sans jamais l'appeler : elle filtrait la collection HORS de la file,
 * c'est-à-dire le motif que #522 a précisément retiré. C'est elle qui est
 * partie ; la version dans la file est celle qui reste.
 */
async function supprimerProduction(id) {
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('production'))) return;
    if (!confirm('Supprimer cette production ?')) return;

    // ⚠ L'index est recalculé DANS la file : celui d'avant la confirmation ne
    // vaut plus rien.
    let supprimee = false;
    const ecritLotF = await db.modifier(getCleProductions(), (lues) => {
        const productions = lues || [];
        const index = productions.findIndex(p => p.id === id);
        if (index === -1) return undefined;

        productions.splice(index, 1);
        supprimee = true;
        return productions;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(getCleProductions());   // lot F : geste hors témoin (supprimerProduction)

    if (!supprimee) return;

    // Recharger la sidebar
    await afficherListeProductions();

    // Masquer le formulaire si c'était la production affichée
    if (productionEnEdition === id) {
        annulerFormProduction();
    }

    notifications.succes('Production supprimée');
}


})();
