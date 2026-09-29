/* ===============================
   MODULE 15c: PROFIL ÉTUDIANT — RAPPORT
   Extrait de profil-etudiant.js (zone L5362-5752 résidu post-helpers+calculs,
   correspond à L7452-7842 du fichier original) — refactor 18 mai 2026

   Contenu de ce sous-module (11 fonctions) :
   - genererRapportAPI : assemble le rapport de bilan complet
   - genererSectionRapport : rendu UI de la section rapport
   - genererEtAfficherRapport : déclenche génération + affichage
   - copierRapport : copie dans le presse-papier
   - viderRapport : reset
   - sauvegarderPreferencesRapport / restaurerPreferencesRapport :
     persistance des préférences UI rapport (db.getSync/setSync)
   - obtenirNotesRapport / planifierEnregistrementNotesRapport /
     enregistrerNotesRapport : #866, les notes libres de l'enseignant, par élève
     et par trimestre (`<trim>_notesRapport`) — le seul texte enregistré ici

   Tous les exports promus window.X (décision étape 1 b). Logique
   majoritairement pure + manipulations DOM ciblées.

   Chargé APRÈS profil-etudiant-helpers.js et profil-etudiant-calculs.js
   dans index.html (consomme obtenirTermeProduction + calculs indices).
   =============================== */

