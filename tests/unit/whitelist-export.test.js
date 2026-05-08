import { describe, it, expect, beforeAll } from 'vitest';
import JSZip from 'jszip';
import { chargerScript } from './_helpers/charger-script.js';

// Tests D.11 et D.12 du plan Défense I — whitelist de structure des
// exports (cf. PLAN §2.D + MODELE-MENACES §X-02 + Défense K).
// Préviennent une régression où une fonction d'export aurait été
// patchée pour injecter un fichier annexe (inventaire.dat, secret.txt)
// transportant des données identifiantes hors du scope attendu.

let win;
beforeAll(() => {
    win = chargerScript('js/securite-export-validation.js');
});

describe('Défense I · D · whitelist export (Défense K)', () => {

    it('D.11 · export codex · ZIP légitime accepté', () => {
        const zip = new JSZip();
        zip.file('donnees.json', '{"ok": true}');
        zip.file('codex-manifeste.json', '{}');
        zip.file('travaux/photo_da1234567.jpg', 'placeholder');

        // validerExportCodex throw si une entrée est hors whitelist.
        // Ici tout est conforme.
        expect(() => win.SecuriteExportValidation.validerExportCodex(zip)).not.toThrow();
    });

    it('D.11 · export codex · ZIP avec entrée pirate (inventaire.dat) rejeté', () => {
        const zip = new JSZip();
        zip.file('donnees.json', '{"ok": true}');
        zip.file('codex-manifeste.json', '{}');
        // Entrée non whitelistée — simulerait un payload qui aurait
        // patché la fonction d'export pour exfiltrer en clair.
        zip.file('inventaire.dat', 'donnees-exfiltrees');

        expect(() => win.SecuriteExportValidation.validerExportCodex(zip))
            .toThrow(/codex bloqué.*hors whitelist/s);
    });

    it('D.12 · export archive · ZIP légitime accepté', () => {
        const zip = new JSZip();
        zip.file('manifeste-archives.json', '{}');
        zip.file('trimestres/h2026/donnees.json', '{}');
        zip.file('trimestres/h2026/meta.json', '{}');
        zip.file('trimestres/h2026/travaux/photo.jpg', 'placeholder');

        expect(() => win.SecuriteExportValidation.validerExportReserve(zip)).not.toThrow();
    });

    it('D.12 · export archive · ZIP avec chemin hors whitelist rejeté', () => {
        const zip = new JSZip();
        zip.file('manifeste-archives.json', '{}');
        // Tentative d'inclure des données hors de l'arbo trimestres/
        zip.file('secret/identifiants.json', 'a=b');

        expect(() => win.SecuriteExportValidation.validerExportReserve(zip))
            .toThrow(/archive.*hors whitelist/s);
    });

    it('D · validerClesObjet · clé pirate à la racine rejetée', () => {
        const payloadPirate = {
            type: 'export-tampons',
            version: 1,
            dateExport: '2026-05-08',
            tampons: [],
            metadata_cc: {},
            // Clé inattendue → doit être rejetée
            __exfil: 'donnees-secretes'
        };
        expect(() => win.SecuriteExportValidation.validerExportTampons(payloadPirate))
            .toThrow(/__exfil/);
    });

});
