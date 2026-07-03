import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #356 — sentinelle anonymisation de la sortie du golden master (2 juillet 2026).
// Le rapport de `scripts/valider-golden-master-trimestre.mjs` imprimait les NOMS
// d'élèves (tableau des lignes, pire écart Omnivox du résumé, bloc diagnostic)
// et les DA complets — posture Loi 25 : un rapport collé dans une session ou un
// ticket fuyait des données nominatives.
// Contrat verrouillé (exécution du VRAI script sur une fixture synthétique) :
//  1. par défaut, la sortie ne contient NI nom NI DA complet — pseudonymes
//     stables « Élève-NNN » + DA masqué « …XXX » + bandeau d'anonymisation ;
//  2. `--nominatif` (opt-in explicite) rétablit noms et DA pour le diagnostic local.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(racine, 'scripts', 'valider-golden-master-trimestre.mjs');

const NOM_SENSIBLE = 'Tremblay';
const DA_COMPLET = '1234567';

let dossier, codexPath, refPath;

function lancer(args) {
    try {
        return execFileSync('node', [SCRIPT, ...args], { encoding: 'utf8', cwd: racine });
    } catch (e) {
        // Verdict ROUGE (exit 1) attendu sur la fixture minimale : le RAPPORT
        // est quand même produit, c'est lui qu'on audite.
        return String(e.stdout || '') + String(e.stderr || '');
    }
}

beforeAll(() => {
    dossier = mkdtempSync(path.join(tmpdir(), 'gm356-'));
    codexPath = path.join(dossier, 'codex.json');
    refPath = path.join(dossier, 'ref.csv');

    writeFileSync(codexPath, JSON.stringify({
        t1_groupesCours: [{ id: 'GC1', pratiqueId: 'P1' }],
        t1_pratiquesConfigurables: [{ id: 'P1', configuration: { type: 'standards' } }],
        t1_evaluationsSauvegardees: [],
        t1_productions: [],
        t1_groupeEtudiants: [{ da: DA_COMPLET, prenom: 'Marie', nom: NOM_SENSIBLE }]
    }));
    writeFileSync(refPath, [
        'DA;Groupe;Nom;Note finale conforme;Portfolio;Analyse;Remises;Plafonné;Note Omnivox;Écart',
        `${DA_COMPLET};1;Marie ${NOM_SENSIBLE};75.0;;;;;73.2;`
    ].join('\n'));
});

describe('#356 · sortie du golden master anonymisée par défaut', () => {
    it('par défaut : AUCUN nom, AUCUN DA complet — pseudonyme stable + DA masqué', () => {
        const sortie = lancer(['--codex', codexPath, '--reference', refPath, '--trimestre', 't1', '--verbeux']);

        expect(sortie).toContain('GOLDEN MASTER');           // le rapport est bien produit
        expect(sortie).not.toContain(NOM_SENSIBLE);          // pas de nom
        expect(sortie).not.toContain('Marie');               // pas de prénom
        expect(sortie).not.toContain(DA_COMPLET);            // pas de DA complet
        expect(sortie).toContain('Élève-001');               // pseudonyme stable
        expect(sortie).toContain('…567');                    // DA masqué (3 derniers)
        expect(sortie).toContain('sortie anonymisée');       // bandeau explicite
    });

    it('--nominatif (opt-in) : rétablit noms et DA pour le diagnostic local', () => {
        const sortie = lancer(['--codex', codexPath, '--reference', refPath, '--trimestre', 't1', '--verbeux', '--nominatif']);

        expect(sortie).toContain('GOLDEN MASTER');
        expect(sortie).toContain(NOM_SENSIBLE);
        expect(sortie).toContain(DA_COMPLET);
        expect(sortie).not.toContain('sortie anonymisée');
    });
});
