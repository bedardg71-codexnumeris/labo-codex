/* ===============================
   MODULE EVALUATION-RETROACTION — Génération + UI rétroaction

   Extrait de js/evaluation.js (session B étape 3 refactor evaluation,
   2026-05-18 — beta 99.48). Deux blocs combinés :
     · Block A (résidu L60-301) : génération de rétroaction + compteur mots
       (genererRetroaction cyc 61, regenererRetroactionAvecFeedback,
       afficherNotifRetro, mettreAJourCompteurMots, addEventListener
       'input' top-level pour le compteur).
     · Block B (résidu L1334-1733) : copie + bascule de vues + bilan
       (copierRetroaction, basculerVueRetroaction, genererRetroaction
       Specifique, genererRetroactionBilan cyc 75 PRIVÉE, copierTout
       Retroaction, sauvegarderRetroactionFinale).

   10 fonctions migrées :
     · genererRetroaction (cyc 61 — exporté window.genererRetroaction)
     · regenererRetroactionAvecFeedback (exporté dispersé d'origine L282)
     · afficherNotifRetro (privée — helper feedback visuel)
     · mettreAJourCompteurMots (PROMOTION §5.6 — appelée depuis le résidu
       verifierEtChargerEvaluationExistante L2913 d'origine)
     · copierRetroaction (exporté window.copierRetroaction — callers
       cross-module : travaux-ui.js:4585)
     · basculerVueRetroaction (exporté — callers cross-module : travaux-
       ui.js:4556)
     · genererRetroactionSpecifique (privée — appelée intra-IIFE)
     · genererRetroactionBilan (cyc 75 → cyc ≤ 30 PRIVÉE — éclatée étape 4
       le 18 mai 2026 en 10 helpers privés : _chargerHistoriqueBilan,
       _chargerGrilleDefBilan, _collecterCriteresBilan, _detecterPatrons
       RecurrentsBilan, _compterErreursFrancaisBilan, _detecterAlgoA0Bilan,
       _rendreAlgoA0Bilan, _rendreDefisBilan, _rendreTousMaitrisesBilan,
       _rendreForceBilan, _rendreRecurrentsBilan, _rendreJetonsBilan +
       + 2 constantes module-scope _NOMS_NIV_BILAN, _ORDRE_NIV_BILAN —
       RETIRÉES le 28 août 2026 par #575, remplacées par les trois helpers
       _lecteurNiveauBilan / _rangBilan / _nomBilan, qui lisent l'échelle)
     · copierToutRetroaction (exporté — callers cross-module : travaux-
       ui.js:4572)
     · sauvegarderRetroactionFinale (privée — 3 LOC, comportementalement
       no-op, préservée)

   Variables module-scope encapsulées (anti-pattern §5.10) : aucune
   (toutes les locals sont à l'intérieur des function bodies).

   6 exports window.X :
     · window.genererRetroaction (préservé du bloc principal L5409)
     · window.regenererRetroactionAvecFeedback (préservé export dispersé L282)
     · window.copierRetroaction (préservé du bloc principal L5410)
     · window.basculerVueRetroaction (préservé du bloc principal L5411)
     · window.copierToutRetroaction (préservé du bloc principal L5412)
     · window.mettreAJourCompteurMots (PROMOTION §5.6 nouvelle — 1 site
       résidu : verifierEtChargerEvaluationExistante)

   NON exportées (préservation comportementale stricte) :
     · afficherNotifRetro : helper interne feedback visuel UI uniquement
     · genererRetroactionSpecifique : helper interne UI vues retroaction
     · genererRetroactionBilan : helper interne UI vues retroaction (cyc 75)
     · sauvegarderRetroactionFinale : 3 LOC no-op préservé tel quel

   Side-effect top-level IIFE préservé :
     · `document.addEventListener('DOMContentLoaded', function() { ... })`
       enregistre `mettreAJourCompteurMots` sur l'événement 'input' du
       textarea. Pattern symétrique au side-effect chargement.js (Écart
       #4 §2.1 session A). Pré-peuplé dans le test sandbox via le
       fauxDocument du helper chargerScript.

   Migration Cat-B Track 4 chantier E (21 mai 2026) :
     · 2 sites `_notifSucces(...)` → `notifications.succes(...)` (API
       unifiée utils-notifications.js). Wrapper local `_notifSucces` retiré.

   Helpers cross-module consommés (script-scope globaux, bare access OK) :
     · evaluationEnCours (let global config.js L145)
     · db.getSync (db.js global)
     · echapperHtml (config.js global) — ⚠ cette ligne annonçait « 0 usage
       ici car aucun innerHTML interpole » : c'était FAUX au moins depuis
       l'origine (les noms de critères, de tampons et de cartouches viennent
       de l'utilisateur et traversent `innerHTML` sans échappement). #575 en
       échappe TROIS sur les lignes qu'il réécrit — le nom d'un niveau et les
       deux noms de critères du bilan. Les autres restent à traiter ; ne pas
       recopier l'affirmation d'origine.
     · obtenirDonneesSelonMode (donnees-v2.js)
     · obtenirConfigJetons (jetons module)
     · travauxVisionneuse, travauxStockage, travauxOutils, travauxExportPDF
       (modules travaux-* — accédés via typeof === 'undefined' guards)

   Chargé ENTRE evaluation-calcul.js et evaluation.js dans index.html
   (même position que -calcul.js — entre chargement et résidu). Les
   exports window.X sont consommés :
     · 4 sites résidu pour window.genererRetroaction (1 changerEchelle
       Evaluation, 1 confirmerSuppressionEvaluationSidebar, 2 verifierEt
       ChargerEvaluationExistante)
     · 1 site résidu pour window.mettreAJourCompteurMots
       (verifierEtChargerEvaluationExistante L2913 d'origine)
     · 3 sites travaux-ui.js (déjà via window.* via bare global lookup)
     · 3 sites evaluation-calcul.js (déjà via window.genererRetroaction
       depuis session B 1er sous-module)

   Bugs latents préservés (Cat-B post-merge — voir SUIVI-BUGS) :
     · sauvegarderRetroactionFinale 3 LOC no-op (aucun appelant — dead
       code apparent, préservation stricte)
   =============================== */

