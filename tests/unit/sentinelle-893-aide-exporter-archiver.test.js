import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE #893 (20 septembre 2026) — L'AIDE DE « EXPORTER ET ARCHIVER » DIT LA
// VÉRITÉ SUR L'ÉCRAN.
//
// L'aide annonçait « 4 modes d'export », deux cases « Inclure annotés » /
// « Inclure évaluations » qui n'existent pas, et l'allègement retiré le 28 août.
// L'écran, lui, rend TROIS cartes et UNE case (« Reprises seulement », Export Léa).
//
// Le verrou est STRUCTUREL : les titres et les cases se lisent dans le code qui
// les REND (`afficherArchivage`), et l'aide comme la fiche d'accompagnement
// doivent les nommer tous, sans en inventer. Ajouter une carte ou une case à
// l'écran sans la nommer dans l'aide rougit ; réintroduire un mode dans l'aide
// sans carte à l'écran rougit aussi.
//
// Hors périmètre, délibérément : `proposerNettoyage` et ses dialogues (#892).
//
// #895 (23 sept. 2026) : « Trimestre complet » est fondu dans « Exporter des
// travaux », qui gagne la case « Compresser le ZIP ». Deux cartes, deux cases.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');
const ui = lire('js', 'travaux-ui.js');
const index = lire('index.html');
const fiches = lire('js', 'accompagnement-contenu-popup.js');
const config = lire('js', 'config.js');

// Ce que l'écran REND : la zone des cartes, du conteneur au bloc d'espace.
const zoneCartes = tranche(ui, '<div class="travaux-archivage-options">', '<!-- Quota stockage -->', { longueurMin: 2000 });
const titresRendus = [...zoneCartes.matchAll(/<div class="travaux-archivage-carte">\s*<h4>([^<]+)<\/h4>/g)].map(m => m[1]);
const casesRendues = [...zoneCartes.matchAll(/<input type="checkbox"[^>]*>\s*([^<]+?)\s*<\/label>/g)].map(m => m[1]);

// Ce que l'aide DIT : l'accordéon, jusqu'à la carte d'aide suivante.
const aide = tranche(index, 'id="accordeon-aide-exporter-archiver"', '<!-- Carte:', { longueurMin: 800 });
const modesAide = [...aide.matchAll(/<li><strong>([^<]+)<\/strong>/g)].map(m => m[1]);

// Ce que la fiche contextuelle DIT (bouton « i » du titre de l'écran).
const fiche = tranche(fiches, "'archiver-travaux': {", "voirAussi:", { longueurMin: 600 });
const modesFiche = [...fiche.matchAll(/'<strong>([^<]+)<\/strong> :/g)].map(m => m[1]);

describe('#893 · la mesure elle-même mesure quelque chose', () => {
    it('l\'écran rend deux cartes et deux cases, lues dans le code qui les rend', () => {
        expect(titresRendus).toEqual(['Exporter des travaux', 'Export Léa']);
        expect(casesRendues).toEqual(["Compresser le ZIP", 'Reprises seulement']);
        // Toute case de la zone est captée par le motif à étiquette : aucune n'échappe au compte.
        expect((zoneCartes.match(/type="checkbox"/g) || []).length).toBe(casesRendues.length);
    });
});

describe('#893 · l\'aide nomme les cartes rendues, et aucune autre', () => {
    it('les modes de l\'aide sont exactement les titres des cartes, dans l\'ordre', () => {
        expect(modesAide).toEqual(titresRendus);
    });
    it('chaque case rendue à l\'écran est nommée dans l\'aide', () => {
        for (const c of casesRendues) expect(aide, 'case non nommée : ' + c).toContain('« ' + c + ' »');
    });
    it('l\'aide ne cite plus ce qui n\'existe pas', () => {
        expect(aide).not.toContain('Inclure annotés');
        expect(aide).not.toContain('Inclure évaluations');
        expect(aide).not.toMatch(/All[èe]gement/i);
        expect(aide).not.toMatch(/fac-simil[ée]/i);
        expect(aide).not.toMatch(/\d modes d'export/);
    });
    it('l\'aide situe le bloc d\'espace là où l\'écran le rend : après les cartes', () => {
        expect(ui.indexOf('<!-- Quota stockage -->')).toBeGreaterThan(ui.indexOf('<div class="travaux-archivage-options">'));
        expect(aide).toContain('le bloc au bas de l\'écran');
        expect(aide).not.toContain('en haut de l\'écran');
    });
});

describe('#893 · la fiche d\'accompagnement suit l\'écran', () => {
    it('son titre est le libellé de la navigation', () => {
        const m = /\{ id: 'exporter', label: '([^']+)' \}/.exec(config);
        expect(m, 'libellé de navigation introuvable').toBeTruthy();
        expect(fiche).toContain("titre: '" + m[1] + "'");
        expect(fiche).not.toContain('Archivage des travaux');
    });
    it('ses modes sont les cartes rendues', () => {
        expect(modesFiche).toEqual(titresRendus);
    });
    it('l\'inventaire vient de « Préparer et importer », pas d\'« Annoter et évaluer »', () => {
        expect(fiche).toContain('importé dans <strong>Préparer et importer</strong>');
        expect(fiche).not.toContain('<strong>Annoter et évaluer</strong>');
    });
});

describe('#893 · le bloc d\'espace parle français, accents compris', () => {
    // Borné à la fonction suivante : `proposerNettoyage` est hors périmètre (#892).
    const quota = tranche(ui, 'async function chargerQuota()', '    async function proposerNettoyage()', { longueurMin: 900 });
    // Le texte RENDU : le gabarit posé dans innerHTML, sans le code autour.
    const rendu = tranche(quota, 'info.innerHTML = `', '\n        `;', { longueurMin: 600 });

    it('aucun mot sans accent ni jargon dans le texte rendu', () => {
        for (const mot of ['utilises', 'bientot', 'liberer', 'Rafraichir', 'Archivez', 'fichier(s)', 'Mode:', 'IndexedDB', '(FSAPI)']) {
            expect(rendu, 'mot à proscrire : ' + mot).not.toContain(mot);
        }
    });
    it('les phrases validées par Grégoire le 20 septembre sont en place', () => {
        expect(rendu).toContain('utilisés sur');
        expect(rendu).toContain("window.pluriel(stats.nombre, 'fichier', 'fichiers')} de travaux");
        expect(rendu).toContain("Rangement : ${travauxStockage.dossierEnJeu() ? 'fichiers sur ton disque' : 'dans le navigateur'}");
        expect(rendu).toContain("<strong>L'espace est presque plein.</strong>");
        expect(rendu).toContain("Exporte tes anciens travaux avant d'en importer d'autres.");
    });
    it('les boutons d\'action gardent leur libellé et leur geste (#892 reste ouverte)', () => {
        expect(rendu).toContain('data-action="travauxUI.proposerNettoyage">Proposer un nettoyage</button>');
        expect(rendu).toContain('data-action="travauxUI.configurerFSAPI">Passer au stockage disque</button>');
    });
});
