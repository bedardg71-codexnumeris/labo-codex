/**
 * export-pdf.js - Module d'export PDF pour Monitorage Pedagogique
 * Beta 95.7 - Tache #30
 *
 * Utilise jsPDF + jspdf-autotable pour generer des PDF des elements pedagogiques
 * Fonctionne 100% hors ligne
 */

(function() {
'use strict';

// =============================================================================
// CONFIGURATION ET CONSTANTES
// =============================================================================

// Logo CC BY-NC-SA en PNG base64 (RGB, sans alpha) pour pieds de page PDF
const CC_LOGO_PNG = 'data:image/png;base64,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';
// ⚠⚠ TAILLE CORRIGÉE LE 25 AOÛT 2026. Ces constantes valaient 144 × 27 mm
// depuis leur introduction (5 avril, commit 80d0de36) : sur une page lettre de
// 216 mm de large, le badge en occupait les DEUX TIERS et recouvrait le tableau
// de critères. Le défaut n'avait jamais été vu parce que ces PDF n'étaient pas
// exportés — c'est en préparant ses consignes d'automne que Grégoire l'a
// découvert.
// L'image fait 267 × 50 px : la hauteur SUIT la largeur pour que le badge ne
// soit pas déformé. 24 mm est la taille usuelle d'un badge de licence en pied
// de page — lisible, et il laisse la place au nom de l'enseignant à gauche.
const CC_LOGO_W = 24;                              // mm
const CC_LOGO_H = CC_LOGO_W * (50 / 267);          // mm — ratio de l'image, jamais une valeur à part

const PDF_CONFIG = {
    // Marges en mm (0,5 pouce = 12,7mm)
    marges: {
        haut: 13,
        bas: 13,
        gauche: 13,
        droite: 13
    },
    // Couleurs (RGB) - Sobres pour impression N&B
    // Basées sur le Design System: --bleu-principal (#032e5c), --gris-*
    couleurs: {
        titreSection: [3, 46, 92],        // --bleu-principal #032e5c (imprime gris foncé)
        textePrincipal: [51, 51, 51],     // --gris-fonce #333333
        texteSecondaire: [102, 102, 102], // --gris-moyen #666666
        bordure: [204, 204, 204],         // --bordure-moyenne #cccccc
        fondEntete: [245, 245, 245]       // Gris très clair pour entêtes
        // #593 (29 août 2026) : les quatre « couleurs de niveau » I/D/M/E — toutes
        // égales à textePrincipal — sont retirées avec `getCouleurNiveau`. Le PDF
        // n'a jamais coloré un niveau (impression N&B), et ces lettres étaient un
        // dernier reste d'IDME écrit dans le code (#529).
    },
    // Polices
    polices: {
        titrePrincipal: 18,
        titreSection: 14,
        sousTitre: 12,
        texteNormal: 10,
        textePetit: 9
    }
};

// =============================================================================
// PERSISTANCE DES RÉGLAGES
// =============================================================================

const CLE_REGLAGES_PDF = 'exportPDF_derniersReglages';

/**
 * Sauvegarde les réglages actuels du formulaire PDF
 */
function sauvegarderReglagesPDF() {
    // Lire les dropdowns depuis le formulaire actif (inline ou statique)
    const scope = _conteneurPDFInline || document;
    const inline = !!_conteneurPDFInline;
    const prefix = inline ? 'inlinePDF' : 'prepPDF';

    const reglages = {
        // Dropdowns du formulaire actif
        productionId: scope.querySelector(`#${prefix}-production`)?.value || '',
        grilleId: scope.querySelector(`#${prefix}-grille`)?.value || '',
        echelleId: scope.querySelector(`#${prefix}-echelle`)?.value || '',
        cartoucheId: scope.querySelector(`#${prefix}-cartouche`)?.value || '',
        // Options du modal (toujours dans document)
        cran: document.getElementById('apercuPDF-cran')?.value || '',
        disposition: document.getElementById('apercuPDF-disposition')?.value || '',
        orientation: document.getElementById('apercuPDF-orientation')?.value || 'portrait',
        afficherTrimestre: document.getElementById('apercuPDF-afficher-trimestre')?.checked ?? true,
        piedEnseignant: document.getElementById('apercuPDF-pied-enseignant')?.checked ?? true,
        piedLicence: document.getElementById('apercuPDF-pied-licence')?.checked ?? true
    };
    db.setSync(CLE_REGLAGES_PDF, reglages);
}

/**
 * Restaure les réglages sauvegardés du formulaire PDF
 */
function restaurerReglagesPDF() {
    try {
        const reglages = db.getSync(CLE_REGLAGES_PDF, null);
        if (!reglages) return null;
        return reglages;
    } catch (e) {
        console.warn('[export-pdf] Erreur restauration réglages:', e);
        return null;
    }
}

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Cree une nouvelle instance jsPDF avec configuration standard
 */
function creerDocumentPDF(orientation = 'portrait') {
    const { jsPDF } = window.jspdf;
    return new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'letter'  // 8.5 x 11 pouces - standard nord-americain
    });
}

/**
 * Obtient le nom du trimestre actif (ex: "Hiver 2026")
 * Priorité: 1) Champ 'nom' dans trimestres[], 2) Construction depuis l'ID
 */
function obtenirNomTrimestre() {
    try {
        // Méthode 1: Chercher dans la liste des trimestres
        if (typeof db !== 'undefined' && db.getSync) {
            const trimestres = db.getSync('trimestres', []);
            const trimestreActif = trimestres.find(t => t.actif === true);
            if (trimestreActif && trimestreActif.nom) {
                return trimestreActif.nom;
            }
        }

        // Méthode 2: Construire depuis window.trimestreActif (fallback)
        const saisons = { 'a': 'Automne', 'h': 'Hiver', 'e': 'Été' };
        const trimestreId = window.trimestreActif || (typeof db !== 'undefined' && db.getSync ? db.getSync('trimestreActif', '') : '');
        if (!trimestreId || trimestreId.length < 5) return '';

        const sessionLettre = trimestreId.charAt(0).toLowerCase();
        const annee = trimestreId.substring(1);
        const saison = saisons[sessionLettre] || '';

        return saison ? `${saison} ${annee}` : '';
    } catch (err) {
        console.warn('[export-pdf] Erreur obtention nom trimestre:', err);
        return '';
    }
}

/**
 * Obtient le nom de l'enseignant actif pour le PDF
 * Gère les cas: enseignantId normal, 'profil', ou absence
 */
function obtenirNomEnseignantPDF() {
    // 🆕 BETA 96 FIX #30: Utiliser obtenirTrimestreActif() + fallback sur profilEnseignant
    try {
        if (typeof db === 'undefined' || !db.getSync) {
            return '';
        }

        // 1. Obtenir le trimestre actif via la fonction officielle
        let trimestreActif = '';
        if (typeof obtenirTrimestreActif === 'function') {
            const trimestre = obtenirTrimestreActif();
            trimestreActif = trimestre?.id || '';
        }
        if (!trimestreActif) {
            trimestreActif = window.trimestreActif || db.getSync('trimestreActif', '');
        }

        // 2. Chercher le groupe-cours actif (si trimestre disponible)
        let groupeActif = null;
        if (trimestreActif) {
            const groupesCours = db.getSync(`${trimestreActif}_groupesCours`, []);
            groupeActif = groupesCours.find(gc => gc.actif);
        }

        // 3. Si groupe actif trouvé avec enseignantId, l'utiliser
        if (groupeActif && groupeActif.enseignantId) {
            if (groupeActif.enseignantId === 'profil') {
                // Cas 1: enseignantId === 'profil' → utiliser profilEnseignant
                const profil = db.getSync('profilEnseignant', {});
                if (profil.prenom && profil.nom) {
                    return `${profil.prenom} ${profil.nom}`;
                }
            } else {
                // Cas 2: enseignantId est un ID valide → chercher dans enseignants
                const enseignants = db.getSync('enseignants', []);
                const ensObj = enseignants.find(e => e.id === groupeActif.enseignantId);
                if (ensObj) {
                    return `${ensObj.prenom || ''} ${ensObj.nom || ''}`.trim();
                }
            }
        }

        // 4. FALLBACK: Chercher dans la liste enseignants (select actif ou premier)
        const enseignants = db.getSync('enseignants', []);
        const selectEns = document.getElementById('v2-selectEnseignant');
        const ensId = selectEns?.value;
        const ens = ensId ? enseignants.find(e => e.id === ensId) : (enseignants[0] || null);
        if (ens && ens.prenom && ens.nom) {
            return `${ens.prenom} ${ens.nom}`;
        }

        return '';
    } catch (err) {
        console.warn('[export-pdf] Erreur obtention nom enseignant:', err);
        return '';
    }
}

/**
 * Obtient les infos du cours actif pour le PDF
 * 🆕 BETA 96 FIX #30: Utiliser obtenirTrimestreActif() + fallback sur coursActif/infoCours
 * @returns {Object} { sigle, titre, sigleTitre }
 */
function obtenirInfosCoursPDF() {
    try {
        if (typeof db === 'undefined' || !db.getSync) {
            return { sigle: '', titre: '', sigleTitre: '' };
        }

        // 1. Obtenir le trimestre actif via la fonction officielle
        let trimestreActif = '';
        if (typeof obtenirTrimestreActif === 'function') {
            const trimestre = obtenirTrimestreActif();
            trimestreActif = trimestre?.id || '';
        }
        if (!trimestreActif) {
            trimestreActif = window.trimestreActif || db.getSync('trimestreActif', '');
        }

        // 2. Chercher le groupe-cours actif (si trimestre disponible)
        let groupeActif = null;
        if (trimestreActif) {
            const groupesCours = db.getSync(`${trimestreActif}_groupesCours`, []);
            groupeActif = groupesCours.find(gc => gc.actif);
        }

        // 3. Récupérer la liste des cours
        let cours = db.getSync('cours', []);
        if (!cours || cours.length === 0) {
            cours = db.getSync('cours', []);
        }

        // 4. Si groupe actif avec coursId, chercher le cours correspondant
        if (groupeActif && groupeActif.coursId && cours.length > 0) {
            const coursObj = cours.find(c =>
                c.id === groupeActif.coursId ||
                c.sigle === groupeActif.coursId ||
                c.codeCours === groupeActif.coursId ||
                c.code === groupeActif.coursId
            );

            // 🆕 FIX (4 fév 2026) : Priorité codeCours
            if (coursObj) {
                const sigle = coursObj.codeCours || coursObj.sigle || coursObj.code || '';
                const titre = coursObj.nomCours || coursObj.nom || coursObj.titre || '';
                const sigleTitre = sigle && titre ? `${sigle} - ${titre}` : (titre || sigle);
                return { sigle, titre, sigleTitre };
            }
        }

        // 5. FALLBACK 1: Essayer coursActif ou infoCours (anciens formats)
        const coursActif = db.getSync('coursActif', null);
        if (coursActif) {
            const sigle = coursActif.codeCours || coursActif.sigle || coursActif.code || '';
            const titre = coursActif.nomCours || coursActif.nom || coursActif.titre || '';
            if (sigle || titre) {
                const sigleTitre = sigle && titre ? `${sigle} - ${titre}` : (titre || sigle);
                return { sigle, titre, sigleTitre };
            }
        }

        const infoCours = db.getSync('infoCours', null);
        if (infoCours) {
            const sigle = infoCours.codeCours || infoCours.sigle || infoCours.code || '';
            const titre = infoCours.nomCours || infoCours.nom || infoCours.titre || '';
            if (sigle || titre) {
                const sigleTitre = sigle && titre ? `${sigle} - ${titre}` : (titre || sigle);
                return { sigle, titre, sigleTitre };
            }
        }

        // 6. FALLBACK 2: Si un seul cours dans listeCours et pas d'autre info, l'utiliser
        if (cours.length === 1) {
            const coursUnique = cours[0];
            const sigle = coursUnique.codeCours || coursUnique.sigle || coursUnique.code || '';
            const titre = coursUnique.nomCours || coursUnique.nom || coursUnique.titre || '';
            if (sigle || titre) {
                const sigleTitre = sigle && titre ? `${sigle} - ${titre}` : (titre || sigle);
                return { sigle, titre, sigleTitre };
            }
        }

        return { sigle: '', titre: '', sigleTitre: '' };

    } catch (err) {
        console.warn('[export-pdf] Erreur obtention infos cours:', err);
        return { sigle: '', titre: '', sigleTitre: '' };
    }
}

/**
 * Ajoute un en-tete de page avec titre et infos cours/trimestre
 * @param {Object} doc - Instance jsPDF
 * @param {string} titre - Titre du document
 * @param {Object} options - Options d'affichage
 * @param {boolean} options.afficherTrimestre - Afficher les infos en haut à droite (défaut: true)
 */
function ajouterEntetePage(doc, titre, options = {}) {
    const largeurPage = doc.internal.pageSize.getWidth();

    // ⚠⚠ LE TITRE DÉBORDAIT SUR LES INFOS DU COURS (corrigé le 25 août 2026).
    // `doc.text()` n'enveloppe pas : un titre long — « Artefact 1 - Appliquer
    // des stratégies de lecture variées (Madawigouche) » — sortait de la page
    // ET passait PAR-DESSUS le sigle, le nom du cours et le trimestre, rendus
    // au même endroit. Deux textes superposés, illisibles tous les deux.
    //
    // ⮕ La largeur du titre est ce qui RESTE une fois le bloc de droite mesuré.
    // Mesuré, pas estimé : le sigle et le nom du cours changent d'un cours à
    // l'autre, et une marge fixe finirait par être trop courte pour l'un d'eux.
    const lignesDroite = lignesEnteteDocument(options);
    doc.setFontSize(PDF_CONFIG.polices.textePetit);
    let largeurDroite = 0;
    lignesDroite.forEach(ligne => {
        doc.setFont('helvetica', ligne.gras ? 'bold' : 'normal');
        largeurDroite = Math.max(largeurDroite, doc.getTextWidth(ligne.texte));
    });

    const ECART_TITRE_INFOS = 8;  // mm — de l'air entre les deux blocs
    const largeurTitre = Math.max(
        largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite
            - largeurDroite - ECART_TITRE_INFOS,
        40   // plancher : sous 40 mm un titre ne se lit plus, mieux vaut qu'il déborde et se voie
    );

    // Titre principal (gauche)
    doc.setFontSize(PDF_CONFIG.polices.titrePrincipal);
    doc.setTextColor(...PDF_CONFIG.couleurs.titreSection);
    doc.setFont('helvetica', 'bold');
    const lignesTitre = doc.splitTextToSize(titre, largeurTitre);
    doc.text(lignesTitre, PDF_CONFIG.marges.gauche, PDF_CONFIG.marges.haut + 5);

    // #497 — Infos à droite : les MÊMES lignes que l'aperçu HTML, dans le même
    // ordre et sous les mêmes conditions. `gras` est une indication de rang que
    // ce rendeur-ci traduit en `setFont('bold')` ; l'aperçu, lui, en fait un
    // `<span>`. Le contenu est décidé une fois, la traduction deux.
    doc.setFontSize(PDF_CONFIG.polices.textePetit);
    doc.setTextColor(...PDF_CONFIG.couleurs.texteSecondaire);
    doc.setFont('helvetica', 'normal');

    let posYDroite = PDF_CONFIG.marges.haut + 2;
    const xDroite = largeurPage - PDF_CONFIG.marges.droite;

    lignesEnteteDocument(options).forEach(ligne => {
        doc.setFont('helvetica', ligne.gras ? 'bold' : 'normal');
        doc.text(ligne.texte, xDroite, posYDroite, { align: 'right' });
        posYDroite += 3.5;
    });
    doc.setFont('helvetica', 'normal');

    // ⚠ La ligne de séparation descend avec le titre. Un titre sur deux lignes
    // la traversait ; un titre sur trois la faisait passer dans le tableau.
    // Le cas d'UNE ligne rend exactement les valeurs d'avant (10 et 18) : tous
    // les autres exports qui appellent cette fonction ne bougent pas d'un mm.
    const INTERLIGNE_TITRE = 7;  // mm à 18 pt
    const basTitre = PDF_CONFIG.marges.haut + 10 + (lignesTitre.length - 1) * INTERLIGNE_TITRE;
    // ⚠ `posYDroite` a été incrémenté APRÈS la dernière ligne : l'utiliser tel
    // quel descendrait la séparation de 3,5 mm dans TOUS les exports du module,
    // pour un changement que personne n'a demandé. On revient sous la dernière
    // ligne écrite, plus 1 mm d'air — ce que faisait le code d'origine.
    const basInfos = lignesDroite.length > 0 ? posYDroite - 3.5 + 1 : 0;
    const yLigne = Math.max(basTitre, basInfos);

    doc.setDrawColor(...PDF_CONFIG.couleurs.bordure);
    doc.setLineWidth(0.5);
    doc.line(PDF_CONFIG.marges.gauche, yLigne, largeurPage - PDF_CONFIG.marges.droite, yLigne);

    return yLigne + 8; // Position Y apres l'en-tete
}

/**
 * Ajoute un pied de page avec enseignant à gauche et licence à droite
 */
function ajouterPiedPage(doc, numeroPage, totalPages, optionsPied = {}) {
    const largeurPage = doc.internal.pageSize.getWidth();
    const hauteurPage = doc.internal.pageSize.getHeight();
    const posY = hauteurPage - PDF_CONFIG.marges.bas + 5;

    doc.setFontSize(PDF_CONFIG.polices.textePetit);
    doc.setTextColor(...PDF_CONFIG.couleurs.texteSecondaire);
    doc.setFont('helvetica', 'normal');

    // Numero de page centre (seulement si plusieurs pages)
    if (totalPages > 1) {
        doc.text(
            `Page ${numeroPage} / ${totalPages}`,
            largeurPage / 2,
            posY,
            { align: 'center' }
        );
    }

    // Gauche : Nom de l'enseignant uniquement
    if (optionsPied.inclureEnseignant && optionsPied.enseignant) {
        doc.text(optionsPied.enseignant, PDF_CONFIG.marges.gauche, posY);
    }

    // Droite : Licence CC (logo PNG)
    if (optionsPied.inclureLicence) {
        doc.addImage(CC_LOGO_PNG, 'PNG',
            largeurPage - PDF_CONFIG.marges.droite - CC_LOGO_W,
            posY - CC_LOGO_H + 0.5,
            CC_LOGO_W, CC_LOGO_H
        );
    }
}

/**
 * Ajoute les pieds de page a toutes les pages du document
 */
function finaliserDocument(doc, optionsPied = {}) {
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        ajouterPiedPage(doc, i, totalPages, optionsPied);
    }
}

// formaterDate() — supprimée, canonique dans main.js (Beta 97.1 #68)

// =============================================================================
// GENERATION D'APERCUS HTML (Preview avant export)
// =============================================================================

/**
 * Genere un apercu HTML d'une grille de criteres
 */
function genererApercuGrille(grille) {
    if (!grille) return '<p class="text-muted">Aucune grille selectionnee</p>';

    let html = `
        <div class="apercu-pdf">
            <div class="apercu-pdf-entete">
                <h3>${escapeHtml(grille.nom || 'Grille sans nom')}</h3>
                <span class="apercu-pdf-date">Apercu - ${new Date().toLocaleDateString('fr-CA')}</span>
            </div>
    `;

    if (grille.description) {
        html += `<p class="apercu-pdf-description">${escapeHtml(grille.description)}</p>`;
    }

    if (grille.criteres && grille.criteres.length > 0) {
        html += `
            <table class="apercu-pdf-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">Critere</th>
                        <th style="width: 60%;">Description</th>
                        <th style="width: 15%; text-align: center;">Pond.</th>
                    </tr>
                </thead>
                <tbody>
        `;
        grille.criteres.forEach(c => {
            html += `
                <tr>
                    <td><strong>${escapeHtml(c.nom || '—')}</strong></td>
                    <td>${escapeHtml(c.description || '—')}</td>
                    <td style="text-align: center;">${c.ponderation ? c.ponderation + '%' : '—'}</td>
                </tr>
            `;
        });
        html += '</tbody></table>';
    } else {
        html += '<p class="text-muted">Aucun critere defini</p>';
    }

    html += '</div>';
    return html;
}

