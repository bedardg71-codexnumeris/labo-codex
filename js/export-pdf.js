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
        fondEntete: [245, 245, 245],      // Gris très clair pour entêtes
        // Niveaux - tous en gris pour impression N&B
        niveauI: [51, 51, 51],            // Gris foncé uniforme
        niveauD: [51, 51, 51],            // Gris foncé uniforme
        niveauM: [51, 51, 51],            // Gris foncé uniforme
        niveauE: [51, 51, 51]             // Gris foncé uniforme
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
    const scope = _zonePrincipalePDF || document;
    const inline = !!_zonePrincipalePDF;
    const prefix = inline ? 'inlinePDF' : 'prepPDF';

    const reglages = {
        // Dropdowns du formulaire actif
        productionId: scope.querySelector(`#${prefix}-production`)?.value || '',
        grilleId: scope.querySelector(`#${prefix}-grille`)?.value || '',
        echelleId: scope.querySelector(`#${prefix}-echelle`)?.value || '',
        cartoucheId: scope.querySelector(`#${prefix}-cartouche`)?.value || '',
        // Options du modal (toujours dans document)
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

        // 4. FALLBACK: Toujours essayer profilEnseignant si rien trouvé
        const profil = db.getSync('profilEnseignant', {});
        if (profil.prenom && profil.nom) {
            return `${profil.prenom} ${profil.nom}`;
        }

        return '';
    } catch (err) {
        console.warn('[export-pdf] Erreur obtention nom enseignant:', err);
        // Dernier recours: essayer profilEnseignant
        try {
            const profil = db.getSync('profilEnseignant', {});
            if (profil.prenom && profil.nom) {
                return `${profil.prenom} ${profil.nom}`;
            }
        } catch (e) { /* ignore */ }
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
        let cours = db.getSync('listeCours', []);
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

    // Options d'entête individuelles (rétrocompatibilité avec afficherTrimestre)
    const afficherCode = options.enteteCode !== false;
    const afficherNomCours = options.enteteNom !== false;
    const afficherTrimestre = options.enteteTrimestre !== false;

    // Titre principal (gauche)
    doc.setFontSize(PDF_CONFIG.polices.titrePrincipal);
    doc.setTextColor(...PDF_CONFIG.couleurs.titreSection);
    doc.setFont('helvetica', 'bold');
    doc.text(titre, PDF_CONFIG.marges.gauche, PDF_CONFIG.marges.haut + 5);

    // Infos à droite : Code cours, Nom cours, Trimestre (selon options)
    const infosCours = options.infosCours || obtenirInfosCoursPDF();
    const trimestre = obtenirNomTrimestre();

    doc.setFontSize(PDF_CONFIG.polices.textePetit);
    doc.setTextColor(...PDF_CONFIG.couleurs.texteSecondaire);
    doc.setFont('helvetica', 'normal');

    let posYDroite = PDF_CONFIG.marges.haut + 2;
    const xDroite = largeurPage - PDF_CONFIG.marges.droite;

    // Sigle du cours (en gras)
    if (afficherCode && infosCours.sigle) {
        doc.setFont('helvetica', 'bold');
        doc.text(infosCours.sigle, xDroite, posYDroite, { align: 'right' });
        posYDroite += 3.5;
        doc.setFont('helvetica', 'normal');
    }

    // Nom du cours
    if (afficherNomCours && infosCours.titre) {
        doc.text(infosCours.titre, xDroite, posYDroite, { align: 'right' });
        posYDroite += 3.5;
    }

    // Trimestre
    if (afficherTrimestre && trimestre) {
        doc.text(trimestre, xDroite, posYDroite, { align: 'right' });
    }

    // Ligne de separation
    doc.setDrawColor(...PDF_CONFIG.couleurs.bordure);
    doc.setLineWidth(0.5);
    doc.line(PDF_CONFIG.marges.gauche, PDF_CONFIG.marges.haut + 10, largeurPage - PDF_CONFIG.marges.droite, PDF_CONFIG.marges.haut + 10);

    return PDF_CONFIG.marges.haut + 18; // Position Y apres l'en-tete
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

    // Droite : Licence CC
    if (optionsPied.inclureLicence) {
        doc.text(
            'CC BY-NC-SA 4.0',
            largeurPage - PDF_CONFIG.marges.droite,
            posY,
            { align: 'right' }
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

/**
 * Obtient la couleur pour un niveau de performance
 */
function getCouleurNiveau(code) {
    const couleurs = {
        'I': PDF_CONFIG.couleurs.niveauI,
        'D': PDF_CONFIG.couleurs.niveauD,
        'M': PDF_CONFIG.couleurs.niveauM,
        'E': PDF_CONFIG.couleurs.niveauE
    };
    return couleurs[code] || PDF_CONFIG.couleurs.textePrincipal;
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
        const dateFormatee = p.dateEcheance ? new Date(p.dateEcheance).toLocaleDateString('fr-CA') : '—';
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
    const donnees = productions.map(p => [
        p.titre || '—',
        p.type || '—',
        p.ponderation ? `${p.ponderation}%` : '—',
        formaterDate(p.dateEcheance)
    ]);

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
    const grilles = await db.get('grillesTemplates') || [];
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
                // Colorer le code selon le niveau
                if (data.section === 'body' && data.column.index === 0) {
                    const code = data.cell.raw;
                    const couleur = getCouleurNiveau(code);
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
    const echelles = await db.get('echellesTemplates') || [];
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
                        const couleur = getCouleurNiveau(code);
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
                // Colorer les en-tetes de niveaux selon IDME
                if (data.section === 'head' && data.column.index > 0) {
                    const niveau = niveaux[data.column.index - 1];
                    if (niveau?.code) {
                        const couleur = getCouleurNiveau(niveau.code);
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
    const grilles = await db.get('grillesTemplates') || [];
    const echelles = await db.get('echellesTemplates') || [];

    // Section Productions
    if (productions.length > 0) {
        doc.addPage();
        let posY = ajouterEntetePage(doc, '1. Productions');

        const largeurContenu = largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite;
        const donnees = productions.map(p => [
            p.titre || '—',
            p.type || '—',
            p.ponderation ? `${p.ponderation}%` : '—',
            formaterDate(p.dateEcheance)
        ]);

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
                        const couleur = getCouleurNiveau(code);
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

            let cartouches = await db.get(`cartouches_${grilleId}`) || [];
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
            let cartouches = await db.get(`cartouches_${grilleId}`) || [];
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
        selectProduction.innerHTML = '<option value="">-- Aucune (grille générique) --</option>';
        productions.forEach(p => {
            selectProduction.innerHTML += `<option value="${p.id}">${escapeHtml(p.titre || p.description || 'Sans titre')}</option>`;
        });
    }

    // Charger les grilles
    if (selectGrille) {
        const grilles = await db.get('grillesTemplates') || [];
        selectGrille.innerHTML = '<option value="">-- Sélectionner --</option>';
        grilles.forEach(g => {
            selectGrille.innerHTML += `<option value="${g.id}">${escapeHtml(g.nom || 'Sans nom')}</option>`;
        });
    }

    // Charger les echelles
    if (selectEchelle) {
        const echelles = await db.get('echellesTemplates') || [];
        selectEchelle.innerHTML = '<option value="">-- Sélectionner --</option>';
        echelles.forEach(e => {
            selectEchelle.innerHTML += `<option value="${e.id}">${escapeHtml(e.nom || 'Sans nom')}</option>`;
        });
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
        const cartouches = await db.get(`cartouches_${grilleId}`) || [];
        if (cartouches.length > 0) {
            sectionCartouche.classList.remove('u-hide');
            const currentValue = selectCartouche.value;
            selectCartouche.innerHTML = '<option value="">-- Sans rétroaction --</option>';
            cartouches.forEach(c => {
                selectCartouche.innerHTML += `<option value="${c.id}">${escapeHtml(c.nom || 'Cartouche sans nom')}</option>`;
            });
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
        const grilles = await db.get('grillesTemplates') || [];
        const echelles = await db.get('echellesTemplates') || [];
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
            const cartouches = await db.get(`cartouches_${grilleId}`) || [];
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
function genererApercuCombine(grille, echelle, cartouche = null, options = {}) {
    if (!grille || !echelle) return '<p class="text-muted">Données manquantes</p>';

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

    // Titre (production avec activité, ou grille) - TAILLE FIXE, non affectee
    let titre = grille.nom || 'Grille de critères';
    if (options.production && options.inclureNomProduction) {
        const nomProd = options.production.titre || 'Production';
        const activite = options.production.description || '';
        titre = activite ? `${nomProd} - ${activite}` : nomProd;
    }

    // Infos du cours pour l'en-tête (utilise les nouvelles options individuelles)
    const afficherCode = options.enteteCode !== false;
    const afficherNomCours = options.enteteNom !== false;
    const afficherTrimestre = options.enteteTrimestre !== false;

    const infosCours = options.infosCours || obtenirInfosCoursPDF();
    const trimestre = obtenirNomTrimestre();

    // Construire les infos à droite (sigle, titre cours, trimestre)
    let infosEnteteHtml = '';
    const lignes = [];
    if (afficherCode && infosCours.sigle) {
        lignes.push(`<span style="font-weight: bold;">${escapeHtml(infosCours.sigle)}</span>`);
    }
    if (afficherNomCours && infosCours.titre) {
        lignes.push(`<span>${escapeHtml(infosCours.titre)}</span>`);
    }
    if (afficherTrimestre && trimestre) {
        lignes.push(`<span>${escapeHtml(trimestre)}</span>`);
    }
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
    if (options.production || (cartouche && cartouche.contexte)) {
        const aObjectif = options.production && options.inclureObjectif && options.production.objectif;
        const aDescription = options.production && options.inclureDescription && options.production.tache;
        const aContexte = cartouche && cartouche.contexte;

        const colonnes = [];
        if (aObjectif) {
            colonnes.push(`
                <div style="flex: 1;">
                    <div style="${styleSectionTitre} margin-bottom: 3px;">Objectif d'apprentissage :</div>
                    <p style="${styleTexteNormal} margin: 0; color: ${couleurTexte};">${escapeHtml(options.production.objectif)}</p>
                </div>
            `);
        }
        if (aDescription) {
            colonnes.push(`
                <div style="flex: 1;">
                    <div style="${styleSectionTitre} margin-bottom: 3px;">Description de la tâche :</div>
                    <p style="${styleTexteNormal} margin: 0; color: ${couleurTexte};">${escapeHtml(options.production.tache)}</p>
                </div>
            `);
        }
        if (aContexte) {
            colonnes.push(`
                <div style="flex: 1;">
                    <div style="${styleSectionTitre} margin-bottom: 3px;">Contexte de la rétroaction :</div>
                    <p style="${styleTexteNormal} margin: 0; color: ${couleurTexte};">${escapeHtml(cartouche.contexte)}</p>
                </div>
            `);
        }

        if (colonnes.length > 0) {
            html += `<div style="display: flex; gap: 12px; margin-bottom: 8px;">${colonnes.join('')}</div>`;
        }
    }

    // Légende supprimée - le nom du niveau est dans l'entête du tableau

    // Tableau des criteres - largeurs adaptees comme le PDF
    if (grille.criteres && grille.criteres.length > 0 && echelle.niveaux && echelle.niveaux.length > 0) {
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
    const textePiedDroit = options.piedLicence !== false ? 'CC BY-NC-SA 4.0' : '';

    // Pied de page (toujours visible à la fin du contenu)
    if (textePiedGauche || textePiedDroit) {
        html += `
            <div class="apercu-pdf-pied" style="margin-top: 15px; padding-top: 8px; border-top: 1px solid ${couleurBordure}; display: flex; justify-content: space-between; font-size: ${7 * facteurTaille}pt; color: ${couleurSecondaire};">
                <span>${escapeHtml(textePiedGauche)}</span>
                <span>${escapeHtml(textePiedDroit)}</span>
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
        const grilles = await db.get('grillesTemplates') || [];
        const echelles = await db.get('echellesTemplates') || [];
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
            const cartouches = await db.get(`cartouches_${grilleId}`) || [];
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

    // Titre : production (avec activité) ou grille
    let titre = grille.nom || 'Grille de critères';
    if (options.production && options.inclureNomProduction) {
        const nomProd = options.production.titre || 'Production';
        const activite = options.production.description || '';
        titre = activite ? `${nomProd} - ${activite}` : nomProd;
    }

    let posY = ajouterEntetePage(doc, titre, {
        enteteCode: options.enteteCode,
        enteteNom: options.enteteNom,
        enteteTrimestre: options.enteteTrimestre,
        infosCours: options.infosCours
    });

    const largeurPage = doc.internal.pageSize.getWidth();
    const largeurContenu = largeurPage - PDF_CONFIG.marges.gauche - PDF_CONFIG.marges.droite;

    // Informations : Objectif, Description, Contexte (jusqu'à 3 colonnes)
    const colonnesInfo = [];
    if (options.production && options.inclureObjectif && options.production.objectif) {
        colonnesInfo.push({ titre: 'Objectif d\'apprentissage :', texte: options.production.objectif });
    }
    if (options.production && options.inclureDescription && options.production.tache) {
        colonnesInfo.push({ titre: 'Description de la tâche :', texte: options.production.tache });
    }
    if (cartouche && cartouche.contexte) {
        colonnesInfo.push({ titre: 'Contexte de la rétroaction :', texte: cartouche.contexte });
    }

    if (colonnesInfo.length > 0) {
        doc.setFont('helvetica', 'normal');
        const espaceEntreCol = 8; // mm
        const nbCols = colonnesInfo.length;
        const largeurColonne = (largeurContenu - (espaceEntreCol * (nbCols - 1))) / nbCols;
        const posYDepart = posY;
        let maxPosY = posY;

        colonnesInfo.forEach((col, index) => {
            const colX = PDF_CONFIG.marges.gauche + index * (largeurColonne + espaceEntreCol);
            let colPosY = posYDepart;

            // Titre
            doc.setFontSize(PDF_CONFIG.polices.texteNormal * facteurTaille);
            doc.setTextColor(...PDF_CONFIG.couleurs.titreSection);
            doc.setFont('helvetica', 'bold');
            doc.text(col.titre, colX, colPosY);
            colPosY += 5;

            // Texte
            doc.setTextColor(...PDF_CONFIG.couleurs.textePrincipal);
            doc.setFont('helvetica', 'normal');
            const lignes = doc.splitTextToSize(col.texte, largeurColonne);
            doc.text(lignes, colX, colPosY);
            colPosY += lignes.length * 5;

            maxPosY = Math.max(maxPosY, colPosY);
        });

        posY = maxPosY + 5;
    }

    // Légende supprimée - le nom du niveau est dans l'entête du tableau

    // Tableau des criteres
    if (grille.criteres && grille.criteres.length > 0 && echelle.niveaux && echelle.niveaux.length > 0) {
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
                // Colorer les en-tetes de niveaux
                if (data.section === 'head' && data.column.index >= 2) {
                    const niveau = echelle.niveaux[data.column.index - 2];
                    if (niveau?.code) {
                        const couleur = getCouleurNiveau(niveau.code);
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
        const nomProd = (options.production.titre || options.production.description || 'production')
            .replace(/[^a-zA-Z0-9àâäéèêëïîôùûüç\s-]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase()
            .substring(0, 30);
        nomFichier = cartouche ? `${nomProd}-grille-descriptive.pdf` : `${nomProd}-grille.pdf`;
    } else {
        nomFichier = cartouche
            ? `grille-descriptive-${grille.nom || 'export'}.pdf`
            : `grille-${grille.nom || 'export'}.pdf`;
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
        selectProduction.innerHTML = '<option value="">-- Aucune (grille générique) --</option>';
        productions.forEach(p => {
            selectProduction.innerHTML += `<option value="${p.id}">${escapeHtml(p.titre || p.description || 'Sans titre')}</option>`;
        });
    }

    // Charger les grilles (filtrées par dansBibliotheque)
    if (selectGrille) {
        const toutesGrilles = await db.get('grillesTemplates') || [];
        const grilles = toutesGrilles.filter(g => g.dansBibliotheque !== false);
        selectGrille.innerHTML = '<option value="">-- Sélectionner --</option>';
        grilles.forEach(g => {
            selectGrille.innerHTML += `<option value="${g.id}">${escapeHtml(g.nom || 'Sans nom')}</option>`;
        });
    }

    // Charger les echelles (filtrées par dansBibliotheque)
    if (selectEchelle) {
        const toutesEchelles = await db.get('echellesTemplates') || [];
        const echelles = toutesEchelles.filter(e => e.dansBibliotheque !== false);
        selectEchelle.innerHTML = '<option value="">-- Sélectionner --</option>';
        echelles.forEach(e => {
            selectEchelle.innerHTML += `<option value="${e.id}">${escapeHtml(e.nom || 'Sans nom')}</option>`;
        });
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
        const cartouches = await db.get(`cartouches_${grilleId}`) || [];
        if (cartouches.length > 0) {
            sectionCartouche.classList.remove('u-hide');
            const currentValue = selectCartouche.value;
            selectCartouche.innerHTML = '<option value="">-- Sans rétroaction --</option>';
            cartouches.forEach(c => {
                selectCartouche.innerHTML += `<option value="${c.id}">${escapeHtml(c.nom || 'Cartouche sans nom')}</option>`;
            });
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
        const grilles = await db.get('grillesTemplates') || [];
        const echelles = await db.get('echellesTemplates') || [];
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
            const cartouches = await db.get(`cartouches_${grilleId}`) || [];
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
    const inclureDescCriteres = document.getElementById('apercuPDF-prod-criteres')?.checked === true;

    // Options d'affichage combinees (taille fixe: petit)
    const options = {
        production: _apercuPDFData.production,
        inclureNomProduction: inclureNomProduction,
        inclureObjectif: inclureObjectif,
        inclureDescription: inclureDescription,
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

    // Generer l'apercu
    zoneApercu.innerHTML = genererApercuCombine(
        _apercuPDFData.grille,
        _apercuPDFData.echelle,
        _apercuPDFData.cartouche,
        options
    );
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
    const inclureDescCriteres = document.getElementById('apercuPDF-prod-criteres')?.checked === true;

    try {
        // Options d'affichage combinees (taille fixe: petit)
        const options = {
            production: _apercuPDFData.production,
            inclureNomProduction: inclureNomProduction,
            inclureObjectif: inclureObjectif,
            inclureDescription: inclureDescription,
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

    await afficherFormulairePDFInline({
        productionId: productionId
    });
}

// =============================================================================
// FORMULAIRE DE PRÉPARATION PDF INLINE (Beta 96.1)
// Formulaire injecté dans la zone principale de la section actuelle
// =============================================================================

// Stockage du contenu précédent pour restauration
let _contenuPrecedentPDF = null;
let _zonePrincipalePDF = null;

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
                    <select id="inlinePDF-production" class="controle-form" onchange="mettreAJourOptionsInlinePDF()">
                        <option value="">-- Aucune (grille générique) --</option>
                    </select>
                </div>

                <div id="inlinePDF-grid-selects" class="prep-pdf-grille-selects">
                    <div class="groupe-form u-mb-0">
                        <label for="inlinePDF-grille" class="prep-pdf-label-sm">Grille de critères <span class="prep-pdf-requis">*</span></label>
                        <select id="inlinePDF-grille" class="controle-form" onchange="mettreAJourOptionsInlinePDF()">
                            <option value="">-- Sélectionner --</option>
                        </select>
                    </div>

                    <div class="groupe-form u-mb-0">
                        <label for="inlinePDF-echelle" class="prep-pdf-label-sm">Échelle de performance <span class="prep-pdf-requis">*</span></label>
                        <select id="inlinePDF-echelle" class="controle-form" onchange="mettreAJourOptionsInlinePDF()">
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
                <button onclick="fermerFormulairePDFInline()" class="btn btn-annuler">
                    Annuler
                </button>
                <button id="inlinePDF-btn-apercu" onclick="ouvrirApercuPDFDepuisInline()" class="btn btn-confirmer" disabled>
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

    // Sauvegarder le contenu actuel
    _contenuPrecedentPDF = zonePrincipale.innerHTML;
    _zonePrincipalePDF = zonePrincipale;

    // Injecter le formulaire
    zonePrincipale.innerHTML = genererHTMLFormulairePDF();

    // Charger les options des dropdowns (scopé à _zonePrincipalePDF)
    await chargerOptionsInlinePDF();

    // Restaurer les derniers réglages sauvegardés
    const reglages = restaurerReglagesPDF();

    // Pré-sélectionner : priorité options > réglages sauvegardés
    const selectProd = _zonePrincipalePDF.querySelector('#inlinePDF-production');
    const selectGrille = _zonePrincipalePDF.querySelector('#inlinePDF-grille');
    const selectEchelle = _zonePrincipalePDF.querySelector('#inlinePDF-echelle');

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
        const selectCartouche = _zonePrincipalePDF.querySelector('#inlinePDF-cartouche');
        if (selectCartouche) selectCartouche.value = options.cartoucheId;
    } else if (reglages?.cartoucheId) {
        const selectCartouche = _zonePrincipalePDF.querySelector('#inlinePDF-cartouche');
        if (selectCartouche) selectCartouche.value = reglages.cartoucheId;
    }
}

/**
 * Ferme le formulaire et restaure le contenu précédent
 */
function fermerFormulairePDFInline() {
    if (_zonePrincipalePDF && _contenuPrecedentPDF !== null) {
        _zonePrincipalePDF.innerHTML = _contenuPrecedentPDF;
        _contenuPrecedentPDF = null;
        _zonePrincipalePDF = null;
    }
}

/**
 * Charge les options dans les dropdowns du formulaire inline
 */
async function chargerOptionsInlinePDF() {
    // Scopé à _zonePrincipalePDF pour éviter les conflits d'IDs dupliqués
    const scope = _zonePrincipalePDF || document;

    // Charger les productions
    const selectProd = scope.querySelector('#inlinePDF-production');
    if (selectProd) {
        const cleProductions = cle('productions');
        const productions = await db.get(cleProductions) || [];
        selectProd.innerHTML = '<option value="">-- Aucune (grille générique) --</option>' +
            productions.map(p => `<option value="${p.id}">${p.titre}${p.description ? ' - ' + p.description : ''}</option>`).join('');
    }

    // Charger les grilles
    const selectGrille = scope.querySelector('#inlinePDF-grille');
    if (selectGrille) {
        const grilles = await db.get('grillesTemplates') || [];
        selectGrille.innerHTML = '<option value="">-- Sélectionner --</option>' +
            grilles.map(g => `<option value="${g.id}">${g.nom}</option>`).join('');
    }

    // Charger les échelles
    const selectEchelle = scope.querySelector('#inlinePDF-echelle');
    if (selectEchelle) {
        const echelles = await db.get('echellesTemplates') || [];
        selectEchelle.innerHTML = '<option value="">-- Sélectionner --</option>' +
            echelles.map(e => `<option value="${e.id}">${e.nom}</option>`).join('');
    }
}

/**
 * Met à jour l'affichage des options du formulaire inline selon les sélections
 */
async function mettreAJourOptionsInlinePDF() {
    // Scopé à _zonePrincipalePDF pour éviter les conflits d'IDs dupliqués
    const scope = _zonePrincipalePDF || document;

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
        const cartouches = await db.get(`cartouches_${grilleId}`) || [];
        if (cartouches.length > 0) {
            selectCartouche.innerHTML = '<option value="">-- Sans rétroaction --</option>' +
                cartouches.map(c => `<option value="${c.id}">${c.nom || 'Cartouche sans nom'}</option>`).join('');
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
async function ouvrirApercuPDFDepuisInline() {
    // Scopé à _zonePrincipalePDF pour éviter les conflits d'IDs dupliqués
    const scope = _zonePrincipalePDF || document;
    const productionId = scope.querySelector('#inlinePDF-production')?.value;
    const grilleId = scope.querySelector('#inlinePDF-grille')?.value;
    const echelleId = scope.querySelector('#inlinePDF-echelle')?.value;
    const cartoucheId = scope.querySelector('#inlinePDF-cartouche')?.value;

    if (!grilleId || !echelleId) {
        alert('Veuillez sélectionner une grille et une échelle.');
        return;
    }

    // Récupérer les données
    const grilles = await db.get('grillesTemplates') || [];
    const echelles = await db.get('echellesTemplates') || [];
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
        const cartouches = await db.get(`cartouches_${grilleId}`) || [];
        cartouche = cartouches.find(c => c.id === cartoucheId);
    }

    // Charger les infos pour le pied de page
    const nomEnseignant = obtenirNomEnseignantPDF();
    const infosCours = obtenirInfosCoursPDF();
    const nomCours = infosCours.sigleTitre;

    // Stocker les données pour l'aperçu
    _apercuPDFData = {
        grille: grille,
        echelle: echelle,
        cartouche: cartouche,
        production: production,
        nomEnseignant: nomEnseignant,
        nomCours: nomCours,
        infosCours: infosCours
    };

    // Sauvegarder les réglages AVANT de fermer le formulaire (_zonePrincipalePDF encore valide)
    sauvegarderReglagesPDF();

    // Fermer le formulaire inline (restaure le contenu précédent)
    fermerFormulairePDFInline();

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

    if (selectOrientation) {
        selectOrientation.value = reglages?.orientation || (cartouche ? 'paysage' : 'portrait');
    }
    if (checkPiedEnseignant) checkPiedEnseignant.checked = reglages?.piedEnseignant ?? true;
    if (checkPiedLicence) checkPiedLicence.checked = reglages?.piedLicence ?? true;
    if (checkAfficherTrimestre) checkAfficherTrimestre.checked = reglages?.afficherTrimestre ?? true;

    // Ouvrir le modal d'aperçu (.modal-overlay utilise .actif)
    const modalApercu = document.getElementById('modalApercuPDF');
    if (modalApercu) {
        modalApercu.classList.add('actif');
        rafraichirApercuPDF();
    }
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
// Modal de préparation PDF (Beta 96.1)
window.ouvrirModalExportPDF = ouvrirModalExportPDF;
window.fermerModalExportPDF = fermerModalExportPDF;
// Formulaire inline de préparation PDF (Beta 96.1)
window.afficherFormulairePDFInline = afficherFormulairePDFInline;
window.fermerFormulairePDFInline = fermerFormulairePDFInline;
window.chargerOptionsInlinePDF = chargerOptionsInlinePDF;
window.mettreAJourOptionsInlinePDF = mettreAJourOptionsInlinePDF;
window.ouvrirApercuPDFDepuisInline = ouvrirApercuPDFDepuisInline;

console.log('[export-pdf.js] Module charge - jsPDF disponible:', typeof window.jspdf !== 'undefined');


})();
