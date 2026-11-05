import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// « + Ajouter des pages » garde une photo de téléphone droite (5 nov. 2026).
// `lireOrientationExif` décide si une image doit être redessinée avant jsPDF
// (`imagePourPDF`, js/travaux-import.js). Un 1 rendu à tort laisse la page
// couchée et étirée ; un autre chiffre rendu à tort recompresse une image droite.
// Le parcours entier (PDF relu après « Enregistrer ») est jugé par
// tests/integration/ajouter-pages-photo-droite.spec.js.

const win = chargerScript('js/travaux-import.js', {
    obtenirDonneesSelonMode: () => [],
    travauxStockage: {},
    db: { getSync: () => null, setSync: () => {} },
    notifications: { succes: () => {}, erreur: () => {}, info: () => {} }
});
const lire = (octets) => win.travauxImport.lireOrientationExif(new Uint8Array(octets));

const SOI = [0xFF, 0xD8];
const APP0_JFIF = [0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00];
const SOS = [0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00];

/** Segment APP1 « Exif » à une entrée ; `petit` = TIFF petit-boutiste (II). */
function app1(tag, valeur, petit) {
    const u16 = (v) => (petit ? [v & 0xFF, v >> 8] : [v >> 8, v & 0xFF]);
    const u32 = (v) => (petit ? [v & 0xFF, 0, 0, 0] : [0, 0, 0, v & 0xFF]);
    const tiff = [...(petit ? [0x49, 0x49] : [0x4D, 0x4D]), ...u16(0x2A), ...u32(8),
        ...u16(1), ...u16(tag), ...u16(3), ...u32(1), ...u16(valeur), 0, 0, ...u32(0)];
    const corps = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00, ...tiff];
    const longueur = corps.length + 2;
    return [0xFF, 0xE1, longueur >> 8, longueur & 0xFF, ...corps];
}

describe('lireOrientationExif — l\'orientation qu\'un PDF ne connaît pas', () => {
    it('lit l\'orientation 6 (téléphone tenu droit), TIFF gros-boutiste', () => {
        expect(lire([...SOI, ...app1(0x0112, 6, false), ...SOS])).toBe(6);
    });

    it('lit l\'orientation 8, TIFF petit-boutiste, derrière un segment JFIF', () => {
        expect(lire([...SOI, ...APP0_JFIF, ...app1(0x0112, 8, true), ...SOS])).toBe(8);
    });

    it('rend 3 (tête en bas) : toute valeur de 2 à 8 est rendue telle quelle', () => {
        expect(lire([...SOI, ...app1(0x0112, 3, true), ...SOS])).toBe(3);
    });

    it('rend 1 sans EXIF, sans balise Orientation, ou avec une valeur hors bornes', () => {
        expect(lire([...SOI, ...APP0_JFIF, ...SOS])).toBe(1);
        expect(lire([...SOI, ...app1(0x010F, 6, false), ...SOS])).toBe(1);   // une autre balise
        expect(lire([...SOI, ...app1(0x0112, 9, false), ...SOS])).toBe(1);
    });

    it('rend 1 pour ce qui n\'est pas un JPEG, et pour un en-tête tronqué', () => {
        expect(lire([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])).toBe(1);   // PNG
        expect(lire([])).toBe(1);
        const entier = [...SOI, ...app1(0x0112, 6, false)];
        expect(lire(entier.slice(0, entier.length - 8))).toBe(1);
    });

    it('ne lit pas au-delà du début de l\'image (SOS)', () => {
        expect(lire([...SOI, ...SOS, ...app1(0x0112, 6, false)])).toBe(1);
    });
});
