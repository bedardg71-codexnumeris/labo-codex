import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Tests B du plan Défense I — sanitisation profonde via `assainirObjet`
// + `SCHEMAS_IMPORT` (cf. PLAN §2.B + MODELE-MENACES §7 I-01 + Défense B).
// Préviennent C-01 (régression de la fonction de sanitisation) et C-02
// (IA qui retire un sous-schéma sans s'en rendre compte).

let win;
beforeAll(() => {
    win = chargerScript('js/import-export.js');
});

describe('Défense I · B · sanitisation profonde (assainirObjet + SCHEMAS_IMPORT)', () => {

    it('B.5 · échappe les balises HTML dans criteres[].nom d\'une grille', () => {
        const grilleAvecXss = {
            id: 'g_test',
            nom: 'Grille test',
            criteres: [
                {
                    id: 'c1',
                    nom: '<img src=x onerror=alert(1)>Critère 1',
                    description: 'Description normale',
                    ponderation: 50
                },
                {
                    id: 'c2',
                    nom: '<script>document.cookie</script>Critère 2',
                    description: 'Texte avec <b>gras</b> dans la description',
                    ponderation: 50
                }
            ],
            // Les champs avec un type 'string' sont aussi assainis.
            description: 'Grille <i>importée</i> par un attaquant'
        };

        const assaini = win.assainirObjet(grilleAvecXss, win.SCHEMAS_IMPORT.grille);

        expect(assaini.criteres).toHaveLength(2);
        for (const c of assaini.criteres) {
            expect(c.nom).not.toContain('<');
            expect(c.nom).not.toContain('>');
            expect(c.description).not.toContain('<');
            expect(c.description).not.toContain('>');
        }
        // Le texte hors balises est préservé
        expect(assaini.criteres[0].nom).toContain('Critère 1');
        expect(assaini.criteres[1].nom).toContain('Critère 2');
        // Champ scalaire de la grille aussi assaini
        expect(assaini.description).not.toContain('<');
    });

    it('B.6 · SCHEMAS_IMPORT.pratique inclut configuration et préserve le contenu', () => {
        // Vérification statique : le sous-schéma existe bien (régression
        // attrapée si quelqu'un retire ce champ par erreur). Sans ça, une
        // pratique passée par le pipeline ZIP perdrait silencieusement
        // sa configuration (typesTravaux, forfaits, portfolio…).
        expect(win.SCHEMAS_IMPORT.pratique.configuration).toBeDefined();
        expect(win.SCHEMAS_IMPORT.pratique.configuration.type).toBe('object');

        const pratiqueAvecConfig = {
            id: 'p_test',
            nom: 'Pratique test',
            type: 'pan-specifications',
            configuration: {
                typesTravaux: ['examen', 'maison'],
                forfaits: { reprise: 1, retard: 2 },
                portfolio: { actif: true, seuil: 60 }
            },
            criteres: [
                { id: 'CR_1', nom: 'C1', description: 'desc', ponderation: 100, essentiel: true }
            ]
        };

        const assaini = win.assainirObjet(pratiqueAvecConfig, win.SCHEMAS_IMPORT.pratique);

        // Configuration copiée brute (trade-off documenté ligne ~430)
        expect(assaini.configuration).toEqual({
            typesTravaux: ['examen', 'maison'],
            forfaits: { reprise: 1, retard: 2 },
            portfolio: { actif: true, seuil: 60 }
        });
        // Le critère a quand même été passé par son sous-schéma
        expect(assaini.criteres[0].id).toBe('CR_1');
    });

    it('B.7 · échappe les balises HTML dans tampon.nom et tampon.categorie', () => {
        const tamponAvecXss = {
            id: 't_test',
            nom: '<script>alert(1)</script>Excellent',
            fichier: 'tampon.png',
            categorie: '<img src=x onerror=alert(2)>Encouragement',
            imageBase64: 'data:image/png;base64,iVBORw0KG'
            // pas un payload : la défense O traite ce champ par re-encodage canvas
        };

        const assaini = win.assainirObjet(tamponAvecXss, win.SCHEMAS_IMPORT.tampon);

        expect(assaini.nom).not.toContain('<');
        expect(assaini.nom).not.toContain('>');
        expect(assaini.nom).toContain('Excellent');
        expect(assaini.categorie).not.toContain('<');
        expect(assaini.categorie).not.toContain('>');
        expect(assaini.categorie).toContain('Encouragement');
        // imageBase64 conservée (champ string mais long maxLen)
        expect(assaini.imageBase64).toBe('data:image/png;base64,iVBORw0KG');
    });

});