(function() {
'use strict';

/* ===============================
   📄 GÉNÉRATION DE RAPPORTS
   =============================== */

/**
 * Génère un rapport de bilan pour l'API (version directe et professionnelle)
 * @param {string} da - Numéro DA de l'étudiant
 * @param {Object} options - Options de sections à inclure
 * @returns {string} - Rapport en texte brut
 */
function genererRapportAPI(da, options = {}) {
    // ✨ REFONTE (8 déc 2025) : Format simplifié avec détails des meilleurs artefacts
    // Options par défaut
    const opts = {
        identification: true,
        assiduite: true,
        completion: true,
        performance: true,
        jetons: true,
        ...options
    };

    // 🔄 FORCER le recalcul des indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    const etudiant = obtenirDonneesSelonMode('groupeEtudiants').find(e => e.da === da);
    if (!etudiant) return 'Erreur : Étudiant non trouvé';

    const indices = calculerTousLesIndices(da);
    const detailsA = obtenirDetailsAssiduite(da);

    // #732 — LES TROIS NOMBRES VIENNENT DE `calculerTousLesIndices`, la source du profil et de la Liste
    // (règle « même source » de #699). Avant : le rapport comptait des `artefact-portfolio` que le cours
    // n'a pas forcément (« 0 remises / 0 productions ») et recalculait P à sa manière (« 75 % (4 meilleurs
    // artefacts actuels) » là où la note du cours dit 77). Audit de l'onglet Suivi, 5 sept. 2026, B-5.
    const productions = obtenirDonneesSelonMode('productions') || [];
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // #871, volet complétion (17 sept. 2026) — LA FRACTION VIENT DE LA PRATIQUE QUI A CALCULÉ C. Ce rapport
    // recomptait ici les productions à sa façon (`obtenirIdsProductionsEvaluables` : en standards, les seuls
    // artefacts du portfolio) à côté d'un indice qui compte aussi l'évaluation terminale : « 80% (7 remises /
    // 9 productions) ». Il lit maintenant le détail dont l'indice découle, et ne compte plus rien lui-même.
    const detailsC = obtenirDetailsCompletion(da) || { remis: 0, total: 0 };
    // La règle unique (#706, registre) reste celle de la liste des évaluations du volet Performance, plus bas.
    const compteDansLaNote = (e) => window.evaluationEntreDansLaNote(e);

    let rapport = '';

    // ✅ NOUVEAU (29 déc 2025): Détecter le mode anonymisation
    const modeAnonymisation = typeof estModeeLectureSeule === 'function' && estModeeLectureSeule();

    // 1. IDENTIFICATION
    if (opts.identification) {
        // Ne pas afficher le DA en mode anonymisation
        const daTexte = modeAnonymisation ? '' : ` (DA: ${etudiant.da})`;
        rapport += `${etudiant.prenom} ${etudiant.nom}${daTexte}\n\n`;
    }

    // 2. ASSIDUITÉ
    if (opts.assiduite) {
        // #871 — la fraction montre les présences telles que saisies (« 22,5 »), le pourcentage en découle.
        // #743 (lot D) : une assiduité inconnue s'écrit d'un tiret, jamais « null% » ni 100 %.
        rapport += `Assiduité : ${indices.A === null ? '—' : indices.A + '%'} (${formaterNombrePeriodes(detailsA.periodesPresentes)} / ${formaterNombrePeriodes(detailsA.periodesOffertes)} périodes)\n\n`;
    }

    // 3. COMPLÉTION
    if (opts.completion) {
        // Lot N1b (21 sept. 2026) : sans pratique assignée, la complétion est inconnue — un tiret, jamais « null% » ni 0 %.
        rapport += (indices.C === null)
            ? `Complétion : —\n\n`
            : `Complétion : ${indices.C}% (${detailsC.remis} remises / ${detailsC.total} productions)\n\n`;
    }

    // 4. PERFORMANCE — la note du cours, telle que le profil l'affiche, et les évaluations qui y entrent (#706).
    if (opts.performance) {
        if (indices.noteConstructible === false) {
            // Lot N4 (#713) : la cause que la pratique déclare, sinon celle d'avant.
            const cause = (typeof causeNoteNonConstructible === 'function') ? causeNoteNonConstructible(da) : null;
            rapport += `Performance : non constructible (${cause || 'aucune évaluation ne compte encore dans la note du cours'})\n\n`;
        } else {
            rapport += `Performance : ${indices.P}% (note du cours)\n\n`;
        }

        const evaluationsComptees = evaluations
            .filter(e => e.etudiantDA === da && e.productionId && compteDansLaNote(e))
            .map(e => {
                const production = productions.find(p => p.id === e.productionId);
                return {
                    productionNom: production?.activiteApprentissage || production?.description || production?.titre || production?.nom || `Production ${e.productionId}`,
                    niveauFinal: ((typeof niveauFinalAffichable === 'function') ? (niveauFinalAffichable(e) || null) : (e.niveauFinal || null)),   // #941 lot S1
                    notePct: parseFloat(e.noteFinale),
                    date: e.dateEvaluation || e.dateCreation || ''
                };
            })
            .sort((a, b) => String(a.date).localeCompare(String(b.date)));

        evaluationsComptees.forEach((art, idx) => {
            const niveau = (art.niveauFinal !== null && art.niveauFinal !== undefined && art.niveauFinal !== '') ? `${art.niveauFinal} ` : '';
            rapport += `${idx + 1}- ${art.productionNom} : ${niveau}(${isNaN(art.notePct) ? '—' : art.notePct.toFixed(1)})\n`;
        });
        if (evaluationsComptees.length > 0) rapport += `\n`;
    }

    // 5. GESTION DES JETONS
    if (opts.jetons) {
        // Lire la configuration globale des jetons (nombreParEleve = quota total)
        const modalites = obtenirDonneesSelonMode('modalitesEvaluation') || {};
        const configJetons = modalites.configurationJetons || {};
        const nbDisponibles = configJetons.nombreParEleve || 0;

        if (nbDisponibles > 0) {
            // Compter les jetons utilisés via la fonction officielle si disponible
            let nbUtilises = 0;
            const details = [];

            if (typeof obtenirStatutJetonsEtudiant === 'function') {
                const statutJetons = obtenirStatutJetonsEtudiant(da);
                Object.keys(statutJetons).forEach(typeId => {
                    const info = statutJetons[typeId];
                    if (info && info.utilises > 0) {
                        nbUtilises += info.utilises;
                        // Simplifier le nom du type
                        const nomCourt = info.nom.replace('Jeton de ', '').replace('Jeton ', '');
                        details.push(`${nomCourt}: ${info.utilises}`);
                    }
                });
            }

            rapport += `Jetons : ${nbUtilises} / ${nbDisponibles} utilisés`;
            if (details.length > 0) {
                rapport += ` (${details.join(', ')})`;
            }
            rapport += `\n`;
        }
    }

    return rapport.trim();
}

/**
 * Génère l'interface de la section Rapport avec toggle et bouton copier
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {string} - HTML de la section
 */
function genererSectionRapport(da) {
    const etudiant = obtenirDonneesSelonMode('groupeEtudiants').find(e => e.da === da);
    if (!etudiant) return '<p>Erreur : Étudiant non trouvé</p>';

    // #866 — le mode anonymisation sert à MONTRER l'écran : le rapport y masque déjà le DA,
    // et « Mes notes » y est vide et désactivée. Ce que Grégoire écrit sur un élève ne se
    // projette pas devant une salle, et le mode n'écrit rien (le DA réel, lui, est conservé
    // par modes.js : sans cette garde, une note prise en démonstration irait dans son codex).
    const enAnonymisation = typeof estModeeLectureSeule === 'function' && estModeeLectureSeule();

    return `
        <div style="max-width: 900px;">
            <!-- Carte principale (Proposition 2) -->
            <div class="profil-carte">
                <!-- En-tête minimaliste -->
                <h3 style="margin: 0 0 20px 0; color: var(--accent-primaire); font-size: 1.1rem; border-bottom: 2px solid var(--bleu-pale); padding-bottom: 10px;">
                    <span class="primo-aide" data-target="conseil-rapport"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                </h3>

                <!-- Conseil Primo: Informations sur le rapport -->
                <div id="conseil-rapport" class="carte-info-toggle carte-info-conseil" style="display: none;">
                    <strong>À propos du rapport :</strong>
                    <p>Le rapport est généré à la demande avec les données actuelles. Son texte ne s'enregistre nulle part : si tu le modifies, copie-le avant de quitter l'écran. Tes notes, dans le champ du dessous, s'enregistrent.</p>
                </div>

                <!-- Grid 2 colonnes : Paramètres + Actions -->
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 30px; align-items: start;">
                    <!-- Colonne gauche : Paramètres -->
                    <div>
                        <!-- Sections à inclure -->
                        <div class="u-texte-mini" style="color: var(--gris-moyen); margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;" data-tooltip="profil-rapport-sections">
                            Sections à inclure
                        </div>
                        <div class="grille-checkboxes u-mb-10">
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-identification-${da}" data-on-change="cocherSectionRapport" data-param="${da}" checked>
                                Identification
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-assiduite-${da}" data-on-change="cocherSectionRapport" data-param="${da}" checked>
                                Assiduité
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-completion-${da}" data-on-change="cocherSectionRapport" data-param="${da}" checked>
                                Complétion
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-performance-${da}" data-on-change="cocherSectionRapport" data-param="${da}" checked>
                                Performance
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-jetons-${da}" data-on-change="cocherSectionRapport" data-param="${da}" checked>
                                Jetons
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-date-${da}" data-on-change="cocherSectionRapport" data-param="${da}" checked>
                                Date
                            </label>
                        </div>
                    </div>

                    <!-- Colonne droite : Actions -->
                    <div style="display: flex; flex-direction: column; gap: 10px; min-width: 120px;">
                        <button class="btn btn-principal u-w-100" data-action="copierRapport" data-param="${da}">
                            Copier
                        </button>
                    </div>
                </div>
            </div>

            <!-- Zone de texte du rapport : REGÉNÉRÉE à chaque ouverture, jamais enregistrée.
                 #866 — son placeholder promettait « tu peux ajouter tes commentaires » sans
                 rien retenir : les notes prises ici disparaissaient au retour dans la section.
                 Ce qui doit rester se tape dans « Mes notes », juste en dessous. -->
            <div class="profil-position-relative-mt15">
                <textarea id="textarea-rapport-${da}"
                          placeholder="Le rapport apparaîtra ici, refait à chaque ouverture avec les données du jour. Pour des notes qui restent, utilise « Mes notes » plus bas."
                          style="width: 100%; height: 300px; padding: 15px; font-family: 'Courier New', monospace; font-size: 0.9rem; border: 2px solid var(--bleu-pale); border-radius: 6px; resize: vertical; line-height: 1.6; background: var(--surface-conteneur, #142428); overflow-y: auto;"></textarea>
            </div>

            <!-- #866 — « Mes notes » : le SEUL texte de cette section qui est enregistré.
                 Écrit au geste (input débounçé + change au blur), relu au rendu, par élève
                 et par trimestre (clé trim_notesRapport ; pas d'accent grave dans ce
                 commentaire : il vit DANS un gabarit, un accent grave le refermerait).
                 Le contenu est posé ici même dans
                 le HTML : pas de second appel à programmer après le rendu, donc rien à
                 perdre dans un délai. -->
            <div class="groupe-form u-mt-15">
                <label for="textarea-notes-rapport-${echapperHtml(da)}">
                    Mes notes
                    <span class="u-texte-mini" style="color: var(--gris-moyen); font-weight: 400;">${enAnonymisation ? '— masquées en mode anonymisation' : '— enregistrées à mesure, gardées d\'une visite à l\'autre'}</span>
                </label>
                <textarea id="textarea-notes-rapport-${echapperHtml(da)}"
                          class="controle-form"
                          rows="6"
                          ${enAnonymisation ? 'disabled' : 'data-on-input="planifierEnregistrementNotesRapport" data-on-change="enregistrerNotesRapport"'}
                          data-param="${echapperHtml(da)}"
                          placeholder="${enAnonymisation ? 'Tes notes sur cet élève ne sont pas affichées quand l\'écran est montré.' : 'Tes observations sur cet élève. Elles restent ici, et s\'ajoutent au bas du rapport quand tu le copies.'}"
                          style="line-height: 1.6; resize: vertical;">${enAnonymisation ? '' : echapperHtml(obtenirNotesRapport(da))}</textarea>
            </div>
        </div>
    `;
}

/**
 * Génère et affiche le rapport dans la zone de texte
 * @param {string} da - Numéro DA
 */
function genererEtAfficherRapport(da) {
    const textarea = document.getElementById(`textarea-rapport-${da}`);

    if (!textarea) {
        console.error('Textarea non trouvé');
        return;
    }

    // Lot 4 du cadrage 11 (#754 / P-2, 11 sept. 2026) : les cases ne s'écrivent plus
    // ici — ce chemin est aussi celui du RENDU (restaurerPreferencesRapport), qui
    // réécrivait la clé trois ou quatre fois à l'ouverture. Elles s'écrivent au
    // geste, dans `cocherSectionRapport`.

    // Lire les options de sections à inclure
    const options = {
        identification: document.getElementById(`inclure-identification-${da}`)?.checked ?? true,
        assiduite: document.getElementById(`inclure-assiduite-${da}`)?.checked ?? true,
        completion: document.getElementById(`inclure-completion-${da}`)?.checked ?? true,
        performance: document.getElementById(`inclure-performance-${da}`)?.checked ?? true,
        jetons: document.getElementById(`inclure-jetons-${da}`)?.checked ?? true,
        date: document.getElementById(`inclure-date-${da}`)?.checked ?? true
    };

    // Générer le rapport (toujours version API)
    let rapport = '';
    try {
        rapport = genererRapportAPI(da, options);
    } catch (error) {
        rapport = `Erreur lors de la génération du rapport :\n\n${error.message}`;
        console.error('Erreur génération rapport:', error);
    }

    // Afficher le rapport
    textarea.value = rapport;

}

/**
 * Copie le contenu du rapport dans le presse-papiers
 * @param {string} da - Numéro DA
 */
function copierRapport(da) {
    const textarea = document.getElementById(`textarea-rapport-${da}`);

    if (!textarea || !textarea.value || textarea.value.trim() === '') {
        alert('Génère d\'abord un rapport avant de le copier.');
        return;
    }

    // #866 — ce qu'on copie, c'est le rapport ET les notes. Les notes viennent du
    // champ affiché (la frappe de la seconde d'avant peut ne pas être encore écrite),
    // et le stockage sert de filet si la section n'est pas rendue.
    const champNotes = document.getElementById(`textarea-notes-rapport-${da}`);
    const notes = (champNotes ? champNotes.value : obtenirNotesRapport(da)).trim();
    const texteComplet = notes
        ? `${textarea.value.trimEnd()}\n\nNotes de l'enseignant :\n${notes}`
        : textarea.value;

    // Sélectionner le champ visible reste utile : c'est ce que `execCommand` copie
    // en dernier recours, et cela montre à l'enseignant ce qui part.
    textarea.select();

    try {
        // Méthode moderne (Clipboard API)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(texteComplet).then(() => {
                notifications.succes("Rapport copié dans le presse-papiers !");
            }).catch(err => {
                // Fallback vers ancienne méthode
                const success = document.execCommand('copy');
                if (success) {
                    notifications.succes("Rapport copié dans le presse-papiers !");
                } else {
                    alert('La copie a échoué. Sélectionne le texte manuellement (Ctrl+A puis Ctrl+C).');
                }
            });
        } else {
            // Ancienne méthode pour navigateurs plus vieux
            const success = document.execCommand('copy');
            if (success) {
                notifications.succes("Rapport copié dans le presse-papiers !");
            } else {
                alert('La copie a échoué. Sélectionne le texte manuellement (Ctrl+A puis Ctrl+C).');
            }
        }
    } catch (err) {
        console.error('Erreur copie:', err);
        alert('La copie a échoué. Sélectionne le texte manuellement (Ctrl+A puis Ctrl+C).');
    }

}