/**
 * Genere un apercu HTML d'une echelle de performance
 */
function genererApercuEchelle(echelle) {
    if (!echelle) return '<p class="text-muted">Aucune echelle selectionnee</p>';

    let html = `
        <div class="apercu-pdf">
            <div class="apercu-pdf-entete">
                <h3>${escapeHtml(echelle.nom || 'Echelle sans nom')}</h3>
                <span class="apercu-pdf-date">Apercu - ${new Date().toLocaleDateString('fr-CA')}</span>
            </div>
    `;

    if (echelle.config?.seuilReussite) {
        html += `<p class="apercu-pdf-info">Seuil de reussite : <strong>${echelle.config.seuilReussite}%</strong></p>`;
    }

    if (echelle.niveaux && echelle.niveaux.length > 0) {
        html += `
            <table class="apercu-pdf-table">
                <thead>
                    <tr>
                        <th style="width: 10%; text-align: center;">Code</th>
                        <th style="width: 25%;">Niveau</th>
                        <th style="width: 45%;">Description</th>
                        <th style="width: 20%; text-align: center;">Plage</th>
                    </tr>
                </thead>
                <tbody>
        `;
        echelle.niveaux.forEach(n => {
            const couleurClass = `apercu-niveau-${(n.code || '').toUpperCase()}`;
            html += `
                <tr>
                    <td style="text-align: center;" class="${couleurClass}"><strong>${escapeHtml(n.code || '—')}</strong></td>
                    <td>${escapeHtml(n.nom || '—')}</td>
                    <td>${escapeHtml(n.description || '—')}</td>
                    <td style="text-align: center;">${n.min ?? 0}% - ${n.max ?? 100}%</td>
                </tr>
            `;
        });
        html += '</tbody></table>';
    } else {
        html += '<p class="text-muted">Aucun niveau defini</p>';
    }

    html += '</div>';
    return html;
}

/**
 * Genere un apercu HTML d'une liste de productions
 */
function genererApercuProductions(productions) {
    if (!productions || productions.length === 0) {
        return '<p class="text-muted">Aucune production a afficher</p>';
    }

    let html = `
        <div class="apercu-pdf">
            <div class="apercu-pdf-entete">
                <h3 data-tooltip="cn-prod-tableau">Productions pedagogiques</h3>
                <span class="apercu-pdf-date">Apercu - ${new Date().toLocaleDateString('fr-CA')}</span>
            </div>
            <p class="apercu-pdf-info">${productions.length} production(s)</p>
            <table class="apercu-pdf-table">
                <thead>
                    <tr>
                        <th style="width: 45%;">Titre</th>
                        <th style="width: 20%;">Type</th>
                        <th style="width: 15%; text-align: center;">Pond.</th>
                        <th style="width: 20%;">Echeance</th>
                    </tr>
                </thead>
                <tbody>
    `;

    productions.forEach(p => {
        // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
        const infoCoursExp = db.getSync('infoCours', null);
        const gcIdExp = obtenirIdContexteActif(infoCoursExp);
        const dateEcheanceExp = (typeof obtenirEcheanceEffective === 'function')
            ? obtenirEcheanceEffective(p, gcIdExp).date : p.dateEcheance;
        const dateFormatee = dateEcheanceExp ? new Date(dateEcheanceExp).toLocaleDateString('fr-CA') : '—';
        html += `
            <tr>
                <td>${escapeHtml(p.titre || '—')}</td>
                <td>${escapeHtml(p.type || '—')}</td>
                <td style="text-align: center;">${p.ponderation ? p.ponderation + '%' : '—'}</td>
                <td>${dateFormatee}</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    return html;
}

/**
 * Genere un apercu HTML d'une cartouche de retroaction
 */
function genererApercuCartouche(cartouche) {
    if (!cartouche) return '<p class="text-muted">Aucune cartouche selectionnee</p>';

    const criteres = cartouche.criteres || [];
    const niveaux = cartouche.niveaux || [];
    const commentaires = cartouche.commentaires || {};

    let html = `
        <div class="apercu-pdf apercu-pdf-paysage">
            <div class="apercu-pdf-entete">
                <h3>${escapeHtml(cartouche.nom || 'Cartouche sans nom')}</h3>
                <span class="apercu-pdf-date">Apercu - ${new Date().toLocaleDateString('fr-CA')}</span>
            </div>
    `;

    if (cartouche.contexte) {
        html += `<p class="apercu-pdf-description">${escapeHtml(cartouche.contexte)}</p>`;
    }

    if (criteres.length === 0 || niveaux.length === 0) {
        html += '<p class="text-muted">Cartouche incomplete (criteres ou niveaux manquants)</p>';
    } else {
        html += `
            <table class="apercu-pdf-table apercu-pdf-table-matrice">
                <thead>
                    <tr>
                        <th style="width: 15%;">Critere</th>
        `;
        niveaux.forEach(n => {
            const couleurClass = `apercu-niveau-${(n.code || '').toUpperCase()}`;
            html += `<th class="${couleurClass}">${escapeHtml(n.code || n.nom || '—')}</th>`;
        });
        html += '</tr></thead><tbody>';

        criteres.forEach(c => {
            html += `<tr><td><strong>${escapeHtml(c.nom || '—')}</strong></td>`;
            niveaux.forEach(n => {
                const cle = `${c.id}_${n.code}`;
                const commentaire = commentaires[cle] || '—';
                html += `<td class="apercu-cell-commentaire">${escapeHtml(commentaire)}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
    }

    html += '</div>';
    return html;
}

/**
 * Echappe les caracteres HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =============================================================================
// EXPORT DES PRODUCTIONS
// =============================================================================

/**
 * Exporte une liste de productions en PDF
 */
async function exporterProductionsPDF(productions, options = {}) {
    const doc = creerDocumentPDF();
    let posY = ajouterEntetePage(doc, options.titre || 'Productions pedagogiques');

    const largeurPage = doc.internal.pageSize.getWidth();
    const largeurContenu = largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite;

    // Tableau des productions
    // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
    const infoCoursExpPdf = db.getSync('infoCours', null);
    const gcIdExpPdf = obtenirIdContexteActif(infoCoursExpPdf);
    const donnees = productions.map(p => {
        const dateEch = (typeof obtenirEcheanceEffective === 'function')
            ? obtenirEcheanceEffective(p, gcIdExpPdf).date : p.dateEcheance;
        return [
            p.titre || '—',
            p.type || '—',
            p.ponderation ? `${p.ponderation}%` : '—',
            formaterDate(dateEch)
        ];
    });

    doc.autoTable({
        startY: posY,
        head: [['Titre', 'Type', 'Pond.', 'Echeance']],
        body: donnees,
        theme: 'grid',
        headStyles: {
            fillColor: PDF_CONFIG.couleurs.titreSection,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: PDF_CONFIG.polices.texteNormal
        },
        bodyStyles: {
            fontSize: PDF_CONFIG.polices.textePetit,
            textColor: PDF_CONFIG.couleurs.textePrincipal
        },
        columnStyles: {
            0: { cellWidth: largeurContenu * 0.45 },
            1: { cellWidth: largeurContenu * 0.20 },
            2: { cellWidth: largeurContenu * 0.15, halign: 'center' },
            3: { cellWidth: largeurContenu * 0.20 }
        },
        margin: { left: PDF_CONFIG.marges.gauche, right: PDF_CONFIG.marges.droite }
    });

    finaliserDocument(doc);
    doc.save(options.nomFichier || 'productions.pdf');
}

// =============================================================================
// EXPORT DES GRILLES DE CRITERES
// =============================================================================

/**
 * Exporte une grille de criteres en PDF
 */
async function exporterGrillePDF(grille, options = {}) {
    const doc = creerDocumentPDF();
    let posY = ajouterEntetePage(doc, grille.nom || 'Grille de criteres');

    const largeurPage = doc.internal.pageSize.getWidth();
    const largeurContenu = largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite;

    // Description de la grille
    if (grille.description) {
        doc.setFontSize(PDF_CONFIG.polices.texteNormal);
        doc.setTextColor(...PDF_CONFIG.couleurs.texteSecondaire);
        doc.setFont('helvetica', 'italic');
        const lignes = doc.splitTextToSize(grille.description, largeurContenu);
        doc.text(lignes, PDF_CONFIG.marges.gauche, posY);
        posY += lignes.length * 5 + 5;
    }

    // Tableau des criteres
    if (grille.criteres && grille.criteres.length > 0) {
        const donnees = grille.criteres.map(c => [
            c.nom || '—',
            c.description || '—',
            c.ponderation ? `${c.ponderation}%` : '—'
        ]);

        doc.autoTable({
            startY: posY,
            head: [['Critere', 'Description', 'Pond.']],
            body: donnees,
            theme: 'grid',
            headStyles: {
                fillColor: PDF_CONFIG.couleurs.titreSection,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: PDF_CONFIG.polices.texteNormal
            },
            bodyStyles: {
                fontSize: PDF_CONFIG.polices.textePetit,
                textColor: PDF_CONFIG.couleurs.textePrincipal
            },
            columnStyles: {
                0: { cellWidth: largeurContenu * 0.25, fontStyle: 'bold' },
                1: { cellWidth: largeurContenu * 0.60 },
                2: { cellWidth: largeurContenu * 0.15, halign: 'center' }
            },
            margin: { left: PDF_CONFIG.marges.gauche, right: PDF_CONFIG.marges.droite }
        });
    }

    finaliserDocument(doc);
    doc.save(options.nomFichier || `grille-${grille.id || 'export'}.pdf`);
}

/**
 * Exporte toutes les grilles en un seul PDF
 */
async function exporterToutesGrillesPDF(options = {}) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    if (grilles.length === 0) {
        alert('Aucune grille a exporter.');
        return;
    }

    const doc = creerDocumentPDF();
    let premierePage = true;

    for (const grille of grilles) {
        if (!premierePage) {
            doc.addPage();
        }
        premierePage = false;

        let posY = ajouterEntetePage(doc, grille.nom || 'Grille de criteres');

        const largeurPage = doc.internal.pageSize.getWidth();
        const largeurContenu = largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite;

        // Description
        if (grille.description) {
            doc.setFontSize(PDF_CONFIG.polices.texteNormal);
            doc.setTextColor(...PDF_CONFIG.couleurs.texteSecondaire);
            doc.setFont('helvetica', 'italic');
            const lignes = doc.splitTextToSize(grille.description, largeurContenu);
            doc.text(lignes, PDF_CONFIG.marges.gauche, posY);
            posY += lignes.length * 5 + 5;
        }

        // Tableau des criteres
        if (grille.criteres && grille.criteres.length > 0) {
            const donnees = grille.criteres.map(c => [
                c.nom || '—',
                c.description || '—',
                c.ponderation ? `${c.ponderation}%` : '—'
            ]);

            doc.autoTable({
                startY: posY,
                head: [['Critere', 'Description', 'Pond.']],
                body: donnees,
                theme: 'grid',
                headStyles: {
                    fillColor: PDF_CONFIG.couleurs.titreSection,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontSize: PDF_CONFIG.polices.textePetit
                },
                columnStyles: {
                    0: { cellWidth: largeurContenu * 0.25, fontStyle: 'bold' },
                    1: { cellWidth: largeurContenu * 0.60 },
                    2: { cellWidth: largeurContenu * 0.15, halign: 'center' }
                },
                margin: { left: PDF_CONFIG.marges.gauche, right: PDF_CONFIG.marges.droite }
            });
        }
    }

    finaliserDocument(doc);
    doc.save(options.nomFichier || 'grilles-criteres.pdf');
}

// =============================================================================
// EXPORT DES ECHELLES DE PERFORMANCE
// =============================================================================

/**
 * Exporte une echelle de performance en PDF
 */
async function exporterEchellePDF(echelle, options = {}) {
    const doc = creerDocumentPDF();
    let posY = ajouterEntetePage(doc, echelle.nom || 'Echelle de performance');

    const largeurPage = doc.internal.pageSize.getWidth();
    const largeurContenu = largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite;

    // Seuil de reussite si defini
    if (echelle.config?.seuilReussite) {
        doc.setFontSize(PDF_CONFIG.polices.texteNormal);
        doc.setTextColor(...PDF_CONFIG.couleurs.texteSecondaire);
        doc.text(`Seuil de reussite : ${echelle.config.seuilReussite}%`, PDF_CONFIG.marges.gauche, posY);
        posY += 8;
    }

    // Tableau des niveaux
    if (echelle.niveaux && echelle.niveaux.length > 0) {
        const donnees = echelle.niveaux.map(n => [
            n.code || '—',
            n.nom || '—',
            n.description || '—',
            `${n.min ?? 0}% - ${n.max ?? 100}%`
        ]);

        doc.autoTable({
            startY: posY,
            head: [['Code', 'Niveau', 'Description', 'Plage']],
            body: donnees,
            theme: 'grid',
            headStyles: {
                fillColor: PDF_CONFIG.couleurs.titreSection,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: PDF_CONFIG.polices.texteNormal
            },
            bodyStyles: {
                fontSize: PDF_CONFIG.polices.textePetit,
                textColor: PDF_CONFIG.couleurs.textePrincipal
            },
            columnStyles: {
                0: { cellWidth: largeurContenu * 0.10, halign: 'center', fontStyle: 'bold' },
                1: { cellWidth: largeurContenu * 0.25 },
                2: { cellWidth: largeurContenu * 0.45 },
                3: { cellWidth: largeurContenu * 0.20, halign: 'center' }
            },
            didParseCell: function(data) {
                // Le code du niveau, dans le gris du texte (#593 : plus de couleur par lettre IDME)
                if (data.section === 'body' && data.column.index === 0) {
                    const code = data.cell.raw;
                    const couleur = PDF_CONFIG.couleurs.textePrincipal;   // #593 : même gris pour tout code, quelle que soit l'échelle
                    data.cell.styles.textColor = couleur;
                }
            },
            margin: { left: PDF_CONFIG.marges.gauche, right: PDF_CONFIG.marges.droite }
        });
    }

    finaliserDocument(doc);
    doc.save(options.nomFichier || `echelle-${echelle.id || 'export'}.pdf`);
}

/**
 * Exporte toutes les echelles en un seul PDF
 */
async function exporterToutesEchellesPDF(options = {}) {
    const echelles = await db.get(cle('echellesTemplates')) || [];
    if (echelles.length === 0) {
        alert('Aucune echelle a exporter.');
        return;
    }

    const doc = creerDocumentPDF();
    let premierePage = true;

    for (const echelle of echelles) {
        if (!premierePage) {
            doc.addPage();
        }
        premierePage = false;

        let posY = ajouterEntetePage(doc, echelle.nom || 'Echelle de performance');

        const largeurPage = doc.internal.pageSize.getWidth();
        const largeurContenu = largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite;

        // Seuil de reussite
        if (echelle.config?.seuilReussite) {
            doc.setFontSize(PDF_CONFIG.polices.texteNormal);
            doc.setTextColor(...PDF_CONFIG.couleurs.texteSecondaire);
            doc.text(`Seuil de reussite : ${echelle.config.seuilReussite}%`, PDF_CONFIG.marges.gauche, posY);
            posY += 8;
        }

        // Tableau des niveaux
        if (echelle.niveaux && echelle.niveaux.length > 0) {
            const donnees = echelle.niveaux.map(n => [
                n.code || '—',
                n.nom || '—',
                n.description || '—',
                `${n.min ?? 0}% - ${n.max ?? 100}%`
            ]);

            doc.autoTable({
                startY: posY,
                head: [['Code', 'Niveau', 'Description', 'Plage']],
                body: donnees,
                theme: 'grid',
                headStyles: {
                    fillColor: PDF_CONFIG.couleurs.titreSection,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontSize: PDF_CONFIG.polices.textePetit
                },
                columnStyles: {
                    0: { cellWidth: largeurContenu * 0.10, halign: 'center', fontStyle: 'bold' },
                    1: { cellWidth: largeurContenu * 0.25 },
                    2: { cellWidth: largeurContenu * 0.45 },
                    3: { cellWidth: largeurContenu * 0.20, halign: 'center' }
                },
                didParseCell: function(data) {
                    if (data.section === 'body' && data.column.index === 0) {
                        const code = data.cell.raw;
                        const couleur = PDF_CONFIG.couleurs.textePrincipal;   // #593 : même gris pour tout code, quelle que soit l'échelle
                        data.cell.styles.textColor = couleur;
                    }
                },
                margin: { left: PDF_CONFIG.marges.gauche, right: PDF_CONFIG.marges.droite }
            });
        }
    }

    finaliserDocument(doc);
    doc.save(options.nomFichier || 'echelles-performance.pdf');
}

// =============================================================================
// EXPORT DES CARTOUCHES DE RETROACTION
// =============================================================================

/**
 * Exporte une cartouche de retroaction en PDF (matrice criteres x niveaux)
 */
async function exporterCartouchePDF(cartouche, options = {}) {
    // Mode paysage pour la matrice
    const doc = creerDocumentPDF('landscape');
    let posY = ajouterEntetePage(doc, cartouche.nom || 'Cartouche de retroaction');

    const largeurPage = doc.internal.pageSize.getWidth();
    const largeurContenu = largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite;

    // Contexte
    if (cartouche.contexte) {
        doc.setFontSize(PDF_CONFIG.polices.textePetit);
        doc.setTextColor(...PDF_CONFIG.couleurs.texteSecondaire);
        doc.setFont('helvetica', 'italic');
        const lignes = doc.splitTextToSize(cartouche.contexte, largeurContenu);
        doc.text(lignes, PDF_CONFIG.marges.gauche, posY);
        posY += lignes.length * 4 + 5;
    }

    // Construction de la matrice
    const criteres = cartouche.criteres || [];
    const niveaux = cartouche.niveaux || [];
    const commentaires = cartouche.commentaires || {};

    if (criteres.length === 0 || niveaux.length === 0) {
        doc.setFontSize(PDF_CONFIG.polices.texteNormal);
        doc.setTextColor(...PDF_CONFIG.couleurs.texteSecondaire);
        doc.text('Cartouche incomplete (criteres ou niveaux manquants)', PDF_CONFIG.marges.gauche, posY);
    } else {
        // En-tetes : Critere + niveaux
        const entetes = ['Critere', ...niveaux.map(n => n.code || n.nom)];

        // Lignes : un critere par ligne avec ses commentaires
        const donnees = criteres.map(c => {
            const ligne = [c.nom || '—'];
            niveaux.forEach(n => {
                const cle = `${c.id}_${n.code}`;
                ligne.push(commentaires[cle] || '—');
            });
            return ligne;
        });

        // Calcul des largeurs de colonnes
        const largeurCritere = largeurContenu * 0.15;
        const largeurNiveau = (largeurContenu - largeurCritere) / niveaux.length;

        const colonnesStyles = {
            0: { cellWidth: largeurCritere, fontStyle: 'bold' }
        };
        niveaux.forEach((n, i) => {
            colonnesStyles[i + 1] = { cellWidth: largeurNiveau };
        });

        doc.autoTable({
            startY: posY,
            head: [entetes],
            body: donnees,
            theme: 'grid',
            headStyles: {
                fillColor: PDF_CONFIG.couleurs.titreSection,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: PDF_CONFIG.polices.textePetit,
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 8,
                textColor: PDF_CONFIG.couleurs.textePrincipal,
                cellPadding: 2
            },
            columnStyles: colonnesStyles,
            didParseCell: function(data) {
                // En-têtes de niveaux : fond blanc, texte gris (#593 : plus de couleur par lettre IDME)
                if (data.section === 'head' && data.column.index > 0) {
                    const niveau = niveaux[data.column.index - 1];
                    if (niveau?.code) {
                        const couleur = PDF_CONFIG.couleurs.textePrincipal;   // #593 : même gris pour tout code, quelle que soit l'échelle
                        // Garder le fond blanc et colorer le texte
                        data.cell.styles.fillColor = [255, 255, 255];
                        data.cell.styles.textColor = couleur;
                    }
                }
            },
            margin: { left: PDF_CONFIG.marges.gauche, right: PDF_CONFIG.marges.droite }
        });
    }

    finaliserDocument(doc);
    doc.save(options.nomFichier || `cartouche-${cartouche.id || 'export'}.pdf`);
}

