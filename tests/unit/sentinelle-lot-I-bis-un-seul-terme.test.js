import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// CLIQUET — LOT I BIS (D9, Grégoire, 30 sept. 2026) : « UN SEUL TERME ».
//
// L'application ne parle plus que du codex. Aucun texte ne dit plus « copie de secours »,
// toute casse, singulier ou pluriel. Motif de Grégoire : cinq utilisateurs, deux mots pour
// deux fichiers créaient de la confusion.
//
// Portée : tout le dossier js/ (hors _archives, qui n'est pas servi) et index.html,
// COMMENTAIRES COMPRIS — plus large que « les textes affichés », exprès : un texte d'écran
// naît d'une chaîne dans un de ces fichiers, et un nom périmé resté dans un commentaire s'y
// réinstalle tout seul (même choix que la sentinelle des mots du lot F).
// Une seule exception : js/changelog-data.js, les Nouvelles déjà lues, qu'on ne réécrit pas.
//
// Le motif se cherche sur le texte APLATI (entités d'espace et retours de ligne ramenés à une
// espace) : « copie&nbsp;de&nbsp;secours » ou un terme coupé par une fin de ligne sont pris.
//
// Règle 10 : une absence ne prouve rien sur une tranche vide. Le balayage prouve donc qu'il
// a lu (nombre de fichiers, volume), et le MÊME motif rend autre chose ailleurs : il trouve
// le terme dans les Nouvelles, où il doit rester.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

const MOTIF = /copies?\s+de\s+secours/gi;
const NOUVELLES = path.join(racineProjet, 'js', 'changelog-data.js');

function fichiersJs(dossier) {
    const resultats = [];
    for (const entree of readdirSync(dossier)) {
        const chemin = path.join(dossier, entree);
        if (statSync(chemin).isDirectory()) { if (entree !== '_archives') resultats.push(...fichiersJs(chemin)); }
        else if (entree.endsWith('.js')) resultats.push(chemin);
    }
    return resultats;
}

/** Les occurrences du terme dans un fichier : « chemin:ligne ». */
function occurrences(fichier) {
    const source = readFileSync(fichier, 'utf8');
    // Aplatir SANS changer la longueur : chaque entité d'espace devient autant d'espaces
    // qu'elle a de caractères, pour que la position rende la bonne ligne.
    const aplati = source.replace(/&nbsp;|&#160;|&#xa0;/gi, (m) => ' '.repeat(m.length)).replace(/ /g, ' ');
    const trouvees = [];
    for (const m of aplati.matchAll(MOTIF)) {
        const ligne = source.slice(0, m.index).split('\n').length;
        trouvees.push(`${path.relative(racineProjet, fichier)}:${ligne}`);
    }
    return { trouvees, volume: source.length };
}

describe('Lot I bis (D9) : un seul terme, le codex', () => {
    const tousLesJs = fichiersJs(path.join(racineProjet, 'js'));
    const cibles = [...tousLesJs.filter((f) => f !== NOUVELLES), path.join(racineProjet, 'index.html')];

    it('le balayage lit bien l\'application (garde de non-vide)', () => {
        expect(tousLesJs).toContain(NOUVELLES);
        expect(cibles.length).toBeGreaterThan(150);
        const volume = cibles.reduce((somme, f) => somme + occurrences(f).volume, 0);
        expect(volume).toBeGreaterThan(5000000);
        // Les fichiers où le terme vivait le 30 sept. sont dans le balayage.
        for (const nom of ['js/import-export.js', 'js/trimestre-v2-liste.js', 'js/registre-longitudinal.js',
            'js/accompagnement-contenu-popup.js', 'js/accompagnement-contenu-hover.js', 'index.html']) {
            expect(cibles.map((f) => path.relative(racineProjet, f))).toContain(nom);
        }
    });

    it('témoin : le même motif trouve le terme là où il doit rester (les Nouvelles déjà lues)', () => {
        expect(occurrences(NOUVELLES).trouvees.length).toBeGreaterThan(0);
    });

    it('le motif prend toute casse, le pluriel, l\'espace insécable et la fin de ligne', () => {
        for (const texte of ['Copie de secours', 'copies de secours', 'COPIE DE SECOURS', 'copie&nbsp;de&nbsp;secours', 'copie de secours', 'copie de\n        secours']) {
            const aplati = texte.replace(/&nbsp;/gi, (m) => ' '.repeat(m.length)).replace(/ /g, ' ');
            expect(aplati.match(MOTIF), texte).toBeTruthy();
        }
        expect('une copie complète de tes données'.match(MOTIF)).toBeNull();
    });

    it('aucun texte de js/ ni d\'index.html ne dit plus « copie de secours »', () => {
        const trouvees = cibles.flatMap((f) => occurrences(f).trouvees);
        expect(trouvees).toEqual([]);
    });

    it('la fabrication est retirée : ni la fenêtre des clés, ni son bouton, ni son code', () => {
        const html = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
        const importExport = readFileSync(path.join(racineProjet, 'js', 'import-export.js'), 'utf8');
        // Garde de non-vide : les voisins qui restent sont bien là.
        expect(html).toContain('data-action="exporterConfigurationComplete"');
        expect(html).toContain('data-action="ouvrirModalImport"');
        expect(html).toContain('id="modalImport"');
        expect(importExport).toContain('function previsualiserImport(');
        expect(importExport).toContain('window.ouvrirModalImport = ouvrirModalImport;');
        // Le NOM ENTIER : `ouvrirModalExportPDF` (export-pdf.js) est un autre geste, il reste.
        const nomEntier = (nom) => new RegExp('(?<![A-Za-z0-9_-])' + nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z0-9_-])');
        expect('await ouvrirModalExportPDF({})').not.toMatch(nomEntier('ouvrirModalExport'));
        expect('data-action="ouvrirModalExport"').toMatch(nomEntier('ouvrirModalExport'));
        for (const retire of ['ouvrirModalExport', 'fermerModalExport', 'toggleToutesLesCles', 'executerExport',
            'modalExport', 'listeClesExport', 'checkToutesLes', 'donnees-codex-export']) {
            const ou = cibles.filter((f) => nomEntier(retire).test(readFileSync(f, 'utf8'))).map((f) => path.relative(racineProjet, f));
            expect(ou, retire).toEqual([]);
        }
    });
});
