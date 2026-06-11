import { describe, it, expect, beforeAll } from 'vitest';
import JSZip from 'jszip';
import { chargerScript } from './_helpers/charger-script.js';

// Tests C.8 et C.9 du plan Défense I — validerZipSecurite
// (cf. PLAN §2.C + MODELE-MENACES §7 I-03 ZIP slip + D-04 ZIP bomb).
// Préviennent une régression si quelqu'un assouplit les checks de
// path traversal ou de taille décompressée.

let win;
beforeAll(() => {
    win = chargerScript('js/import-export.js');
});

describe('Défense I · C · validerZipSecurite', () => {

    it('C.8 · I-03 ZIP slip · entrée avec ../ rejetée', async () => {
        const zip = new JSZip();
        zip.file('../../../etc/passwd', 'evil-content');
        zip.file('legitime.json', '{"ok": true}');

        // Pour récupérer la structure interne `_data.uncompressedSize` que
        // la fonction lit, on doit générer puis re-charger. Mais le check
        // ../ se fait sur les noms de clés, présents dès le `file()`.
        const result = win.validerZipSecurite(zip);
        expect(result.valide).toBe(false);
        expect(result.erreur).toMatch(/path traversal/i);
        expect(result.erreur).toContain('../');
    });

    it('C.8 · I-03 chemin absolu commençant par / rejeté', () => {
        const zip = new JSZip();
        zip.file('/etc/passwd', 'evil-content');

        const result = win.validerZipSecurite(zip);
        expect(result.valide).toBe(false);
        expect(result.erreur).toMatch(/chemin absolu/i);
    });

    it('C.9 · D-04 ZIP bomb · taille décompressée > 2 Go rejetée', () => {
        // On simule directement la structure que la fonction inspecte.
        // Fabriquer un vrai ZIP qui se décompresse en 4 Go serait
        // intenable. Le risque est isolé : tout ce qui compte est que
        // la fonction lise bien `_data.uncompressedSize` et applique
        // le seuil 2 Go.
        const fauxZipBomb = {
            files: {
                'huge.bin': {
                    dir: false,
                    _data: { uncompressedSize: 4 * 1024 * 1024 * 1024 } // 4 Go
                }
            }
        };

        const result = win.validerZipSecurite(fauxZipBomb);
        expect(result.valide).toBe(false);
        expect(result.erreur).toMatch(/volumineux|2 Go/i);
    });

    it('C · ZIP légitime accepté', async () => {
        // Sanity check : un ZIP normal doit passer.
        const zip = new JSZip();
        zip.file('codex-manifeste.json', JSON.stringify({ version: 1 }));
        zip.file('travaux/photo.jpg', 'binary-data-placeholder');

        const result = win.validerZipSecurite(zip);
        expect(result.valide).toBe(true);
        expect(result.erreur).toBeNull();
    });

    // #334 session A — le pré-vol stockage consomme la taille décompressée.

    it('#334 A · expose tailleDecompressee avec la somme correcte', () => {
        const fauxZip = {
            files: {
                'donnees.json': { dir: false, _data: { uncompressedSize: 300 } },
                'travaux/a.jpg': { dir: false, _data: { uncompressedSize: 700 } },
                'travaux/': { dir: true, _data: { uncompressedSize: 999 } } // dossier : ignoré
            }
        };
        const result = win.validerZipSecurite(fauxZip);
        expect(result.valide).toBe(true);
        expect(result.tailleDecompressee).toBe(1000);
    });

    it('#334 A · D6 · tailleDecompressee vaut 0 quand _data.uncompressedSize est absent', () => {
        // JSZip ne garantit pas _data avant génération (MODELE-MENACES.md) —
        // 0 = « inconnu » pour le pré-vol, qui bascule sur taille ZIP × 3.
        const zip = new JSZip();
        zip.file('codex-manifeste.json', JSON.stringify({ version: 1 }));
        const result = win.validerZipSecurite(zip);
        expect(result.valide).toBe(true);
        expect(result.tailleDecompressee).toBe(0);
    });

});
