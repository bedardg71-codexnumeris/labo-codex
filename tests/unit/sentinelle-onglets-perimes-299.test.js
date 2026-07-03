import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle-cliquet — #299 (clôture, 3 juillet 2026, vague 3 batch 2) :
// balayage des références d'onglets périmées « Réglages → X ».
//
// Historique : lots user-facing livrés les 13 et 15 juin ; restaient des
// COMMENTAIRES de code dont les destinations étaient « à confirmer ». Confirmées
// AU CODE le 3 juillet (config.js : Réglages = Préférences/Données/À propos
// seulement) :
//   - « Réglages › Enseignant »        → Cadre › Trimestre › Enseignant·e
//     (dropdown v2-selectEnseignant, index.html section calendrier-trimestre) ;
//   - « Réglages → Snapshots »          → Réglages → Données (bloc Captures) ;
//   - « Réglages → Interprétation »     → l'UI N'EXISTE PLUS (seuils par défaut
//     de interpretation-config.js, plus de page de réglage) ;
//   - « Réglages › Portfolio »          → config portfolio de la pratique active ;
//   - « Réglages → Aperçu »             → la sous-section a DISPARU : le module
//     entier js/statistiques.js (qui la peuplait) était MORT (cible
//     reglages-apercu absente d'index.html, init no-op, 0 autre appelant)
//     → RETIRÉ (zéro-dette), avec sa balise script et son init dans main.js.
//
// Le cliquet interdit le RETOUR de ces libellés périmés dans js/ ; les
// destinations valides (« Réglages → Données », etc.) restent permises.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const dossierJs = path.join(racine, 'js');

function lireTousLesJs() {
    return readdirSync(dossierJs)
        .filter(f => f.endsWith('.js'))
        .map(f => ({ fichier: 'js/' + f, contenu: readFileSync(path.join(dossierJs, f), 'utf8') }));
}

describe('sentinelle-cliquet · références d\'onglets périmées (#299)', () => {
    const fichiers = lireTousLesJs();

    it('aucun libellé périmé « Réglages → Aperçu / Snapshots / Interprétation / Portfolio / Enseignant » dans js/', () => {
        const perimes = [
            /Réglages\s*[→›]\s*Aperçu/,
            /Réglages\s*[→›]\s*Snapshots/,
            /Réglages\s*[→›]\s*\n?[/* ]*Interprétation/,
            /Réglages\s*[→›]\s*Portfolio/,
            /Réglages\s*[→›]\s*\n?[/* ]*Enseignant/,
        ];
        const infractions = [];
        for (const { fichier, contenu } of fichiers) {
            for (const motif of perimes) {
                if (motif.test(contenu)) infractions.push(fichier + ' ~ ' + motif);
            }
        }
        expect(infractions, 'libellés périmés réintroduits : ' + infractions.join(' ; ')).toEqual([]);
    });

    it('anti-tautologie : les destinations VALIDES restent référencées (le cliquet ne bannit pas « Réglages »)', () => {
        const tout = fichiers.map(f => f.contenu).join('\n');
        expect(tout).toMatch(/Réglages\s*[→›]\s*Données/);
        // Le chemin des Réglages iOS/iPad (app Apple, PAS Labo Codex) est intact
        const codex = readFileSync(path.join(racine, 'js', 'codex.js'), 'utf8');
        expect(codex).toContain('Réglages → Général → Stockage iPad');
    });

    it('zéro-dette : le module mort statistiques.js est entièrement retiré (fichier, script tag, init)', () => {
        expect(existsSync(path.join(racine, 'js', 'statistiques.js'))).toBe(false);
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect(html).not.toContain('js/statistiques.js');
        const main = readFileSync(path.join(racine, 'js', 'main.js'), 'utf8');
        expect(main).not.toContain('initialiserModuleStatistiques');
    });

    it('zéro-dette : genererBadgeCCPermanent (0 appelant) est retiré de cc-license.js', () => {
        const cc = readFileSync(path.join(racine, 'js', 'cc-license.js'), 'utf8');
        expect(cc).not.toContain('genererBadgeCCPermanent');
        // Ancre de réalité : la source d'identité CC (dropdown) est toujours en place
        expect(cc).toContain("document.getElementById('v2-selectEnseignant')");
    });
});
