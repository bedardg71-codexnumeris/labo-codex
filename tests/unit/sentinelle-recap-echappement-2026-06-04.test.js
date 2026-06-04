import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #312 (sécurité, 4 juin 2026) — Le récapitulatif de l'assistant de pratique
// injectait r.auteur / r.etablissement / r.discipline (saisis par l'utilisateur·trice)
// dans innerHTML SANS echapperHtml() : violation de la règle de sécurité non
// négociable du projet. Repéré lors de la refonte des textes de l'assistant
// (brief refonte-textes-assistant-pratique.md §3). Sentinelle = verrou contre
// la réintroduction du bug lors d'un refactoring (cf. risque « fix défensif
// perdu à l'extraction »).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const wizard = readFileSync(path.join(racineProjet, 'js', 'wizard-pratique-v2.js'), 'utf8');

describe('#312 · le récap de l\'assistant échappe les données utilisateur', () => {
    it('échappe r.auteur', () => {
        expect(wizard).toMatch(/\$\{echapperHtml\(r\.auteur\)\}/);
    });

    it('échappe r.etablissement', () => {
        expect(wizard).toMatch(/\$\{echapperHtml\(r\.etablissement\)\}/);
    });

    it('échappe r.discipline', () => {
        expect(wizard).toMatch(/\$\{echapperHtml\(r\.discipline\)\}/);
    });

    it('ne réintroduit aucune injection brute de ces trois champs', () => {
        expect(wizard).not.toMatch(/\$\{r\.auteur\}/);
        expect(wizard).not.toMatch(/\$\{r\.etablissement\}/);
        expect(wizard).not.toMatch(/\$\{r\.discipline\}/);
    });
});