// =============================================================================
// EXPORT COMPLET (REFERENTIEL PEDAGOGIQUE)
// =============================================================================

/**
 * Exporte le referentiel pedagogique complet en PDF
 * Inclut : Productions, Grilles, Echelles, Cartouches
 */
async function exporterReferentielCompletPDF(options = {}) {
    const doc = creerDocumentPDF();

    // Page de couverture
    const largeurPage = doc.internal.pageSize.getWidth();
    const hauteurPage = doc.internal.pageSize.getHeight();

    doc.setFontSize(24);
    doc.setTextColor(...PDF_CONFIG.couleurs.titreSection);
    doc.setFont('helvetica', 'bold');
    doc.text('Referentiel Pedagogique', largeurPage / 2, hauteurPage / 3, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(...PDF_CONFIG.couleurs.texteSecondaire);
    doc.setFont('helvetica', 'normal');
    doc.text(options.cours || 'Cours', largeurPage / 2, hauteurPage / 3 + 15, { align: 'center' });
    doc.text(options.trimestre || 'Trimestre', largeurPage / 2, hauteurPage / 3 + 25, { align: 'center' });

    const dateExport = new Date().toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Exporte le ${dateExport}`, largeurPage / 2, hauteurPage / 3 + 40, { align: 'center' });

    doc.setFontSize(10);
    doc.text('Genere par Monitorage Pedagogique', largeurPage / 2, hauteurPage - 30, { align: 'center' });

    // Charger les donnees
    const productions = await db.get(cle('productions')) || [];
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const echelles = await db.get(cle('echellesTemplates')) || [];

    // Section Productions
    if (productions.length > 0) {
        doc.addPage();
        let posY = ajouterEntetePage(doc, '1. Productions');

        const largeurContenu = largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite;
        // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
        const infoCoursExpFull = db.getSync('infoCours', null);
        const gcIdExpFull = obtenirIdContexteActif(infoCoursExpFull);
        const donnees = productions.map(p => {
            const dateEch = (typeof obtenirEcheanceEffective === 'function')
                ? obtenirEcheanceEffective(p, gcIdExpFull).date : p.dateEcheance;
            return [
                p.titre || '—',
                p.type || '—',
                p.ponderation ? `${p.ponderation}%` : '—',
                formaterDate(dateEch)
            ];
        });

        doc.autoTable({
            startY: posY,
            head: [['Titre', 'Type', 'Pond.', 'Echeance']],
            body: donnees,
            theme: 'grid',
            headStyles: {
                fillColor: PDF_CONFIG.couleurs.titreSection,
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            bodyStyles: { fontSize: PDF_CONFIG.polices.textePetit },
            columnStyles: {
                0: { cellWidth: largeurContenu * 0.45 },
                1: { cellWidth: largeurContenu * 0.20 },
                2: { cellWidth: largeurContenu * 0.15, halign: 'center' },
                3: { cellWidth: largeurContenu * 0.20 }
            },
            margin: { left: PDF_CONFIG.marges.gauche, right: PDF_CONFIG.marges.droite }
        });
    }

    // Section Grilles
    for (const grille of grilles) {
        doc.addPage();
        let posY = ajouterEntetePage(doc, `2. Grille : ${grille.nom}`);

        const largeurContenu = largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite;

        if (grille.description) {
            doc.setFontSize(PDF_CONFIG.polices.texteNormal);
            doc.setTextColor(...PDF_CONFIG.couleurs.texteSecondaire);
            doc.setFont('helvetica', 'italic');
            const lignes = doc.splitTextToSize(grille.description, largeurContenu);
            doc.text(lignes, PDF_CONFIG.marges.gauche, posY);
            posY += lignes.length * 5 + 5;
        }

        if (grille.criteres && grille.criteres.length > 0) {
            const donnees = grille.criteres.map(c => [
                c.nom || '—',
                c.description || '—',
                c.ponderation ? `${c.ponderation}%` : '—'
            ]);

            doc.autoTable({
                startY: posY,
                head: [['Critere', 'Description', 'Pond.']],
                body: donnees,
                theme: 'grid',
                headStyles: {
                    fillColor: PDF_CONFIG.couleurs.titreSection,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                bodyStyles: { fontSize: PDF_CONFIG.polices.textePetit },
                columnStyles: {
                    0: { cellWidth: largeurContenu * 0.25, fontStyle: 'bold' },
                    1: { cellWidth: largeurContenu * 0.60 },
                    2: { cellWidth: largeurContenu * 0.15, halign: 'center' }
                },
                margin: { left: PDF_CONFIG.marges.gauche, right: PDF_CONFIG.marges.droite }
            });
        }
    }

    // Section Echelles
    for (const echelle of echelles) {
        doc.addPage();
        let posY = ajouterEntetePage(doc, `3. Echelle : ${echelle.nom}`);

        const largeurContenu = largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite;

        if (echelle.niveaux && echelle.niveaux.length > 0) {
            const donnees = echelle.niveaux.map(n => [
                n.code || '—',
                n.nom || '—',
                n.description || '—',
                `${n.min ?? 0}% - ${n.max ?? 100}%`
            ]);

            doc.autoTable({
                startY: posY,
                head: [['Code', 'Niveau', 'Description', 'Plage']],
                body: donnees,
                theme: 'grid',
                headStyles: {
                    fillColor: PDF_CONFIG.couleurs.titreSection,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                bodyStyles: { fontSize: PDF_CONFIG.polices.textePetit },
                columnStyles: {
                    0: { cellWidth: largeurContenu * 0.10, halign: 'center', fontStyle: 'bold' },
                    1: { cellWidth: largeurContenu * 0.25 },
                    2: { cellWidth: largeurContenu * 0.45 },
                    3: { cellWidth: largeurContenu * 0.20, halign: 'center' }
                },
                didParseCell: function(data) {
                    if (data.section === 'body' && data.column.index === 0) {
                        const code = data.cell.raw;
                        const couleur = PDF_CONFIG.couleurs.textePrincipal;   // #593 : même gris pour tout code, quelle que soit l'échelle
                        data.cell.styles.textColor = couleur;
                    }
                },
                margin: { left: PDF_CONFIG.marges.gauche, right: PDF_CONFIG.marges.droite }
            });
        }
    }

    finaliserDocument(doc);
    doc.save(options.nomFichier || 'referentiel-pedagogique.pdf');
}

// =============================================================================
// EXPOSITION GLOBALE
// =============================================================================

window.ExportPDF = {
    // Config
    config: PDF_CONFIG,

    // #485 : helpers d'en-tête réutilisés par presences-rapport.js (lecture seule)
    infosCours: obtenirInfosCoursPDF,
    nomTrimestre: obtenirNomTrimestre,

    // Productions
    exporterProductions: exporterProductionsPDF,

    // Grilles
    exporterGrille: exporterGrillePDF,
    exporterToutesGrilles: exporterToutesGrillesPDF,

    // Echelles
    exporterEchelle: exporterEchellePDF,
    exporterToutesEchelles: exporterToutesEchellesPDF,

    // Cartouches
    exporterCartouche: exporterCartouchePDF,

    // Complet
    exporterReferentiel: exporterReferentielCompletPDF,

    // Apercus HTML
    apercuGrille: genererApercuGrille,
    apercuEchelle: genererApercuEchelle,
    apercuProductions: genererApercuProductions,
    apercuCartouche: genererApercuCartouche
};

// =============================================================================
// FONCTIONS GLOBALES POUR LES BOUTONS HTML
// =============================================================================

/**
 * Exporte les productions du trimestre courant en PDF
 * Appelee depuis le bouton dans la section Productions
 */
async function exporterProductionsEnPDF() {
    try {
        const productions = await db.get(cle('productions')) || [];
        if (productions.length === 0) {
            alert('Aucune production a exporter.');
            return;
        }
        await exporterProductionsPDF(productions, {
            titre: 'Productions pedagogiques',
            nomFichier: 'productions.pdf'
        });
    } catch (err) {
        console.error('[export-pdf] Erreur export productions:', err);
        alert('Erreur lors de l\'export PDF. Consultez la console.');
    }
}

/**
 * Exporte la cartouche actuellement selectionnee en PDF
 * Appelee depuis le bouton dans la section Cartouches
 */
async function exporterCartoucheSelectionneeEnPDF() {
    try {
        // Utiliser la cartouche active en priorite (nouvelle interface sidebar)
        let cartouche = window.cartoucheActuel || null;

        // Fallback : anciens selects caches (compatibilite)
        if (!cartouche) {
            const grilleId = document.getElementById('selectGrilleRetroaction')?.value;
            const cartoucheId = document.getElementById('selectCartouche')?.value;

            if (!grilleId || !cartoucheId) {
                alert('Veuillez d\'abord s\u00e9lectionner une cartouche.');
                return;
            }

            let cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
            if (!Array.isArray(cartouches)) cartouches = [cartouches];
            cartouche = cartouches.find(c => c.id === cartoucheId);
        }

        if (!cartouche) {
            alert('Cartouche introuvable.');
            return;
        }

        await exporterCartouchePDF(cartouche, {
            nomFichier: `cartouche-${cartouche.nom || cartouche.id}.pdf`
        });
    } catch (err) {
        console.error('[export-pdf] Erreur export cartouche:', err);
        alert('Erreur lors de l\'export PDF. Consultez la console.');
    }
}

/**
 * Exporte la grille actuellement selectionnee en PDF
 * Utilise la variable globale grilleTemplateActuelle
 */
async function exporterGrilleSelectionneeEnPDF() {
    try {
        // grilleTemplateActuelle est definie dans config.js
        if (!grilleTemplateActuelle) {
            alert('Veuillez d\'abord selectionner une grille.');
            return;
        }
        await exporterGrillePDF(grilleTemplateActuelle, {
            nomFichier: `grille-${grilleTemplateActuelle.nom || 'export'}.pdf`
        });
    } catch (err) {
        console.error('[export-pdf] Erreur export grille:', err);
        alert('Erreur lors de l\'export PDF. Consultez la console.');
    }
}

/**
 * Exporte l'echelle actuellement selectionnee en PDF
 * Utilise la variable globale echelleTemplateActuelle
 */
async function exporterEchelleSelectionneeEnPDF() {
    try {
        // echelleTemplateActuelle est definie dans echelles.js
        if (!window.echelleTemplateActuelle) {
            alert('Veuillez d\'abord selectionner une echelle.');
            return;
        }
        await exporterEchellePDF(window.echelleTemplateActuelle, {
            nomFichier: `echelle-${window.echelleTemplateActuelle.nom || 'export'}.pdf`
        });
    } catch (err) {
        console.error('[export-pdf] Erreur export echelle:', err);
        alert('Erreur lors de l\'export PDF. Consultez la console.');
    }
}

// =============================================================================
// FONCTIONS D'APERCU POUR L'INTERFACE
// =============================================================================

/**
 * Affiche l'apercu de la grille selectionnee dans la zone dediee
 */
function afficherApercuGrilleSelectionnee() {
    const zoneApercu = document.getElementById('zoneApercuGrille');
    const contenuApercu = document.getElementById('contenuApercuGrille');
    const btnExport = document.getElementById('btnPreparerPDFGrille');

    if (!zoneApercu || !contenuApercu) return;

    if (grilleTemplateActuelle) {
        contenuApercu.innerHTML = genererApercuGrille(grilleTemplateActuelle);
        zoneApercu.classList.add('visible');
        if (btnExport) btnExport.classList.add('visible');
    } else {
        zoneApercu.classList.remove('visible');
        if (btnExport) btnExport.classList.remove('visible');
    }
}

/**
 * Affiche l'apercu de l'echelle selectionnee dans la zone dediee
 */
function afficherApercuEchelleSelectionnee() {
    const zoneApercu = document.getElementById('zoneApercuEchelle');
    const contenuApercu = document.getElementById('contenuApercuEchelle');
    const btnExport = document.getElementById('btnPreparerPDFEchelle');

    if (!zoneApercu || !contenuApercu) return;

    if (window.echelleTemplateActuelle) {
        contenuApercu.innerHTML = genererApercuEchelle(window.echelleTemplateActuelle);
        zoneApercu.classList.add('visible');
        if (btnExport) btnExport.classList.add('visible');
    } else {
        zoneApercu.classList.remove('visible');
        if (btnExport) btnExport.classList.remove('visible');
    }
}

/**
 * Affiche l'apercu de la liste des productions
 */
async function afficherApercuProductionsListe() {
    const zoneApercu = document.getElementById('zoneApercuProductions');
    const contenuApercu = document.getElementById('contenuApercuProductions');
    const btnExport = document.getElementById('btnExporterProductionsPDF');

    if (!zoneApercu || !contenuApercu) return;

    try {
        const productions = await db.get(cle('productions')) || [];
        if (productions.length > 0) {
            contenuApercu.innerHTML = genererApercuProductions(productions);
            zoneApercu.classList.add('visible');
            if (btnExport) btnExport.classList.add('visible');
        } else {
            zoneApercu.classList.remove('visible');
            if (btnExport) btnExport.classList.remove('visible');
        }
    } catch (err) {
        console.error('[export-pdf] Erreur affichage apercu productions:', err);
    }
}

/**
 * Affiche l'apercu de la cartouche selectionnee
 */
async function afficherApercuCartoucheSelectionnee() {
    const zoneApercu = document.getElementById('zoneApercuCartouche');
    const contenuApercu = document.getElementById('contenuApercuCartouche');
    const btnExport = document.getElementById('btnPreparerPDFCartouche');

    if (!zoneApercu || !contenuApercu) return;

    try {
        const grilleId = document.getElementById('selectGrilleRetroaction')?.value;
        const cartoucheId = document.getElementById('selectCartouche')?.value;

        if (grilleId && cartoucheId) {
            let cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
            if (!Array.isArray(cartouches)) cartouches = [cartouches];

            const cartouche = cartouches.find(c => c.id === cartoucheId);
            if (cartouche) {
                contenuApercu.innerHTML = genererApercuCartouche(cartouche);
                zoneApercu.classList.add('visible');
                if (btnExport) btnExport.classList.add('visible');
                return;
            }
        }

        zoneApercu.classList.remove('visible');
        if (btnExport) btnExport.classList.remove('visible');
    } catch (err) {
        console.error('[export-pdf] Erreur affichage apercu cartouche:', err);
    }
}

/**
 * Cache tous les apercus PDF
 */
function cacherTousLesApercusPDF() {
    ['zoneApercuGrille', 'zoneApercuEchelle', 'zoneApercuProductions', 'zoneApercuCartouche'].forEach(id => {
        const zone = document.getElementById(id);
        if (zone) zone.classList.remove('visible');
    });

    ['btnPreparerPDFGrille', 'btnPreparerPDFEchelle', 'btnExporterProductionsPDF', 'btnPreparerPDFCartouche'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('visible');
    });
}

// =============================================================================
// MODAL EXPORT PDF COMBINE (Beta 95.7 - #30)
// =============================================================================

/**
 * Ouvre le modal d'export PDF avec preselection optionnelle
 * @param {Object} options - Options de preselection
 * @param {string} options.grilleId - ID de la grille a preselectionner
 * @param {string} options.echelleId - ID de l'echelle a preselectionner
 */
async function ouvrirModalExportPDF(options = {}) {
    const modal = document.getElementById('modalExportPDF');
    if (!modal) return;

    // Charger les options des dropdowns
    await chargerOptionsExportPDF();

    // Preselectionner si des options sont fournies
    if (options.grilleId) {
        const selectGrille = document.getElementById('exportPDF-grille');
        if (selectGrille) selectGrille.value = options.grilleId;
    }
    if (options.echelleId) {
        const selectEchelle = document.getElementById('exportPDF-echelle');
        if (selectEchelle) selectEchelle.value = options.echelleId;
    }

    // Afficher le modal
    modal.classList.remove('u-hide');

    // Mettre a jour l'apercu
    await mettreAJourApercuPDF();
}

/**
 * Ferme le modal d'export PDF
 */
function fermerModalExportPDF() {
    const modal = document.getElementById('modalExportPDF');
    if (modal) modal.classList.add('u-hide');
}

/**
 * Charge les options de tous les dropdowns du modal
 */
async function chargerOptionsExportPDF() {
    const selectProduction = document.getElementById('exportPDF-production');
    const selectGrille = document.getElementById('exportPDF-grille');
    const selectEchelle = document.getElementById('exportPDF-echelle');

    // Charger les productions
    if (selectProduction) {
        const cleProductions = cle('productions');
        const productions = await db.get(cleProductions) || [];
        selectProduction.innerHTML = '<option value="">-- Aucune (grille générique) --</option>' +
            productions.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.titre || p.activiteApprentissage || p.description || 'Sans titre')}</option>`).join('');
    }

    // Charger les grilles
    if (selectGrille) {
        const grilles = await db.get(cle('grillesTemplates')) || [];
        selectGrille.innerHTML = '<option value="">-- Sélectionner --</option>' +
            grilles.map(g => `<option value="${escapeHtml(g.id)}">${escapeHtml(g.nom || 'Sans nom')}</option>`).join('');
    }

    // Charger les echelles
    if (selectEchelle) {
        const echelles = await db.get(cle('echellesTemplates')) || [];
        selectEchelle.innerHTML = '<option value="">-- Sélectionner --</option>' +
            echelles.map(e => `<option value="${escapeHtml(e.id)}">${escapeHtml(e.nom || 'Sans nom')}</option>`).join('');
    }
}

/**
 * Met a jour l'apercu PDF quand les selections changent
 */