/**
 * Vide le contenu du rapport
 * @param {string} da - Numéro DA
 */
function viderRapport(da) {
    const textarea = document.getElementById(`textarea-rapport-${da}`);
    const btnCopier = document.getElementById(`btn-copier-rapport-${da}`);

    if (textarea) {
        textarea.value = 'Clique sur "Générer le rapport" pour afficher le contenu…';
    }

    if (btnCopier) {
        btnCopier.disabled = true;
    }
}

/**
 * Le geste sur une case « Inclure … » : mémoriser, puis régénérer.
 * ⮕ P-2 (lot 4 du cadrage 11) : c'est le SEUL chemin qui écrit les préférences
 * — pas le rendu. Les six cases sont de la forme, par trimestre, pas par élève.
 * @param {string} da - Numéro DA
 */
function cocherSectionRapport(da) {
    sauvegarderPreferencesRapport(da);
    genererEtAfficherRapport(da);
}

/* ===============================
   📝 « MES NOTES » DU RAPPORT (#866, 15 sept. 2026)
   ===============================
   Le rapport lui-même n'est pas enregistré : il est refait à chaque ouverture
   à partir des données du jour, pour qu'on ne copie jamais des chiffres périmés.
   Les notes de l'enseignant, elles, sont à lui — elles vivent sous
   `<trim>_notesRapport`, un objet { [da]: texte }, dans la même forme que
   `preferencesRapport` (une clé par trimestre, pas une clé par élève).

   Le geste écrit, le rendu ne fait que lire : `input` planifie l'écriture
   (débounce 400 ms, pour ne pas toucher le stockage à chaque frappe) et
   `change` — le blur, qui précède le clic sur une autre sous-section — la force
   tout de suite. Les deux capturent la VALEUR au moment du geste : si le nœud
   est détruit entre-temps par un changement de section, le texte est déjà en
   main.
*/

