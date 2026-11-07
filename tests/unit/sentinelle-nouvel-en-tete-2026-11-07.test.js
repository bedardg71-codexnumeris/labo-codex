import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// « Le nouvel en-tête » (7 nov. 2026) — ce que la consigne RETIRE ne revient pas en silence,
// et ce qu'elle ajoute garde sa forme. Le rendu se juge sur capture (Grégoire) et dans
// tests/integration/nouvel-en-tete-2026-11-07.spec.js ; ici, le texte du dépôt.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const html = lire('index.html');
const entete = tranche(html, '<header class="entete">', '</header>');
const orchestre = lire('js/trimestre-v2-orchestre.js');
const peupler = tranche(orchestre, 'async function peuplerDropdownGroupeCoursActif', 'function changerGroupeCoursDepuisHeader');

describe('nouvel en-tête · ce qui disparaît', () => {
    it('le titre de l\'onglet est « Labo Codex », sans l\'ancienne formule', () => {
        expect(html).toContain('<title>Labo Codex</title>');
    });
    it('ni sous-titre, ni date, ni avis d\'horaire dans l\'en-tête', () => {
        expect(entete).not.toContain('Un outil de soutien');
        expect(html).not.toContain('id="entete-date"');
        expect(lire('js/contexte.js')).not.toContain('entete-date');
    });
    it('le popover « ⋯ » est retiré avec son code', () => {
        expect(html).not.toContain('popover-utilitaires-mobile');
        expect(lire('js/chrome-unifie.js')).not.toMatch(/function ouvrirPopoverUtilitaires/);
    });
    it('le libellé du groupe ne lit plus les enseignant·es', () => {
        expect(peupler).not.toMatch(/enseignants/);
        expect(peupler).not.toMatch(/nomEns/);
    });
});

describe('nouvel en-tête · ce qui s\'ajoute', () => {
    it('logo et slogan côte à côte, logo seul ≤ 520 px — fichiers publiés (img/)', () => {
        expect(entete).toContain('src="img/labo-codex-logo-slogan-cote-blanc.svg"');
        expect(entete).toContain('media="(max-width: 520px)" srcset="img/labo-codex-logo-blanc.svg"');
        expect(lire('img/labo-codex-logo-slogan-cote-blanc.svg')).toBe(lire('Logo/labo-codex-logo-slogan-cote-blanc.svg'));
    });
    it('le bloc de droite : 4 + 4 icônes dans l\'ordre de la consigne, puis Codex', () => {
        const bloc = tranche(entete, '<div class="entete-bloc">');
        const actions = [...bloc.matchAll(/<button [^>]*data-action="([^"]+)"(?: data-param="([^"]+)")?/g)].map(m => m[2] || m[1]);
        expect(actions.slice(0, 9)).toEqual(['ouvrirModalRapportBug', 'ouvrirModalSoutien', 'basculerModeAnonymisation', 'basculerTheme',
            'tour-guide', 'basculerAssistance', 'aide', 'reglages', 'Codex.toggleMenu']);
    });
    it('les boutons gardent .btn-action-header (navigation.js, zone protégée, s\'en sert)', () => {
        expect(lire('js/navigation.js')).toContain('.btn-action-header[data-param="aide"]');
        expect((entete.match(/class="btn-action-header"/g) || []).length).toBe(8);
    });
    it('le select natif reste, sous un affichage à deux tons masqué aux lecteurs d\'écran', () => {
        expect(entete).toMatch(/<span class="groupe-affichage" aria-hidden="true">/);
        expect(entete).toMatch(/<select id="selectGroupeCoursHeader"[^>]*aria-label="Groupe-cours actif"/);
        expect(peupler).toMatch(/data-principal=/);
        expect(peupler).toMatch(/data-secondaire=/);
    });
    it('les bulles sont réparties sur les deux bandes', () => {
        expect(entete).toContain('id="bulles-container"');
        expect(tranche(html, '<nav class="navigation-principale">', '<div class="navigation-boutons">')).toContain('id="bulles-container-nav"');
    });
});