(function() {
'use strict';

/**
 * Génère la rétroaction finale automatiquement
 *
 * FONCTIONNEMENT:
 * 1. Vérifie les options cochées
 * 2. Récupère les infos de la production
 * 3. Assemble le texte de rétroaction
 * 4. Ajoute l'adresse personnalisée si cochée
 * 5. Ajoute le contexte de la cartouche si coché
 * 6. Ajoute les commentaires des critères évalués
 *
 * UTILISÉ PAR:
 * - niveauSelectionne() (en temps réel)
 * - onchange sur les checkboxes d'options
 */
// Helpers privés _Retro* (extraction étape 4 — éclatement cyc 61 → cyc ≤ 15)

function _rendreOptionsProduction(production) {
    let texte = '';
    if (document.getElementById('afficherDescription1')?.checked && (production?.activiteApprentissage || production?.description)) {
        texte += `Production : ${production?.activiteApprentissage || production?.description}\n`;
    }
    if (document.getElementById('afficherObjectif1')?.checked && production?.objectif) {
        texte += `Objectif : ${production.objectif}\n`;
    }
    if (document.getElementById('afficherTache1')?.checked && production?.tache) {
        texte += `Tâche : ${production.tache}\n`;
    }
    return texte;
}

function _rendreAdresseEtudiant() {
    if (!document.getElementById('afficherAdresse1')?.checked) return '';
    const etudiantDA = evaluationEnCours.etudiantDA;
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiant = etudiants.find(e => e.da === etudiantDA);
    // Utiliser prenom qui sera soit le vrai nom en mode normal, soit "Élève X" en mode anonymisation
    return etudiant ? `\nBonjour ${etudiant.prenom} !\n\n` : '';
}

function _rendreCommentairesCriteres(grille, cartouche, critereActifId, texteAvant) {
    let texte = '';
    let positionCritereActif = -1;
    if (!grille) return { texte, positionCritereActif };

    grille.criteres.forEach((critere, index) => {
        const niveau = evaluationEnCours.criteres[critere.id];
        if (!niveau) return;

        // Marquer la position du critère actif avant d'ajouter le texte
        if (critere.id === critereActifId) {
            positionCritereActif = texteAvant.length + texte.length;
        }

        // Lot 3 (4 sept. 2026) — CE QUE L'ÉLÈVE LIT D'UN CRITÈRE ANALYTIQUE : LE CHIFFRE,
        // rien d'autre (décision de Grégoire). Ce texte part chez l'élève (LÉA) : l'en-tête
        // dit « 24 / 30 », pas le niveau déduit — qui, lui, a choisi le commentaire.
        const ptsAnalytiques = (critere.type === 'analytique' && evaluationEnCours.pointsAnalytiques)
            ? evaluationEnCours.pointsAnalytiques[critere.id] : undefined;
        const lectureNiveau = (typeof ptsAnalytiques === 'number' && !isNaN(ptsAnalytiques))
            ? `${ptsAnalytiques} / ${critere.ponderation}` : niveau;
        // Vérifier si c'est un critère algorithmique
        const enteteCritere = `Critère ${index + 1} (${critere.nom}) — ${lectureNiveau}`;
        // #939 (24 sept. 2026) — LA MÊME RÈGLE QUE LE PDF (`commentaireDuCritere`). Ce texte
        // lisait la cartouche VIVANTE et jamais le commentaire de la copie : une cartouche
        // retouchée après l'évaluation changeait ce que l'élève recevait, et un niveau sans
        // commentaire s'écrivait « [Non défini] ». Le commentaire de CETTE copie, à l'écran,
        // est le div `comm_<critereId>` — celui que les collecteurs enregistrent, rempli depuis
        // l'évaluation enregistrée à la réouverture (`_afficherCommentaireCritere`) : il vaut
        // avant comme après l'auto-save. Sans commentaire, l'en-tête seul (#764).
        const commDiv = document.getElementById(`comm_${critere.id}`);
        const commentaire = window.syntheseRetroactionData.commentaireDuCritere({
            enregistre: commDiv ? commDiv.textContent : '',
            algorithmique: critere.type === 'algorithmique' ? evaluationEnCours.donneesAlgorithmiques?.[critere.id]?.retroaction : '',
            cartouche, critereId: critere.id, niveau
        });
        texte += commentaire ? `${enteteCritere}\n${commentaire}\n\n` : `${enteteCritere}\n\n`;
    });

    return { texte, positionCritereActif };
}

function _rendreObservationsAnnotations(statsAnnot) {
    // #760 (24 sept. 2026) — les mêmes tampons que la spécifique, dans le même ordre,
    // sous les mêmes titres, lus dans les réglages actuels (`observationsDesTampons`).
    // Le filtre d'hier (neuf identifiants hérités) ne laissait passer aucun tampon du
    // catalogue courant : le bloc ne s'écrivait jamais.
    const categories = travauxOutils.observationsDesTampons(statsAnnot.tampons);
    if (categories.length === 0) return '';
    let texte = '--- Observations ---\n\n';
    categories.forEach(cat => {
        texte += `${cat.nom}\n`;
        cat.tampons.forEach(t => {
            texte += t.texte ? `${t.nom} (×${t.nombre}) :\n${t.texte}\n` : `${t.nom} (×${t.nombre})\n`;
        });
        texte += '\n';
    });
    return texte;
}

function _rendreErreursFrancaisAnnotations(statsAnnot) {
    if (statsAnnot.totalErreursFr <= 0) return '';
    // 3 sept. 2026 — numéro, nom et texte viennent de la liste de la grille de
    // l'évaluation (ou du repli, à l'identique) : `codesAnnotation`. L'ordre est
    // celui de la liste ; un identifiant qu'elle ne connaît pas passe après,
    // trié par son numéro, et n'est jamais tu.
    const grilleDef = _chargerGrilleDefBilan(
        (typeof evaluationEnCours !== 'undefined' && evaluationEnCours) ? evaluationEnCours.grilleId : null);
    const liste = window.codesAnnotation.listeCodes(grilleDef);
    const rang = (id) => { const i = liste.findIndex(t => t.id === id); return i === -1 ? Infinity : i; };
    const typesTriés = Object.entries(statsAnnot.erreursFr).sort((a, b) => {
        const ra = rang(a[0]), rb = rang(b[0]);
        if (ra !== rb) return ra - rb;
        return parseInt(a[0].replace('errfr_', ''), 10) - parseInt(b[0].replace('errfr_', ''), 10);
    });
    let texte = '--- Langue ---\n\n';
    for (const [type, count] of typesTriés) {
        const t = window.codesAnnotation.code(grilleDef, type);
        if (t.retroaction) texte += `Code ${t.numero} – ${t.nom} (×${count}) :\n${t.retroaction}\n\n`;
    }
    return texte;
}

function _rendreAnnotationsVisuelles() {
    const fichierActuel = (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getFichierActuel)
        ? travauxVisionneuse.getFichierActuel() : null;
    if (!fichierActuel) return '';
    const annotationFichier = (typeof travauxStockage !== 'undefined')
        ? travauxStockage.obtenirAnnotationFichier(fichierActuel.id) : null;
    if (!annotationFichier) return '';
    const statsAnnot = (typeof travauxExportPDF !== 'undefined' && travauxExportPDF.compterAnnotationsDetailees)
        ? travauxExportPDF.compterAnnotationsDetailees(annotationFichier) : null;
    if (!statsAnnot) return '';
    return _rendreObservationsAnnotations(statsAnnot) + _rendreErreursFrancaisAnnotations(statsAnnot);
}

function _rendreNoteFinale() {
    const modeNote = document.querySelector('input[name="affichageNote1"]:checked')?.value || 'complet';
    if (modeNote === 'lettre') {
        if (evaluationEnCours.niveauFinal && evaluationEnCours.niveauFinal !== '--') {
            return `---\nNiveau de performance : ${evaluationEnCours.niveauFinal}`;
        }
        return '';
    }
    let texte = '';
    // #757 (6 sept. 2026) — L'ÉCRAN PORTE DÉJÀ L'UNITÉ : `calculerNote` écrit « 63.5 % »
    // (evaluation-calcul.js l. 1404). Cette ligne lui ajoutait un second « % », et l'élève
    // lisait « Note finale : 63.5 %% » dans ce qui lui était collé (mesuré le 6 sept. au
    // matin, Rapports/MESURE-ce-que-l-eleve-lit-dans-le-pdf-2026-09-06.md, C1). Ce que
    // l'écran affiche part tel quel ; le « -- » d'une portée incomplète n'écrit rien, comme
    // avant. (Une copie sans aucun niveau affiche « 0.0 % » à l'écran, donc ici aussi :
    // c'est le choix de l'écran, pas celui de cette ligne.)
    const noteAffichee = (document.getElementById('noteProduction1')?.textContent || '').trim();
    if (noteAffichee && noteAffichee !== '--') {
        texte += `---\nNote finale : ${noteAffichee}`;
    }
    if (evaluationEnCours.niveauFinal && evaluationEnCours.niveauFinal !== '--') {
        texte += `  |  Niveau : ${evaluationEnCours.niveauFinal}`;
    }
    return texte;
}

function genererRetroaction(num) {
    // #764 (6 sept. 2026) — LA GÉNÉRALE S'ÉCRIT AVEC OU SANS CARTOUCHE. Elle sortait dès que
    // `cartoucheId` était vide : née cartouche, elle ignorait que la rétroaction d'un critère
    // algorithmique (le paragraphe engendré au calcul), le décompte des codes « --- Langue --- »
    // et la ligne « Note finale » n'en ont pas besoin. Sur la grille de Grégoire (un seul critère,
    // « Français écrit », algorithmique, sans cartouche), « Copier tout » ne livrait donc que la
    // spécifique et le bilan — « le texte est incomplet » (BUG_grégoire_2026-09-06_08-54-01, la
    // zone « Générale » encore sur son texte d'attente). La cartouche n'apporte que son contexte
    // et ses commentaires : sans elle, ils manquent, le reste s'écrit.
    const zoneRetroaction = document.getElementById('retroactionFinale1');
    if (!zoneRetroaction) return;
    if (!evaluationEnCours || !evaluationEnCours.grilleId) {
        zoneRetroaction.value = '';
        return;
    }

    const grilleId = evaluationEnCours.grilleId;
    const cartouches = evaluationEnCours.cartoucheId ? (db.getSync(cle(`cartouches_${grilleId}`), []) || []) : [];
    const cartouche = cartouches.find(c => c.id === evaluationEnCours.cartoucheId) || null;

    const productions = obtenirDonneesSelonMode('productions');
    const production = productions.find(p => p.id === evaluationEnCours.productionId);

    let texte = '';
    texte += _rendreOptionsProduction(production);
    texte += _rendreAdresseEtudiant();

    // Contexte de la cartouche
    if (document.getElementById('afficherContexte1')?.checked && cartouche && cartouche.contexte) {
        texte += `${cartouche.contexte}\n\n`;
    }

    // Commentaires des critères
    texte += 'Voici quelques observations :\n\n';
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(g => g.id === grilleId);
    const critereActifId = evaluationEnCours._dernierCritereModifie || null;
    const { texte: texteCriteres, positionCritereActif } = _rendreCommentairesCriteres(grille, cartouche, critereActifId, texte);
    texte += texteCriteres;

    // Rétroactions des annotations visuelles (tampons diagnostiques + erreurs de français)
    texte += _rendreAnnotationsVisuelles();

    // Ajouter la note/niveau à la fin selon le mode choisi
    texte += _rendreNoteFinale();

    const textarea = document.getElementById('retroactionFinale1');
    textarea.value = texte.trim();
    mettreAJourCompteurMots();

    // Auto-scroll vers le critère modifié
    if (positionCritereActif >= 0) {
        // Estimer la position de scroll basée sur la proportion du texte
        const ratio = positionCritereActif / Math.max(texte.length, 1);
        textarea.scrollTop = ratio * textarea.scrollHeight;
    }
}

/**
 * Régénère la rétroaction avec feedback visuel (avant/après)
 */
function regenererRetroactionAvecFeedback() {
    const textarea = document.getElementById('retroactionFinale1');
    if (!textarea) return;

    const ancienTexte = textarea.value;
    const ancienMots = ancienTexte.trim().length === 0 ? 0 : ancienTexte.trim().split(/\s+/).length;

    genererRetroaction(1);

    const nouveauTexte = textarea.value;
    const nouveauMots = nouveauTexte.trim().length === 0 ? 0 : nouveauTexte.trim().split(/\s+/).length;

    // Feedback visuel : flash du textarea
    textarea.style.transition = 'box-shadow 0.3s';
    const identique = ancienTexte === nouveauTexte;

    if (identique) {
        textarea.style.boxShadow = '0 0 0 2px var(--gris-moyen)';
        afficherNotifRetro('Rétroaction identique — aucun changement détecté');
    } else {
        textarea.style.boxShadow = '0 0 0 2px var(--vert-principal)';
        const diff = nouveauMots - ancienMots;
        const signe = diff > 0 ? '+' : '';
        afficherNotifRetro('Rétroaction régénérée (' + signe + diff + ' mots)');
    }

    setTimeout(() => { textarea.style.boxShadow = ''; }, 1500);
}

function afficherNotifRetro(message) {
    const compteur = document.getElementById('compteur-mots-retro');
    if (!compteur) return;
    const original = compteur.textContent;
    compteur.textContent = message;
    compteur.style.color = 'var(--vert-principal)';
    setTimeout(() => {
        mettreAJourCompteurMots();
        compteur.style.color = 'var(--gris-moyen)';
    }, 2500);
}

/* ===============================
   COMPTEUR DE MOTS RÉTROACTION
   =============================== */

function mettreAJourCompteurMots() {
    const textarea = document.getElementById('retroactionFinale1');
    const compteur = document.getElementById('compteur-mots-retro');
    if (!textarea || !compteur) return;
    const texte = textarea.value.trim();
    const nbMots = texte.length === 0 ? 0 : texte.split(/\s+/).length;
    compteur.textContent = nbMots + ' ' + pluriel(nbMots, 'mot', 'mots');
}

// Écouter la saisie manuelle dans le textarea
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('retroactionFinale1');
    if (textarea) textarea.addEventListener('input', mettreAJourCompteurMots);
});