let _notesEnAttente = null;   // { da, texte } saisi mais pas encore écrit
let _timerNotes = null;

/**
 * Le texte des notes d'un élève, ou '' s'il n'y en a pas.
 * @param {string} da - Numéro DA
 * @returns {string}
 */
function obtenirNotesRapport(da) {
    // La frappe de la seconde d'avant peut ne pas être encore écrite (débounce) : ce qui
    // attend EST la valeur la plus fraîche. Mesuré le 15 sept. : une navigation faite par
    // du code — `el.click()` sur un item de la barre latérale — ne déplace pas le focus,
    // donc n'émet aucun `change`, et le rendu suivant relisait un stockage en retard.
    // Lire l'attente ne fait écrire personne : l'invariant « le rendu n'écrit rien » tient.
    if (_notesEnAttente && String(_notesEnAttente.da) === String(da)) return _notesEnAttente.texte;

    const toutes = db.getSync(cle('notesRapport'), {}) || {};
    const texte = toutes[String(da)];
    return typeof texte === 'string' ? texte : '';
}

/**
 * Écrit ce qui attend. Rien à faire si aucun geste n'est en attente.
 * Une note vidée RETIRE son entrée : pas de chaîne vide qui traîne.
 */
function ecrireNotesRapportEnAttente() {
    if (_timerNotes) { clearTimeout(_timerNotes); _timerNotes = null; }
    if (!_notesEnAttente) return;
    // Ceinture : le champ est déjà désactivé en anonymisation, mais rien n'écrit dans le
    // codex depuis un écran de démonstration.
    if (typeof estModeeLectureSeule === 'function' && estModeeLectureSeule()) { _notesEnAttente = null; return; }

    const { da, texte } = _notesEnAttente;
    _notesEnAttente = null;

    const toutes = db.getSync(cle('notesRapport'), {}) || {};
    if (texte.trim() === '') {
        delete toutes[String(da)];
    } else {
        toutes[String(da)] = texte;
    }
    db.setSync(cle('notesRapport'), toutes); // security-ok: texte saisi par l'enseignant dans son propre champ (aucune source externe), échappé par echapperHtml au rendu
    if (window.signalerEcritureUsager) window.signalerEcritureUsager(cle('notesRapport'));   // lot F : geste hors témoin (ecrireNotesRapportEnAttente)
}