async function mettreAJourApercuPDF() {
    const productionId = document.getElementById('exportPDF-production')?.value;
    const grilleId = document.getElementById('exportPDF-grille')?.value;
    const echelleId = document.getElementById('exportPDF-echelle')?.value;
    const cartoucheId = document.getElementById('exportPDF-cartouche')?.value;
    const taillePolice = document.getElementById('exportPDF-taille-police')?.value || 'moyen';

    const zoneApercu = document.getElementById('exportPDF-apercu');
    const btnExporter = document.getElementById('exportPDF-btn-exporter');
    const optionsProduction = document.getElementById('exportPDF-options-production');
    const sectionCartouche = document.getElementById('exportPDF-section-cartouche');
    const selectCartouche = document.getElementById('exportPDF-cartouche');

    if (!zoneApercu) return;

    // Afficher/masquer options production
    if (optionsProduction) {
        toggleDisplay(optionsProduction, !!productionId);
    }

    // Charger les cartouches disponibles pour la grille selectionnee
    if (grilleId && sectionCartouche && selectCartouche) {
        const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
        if (cartouches.length > 0) {
            sectionCartouche.classList.remove('u-hide');
            const currentValue = selectCartouche.value;
            selectCartouche.innerHTML = '<option value="">-- Sans rétroaction --</option>' +
                cartouches.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.nom || 'Cartouche sans nom')}</option>`).join('');
            // Restaurer la selection si possible
            if (currentValue && cartouches.find(c => c.id === currentValue)) {
                selectCartouche.value = currentValue;
            }
        } else {
            sectionCartouche.classList.add('u-hide');
            selectCartouche.innerHTML = '<option value="">-- Sans rétroaction --</option>';
        }
    } else if (sectionCartouche) {
        sectionCartouche.classList.add('u-hide');
    }

    // Si grille et echelle selectionnees, generer l'apercu
    if (grilleId && echelleId) {
        // Charger les donnees
        const grilles = await db.get(cle('grillesTemplates')) || [];
        const echelles = await db.get(cle('echellesTemplates')) || [];
        const grille = grilles.find(g => g.id === grilleId);
        const echelle = echelles.find(e => e.id === echelleId);

        let production = null;
        if (productionId) {
            const cleProductions = cle('productions');
            const productions = await db.get(cleProductions) || [];
            production = productions.find(p => p.id === productionId);
        }

        let cartouche = null;
        if (cartoucheId && grilleId) {
            const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
            cartouche = cartouches.find(c => c.id === cartoucheId);
        }

        if (grille && echelle) {
            // Options d'affichage
            const options = {
                production: production,
                inclureNomProduction: document.getElementById('exportPDF-prod-nom')?.checked,
                inclureObjectif: document.getElementById('exportPDF-prod-objectif')?.checked,
                inclureDescription: document.getElementById('exportPDF-prod-description')?.checked,
                taillePolice: taillePolice
            };

            zoneApercu.innerHTML = genererApercuCombine(grille, echelle, cartouche, options);
            if (btnExporter) btnExporter.disabled = false;
        }
    } else {
        zoneApercu.innerHTML = '<p class="text-muted text-center" style="padding: 40px;">Sélectionne une grille et une échelle pour voir l\'aperçu</p>';
        if (btnExporter) btnExporter.disabled = true;
    }
}

/**
 * Genere l'apercu HTML combine (grille + echelle + cartouche optionnelle)
 * Fidele au rendu PDF avec taille de police configurable (sauf titre et retroactions)
 * @param {Object} grille - Grille de criteres
 * @param {Object} echelle - Echelle de performance
 * @param {Object} cartouche - Cartouche de retroaction (optionnel)
 * @param {Object} options - Options d'affichage
 */
/**
 * LE MODÈLE DU DOCUMENT — ce qu'il DIT, avant qu'on décide comment le montrer.
 * (#497, étape 2 du plan « document de consignes », 25 août 2026)
 *
 * ⚠⚠ POURQUOI CETTE COUCHE EXISTE. `genererApercuCombine` (HTML) et
 * `genererPDFCombine` (jsPDF) construisaient DEUX FOIS le même document, chacun
 * avec sa mise en page et sa propre copie des règles : quel titre porter, quels
 * blocs d'information montrer, quelles lignes d'en-tête. Rien ne les tenait
 * d'accord. C'est la cause de fond du constat de Grégoire — « l'aperçu ne
 * ressemble pas au PDF » — et pas un défaut de CSS.
 *
 * ⮕ Désormais les deux rendeurs partent du MÊME modèle. Ce qui change ici
 * change des deux côtés ; ce qui reste dans un rendeur est une décision de
 * PRÉSENTATION, jamais une décision de contenu.
 *
 * ⚠ Le modèle porte du TEXTE BRUT, jamais d'échappement ni de balise :
 * l'échappement est une affaire de rendu HTML, et le PDF n'en veut pas. Un
 * modèle qui contiendrait déjà `&amp;` enverrait cette esperluette telle quelle
 * dans le PDF.
 */
function construireModeleDocument(grille, cartouche, options) {
    const cran = cranDocument(options, grille, cartouche);
    return {
        cran: cran,
        disposition: dispositionDocument(options),
        titre: titreDocument(grille, options),
        entete: lignesEnteteDocument(options),
        // ⚠ Le contexte de la rétroaction appartient à la CARTOUCHE : il n'entre
        // dans les blocs qu'au cran où la cartouche entre elle-même.
        blocsInfo: blocsInformationDocument(cran === CRAN_RETROACTION ? cartouche : null, options),
        afficheEvaluation: cran === CRAN_EVALUATION || cran === CRAN_RETROACTION,
        afficheRetroaction: cran === CRAN_RETROACTION
    };
}

/**
 * LA DISPOSITION DES CONSIGNES (#497 étape 4, 25 août 2026).
 *
 * Décision de Grégoire : la mise en page est un CHOIX, au même titre que
 * l'orientation du papier. Deux dispositions :
 *   • `continu`       — un bloc après l'autre, pleine largeur ;
 *   • `deux-colonnes` — le format de son Manuel : chaque bloc annoncé par un
 *     bandeau, et les blocs répartis en deux colonnes.
 *
 * ⚠⚠ CE QUI REND LE FORMAT DU MANUEL LISIBLE N'EST PAS LE NOMBRE DE COLONNES,
 * c'est que chaque bloc DIT ce qu'il est avant de commencer. Deux colonnes de
 * texte nu seraient exactement le défaut qu'on vient de corriger — des bandes
 * étroites où le détail de la tâche déborde. Le bandeau vient donc AVEC la
 * disposition, jamais en supplément facultatif.
 *
 * ⚠ LA PAGE D'ÉVALUATION RESTE PLEINE LARGEUR, quelle que soit la disposition :
 * un tableau de six colonnes de descripteurs dans une demi-page ne se lit pas.
 * La disposition règle les CONSIGNES ; la grille garde sa page. (Décision de
 * Grégoire, 25 août : ce document REMPLACE la mise en page de son Manuel, il
 * n'a donc pas à en reproduire la grille miniature.)
 */
const DISPO_CONTINU = 'continu';
const DISPO_DEUX_COLONNES = 'deux-colonnes';

function dispositionDocument(options) {
    return (options && options.disposition === DISPO_DEUX_COLONNES)
        ? DISPO_DEUX_COLONNES : DISPO_CONTINU;
}

/**
 * Répartit les blocs en deux colonnes de hauteur comparable.
 *
 * ⚠⚠ FONCTION PURE, PARTAGÉE PAR LES DEUX RENDEURS — c'est tout l'intérêt de
 * l'étape 2. Le CSS sait faire `column-count: 2` et jsPDF ne sait pas : laisser
 * chacun répartir à sa façon donnerait un aperçu et un PDF qui ne coupent pas
 * au même bloc, et le premier texte un peu long le montrerait.
 *
 * ⚠ Le poids d'un bloc est la longueur de son texte PLUS un forfait pour son
 * bandeau et l'air autour. Sans ce forfait, trois blocs courts et un long
 * partiraient tous du même côté : la longueur du texte seule ne dit pas la
 * hauteur d'un bloc sur la page.
 *
 * ⮕ L'ordre de lecture est préservé dans chaque colonne : on remplit la gauche
 * jusqu'à la moitié du poids total, puis la droite. On ne réordonne jamais des
 * consignes — « 1. Lis et annote » doit précéder « 2. Identifie ».
 *
 * @returns {{gauche: Array, droite: Array}}
 */
function repartirEnDeuxColonnes(blocs) {
    const FORFAIT_BANDEAU = 90;   // caractères — le bandeau et l'air autour
    const poids = (b) => String(b.texte || '').length + FORFAIT_BANDEAU;
    const total = blocs.reduce((somme, b) => somme + poids(b), 0);

    const gauche = [], droite = [];
    let accumule = 0;
    blocs.forEach((bloc, i) => {
        const restants = blocs.length - i;
        // La colonne de droite ne doit pas rester vide : s'il ne reste que de
        // quoi la remplir, on bascule.
        const basculer = accumule >= total / 2
            || (droite.length === 0 && restants === 1 && gauche.length > 0);
        if (basculer && gauche.length > 0) {
            droite.push(bloc);
        } else {
            gauche.push(bloc);
            accumule += poids(bloc);
        }
    });
    return { gauche: gauche, droite: droite };
}

/**
 * LES TROIS CRANS DU DOCUMENT (#497, étape 3 — 25 août 2026).
 *
 * Décision de Grégoire : trois profondeurs CUMULATIVES, pas trois documents.
 * Chacune ajoute à la précédente — on ne montre jamais l'échelle sans les
 * consignes, ni la cartouche sans la grille qui la porte.
 *
 * ⚠ UN CRAN SANS MATIÈRE N'EST PAS OFFERT, ET LA RAISON EST DITE. Une
 * production sans grille ne peut pas monter à « + Évaluation » : proposer le
 * cran puis rendre une page vide serait pire que ne pas le proposer.
 * `cransDisponibles` répond à l'interface ; cette fonction-ci se contente de
 * RABATTRE une demande impossible sur le cran le plus haut qui tienne — sans
 * quoi un réglage mémorisé sur « + Rétroaction » viderait le document d'une
 * production qui n'a pas de cartouche.
 */
const CRAN_CONSIGNES = 'consignes';
const CRAN_EVALUATION = 'evaluation';
const CRAN_RETROACTION = 'retroaction';

function cranDocument(options, grille, cartouche) {
    const dispo = cransDisponibles(grille, cartouche, options);
    // ⚠ Sans demande explicite, le cran le plus HAUT que le document puisse
    // porter : c'est le comportement d'avant les crans, et rien ne disparaît de
    // ce que Grégoire voyait jusqu'ici en ouvrant l'aperçu.
    const demande = options.cran || dispo[dispo.length - 1];
    if (dispo.indexOf(demande) !== -1) return demande;
    return dispo[dispo.length - 1] || CRAN_CONSIGNES;
}

/**
 * #513 (25 août 2026) — « CETTE PRODUCTION A-T-ELLE DES CONSIGNES À MONTRER ? »,
 * EN UN SEUL ENDROIT.
 *
 * ⚠⚠ La réponse était écrite deux fois, et les deux versions divergeaient.
 * `blocsInformationDocument` rend les trois blocs ancrés ET les blocs libres
 * de #499 ; `cransDisponibles`, lui, ne regardait que les trois ancrés. Une
 * production dont l'enseignant·e avait rempli « Format et mise en page » et
 * « Remise du travail » — et rien d'autre — se voyait donc refuser son cran
 * « Consignes », avec un motif faux en infobulle : « ni objectif, ni
 * description, ni détail de tâche ». Elle en avait, pourtant, et à l'écran.
 *
 * Même règle que le rendu pour les blocs libres : titre ET contenu, faute de
 * quoi ce serait un bandeau au-dessus du vide.
 */
function productionAConsignes(production) {
    if (!production) return false;
    if (production.objectif || production.tache || production.detailTache) return true;
    return Array.isArray(production.champsPersonnalises)
        && production.champsPersonnalises.some(champ =>
            champ && String(champ.titre || '').trim() && String(champ.contenu || '').trim());
}

/**
 * Les crans que CE document peut réellement porter, du plus bas au plus haut.
 *
 * ⚠ Sans production, il n'y a pas de consignes à montrer : le document est
 * alors une grille, et son premier cran est « + Évaluation ». C'est le chemin
 * des boutons qui partent d'une échelle ou d'une cartouche.
 *
 * @returns {Array<string>} jamais vide
 */
function cransDisponibles(grille, cartouche, options) {
    const opts = options || {};
    const crans = [];

    if (productionAConsignes(opts.production)) crans.push(CRAN_CONSIGNES);

    const aEvaluation = !!(grille && Array.isArray(grille.criteres) && grille.criteres.length > 0);
    if (aEvaluation) crans.push(CRAN_EVALUATION);

    // La rétroaction n'a de sens qu'avec la grille qui porte ses commentaires.
    const aRetroaction = aEvaluation && !!cartouche;
    if (aRetroaction) crans.push(CRAN_RETROACTION);

    return crans.length > 0 ? crans : [CRAN_CONSIGNES];
}

/** Ce que le cran indisponible doit DIRE, plutôt que de disparaître en silence. */
function raisonCranIndisponible(cran, grille, cartouche, options) {
    if (cran === CRAN_CONSIGNES) {
        // #513 — le motif doit dire la MÊME chose que la règle : les blocs
        // nommés par l'enseignant·e comptent aussi.
        return 'Cette production n\'a aucun bloc de consignes rempli.';
    }
    if (cran === CRAN_EVALUATION) {
        return 'Aucune grille de critères n\'est associée à cette production.';
    }
    if (cran === CRAN_RETROACTION) {
        if (!grille || !Array.isArray(grille.criteres) || grille.criteres.length === 0) {
            return 'Sans grille de critères, il n\'y a pas de cartouche à montrer.';
        }
        return 'Aucune cartouche de rétroaction n\'est associée à cette production.';
    }
    return '';
}

/**
 * Le titre du document : le nom de la production quand il y en a une, le nom de
 * la grille sinon. C'était écrit à l'identique dans les deux rendeurs.
 */
function titreDocument(grille, options) {
    if (options.production && options.inclureNomProduction) {
        const nomProd = options.production.titre || 'Production';
        const activite = options.production.activiteApprentissage || options.production.description || '';
        return activite ? `${nomProd} - ${activite}` : nomProd;
    }
    return (grille && grille.nom) || 'Grille de critères';
}

/**
 * Les lignes d'en-tête, à droite du titre : sigle, nom du cours, trimestre.
 * `gras` est une indication de RANG, pas de style : c'est au rendeur de décider
 * comment il la traduit (un `<span>` ici, un `setFont('bold')` là).
 * @returns {Array<{texte: string, gras: boolean}>}
 */
function lignesEnteteDocument(options) {
    const infosCours = (options && options.infosCours) || obtenirInfosCoursPDF();
    const trimestre = obtenirNomTrimestre();
    const lignes = [];

    if ((options.enteteCode !== false) && infosCours.sigle) {
        lignes.push({ texte: infosCours.sigle, gras: true });
    }
    if ((options.enteteNom !== false) && infosCours.titre) {
        lignes.push({ texte: infosCours.titre, gras: false });
    }
    if ((options.enteteTrimestre !== false) && trimestre) {
        lignes.push({ texte: trimestre, gras: false });
    }
    return lignes;
}

/**
 * LE BLOC « DATE DE REMISE » (#498, 25 août 2026).
 *
 * ⚠⚠ IL EST TOUJOURS LÀ — demande de Grégoire. Une consigne sans date de remise
 * est une consigne à moitié transmise, et un document qui la tait laisse
 * l'étudiant la chercher ailleurs. Quand aucune date n'est posée, le bloc dit
 * « À préciser » plutôt que de disparaître : le document avoue ce qu'il ne sait
 * pas encore, au lieu de faire silence sur une information attendue.
 *
 * ⚠ PLUSIEURS GROUPES, PLUSIEURS DATES. Deux groupes du même cours ne se
 * rencontrent pas le même jour (cf. #493) : le bloc les nomme tous les deux
 * plutôt que d'en choisir un. En choisir un donnerait à la moitié des
 * étudiant·es une date qui n'est pas la leur — sur le document qui la leur
 * annonce.
 *
 * ⚠ Une date NON ASSIGNÉE est affichée quand même. Ce document EST l'acte de
 * transmission : au moment où Grégoire l'imprime, la case « consignes
 * transmises » n'est pas encore cochée. La taire ici obligerait à cocher avant
 * d'imprimer, c'est-à-dire à déclarer transmis ce qui ne l'est pas encore.
 *
 * @returns {{titre: string, texte: string}|null} null si la production manque
 */
function blocEcheance(production) {
    if (!production) return null;

    const dates = datesDeRemise(production);
    if (dates.length === 0) {
        return { titre: 'Date de remise :', texte: 'À préciser' };
    }
    if (dates.length === 1) {
        return { titre: 'Date de remise :', texte: dates[0].date };
    }
    return {
        titre: 'Date de remise :',
        texte: dates.map(d => `${d.groupe} : ${d.date}`).join('\n')
    };
}

/**
 * Les dates de remise d'une production, avec le groupe quand il y en a
 * plusieurs. Lit le même modèle que l'écran des échéances (`echeancesParGroupe`,
 * repli `dateEcheance`) : deux lectures différentes finiraient par annoncer
 * deux dates différentes pour la même remise.
 *
 * @returns {Array<{groupe: string, date: string}>}
 */
function datesDeRemise(production) {
    const formater = (iso) => {
        if (!iso) return '';
        const d = new Date(iso + 'T12:00:00');
        if (isNaN(d.getTime())) return iso;
        return d.toLocaleDateString('fr-CA', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const parGroupe = production.echeancesParGroupe;
    if (!parGroupe || Object.keys(parGroupe).length === 0) {
        return production.dateEcheance
            ? [{ groupe: '', date: formater(production.dateEcheance) }]
            : [];
    }

    let groupesCours = [];
    try {
        if (typeof db !== 'undefined' && db.getSync && typeof cle === 'function') {
            groupesCours = db.getSync(cle('groupesCours'), []) || [];
        }
    } catch (e) { groupesCours = []; }

    const nomDe = (gcId) => {
        const gc = groupesCours.find(g => g && g.id === gcId);
        const num = gc && gc.groupeNum;
        return num ? `gr. ${String(num).padStart(5, '0')}` : 'Groupe';
    };

    return Object.keys(parGroupe)
        .filter(gcId => parGroupe[gcId] && parGroupe[gcId].date)
        .map(gcId => ({ groupe: nomDe(gcId), date: formater(parGroupe[gcId].date) }))
        .sort((a, b) => a.groupe.localeCompare(b.groupe));
}

/**
 * Les blocs d'information du document — objectif, description, détail, contexte
 * de la rétroaction — dans leur ordre de lecture.
 *
 * ⚠ Ils ne portent PAS leur disposition. Le premier jet les appelait
 * « colonnes » des deux côtés, et cette manière de les nommer a suffi à figer
 * une mise en page : sur une consigne dont le détail fait quinze lignes,
 * quatre colonnes côte à côte donnent une bande d'un pouce qui déborde pendant
 * que ses voisines restent vides. Ce sont des BLOCS ; leur disposition est un
 * choix de l'utilisateur (étape 4 du plan).
 *
 * @returns {Array<{titre: string, texte: string}>}
 */
function blocsInformationDocument(cartouche, options) {
    const prod = options.production;
    const parCle = {};

    // ⚠ #500 — le TITRE d'un bloc ancré est celui que Grégoire a écrit, s'il
    // en a écrit un. `titresBlocs` ne contient que ce qui DIFFÈRE du défaut :
    // un libellé non touché suit l'application quand elle le fait évoluer.
    const titreAncre = (cle, defaut) => {
        const pose = prod && prod.titresBlocs && prod.titresBlocs[cle];
        return (pose && String(pose).trim()) ? String(pose).trim() + ' :' : defaut;
    };

    if (prod && options.inclureObjectif && prod.objectif) {
        parCle.objectif = { titre: titreAncre('objectif', 'Objectif d\'apprentissage :'), texte: prod.objectif };
    }
    if (prod && options.inclureDescription && prod.tache) {
        parCle.tache = { titre: titreAncre('tache', 'Description de la tâche :'), texte: prod.tache };
    }
    if (prod && options.inclureDetailTache && prod.detailTache) {
        parCle.detailTache = { titre: titreAncre('detailTache', 'Détail de la tâche :'), texte: prod.detailTache };
    }

    // #499 — les champs libres. Un champ sans titre OU sans contenu n'entre pas :
    // il s'afficherait comme un bandeau vide au-dessus du vide.
    if (prod && Array.isArray(prod.champsPersonnalises)) {
        prod.champsPersonnalises.forEach(champ => {
            const titre = champ && champ.titre ? String(champ.titre).trim() : '';
            const contenu = champ && champ.contenu ? String(champ.contenu).trim() : '';
            if (titre && contenu) parCle[champ.id] = { titre: titre + ' :', texte: contenu };
        });
    }

    // ⚠ #500 — L'ORDRE DU GABARIT FAIT FOI. Sans `ordreBlocs`, on garde celui
    // d'origine : objectif, tâche, détail, puis les champs libres dans leur
    // ordre de création. Un ordre enregistré peut être périmé — on ne prend que
    // les blocs qui EXISTENT, et on ajoute à la fin ceux qu'il ne connaît pas.
    const ordreDefaut = ['objectif', 'tache', 'detailTache'].concat(
        (prod && Array.isArray(prod.champsPersonnalises) ? prod.champsPersonnalises : []).map(c => c.id));
    const memorise = (prod && Array.isArray(prod.ordreBlocs)) ? prod.ordreBlocs : [];
    const ordre = memorise.filter(ref => parCle[ref])
        .concat(ordreDefaut.filter(ref => parCle[ref] && memorise.indexOf(ref) === -1));

    const blocs = ordre.map(ref => parCle[ref]);

    // ⚠ La date de remise vient APRÈS les consignes et AVANT le contexte de
    // rétroaction : l'étudiant lit ce qu'on lui demande, puis quand le rendre.
    // Le contexte, lui, parle de l'évaluation, pas de la tâche.
    const echeance = blocEcheance(prod);
    if (echeance) blocs.push(echeance);

    if (cartouche && cartouche.contexte) {
        blocs.push({ titre: 'Contexte de la rétroaction :', texte: cartouche.contexte });
    }
    return blocs;
}

/**
 * LES BLOCS D'INFORMATION DANS LE PDF — même disposition que l'aperçu (#497 étape 4).
 *
 * ⚠ La répartition en colonnes vient de `repartirEnDeuxColonnes`, la MÊME
 * fonction que l'aperçu appelle. Le CSS sait faire des colonnes et jsPDF ne
 * sait pas : laisser chacun répartir à sa façon donnerait un écran et un
 * fichier qui ne coupent pas au même bloc.
 *
 * @returns {number} la position Y sous les blocs
 */
function poserBlocsInfoPDF(doc, modele, posY, largeurContenu, facteurTaille) {
    const blocs = modele.blocsInfo;
    if (blocs.length === 0) return posY;

    const INTERLIGNE = 5;   // mm — celui du reste du module
    const gauche = PDF_CONFIG.marges.gauche;

    // ⚠⚠ #514 (26 août 2026) — CE QUI DÉPASSE LE BAS DE LA FEUILLE N'EXISTE PAS.
    //
    // Cette fonction ne consultait JAMAIS la hauteur de page. Le tableau des
    // critères, lui, pagine (autoTable s'en charge) — d'où un document où la
    // partie évaluation se poursuit proprement pendant que les consignes, elles,
    // sont dessinées sous le bord du papier et disparaissent à l'impression.
    // Le cas d'usage réel est justement celui qui déborde : un « Détail de la
    // tâche » en étapes numérotées. Et l'aperçu affichait « le PDF le poursuivra
    // sur une page de plus » — une promesse tenue pour le tableau seulement.
    //
    // ▣ LE CAS ORDINAIRE RESTE INCHANGÉ, AU PIXEL PRÈS : quand tout tient sur la
    // feuille, c'est exactement le rendu d'avant qui est produit (c'est celui que
    // le golden master fige). La pagination est un chemin qui ne s'ouvre que
    // lorsque le contenu était perdu.
    const limiteBas = doc.internal.pageSize.getHeight() - PDF_CONFIG.marges.bas;
    const HAUTEUR_BANDEAU = 5.5;

    // Un bandeau : rectangle plein, titre blanc centré, en majuscules.
    const poserBandeau = (texte, x, y, largeur) => {
        doc.setFillColor(...PDF_CONFIG.couleurs.titreSection);
        doc.rect(x, y - 4, largeur, HAUTEUR_BANDEAU, 'F');
        doc.setFontSize(PDF_CONFIG.polices.textePetit * facteurTaille);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(texte.replace(/\s*:\s*$/, '').toUpperCase(), x + largeur / 2, y, { align: 'center' });
        return y + HAUTEUR_BANDEAU + 1;
    };

    const styleTexte = () => {
        doc.setFontSize(PDF_CONFIG.polices.texteNormal * facteurTaille);
        doc.setTextColor(...PDF_CONFIG.couleurs.textePrincipal);
        doc.setFont('helvetica', 'normal');
    };

    const poserTexte = (texte, x, y, largeur) => {
        styleTexte();
        const lignes = doc.splitTextToSize(texte, largeur);
        doc.text(lignes, x, y);
        return y + lignes.length * INTERLIGNE;
    };

    /** Ce qu'un bloc occupera en hauteur, bandeau et respiration compris. */
    const hauteurBloc = (bloc, largeur, avecBandeau) => {
        styleTexte();
        const lignes = doc.splitTextToSize(bloc.texte, largeur);
        return (avecBandeau ? HAUTEUR_BANDEAU + 1 : INTERLIGNE) + lignes.length * INTERLIGNE + 4;
    };

    /**
     * Pose un texte LIGNE À LIGNE, en demandant une feuille neuve dès qu'il n'y
     * a plus de place. Un bloc plus long qu'une page se poursuit donc au lieu
     * d'être tronqué — c'est le cas des consignes numérotées.
     */
    // ⚠ `obtenirX` est une FONCTION, jamais une valeur : un repli peut changer
    // de COLONNE autant que de page. Une abscisse lue une seule fois, avant la
    // pose, ferait continuer le texte dans la colonne qu'on vient de quitter.
    const poserTextePagine = (texte, obtenirX, y, largeur, replier) => {
        styleTexte();
        const lignes = doc.splitTextToSize(texte, largeur);
        let curseur = y;
        lignes.forEach(ligne => {
            if (curseur > limiteBas) {
                curseur = replier();
                styleTexte();   // ⚠ la nouvelle page ne garde pas l'état de police
            }
            doc.text(ligne, obtenirX(), curseur);
            curseur += INTERLIGNE;
        });
        return curseur;
    };

    if (modele.disposition === DISPO_DEUX_COLONNES) {
        const ECART = 8;   // mm
        const largeurCol = (largeurContenu - ECART) / 2;
        const repartition = repartirEnDeuxColonnes(blocs);

        const hauteurColonne = (colonne) =>
            colonne.reduce((total, bloc) => total + hauteurBloc(bloc, largeurCol, true), 0);
        const tientSurLaFeuille = posY
            + Math.max(hauteurColonne(repartition.gauche), hauteurColonne(repartition.droite))
            <= limiteBas;

        if (tientSurLaFeuille) {
            let basMax = posY;
            [repartition.gauche, repartition.droite].forEach((colonne, index) => {
                const x = gauche + index * (largeurCol + ECART);
                let y = posY;
                colonne.forEach(bloc => {
                    y = poserBandeau(bloc.titre, x, y, largeurCol);
                    y = poserTexte(bloc.texte, x, y, largeurCol) + 4;
                });
                basMax = Math.max(basMax, y);
            });
            return basMax + 3;
        }

        // ⚠ Débordement : la répartition équilibrée n'a plus de sens — deux
        // colonnes de hauteur comparable qui dépassent toutes les deux ne
        // s'arrangent pas en les équilibrant. Les blocs deviennent un FLUX :
        // colonne de gauche jusqu'en bas, colonne de droite, puis feuille
        // suivante. C'est la lecture d'un journal, et l'ordre est préservé.
        let colonne = 0;
        let hautColonne = posY;
        let y = posY;
        const replier = () => {
            if (colonne === 0) {
                colonne = 1;
            } else {
                doc.addPage();
                colonne = 0;
                hautColonne = PDF_CONFIG.marges.haut;
            }
            y = hautColonne;
            return y;
        };

        const x = () => gauche + colonne * (largeurCol + ECART);
        blocs.forEach(bloc => {
            // Un bandeau seul en bas de colonne annoncerait un bloc qui commence
            // ailleurs : on replie AVANT de le poser.
            if (y + HAUTEUR_BANDEAU + 1 + INTERLIGNE > limiteBas) replier();
            y = poserBandeau(bloc.titre, x(), y, largeurCol);
            y = poserTextePagine(bloc.texte, x, y, largeurCol, replier) + 4;
        });
        return y + 3;
    }

    // Continu : un bloc après l'autre, pleine largeur.
    let y = posY;
    const replierContinu = () => {
        doc.addPage();
        y = PDF_CONFIG.marges.haut;
        return y;
    };
    blocs.forEach(bloc => {
        // Même règle : un titre ne reste pas seul au bas d'une page.
        if (y + INTERLIGNE * 2 > limiteBas) replierContinu();
        doc.setFontSize(PDF_CONFIG.polices.texteNormal * facteurTaille);
        doc.setTextColor(...PDF_CONFIG.couleurs.titreSection);
        doc.setFont('helvetica', 'bold');
        doc.text(bloc.titre, gauche, y);
        y += INTERLIGNE;
        y = poserTextePagine(bloc.texte, () => gauche, y, largeurContenu, replierContinu) + 4;
    });
    return y + 1;
}

/**
 * LES BLOCS D'INFORMATION, DANS LA DISPOSITION CHOISIE (#497 étape 4).
 *
 * ⚠⚠ CE QUE CETTE FONCTION REMPLACE. Les blocs étaient posés côte à côte en
 * `flex: 1`, sans autre choix possible. Sur une consigne dont le détail fait
 * quinze lignes, ça donnait une bande d'un pouce de large qui débordait vers le
 * bas pendant que ses voisines restaient vides — la capture de Grégoire du
 * 25 août. Ce n'était pas une disposition, c'était un défaut.
 *
 * ⚠ `white-space: pre-line` n'est pas cosmétique : le détail de la tâche porte
 * des retours à la ligne (« 1. Lis et annote », « 2. Identifie… ») que le rendu
 * précédent écrasait en un seul paragraphe.
 */
function blocsInfoHTML(modele, styles) {
    const { styleTexteNormal, couleurTexte, couleurTitre, facteurTaille } = styles;

    const bandeau = (texte) =>
        `<div style="background: rgb(3, 46, 92); color: #ffffff; text-transform: uppercase;`
        + ` font-weight: bold; font-size: ${7.5 * facteurTaille}pt; letter-spacing: 0.04em;`
        + ` text-align: center; padding: 3px 6px; border-radius: 3px; margin-bottom: 5px;">`
        + `${escapeHtml(texte.replace(/\s*:\s*$/, ''))}</div>`;

    const corps = (texte) =>
        `<p style="${styleTexteNormal} margin: 0 0 10px; color: ${couleurTexte}; white-space: pre-line;">${escapeHtml(texte)}</p>`;

    if (modele.disposition === DISPO_DEUX_COLONNES) {
        const repartition = repartirEnDeuxColonnes(modele.blocsInfo);
        const colonne = (blocs) =>
            `<div style="flex: 1; min-width: 0;">${blocs.map(b => bandeau(b.titre) + corps(b.texte)).join('')}</div>`;
        return `<div style="display: flex; gap: 16px; margin-bottom: 8px; align-items: flex-start;">`
            + colonne(repartition.gauche) + colonne(repartition.droite) + `</div>`;
    }

    // Continu : un bloc après l'autre, pleine largeur.
    return `<div style="margin-bottom: 8px;">` + modele.blocsInfo.map(b =>
        `<div style="font-size: ${10 * facteurTaille}pt; font-weight: bold; color: ${couleurTitre}; margin-bottom: 3px;">${escapeHtml(b.titre)}</div>`
        + corps(b.texte)
    ).join('') + `</div>`;
}

