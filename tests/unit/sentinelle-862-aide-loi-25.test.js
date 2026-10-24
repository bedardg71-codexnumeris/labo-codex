import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');

// SENTINELLE #862 (15 septembre 2026) — L'AIDE DIT CE QUE LA LOI 25 DEMANDE À L'ENSEIGNANT.
//
// Constat (14 sept.) : « Loi 25 » n'apparaissait qu'une fois dans tout le code livré, dans
// l'avertissement du rapport de bug. La communauté de pratique installe l'application sur ses postes
// cette semaine ; un technopédagogue a posé la question des données personnelles.
// Forme tranchée par Grégoire le 14 sept. (un encadré court dans l'Aide + un lien vers la page
// publique) ; texte approuvé par lui le 15 sept. au soir, dans la section de l'Aide sur les données.
//
// Et la règle de l'audit de l'Aide (lot D) : l'Aide ne promet pas l'inexistant — les deux boutons que
// l'encadré nomme doivent exister, sous ces mots, HORS de l'Aide.

const AIDE = tranche(html, 'id="section-aide"', 'fin section-aide');
const debut = AIDE.indexOf('id="accordeon-aide-export-import"');
const CARTE = debut > -1 ? AIDE.slice(debut, AIDE.indexOf('accordeon-aide-', debut + 40)) : '';
const texte = (s) => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

describe('#862 · l\'Aide dit ce que la Loi 25 demande', () => {
    // RÉANCRÉ au lot I bis (D9, 30 sept. 2026, « un seul terme ») : la section s'appelle
    // « Ouverture et partage de tes données », et l'encadré renvoie au geste qui reste,
    // « Mettre à jour le codex » (le bouton de l'ancien fichier de secours est retiré).
    it('la section « Ouverture et partage de tes données » de l\'Aide existe (la tranche n\'est pas vide)', () => {
        expect(CARTE.length).toBeGreaterThan(500);
        expect(texte(CARTE)).toMatch(/Ouverture et partage de tes données/);
    });

    it('elle porte l\'encadré « Important » qui nomme la Loi 25', () => {
        // ↻ #1152, lot 1 — décision D7 de Grégoire (audit de l'Aide, 24 oct. 2026, 18 h 24) : « les données de tes étudiant·es » ;
        // rien d'autre ne change dans l'encadré. L'ancien mot ne doit plus y paraître.
        expect(CARTE).toMatch(/<div class="alerte alerte-attention">\s*<strong>Important — les données de tes étudiant·es et la Loi 25\.<\/strong>/);
        expect(CARTE).not.toMatch(/les données de tes élèves/);
        expect(texte(CARTE)).toMatch(/personne d'autre ne peut les consulter/);
        expect(texte(CARTE)).toMatch(/sous la responsabilité de ton établissement/);
    });

    it('elle renvoie à la page publique, dans un nouvel onglet, et donne le contact', () => {
        expect(CARTE).toMatch(/<a href="https:\/\/codexnumeris\.org\/labo-codex-ou-vivent-vos-donnees" target="_blank" rel="noopener noreferrer">/);
        expect(CARTE).toMatch(/labo@codexnumeris\.org/);
    });

    it('les deux boutons qu\'elle nomme existent sous ces mots, hors de l\'Aide', () => {
        const horsAide = html.replace(AIDE, '');
        expect(horsAide).toMatch(/>\s*Mettre à jour le codex\s*</);
        expect(horsAide).toMatch(/>\s*Réinitialiser toutes les données\s*</);
        expect(texte(CARTE)).toMatch(/Personne ne met ton codex à jour à ta place : utilise « Mettre à jour le codex » régulièrement\./);
        expect(texte(CARTE)).toMatch(/« Réinitialiser toutes les données »/);
    });
});
