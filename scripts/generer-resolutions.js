#!/usr/bin/env node

// ============================================================================
// GÉNÉRATEUR resolutions.json depuis SUIVI-BUGS.md
// ============================================================================
// Source unique de vérité : Retours des testeurs/SUIVI-BUGS.md
// Ce script parse le markdown et génère resolutions.json automatiquement.
//
// Usage :
//   node scripts/generer-resolutions.js
//   ./scripts/update-version.sh resolutions
//
// Zéro dépendance npm — utilise uniquement fs et path.
// ============================================================================

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SUIVI_PATH = path.join(PROJECT_ROOT, 'Retours des testeurs', 'SUIVI-BUGS.md');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'resolutions.json');

// Mois français abrégés → numéro (1-indexé)
const MOIS_FR = {
    'jan': 1, 'janv': 1, 'janvier': 1,
    'fev': 2, 'fevr': 2, 'fevrier': 2, 'fév': 2,
    'mar': 3, 'mars': 3,
    'avr': 4, 'avril': 4,
    'mai': 5,
    'juin': 6,
    'juil': 7, 'juillet': 7,
    'aou': 8, 'aout': 8, 'août': 8,
    'sep': 9, 'sept': 9, 'septembre': 9,
    'oct': 10, 'octobre': 10,
    'nov': 11, 'novembre': 11,
    'dec': 12, 'déc': 12, 'decembre': 12, 'décembre': 12
};

// ============================================================================
// NORMALISATION
// ============================================================================

/**
 * Normalise un prénom : supprime accents, minuscules, trim.
 * "Grégoire" → "gregoire", "Bruno" → "bruno"
 */