/**
 * #759 (24 sept. 2026) — Le texte d'une vue (spécifique, bilan) tel que l'écran le
 * sépare : un saut de ligne entre deux blocs (paragraphe, titre, item), une ligne
 * blanche avant un titre. Le `textContent` d'hier collait la fin d'une phrase au
 * début de la suivante (« …viens me voir.Selon toi… ») : le HTML est assemblé sans
 * blanc entre ses balises. Aucun mot ne change.
 *
 * Lit la chaîne `innerHTML` (aucun analyseur HTML, rien n'est réinjecté dans la page)
 * et décode les entités qu'`echapperHtml` et les gabarits y posent.
 * @param {string} html
 * @returns {string}
 */
function _texteSepareDuHtml(html) {
    return String(html == null ? '' : html)
        .replace(/\u0000/g, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<h[1-6][\s>]/gi, '\u0000$&')   // marque « ligne blanche avant un titre »
        .replace(/<\/?(p|h[1-6]|li|ul|ol|div|section|tr)(\s[^>]*)?>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;|&#160;/g, ' ')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#0*39;|&#x27;|&apos;/gi, "'")
        .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(parseInt(n, 10)))
        .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
        .replace(/&amp;/g, '&')
        .split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim()).join('\n')
        .replace(/\n{2,}/g, '\n')
        .replace(/\n?\u0000\n?/g, '\n\n')
        .trim();
}

/**
 * Copie la rétroaction dans le presse-papier
 */
function copierRetroaction(num) {
    var texte = '';
    var vueGen = document.getElementById('vueRetroGenerale');
    var vueSpec = document.getElementById('vueRetroSpecifique');
    var vueBil = document.getElementById('vueRetroBilan');

    // Copier la vue active
    if (vueGen && !vueGen.classList.contains('u-hide')) {
        texte = (document.getElementById('retroactionFinale1') || {}).value || '';
    } else if (vueSpec && !vueSpec.classList.contains('u-hide')) {
        genererRetroactionSpecifique();
        texte = _texteSepareDuHtml((document.getElementById('contenuRetroSpecifique') || {}).innerHTML);
    } else if (vueBil && !vueBil.classList.contains('u-hide')) {
        genererRetroactionBilan();
        texte = _texteSepareDuHtml((document.getElementById('contenuRetroBilan') || {}).innerHTML);
    } else {
        texte = (document.getElementById('retroactionFinale1') || {}).value || '';
    }

    if (!texte || texte.trim() === '') {
        alert('Aucune rétroaction à copier');
        return;
    }

    navigator.clipboard.writeText(texte.trim()).then(function() {
        notifications.succes('Rétroaction copiée dans le presse-papier !');
    }).catch(function(err) {
        console.error('Erreur de copie:', err);
        alert('Erreur lors de la copie. Utilise Cmd+A puis Cmd+C manuellement.');
    });
}

/* ===============================
   VUES RÉTROACTION (Générale / Spécifique / Bilan)
   =============================== */

function basculerVueRetroaction(vue) {
    var vueGen = document.getElementById('vueRetroGenerale');
    var vueSpec = document.getElementById('vueRetroSpecifique');
    var vueBil = document.getElementById('vueRetroBilan');
    if (!vueGen || !vueSpec || !vueBil) return;

    vueGen.classList.toggle('u-hide', vue !== 'generale');
    vueSpec.classList.toggle('u-hide', vue !== 'specifique');
    vueBil.classList.toggle('u-hide', vue !== 'bilan');

    if (vue === 'specifique') genererRetroactionSpecifique();
    if (vue === 'bilan') genererRetroactionBilan();
}

function genererRetroactionSpecifique() {
    var conteneur = document.getElementById('contenuRetroSpecifique');
    if (!conteneur) return;

    var fichier = (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getFichierActuel)
        ? travauxVisionneuse.getFichierActuel() : null;
    if (!fichier) {
        conteneur.innerHTML = '<p class="eval-vide">Ouvre un fichier pour voir la rétroaction spécifique.</p>';
        return;
    }

    var annotation = (typeof travauxStockage !== 'undefined')
        ? travauxStockage.obtenirAnnotationFichier(fichier.id) : null;
    if (!annotation || !annotation.pages) {
        conteneur.innerHTML = '<p class="eval-vide">Aucune annotation sur ce fichier.</p>';
        return;
    }

    // Compter tampons et erreurs
    var tampons = {};
    var erreurs = {};
    var totalTampons = 0;
    var totalErreurs = 0;
    for (var pageId in annotation.pages) {
        var pg = annotation.pages[pageId];
        if (pg.stickers) {
            pg.stickers.forEach(function(stk) {
                tampons[stk.autocollantId] = (tampons[stk.autocollantId] || 0) + 1;
                totalTampons++;
            });
        }
        if (pg.shapes) {
            pg.shapes.forEach(function(f) {
                if (f.type && f.type.indexOf('errfr_') === 0) {
                    erreurs[f.type] = (erreurs[f.type] || 0) + 1;
                    totalErreurs++;
                }
            });
        }
    }

    var html = '';

    // Tampons par catégorie
    // #760 (24 sept. 2026) — lus dans les réglages actuels (`observationsDesTampons`),
    // comme le bloc « Observations » de la générale. Noms et textes sont des données
    // utilisateur posées dans innerHTML : échappés (règle 1).
    if (totalTampons > 0) {
        var ech760 = function(t) { return (typeof echapperHtml === 'function') ? echapperHtml(String(t == null ? '' : t)) : ''; };
        travauxOutils.observationsDesTampons(tampons).forEach(function(cat) {
            html += '<h5>' + ech760(cat.nom) + '</h5>';
            cat.tampons.forEach(function(t) {
                html += '<p><strong>' + ech760(t.nom) + '</strong> (' + t.nombre + ')'
                    + (t.texte ? ' — ' + ech760(t.texte) : '') + '</p>';
            });
        });
    }

    // Erreurs annotées sur la copie
    // #581 — le titre et l'état vide nommaient « français » à toute discipline.
    // Le nom vient du critère algorithmique de la grille ; l'état vide vient du
    // gabarit. Les deux sont des DONNÉES UTILISATEUR posées dans `innerHTML` :
    // `echapperHtml` n'est pas optionnel (règle 1 de `CLAUDE.md`).
    var ech581 = function(t) { return (typeof echapperHtml === 'function') ? echapperHtml(String(t == null ? '' : t)) : ''; };
    var grilleDef581 = _chargerGrilleDefBilan(
        (typeof evaluationEnCours !== 'undefined' && evaluationEnCours) ? evaluationEnCours.grilleId : null);
    // #686 — grille introuvable : le nom que l'évaluation enregistrée porte, plutôt que rien.
    var critereAlgo581 = window.enoncesAlgo.critereAlgorithmiqueOuNomme(grilleDef581,
        grilleDef581 ? null : _chargerEvaluationEnregistreeBilan(
            (typeof window.etatVivantEvaluationEnCours === 'function') ? window.etatVivantEvaluationEnCours() : window.evaluationEnCours));

    if (totalErreurs > 0) {
        var typesTriees = Object.keys(erreurs).sort(function(a, b) { return erreurs[b] - erreurs[a]; }).slice(0, 3);

        html += '<h5>' + ech581(window.enoncesAlgo.libelleCritere(critereAlgo581)) + ' (' + totalErreurs + ')</h5>';
        typesTriees.forEach(function(type) {
            // 3 sept. 2026 — nom et texte viennent de la liste de la grille (ou du
            // repli) : `codesAnnotation`. Le nom est une donnée utilisateur posée
            // dans innerHTML : échappé (règle 1), il ne l'était pas.
            var t = window.codesAnnotation.code(grilleDef581, type);
            // #764 (6 sept. 2026) — LE TEXTE ENTIER. Il était coupé à 120 caractères (« … minuscule,
            // sou ») : un aperçu d'écran, copié tel quel dans ce qui est remis à l'élève par « Copier
            // tout » — et visible coupé à l'écran aussi (capture de Grégoire). Le panneau défile.
            html += '<p><strong>' + ech581(t.nom) + '</strong> (' + erreurs[type] + ') — ' + ech581(t.retroaction || '') + '</p>';
        });
    }

    if (!html) {
        // #581 — HUITIÈME LITTÉRAL, absent de la liste des sept : la commande de
        // contrôle du mandat ne cherchait pas ce motif-là. Trouvé le 2 septembre
        // par `grep -nEi "français|francais"` sur les quatre fichiers.
        html = '<p class="eval-vide">' + ech581(window.enoncesAlgo.enonce(critereAlgo581, 'aucune', {})) + '</p>';
    }

    conteneur.innerHTML = html;
}

