/* ===============================
   MODULE: PRÉSENCES — GRILLE IMPRIMABLE (#485)

   Rôle: LECTEUR strict.
   Génère un PDF paysage lettre « élèves × séances » qui sert à la fois de
   rapport de saisie et de formulaire papier : les séances déjà saisies
   affichent ✓ (présence complète), ✗ (absence) ou le nombre de périodes
   (présence partielle) ; les cases vides se remplissent au crayon en classe,
   puis se reportent dans l'écran de saisie.

   Sources de données (lecture seule) :
   - cle('groupesCours')                  → groupes-cours du trimestre
   - obtenirSeancesCompletesDuGroupe(id)  → séances d'un groupe DÉSIGNÉ (#416,
     porte en lecture stricte : jamais de génération, jamais d'écriture)
   - obtenirDonneesSelonMode('groupeEtudiants') / ('presences')
   - obtenirPreference('rapportPresencesOptions') via l'API preferences.js
     (seule écriture du module : definirPreference, même clé)

   API publique:
   - construireModeleRapportPresences(etudiants, seancesParDate, presences, options)
     Fonction PURE (testée dans tests/unit/presences-rapport-485.test.js).
   - genererRapportPresencesPDF() : collecte + rendu jsPDF/autotable
   - restaurerOptionsRapportPresences() / sauvegarderOptionsRapportPresences()
   =============================== */

