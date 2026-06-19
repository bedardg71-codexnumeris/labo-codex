import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #342 (prévention) — l'identité CC ne doit JAMAIS être devinée.
// Avant : obtenirProfilAuteurActifSync retombait silencieusement sur
// enseignantsReels[0] (premier de la liste) faute de désignation explicite,
// et le défaut applicatif était « Grégoire Bédard ». Résultat terrain : une
// pratique de littérature de Grégoire stampée « par Bruno Voisard » (1ʳᵉ entrée
// du registre = lignée de test chimie).
// Décision Grégoire (19 juin) : retirer le nom personnel par défaut ; sans
// identité résolue, l'auteur est « Inconnu ».
//
// On charge l'IIFE dans le sandbox (chargerScript) en injectant un faux `db` :
// document.getElementById renvoie null (pas de dropdown) → on exerce les replis
// `actif` et « aucune désignation ». obtenirIdentiteCCUtilisateur est l'API
// exportée qui enveloppe obtenirProfilAuteurActifSync.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.resolve(__dirname, '..', '..', 'js/cc-license.js'), 'utf8');

function charger(enseignants) {
    const db = { getSync: (cle, defaut) => (cle === 'enseignants' ? enseignants : defaut) };
    return chargerScript('js/cc-license.js', { db });
}

describe('#342 — attribution CC : pas de nom deviné, défaut « Inconnu »', () => {
    it('aucun enseignant réel → « Inconnu »', () => {
        const win = charger([{ id: 'd1', prenom: 'Primo', nom: 'Primavera', isDemo: true }]);
        expect(win.obtenirIdentiteCCUtilisateur()).toBe('Inconnu');
    });

    it('plusieurs enseignants réels mais AUCUN désigné → « Inconnu » (plus de repli [0])', () => {
        const win = charger([
            { id: 'e1', prenom: 'Bruno', nom: 'Voisard' },   // 1ʳᵉ entrée — l'ancien fautif
            { id: 'e2', prenom: 'Grégoire', nom: 'Bédard' }
        ]);
        const identite = win.obtenirIdentiteCCUtilisateur();
        expect(identite).toBe('Inconnu');
        expect(identite).not.toBe('Bruno Voisard');   // cœur de la régression #342
    });

    it('un enseignant marqué actif → son nom (chemin nominal préservé)', () => {
        const win = charger([
            { id: 'e1', prenom: 'Bruno', nom: 'Voisard' },
            { id: 'e2', prenom: 'Grégoire', nom: 'Bédard', actif: true }
        ]);
        expect(win.obtenirIdentiteCCUtilisateur()).toBe('Grégoire Bédard');
    });

    it('le défaut applicatif ne grave plus un nom personnel', () => {
        // Verrou statique : auteur_original par défaut = « Inconnu », pas un nom.
        expect(src).toContain('auteur_original: "Inconnu"');
        expect(src).not.toContain('auteur_original: "Grégoire Bédard"');
    });

    it('plus de repli silencieux sur enseignantsReels[0]', () => {
        expect(src).not.toContain('enseignant = enseignantsReels[0]');
    });

    it('identité inconnue → métadonnées SANS courriel ni site personnels', () => {
        const win = charger([]);   // aucun enseignant → profil null
        const meta = win.ajouterMetadonnéesCC({}, 'grille', 'Ma grille').metadata;
        expect(meta.auteur_original).toBe('Inconnu');
        expect(meta.email_auteur).toBe('');
        expect(meta.site_auteur).toBe('');
    });

    it('le défaut applicatif ne grave plus mes coordonnées', () => {
        // Verrou statique : courriel/site par défaut vidés (#342).
        expect(src).not.toContain('email_auteur: "labo@codexnumeris.org"');
        expect(src).not.toContain('site_auteur: "https://codexnumeris.org"');
    });

    it('enseignant réel résolu → ses propres coordonnées sont utilisées', () => {
        const win = charger([
            { id: 'e1', prenom: 'Grégoire', nom: 'Bédard', actif: true,
              courriel: 'greg@exemple.org', siteWeb: 'https://exemple.org' }
        ]);
        const meta = win.ajouterMetadonnéesCC({}, 'grille', 'Ma grille').metadata;
        expect(meta.auteur_original).toBe('Grégoire Bédard');
        expect(meta.email_auteur).toBe('greg@exemple.org');
        expect(meta.site_auteur).toBe('https://exemple.org');
    });
});