// #575 (lot 4 du plan SOLO, rapport §3 n° 10) — LES DEUX TABLES IDME SONT PARTIES.
//
//   var _NOMS_NIV_BILAN  = { E:'Étendu', M:'Maîtrisé', D:'En développement', I:'Incomplet' };
//   var _ORDRE_NIV_BILAN = { E:4, M:3, D:2, I:1 };
//
// Elles imposaient l'échelle de Grégoire au bilan que l'élève reçoit. Hors IDME,
// `_NOMS_NIV_BILAN[code]` rendait `''` — le niveau s'affichait entre parenthèses
// VIDES — et `_ORDRE_NIV_BILAN[code] || 0` rendait 0 à tout le monde : la ligne
// « Progrès : X → Y » ne pouvait donc JAMAIS apparaître, quelle que soit la
// progression réelle de l'élève.
//
// ⮕ Le nom et le rang d'un niveau se lisent maintenant dans SON échelle, par
// `niveauDuCodeDansEchelle` (`profil-etudiant-calculs.js`), qui résout par le
// chemin unique de #542 lot 3 — celui qui connaît aussi l'échelle embarquée
// d'une pratique configurable.
//
// ⮕ La MARQUE de maîtrise se lit elle aussi dans l'échelle depuis le lot 2 de
// #555 (`79d913f3`, 28 août 2026) : les huit sites passent par `zoneDuNiveau`
// (`_lecteurZoneBilan`). Ce module ne compare plus aucun code en toutes lettres ;
// l'essai « le compte est ZÉRO » de `sentinelle-575-ordre-niveaux-derive-echelle`
// le verrouille.

/**
 * Le niveau d'un code dans l'échelle du bilan en cours — nom et rang.
 * Rend `null` quand rien ne se résout : l'appelant n'affiche alors pas de
 * libellé et ne compare pas de rangs, plutôt que d'en inventer.
 */
function _lecteurNiveauBilan(echelleId) {
    return function (code) {
        return (typeof niveauDuCodeDansEchelle === 'function')
            ? niveauDuCodeDansEchelle(code, echelleId || null)
            : null;
    };
}

// ⮕ #575 B10 — `_memeEchelleBilan` A ÉTÉ EXTRAITE, pas supprimée. La règle
// « deux évaluations parlent-elles du même barème ? » vit maintenant dans
// `echellesComparables` (`profil-etudiant-calculs.js`), à côté des autres
// lecteurs d'échelle : la page de synthèse du PDF en a besoin du mot pour mot,
// et deux copies de cette règle auraient fini par diverger — c'est précisément
// ce que #555 constate ailleurs (`|| 0.70` ici, `|| 0.75` là). Les deux règles
// qu'elle applique restent celles d'`obtenirEchelleCommuneDesEvaluations`, et
// la correction de la porte terrain 2.7 est partie avec elle.


/**
 * La ZONE d'un code dans l'échelle du bilan — `'priorite'`, `'signale'`,
 * `'acquis'`, ou `null`.
 *
 * ⮕ #555 lot 2. Ce module testait les codes EN TOUTES LETTRES à sept endroits
 * (dix-huit comparaisons). `zoneDuNiveau` les remplace toutes, par la même
 * règle que le PDF de synthèse — et c'est OBLIGATOIRE qu'elle soit la même :
 * `copierToutRetroaction` copie le `textContent` de ce bilan sous
 * « === BILAN === » dans ce qui est remis à l'élève. Deux textes qui se
 * contredisent sur le même document seraient pires que l'un des deux.
 *
 * ⚠ `null` = « l'échelle ne dit pas ». L'appelant n'affiche alors rien plutôt
 * que de ranger l'élève dans une case au hasard.
 */
function _lecteurZoneBilan(echelleId) {
    return function (code) {
        return (typeof zoneDuNiveau === 'function')
            ? zoneDuNiveau(code, echelleId || null)
            : null;
    };
}

/** Le rang d'un code, ou `Infinity` : un niveau illisible se range en dernier. */
function _rangBilan(niveauDe, code) {
    var niveau = niveauDe(code);
    return (niveau && niveau.rang != null) ? niveau.rang : Infinity;
}

/**
 * Le nom d'un code, ou `''` quand l'échelle ne le nomme pas.
 *
 * ⚠ ÉCHAPPÉ ICI, ET C'EST OBLIGATOIRE. Les tables retirées ne contenaient que
 * des littéraux du code (« Étendu », « Maîtrisé ») : les poser dans un
 * `innerHTML` était sans risque. Le nom d'un niveau, lui, est SAISI PAR
 * L'UTILISATEUR — la règle n° 1 du projet s'applique dès qu'il traverse un
 * `innerHTML`, sans exception. Le point d'échappement est unique et au plus
 * près de la source, pour qu'aucun appelant n'ait à y penser.
 */
function _nomBilan(niveauDe, code) {
    var niveau = niveauDe(code);
    if (!niveau || !niveau.nom) return '';
    return (typeof echapperHtml === 'function') ? echapperHtml(niveau.nom) : '';
}

/**
 * L'historique de l'élève — ses AUTRES copies, la plus récente d'abord, cinq au plus.
 *
 * ⮕ #758 (6 sept. 2026) — LA COPIE EN COURS N'EN FAIT PAS PARTIE. Dès que l'auto-save
 * l'a écrite (1,5 s après le premier geste), elle était ici la plus récente des
 * évaluations de l'élève, donc sa propre « précédente » : « prioritaire depuis
 * 3 productions » avec un seul artefact antérieur, et plus jamais « Progrès » ni « Tu as
 * progressé ». Le PDF de synthèse l'excluait déjà (`lireHistorique`,
 * synthese-retroaction-data.js : `e.id !== evaluation.id`) et disait le vrai. Même
 * prédicat ici, appliqué à la copie que le résolveur #576 retrouve en base (par
 * `idModification`, sinon par élève + production) — une seule règle, pas une seconde
 * lecture de l'historique. Mesuré avant / après enregistrement
 * (Rapports/MESURE-ce-que-l-eleve-lit-dans-le-pdf-2026-09-06.md, C2).
 *
 * @param {string} da
 * @param {Object|null} copieEnBase - l'évaluation enregistrée de la copie en cours, ou null
 */
function _chargerHistoriqueBilan(da, copieEnBase) {
    var idCopie = copieEnBase ? copieEnBase.id : null;
    try {
        var toutesEvals = obtenirDonneesSelonMode('evaluationsSauvegardees');
        return toutesEvals
            .filter(function(e) { return e.etudiantDA === da && !e.remplaceeParId && !(idCopie && e.id === idCopie); })
            .sort(function(a, b) { return new Date(b.dateEvaluation) - new Date(a.dateEvaluation); })
            .slice(0, 5);
    } catch(e) {
        console.warn('[Evaluation] historique eleve load skipped:', e.message || e);
        return [];
    }
}

function _chargerGrilleDefBilan(grilleId) {
    try {
        var grilles = db.getSync(cle('grillesTemplates'), []);
        return grilles.find(function(g) { return g.id === grilleId; }) || null;
    } catch(e) {
        console.warn('[Evaluation] grille lookup skipped:', e.message || e);
        return null;
    }
}