function genererApercuCombine(grille, echelle, cartouche = null, options = {}) {

    // Facteur de taille pour les elements configurables (pas titre, pas retroactions)
    const facteurTaille = options.taillePolice === 'petit' ? 0.85 :
                          options.taillePolice === 'grand' ? 1.15 : 1;

    // Detecter si cartouche avec texte long
    let longueurMoyenne = 0;
    if (cartouche && cartouche.commentaires) {
        const textes = Object.values(cartouche.commentaires).filter(t => t && t !== '—');
        if (textes.length > 0) {
            longueurMoyenne = textes.reduce((sum, t) => sum + t.length, 0) / textes.length;
        }
    }
    const aCartoucheLongue = cartouche && longueurMoyenne > 50;

    // Taille de base pour les retroactions (auto-ajustee)
    let tailleRetroaction = 7.5;
    if (aCartoucheLongue) {
        if (longueurMoyenne > 400) tailleRetroaction = 6;
        else if (longueurMoyenne > 250) tailleRetroaction = 6.5;
        else if (longueurMoyenne > 150) tailleRetroaction = 7;
    }

    // Couleurs sobres pour impression N&B (harmonisées avec PDF_CONFIG)
    const couleurTitre = '#032e5c';       // --bleu-principal
    const couleurTexte = '#333333';       // --gris-fonce
    const couleurSecondaire = '#666666';  // --gris-moyen
    const couleurBordure = '#cccccc';     // --bordure-moyenne
    const couleurFondEntete = '#f5f5f5';  // Gris très clair

    // Styles inline pour les tailles - Alignés sur le PDF (taille petit)
    // Le PDF utilise: titrePrincipal=18, titreSection=14, texteNormal=10, textePetit=9 * 0.85
    const styleSectionTitre = `font-size: ${10 * facteurTaille}pt; font-weight: bold; color: ${couleurTitre};`;
    const styleTexteNormal = `font-size: ${8.5 * facteurTaille}pt; line-height: 1.3;`;
    const styleTextePetit = `font-size: ${7.5 * facteurTaille}pt;`;
    const styleLegende = `font-size: ${7 * facteurTaille}pt;`;
    const styleTableEntete = `font-size: ${7.5 * facteurTaille}pt;`;
    const styleTableCritere = `font-size: ${7.5 * facteurTaille}pt; font-weight: bold;`;
    // Retroactions : taille auto-ajustee, pas affectee par le facteur utilisateur
    const styleRetroaction = `font-size: ${tailleRetroaction * 0.9}pt; line-height: 1.15;`;

    // Conteneur principal (le padding est géré par .apercu-pdf-page-contenu dans CSS)
    let html = `<div class="apercu-pdf" style="min-height: 100%; display: flex; flex-direction: column;">`;

    // #497 — titre, en-tête et PROFONDEUR viennent du MODÈLE, partagé avec le PDF.
    const modele = construireModeleDocument(grille, cartouche, options);

    // ⚠ #513 — la garde vient APRÈS le modèle, et porte sur ce que le document
    // peut MONTRER. Elle exigeait grille et échelle : au cran « Consignes »,
    // elles ne servent à rien, et leur absence rendait « Données manquantes »
    // au-dessus de consignes parfaitement rédigées. Le tableau des critères, lui,
    // est déjà conditionné plus bas — le rendu savait faire, c'est la porte qui
    // ne laissait pas entrer.
    if (!modele.afficheEvaluation && modele.blocsInfo.length === 0) {
        return '<p class="text-muted">Données manquantes</p>';
    }

    const titre = modele.titre;
    // ⚠ La cartouche n'est pas une section à part : ses commentaires REMPLACENT
    // les descriptions de niveaux dans les cellules du tableau. Le cran se
    // traduit donc par la cartouche qu'on laisse passer — pas par un bloc
    // qu'on ajoute.
    cartouche = modele.afficheRetroaction ? cartouche : null;

    // Construire les infos à droite (sigle, titre cours, trimestre)
    let infosEnteteHtml = '';
    const lignes = modele.entete.map(l => l.gras
        ? `<span style="font-weight: bold;">${escapeHtml(l.texte)}</span>`
        : `<span>${escapeHtml(l.texte)}</span>`);
    if (lignes.length > 0) {
        infosEnteteHtml = `<div style="text-align: right; font-size: ${7.5 * facteurTaille}pt; color: ${couleurSecondaire}; line-height: 1.4;">${lignes.join('<br>')}</div>`;
    }

    // Titre principal (15pt comme PDF titrePrincipal * facteur)
    html += `
        <div class="apercu-pdf-entete" style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1.5px solid ${couleurTitre}; padding-bottom: 6px; margin-bottom: 10px;">
            <h3 style="font-size: ${15 * facteurTaille}pt; color: ${couleurTitre}; margin: 0; font-weight: bold;">${escapeHtml(titre)}</h3>
            ${infosEnteteHtml}
        </div>
    `;

    // Informations : Objectif, Description de la tâche, Contexte de la rétroaction
    // Jusqu'à 3 colonnes selon ce qui est présent
    // #497 — les blocs viennent du modèle ; leur DISPOSITION reste ici, parce
    // qu'elle est une décision de présentation (et bientôt un choix de
    // l'utilisateur, étape 4 du plan).
    // `partie` restreint le rendu à une FEUILLE : 'consignes' pour la page 1,
    // 'evaluation' pour les suivantes. Absent = tout, comme avant.
    const partie = options.partie || 'tout';
    if (partie !== 'evaluation' && modele.blocsInfo.length > 0) {
        html += blocsInfoHTML(modele, { styleTexteNormal, couleurTexte, couleurTitre, facteurTaille });
    }

    // Légende supprimée - le nom du niveau est dans l'entête du tableau

    // Tableau des criteres - largeurs adaptees comme le PDF
    if (partie !== 'consignes' && modele.afficheEvaluation && grille.criteres && grille.criteres.length > 0 && echelle.niveaux && echelle.niveaux.length > 0) {
        const nbNiveaux = echelle.niveaux.length;
        // Largeurs en % comme dans le PDF
        const largeurCritere = aCartoucheLongue ? '8%' : '20%';
        const largeurPond = aCartoucheLongue ? '4%' : '8%';
        const largeurNiveau = aCartoucheLongue
            ? `${(88 / nbNiveaux).toFixed(1)}%`
            : `${((100 - 28) / nbNiveaux).toFixed(1)}%`;

        html += `
            <table style="width: 100%; border-collapse: collapse; border: 1px solid ${couleurBordure}; table-layout: fixed;">
                <thead>
                    <tr>
                        <th style="${styleTableEntete} width: ${largeurCritere}; background: ${couleurTitre}; color: white; padding: 4px 5px; text-align: left; border: 1px solid ${couleurTitre};">Critère</th>
                        <th style="${styleTableEntete} width: ${largeurPond}; background: ${couleurTitre}; color: white; padding: 4px 5px; text-align: center; border: 1px solid ${couleurTitre};">%</th>
        `;

        // En-tetes des niveaux - Code + Nom (fond blanc comme le PDF, texte coloré)
        echelle.niveaux.forEach(n => {
            const enteteNiveau = n.nom ? `${n.code || '?'} - ${n.nom}` : (n.code || '?');
            // ✅ CORRECTION (28 janvier 2026) : Fond blanc + texte gris foncé comme le PDF
            html += `<th style="${styleTableEntete} width: ${largeurNiveau}; background: white; color: ${couleurTexte}; padding: 4px 5px; text-align: center; border: 1px solid ${couleurBordure}; font-weight: bold;">${escapeHtml(enteteNiveau)}</th>`;
        });
        html += `</tr></thead><tbody>`;

        // Lignes des criteres
        grille.criteres.forEach((c, idx) => {
            const bgColor = idx % 2 === 0 ? 'white' : '#fafafa';
            // Contenu de la colonne critère : nom + description optionnelle
            let contenuCritere = escapeHtml(c.nom || '—');
            if (options.inclureDescCriteres && c.description) {
                contenuCritere += `<br><span style="font-weight: normal; font-size: 0.85em; color: ${couleurSecondaire};">${escapeHtml(c.description)}</span>`;
            }
            html += `
                <tr style="background: ${bgColor};">
                    <td style="${styleTableCritere} padding: 4px 5px; border: 1px solid ${couleurBordure}; vertical-align: top;">${contenuCritere}</td>
                    <td style="${styleTableCritere} padding: 4px 5px; border: 1px solid ${couleurBordure}; text-align: center; vertical-align: top;">${c.ponderation || '—'}</td>
            `;

            // Cellules pour chaque niveau - RETROACTIONS avec taille auto
            echelle.niveaux.forEach(n => {
                let contenu = '—';
                if (cartouche && cartouche.commentaires) {
                    const cle = `${c.id}_${n.code}`;
                    contenu = cartouche.commentaires[cle] || '—';
                }
                html += `<td style="${styleRetroaction} padding: 3px 4px; border: 1px solid ${couleurBordure}; vertical-align: top; color: ${couleurTexte};">${escapeHtml(contenu)}</td>`;
            });

            html += `</tr>`;
        });

        html += `</tbody></table>`;
    }

    // Pied de page simule avec options - seulement si contenu a afficher
    // Gauche: uniquement le nom de l'enseignant (cours maintenant dans l'en-tête)
    const textePiedGauche = (options.piedEnseignant !== false && options.nomEnseignant)
        ? options.nomEnseignant : '';
    const textePiedDroit = options.piedLicence !== false ? '<img src="icons/by-nc-sa-2.svg" alt="CC BY-NC-SA 4.0" style="height: 12px; vertical-align: middle;">' : '';

    // Pied de page (toujours visible à la fin du contenu)
    if (textePiedGauche || textePiedDroit) {
        html += `
            <div class="apercu-pdf-pied" style="margin-top: 15px; padding-top: 8px; border-top: 1px solid ${couleurBordure}; display: flex; justify-content: space-between; font-size: ${7 * facteurTaille}pt; color: ${couleurSecondaire};">
                <span>${escapeHtml(textePiedGauche)}</span>
                <span>${textePiedDroit}</span>
            </div>
        `;
    }

    html += `</div>`;
    return html;
}