function normaliserPrenom(prenom) {
    if (!prenom || prenom.trim() === '-' || prenom.trim() === '') return 'inconnu';
    return prenom.trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

/**
 * Parse une date française abrégée vers ISO.
 * "24 fév" → "2026-02-24", "1er fév" → "2026-02-01"
 * Accepte aussi "31 jan", "5 jan", "6 jan", etc.
 * L'année est déduite du titre de section ou année courante.
 */
function parseDateFR(dateFR, anneeSection) {
    if (!dateFR || dateFR.trim() === '-' || dateFR.trim() === '') return '';

    const texte = dateFR.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // "1er fév" → "1 fev"
    const clean = texte.replace(/1er/, '1');

    const match = clean.match(/^(\d{1,2})\s+(\w+)$/);
    if (!match) return '';

    const jour = parseInt(match[1], 10);
    const moisTexte = match[2];

    // Chercher le mois (aussi dans la version sans accents)
    let moisNum = null;
    for (const [cle, num] of Object.entries(MOIS_FR)) {
        const cleNorm = cle.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (moisTexte === cleNorm || moisTexte === cle) {
            moisNum = num;
            break;
        }
    }

    if (!moisNum) return '';

    const annee = anneeSection || new Date().getFullYear();
    return `${annee}-${String(moisNum).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
}

/**
 * Extrait l'année d'un titre de section.
 * "Corrigés (24 février 2026)" → 2026
 * "Corrigés (Beta 97.8)" → null (année courante)
 */
function extraireAnneeSection(titre) {
    const match = titre.match(/(\d{4})/);
    return match ? parseInt(match[1], 10) : null;
}

// ============================================================================
// PARSING MARKDOWN
// ============================================================================

/**
 * Parse une ligne de tableau markdown en cellules.
 * "| a | b | c |" → ["a", "b", "c"]
 */
function parserLigneTableau(ligne) {
    return ligne.split('|')
        .slice(1, -1)  // retirer vide avant premier | et après dernier |
        .map(c => c.trim());
}

/**
 * Détecte si une ligne est un séparateur de tableau markdown.
 * "|---|---|---|"
 */
function estSeparateur(ligne) {
    return /^\|[\s\-:|]+\|$/.test(ligne.trim());
}

/**
 * Parse le fichier SUIVI-BUGS.md et retourne les tickets.
 */
function parserSuiviBugs(contenu) {
    const lignes = contenu.split('\n');
    const tickets = [];

    let sectionCourante = null;   // 'ouverts' | 'corriges'
    let indexGroupeCorriges = 0;  // 0 = le plus récent
    let nbGroupesCorriges = 0;
    let anneeSection = null;
    let dansTableau = false;
    let colonnesHeader = [];

    // Premier passage : compter les groupes "Corrigés"
    for (const ligne of lignes) {
        if (/^##\s+Corrigés/i.test(ligne.trim())) {
            nbGroupesCorriges++;
        }
    }

    let groupeCorrigeIndex = 0;

    for (let i = 0; i < lignes.length; i++) {
        const ligne = lignes[i].trim();

        // Détecter les sections
        if (/^##\s+Ouverts/i.test(ligne)) {
            sectionCourante = 'ouverts';
            dansTableau = false;
            anneeSection = new Date().getFullYear();
            continue;
        }

        if (/^##\s+Corrigés/i.test(ligne)) {
            sectionCourante = 'corriges';
            groupeCorrigeIndex++;
            anneeSection = extraireAnneeSection(ligne) || new Date().getFullYear();
            dansTableau = false;
            continue;
        }

        if (/^##\s+Notes/i.test(ligne)) {
            sectionCourante = null;
            dansTableau = false;
            continue;
        }

        if (/^---$/.test(ligne)) {
            dansTableau = false;
            continue;
        }

        if (!sectionCourante) continue;

        // Détecter l'en-tête de tableau
        if (ligne.startsWith('|') && !dansTableau) {
            // Vérifier que la ligne suivante est un séparateur
            if (i + 1 < lignes.length && estSeparateur(lignes[i + 1])) {
                colonnesHeader = parserLigneTableau(ligne).map(h =>
                    h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                );
                dansTableau = true;
                i++; // sauter le séparateur
                continue;
            }
        }

        // Parser les lignes de données
        if (dansTableau && ligne.startsWith('|') && !estSeparateur(ligne)) {
            const cellules = parserLigneTableau(ligne);
            if (cellules.length < 3) continue;

            if (sectionCourante === 'ouverts') {
                parserLigneOuvert(cellules, colonnesHeader, anneeSection, tickets);
            } else if (sectionCourante === 'corriges') {
                parserLigneCorrige(cellules, colonnesHeader, anneeSection, groupeCorrigeIndex, nbGroupesCorriges, tickets);
            }
        }
    }

    return tickets;
}

/**
 * Parse une ligne de la section "Ouverts".
 * Colonnes : # | Testeur | Date | Description | Priorité | Fichier(s) concerné(s)
 */
function parserLigneOuvert(cellules, headers, anneeSection, tickets) {
    const id = parseInt(cellules[0], 10);
    if (isNaN(id)) return;

    const testeurBrut = cellules[1] || '-';
    const date = parseDateFR(cellules[2], anneeSection);
    const description = cellules[3] || '';

    const testeurs = splitTesteurs(testeurBrut);

    for (const testeur of testeurs) {
        tickets.push({
            id,
            testeur: normaliserPrenom(testeur),
            resume: nettoyerTexte(description),
            correction: '',
            build: '',
            dateCorrection: '',
            statut: 'rouge'
        });
    }
}

/**
 * Parse une ligne de la section "Corrigés".
 * Colonnes variables :
 *   Avec Build :  # | Testeur | Date rapport | Corrigé | Build | Description | Correction
 *   Sans Build :  # | Testeur | Date rapport | Corrigé | Description | Correction
 */
function parserLigneCorrige(cellules, headers, anneeSection, groupeIndex, nbGroupes, tickets) {
    const id = parseInt(cellules[0], 10);
    if (isNaN(id)) return;

    // Détecter si la colonne Build est présente via les headers
    const aBuild = headers.some(h => h === 'build' || h === '[build]');

    let testeurBrut, dateCorrige, build, description, correction;

    if (aBuild) {
        // # | Testeur | Date rapport | Corrigé | Build | Description | Correction
        testeurBrut = cellules[1] || '-';
        dateCorrige = cellules[3] || '';
        build = cellules[4] || '';
        description = cellules[5] || '';
        correction = cellules[6] || '';
    } else {
        // # | Testeur | Date rapport | Corrigé | Description | Correction
        testeurBrut = cellules[1] || '-';
        dateCorrige = cellules[3] || '';
        build = '';
        description = cellules[4] || '';
        correction = cellules[5] || '';
    }

    // Déterminer le statut
    let statut;
    if (groupeIndex === 1) {
        // Premier groupe (le plus récent)
        statut = correction.trim().startsWith('[VERT]') ? 'vert' : 'jaune';
    } else {
        // Groupes plus anciens → toujours vert
        statut = 'vert';
    }

    // Nettoyer le marqueur [VERT] de la correction
    let correctionClean = correction.trim();
    if (correctionClean.startsWith('[VERT]')) {
        correctionClean = correctionClean.substring('[VERT]'.length).trim();
    }

    const testeurs = splitTesteurs(testeurBrut);
    const dateISO = parseDateFR(dateCorrige, anneeSection);

    for (const testeur of testeurs) {
        tickets.push({
            id,
            testeur: normaliserPrenom(testeur),
            resume: nettoyerTexte(description),
            correction: nettoyerTexte(correctionClean),
            build: build.trim(),
            dateCorrection: dateISO,
            statut
        });
    }
}

/**
 * Sépare les testeurs multiples : "Bruno, Olivier" → ["Bruno", "Olivier"]
 */
function splitTesteurs(brut) {
    if (!brut || brut.trim() === '-' || brut.trim() === '') return ['-'];
    return brut.split(',').map(t => t.trim()).filter(Boolean);
}

/**
 * Nettoie le texte markdown pour le JSON (supprime backticks, etc.)
 */
function nettoyerTexte(texte) {
    return texte
        .replace(/`/g, '')
        .replace(/\*\*/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
    // Vérifier que le fichier source existe
    if (!fs.existsSync(SUIVI_PATH)) {
        console.error(`[ERREUR] Fichier introuvable : ${SUIVI_PATH}`);
        process.exit(1);
    }

    const contenu = fs.readFileSync(SUIVI_PATH, 'utf-8');
    const tickets = parserSuiviBugs(contenu);

    // Trier par ID
    tickets.sort((a, b) => a.id - b.id);

    const resultat = { tickets };
    const json = JSON.stringify(resultat, null, 2);

    fs.writeFileSync(OUTPUT_PATH, json + '\n', 'utf-8');

    // Statistiques
    const rouges = tickets.filter(t => t.statut === 'rouge').length;
    const jaunes = tickets.filter(t => t.statut === 'jaune').length;
    const verts = tickets.filter(t => t.statut === 'vert').length;

    console.log(`[OK] resolutions.json généré : ${tickets.length} tickets`);
    console.log(`     🔴 ${rouges} ouverts  🟡 ${jaunes} en attente  🟢 ${verts} confirmés`);
}

main();