/**
 * L'évaluation ENREGISTRÉE que le formulaire est en train de modifier.
 *
 * ⮕ #576 (28 août 2026). Elle est la SEULE à porter le nom des critères quand
 * la grille d'origine a disparu des modèles : `evaluation.criteres` est un
 * tableau `[{critereId, critereNom, niveauSelectionne}]`, écrit à la sauvegarde
 * (`evaluation.js`, `critereNom: grille.criteres.find(...)?.nom || critereId`).
 *
 * Repérée par `idModification` — l'identifiant que le formulaire pose quand il
 * ouvre une évaluation existante. À défaut, par le couple élève + production,
 * en écartant les reprises remplacées comme partout ailleurs dans ce module.
 */
function _chargerEvaluationEnregistreeBilan(ec) {
    if (!ec) return null;
    try {
        var toutes = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        if (ec.idModification) {
            var parId = toutes.find(function(e) { return e && e.id === ec.idModification; });
            if (parId) return parId;
        }
        return toutes.find(function(e) {
            return e && e.etudiantDA === ec.etudiantDA
                && e.productionId === ec.productionId && !e.remplaceeParId;
        }) || null;
    } catch(e) {
        console.warn('[Evaluation] evaluation enregistree lookup skipped:', e.message || e);
        return null;
    }
}

/**
 * Les critères du bilan — depuis la grille, ou depuis l'évaluation enregistrée.
 *
 * ⮕ #576 (28 août 2026), trouvé par la porte terrain 2.6 sur les données réelles
 * d'H2026 de Grégoire. CE QUI SE PASSAIT : quand la grille d'origine n'est plus
 * dans `grillesTemplates`, `_chargerGrilleDefBilan` rend `null`, cette fonction
 * rendait `[]`, et TOUT le bilan personnalisé disparaissait en cascade — `defis`
 * vide, `tousMaitrises` faux (il exige `criteres.length > 0`), `_rendreForceBilan`
 * sans matière. L'élève recevait une page d'entête sans contenu, impossible à
 * distinguer d'un élève qui n'aurait aucun défi.
 *
 * ⮕ LA DONNÉE ÉTAIT LÀ, ET LE PANNEAU D'À CÔTÉ LA LISAIT DÉJÀ. `evaluation.js`
 * a exactement ce repli pour le même cas — il affiche les critères depuis
 * `evaluation.criteres` sous la bannière « Grille d'origine introuvable dans les
 * modèles actuels — affichage depuis les données sauvegardées ». Le bilan n'en
 * avait jamais eu. On converge sur la même source, on n'en invente pas une autre.
 *
 * ⚠ LES NOMS VIENNENT DE L'ENREGISTREMENT, LES NIVEAUX DU FORMULAIRE. Le nom
 * d'un critère est figé au moment de la sauvegarde ; le niveau, lui, est celui
 * que l'enseignant·e a sous les yeux et vient peut-être de changer. Prendre le
 * niveau enregistré ferait mentir le bilan sur l'écran en cours d'édition.
 *
 * ⚠ AUCUNE NOTE TECHNIQUE N'EST AJOUTÉE AU BILAN, et c'est délibéré :
 * `copierToutRetroaction` copie le `textContent` de ce bloc sous « === BILAN === »
 * dans ce qui est remis à l'élève. Un message d'anomalie partirait avec. La
 * bannière du panneau voisin prévient déjà l'enseignant·e — c'est le bon endroit.
 *
 * @param {Object|null} grilleDef - la grille template, ou `null` si disparue
 * @param {Object} ec - `evaluationEnCours` (niveaux vivants, par `critereId`)
 * @param {Object|null} enregistree - l'évaluation sauvegardée (noms des critères)
 */
function _collecterCriteresBilan(grilleDef, ec, enregistree) {
    var criteres = [];
    if (!ec || !ec.criteres) return criteres;

    if (grilleDef && grilleDef.criteres) {
        grilleDef.criteres.forEach(function(gc) {
            var niv = ec.criteres[gc.id];
            if (niv) {
                var entree = { critereNom: gc.nom, critereId: gc.id, niveauSelectionne: niv, description: gc.description || '' };
                // Lot 3, retouche du 4 sept. 2026 — un critère analytique porte ses POINTS
                // (source : `pointsAnalytiques`, lot 2) et le poids de la grille : le bilan
                // le nomme par son chiffre, jamais par le nom du niveau déduit (arrêté 4).
                // ⚠ Lus sur `ec`, l'état vivant (#699 : le nu l'emporte), comme les niveaux.
                var pts = (gc.type === 'analytique' && ec.pointsAnalytiques) ? ec.pointsAnalytiques[gc.id] : undefined;
                if (typeof pts === 'number' && !isNaN(pts)) { entree.points = pts; entree.ponderation = gc.ponderation || 0; }
                criteres.push(entree);
            }
        });
    }
    // Le repli couvre AUSSI la grille présente dont plus aucun identifiant ne
    // correspond (critères renommés ou recréés) : même symptôme, même remède.
    // La règle tient en une phrase — le bilan lit la grille quand il le peut, et
    // l'évaluation enregistrée sinon.
    if (criteres.length > 0) return criteres;

    if (!enregistree || !Array.isArray(enregistree.criteres)) return criteres;
    enregistree.criteres.forEach(function(c) {
        if (!c || !c.critereId) return;
        var niv = ec.criteres[c.critereId];
        if (!niv) return;
        var entree = {
            critereNom: c.critereNom || c.critereId,
            critereId: c.critereId,
            niveauSelectionne: niv,
            description: ''
        };
        // Lot 3, retouche — relu depuis `criteres[]` en base : les points et le poids
        // ENREGISTRÉS avec l'entrée (le chiffre reste vrai si la grille a changé depuis).
        if (typeof c.points === 'number' && !isNaN(c.points)) { entree.points = c.points; entree.ponderation = c.ponderation || 0; }
        criteres.push(entree);
    });
    return criteres;
}

/**
 * Ce que le bilan dit du niveau d'un critère : le NOM du niveau dans l'échelle —
 * ou, pour un critère analytique, SON CHIFFRE, « 24 / 30 ».
 * ⮕ Décision de Grégoire, 4 septembre 2026 au matin, après la relecture croisée du
 * lot 3 : « pas de niveau avec la grille analytique : on passe au chiffre ». C'est
 * l'arrêté 4 (l'élève ne lit que la note chiffrée) appliqué au dernier endroit où le
 * niveau déduit l'atteignait encore — ce bilan est copié sous « === BILAN === » dans
 * ce qu'il reçoit. Même prédicat que les trois rendus du lot 3 : `points` présent.
 * ⚠ Ce texte part chez l'élève et traverse un `innerHTML` : échappé ici, comme `_nomBilan`.
 */
function _lectureNiveauBilan(niveauDe, c) {
    if (c && typeof c.points === 'number') {
        var ech = (typeof echapperHtml === 'function') ? echapperHtml : function () { return ''; };
        return ech(String(c.points) + ' / ' + String(c.ponderation == null ? '' : c.ponderation));
    }
    return _nomBilan(niveauDe, c ? c.niveauSelectionne : '');
}

/**
 * ⮕ #555 lot 2 — les trois états comparés sont maintenant des ZONES, et chaque
 * évaluation de l'historique est lue dans SON échelle. Un élève dont la pratique
 * a changé de barème en cours de trimestre n'hérite plus d'un « objectif
 * prioritaire depuis 3 productions » calculé sur des zones qui ne parlaient pas
 * de la même chose.
 */
function _detecterPatronsRecurrentsBilan(criteres, historiqueEleve, echelleId) {
    var nomsPatrons = [];
    if (historiqueEleve.length < 2) return nomsPatrons;
    var zonesDe = function (ev) {
        var map = {};
        var zone = _lecteurZoneBilan(ev && ev.echelleId);
        if (ev && ev.criteres) ev.criteres.forEach(function(c) { map[c.critereNom] = zone(c.niveauSelectionne); });
        return map;
    };
    var zH1 = zonesDe(historiqueEleve[0]);
    var zH2 = zonesDe(historiqueEleve[1]);
    var zoneCourante = _lecteurZoneBilan(echelleId);
    criteres.forEach(function(c) {
        if (zoneCourante(c.niveauSelectionne) === 'priorite' &&
            zH1[c.critereNom] === 'priorite' &&
            zH2[c.critereNom] === 'priorite') {
            nomsPatrons.push(c.critereNom);
        }
    });
    return nomsPatrons;
}

function _compterErreursFrancaisBilan() {
    var totalErreursFr = 0;
    try {
        var fichierBilan = (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getFichierActuel)
            ? travauxVisionneuse.getFichierActuel() : null;
        if (fichierBilan && typeof travauxStockage !== 'undefined') {
            var annotBilan = travauxStockage.obtenirAnnotationFichier(fichierBilan.id);
            if (annotBilan && annotBilan.pages) {
                for (var pgId in annotBilan.pages) {
                    var pg = annotBilan.pages[pgId];
                    if (pg.shapes) pg.shapes.forEach(function(f) {
                        if (f.type && f.type.indexOf('errfr_') === 0) totalErreursFr++;
                    });
                }
            }
        }
    } catch(e) { /* ignore */ }
    return totalErreursFr;
}