/**
 * Exporte le PDF combine avec toutes les options du modal
 */
async function exporterPDFCombine() {
    const productionId = document.getElementById('exportPDF-production')?.value;
    const grilleId = document.getElementById('exportPDF-grille')?.value;
    const echelleId = document.getElementById('exportPDF-echelle')?.value;
    const cartoucheId = document.getElementById('exportPDF-cartouche')?.value;
    const taillePolice = document.getElementById('exportPDF-taille-police')?.value || 'moyen';

    if (!grilleId || !echelleId) {
        alert('Veuillez sélectionner une grille et une échelle.');
        return;
    }

    try {
        // Charger les donnees
        const grilles = await db.get(cle('grillesTemplates')) || [];
        const echelles = await db.get(cle('echellesTemplates')) || [];
        const grille = grilles.find(g => g.id === grilleId);
        const echelle = echelles.find(e => e.id === echelleId);

        if (!grille || !echelle) {
            alert('Grille ou échelle introuvable.');
            return;
        }

        // Production (optionnel)
        let production = null;
        if (productionId) {
            const cleProductions = cle('productions');
            const productions = await db.get(cleProductions) || [];
            production = productions.find(p => p.id === productionId);
        }

        // Cartouche (optionnel)
        let cartouche = null;
        if (cartoucheId) {
            const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
            cartouche = cartouches.find(c => c.id === cartoucheId);
        }

        // Options d'affichage
        const options = {
            production: production,
            inclureNomProduction: document.getElementById('exportPDF-prod-nom')?.checked,
            inclureObjectif: document.getElementById('exportPDF-prod-objectif')?.checked,
            inclureDescription: document.getElementById('exportPDF-prod-description')?.checked,
            taillePolice: taillePolice
        };

        await genererPDFCombine(grille, echelle, cartouche, options);

    } catch (err) {
        console.error('[export-pdf] Erreur export PDF combine:', err);
        alert('Erreur lors de l\'export PDF. Consultez la console.');
    }
}

/**
 * Genere le PDF combine avec jsPDF
 * @param {Object} grille - Grille de criteres
 * @param {Object} echelle - Echelle de performance
 * @param {Object} cartouche - Cartouche de retroaction (optionnel)
 * @param {Object} options - Options d'affichage
 */
async function genererPDFCombine(grille, echelle, cartouche = null, options = {}) {
    // Taille fixe: petit (facteur 0.85)
    const facteurTaille = 0.85;

    // Orientation : utilise l'option ou paysage par defaut si cartouche
    const orientationPDF = options.orientation === 'paysage' ? 'landscape' : 'portrait';
    const doc = creerDocumentPDF(orientationPDF);

    // #497 — le document est décidé UNE fois ; ce rendeur ne fait que le poser.
    const modele = construireModeleDocument(grille, cartouche, options);
    const titre = modele.titre;
    // Même règle que l'aperçu : le cran se traduit par la cartouche qu'on laisse
    // passer, puisque ses commentaires remplissent les cellules du tableau.
    cartouche = modele.afficheRetroaction ? cartouche : null;

    let posY = ajouterEntetePage(doc, titre, {
        enteteCode: options.enteteCode,
        enteteNom: options.enteteNom,
        enteteTrimestre: options.enteteTrimestre,
        infosCours: options.infosCours
    });

    const largeurPage = doc.internal.pageSize.getWidth();
    const largeurContenu = largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite;

    // #497 — les mêmes blocs que l'aperçu, dans le même ordre. Ce qui reste ici
    // est leur DISPOSITION en colonnes, qui est une décision de présentation.
    // #497 étape 4 — la disposition des consignes, choisie par l'utilisateur.
    posY = poserBlocsInfoPDF(doc, modele, posY, largeurContenu, facteurTaille);

    // Légende supprimée - le nom du niveau est dans l'entête du tableau

    // Tableau des criteres
    // ⚠⚠ #497 étape 3 — « LES CONSIGNES SEULES SUR LEUR PAGE » VAUT ICI AUSSI.
    // La règle n'existait d'abord que dans l'aperçu : le PDF, lui, enchaînait
    // tout, et la grille commençait au BAS de la page 1 pour se poursuivre au
    // verso. L'écran et le fichier se contredisaient sur la seule chose que le
    // lecteur regarde — où commence ce sur quoi on l'évalue.
    if (modele.blocsInfo.length > 0 && modele.afficheEvaluation) {
        doc.addPage();
        posY = ajouterEntetePage(doc, titre, {
            enteteCode: options.enteteCode,
            enteteNom: options.enteteNom,
            enteteTrimestre: options.enteteTrimestre,
            infosCours: options.infosCours
        });
    }

    if (modele.afficheEvaluation && grille.criteres && grille.criteres.length > 0 && echelle.niveaux && echelle.niveaux.length > 0) {
        // En-tetes avec Code + Nom niveau
        const entetes = ['Critère', '%', ...echelle.niveaux.map(n => {
            return n.nom ? `${n.code || '?'} - ${n.nom}` : (n.code || '?');
        })];

        // Donnees - inclure description du critère si option cochée
        const donnees = grille.criteres.map(c => {
            let nomCritere = c.nom || '—';
            if (options.inclureDescCriteres && c.description) {
                nomCritere += '\n' + c.description;
            }
            const ligne = [nomCritere, c.ponderation ? `${c.ponderation}` : '—'];
            echelle.niveaux.forEach(n => {
                let contenu = '—';
                if (cartouche && cartouche.commentaires) {
                    const cle = `${c.id}_${n.code}`;
                    contenu = cartouche.commentaires[cle] || '—';
                }
                ligne.push(contenu);
            });
            return ligne;
        });

        // Calculer la longueur moyenne du texte pour ajuster la police
        let longueurMoyenne = 0;
        let nbTextes = 0;
        if (cartouche && cartouche.commentaires) {
            Object.values(cartouche.commentaires).forEach(txt => {
                if (txt && txt !== '—') {
                    longueurMoyenne += txt.length;
                    nbTextes++;
                }
            });
            longueurMoyenne = nbTextes > 0 ? longueurMoyenne / nbTextes : 0;
        }

        // Calcul largeurs colonnes - optimise pour cartouches avec texte long
        const nbNiveaux = echelle.niveaux.length;
        const aCartouche = cartouche && longueurMoyenne > 50;

        // Colonnes fixes reduites au minimum pour maximiser l'espace des niveaux
        const largeurCritere = aCartouche ? largeurContenu * 0.08 : largeurContenu * 0.25;
        const largeurPond = aCartouche ? largeurContenu * 0.04 : largeurContenu * 0.08;
        const largeurNiveau = (largeurContenu - largeurCritere - largeurPond) / nbNiveaux;

        const colonnesStyles = {
            0: { cellWidth: largeurCritere, fontStyle: 'bold', valign: 'middle' },
            1: { cellWidth: largeurPond, halign: 'center', valign: 'middle' }
        };
        echelle.niveaux.forEach((n, i) => {
            colonnesStyles[i + 2] = { cellWidth: largeurNiveau, valign: 'top' };
        });

        // Taille de police adaptative selon longueur du contenu
        let tailleCorpsBase;
        if (aCartouche) {
            // Ajuster selon la longueur moyenne du texte
            if (longueurMoyenne > 400) {
                tailleCorpsBase = 6;  // Tres long
            } else if (longueurMoyenne > 250) {
                tailleCorpsBase = 6.5;  // Long
            } else if (longueurMoyenne > 150) {
                tailleCorpsBase = 7;  // Moyen
            } else {
                tailleCorpsBase = 7.5;  // Court
            }
        } else {
            tailleCorpsBase = PDF_CONFIG.polices.textePetit;
        }

        const tailleEntete = PDF_CONFIG.polices.textePetit * facteurTaille;
        const tailleCorps = tailleCorpsBase * facteurTaille;

        // Padding adaptatif selon présence de cartouche
        const cellPadding = aCartouche ? 1.5 : 3;

        doc.autoTable({
            startY: posY,
            head: [entetes],
            body: donnees,
            theme: 'grid',
            tableWidth: largeurContenu,
            headStyles: {
                fillColor: PDF_CONFIG.couleurs.titreSection,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: tailleEntete,
                halign: 'center',
                cellPadding: 2
            },
            bodyStyles: {
                fontSize: tailleCorps,
                textColor: PDF_CONFIG.couleurs.textePrincipal,
                cellPadding: cellPadding,
                lineHeight: 1.15
            },
            columnStyles: colonnesStyles,
            // Permettre plusieurs pages
            rowPageBreak: 'auto',
            didParseCell: function(data) {
                // En-têtes de niveaux : fond blanc, texte gris (#593)
                if (data.section === 'head' && data.column.index >= 2) {
                    const niveau = echelle.niveaux[data.column.index - 2];
                    if (niveau?.code) {
                        const couleur = PDF_CONFIG.couleurs.textePrincipal;   // #593 : même gris pour tout code, quelle que soit l'échelle
                        data.cell.styles.fillColor = [255, 255, 255];
                        data.cell.styles.textColor = couleur;
                    }
                }
            },
            margin: { left: PDF_CONFIG.marges.gauche, right: PDF_CONFIG.marges.droite }
        });
    }

    // Options de pied de page
    const optionsPied = {
        inclureEnseignant: options.piedEnseignant !== false,
        inclureCours: options.piedCours !== false,
        inclureLicence: options.piedLicence !== false,
        enseignant: options.nomEnseignant || '',
        cours: options.nomCours || ''
    };
    finaliserDocument(doc, optionsPied);

    // Nom du fichier selon le contenu
    let nomFichier = '';
    if (options.production && options.inclureNomProduction) {
        const nomProd = (options.production.titre || options.production.activiteApprentissage || options.production.description || 'production')
            .replace(/[^a-zA-Z0-9àâäéèêëïîôùûüç\s-]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase()
            .substring(0, 30);
        nomFichier = cartouche ? `${nomProd}-grille-descriptive.pdf` : `${nomProd}-grille.pdf`;
    } else {
        // #513 — sans grille (document de consignes seules), il reste un nom à donner.
        const nomGrille = (grille && grille.nom) || 'export';
        nomFichier = cartouche
            ? `grille-descriptive-${nomGrille}.pdf`
            : `grille-${nomGrille}.pdf`;
    }
    doc.save(nomFichier);
}

/**
 * Ouvre le modal d'export PDF depuis la section Cartouches
 * Recupere la grille et l'echelle de la cartouche selectionnee
 */
async function ouvrirModalExportPDFDepuisCartouche() {
    const grilleId = document.getElementById('selectGrilleCartouche')?.value ||
                     document.getElementById('selectGrilleRetroaction')?.value;
    const echelleId = document.getElementById('selectEchelleCartouche')?.value;
    const cartoucheId = document.getElementById('selectCartouche')?.value;

    await ouvrirModalExportPDF({ grilleId, echelleId });

    // Preselectionner la cartouche apres le chargement des options
    setTimeout(async () => {
        const selectCartouche = document.getElementById('exportPDF-cartouche');
        if (selectCartouche && cartoucheId) {
            selectCartouche.value = cartoucheId;
            await mettreAJourApercuPDF();
        }
    }, 100);
}

// Exposer les fonctions du modal globalement
window.ouvrirModalExportPDF = ouvrirModalExportPDF;
window.ouvrirModalExportPDFDepuisCartouche = ouvrirModalExportPDFDepuisCartouche;
window.fermerModalExportPDF = fermerModalExportPDF;
window.mettreAJourApercuPDF = mettreAJourApercuPDF;
window.exporterPDFCombine = exporterPDFCombine;

// Exposer les fonctions globalement pour les onclick HTML
window.exporterProductionsEnPDF = exporterProductionsEnPDF;
window.exporterCartoucheSelectionneeEnPDF = exporterCartoucheSelectionneeEnPDF;
window.exporterGrilleSelectionneeEnPDF = exporterGrilleSelectionneeEnPDF;
window.exporterEchelleSelectionneeEnPDF = exporterEchelleSelectionneeEnPDF;

// Exposer les fonctions d'apercu
window.afficherApercuGrilleSelectionnee = afficherApercuGrilleSelectionnee;
window.afficherApercuEchelleSelectionnee = afficherApercuEchelleSelectionnee;
window.afficherApercuProductionsListe = afficherApercuProductionsListe;
window.afficherApercuCartoucheSelectionnee = afficherApercuCartoucheSelectionnee;
window.cacherTousLesApercusPDF = cacherTousLesApercusPDF;

// =============================================================================
// WORKFLOW 2 ETAPES : FORMULAIRE INLINE + MODAL APERCU (Beta 95.7 - #30)
// =============================================================================

/**
 * Affiche le formulaire de preparation PDF dans la zone principale
 * Cache les autres contenus (accueil, formulaire grille)
 * @param {Object} options - Options de preselection
 * @param {string} options.grilleId - ID de la grille a preselectionner
 * @param {string} options.echelleId - ID de l'echelle a preselectionner
 * @param {string} options.cartoucheId - ID de la cartouche a preselectionner
 */
async function afficherFormulairePreparationPDF(options = {}) {
    const formulaire = document.getElementById('formulairePreparationPDF');
    const accueil = document.getElementById('accueilGrilles');
    const conteneurEdition = document.getElementById('conteneurEditionGrille');

    if (!formulaire) return;

    // Cacher les autres contenus
    if (accueil) accueil.classList.add('u-hide');
    if (conteneurEdition) conteneurEdition.classList.add('u-hide');

    // Charger les options des dropdowns
    await chargerOptionsPreparationPDF();

    // Afficher le formulaire
    formulaire.classList.remove('u-hide');

    // Restaurer les derniers réglages sauvegardés
    const reglages = restaurerReglagesPDF();

    // Preselectionner la grille : priorite aux options, sinon réglages, sinon grille courante
    const grilleId = options.grilleId ||
        reglages?.grilleId ||
        (typeof grilleTemplateActuelle !== 'undefined' && grilleTemplateActuelle?.id);
    if (grilleId) {
        const selectGrille = document.getElementById('prepPDF-grille');
        if (selectGrille) selectGrille.value = grilleId;
    }

    // Preselectionner l'echelle : priorite aux options, sinon réglages, sinon globale
    const echelleId = options.echelleId ||
        reglages?.echelleId ||
        (typeof echelleTemplateActuelle !== 'undefined' && echelleTemplateActuelle?.id);
    if (echelleId) {
        const selectEchelle = document.getElementById('prepPDF-echelle');
        if (selectEchelle) selectEchelle.value = echelleId;
    }

    // Preselectionner la production depuis les réglages
    if (reglages?.productionId) {
        const selectProduction = document.getElementById('prepPDF-production');
        if (selectProduction) selectProduction.value = reglages.productionId;
    }

    // Mettre a jour les options dependantes (cartouches, etc.)
    await mettreAJourOptionsPreparationPDF();

    // Preselectionner la cartouche : priorite aux options, sinon réglages
    const cartoucheId = options.cartoucheId || reglages?.cartoucheId;
    if (cartoucheId) {
        const selectCartouche = document.getElementById('prepPDF-cartouche');
        if (selectCartouche) selectCartouche.value = cartoucheId;
    }
}

/**
 * Ferme le formulaire de preparation PDF et retourne a l'accueil
 */
function fermerFormulairePreparationPDF() {
    const formulaire = document.getElementById('formulairePreparationPDF');
    const accueil = document.getElementById('accueilGrilles');

    if (formulaire) formulaire.classList.add('u-hide');
    if (accueil) accueil.classList.remove('u-hide');
}

/**
 * Charge les options de tous les dropdowns du formulaire de preparation
 * Filtre pour n'afficher que les elements dans la sidebar (dansBibliotheque !== false)
 */
async function chargerOptionsPreparationPDF() {
    const selectProduction = document.getElementById('prepPDF-production');
    const selectGrille = document.getElementById('prepPDF-grille');
    const selectEchelle = document.getElementById('prepPDF-echelle');

    // Charger les productions (filtrées par dansBibliotheque)
    if (selectProduction) {
        const cleProductions = cle('productions');
        const toutesProductions = await db.get(cleProductions) || [];
        const productions = toutesProductions.filter(p => p.dansBibliotheque !== false);
        selectProduction.innerHTML = '<option value="">-- Aucune (grille générique) --</option>' +
            productions.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.titre || p.activiteApprentissage || p.description || 'Sans titre')}</option>`).join('');
    }

    // Charger les grilles (filtrées par dansBibliotheque)
    if (selectGrille) {
        const toutesGrilles = await db.get(cle('grillesTemplates')) || [];
        const grilles = toutesGrilles.filter(g => g.dansBibliotheque !== false);
        selectGrille.innerHTML = '<option value="">-- Sélectionner --</option>' +
            grilles.map(g => `<option value="${escapeHtml(g.id)}">${escapeHtml(g.nom || 'Sans nom')}</option>`).join('');
    }

    // Charger les echelles (filtrées par dansBibliotheque)
    if (selectEchelle) {
        const toutesEchelles = await db.get(cle('echellesTemplates')) || [];
        const echelles = toutesEchelles.filter(e => e.dansBibliotheque !== false);
        selectEchelle.innerHTML = '<option value="">-- Sélectionner --</option>' +
            echelles.map(e => `<option value="${escapeHtml(e.id)}">${escapeHtml(e.nom || 'Sans nom')}</option>`).join('');
    }
}

/**
 * Met a jour les options du formulaire quand les selections changent
 * - Affiche/masque les options de production
 * - Charge les cartouches disponibles pour la grille selectionnee
 * - Active/desactive le bouton apercu
 */
async function mettreAJourOptionsPreparationPDF() {
    const productionId = document.getElementById('prepPDF-production')?.value;
    const grilleId = document.getElementById('prepPDF-grille')?.value;
    const echelleId = document.getElementById('prepPDF-echelle')?.value;

    const optionsProduction = document.getElementById('prepPDF-options-production');
    const sectionCartouche = document.getElementById('prepPDF-section-cartouche');
    const selectCartouche = document.getElementById('prepPDF-cartouche');
    const btnApercu = document.getElementById('prepPDF-btn-apercu');

    // Afficher/masquer options production
    if (optionsProduction) {
        toggleDisplay(optionsProduction, !!productionId);
    }

    // Charger les cartouches disponibles pour la grille selectionnee
    if (grilleId && sectionCartouche && selectCartouche) {
        const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
        if (cartouches.length > 0) {
            sectionCartouche.classList.remove('u-hide');
            const currentValue = selectCartouche.value;
            selectCartouche.innerHTML = '<option value="">-- Sans rétroaction --</option>' +
                cartouches.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.nom || 'Cartouche sans nom')}</option>`).join('');
            // Restaurer la selection si possible
            if (currentValue && cartouches.find(c => c.id === currentValue)) {
                selectCartouche.value = currentValue;
            }
        } else {
            sectionCartouche.classList.add('u-hide');
            selectCartouche.innerHTML = '<option value="">-- Sans rétroaction --</option>';
        }
    } else if (sectionCartouche) {
        sectionCartouche.classList.add('u-hide');
    }

    // Activer/desactiver bouton apercu
    if (btnApercu) {
        btnApercu.disabled = !(grilleId && echelleId);
    }
}

/**
 * Ouvre le modal d'apercu avec le contenu genere
 * Affiche une simulation de page PDF selon l'orientation choisie
 */
// Variable pour stocker les donnees chargees (evite de recharger a chaque rafraichissement)
let _apercuPDFData = null;

/**
 * Ouvre le modal d'apercu avec le contenu genere
 * Affiche une simulation de page PDF selon l'orientation choisie
 */
