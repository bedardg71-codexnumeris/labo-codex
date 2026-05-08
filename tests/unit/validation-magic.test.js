import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Test C.10 du plan Défense I — validerMagicBytes
// (cf. PLAN §2.C + MODELE-MENACES §7 I-02 polyglotte image+JS).
// Préviennent une régression sur la liste des magic bytes acceptés
// ou sur le filet de sécurité « refuser sur erreur de lecture ».

let win;
beforeAll(() => {
    win = chargerScript('js/travaux-import.js');
});

describe('Défense I · C · validerMagicBytes', () => {

    it('C.10 · accepte un PDF authentique commençant par %PDF', async () => {
        const headerPDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
        const blob = new Blob([headerPDF], { type: 'application/pdf' });
        expect(await win.validerMagicBytes(blob)).toBe(true);
    });

    it('C.10 · accepte un PNG authentique', async () => {
        const headerPNG = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        const blob = new Blob([headerPNG], { type: 'image/png' });
        expect(await win.validerMagicBytes(blob)).toBe(true);
    });

    it('C.10 · I-02 · rejette un fichier HTML maquillé en image (pas de magic byte image)', async () => {
        // Cas d'école I-02 : un attaquant tente de faire passer un HTML
        // pour une image. Sans validation des magic bytes, le navigateur
        // pourrait deviner le contenu et exécuter le script.
        const html = '<html><script>parent.localStorage.clear()</script></html>';
        const blob = new Blob([html], { type: 'image/png' });
        expect(await win.validerMagicBytes(blob)).toBe(false);
    });

    it('C.10 · rejette un MP4 même s\'il a ftyp (brand non-image)', async () => {
        // ISO BMFF avec brand 'mp42' = vidéo MP4 — doit être rejeté.
        // Ce test couvre la branche des brands HEIF/HEIC qui acceptait
        // tout ftyp avant le fix de la validation par brand.
        const headerMP4 = new Uint8Array([
            0x00, 0x00, 0x00, 0x18,
            0x66, 0x74, 0x79, 0x70,        // 'ftyp' à offset 4
            0x6D, 0x70, 0x34, 0x32          // 'mp42' à offset 8
        ]);
        const blob = new Blob([headerMP4]);
        expect(await win.validerMagicBytes(blob)).toBe(false);
    });

    it('C.10 · accepte un HEIC authentique (brand image dans la whitelist)', async () => {
        const headerHEIC = new Uint8Array([
            0x00, 0x00, 0x00, 0x18,
            0x66, 0x74, 0x79, 0x70,        // 'ftyp'
            0x68, 0x65, 0x69, 0x63          // 'heic' à offset 8
        ]);
        const blob = new Blob([headerHEIC]);
        expect(await win.validerMagicBytes(blob)).toBe(true);
    });

});
