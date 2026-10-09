import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #585 (9 oct. 2026) — `assainirChaine` retire les balises AVANT de
// tronquer (décision de Grégoire du 28 août, option B).
//
// Dans l'ordre inverse, une balise coupée par `maxLen` perdait son `>` et le
// filtre `/<[^>]*>/` ne mordait plus : la charge traversait l'import, amputée
// mais ouverte. La fonction sert à TOUS les schémas d'import (`SCHEMAS_IMPORT`) :
// le banc la tient seule (A), puis à travers un schéma réel (B), et vérifie
// que l'inversion ne change rien à une chaîne sans balise (C).

let win;
beforeEach(() => { win = chargerScript('js/import-export.js'); });

describe('#585 · A — une balise que la troncature couperait ne traverse plus', () => {
    it('A.a la charge mesurée à la fiche (29 car., maxLen 20) ressort sans `<`', () => {
        const sortie = win.assainirChaine('<img src=x onerror=alert(1)>M', 20);
        expect(sortie).not.toContain('<');
        expect(sortie).toBe('M');
    });

    it('A.b la coupure tombe au milieu de la balise, texte avant et après', () => {
        // maxLen 15 : dans l'ancien ordre, « Note finale <b » restait.
        const sortie = win.assainirChaine('Note finale <b onclick=x>A</b> suite', 15);
        expect(sortie).not.toContain('<');
        expect(sortie).toBe('Note finale A s');
    });

    it('A.c la longueur reste bornée par maxLen après le retrait', () => {
        const sortie = win.assainirChaine('<i>' + 'x'.repeat(40) + '</i>', 20);
        expect(sortie).toBe('x'.repeat(20));
    });
});

describe('#585 · B — à travers un schéma d\'import réel', () => {
    it('B.a un repère d\'échelle (maxLen 20) porteur d\'une balise longue est assaini', () => {
        const hostile = {
            id: 'ECH_TEST',
            nom: 'Échelle fictive',
            seuilMaitrise: '<img src=x onerror=alert(1)>M'
        };
        const apres = win.assainirObjet(hostile, win.SCHEMAS_IMPORT.echelle);
        expect(apres.seuilMaitrise).not.toContain('<');
        expect(apres.seuilMaitrise).toBe('M');
    });

    it('B.b le code d\'un niveau (maxLen 20) aussi', () => {
        const hostile = {
            id: 'ECH_TEST',
            nom: 'Échelle fictive',
            niveaux: [{ code: '<img src=x onerror=alert(1)>I', nom: 'Incomplet' }]
        };
        const apres = win.assainirObjet(hostile, win.SCHEMAS_IMPORT.echelle);
        expect(apres.niveaux[0].code).not.toContain('<');
        expect(apres.niveaux[0].code).toBe('I');
    });
});

describe('#585 · C — rien ne change pour une chaîne sans balise', () => {
    it('C.a texte court, accents et esperluette inchangés', () => {
        expect(win.assainirChaine('Clarté & précision', 50)).toBe('Clarté & précision');
    });

    it('C.b texte long tronqué au même endroit qu\'avant', () => {
        const texte = 'abcdefghij'.repeat(5);
        expect(win.assainirChaine(texte, 20)).toBe(texte.substring(0, 20));
    });

    it('C.c une valeur non textuelle donne une chaîne vide', () => {
        expect(win.assainirChaine(42, 20)).toBe('');
        expect(win.assainirChaine(null, 20)).toBe('');
    });
});