async function ouvrirApercuPDF() {
    const productionId = document.getElementById('prepPDF-production')?.value;
    const grilleId = document.getElementById('prepPDF-grille')?.value;
    const echelleId = document.getElementById('prepPDF-echelle')?.value;
    const cartoucheId = document.getElementById('prepPDF-cartouche')?.value;

    if (!grilleId || !echelleId) {
        alert('Veuillez sélectionner une grille et une échelle.');
        return;
    }

    const modal = document.getElementById('modalApercuPDF');
    if (!modal) return;

    try {
        // Charger les donnees
        const grilles = await db.get(cle('grillesTemplates')) || [];
        const echelles = await db.get(cle('echellesTemplates')) || [];
        const grille = grilles.find(g => g.id === grilleId);
        const echelle = echelles.find(e => e.id === echelleId);

        if (!grille || !echelle) {
            alert('Grille ou échelle introuvable.');
            return;
        }

        // Production (optionnel)
        let production = null;
        if (productionId) {
            const cleProductions = cle('productions');
            const productions = await db.get(cleProductions) || [];
            production = productions.find(p => p.id === productionId);
        }

        // Cartouche (optionnel)
        let cartouche = null;
        if (cartoucheId) {
            const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
            cartouche = cartouches.find(c => c.id === cartoucheId);
        }

        // Charger les infos pour le pied de page et l'en-tête
        // 🆕 BETA 96 FIX #30: Fonctions améliorées avec fallbacks
        const nomEnseignant = obtenirNomEnseignantPDF();
        const infosCours = obtenirInfosCoursPDF();
        const nomCours = infosCours.sigleTitre;

        // Stocker les donnees pour les rafraichissements ulterieurs
        _apercuPDFData = {
            grille: grille,
            echelle: echelle,
            cartouche: cartouche,
            production: production,
            nomEnseignant: nomEnseignant,
            nomCours: nomCours,
            infosCours: infosCours
        };

        // Afficher/masquer les options de production dans le modal
        const optionsProd = document.getElementById('apercuPDF-options-production');
        if (optionsProd) {
            toggleDisplay(optionsProd, !!production);
        }

        // Restaurer les options du modal depuis les réglages sauvegardés
        const reglages = restaurerReglagesPDF();
        const selectOrientation = document.getElementById('apercuPDF-orientation');
        const checkPiedEnseignant = document.getElementById('apercuPDF-pied-enseignant');
        const checkPiedLicence = document.getElementById('apercuPDF-pied-licence');
        const checkAfficherTrimestre = document.getElementById('apercuPDF-afficher-trimestre');

        // Orientation : réglages sauvegardés, ou paysage si cartouche
        if (selectOrientation) {
            selectOrientation.value = reglages?.orientation || (cartouche ? 'paysage' : 'portrait');
        }

        // Restaurer les options de pied de page
        if (checkPiedEnseignant) checkPiedEnseignant.checked = reglages?.piedEnseignant ?? true;
        if (checkPiedLicence) checkPiedLicence.checked = reglages?.piedLicence ?? true;
        if (checkAfficherTrimestre) checkAfficherTrimestre.checked = reglages?.afficherTrimestre ?? true;

        // Sauvegarder les réglages actuels
        sauvegarderReglagesPDF();

        // Afficher le modal (.modal-overlay utilise .actif)
        modal.classList.add('actif');

        // Generer l'apercu initial
        rafraichirApercuPDF();

    } catch (err) {
        console.error('[export-pdf] Erreur ouverture apercu:', err);
        alert('Erreur lors de la génération de l\'aperçu.');
    }
}

/**
 * Rafraichit l'apercu PDF quand les options de mise en page changent
 */
/**
 * ACCORDE LE SÉLECTEUR DE CRAN AU DOCUMENT COURANT (#497 étape 3, 25 août 2026).
 *
 * ⚠⚠ UN CRAN INDISPONIBLE EST DÉSACTIVÉ ET DIT POURQUOI. Le retirer du menu
 * aurait été plus simple, et faux : Grégoire verrait un menu à deux entrées
 * sans savoir que la troisième existe, ni ce qui lui manque pour l'atteindre.
 * Le `title` porte la raison — « Aucune grille de critères n'est associée à
 * cette production », pas « indisponible ».
 *
 * ⚠ Le sélecteur est REPOSITIONNÉ quand sa valeur ne tient plus : un réglage
 * mémorisé sur « + Rétroaction » ouvert sur une production sans cartouche
 * afficherait un menu qui ment sur ce que la page montre.
 *
 * @returns {string} le cran réellement retenu
 */
/**
 * LES FEUILLES DU DOCUMENT (#497 étape 3, 25 août 2026).
 *
 * ⚠⚠ LA RÈGLE VIENT DE GRÉGOIRE, PAS DU CODE : « les consignes seules sur leur
 * page ». La page 1 ne porte QUE les consignes, même à moitié vide — c'est la
 * feuille que l'étudiant garde sous les yeux en travaillant. Grille, échelle et
 * cartouche s'enchaînent à partir de la page 2.
 *
 * Écarté le 25 août : une page par cran (une cartouche de six lignes coûterait
 * une feuille par étudiant, et ils sont trente-quatre) ; le flux continu (la
 * grille commencerait au bas de la page 1, et l'étudiant perdrait le repère
 * entre ce qu'on lui demande et ce sur quoi on l'évalue).
 *
 * ⚠ Un document SANS consignes — le chemin des boutons qui partent d'une
 * échelle ou d'une cartouche — n'a pas de page 1 vide : sa première feuille est
 * l'évaluation.
 *
 * @returns {Array<string>} les parties, une par feuille. Jamais vide.
 */
function feuillesDuDocument(modele) {
    const feuilles = [];
    if (modele.blocsInfo.length > 0) feuilles.push('consignes');
    if (modele.afficheEvaluation) feuilles.push('evaluation');
    return feuilles.length > 0 ? feuilles : ['tout'];
}

/**
 * Dit qu'une feuille déborde, plutôt que de le cacher.
 *
 * ⚠⚠ POURQUOI ON NE DÉCOUPE PAS AUTOMATIQUEMENT. Couper un tableau de critères
 * au milieu d'une ligne demanderait de le reconstruire avec ses en-têtes sur la
 * feuille suivante — c'est ce que fait jsPDF dans le PDF, et le refaire ici en
 * mesurant du DOM produirait deux paginations différentes qui se contrediraient
 * au premier cas limite. ⮕ L'aperçu DIT que le PDF ajoutera une page ; il ne
 * prétend pas montrer laquelle. Un aperçu honnête sur sa limite vaut mieux
 * qu'un aperçu fidèle en apparence.
 */
function signalerDebordement(feuille) {
    const contenu = feuille.querySelector('.apercu-pdf-page-contenu');
    if (!contenu) return;
    const deborde = contenu.scrollHeight > contenu.clientHeight + 2;

    const ancien = feuille.querySelector('.apercu-pdf-debordement');
    if (ancien) ancien.remove();
    if (!deborde) return;

    const note = document.createElement('div');
    note.className = 'apercu-pdf-debordement';
    note.textContent = 'Ce contenu dépasse la feuille : le PDF le poursuivra sur une page de plus.';
    feuille.appendChild(note);
}

function accorderSelecteurCran() {
    const select = document.getElementById('apercuPDF-cran');
    const grille = _apercuPDFData.grille;
    const cartouche = _apercuPDFData.cartouche;
    const optionsCran = { production: _apercuPDFData.production };

    const dispo = cransDisponibles(grille, cartouche, optionsCran);
    if (!select) return cranDocument({ cran: null, production: _apercuPDFData.production }, grille, cartouche);

    Array.from(select.options).forEach(option => {
        const possible = dispo.indexOf(option.value) !== -1;
        option.disabled = !possible;
        option.title = possible ? '' : raisonCranIndisponible(option.value, grille, cartouche, optionsCran);
    });

    const retenu = cranDocument({ cran: select.value, production: _apercuPDFData.production }, grille, cartouche);
    if (select.value !== retenu) select.value = retenu;
    return retenu;
}

function rafraichirApercuPDF() {
    if (!_apercuPDFData) return;

    const zoneApercu = document.getElementById('apercuPDF-contenu');
    const pagePDF = document.getElementById('apercuPDF-page');

    if (!zoneApercu || !pagePDF) return;

    // Lire les options de mise en page du modal
    const orientation = document.getElementById('apercuPDF-orientation')?.value || 'portrait';

    // Lire les options d'entête
    const enteteCode = document.getElementById('apercuPDF-entete-code')?.checked !== false;
    const enteteNom = document.getElementById('apercuPDF-entete-nom')?.checked !== false;
    const enteteTrimestre = document.getElementById('apercuPDF-entete-trimestre')?.checked !== false;

    // Lire les options de pied de page
    const piedEnseignant = document.getElementById('apercuPDF-pied-enseignant')?.checked !== false;
    const piedLicence = document.getElementById('apercuPDF-pied-licence')?.checked !== false;

    // Lire les options de production (depuis le modal)
    const inclureNomProduction = document.getElementById('apercuPDF-prod-nom')?.checked !== false;
    const inclureObjectif = document.getElementById('apercuPDF-prod-objectif')?.checked !== false;
    const inclureDescription = document.getElementById('apercuPDF-prod-description')?.checked !== false;
    const inclureDetailTache = document.getElementById('apercuPDF-prod-detailTache')?.checked !== false;
    const inclureDescCriteres = document.getElementById('apercuPDF-prod-criteres')?.checked === true;

    // #497 étape 3 — la profondeur du document, et l'état du sélecteur qui la
    // règle. Les deux sont posés AVANT le rendu : un cran devenu indisponible
    // (production changée, grille retirée) doit être désactivé au moment même
    // où le document cesse de pouvoir le porter.
    const cran = accorderSelecteurCran();

    // Options d'affichage combinees (taille fixe: petit)
    const options = {
        cran: cran,
        disposition: document.getElementById('apercuPDF-disposition')?.value || '',
        production: _apercuPDFData.production,
        inclureNomProduction: inclureNomProduction,
        inclureObjectif: inclureObjectif,
        inclureDescription: inclureDescription,
        inclureDetailTache: inclureDetailTache,
        inclureDescCriteres: inclureDescCriteres,
        taillePolice: 'petit',
        orientation: orientation,
        // Options entête
        enteteCode: enteteCode,
        enteteNom: enteteNom,
        enteteTrimestre: enteteTrimestre,
        // Options pied de page
        piedEnseignant: piedEnseignant,
        piedLicence: piedLicence,
        nomEnseignant: _apercuPDFData.nomEnseignant,
        nomCours: _apercuPDFData.nomCours,
        infosCours: _apercuPDFData.infosCours
    };

    // Appliquer les classes d'orientation sur la page simulee
    pagePDF.className = 'apercu-pdf-page';
    pagePDF.classList.add(orientation === 'paysage' ? 'apercu-pdf-paysage' : 'apercu-pdf-portrait');
    pagePDF.classList.add('apercu-taille-petit');

    // #497 étape 3 — UNE FEUILLE PAR PAGE, au lieu d'un rouleau continu.
    // Jusqu'ici l'aperçu écrivait tout dans une page unique dont la hauteur
    // s'étirait sans fin : Grégoire voyait un document au format d'aucune
    // imprimante. Les feuilles suivantes sont posées à côté de la première,
    // qui garde ses identifiants (le reste du module s'y réfère).
    const modele = construireModeleDocument(_apercuPDFData.grille, _apercuPDFData.cartouche, options);
    const parties = feuillesDuDocument(modele);

    const conteneurFeuilles = pagePDF.parentElement;
    Array.from(conteneurFeuilles.querySelectorAll('.apercu-pdf-page'))
        .filter(f => f !== pagePDF)
        .forEach(f => f.remove());

    const rendu = (partie) => genererApercuCombine(
        _apercuPDFData.grille,
        _apercuPDFData.echelle,
        _apercuPDFData.cartouche,
        Object.assign({}, options, { partie: partie })
    );

    zoneApercu.innerHTML = rendu(parties[0]);

    for (let i = 1; i < parties.length; i++) {
        const feuille = document.createElement('div');
        feuille.className = pagePDF.className;
        const contenu = document.createElement('div');
        contenu.className = 'apercu-pdf-page-contenu';
        contenu.innerHTML = rendu(parties[i]);   // security-ok: HTML construit par genererApercuCombine, dont chaque donnée passe par escapeHtml
        feuille.appendChild(contenu);
        conteneurFeuilles.appendChild(feuille);
    }

    // Chaque feuille dit si elle déborde — l'aperçu ne prétend pas paginer à la
    // place de jsPDF, il annonce que le PDF ajoutera une page.
    Array.from(conteneurFeuilles.querySelectorAll('.apercu-pdf-page')).forEach(signalerDebordement);
}

/**
 * Ferme le modal d'apercu et retourne au formulaire
 */
function fermerModalApercuPDF() {
    const modal = document.getElementById('modalApercuPDF');
    if (modal) modal.classList.remove('actif');
    // Ne pas nettoyer _apercuPDFData ici pour permettre de revenir au modal
}

/**
 * Exporte le PDF depuis le modal d'apercu
 * Utilise les selections du formulaire de preparation
 */
async function exporterPDFDepuisApercu() {
    if (!_apercuPDFData) {
        alert('Erreur: données non disponibles.');
        return;
    }

    // Lire les options de mise en page du modal
    const orientation = document.getElementById('apercuPDF-orientation')?.value || 'portrait';

    // Lire les options d'entête
    const enteteCode = document.getElementById('apercuPDF-entete-code')?.checked !== false;
    const enteteNom = document.getElementById('apercuPDF-entete-nom')?.checked !== false;
    const enteteTrimestre = document.getElementById('apercuPDF-entete-trimestre')?.checked !== false;

    // Lire les options de pied de page
    const piedEnseignant = document.getElementById('apercuPDF-pied-enseignant')?.checked !== false;
    const piedLicence = document.getElementById('apercuPDF-pied-licence')?.checked !== false;

    // Lire les options de production (depuis le modal)
    const inclureNomProduction = document.getElementById('apercuPDF-prod-nom')?.checked !== false;
    const inclureObjectif = document.getElementById('apercuPDF-prod-objectif')?.checked !== false;
    const inclureDescription = document.getElementById('apercuPDF-prod-description')?.checked !== false;
    const inclureDetailTache = document.getElementById('apercuPDF-prod-detailTache')?.checked !== false;
    const inclureDescCriteres = document.getElementById('apercuPDF-prod-criteres')?.checked === true;

    try {
        // Options d'affichage combinees (taille fixe: petit)
        const options = {
            // ⚠⚠ #497 étape 3 — LE CRAN VOYAGE JUSQU'AU PDF. Sans cette ligne,
            // l'aperçu montre les consignes seules et le fichier exporté sort
            // avec la grille et la cartouche : exactement l'écart entre écran et
            // document que l'étape 2 venait de fermer, rouvert par la porte de
            // sortie. Le cran est lu au même endroit que l'aperçu le lit.
            cran: document.getElementById('apercuPDF-cran')?.value || '',
            disposition: document.getElementById('apercuPDF-disposition')?.value || '',
            production: _apercuPDFData.production,
            inclureNomProduction: inclureNomProduction,
            inclureObjectif: inclureObjectif,
            inclureDescription: inclureDescription,
            inclureDetailTache: inclureDetailTache,
            inclureDescCriteres: inclureDescCriteres,
            taillePolice: 'petit',
            orientation: orientation,
            // Options entête
            enteteCode: enteteCode,
            enteteNom: enteteNom,
            enteteTrimestre: enteteTrimestre,
            // Options pied de page
            piedEnseignant: piedEnseignant,
            piedLicence: piedLicence,
            nomEnseignant: _apercuPDFData.nomEnseignant,
            nomCours: _apercuPDFData.nomCours,
            infosCours: _apercuPDFData.infosCours
        };

        // Generer le PDF
        await genererPDFCombine(
            _apercuPDFData.grille,
            _apercuPDFData.echelle,
            _apercuPDFData.cartouche,
            options
        );

        // Sauvegarder les options du modal (orientation, pied de page, etc.)
        const reglagesSauves = restaurerReglagesPDF() || {};
        reglagesSauves.orientation = orientation;
        reglagesSauves.piedEnseignant = piedEnseignant;
        reglagesSauves.piedLicence = piedLicence;
        reglagesSauves.afficherTrimestre = enteteTrimestre;
        db.setSync(CLE_REGLAGES_PDF, reglagesSauves);

        // Fermer le modal apres export
        fermerModalApercuPDF();

        // Fermer le formulaire et retourner a l'accueil
        fermerFormulairePreparationPDF();

        // Nettoyer les donnees
        _apercuPDFData = null;

    } catch (err) {
        console.error('[export-pdf] Erreur export PDF:', err);
        alert('Erreur lors de l\'export PDF. Consultez la console.');
    }
}

/**
 * Affiche le formulaire PDF depuis la section Echelles
 * BETA 96.1: Ouvre le modal au lieu de naviguer
 */
async function afficherFormulairePDFDepuisEchelle() {
    const echelleId = (typeof echelleTemplateActuelle !== 'undefined' && echelleTemplateActuelle?.id)
        ? echelleTemplateActuelle.id
        : null;

    await afficherFormulairePDFInline({
        echelleId: echelleId
    });
}

/**
 * Affiche le formulaire PDF depuis la section Cartouches
 * BETA 96.1: Affiche le formulaire inline dans la zone principale
 */
async function afficherFormulairePDFDepuisCartouche() {
    const grilleId = document.getElementById('selectGrilleCartouche')?.value ||
                     document.getElementById('selectGrilleRetroaction')?.value;
    const cartoucheId = document.getElementById('selectCartouche')?.value;

    await afficherFormulairePDFInline({
        grilleId: grilleId,
        cartoucheId: cartoucheId
    });
}

/**
 * BETA 96.1: Affiche le formulaire PDF depuis la section Productions
 * Affiche le formulaire inline dans la zone principale
 */
async function afficherFormulairePDFDepuisProduction() {
    // Récupérer la production sélectionnée (si disponible)
    const productionId = (typeof productionEnEdition !== 'undefined' && productionEnEdition)
        ? productionEnEdition
        : null;

    // ⚠⚠ #496 (25 août 2026) — LA FICHE SAIT DÉJÀ, ON NE LUI REDEMANDE PAS.
    // Une production porte `grilleId`, `echelleId` et `cartoucheId` : le
    // formulaire de préparation lui redemandait ces trois choix, et pouvait
    // répondre autre chose qu'elle, puisqu'il se pré-remplit avec les derniers
    // réglages mémorisés. Grégoire, 25 août : « ce bouton nous mène à une
    // fenêtre qui ressemble déjà beaucoup aux gabarits de la production comme
    // telle ; je voudrais qu'il nous mène plutôt à la visualisation. »
    if (productionId) {
        const productions = await db.get(cle('productions')) || [];
        const production = productions.find(p => p.id === productionId);
        if (production) {
            const ouvert = await ouvrirApercuPDFPour({
                productionId: production.id,
                grilleId: production.grilleId,
                echelleId: production.echelleId,
                cartoucheId: production.cartoucheId
            });
            if (ouvert) return;
            // #513 — le repli ne sert plus qu'à un cas : une production qui n'a
            // RIEN à montrer, ni évaluation ni consignes. Le formulaire de
            // préparation est alors le bon endroit — pas une erreur muette.
            // (Le commentaire précédent annonçait le retrait de ce repli « à
            // l'étape 3 » ; l'étape 3 a été livrée sans que la porte s'ouvre.)
        }
    }

    await afficherFormulairePDFInline({
        productionId: productionId
    });
}

// =============================================================================
// FORMULAIRE DE PRÉPARATION PDF INLINE (Beta 96.1)
// Formulaire injecté dans la zone principale de la section actuelle
// =============================================================================

// ⚠⚠ 20 oct. 2026 (retour de Grégoire) — LA ZONE EST CACHÉE, JAMAIS DÉTRUITE.
// Le formulaire gardait `zonePrincipale.innerHTML` en texte et le remettait à
// la fermeture : la fiche de production revenait reconstruite, ses `<select>`
// sur l'option écrite dans le HTML et non sur la valeur choisie, et sans
// l'écouteur `change` posé une seule fois au chargement (`productions.js`) —
// plus rien de la fiche ne s'enregistrait, sans que rien ne le dise.
// Désormais les enfants de la zone reçoivent `prep-pdf-recouvert` et le
// formulaire vit dans son propre conteneur, retiré à la fermeture : nœuds,
// valeurs et écouteurs restent intacts.
let _conteneurPDFInline = null;
let _enfantsRecouvertsPDF = [];