(function() {
'use strict';

/* ===============================
   CONFIGURATION
   =============================== */

// Mise en page (mm) — format lettre paysage : 279.4 × 215.9
const PAGE_LARGEUR = 279.4;
const PAGE_HAUTEUR = 215.9;
const MARGE = 10;
// Largeur minimale d'une colonne de séance. Porte terrain #485 (21 août) :
// à 5,5 mm la date d'en-tête « jj/mm » ne tenait pas et autotable la coupait
// en « 21… ». 6,5 mm = « jj/mm » complet à 5,5 pt AVEC le padding, et un
// horaire 2×2 (30 séances) tient encore sur une seule page en options par
// défaut (197,4 mm ÷ 30 = 6,58 mm). Sous ce seuil, on coupe en pages.
const LARGEUR_MIN_COL_SEANCE = 6.5;
const LARGEURS_COLONNES_FIXES = {
    nom: 38,
    da: 16,
    sousGroupe: 12,
    programme: 15,
    nomProgramme: 30,
    sa: 9
};

const OPTIONS_DEFAUT = {
    da: false,
    sousGroupe: false,
    programme: true,
    nomProgramme: false,
    sa: true,
    portee: 'actif',
    // Notation des cases saisies (retouches terrain, 21 août) :
    // 'crochet'  = ✓ complète · ✗ absence · chiffre partielle
    // 'x'        = X absence · chiffre partielle · rien = présence complète
    // 'presence' = périodes de présence partout (2 / 1 / 0), style feuille papier
    // 'absence'  = périodes d'absence quand il y en a, rien si présence complète
    notation: 'crochet'
};

const NOTATIONS_VALIDES = ['crochet', 'x', 'presence', 'absence'];

/* ===============================
   FONCTION PURE — MODÈLE DE LA GRILLE
   =============================== */

/**
 * Construit le modèle de la grille présences pour UN groupe.
 * Fonction pure : aucune lecture de stockage, aucune dépendance DOM.
 *
 * @param {Array} etudiants - [{da, nom, prenom, groupe, programme, sa, coursId}]
 * @param {Object} seancesParDate - {'YYYY-MM-DD': [{numeroSemaine, nombrePeriodes, duree}]}
 * @param {Array} presences - [{date, da, periodesPresentes, heures, coursId, facultatif}]
 * @param {Object} options - {coursId: string|null, dureePeriode: number}
 * @returns {{colonnes: Array, lignes: Array}}
 *   colonnes[i] = {date, code, jourMois, periodesAttendues}
 *   lignes[j]   = {etudiant, cellules: [{etat, texte}]}
 *   etat ∈ 'present' | 'absent' | 'partiel' | 'vide'
 */
function construireModeleRapportPresences(etudiants, seancesParDate, presences, options) {
    const coursId = options && options.coursId ? options.coursId : null;
    const dureePeriode = options && options.dureePeriode > 0 ? options.dureePeriode : (window.DUREE_PERIODE_DEFAUT || 50);

    // --- Colonnes : une par date de séance réelle, triées ---
    const dates = Object.keys(seancesParDate || {})
        .filter(d => Array.isArray(seancesParDate[d]) && seancesParDate[d].length > 0)
        .sort();

    const rangParSemaine = {};
    const colonnes = dates.map(date => {
        const seances = seancesParDate[date];

        // Périodes attendues : agrégation identique à `obtenirNombrePeriodesSeance`.
        // #540 lot E2 (26 août 2026) : on LIT `nombrePeriodes`, sans plus convertir de
        // durée — une période comprend sa pause, la division gonflait le compte dès la
        // troisième. Et le repli « sinon 2 » disparaît : une grille imprimable qui
        // annonce deux périodes là où l'horaire n'en dit aucune fait saisir des absences
        // sur des périodes qui n'existent pas.
        const periodesAttendues = seances.reduce((acc, s) => {
            const p = s ? parseInt(s.nombrePeriodes, 10) : 0;
            return acc + (p > 0 ? p : 0);
        }, 0);

        // Code de séance « 1a/1b… » : numeroSemaine porté par la séance +
        // rang de la date à l'intérieur de sa semaine (ordre chronologique).
        const premiere = seances.find(s => s && s.numeroSemaine);
        const numeroSemaine = premiere ? parseInt(premiere.numeroSemaine, 10) : null;
        let code = '';
        if (numeroSemaine) {
            rangParSemaine[numeroSemaine] = (rangParSemaine[numeroSemaine] || 0) + 1;
            const rang = rangParSemaine[numeroSemaine];
            code = rang <= 26 ? `${numeroSemaine}${String.fromCharCode(96 + rang)}` : `${numeroSemaine}`;
        }

        const [, mois, jour] = date.split('-');
        return { date, code, jourMois: `${jour}/${mois}`, periodesAttendues };
    });

    // --- Index des présences : UNE passe (patron perf #397) ---
    // Facultatives exclues (rattrapages RàI hors séance officielle) ; coursId
    // apparié comme dans saisie-presences.js : on n'écarte que si les deux
    // côtés sont définis ET différents.
    const presenceParCle = new Map();
    (presences || []).forEach(p => {
        if (!p || !p.date || !p.da) return;
        if (p.facultatif === true) return;
        if (coursId && p.coursId && p.coursId !== coursId) return;
        presenceParCle.set(`${p.date}|${p.da}`, p);
    });

    // --- Lignes : tri alphabétique nom + prénom ---
    const lignes = (etudiants || [])
        .filter(e => e && e.da)
        .slice()
        .sort((a, b) => {
            const nomA = `${a.nom || ''} ${a.prenom || ''}`.toLowerCase();
            const nomB = `${b.nom || ''} ${b.prenom || ''}`.toLowerCase();
            return nomA.localeCompare(nomB);
        })
        .map(etudiant => {
            const cellules = colonnes.map(col => {
                const p = presenceParCle.get(`${col.date}|${etudiant.da}`);
                if (!p) return { etat: 'vide', texte: '' };

                // periodesPresentes depuis Beta 95.1 ; avant, seules les heures
                // étaient stockées — reconversion (heures × 60 / durée période).
                let periodes = p.periodesPresentes;
                if (periodes === undefined || periodes === null) {
                    periodes = ((p.heures || 0) * 60) / dureePeriode;
                }
                periodes = Math.round(periodes * 10) / 10;

                const texteChiffre = formaterNombre(periodes);
                if (periodes <= 0) return { etat: 'absent', texte: '', periodes: periodes };
                if (periodes >= col.periodesAttendues) return { etat: 'present', texte: '', periodes: periodes };
                return { etat: 'partiel', texte: texteChiffre, periodes: periodes };
            });
            return { etudiant, cellules };
        });

    return { colonnes, lignes };
}

/* ===============================
   COLLECTE — LECTURE SEULE DU STOCKAGE
   =============================== */

/**
 * Groupes-cours visés par la génération.
 * @param {string} portee - 'actif' ou 'tous'
 * @returns {Array} groupes-cours [{id, coursId, groupeNum, modeCours, actif}]
 */
function listerGroupesCoursCibles(portee) {
    const liste = db.getSync(cle('groupesCours'), []);
    if (Array.isArray(liste) && liste.length > 0) {
        const reels = liste.filter(gc => gc && gc.id);
        if (portee === 'tous') return reels;
        const actif = reels.find(gc => gc.actif);
        if (actif) return [actif];
        if (reels.length > 0) return [reels[0]];
    }

    // Filet legacy : aucun groupesCours — se rabattre sur le contexte actif.
    const contexte = typeof obtenirContexteCoursActif === 'function'
        ? obtenirContexteCoursActif() : null;
    if (contexte && contexte.id) {
        return [{
            id: null,
            coursId: contexte.id,
            groupeNum: contexte.groupe || null,
            modeCours: !!contexte._modeCours,
            actif: true
        }];
    }
    return [];
}

/**
 * Séances d'un groupe-cours, sans jamais déclencher de génération pour un
 * groupe étranger (porte stricte #416). Le filet legacy (id null) est le
 * groupe ACTIF : obtenirSeancesCompletes y est sûre.
 */
function seancesDuGroupe(gc) {
    if (gc.id && typeof obtenirSeancesCompletesDuGroupe === 'function') {
        return obtenirSeancesCompletesDuGroupe(gc.id) || {};
    }
    if (!gc.id && typeof obtenirSeancesCompletes === 'function') {
        return obtenirSeancesCompletes() || {};
    }
    return {};
}

/**
 * Étudiants d'un groupe-cours désigné. Parité avec le filtrage de
 * obtenirEtudiantsCoursActif (modes.js) : coursId d'abord, puis groupeNum
 * normalisé sur 5 chiffres ; mode cours = tous les groupes confondus.
 */
function etudiantsDuGroupe(gc) {
    const tous = (typeof obtenirDonneesSelonMode === 'function'
        ? obtenirDonneesSelonMode('groupeEtudiants')
        : db.getSync(cle('groupeEtudiants'), [])) || [];

    const normaliser = g => String(g || '').padStart(5, '0');
    let filtres = tous.filter(e => {
        if (!e) return false;
        if (e.coursId && gc.coursId && e.coursId !== gc.coursId) return false;
        if (gc.modeCours || !gc.groupeNum) return true;
        const groupeEtudiant = e.groupeReel || e.groupe;
        if (!groupeEtudiant) return true;
        return normaliser(groupeEtudiant) === normaliser(gc.groupeNum);
    });

    if (typeof estEtudiantExclu === 'function') {
        filtres = filtres.filter(e => !estEtudiantExclu(e));
    }
    return filtres;
}

/* ===============================
   OPTIONS — PANNEAU ET PERSISTANCE
   =============================== */

const IDS_CASES = {
    da: 'rp-opt-da',
    sousGroupe: 'rp-opt-sousgroupe',
    programme: 'rp-opt-programme',
    nomProgramme: 'rp-opt-nomprogramme',
    sa: 'rp-opt-sa'
};

function lireOptionsStockees() {
    const lues = typeof obtenirPreference === 'function'
        ? obtenirPreference('rapportPresencesOptions') : null;
    return Object.assign({}, OPTIONS_DEFAUT, lues || {});
}

/** Reflète les options mémorisées dans le panneau (idempotent). */
function restaurerOptionsRapportPresences() {
    const opts = lireOptionsStockees();
    Object.keys(IDS_CASES).forEach(nom => {
        const caseOpt = document.getElementById(IDS_CASES[nom]);
        if (caseOpt) caseOpt.checked = opts[nom] === true;
    });
    const selectPortee = document.getElementById('rp-portee');
    if (selectPortee) selectPortee.value = opts.portee === 'tous' ? 'tous' : 'actif';
    const notation = NOTATIONS_VALIDES.includes(opts.notation) ? opts.notation : 'crochet';
    const radioNotation = document.querySelector(`input[name="rp-notation"][value="${notation}"]`);
    if (radioNotation) radioNotation.checked = true;
}

/** Lit le panneau et persiste le choix (appelée par data-on-change). */
function sauvegarderOptionsRapportPresences() {
    const opts = {};
    Object.keys(IDS_CASES).forEach(nom => {
        const caseOpt = document.getElementById(IDS_CASES[nom]);
        opts[nom] = caseOpt ? caseOpt.checked === true : OPTIONS_DEFAUT[nom];
    });
    const selectPortee = document.getElementById('rp-portee');
    opts.portee = selectPortee && selectPortee.value === 'tous' ? 'tous' : 'actif';
    const radioNotation = document.querySelector('input[name="rp-notation"]:checked');
    opts.notation = radioNotation && NOTATIONS_VALIDES.includes(radioNotation.value)
        ? radioNotation.value : 'crochet';
    if (typeof definirPreference === 'function') {
        definirPreference('rapportPresencesOptions', opts);
    }
    return opts;
}

/** Ouvre la modale (bouton « Rapport » de la barre d'actions, a gauche d'Enregistrer). */
function ouvrirModaleRapportPresences() {
    restaurerOptionsRapportPresences();
    afficherStatutRapport('');
    const modale = document.getElementById('modaleRapportPresences');
    if (modale) modale.classList.add('actif');
}

function fermerModaleRapportPresences() {
    const modale = document.getElementById('modaleRapportPresences');
    if (modale) modale.classList.remove('actif');
}

function afficherStatutRapport(message) {
    const statut = document.getElementById('rp-statut');
    if (statut) {
        statut.textContent = message || '';
        statut.classList.toggle('u-hide', !message);
    }
}

/* ===============================
   RENDU PDF
   =============================== */

/** « 2026-08-21 » → « 21 août 2026 » (l'en-tête parle français, porte 2.14). */
function formaterDateFrancaise(ymd) {
    const morceaux = String(ymd || '').split('-');
    if (morceaux.length !== 3) return ymd;
    const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const mois = MOIS[parseInt(morceaux[1], 10) - 1];
    return mois ? `${parseInt(morceaux[2], 10)} ${mois} ${morceaux[0]}` : ymd;
}

/** Crochet ✓ tracé au trait (les polices standard jsPDF n'ont pas U+2713). */
function dessinerCrochet(doc, cx, cy, t) {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.35);
    doc.line(cx - t * 0.45, cy + t * 0.05, cx - t * 0.1, cy + t * 0.4);
    doc.line(cx - t * 0.1, cy + t * 0.4, cx + t * 0.5, cy - t * 0.4);
}

/** Croix ✗ tracée au trait. */
function dessinerCroix(doc, cx, cy, t) {
    doc.setDrawColor(90, 90, 90);
    doc.setLineWidth(0.3);
    doc.line(cx - t * 0.35, cy - t * 0.35, cx + t * 0.35, cy + t * 0.35);
    doc.line(cx - t * 0.35, cy + t * 0.35, cx + t * 0.35, cy - t * 0.35);
}

/** Colonnes fixes retenues selon les options, avec libellés et largeurs. */
function colonnesFixes(opts) {
    const cols = [{ cle: 'nom', libelle: 'Nom, Prénom', largeur: LARGEURS_COLONNES_FIXES.nom }];
    if (opts.da) cols.push({ cle: 'da', libelle: 'DA', largeur: LARGEURS_COLONNES_FIXES.da });
    if (opts.sousGroupe) cols.push({ cle: 'sousGroupe', libelle: 'Gr.', largeur: LARGEURS_COLONNES_FIXES.sousGroupe });
    if (opts.programme) cols.push({ cle: 'programme', libelle: 'Prog.', largeur: LARGEURS_COLONNES_FIXES.programme });
    if (opts.nomProgramme) cols.push({ cle: 'nomProgramme', libelle: 'Programme', largeur: LARGEURS_COLONNES_FIXES.nomProgramme });
    if (opts.sa) cols.push({ cle: 'sa', libelle: 'SA', largeur: LARGEURS_COLONNES_FIXES.sa });
    return cols;
}

function valeurColonneFixe(etudiant, cleCol) {
    switch (cleCol) {
        case 'nom': return `${etudiant.nom || ''}, ${etudiant.prenom || ''}`;
        case 'da': return String(etudiant.da || '');
        case 'sousGroupe': return String(etudiant.groupe || '');
        case 'programme': return String(etudiant.programme || '');
        case 'nomProgramme': {
            const nomLong = typeof obtenirNomProgramme === 'function'
                ? obtenirNomProgramme(etudiant.programme) : '';
            return nomLong && nomLong !== etudiant.programme ? nomLong : String(etudiant.programme || '');
        }
        case 'sa': return etudiant.sa === 'Oui' ? 'Oui' : '';
        default: return '';
    }
}

/**
 * Dessine la grille d'un groupe dans le document, en découpant les colonnes
 * de séances sur plusieurs pages si elles ne tiennent pas lisiblement.
 */
function dessinerFeuilleGroupe(doc, modele, opts, entete) {
    const notation = NOTATIONS_VALIDES.includes(opts.notation) ? opts.notation : 'crochet';
    const fixes = colonnesFixes(opts);
    const largeurFixes = fixes.reduce((acc, c) => acc + c.largeur, 0);
    const utilisable = PAGE_LARGEUR - (2 * MARGE) - largeurFixes;
    const nbSeances = modele.colonnes.length;
    const maxParPage = Math.max(1, Math.floor(utilisable / LARGEUR_MIN_COL_SEANCE));
    const nbTranches = Math.ceil(nbSeances / maxParPage) || 1;

    for (let t = 0; t < nbTranches; t++) {
        const colTranche = modele.colonnes.slice(t * maxParPage, (t + 1) * maxParPage);
        const largeurSeance = Math.min(9, utilisable / colTranche.length);

        if (t > 0) doc.addPage();

        // En-tête de la feuille
        const suite = nbTranches > 1 ? ` (${t + 1}/${nbTranches})` : '';
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Grille des présences — ${entete.cours}${suite}`, MARGE, MARGE + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(70, 70, 70);
        doc.text(entete.sousTitre, MARGE, MARGE + 9.5);

        // Corps du tableau
        const tete = fixes.map(c => c.libelle)
            .concat(colTranche.map(c => c.code ? `${c.code}\n${c.jourMois}` : c.jourMois));
        const corps = modele.lignes.map(ligne =>
            fixes.map(c => valeurColonneFixe(ligne.etudiant, c.cle))
                .concat(colTranche.map(() => '')));

        const stylesColonnes = {};
        fixes.forEach((c, i) => {
            stylesColonnes[i] = { cellWidth: c.largeur, halign: 'left' };
        });
        colTranche.forEach((c, i) => {
            stylesColonnes[fixes.length + i] = { cellWidth: largeurSeance, halign: 'center' };
        });

        const decalage = t * maxParPage;
        doc.autoTable({
            startY: MARGE + 13,
            margin: { left: MARGE, right: MARGE, top: MARGE + 13, bottom: MARGE + 6 },
            head: [tete],
            body: corps,
            theme: 'grid',
            // Tailles réduites au retour de la porte terrain #485 (verdict 3.1 :
            // « réduire seulement la taille de la police dans les cases »).
            styles: {
                fontSize: 6,
                cellPadding: 0.7,
                lineColor: [150, 150, 150],
                lineWidth: 0.15,
                textColor: [0, 0, 0],
                valign: 'middle',
                overflow: 'ellipsize'
            },
            headStyles: {
                fillColor: [225, 225, 225],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 5.5
            },
            columnStyles: stylesColonnes,
            didDrawCell: function(data) {
                if (data.section !== 'body') return;
                const indexSeance = data.column.index - fixes.length;
                if (indexSeance < 0) return;
                const ligne = modele.lignes[data.row.index];
                if (!ligne) return;
                const cellule = ligne.cellules[decalage + indexSeance];
                if (!cellule) return;
                const cx = data.cell.x + data.cell.width / 2;
                const cy = data.cell.y + data.cell.height / 2;
                const ecrire = function(texte) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(5.5);
                    doc.setTextColor(0, 0, 0);
                    doc.text(texte, cx, cy + 0.7, { align: 'center' });
                };
                if (notation === 'presence') {
                    if (cellule.etat !== 'vide') ecrire(formaterNombre(cellule.periodes));
                } else if (notation === 'absence') {
                    // Périodes manquées : rien quand la présence est complète
                    if (cellule.etat !== 'vide') {
                        const attendues = colTranche[indexSeance].periodesAttendues;
                        const manquees = Math.round((attendues - cellule.periodes) * 10) / 10;
                        if (manquees > 0) ecrire(formaterNombre(manquees));
                    }
                } else if (notation === 'x') {
                    // Convention « marquer les absences » : présence complète = rien
                    if (cellule.etat === 'absent') dessinerCroix(doc, cx, cy, 1.8);
                    else if (cellule.etat === 'partiel' && cellule.texte) ecrire(cellule.texte);
                } else {
                    if (cellule.etat === 'present') dessinerCrochet(doc, cx, cy, 2.0);
                    else if (cellule.etat === 'absent') dessinerCroix(doc, cx, cy, 1.8);
                    else if (cellule.etat === 'partiel' && cellule.texte) ecrire(cellule.texte);
                }
            }
        });

        // Légende sous le tableau, adaptée à la notation choisie
        const yLegende = Math.min(doc.lastAutoTable.finalY + 6, PAGE_HAUTEUR - 8);
        dessinerLegende(doc, yLegende, notation);
    }
}

/**
 * Légende de bas de feuille, selon la notation des cases.
 * Segments dessinés de gauche à droite avec largeurs mesurées.
 */
function dessinerLegende(doc, y, notation) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(70, 70, 70);

    const finPapier = 'case vide = séance à saisir (remplir au crayon, reporter dans Labo Codex)';
    let segments;
    if (notation === 'presence') {
        segments = [
            { texte: 'chiffre = périodes de présence (0 = absence)' },
            { texte: finPapier }
        ];
    } else if (notation === 'absence') {
        segments = [
            { texte: 'chiffre = périodes d’absence' },
            { texte: 'sans marque = présence complète' },
            { texte: finPapier }
        ];
    } else if (notation === 'x') {
        segments = [
            { marque: 'croix', texte: 'absence' },
            { texte: 'chiffre = présence partielle (périodes)' },
            { texte: 'sans marque = présence complète' },
            { texte: finPapier }
        ];
    } else {
        segments = [
            { marque: 'crochet', texte: 'présence complète' },
            { marque: 'croix', texte: 'absence' },
            { texte: 'chiffre = périodes présentes (partielle)' },
            { texte: finPapier }
        ];
    }

    let x = MARGE;
    segments.forEach(function(segment) {
        if (segment.marque === 'crochet') { dessinerCrochet(doc, x + 1.2, y - 1, 2.0); x += 3.4; }
        else if (segment.marque === 'croix') { dessinerCroix(doc, x + 1.2, y - 1, 1.8); x += 3.4; }
        doc.text(segment.texte, x, y);
        x += doc.getTextWidth(segment.texte) + 5;
    });
}

/** Pagination « p. X/Y » sur toutes les pages, en pied de page. */
function paginerDocument(doc) {
    const nbPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= nbPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(`p. ${i}/${nbPages}`, PAGE_LARGEUR - MARGE, PAGE_HAUTEUR - 4, { align: 'right' });
    }
}

/* ===============================
   API PUBLIQUE — GÉNÉRATION
   =============================== */

/**
 * Génère le PDF de la ou des grilles selon les options du panneau.
 * Déclenchée par data-action="genererRapportPresencesPDF".
 */
function genererRapportPresencesPDF() {
    afficherStatutRapport('');

    if (!window.jspdf || !window.jspdf.jsPDF) {
        afficherStatutRapport('La librairie PDF n’est pas chargée — recharge la page puis réessaie.');
        return;
    }

    const opts = sauvegarderOptionsRapportPresences();
    const cibles = listerGroupesCoursCibles(opts.portee);
    if (cibles.length === 0) {
        afficherStatutRapport('Aucun groupe-cours : configure un cours et un groupe dans Cadre › Trimestre.');
        return;
    }

    const infosCours = window.ExportPDF && typeof window.ExportPDF.infosCours === 'function'
        ? window.ExportPDF.infosCours() : { sigleTitre: '' };
    const nomTrimestre = window.ExportPDF && typeof window.ExportPDF.nomTrimestre === 'function'
        ? window.ExportPDF.nomTrimestre() : '';
    const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : (window.DUREE_PERIODE_DEFAUT || 50);
    const presences = (typeof obtenirDonneesSelonMode === 'function'
        ? obtenirDonneesSelonMode('presences')
        : db.getSync(cle('presences'), [])) || [];
    const aujourdhui = typeof window.dateLocaleYMD === 'function'
        ? window.dateLocaleYMD() : new Date().toISOString().slice(0, 10);

    const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
    const sautes = [];
    let feuilles = 0;

    cibles.forEach(gc => {
        const libelleGroupe = gc.modeCours || !gc.groupeNum
            ? 'tous les groupes'
            : `groupe ${gc.groupeNum}`;

        const seances = seancesDuGroupe(gc);
        const etudiants = etudiantsDuGroupe(gc);
        const modele = construireModeleRapportPresences(etudiants, seances, presences, {
            coursId: gc.coursId,
            dureePeriode: dureePeriode
        });

        if (modele.colonnes.length === 0 || modele.lignes.length === 0) {
            sautes.push(libelleGroupe);
            return;
        }

        if (feuilles > 0) doc.addPage();
        feuilles++;

        dessinerFeuilleGroupe(doc, modele, opts, {
            cours: infosCours.sigleTitre || infosCours.sigle || 'cours actif',
            sousTitre: `${libelleGroupe}${nomTrimestre ? ' · ' + nomTrimestre : ''} · générée le ${formaterDateFrancaise(aujourdhui)}`
        });
    });

    if (feuilles === 0) {
        afficherStatutRapport('Rien à imprimer : aucun groupe visé n’a de séances et d’étudiants configurés.');
        return;
    }

    paginerDocument(doc);

    const slug = (nomTrimestre || 'trimestre').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    doc.save(`grille-presences-${slug}.pdf`);

    if (sautes.length > 0) {
        afficherStatutRapport(`PDF généré. Groupes sans séances ou sans étudiants, non inclus : ${sautes.join(', ')}.`);
    }
}

/* ===============================
   INITIALISATION
   =============================== */

// Refléter les options mémorisées dès que le DOM et la DB sont prêts.
// restaurerOptionsRapportPresences est idempotente et tolère l'absence du
// panneau — on peut donc l'accrocher aux deux signaux sans risque.
if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', restaurerOptionsRapportPresences);
}
if (typeof window.auDbPret === 'function') {
    window.auDbPret(restaurerOptionsRapportPresences);
}

/* ===============================
   EXPORTS GLOBAUX
   =============================== */

window.construireModeleRapportPresences = construireModeleRapportPresences;
window.genererRapportPresencesPDF = genererRapportPresencesPDF;
window.restaurerOptionsRapportPresences = restaurerOptionsRapportPresences;
window.sauvegarderOptionsRapportPresences = sauvegarderOptionsRapportPresences;
window.ouvrirModaleRapportPresences = ouvrirModaleRapportPresences;
window.fermerModaleRapportPresences = fermerModaleRapportPresences;

})();