function _detecterAlgoA0Bilan(grilleDef, ec, totalErreursFr) {
    if (!grilleDef) return null;
    var algoA0 = null;
    grilleDef.criteres.forEach(function(gc) {
        if (gc.type !== 'algorithmique') return;
        // Source 1 : données algorithmiques calculées
        if (ec.donneesAlgorithmiques && ec.donneesAlgorithmiques[gc.id]) {
            var da = ec.donneesAlgorithmiques[gc.id];
            if (da.pourcentage !== undefined && da.pourcentage <= 0 && da.erreurs > 0) {
                // #581 — le CRITÈRE voyage, pas seulement son nom : c'est lui
                // qui porte le modèle d'énoncé réglé dans le gabarit.
                algoA0 = { critere: gc, critereNom: gc.nom, erreurs: da.erreurs, mots: da.mots };
            }
        }
        // Source 2 : comptage direct des codes d'erreur annotés
        if (!algoA0 && totalErreursFr > 0) {
            var pond = gc.ponderation || 20;
            var motsEstime = parseInt((document.getElementById('eval_mots_' + gc.id) || {}).value) || 500;
            // #667 — quatrième site où la formule était réécrite à la main. Il
            // sert à DÉTECTER un critère effondré, pas à noter, mais s'il ne
            // suit pas la formule du gabarit il détecte selon une autre règle
            // que celle qui a produit la note affichée.
            var resEstimee = window.formulesAlgo.calculer(gc, {
                ponderation: pond,
                erreurs: totalErreursFr,
                mots: motsEstime
            });
            var noteEstimee = resEstimee.applicable ? resEstimee.note : null;
            if (noteEstimee !== null && noteEstimee <= 0) {
                algoA0 = { critere: gc, critereNom: gc.nom, erreurs: totalErreursFr, mots: motsEstime };
            }
        }
    });
    return algoA0;
}

function _rendreAlgoA0Bilan(algoA0) {
    if (!algoA0) return '';
    // #581 — la phrase vient du gabarit. Elle affirmait « la qualité du français
    // écrit est à travailler en priorité » quel que soit le critère effondré.
    // ⚠ `echapperHtml` EST NEUF ICI, et c'est une correction, pas un ajout
    // gratuit : `critereNom` était déjà posé nu dans `innerHTML` (donnée
    // utilisateur), et l'énoncé l'est désormais entièrement.
    var ech = function (t) { return (typeof echapperHtml === 'function') ? echapperHtml(String(t == null ? '' : t)) : ''; };
    var phrase = window.enoncesAlgo.enonce(algoA0.critere, 'priorite', {});
    if (!phrase) return '';
    return '<p>- <strong>' + ech(phrase) + '</strong> (' + ech(algoA0.critereNom) + ' : ' + algoA0.erreurs + ' erreur' + (algoA0.erreurs > 1 ? 's' : '') + ' sur ' + algoA0.mots + ' mots, Incomplet)</p>';
}

function _rendreDefisBilan(defis, algoA0, nomsPatrons, niveauDe) {
    var html = '';
    var maxDefis = algoA0 ? 1 : 2;
    for (var i = 0; i < Math.min(maxDefis, defis.length); i++) {
        var d = defis[i];
        // Ne pas répéter le critère algorithmique déjà mentionné
        if (algoA0 && d.critereNom === algoA0.critereNom) { maxDefis++; continue; }
        // ⚠ #576 — LES DEUX BRANCHES SONT DES DONNÉES UTILISATEUR, et celle de
        // droite est neuve : le repli sur l'évaluation enregistrée ne fournit
        // aucune description, donc `desc` devient le NOM du critère, jusque-là
        // toujours passé par la branche échappée d'à côté. Trouvé par la
        // sentinelle #576, pas par relecture.
        var patron = nomsPatrons.indexOf(d.critereNom) !== -1 ? '. Cet objectif est prioritaire depuis 3 productions' : '';
        // #575 — le nom du niveau vient de l'échelle. Quand elle ne le nomme
        // pas, il est simplement absent : jamais un repère inventé.
        var nomNiveau = _lectureNiveauBilan(niveauDe, d);   // le chiffre pour un analytique (retouche du lot 3)
        // ⚠ LES DEUX SONT DES DONNÉES UTILISATEUR — description ET nom du
        // critère traversent un innerHTML. La règle n° 1 s'applique aux deux.
        var ech = function (t) { return (typeof echapperHtml === 'function') ? echapperHtml(t) : ''; };
        var nomCritere = ech(d.critereNom);

        // ⚠⚠ #576 — LE NOM NE S'ÉCRIT QU'UNE FOIS. La description d'un critère
        // vient de la GRILLE ; le repli sur l'évaluation enregistrée n'en a
        // aucune, et la ligne retombait alors sur le nom — qu'elle répétait
        // aussitôt entre parenthèses : « Plausibilité (Plausibilité En
        // développement) ». Vu en RENDANT le bilan, pas en le testant : les
        // assertions cherchaient la présence des mots, pas leur nombre.
        // Ce texte part chez l'élève ; il doit se lire.
        var description = (d.description == null) ? '' : String(d.description).trim();
        var tete = description ? ech(description.toLowerCase()) : nomCritere;
        var precision = description
            ? nomCritere + (nomNiveau ? ' ' + nomNiveau : '')
            : nomNiveau;
        html += '<p>- ' + tete + (precision ? ' (' + precision + ')' : '') + patron + '</p>';
    }
    return html;
}

/**
 * Les critères « acquis en développement » — entre les deux repères.
 *
 * ⮕ #555 lot 2. Réels mais non durables : ni des priorités (les y mettre dirait
 * à l'élève qu'il n'a rien acquis), ni un silence (le taire lui laisserait
 * croire que c'est réglé). Mêmes mots que le PDF de synthèse, et c'est
 * obligatoire — `copierToutRetroaction` copie ce bilan dans son document.
 *
 * ⚠ Sans repères sur l'échelle, `zoneDuNiveau` rend `null`, aucun critère n'est
 * signalé, et la ligne disparaît d'elle-même. Aucune note technique n'apparaît
 * dans un texte remis à l'élève.
 */
function _rendreSignalesBilan(signales, niveauDe) {
    if (!signales || signales.length === 0) return '';
    var ech = function (t) { return (typeof echapperHtml === 'function') ? echapperHtml(t) : ''; };
    var lignes = signales.map(function (c) {
        var nomNiveau = _lectureNiveauBilan(niveauDe, c);   // le chiffre pour un analytique (retouche du lot 3)
        return '<p>- ' + ech(c.critereNom) + (nomNiveau ? ' (' + nomNiveau + ')' : '') + '</p>';
    }).join('');
    return '<h5>Acquis en développement, à consolider :</h5>' + lignes;
}

function _rendreTousMaitrisesBilan(totalErreursFr, evalPrecedente, critereAlgo) {
    // ⚠ #555 lot 2 — l'évaluation PRÉCÉDENTE est lue dans SON échelle, pas dans
    // celle du bilan en cours : deux barèmes différents ne disent pas la même
    // chose du même code.
    var zonePrecedente = _lecteurZoneBilan(evalPrecedente && evalPrecedente.echelleId);
    if (totalErreursFr > 0) {
        // #581 — « Concentre-toi sur la qualité du français » sortait à qui
        // compte des erreurs de calcul. ⚠ MÊMES MOTS QUE LE PDF DE SYNTHÈSE,
        // et c'est obligatoire : `copierToutRetroaction` copie ce bilan dans le
        // document de l'autre. Les deux sites lisent donc le MÊME énoncé
        // `concentre` du même gabarit — c'est ce qui garantit qu'ils ne peuvent
        // plus diverger, là où deux chaînes jumelles le pouvaient.
        var ech = function (t) { return (typeof echapperHtml === 'function') ? echapperHtml(String(t == null ? '' : t)) : ''; };
        var phrase = window.enoncesAlgo.enonce(critereAlgo, 'concentre', {});
        return '<p>Tous les critères sont maîtrisés.' + (phrase ? ' ' + ech(phrase) : '') + ' (' + totalErreursFr + ' erreur' + (totalErreursFr > 1 ? 's' : '') + ' annotée' + (totalErreursFr > 1 ? 's' : '') + ').</p>';
    }
    // Verifier si maitrise depuis 2+ productions (garde length > 0 :
    // .every() retourne true sur tableau vide via vacuite JS).
    // ⚠ F4-1 (audit du 21 sept. 2026) — la phrase disait « depuis plus d’un
    // artefact » et « vers le niveau É (transfert…) » : le mot du cours de
    // Grégoire et le sommet de SON échelle, dans le bilan de l'élève de qui que
    // ce soit. Texte validé par Grégoire ; MÊMES MOTS que le PDF de synthèse
    // (`synthese-retroaction-data.js`), à l'apostrophe près.
    var maitriseLongtemps = evalPrecedente && Array.isArray(evalPrecedente.criteres) &&
        evalPrecedente.criteres.length > 0 &&
        evalPrecedente.criteres.every(function(c) { return zonePrecedente(c.niveauSelectionne) === 'acquis'; });
    if (maitriseLongtemps) {
        return '<p class="retro-force">Tous les critères sont maîtrisés depuis plus d’une production. Tu peux aider tes collègues : c’est une excellente façon de transférer tes compétences à d’autres contextes.</p>';
    }
    return '<p class="retro-force">Tous les critères sont maîtrisés. Continue sur cette lancée !</p>';
}