/**
 * Génère le HTML du formulaire de préparation PDF
 * Version compacte pour optimiser l'espace vertical
 */
function genererHTMLFormulairePDF() {
    return `
        <div id="formulairePDFInline" class="carte">
            <h3 class="prep-pdf-titre">📄 Préparer le PDF</h3>

            <fieldset class="prep-pdf-fieldset">
                <legend class="prep-pdf-legend">Éléments du document</legend>

                <div class="groupe-form u-mb-15">
                    <label for="inlinePDF-production" class="prep-pdf-label-sm">Production (optionnel)</label>
                    <select id="inlinePDF-production" class="controle-form" data-on-change="mettreAJourOptionsInlinePDF">
                        <option value="">-- Aucune (grille générique) --</option>
                    </select>
                </div>

                <div id="inlinePDF-grid-selects" class="prep-pdf-grille-selects">
                    <div class="groupe-form u-mb-0">
                        <label for="inlinePDF-grille" class="prep-pdf-label-sm">Grille de critères <span class="prep-pdf-requis">*</span></label>
                        <select id="inlinePDF-grille" class="controle-form" data-on-change="mettreAJourOptionsInlinePDF">
                            <option value="">-- Sélectionner --</option>
                        </select>
                    </div>

                    <div class="groupe-form u-mb-0">
                        <label for="inlinePDF-echelle" class="prep-pdf-label-sm">Échelle de performance <span class="prep-pdf-requis">*</span></label>
                        <select id="inlinePDF-echelle" class="controle-form" data-on-change="mettreAJourOptionsInlinePDF">
                            <option value="">-- Sélectionner --</option>
                        </select>
                    </div>

                    <div id="inlinePDF-section-cartouche" class="groupe-form u-mb-0 u-hide">
                        <label for="inlinePDF-cartouche" class="prep-pdf-label-sm">Cartouche (optionnel)</label>
                        <select id="inlinePDF-cartouche" class="controle-form">
                            <option value="">-- Sans rétroaction --</option>
                        </select>
                    </div>
                </div>
            </fieldset>

            <div class="prep-pdf-actions">
                <button data-action="fermerFormulairePDFInline" class="btn btn-annuler">
                    Annuler
                </button>
                <button id="inlinePDF-btn-apercu" data-action="ouvrirApercuPDFDepuisInline" class="btn btn-confirmer" disabled>
                    Voir l'aperçu →
                </button>
            </div>
        </div>
    `;
}

/**
 * Affiche le formulaire de préparation PDF dans la zone principale actuelle
 * @param {Object} options - Options de pré-sélection
 */
async function afficherFormulairePDFInline(options = {}) {
    // Nettoyer tout formulaire inline précédent (évite les IDs dupliqués dans le DOM)
    fermerFormulairePDFInline();

    // Trouver la zone principale visible de la section actuelle (classe .active)
    const zonePrincipale = document.querySelector('.sous-section.active .zone-principale');
    if (!zonePrincipale) {
        console.warn('[export-pdf] Zone principale non trouvée');
        return;
    }

    // Recouvrir le contenu actuel, sans le toucher
    _enfantsRecouvertsPDF = Array.from(zonePrincipale.children);
    _enfantsRecouvertsPDF.forEach(enfant => enfant.classList.add('prep-pdf-recouvert'));

    // Poser le formulaire dans son propre conteneur
    _conteneurPDFInline = document.createElement('div');
    _conteneurPDFInline.innerHTML = genererHTMLFormulairePDF();
    zonePrincipale.prepend(_conteneurPDFInline);

    // Charger les options des dropdowns (scopé à _conteneurPDFInline)
    await chargerOptionsInlinePDF();

    // Restaurer les derniers réglages sauvegardés
    const reglages = restaurerReglagesPDF();

    // Pré-sélectionner : priorité options > réglages sauvegardés
    const selectProd = _conteneurPDFInline.querySelector('#inlinePDF-production');
    const selectGrille = _conteneurPDFInline.querySelector('#inlinePDF-grille');
    const selectEchelle = _conteneurPDFInline.querySelector('#inlinePDF-echelle');

    if (options.productionId) {
        if (selectProd) selectProd.value = options.productionId;
    } else if (reglages?.productionId) {
        if (selectProd) selectProd.value = reglages.productionId;
    }

    if (options.grilleId) {
        if (selectGrille) selectGrille.value = options.grilleId;
    } else if (reglages?.grilleId) {
        if (selectGrille) selectGrille.value = reglages.grilleId;
    }

    if (options.echelleId) {
        if (selectEchelle) selectEchelle.value = options.echelleId;
    } else if (reglages?.echelleId) {
        if (selectEchelle) selectEchelle.value = reglages.echelleId;
    }

    // Mettre à jour les options dépendantes (cartouches, bouton aperçu)
    await mettreAJourOptionsInlinePDF();

    // Pré-sélectionner la cartouche après chargement des options dépendantes
    if (options.cartoucheId) {
        const selectCartouche = _conteneurPDFInline.querySelector('#inlinePDF-cartouche');
        if (selectCartouche) selectCartouche.value = options.cartoucheId;
    } else if (reglages?.cartoucheId) {
        const selectCartouche = _conteneurPDFInline.querySelector('#inlinePDF-cartouche');
        if (selectCartouche) selectCartouche.value = reglages.cartoucheId;
    }
}

/**
 * Ferme le formulaire et rend visible le contenu qu'il recouvrait
 */
function fermerFormulairePDFInline() {
    if (_conteneurPDFInline) {
        _conteneurPDFInline.remove();
        _conteneurPDFInline = null;
    }
    _enfantsRecouvertsPDF.forEach(enfant => enfant.classList.remove('prep-pdf-recouvert'));
    _enfantsRecouvertsPDF = [];
}

/**
 * Charge les options dans les dropdowns du formulaire inline
 */
async function chargerOptionsInlinePDF() {
    // Scopé à _conteneurPDFInline pour éviter les conflits d'IDs dupliqués
    const scope = _conteneurPDFInline || document;

    // Charger les productions
    const selectProd = scope.querySelector('#inlinePDF-production');
    if (selectProd) {
        const cleProductions = cle('productions');
        const productions = await db.get(cleProductions) || [];
        selectProd.innerHTML = '<option value="">-- Aucune (grille générique) --</option>' +
            productions.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.titre)}${(p.activiteApprentissage || p.description) ? ' - ' + escapeHtml(p.activiteApprentissage || p.description) : ''}</option>`).join('');
    }

    // Charger les grilles
    const selectGrille = scope.querySelector('#inlinePDF-grille');
    if (selectGrille) {
        const grilles = await db.get(cle('grillesTemplates')) || [];
        selectGrille.innerHTML = '<option value="">-- Sélectionner --</option>' +
            grilles.map(g => `<option value="${escapeHtml(g.id)}">${escapeHtml(g.nom)}</option>`).join('');
    }

    // Charger les échelles
    const selectEchelle = scope.querySelector('#inlinePDF-echelle');
    if (selectEchelle) {
        const echelles = await db.get(cle('echellesTemplates')) || [];
        selectEchelle.innerHTML = '<option value="">-- Sélectionner --</option>' +
            echelles.map(e => `<option value="${escapeHtml(e.id)}">${escapeHtml(e.nom)}</option>`).join('');
    }
}

/**
 * Met à jour l'affichage des options du formulaire inline selon les sélections
 */
async function mettreAJourOptionsInlinePDF() {
    // Scopé à _conteneurPDFInline pour éviter les conflits d'IDs dupliqués
    const scope = _conteneurPDFInline || document;

    const productionId = scope.querySelector('#inlinePDF-production')?.value;
    const grilleId = scope.querySelector('#inlinePDF-grille')?.value;
    const echelleId = scope.querySelector('#inlinePDF-echelle')?.value;

    // Afficher/masquer les options de production
    const optionsProd = scope.querySelector('#inlinePDF-options-production');
    if (optionsProd) {
        toggleDisplay(optionsProd, !!productionId);
    }

    // Charger les cartouches si une grille est sélectionnée
    const sectionCartouche = scope.querySelector('#inlinePDF-section-cartouche');
    const selectCartouche = scope.querySelector('#inlinePDF-cartouche');
    const gridContainer = scope.querySelector('#inlinePDF-grid-selects');

    if (grilleId && selectCartouche) {
        const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
        if (cartouches.length > 0) {
            selectCartouche.innerHTML = '<option value="">-- Sans rétroaction --</option>' +
                cartouches.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.nom || 'Cartouche sans nom')}</option>`).join('');
            if (sectionCartouche) sectionCartouche.classList.remove('u-hide');
            if (gridContainer) gridContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
        } else {
            if (sectionCartouche) sectionCartouche.classList.add('u-hide');
            if (gridContainer) gridContainer.style.gridTemplateColumns = '1fr 1fr';
        }
    } else {
        if (sectionCartouche) sectionCartouche.classList.add('u-hide');
        if (gridContainer) gridContainer.style.gridTemplateColumns = '1fr 1fr';
    }

    // Activer/désactiver le bouton aperçu
    const btnApercu = scope.querySelector('#inlinePDF-btn-apercu');
    if (btnApercu) {
        btnApercu.disabled = !(grilleId && echelleId);
    }
}

/**
 * Ouvre l'aperçu PDF depuis le formulaire inline
 */
/**
 * OUVRIR L'APERÇU À PARTIR D'IDENTIFIANTS (#496, 25 août 2026).
 *
 * ⚠⚠ POURQUOI CETTE FONCTION EXISTE. L'aperçu ne s'ouvrait QUE depuis le
 * formulaire de préparation : tout ce qu'il lui fallait, il allait le chercher
 * dans des `<select>`. Un appelant qui SAIT déjà quoi montrer — la fiche d'une
 * production, qui porte sa grille, son échelle et sa cartouche — devait donc
 * passer par un écran qui lui redemandait ce qu'il savait, et qui pouvait lui
 * répondre autre chose : le formulaire se pré-remplit avec les DERNIERS
 * RÉGLAGES MÉMORISÉS, pas avec la production ouverte.
 *
 * ⮕ Le chargement et l'ouverture ne dépendent plus d'aucun DOM de formulaire.
 * Deux appelants s'en servent : le formulaire (qui lit ses `<select>` puis
 * délègue) et la fiche de production (qui lit sa propre production).
 *
 * @param {Object} ids - { productionId, grilleId, echelleId, cartoucheId }
 * @returns {Promise<boolean>} false si la grille ou l'échelle manque
 */
async function ouvrirApercuPDFPour(ids) {
    const { productionId, grilleId, echelleId, cartoucheId } = ids || {};

    let production = null;
    if (productionId) {
        const productions = await db.get(cle('productions')) || [];
        production = productions.find(p => p.id === productionId) || null;
    }

    const grilles = grilleId ? (await db.get(cle('grillesTemplates')) || []) : [];
    const echelles = echelleId ? (await db.get(cle('echellesTemplates')) || []) : [];
    const grille = grilleId ? (grilles.find(g => g.id === grilleId) || null) : null;
    const echelle = echelleId ? (echelles.find(e => e.id === echelleId) || null) : null;

    // ⚠⚠ #513 (25 août 2026) — LE DOCUMENT DE CONSIGNES N'A BESOIN NI DE GRILLE
    // NI D'ÉCHELLE. Cette porte exigeait les deux, et le cran « Consignes »
    // existait pourtant depuis #497 : une production sans grille — le cas
    // ordinaire d'un travail qu'on prépare avant d'avoir monté son évaluation —
    // ne pouvait pas produire le document qu'on distribue aux étudiant·es. Le
    // repli renvoyait alors vers un formulaire qui, lui, réclame les deux : une
    // impasse polie.
    //
    // ⚠ Ce qui reste refusé : un document qui n'aurait RIEN à montrer — ni
    // évaluation, ni consignes. `false` fait alors ouvrir le formulaire de
    // préparation, qui est le bon endroit pour choisir ce qu'on veut voir.
    const peutEvaluer = !!(grille && echelle);
    if (!peutEvaluer && !productionAConsignes(production)) return false;

    let cartouche = null;
    if (cartoucheId) {
        const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
        cartouche = cartouches.find(c => c.id === cartoucheId) || null;
    }

    const infosCours = obtenirInfosCoursPDF();
    _apercuPDFData = {
        grille: grille,
        echelle: echelle,
        cartouche: cartouche,
        production: production,
        nomEnseignant: obtenirNomEnseignantPDF(),
        nomCours: infosCours.sigleTitre,
        infosCours: infosCours
    };

    // Les options de production n'ont de sens que s'il y a une production.
    const optionsProd = document.getElementById('apercuPDF-options-production');
    if (optionsProd) toggleDisplay(optionsProd, !!production);

    const reglages = restaurerReglagesPDF();
    const selectOrientation = document.getElementById('apercuPDF-orientation');
    const checkPiedEnseignant = document.getElementById('apercuPDF-pied-enseignant');
    const checkPiedLicence = document.getElementById('apercuPDF-pied-licence');
    const checkAfficherTrimestre = document.getElementById('apercuPDF-afficher-trimestre');

    if (selectOrientation) {
        selectOrientation.value = reglages?.orientation || (cartouche ? 'paysage' : 'portrait');
    }
    if (checkPiedEnseignant) checkPiedEnseignant.checked = reglages?.piedEnseignant ?? true;
    if (checkPiedLicence) checkPiedLicence.checked = reglages?.piedLicence ?? true;
    if (checkAfficherTrimestre) checkAfficherTrimestre.checked = reglages?.afficherTrimestre ?? true;

    // #497 étape 3 — le cran mémorisé, s'il tient encore. `accorderSelecteurCran`
    // le repositionnera au rendu si ce document ne peut pas le porter.
    //
    // ⚠⚠ #512 (25 août 2026) — SANS RÉGLAGE MÉMORISÉ, IL N'Y A PAS DE DEMANDE.
    // `cranDocument` promet, sans demande explicite, le cran le plus HAUT que le
    // document puisse porter — le comportement d'avant les crans. Cette promesse
    // était court-circuitée au PREMIER usage : faute de valeur posée, le
    // `<select>` restait sur sa première option du HTML (« Consignes »), et
    // `accorderSelecteurCran` lisait cela comme un choix de l'utilisateur. Une
    // production munie de sa grille, de son échelle et de sa cartouche ouvrait
    // donc son aperçu sur la seule page de consignes.
    //
    // Poser une valeur absente de la liste met `selectedIndex` à -1 et `value` à
    // '' : le sélecteur dit alors « je ne demande rien », et
    // `accorderSelecteurCran` l'alignera sur le cran retenu juste après.
    const selectCran = document.getElementById('apercuPDF-cran');
    if (selectCran) selectCran.value = reglages?.cran || '';
    const selectDispo = document.getElementById('apercuPDF-disposition');
    if (selectDispo && reglages?.disposition) selectDispo.value = reglages.disposition;

    const modalApercu = document.getElementById('modalApercuPDF');
    if (modalApercu) {
        modalApercu.classList.add('actif');
        rafraichirApercuPDF();
    }
    return true;
}

/**
 * Le chemin du FORMULAIRE : il lit ses `<select>`, mémorise les réglages, se
 * retire, puis délègue l'ouverture. Il reste le seul chemin possible quand on
 * part d'une échelle ou d'une cartouche — là, il n'y a pas de production d'où
 * déduire quoi que ce soit.
 */
async function ouvrirApercuPDFDepuisInline() {
    // Scopé à _conteneurPDFInline pour éviter les conflits d'IDs dupliqués
    const scope = _conteneurPDFInline || document;
    const ids = {
        productionId: scope.querySelector('#inlinePDF-production')?.value,
        grilleId: scope.querySelector('#inlinePDF-grille')?.value,
        echelleId: scope.querySelector('#inlinePDF-echelle')?.value,
        cartoucheId: scope.querySelector('#inlinePDF-cartouche')?.value
    };

    if (!ids.grilleId || !ids.echelleId) {
        alert('Veuillez sélectionner une grille et une échelle.');
        return;
    }

    // ⚠ AVANT de fermer : `sauvegarderReglagesPDF` lit le DOM du formulaire,
    // que `fermerFormulairePDFInline` retire.
    sauvegarderReglagesPDF();
    fermerFormulairePDFInline();

    await ouvrirApercuPDFPour(ids);
}

// Exposer les nouvelles fonctions globalement
window.afficherFormulairePreparationPDF = afficherFormulairePreparationPDF;
window.fermerFormulairePreparationPDF = fermerFormulairePreparationPDF;
window.chargerOptionsPreparationPDF = chargerOptionsPreparationPDF;
window.mettreAJourOptionsPreparationPDF = mettreAJourOptionsPreparationPDF;
window.ouvrirApercuPDF = ouvrirApercuPDF;
window.rafraichirApercuPDF = rafraichirApercuPDF;
window.fermerModalApercuPDF = fermerModalApercuPDF;
window.exporterPDFDepuisApercu = exporterPDFDepuisApercu;
window.afficherFormulairePDFDepuisEchelle = afficherFormulairePDFDepuisEchelle;
window.afficherFormulairePDFDepuisCartouche = afficherFormulairePDFDepuisCartouche;
window.afficherFormulairePDFDepuisProduction = afficherFormulairePDFDepuisProduction;
// Modal de préparation PDF (Beta 96.1) — exportée plus haut (#587 : une seule pose).
// Formulaire inline de préparation PDF (Beta 96.1)
window.afficherFormulairePDFInline = afficherFormulairePDFInline;
window.fermerFormulairePDFInline = fermerFormulairePDFInline;
window.chargerOptionsInlinePDF = chargerOptionsInlinePDF;
window.mettreAJourOptionsInlinePDF = mettreAJourOptionsInlinePDF;
window.ouvrirApercuPDFDepuisInline = ouvrirApercuPDFDepuisInline;
window.ouvrirApercuPDFPour = ouvrirApercuPDFPour;                           // #496 — ouvrir l'aperçu sans passer par un formulaire
window.genererApercuCombine = genererApercuCombine;                         // #497 — golden master du document de consignes
window.genererPDFCombine = genererPDFCombine;                               // #497 — l'autre rendeur du MÊME document
window.construireModeleDocument = construireModeleDocument;                 // #497 — le document décidé une fois pour les deux rendeurs
window.titreDocument = titreDocument;
window.lignesEnteteDocument = lignesEnteteDocument;
window.blocsInformationDocument = blocsInformationDocument;
window.cransDisponibles = cransDisponibles;                                 // #497 étape 3 — ce que le document peut porter
window.cranDocument = cranDocument;
window.raisonCranIndisponible = raisonCranIndisponible;
window.productionAConsignes = productionAConsignes;                         // #513 — « a-t-elle des consignes à montrer ? », en un seul endroit
window.poserBlocsInfoPDF = poserBlocsInfoPDF;                               // #514 — sentinelle de pagination : elle mesure ce qui est DESSINÉ
window.accorderSelecteurCran = accorderSelecteurCran;                       // #497 étape 3 — le menu ne peut pas mentir sur ce que la page montre
window.feuillesDuDocument = feuillesDuDocument;
window.dispositionDocument = dispositionDocument;                           // #497 étape 4 — la mise en page est un choix
window.repartirEnDeuxColonnes = repartirEnDeuxColonnes;                     // #497 étape 4 — une seule répartition pour les deux rendeurs
window.blocsInfoHTML = blocsInfoHTML;
window.blocEcheance = blocEcheance;                                         // #498 — la date de remise, toujours dans les consignes
window.datesDeRemise = datesDeRemise;                             // #497 étape 3 — les consignes seules sur leur page
window.restaurerReglagesPDF = restaurerReglagesPDF;                         // #496 — la sentinelle doit pouvoir prouver que les réglages sont posés




})();
