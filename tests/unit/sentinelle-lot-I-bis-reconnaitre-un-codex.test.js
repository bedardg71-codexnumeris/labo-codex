import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { chargerCodex } from './_helpers/charger-codex.js';

// SENTINELLE — LOT I BIS, CORRECTION 1 (1er oct. 2026) : RECONNAÎTRE UN CODEX SANS LE LIRE.
//
// La case « Ouvrir un Codex » de Réglages › Données confie un codex au chemin du menu Codex.
// Pour savoir à qui confier le fichier, `Codex.estUnFichierDeCodex` ne lit que le répertoire
// central du ZIP (par `ReserveVerifier.lireRepertoireZip`, le lecteur du lot A2). Trois
// réponses, et la case agit différemment sur chacune :
//   true  → le fichier part au codex, avant la limite de taille et sans lecture complète ;
//   false → la case le lit comme avant (configuration partagée, ancien fichier de données) ;
//   null  → illisible par ce moyen : la case le lit comme avant, et son filet (JSZip) reconnaît
//           encore un codex.
//
// Ce banc juge la table de vérité. Le geste entier, la limite de 1 Go et le filet sont jugés au
// navigateur : tests/integration/lot-i-bis-la-case-ouvre-un-codex.spec.js.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Le vrai lecteur de répertoire, dans un bac à sable : il ne touche à rien au chargement. */
function chargerLecteur() {
    const win = {};
    const code = readFileSync(path.join(racine, 'js/reserve-verifier.js'), 'utf8');
    new Function('window', 'document', '"use strict";\n' + code)(win, { readyState: 'loading', getElementById: () => null });
    return win.ReserveVerifier;
}

async function zipDe(entrees) {
    const zip = new JSZip();
    for (const [nom, contenu] of Object.entries(entrees)) zip.file(nom, contenu);
    return new Blob([await zip.generateAsync({ type: 'uint8array' })]);
}

let win;
beforeAll(() => {
    win = chargerCodex();
    win.ReserveVerifier = chargerLecteur();
});

describe('Lot I bis : reconnaître un codex par le répertoire de son ZIP', () => {
    it('le harnais lit de vrais ZIP (garde de non-vide)', async () => {
        const blob = await zipDe({ 'codex-manifeste.json': '{}', 'donnees.json': '{}', 'travaux/FT_BANC_1.bin': 'copie' });
        const noms = (await win.ReserveVerifier.lireRepertoireZip(blob)).map((e) => e.nom);
        expect(noms).toEqual(expect.arrayContaining(['codex-manifeste.json', 'donnees.json', 'travaux/FT_BANC_1.bin']));
        expect(typeof win.Codex.ouvrirFichier).toBe('function');
    });

    it('true : le manifeste d\'un codex, sous son nom courant ou sous l\'ancien', async () => {
        expect(await win.Codex.estUnFichierDeCodex(await zipDe({ 'donnees.json': '{}', 'travaux/a.bin': 'x', 'codex-manifeste.json': '{}' }))).toBe(true);
        expect(await win.Codex.estUnFichierDeCodex(await zipDe({ 'classeur-manifeste.json': '{}', 'donnees.json': '{}' }))).toBe(true);
    });

    it('false : un ZIP lisible sans manifeste, ou dont le nom n\'est pas EXACTEMENT celui du manifeste', async () => {
        // Un ancien fichier de données, une configuration partagée.
        expect(await win.Codex.estUnFichierDeCodex(await zipDe({ 'donnees.json': '{}', 'travaux/a.bin': 'x' }))).toBe(false);
        // Le manifeste se lit à la racine, sous son nom entier (ce que fait `zip.file(nom)` dans validerCodex).
        expect(await win.Codex.estUnFichierDeCodex(await zipDe({ 'dossier/codex-manifeste.json': '{}', 'donnees.json': '{}' }))).toBe(false);
        expect(await win.Codex.estUnFichierDeCodex(await zipDe({ 'codex-manifeste.json.bak': '{}', 'donnees.json': '{}' }))).toBe(false);
    });

    it('null : ce que le lecteur de répertoire ne sait pas lire, la case le lira elle-même', async () => {
        // Pas un ZIP (assez long pour qu'une clôture y soit cherchée), et trop court pour en être un.
        expect(await win.Codex.estUnFichierDeCodex(new Blob(['{"ceci": "est un fichier de données, pas un ZIP"}']))).toBeNull();
        expect(await win.Codex.estUnFichierDeCodex(new Blob(['court']))).toBeNull();
        // Un vrai codex précédé d'octets étrangers : le répertoire n'est plus où la clôture le dit.
        const codex = await zipDe({ 'codex-manifeste.json': '{}', 'donnees.json': '{}' });
        expect(await win.Codex.estUnFichierDeCodex(codex)).toBe(true);
        expect(await win.Codex.estUnFichierDeCodex(new Blob(['octets devant', codex]))).toBeNull();
    });

    it('null aussi si le lecteur de répertoire manque : la case garde son filet', async () => {
        const sans = chargerCodex();
        expect(sans.ReserveVerifier).toBeUndefined();
        expect(await sans.Codex.estUnFichierDeCodex(await zipDe({ 'codex-manifeste.json': '{}', 'donnees.json': '{}' }))).toBeNull();
    });
});
