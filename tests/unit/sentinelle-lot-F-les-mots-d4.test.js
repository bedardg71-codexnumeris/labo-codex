import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — LOT F DE L'ENREGISTREMENT, LES MOTS (D4, Grégoire, 26 sept. 2026, « je garde ! »).
//
// « Enregistré » ne veut plus dire qu'une chose : écrit dans l'application. Le codex (le
// fichier sur la clé USB) a son verbe, « Mettre à jour le codex », et son témoin dit « Ton
// codex est à jour » ou « Ton codex n'a pas tes derniers changements ». La Réserve parle
// d'archives (« Groupe archivé »). La copie de secours (Réglages › Données) s'appelle
// « Copie de secours », rappel compris.
//
// Les anciens textes sont refusés dans js/ et index.html, commentaires compris (un nom
// périmé s'y réinstalle tout seul). Une seule exception : js/changelog-data.js, les
// annonces déjà lues par les utilisateurs, qu'on ne réécrit pas.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

const REFUSES = [
    'Tout est enregistré',           // l'ancien témoin du codex
    'Enregistrer le codex',          // le verbe du codex est « Mettre à jour »
    'Archive enregistrée',           // la Réserve dit « Groupe archivé »
    'Erreur de archive',             // la coquille de l'échec d'archivage
    'Exporter maintenant',           // le bouton du rappel qui n'exportait rien
    'Protège tes données',           // l'ancien titre du rappel
    'Fais une copie de secours</h3>', // lot I (D8) : le titre du rappel est « Mets ton codex à jour »
    'Enregistrement auto',           // l'enregistrement automatique est retiré (29 sept.)
    'si tu quittes sans l\'avoir fait', // R1 de Cowork : faux pour un changement de section
    '<code>.codex.zip</code>',       // R2 de Cowork : le fichier du codex finit par .zip
    '<strong>.codex.zip</strong>'
];

function fichiersJs(dossier) {
    const resultats = [];
    for (const entree of readdirSync(dossier)) {
        const chemin = path.join(dossier, entree);
        if (statSync(chemin).isDirectory()) { if (entree !== '_archives') resultats.push(...fichiersJs(chemin)); }
        else if (entree.endsWith('.js') && entree !== 'changelog-data.js') resultats.push(chemin);
    }
    return resultats;
}

function occurrences(texte) {
    const cibles = [...fichiersJs(path.join(racineProjet, 'js')), path.join(racineProjet, 'index.html')];
    const trouvees = [];
    for (const f of cibles) {
        readFileSync(f, 'utf8').split('\n').forEach((ligne, i) => {
            if (ligne.includes(texte)) trouvees.push(`${path.relative(racineProjet, f)}:${i + 1}`);
        });
    }
    return trouvees;
}

describe('Lot F (D4) : les anciens mots ont quitté l\'application', () => {
    for (const texte of REFUSES) {
        it(`« ${texte} » n'apparaît plus dans js/ ni index.html`, () => {
            expect(occurrences(texte)).toEqual([]);
        });
    }

    it('les mots décidés sont en place : le bouton, le témoin, la Réserve, la copie de secours', () => {
        const codex = readFileSync(path.join(racineProjet, 'js/codex.js'), 'utf8');
        const html = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
        const reserve = readFileSync(path.join(racineProjet, 'js/reserve.js'), 'utf8');
        const rappel = readFileSync(path.join(racineProjet, 'js/modal-backup-reminder.js'), 'utf8');
        const accueil = readFileSync(path.join(racineProjet, 'js/accueil.js'), 'utf8');
        expect(codex).toContain("'Mettre à jour le codex'");
        expect(html).toContain('<span id="codex-menu-enreg-label">Mettre à jour le codex</span>');
        expect(codex).toContain("'Ton codex n\\'a pas tes derniers changements' : 'Ton codex est à jour'");
        expect(reserve).toContain("'Groupe archivé'");
        // Lot I (#985, D8) : le rappel mène au codex.
        expect(rappel).toContain('Mettre à jour le codex');
        // Lot I (#985, option a de Grégoire, 29 sept.) : la carte de l'Accueil est celle du codex.
        expect(accueil).toContain('<div class="accueil-utilitaire-titre">Ton codex</div>');
        expect(accueil).toContain('<div class="accueil-utilitaire-desc">Mets-le à jour : une copie complète de tes données.</div>');
        expect(accueil).not.toContain('<div class="accueil-utilitaire-titre">Copie de secours</div>');
    });
});