function _rendreForceBilan(criteres, defis, niveauDe, zoneDe, signales) {
    // #575 — le meilleur critère se départage par le rang de son niveau DANS
    // L'ÉCHELLE. Un niveau que l'échelle ne situe pas (rang `Infinity`) ne peut
    // pas être « la force » : il est écarté, jamais promu par défaut.
    var meilleur = null; var meilleurRang = null;
    criteres.forEach(function(c) {
        var rang = _rangBilan(niveauDe, c.niveauSelectionne);
        if (rang === Infinity) return;
        if (meilleurRang === null || rang > meilleurRang) { meilleurRang = rang; meilleur = c; }
    });
    // ⮕ #555 lot 2 — « ta force » suppose un niveau ACQUIS. Un critère en zone
    // « signalé » est réel mais non durable : l'annoncer comme une force dirait
    // à l'élève qu'il peut s'en détourner.
    // ⚠ « TA FORCE » SE DIT QUAND IL RESTE QUELQUE CHOSE À TRAVAILLER — c'est la
    // règle d'origine (`defis.length > 0`), et elle a un sens : sans rien à côté,
    // la phrase « tous les critères sont maîtrisés » dit déjà tout.
    // ⮕ #555 lot 2 l'a ÉLARGIE aux signalés, et il le fallait : depuis les trois
    // zones, un élève peut n'avoir aucune priorité tout en ayant des acquis en
    // développement. Avec la seule condition d'origine, sa force disparaissait
    // du bilan — trouvé par une spec WebKit, Vitest restant vert.
    var resteATravailler = defis.length > 0 || (signales && signales.length > 0);
    if (meilleur && zoneDe(meilleur.niveauSelectionne) === 'acquis' && resteATravailler) {
        var nomNiveau = _lectureNiveauBilan(niveauDe, meilleur);   // le chiffre pour un analytique (retouche du lot 3)
        var nomCritere = (typeof echapperHtml === 'function') ? echapperHtml(meilleur.critereNom) : '';
        return '<p class="retro-force">Ta force : ' + nomCritere
            + (nomNiveau ? ' (' + nomNiveau + ')' : '') + '</p>';
    }
    return '';
}

/**
 * ⚠ LES NOMS DE CRITÈRES SONT SAISIS PAR L'UTILISATEUR et partent dans un
 * `innerHTML` : ils sont échappés ici, au plus près de la source. La version
 * précédente les concaténait bruts — sans conséquence tant que la liste venait
 * de comparaisons de lettres, mais la règle n° 1 du projet ne souffre pas
 * d'exception.
 */
function _listeEchappeeBilan(noms) {
    var echappe = (typeof echapperHtml === 'function') ? echapperHtml : function () { return ''; };
    return noms.map(echappe).join(' et ');
}

function _rendreRecurrentsBilan(evalPrecedente, criteres, niveauDe, echelleId, zoneDe) {
    var recurrentsHtml = '';

    // Progrès (comparaison de l'élève avec lui-même)
    //
    // ⚠⚠ #575 — ON NE COMPARE QUE DANS UNE MÊME ÉCHELLE. Deux rangs issus
    // d'échelles différentes ne se comparent pas : le 3e niveau d'une échelle à
    // quatre et le 3e d'une échelle à six ne disent pas la même chose. Quand
    // l'évaluation précédente désigne une AUTRE échelle — ou n'en désigne
    // aucune —, la ligne « Progrès » ne s'affiche pas. C'est le même refus que
    // `obtenirEchelleCommuneDesEvaluations` oppose à l'ambiguïté : ne pas
    // deviner, plutôt qu'annoncer un progrès qui n'a pas été mesuré.
    // ⚠ REPLI RESTRICTIF, et c'est le seul qui soit sûr : sans le lecteur, on ne
    // peut pas savoir si les deux rangs sont comparables — et « ne pas deviner »
    // vaut ici aussi. `profil-etudiant-calculs.js` est chargé avant ce module
    // dans `index.html` ; ce filet ne sert qu'à ne jamais lever.
    var memeEchelle = !!evalPrecedente
        && (typeof echellesComparables === 'function')
        && echellesComparables(evalPrecedente.echelleId, echelleId);
    if (memeEchelle && evalPrecedente.niveauFinal) {
        var nivAct = document.getElementById('niveauProduction1')?.textContent || '';
        var nivPre = evalPrecedente.niveauFinal;
        var rangAct = _rangBilan(niveauDe, nivAct);
        var rangPre = _rangBilan(niveauDe, nivPre);
        // `Infinity` des deux côtés ne prouve rien : la comparaison stricte
        // écarte d'elle-même le cas où aucun des deux codes ne se situe.
        if (rangAct !== Infinity && rangPre !== Infinity && rangAct > rangPre) {
            recurrentsHtml += '<p>Progrès : ' + nivPre + ' → ' + nivAct + ' depuis ' + (evalPrecedente.productionNom || 'la production précédente') + '</p>';
        }
    }

    // Amélioration reconnue — ⮕ #555 lot 2, DEUX natures de progrès.
    //   · vers ACQUIS   → « Tu as progressé en X. »
    //   · vers SIGNALÉ  → « ...tu as fait de beaux progrès : il faut les consolider. »
    // Décision de Grégoire (28 août) : sortir de l'insuffisance est le passage le
    // plus difficile, mais il n'est pas durable. Le taire laisserait croire qu'il
    // ne compte pas ; le confondre avec l'autre, qu'il est réglé.
    //
    // ⚠ « AVANT ≠ ACQUIS », pas « avant = priorité » : traduire le côté gauche
    // par la seule zone « priorité » supprimerait les passages D → M et D → E,
    // qui étaient annoncés. Régression commise et corrigée le 28 août dans le
    // module jumeau ; elle ne se reproduit pas ici.
    // ⚠ `null` n'est pas « non acquis » : sans repères, on ne sait pas, donc on
    // n'annonce rien — sinon chaque évaluation antérieure à leur pose ferait
    // annoncer un progrès qu'on n'a pas mesuré.
    if (evalPrecedente && evalPrecedente.criteres) {
        var zoneAvant = _lecteurZoneBilan(evalPrecedente.echelleId);
        var criteresPrec = {};
        evalPrecedente.criteres.forEach(function(c) { criteresPrec[c.critereNom] = c.niveauSelectionne; });
        var ameliorations = [];
        var aConsolider = [];
        criteres.forEach(function(c) {
            var avant = zoneAvant(criteresPrec[c.critereNom]);
            var apres = zoneDe(c.niveauSelectionne);
            if (avant == null) return;
            if (avant !== 'acquis' && apres === 'acquis') ameliorations.push(c.critereNom);
            else if (avant === 'priorite' && apres === 'signale') aConsolider.push(c.critereNom);
        });
        if (ameliorations.length > 0) {
            recurrentsHtml += '<p class="retro-amelioration">Tu as progressé en '
                + _listeEchappeeBilan(ameliorations) + '.</p>';
        }
        if (aConsolider.length > 0) {
            recurrentsHtml += '<p class="retro-amelioration">En ' + _listeEchappeeBilan(aConsolider)
                + ', tu as fait de beaux progrès : maintenant il faut les consolider.</p>';
        }
    }

    return recurrentsHtml ? '<h5>Points récurrents</h5>' + recurrentsHtml : '';
}

function _rendreJetonsBilan(da) {
    if (typeof obtenirConfigJetons !== 'function' || !da) return '';
    try {
        var configJetons = obtenirConfigJetons();
        if (!configJetons || !configJetons.actif) return '';
        var maxJetons = configJetons.reprise ? configJetons.reprise.nombre : 2;
        var toutesEvalsJ = obtenirDonneesSelonMode('evaluationsSauvegardees');
        var productions = obtenirDonneesSelonMode('productions') || [];
        var jetonsUtilises = [];
        toutesEvalsJ.filter(function(e) {
            return e.etudiantDA === da && !e.remplaceeParId;
        }).forEach(function(e) {
            var prod = productions.find(function(p) { return p.id === e.productionId; });
            var nomProd = prod ? (prod.titre || prod.nom || e.productionId) : e.productionId;
            if (e.jetonDelaiApplique) jetonsUtilises.push('Délai — ' + nomProd);
            if (e.jetonRepriseApplique || e.repriseDeId) jetonsUtilises.push('Reprise — ' + nomProd);
            if (e.jetonRepriseCibleeApplique) jetonsUtilises.push('Reprise ciblée — ' + nomProd);
        });
        var html = '<h5>Jetons utilisés : ' + jetonsUtilises.length + ' / ' + maxJetons + '</h5>';
        if (jetonsUtilises.length > 0) {
            html += jetonsUtilises.map(function(j) { return '<p>• ' + j + '</p>'; }).join('');
        }
        return html;
    } catch(e) {
        console.warn('[Evaluation] jetons calculation skipped:', e.message || e);
        return '';
    }
}

