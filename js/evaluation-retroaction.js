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
     · genererRetroactionBilan (cyc 75 PRIVÉE — héritage Cat-B accepté,
       au-dessus du seuil proposé N=50 mais sous le seuil dur du monstre
       cyc 78 modifierEvaluation)
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

   Patches §5.6 appliqués DANS ce sous-module :
     · 2 sites `afficherNotificationSucces(...)` → `_notifSucces(...)`
       wrapper local (copierRetroaction L1362 + copierToutRetroaction
       L1720). Pattern profil-etudiant — wrappers dupliqués dans chaque
       sous-module au lieu de §5.6 vers une consolidation utils-
       notifications.js (toujours reportée, 73 sites cross-projet).

   Helpers cross-module consommés (script-scope globaux, bare access OK) :
     · evaluationEnCours (let global config.js L145)
     · db.getSync (db.js global)
     · echapperHtml (01-config.js global, 0 usage ici car aucun innerHTML
       interpole — innerHTML utilisé mais avec contenu déjà composé hors
       données utilisateur ou via `.textContent`)
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
     · genererRetroactionBilan cyc 75 (sous-découpage `-retroaction-
       bilan.js` reporté à un cycle ultérieur — pattern profil-etudiant-
       sections-affichage.js 4 654 LOC accepté par Grégoire le 18 mai)
   =============================== */