/**
 * `data-on-input` : mémoriser la frappe et planifier l'écriture.
 * @param {string} da - Numéro DA
 * @param {HTMLTextAreaElement} el - Le champ, fourni par le dispatcher
 */
function planifierEnregistrementNotesRapport(da, el) {
    if (!el || typeof el.value !== 'string') return;
    _notesEnAttente = { da: da, texte: el.value };
    if (_timerNotes) clearTimeout(_timerNotes);
    _timerNotes = setTimeout(ecrireNotesRapportEnAttente, 400);
}

/**
 * `data-on-change` : le champ perd le focus — écrire sans attendre.
 * C'est ce chemin qui sauve la note quand on clique sur une autre sous-section :
 * le blur part avant que le rendu ne détruise le nœud.
 * @param {string} da - Numéro DA
 * @param {HTMLTextAreaElement} el - Le champ, fourni par le dispatcher
 */
function enregistrerNotesRapport(da, el) {
    if (!el || typeof el.value !== 'string') return;
    _notesEnAttente = { da: da, texte: el.value };
    ecrireNotesRapportEnAttente();
}

/**
 * Sauvegarde les préférences du rapport — par TRIMESTRE (`cle()`), pas par élève.
 * ⮕ P-2 : la clé nue `preferencesRapport` était partagée entre trimestres et entre
 * élèves ; la nue devient orpheline (aucun semis : six cases de forme, pas un
 * contenu ; `diagnostic-353` la connaît).
 * @param {string} da - Numéro DA
 */