function genererRetroactionBilan() {
    var conteneur = document.getElementById('contenuRetroBilan');
    if (!conteneur) return;

    // #699 (G-2, audit du 5 sept. 2026) — LA MÊME SOURCE QUE LE CALCUL : le nom nu quand il
    // existe (`etatVivantEvaluationEnCours`, evaluation-calcul.js), `window` sinon, comme avant.
    // Le bilan lisait `window` seul et nommait encore l'ancien défi après un niveau changé (spec
    // WebKit #699, mesure G3 du banc).
    var ec = (typeof window.etatVivantEvaluationEnCours === 'function') ? window.etatVivantEvaluationEnCours() : window.evaluationEnCours;
    if (!ec || !ec.etudiantDA || !ec.grilleId) {
        conteneur.innerHTML = '<p class="eval-vide">Sélectionne un étudiant et une grille pour voir le bilan.</p>';
        return;
    }

    var da = ec.etudiantDA;
    // #576 — la source de secours des NOMS de critères quand la grille a disparu ; et,
    // depuis #758, LA COPIE À EXCLURE DE L'HISTORIQUE : c'est elle que l'auto-save a mise
    // en base, et elle n'est la « précédente » de personne.
    var evalEnregistree = _chargerEvaluationEnregistreeBilan(ec);
    var historiqueEleve = _chargerHistoriqueBilan(da, evalEnregistree);
    var evalPrecedente = historiqueEleve.length > 0 ? historiqueEleve[0] : null;
    var grilleDef = _chargerGrilleDefBilan(ec.grilleId);
    var criteres = _collecterCriteresBilan(grilleDef, ec, evalEnregistree);
    // ⚠ `echelleId` est résolu plus bas ; on le calcule ici pour que les patrons
    // le reçoivent. Même lecture : l'évaluation d'abord, le sélecteur en repli.
    var echelleId = ec.echelleId || document.getElementById('selectEchelle1')?.value || null;
    var nomsPatrons = _detecterPatronsRecurrentsBilan(criteres, historiqueEleve, echelleId);
    var totalErreursFr = _compterErreursFrancaisBilan();

    // #575 — l'échelle de l'évaluation en cours, résolue UNE fois pour tout le
    // bilan. Même lecture que `evaluation-calcul.js` : l'évaluation d'abord, le
    // sélecteur de l'écran en repli tant qu'elle n'a pas été enregistrée.
    var niveauDe = _lecteurNiveauBilan(echelleId);
    var zoneDe = _lecteurZoneBilan(echelleId);

    // Defis prioritaires + détection « tous maîtrisés »
    // ⮕ #555 lot 2 — « défi » n'est plus une lettre : c'est ce qui est SOUS le
    // seuil de suffisance de l'échelle. L'ordre reste dérivé du rang.
    var defis = criteres
        .filter(function(c) { return zoneDe(c.niveauSelectionne) === 'priorite'; })
        .sort(function(a, b) {
            var ra = _rangBilan(niveauDe, a.niveauSelectionne);
            var rb = _rangBilan(niveauDe, b.niveauSelectionne);
            // ⚠ `Infinity - Infinity` vaut NaN, et un comparateur qui rend NaN
            // laisse le tri indéfini. Deux niveaux également illisibles gardent
            // leur ordre d'origine.
            if (ra === rb) return 0;
            return ra < rb ? -1 : 1;
        });
    // Verification explicite : un travail Non recevable (niveau '0') ne doit
    // JAMAIS declencher « tous maitrises » via defis.length === 0. Un niveau que
    // l'échelle ne situe pas (`null`) empêche aussi la conclusion — on n'annonce
    // pas « tout est acquis » sur un doute.
    // ⮕ #555 lot 2 — LA ZONE INTERMÉDIAIRE, ici aussi. Elle a d'abord été
    // ajoutée au seul PDF de synthèse ; c'est une spec WebKit qui a montré le
    // manque, Vitest restant vert. Or `copierToutRetroaction` copie le
    // `textContent` de CE bilan dans ce qui est remis à l'élève : les deux
    // documents doivent dire la même chose du même critère.
    var signales = criteres
        .filter(function(c) { return zoneDe(c.niveauSelectionne) === 'signale'; })
        .sort(function(a, b) {
            var ra = _rangBilan(niveauDe, a.niveauSelectionne);
            var rb = _rangBilan(niveauDe, b.niveauSelectionne);
            return (ra === rb) ? 0 : (ra < rb ? -1 : 1);
        });

    var tousMaitrises = criteres.length > 0 &&
        criteres.every(function(c) { return zoneDe(c.niveauSelectionne) === 'acquis'; });

    var algoA0 = _detecterAlgoA0Bilan(grilleDef, ec, totalErreursFr);

    // Assemblage HTML
    var html = '';
    html += '<p class="eval-vide" style="margin-bottom:6px;">Mes standards sont très élevés à ton égard parce que je crois que tu as tout ce qu’il faut pour les atteindre et j’ai confiance en toi. Si tu as besoin d’aide, viens me voir.</p>';
    html += '<p class="retro-question" style="margin-bottom:8px;">Selon toi, quel aspect de ta production mériterait le plus d’attention ?</p>';
    html += '<h5>Présentement, il faut se concentrer sur :</h5>';
    html += _rendreAlgoA0Bilan(algoA0);

    if (defis.length > 0) {
        html += _rendreDefisBilan(defis, algoA0, nomsPatrons, niveauDe);
        html += _rendreSignalesBilan(signales, niveauDe);
    } else if (signales.length > 0) {
        // ⮕ #555 lot 2 — AUCUNE priorité mais des acquis en développement.
        // Avant les repères, ces critères tombaient dans les défis et la section
        // n'était jamais vide ; depuis, le titre restait suivi du VIDE — le
        // symptôme exact de la porte terrain 2.6, réintroduit par mon lot et
        // trouvé par une spec WebKit alors que Vitest restait vert.
        html += _rendreSignalesBilan(signales, niveauDe);
    } else if (tousMaitrises) {
        html += _rendreTousMaitrisesBilan(totalErreursFr, evalPrecedente,
            window.enoncesAlgo.critereAlgorithmiqueOuNomme(grilleDef, evalEnregistree));   // #686
    } else if (criteres.length === 0 && !algoA0) {
        // #576 — LE SILENCE ÉTAIT LA MOITIÉ DU DÉFAUT. Sans critère lisible, le
        // bilan affichait « Présentement, il faut se concentrer sur : » suivi de
        // RIEN, et enchaînait sur les jetons. Impossible, pour l'élève comme pour
        // l'enseignant·e, de distinguer ça d'un travail sans aucun défi.
        // ⮕ La phrase est écrite POUR L'ÉLÈVE — ce bloc part dans sa rétroaction.
        // Elle constate, elle n'accuse pas l'outil et ne nomme aucune anomalie.
        html += '<p>Aucun critère n\'est encore évalué pour cette production.</p>';
    }

    html += _rendreForceBilan(criteres, defis, niveauDe, zoneDe, signales);
    html += _rendreRecurrentsBilan(evalPrecedente, criteres, niveauDe, echelleId, zoneDe);
    html += _rendreJetonsBilan(da);

    conteneur.innerHTML = html;
}

function copierToutRetroaction() {
    var parties = [];

    // Générale
    var texteGen = (document.getElementById('retroactionFinale1') || {}).value || '';
    if (texteGen.trim()) parties.push('=== RÉTROACTION GÉNÉRALE ===\n' + texteGen.trim());

    // Spécifique
    genererRetroactionSpecifique();
    // #759 — séparé comme à l'écran : le textContent collait les phrases.
    var texteSpec = _texteSepareDuHtml((document.getElementById('contenuRetroSpecifique') || {}).innerHTML);
    if (texteSpec) parties.push('=== RÉTROACTION SPÉCIFIQUE ===\n' + texteSpec);

    // Bilan
    genererRetroactionBilan();
    var texteBilan = _texteSepareDuHtml((document.getElementById('contenuRetroBilan') || {}).innerHTML);
    if (texteBilan) parties.push('=== BILAN ===\n' + texteBilan);

    var texteComplet = parties.join('\n\n');
    if (!texteComplet) {
        alert('Aucune rétroaction à copier');
        return;
    }

    navigator.clipboard.writeText(texteComplet).then(function() {
        notifications.succes('Rétroaction complète copiée (générale + spécifique + bilan) !');
    }).catch(function(err) {
        console.error('Erreur de copie:', err);
        alert('Erreur lors de la copie.');
    });
}

/**
 * Sauvegarde la rétroaction finale modifiée
 */
function sauvegarderRetroactionFinale(productionNum) {
    // La rétroaction est déjà dans le textarea, pas besoin de sauvegarde intermédiaire
    // Elle sera sauvegardée lors de la sauvegarde complète de l'évaluation
}

// =====================================================================
// Exports window.X (6) — voir en-tête pour détails
// =====================================================================

// Préservés depuis bloc principal evaluation.js :
window.genererRetroaction = genererRetroaction;
window.copierRetroaction = copierRetroaction;
window.basculerVueRetroaction = basculerVueRetroaction;
window.copierToutRetroaction = copierToutRetroaction;

// Préservé export dispersé d'origine (avant L282 résidu / L2130 origine) :
window.regenererRetroactionAvecFeedback = regenererRetroactionAvecFeedback;

// Promotion §5.6 nouvelle (session B 2e sous-module) :
window.mettreAJourCompteurMots = mettreAJourCompteurMots;

})();
