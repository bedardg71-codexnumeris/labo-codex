import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const indexHtml = readFileSync(path.join(racine, 'index.html'), 'utf8');

// #333 Lot 2 — Synthèse CSV des résultats finaux. Tests des fonctions PURES
// (échappement RFC 4180 + anti-injection de formules, construction des lignes,
// CSV complet). Le module est une IIFE exposant window._exportResultats.

let X;
beforeAll(() => {
    const win = chargerScript('js/export-resultats-finaux.js');
    X = win._exportResultats;
    expect(X, 'window._exportResultats exporté').toBeTruthy();
});

describe('#333 — échappement CSV (RFC 4180 + anti-injection de formules)', () => {
    it('valeur simple : inchangée', () => {
        expect(X.echapperCelluleCSV('Essai')).toBe('Essai');
        expect(X.echapperCelluleCSV(81)).toBe('81');
    });

    it('null / undefined → chaîne vide', () => {
        expect(X.echapperCelluleCSV(null)).toBe('');
        expect(X.echapperCelluleCSV(undefined)).toBe('');
    });

    it('injection de formule : préfixe une apostrophe (= + - @)', () => {
        expect(X.echapperCelluleCSV('=SUM(A1:A9)')).toBe("'=SUM(A1:A9)");
        expect(X.echapperCelluleCSV('+1')).toBe("'+1");
        expect(X.echapperCelluleCSV('-1')).toBe("'-1");
        expect(X.echapperCelluleCSV('@cmd')).toBe("'@cmd");
    });

    it('RFC 4180 : virgule / guillemet / saut de ligne → entre guillemets', () => {
        expect(X.echapperCelluleCSV('Nom, Prénom')).toBe('"Nom, Prénom"');
        expect(X.echapperCelluleCSV('dit "salut"')).toBe('"dit ""salut"""');
        expect(X.echapperCelluleCSV('ligne1\nligne2')).toBe('"ligne1\nligne2"');
    });
});

describe('#333 — construction des lignes de synthèse', () => {
    const etudiants = [
        { da: '9000113', nom: 'Essai', prenom: 'Livia' },
        { da: '9000114', nom: 'Rondeau', prenom: 'Simon' },
        { da: '9000115', nom: 'Grandbois', prenom: 'Joss' }
    ];
    const contexte = {
        groupe: '00001', cours: 'Littérature', trimestre: 'H2026',
        pratiqueId: 'prat-1', pratiqueCode: 'STD', pratiqueNom: 'PAN-Standards',
        notesFinales: true   // E7 (28 oct. 2026) : « final » exige la case « Notes finalisées »
    };
    // note constructible / non constructible / provisoire
    const simuler = (da) => {
        if (da === '9000113') return { P: 82, noteConstructible: true, details: { estProvisoire: false } };
        if (da === '9000114') return { P: 0, noteConstructible: false };          // non constructible
        if (da === '9000115') return { P: 74, noteConstructible: true, details: { estProvisoire: true } };
        return null;
    };

    it('note réelle → valeur + statut « final »', () => {
        const lignes = X.construireLignesSynthese(etudiants, contexte, simuler);
        // #706 (5 sept. 2026) : 11e colonne « Non comptées » — vide quand la simulation ne porte pas `ecartees`.
        expect(lignes[0]).toEqual(['9000113', 'Essai', 'Livia', '00001', 'Littérature', 'H2026', 'STD', 'PAN-Standards', 82, 'final', '']);
    });

    it('non constructible → note vide + statut « non constructible » (pas un 0)', () => {
        const lignes = X.construireLignesSynthese(etudiants, contexte, simuler);
        expect(lignes[1][8]).toBe('');                 // colonne Note finale
        expect(lignes[1][9]).toBe('non constructible');
    });

    it('saisies manquantes → statut « provisoire »', () => {
        const lignes = X.construireLignesSynthese(etudiants, contexte, simuler);
        expect(lignes[2][8]).toBe(74);
        expect(lignes[2][9]).toBe('provisoire');
    });

    it('E7 (28 oct. 2026) — « Notes finalisées » non cochée : « provisoire », même quand la note est complète', () => {
        const lignes = X.construireLignesSynthese(etudiants, Object.assign({}, contexte, { notesFinales: false }), simuler);
        expect(lignes.map(l => l[9])).toEqual(['provisoire', 'non constructible', 'provisoire']);
        expect(X.construireLignesSynthese(etudiants, { pratiqueId: 'prat-1' }, simuler)[0][9]).toBe('provisoire');   // case absente
    });

    it('simuler absent / null → non constructible (jamais d\'exception)', () => {
        const lignes = X.construireLignesSynthese(etudiants, contexte, null);
        expect(lignes).toHaveLength(3);
        expect(lignes.every(l => l[9] === 'non constructible')).toBe(true);
    });
});

describe('#333 — CSV complet', () => {
    it('BOM UTF-8, en-têtes, CRLF', () => {
        const csv = X.genererCSVSynthese(
            [{ da: '1', nom: 'A', prenom: 'B' }],
            { pratiqueId: 'p', pratiqueCode: 'SOM', pratiqueNom: 'Sommative', notesFinales: true },   // E7
            () => ({ P: 90, noteConstructible: true, details: {} })
        );
        expect(csv.charCodeAt(0)).toBe(0xFEFF);                 // BOM
        expect(csv).toContain('DA,Nom,Prénom');                // en-têtes
        expect(csv).toContain('\r\n');                         // CRLF
        expect(csv).toContain('1,A,B,');                       // ligne étudiant
        expect(csv).toContain(',90,final');
    });
});

describe('#333 — câblage UI', () => {
    it('le module est chargé et le bouton d\'export est dans Suivi', () => {
        expect(indexHtml).toContain('js/export-resultats-finaux.js');
        expect(indexHtml).toContain('data-action="exporterSyntheseResultatsCSV"');
    });
});