function sauvegarderPreferencesRapport(da) {
    const preferences = {
        identification: document.getElementById(`inclure-identification-${da}`)?.checked ?? true,
        assiduite: document.getElementById(`inclure-assiduite-${da}`)?.checked ?? true,
        completion: document.getElementById(`inclure-completion-${da}`)?.checked ?? true,
        performance: document.getElementById(`inclure-performance-${da}`)?.checked ?? true,
        jetons: document.getElementById(`inclure-jetons-${da}`)?.checked ?? true,
        date: document.getElementById(`inclure-date-${da}`)?.checked ?? true
    };

    db.setSync(cle('preferencesRapport'), preferences);
}

/**
 * Restaure les préférences du rapport depuis localStorage
 * @param {string} da - Numéro DA
 */
function restaurerPreferencesRapport(da) {
    // db.getSync retourne déjà l'objet parsé, pas besoin de JSON.parse
    const preferences = db.getSync(cle('preferencesRapport'), null);

    // Restaurer les checkboxes de sections
    const sections = ['identification', 'assiduite', 'completion', 'performance', 'jetons', 'date'];
    sections.forEach(section => {
        const checkbox = document.getElementById(`inclure-${section}-${da}`);
        if (checkbox && preferences && preferences[section] !== undefined) {
            checkbox.checked = preferences[section];
        }
    });

    // Générer automatiquement le rapport après restauration des préférences
    genererEtAfficherRapport(da);
}

// Exporter les fonctions vers window (décision étape 1 b — convention systématique)
window.genererRapportAPI = genererRapportAPI;
window.cocherSectionRapport = cocherSectionRapport;   // P-2 (lot 4 du cadrage 11)
window.genererSectionRapport = genererSectionRapport;
window.genererEtAfficherRapport = genererEtAfficherRapport;
window.copierRapport = copierRapport;
window.viderRapport = viderRapport;
window.obtenirNotesRapport = obtenirNotesRapport;                                   // #866
window.planifierEnregistrementNotesRapport = planifierEnregistrementNotesRapport;   // #866 (data-on-input)
window.enregistrerNotesRapport = enregistrerNotesRapport;                           // #866 (data-on-change)
window.sauvegarderPreferencesRapport = sauvegarderPreferencesRapport;
window.restaurerPreferencesRapport = restaurerPreferencesRapport;

})();
