import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — « PRODUCTION » PLUTÔT QUE « COPIE », le seul remplacement déjà décidé
// (Grégoire, 8 nov. 2026, 12 h 48 ; consigne
// `plans de travail/CONSIGNE-LOT-2026-11-08-production-plutot-que-copie.md`).
//
// Le rappel « Mets ton codex à jour » (js/modal-backup-reminder.js) disait « copies de tes
// étudiant·es comprises ». Ce que l'étudiant·e remet est une production : un travail n'est
// pas toujours écrit. « Copie » ne garde que le sens de sauvegarde (« une copie complète »).
// Le texte validé se pose mot pour mot.
//
// Le texte se lit APLATI (retours de ligne et blancs ramenés à une espace) : le gabarit le
// coupe sur plusieurs lignes. Le même aplatissement rend l'ancien texte sur la version
// d'avant (break-test) : la sentinelle n'est pas vide par construction.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const FICHIER = path.join(racineProjet, 'js', 'modal-backup-reminder.js');

const TEXTE_VALIDE = 'Ton codex en garde une copie complète, productions de tes étudiant·es ' +
    'comprises, que tu rouvres sur n\'importe quel appareil.';

function aplatir(texte) {
    return texte.replace(/\s+/g, ' ');
}

describe('Rappel « Mets ton codex à jour » : productions de tes étudiant·es (8 nov. 2026)', () => {
    const source = aplatir(readFileSync(FICHIER, 'utf8'));

    it('le fichier lu est bien celui du rappel (le titre y est)', () => {
        expect(source).toContain('Mets ton codex à jour');
    });

    it('porte le texte validé, mot pour mot', () => {
        expect(source).toContain(TEXTE_VALIDE);
    });

    it('ne dit plus « copies de tes étudiant·es »', () => {
        expect(source).not.toMatch(/copies\s+de\s+tes\s+étudiant·es/i);
    });

    it('garde « une copie complète », au sens de sauvegarde', () => {
        expect(source).toContain('une copie complète');
    });
});