(function() {
'use strict';

// Wrapper notification local (§5.6 pattern profil-etudiant — duplication
// préférée à consolidation utils-notifications.js, toujours reportée).
function _notifSucces(message) {
    if (typeof window.afficherNotificationSucces === 'function') {
        window.afficherNotificationSucces(message);
    }
}

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
function genererRetroaction(num) {
    if (!evaluationEnCours?.cartoucheId) {
        document.getElementById('retroactionFinale1').value = '';
        return;
    }

    const grilleId = evaluationEnCours.grilleId;
    const cartouches = db.getSync(`cartouches_${grilleId}`, []);
    const cartouche = cartouches.find(c => c.id === evaluationEnCours.cartoucheId);

    if (!cartouche) return;

    const productions = obtenirDonneesSelonMode('productions');
    const production = productions.find(p => p.id === evaluationEnCours.productionId);

    let texte = '';

    // Options (Description, Objectif, Tâche)
    if (document.getElementById('afficherDescription1')?.checked && (production?.activiteApprentissage || production?.description)) {
        texte += `Production : ${production?.activiteApprentissage || production?.description}\n`;
    }
    if (document.getElementById('afficherObjectif1')?.checked && production?.objectif) {
        texte += `Objectif : ${production.objectif}\n`;
    }
    if (document.getElementById('afficherTache1')?.checked && production?.tache) {
        texte += `Tâche : ${production.tache}\n`;
    }

    // Adresse personnalisée
    if (document.getElementById('afficherAdresse1')?.checked) {
        const etudiantDA = evaluationEnCours.etudiantDA;
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const etudiant = etudiants.find(e => e.da === etudiantDA);

        if (etudiant) {
            // Utiliser prenom qui sera soit le vrai nom en mode normal, soit "Élève X" en mode anonymisation
            texte += `\nBonjour ${etudiant.prenom} !\n\n`;
        }
    }

    // Contexte de la cartouche
    if (document.getElementById('afficherContexte1')?.checked && cartouche.contexte) {
        texte += `${cartouche.contexte}\n\n`;
    }

    // Commentaires des critères
    texte += 'Voici quelques observations :\n\n';

    const grilles = db.getSync('grillesTemplates', []);
    const grille = grilles.find(g => g.id === grilleId);

    // Garder une référence au critère modifié pour auto-scroll
    const critereActifId = evaluationEnCours._dernierCritereModifie || null;
    let positionCritereActif = -1;

    if (grille) {
        grille.criteres.forEach((critere, index) => {
            const niveau = evaluationEnCours.criteres[critere.id];
            if (niveau) {
                // Marquer la position du critère actif avant d'ajouter le texte
                if (critere.id === critereActifId) {
                    positionCritereActif = texte.length;
                }

                // Vérifier si c'est un critère algorithmique
                const enteteCritere = `Critère ${index + 1} (${critere.nom}) — ${niveau}`;
                if (critere.type === 'algorithmique' && evaluationEnCours.donneesAlgorithmiques?.[critere.id]?.retroaction) {
                    const retroAlgo = evaluationEnCours.donneesAlgorithmiques[critere.id].retroaction;
                    texte += `${enteteCritere}\n${retroAlgo}\n\n`;
                } else if (cartouche.commentaires) {
                    const cle = `${critere.id}_${niveau}`;
                    const commentaire = cartouche.commentaires[cle];

                    if (commentaire) {
                        texte += `${enteteCritere}\n${commentaire}\n\n`;
                    } else {
                        texte += `${enteteCritere}\n[Non défini]\n\n`;
                    }
                }
            }
        });
    }

    // Rétroactions des annotations visuelles (tampons diagnostiques + erreurs de français)
    const fichierActuel = (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getFichierActuel)
        ? travauxVisionneuse.getFichierActuel() : null;
    if (fichierActuel) {
        const annotationFichier = (typeof travauxStockage !== 'undefined')
            ? travauxStockage.obtenirAnnotationFichier(fichierActuel.id) : null;
        if (annotationFichier) {
            const statsAnnot = (typeof travauxExportPDF !== 'undefined' && travauxExportPDF.compterAnnotationsDetailees)
                ? travauxExportPDF.compterAnnotationsDetailees(annotationFichier) : null;
            if (statsAnnot) {
                // Observations (tampons diagnostiques)
                const retroObs = travauxOutils.obtenirRetroactionsObservations();
                const DIAG_IDS = ['bon-lien','manque-lien','confusion','repetitif','preuve-absente','citation','approfondir','procedes','attention'];
                const tamponsObs = Object.entries(statsAnnot.tampons).filter(([id]) => DIAG_IDS.includes(id));
                if (tamponsObs.length > 0) {
                    texte += '--- Observations ---\n\n';
                    for (const [id, count] of tamponsObs) {
                        const def = travauxOutils.AUTOCOLLANTS.find(a => a.id === id);
                        const txt = retroObs[id];
                        if (txt) texte += `${def?.nom || id} (×${count}) :\n${txt}\n\n`;
                    }
                }
                // Erreurs de français
                const retroFr = travauxOutils.obtenirRetroactionsErreursFr();
                if (statsAnnot.totalErreursFr > 0) {
                    texte += '--- Langue ---\n\n';
                    const ordreRetro = (typeof travauxOutils !== 'undefined' && travauxOutils.obtenirOrdreErreursFr)
                        ? travauxOutils.obtenirOrdreErreursFr() : [];
                    const typesTriés = Object.entries(statsAnnot.erreursFr).sort((a, b) => {
                        const idxA = ordreRetro.indexOf(a[0]);
                        const idxB = ordreRetro.indexOf(b[0]);
                        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                        return parseInt(a[0].replace('errfr_', ''), 10) - parseInt(b[0].replace('errfr_', ''), 10);
                    });
                    for (const [type, count] of typesTriés) {
                        const def = travauxOutils.CODES_ERREURS_FR.find(c => c.id === type);
                        const idxRetro = ordreRetro.indexOf(type);
                        const numRetro = idxRetro !== -1 ? idxRetro + 1 : def?.code;
                        const txt = retroFr[type];
                        if (txt) texte += `Code ${numRetro} – ${def?.nom} (×${count}) :\n${txt}\n\n`;
                    }
                }
            }
        }
    }

    // Ajouter la note/niveau à la fin selon le mode choisi
    const modeNote = document.querySelector('input[name="affichageNote1"]:checked')?.value || 'complet';
    if (modeNote === 'lettre') {
        if (evaluationEnCours.niveauFinal && evaluationEnCours.niveauFinal !== '--') {
            texte += `---\nNiveau de performance : ${evaluationEnCours.niveauFinal}`;
        }
    } else {
        const noteAffichee = document.getElementById('noteProduction1')?.textContent;
        if (noteAffichee && noteAffichee !== '--') {
            texte += `---\nNote finale : ${noteAffichee}%`;
        }
        if (evaluationEnCours.niveauFinal && evaluationEnCours.niveauFinal !== '--') {
            texte += `  |  Niveau : ${evaluationEnCours.niveauFinal}`;
        }
    }

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
    compteur.textContent = nbMots + ' mot' + (nbMots > 1 ? 's' : '');
}

// Écouter la saisie manuelle dans le textarea
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('retroactionFinale1');
    if (textarea) textarea.addEventListener('input', mettreAJourCompteurMots);
});

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
        texte = (document.getElementById('contenuRetroSpecifique') || {}).textContent || '';
    } else if (vueBil && !vueBil.classList.contains('u-hide')) {
        genererRetroactionBilan();
        texte = (document.getElementById('contenuRetroBilan') || {}).textContent || '';
    } else {
        texte = (document.getElementById('retroactionFinale1') || {}).value || '';
    }

    if (!texte || texte.trim() === '') {
        alert('Aucune rétroaction à copier');
        return;
    }

    navigator.clipboard.writeText(texte.trim()).then(function() {
        _notifSucces('Rétroaction copiée dans le presse-papier !');
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
    if (totalTampons > 0) {
        var autocollantsDef = travauxOutils.AUTOCOLLANTS;
        var retroObs = travauxOutils.obtenirRetroactionsObservations();
        var nomsCat = travauxOutils.obtenirNomsCategories();
        var ordreCategories = travauxOutils.obtenirOrdreCategories();

        ordreCategories.forEach(function(catId) {
            var tamponsCat = autocollantsDef.filter(function(a) { return !a.legacy && a.categorie === catId; });
            var utilises = tamponsCat.filter(function(a) { return tampons[a.id]; });
            if (utilises.length === 0) return;

            html += '<h5>' + (nomsCat[catId] || catId) + '</h5>';
            utilises.forEach(function(a) {
                var retro = retroObs[a.id] || '';
                html += '<p><strong>' + a.nom + '</strong> (' + tampons[a.id] + ') — ' + retro + '</p>';
            });
        });
    }

    // Erreurs de français
    if (totalErreurs > 0) {
        var codesErreurs = travauxOutils.CODES_ERREURS_FR;
        var retroFr = travauxOutils.obtenirRetroactionsErreursFr();
        var typesTriees = Object.keys(erreurs).sort(function(a, b) { return erreurs[b] - erreurs[a]; }).slice(0, 3);

        html += '<h5>Erreurs de français (' + totalErreurs + ')</h5>';
        typesTriees.forEach(function(type) {
            var codeDef = codesErreurs.find(function(c) { return c.id === type; });
            var nom = codeDef ? codeDef.nom : type;
            html += '<p><strong>' + nom + '</strong> (' + erreurs[type] + ') — ' + (retroFr[type] || '').substring(0, 120) + '</p>';
        });
    }

    if (!html) {
        html = '<p class="eval-vide">Aucun tampon ni erreur de français annotés.</p>';
    }

    conteneur.innerHTML = html;
}

function genererRetroactionBilan() {
    var conteneur = document.getElementById('contenuRetroBilan');
    if (!conteneur) return;

    var ec = window.evaluationEnCours;
    if (!ec || !ec.etudiantDA || !ec.grilleId) {
        conteneur.innerHTML = '<p class="eval-vide">Sélectionne un étudiant et une grille pour voir le bilan.</p>';
        return;
    }

    var NOMS_NIV = { 'E': 'Étendu', 'M': 'Maîtrisé', 'D': 'En développement', 'I': 'Incomplet' };
    var ORDRE_NIV = { 'E': 4, 'M': 3, 'D': 2, 'I': 1 };
    var da = ec.etudiantDA;
    var html = '';

    // Charger l'historique
    var historiqueEleve = [];
    try {
        var toutesEvals = obtenirDonneesSelonMode('evaluationsSauvegardees');
        historiqueEleve = toutesEvals
            .filter(function(e) { return e.etudiantDA === da && !e.remplaceeParId; })
            .sort(function(a, b) { return new Date(b.dateEvaluation) - new Date(a.dateEvaluation); })
            .slice(0, 5);
    } catch(e) { console.warn('[Evaluation] historique eleve load skipped:', e.message || e); }
    var evalPrecedente = historiqueEleve.length > 0 ? historiqueEleve[0] : null;

    // Grille pour descriptions
    var grilleDef = null;
    try {
        var grilles = db.getSync('grillesTemplates', []);
        grilleDef = grilles.find(function(g) { return g.id === ec.grilleId; }) || null;
    } catch(e) { console.warn('[Evaluation] grille lookup skipped:', e.message || e); }

    // Critères actuels depuis evaluationEnCours
    var criteres = [];
    if (grilleDef && grilleDef.criteres && ec.criteres) {
        grilleDef.criteres.forEach(function(gc) {
            var niv = ec.criteres[gc.id];
            if (niv) {
                criteres.push({ critereNom: gc.nom, critereId: gc.id, niveauSelectionne: niv, description: gc.description || '' });
            }
        });
    }

    // Patrons récurrents
    var nomsPatrons = [];
    if (historiqueEleve.length >= 2) {
        var cH1 = {}; var cH2 = {};
        if (historiqueEleve[0] && historiqueEleve[0].criteres) historiqueEleve[0].criteres.forEach(function(c) { cH1[c.critereNom] = c.niveauSelectionne; });
        if (historiqueEleve[1] && historiqueEleve[1].criteres) historiqueEleve[1].criteres.forEach(function(c) { cH2[c.critereNom] = c.niveauSelectionne; });
        criteres.forEach(function(c) {
            if ((c.niveauSelectionne === 'I' || c.niveauSelectionne === 'D') &&
                (cH1[c.critereNom] === 'I' || cH1[c.critereNom] === 'D') &&
                (cH2[c.critereNom] === 'I' || cH2[c.critereNom] === 'D')) {
                nomsPatrons.push(c.critereNom);
            }
        });
    }

    // Compter les erreurs de français (annotation du fichier courant)
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

    // === Message d'encouragement + Question métacognitive (en haut, sous le titre) ===
    html += '<p class="eval-vide" style="margin-bottom:6px;">Mes standards sont très élevés à ton égard parce que je crois que tu as tout ce qu’il faut pour les atteindre et j’ai confiance en toi. Si tu as besoin d’aide, viens me voir.</p>';
    html += '<p class="retro-question" style="margin-bottom:8px;">Selon toi, quel aspect de ta production mériterait le plus d’attention ?</p>';

    // === 1. Présentement, il faut se concentrer sur... ===
    html += '<h5>Présentement, il faut se concentrer sur :</h5>';

    var defis = criteres
        .filter(function(c) { return c.niveauSelectionne === 'I' || c.niveauSelectionne === 'D'; })
        .sort(function(a, b) { return (ORDRE_NIV[a.niveauSelectionne] || 0) - (ORDRE_NIV[b.niveauSelectionne] || 0); });
    // Verification explicite M/E : un travail Non recevable (niveau '0') ne doit
    // JAMAIS declencher « tous maitrises » via defis.length === 0 (defis exclut '0').
    var tousMaitrises = criteres.length > 0 &&
        criteres.every(function(c) { return c.niveauSelectionne === 'M' || c.niveauSelectionne === 'E'; });

    // Vérifier si le français écrit est une faiblesse majeure
    // Source 1 : donneesAlgorithmiques (si le calcul a eu lieu)
    // Source 2 : totalErreursFr (comptage direct des annotations)
    var algoA0 = null;
    if (grilleDef) {
        grilleDef.criteres.forEach(function(gc) {
            if (gc.type !== 'algorithmique') return;
            // Source 1 : données algorithmiques calculées
            if (ec.donneesAlgorithmiques && ec.donneesAlgorithmiques[gc.id]) {
                var da = ec.donneesAlgorithmiques[gc.id];
                if (da.pourcentage !== undefined && da.pourcentage <= 0 && da.erreurs > 0) {
                    algoA0 = { critereNom: gc.nom, erreurs: da.erreurs, mots: da.mots };
                }
            }
            // Source 2 : comptage direct des codes d'erreur annotés
            if (!algoA0 && totalErreursFr > 0) {
                var pond = gc.ponderation || 20;
                var facteur = gc.facteurNormalisation || 500;
                var motsEstime = parseInt((document.getElementById('eval_mots_' + gc.id) || {}).value) || 500;
                var noteEstimee = pond - (totalErreursFr / motsEstime * facteur);
                if (noteEstimee <= 0) {
                    algoA0 = { critereNom: gc.nom, erreurs: totalErreursFr, mots: motsEstime };
                }
            }
        });
    }

    if (algoA0) {
        html += '<p>- <strong>la qualité du français écrit est à travailler en priorité</strong> (' + algoA0.critereNom + ' : ' + algoA0.erreurs + ' erreur' + (algoA0.erreurs > 1 ? 's' : '') + ' sur ' + algoA0.mots + ' mots, Insuffisant)</p>';
    }

    if (defis.length > 0) {
        var maxDefis = algoA0 ? 1 : 2;
        for (var i = 0; i < Math.min(maxDefis, defis.length); i++) {
            var d = defis[i];
            // Ne pas répéter le critère algorithmique déjà mentionné
            if (algoA0 && d.critereNom === algoA0.critereNom) { maxDefis++; continue; }
            var desc = d.description ? d.description.toLowerCase() : d.critereNom;
            var patron = nomsPatrons.indexOf(d.critereNom) !== -1 ? '. Cet objectif est prioritaire depuis 3 productions' : '';
            html += '<p>- ' + desc + ' (' + d.critereNom + ' ' + (NOMS_NIV[d.niveauSelectionne] || '') + ')' + patron + '</p>';
        }
    } else if (tousMaitrises && totalErreursFr > 0) {
        html += '<p>Tous les critères sont maîtrisés. Concentre-toi sur la qualité du français (' + totalErreursFr + ' erreur' + (totalErreursFr > 1 ? 's' : '') + ' annotée' + (totalErreursFr > 1 ? 's' : '') + ').</p>';
    } else if (tousMaitrises) {
        // Verifier si maitrise depuis 2+ artefacts (garde length > 0 :
        // .every() retourne true sur tableau vide via vacuite JS).
        var maitriseLongtemps = evalPrecedente && Array.isArray(evalPrecedente.criteres) &&
            evalPrecedente.criteres.length > 0 &&
            evalPrecedente.criteres.every(function(c) { return c.niveauSelectionne === 'M' || c.niveauSelectionne === 'E'; });
        if (maitriseLongtemps) {
            html += '<p class="retro-force">Tous les critères sont maîtrisés depuis plus d’un artefact. Tu peux aider tes collègues — c’est une excellente façon d’étendre tes compétences vers le niveau É (transfert à d’autres contextes).</p>';
        } else {
            html += '<p class="retro-force">Tous les critères sont maîtrisés. Continue sur cette lancée !</p>';
        }
    }

    // Ta force (en contexte)
    var meilleur = null; var meilleurOrdre = 0;
    criteres.forEach(function(c) {
        var o = ORDRE_NIV[c.niveauSelectionne] || 0;
        if (o > meilleurOrdre) { meilleurOrdre = o; meilleur = c; }
    });
    if (meilleur && (meilleur.niveauSelectionne === 'M' || meilleur.niveauSelectionne === 'E') && defis.length > 0) {
        html += '<p class="retro-force">Ta force : ' + meilleur.critereNom + ' (' + (NOMS_NIV[meilleur.niveauSelectionne] || '') + ')</p>';
    }

    // === 2. Points récurrents ===
    var recurrentsHtml = '';

    // Progrès (comparaison de l'élève avec lui-même)
    if (evalPrecedente && evalPrecedente.niveauFinal) {
        var nivAct = document.getElementById('niveauProduction1')?.textContent || '';
        var nivPre = evalPrecedente.niveauFinal;
        var ordreAct = ORDRE_NIV[nivAct] || 0;
        var ordrePre = ORDRE_NIV[nivPre] || 0;
        if (ordreAct > ordrePre) {
            recurrentsHtml += '<p>Progrès : ' + nivPre + ' → ' + nivAct + ' depuis ' + (evalPrecedente.productionNom || 'la production précédente') + '</p>';
        }
    }

    // Amélioration reconnue
    if (evalPrecedente && evalPrecedente.criteres) {
        var criteresPrec = {};
        evalPrecedente.criteres.forEach(function(c) { criteresPrec[c.critereNom] = c.niveauSelectionne; });
        var ameliorations = [];
        criteres.forEach(function(c) {
            var nivP = criteresPrec[c.critereNom];
            if (nivP && (nivP === 'I' || nivP === 'D') && (c.niveauSelectionne === 'M' || c.niveauSelectionne === 'E')) {
                ameliorations.push(c.critereNom);
            }
        });
        if (ameliorations.length > 0) {
            recurrentsHtml += '<p class="retro-amelioration">Tu as progressé en ' + ameliorations.join(' et ') + '.</p>';
        }
    }

    if (recurrentsHtml) {
        html += '<h5>Points récurrents</h5>' + recurrentsHtml;
    }

    // === 3. Jetons utilisés ===
    if (typeof obtenirConfigJetons === 'function' && da) {
        try {
            var configJetons = obtenirConfigJetons();
            if (configJetons && configJetons.actif) {
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
                html += '<h5>Jetons utilisés : ' + jetonsUtilises.length + ' / ' + maxJetons + '</h5>';
                if (jetonsUtilises.length > 0) {
                    html += jetonsUtilises.map(function(j) { return '<p>• ' + j + '</p>'; }).join('');
                }
            }
        } catch(e) { console.warn('[Evaluation] jetons calculation skipped:', e.message || e); }
    }

    conteneur.innerHTML = html;
}

function copierToutRetroaction() {
    var parties = [];

    // Générale
    var texteGen = (document.getElementById('retroactionFinale1') || {}).value || '';
    if (texteGen.trim()) parties.push('=== RÉTROACTION GÉNÉRALE ===\n' + texteGen.trim());

    // Spécifique
    genererRetroactionSpecifique();
    var contenuSpec = document.getElementById('contenuRetroSpecifique');
    if (contenuSpec && contenuSpec.textContent.trim()) {
        parties.push('=== RÉTROACTION SPÉCIFIQUE ===\n' + contenuSpec.textContent.trim());
    }

    // Bilan
    genererRetroactionBilan();
    var contenuBilan = document.getElementById('contenuRetroBilan');
    if (contenuBilan && contenuBilan.textContent.trim()) {
        parties.push('=== BILAN ===\n' + contenuBilan.textContent.trim());
    }

    var texteComplet = parties.join('\n\n');
    if (!texteComplet) {
        alert('Aucune rétroaction à copier');
        return;
    }

    navigator.clipboard.writeText(texteComplet).then(function() {
        _notifSucces('Rétroaction complète copiée (générale + spécifique + bilan) !');
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
