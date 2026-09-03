/**
 * Sentinelle — LES CODES PAR GRILLE, lot 3 : le gabarit (3 septembre 2026).
 *
 *   S.a le geste (`codesDepuisSousCriteres`) et la couleur d'un sous-critère
 *       VOYAGENT — partage et import — et les deux schémas restent fermés ;
 *   S.b `apercuCodes` montre ce que les sous-critères donneraient, geste ou non ;
 *   S.c les sources : la case porte les mots de Grégoire, son handler ne
 *       n'écrit jamais `false`, la colonne Couleur existe, le titre de l'écran
 *       de réglage ne dit plus la discipline, les jetons ont bougé.
 *
 * Le comportement à l'écran est éprouvé dans WebKit :
 * `tests/integration/codes-par-grille-gabarit.spec.js`.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

function grillePhilo() {
    return {
        id: 'GR_PHILO', nom: 'Grille de philosophie',
        criteres: [{
            id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20,
            codesDepuisSousCriteres: true,
            sousCriteres: [
                { id: 'sc_1', code: '1', nom: 'Thèse non dégagée',   ponderation: 1,   retroaction: 'La thèse doit être explicite.', couleur: '#123456' },
                { id: 'sc_2', code: '2', nom: 'Argument circulaire', ponderation: 0.5, retroaction: '' }
            ]
        }],
        dateCreation: '2026-09-03T00:00:00Z',
        dansBibliotheque: true,
        metadata_cc: { auteur_original: 'Test lot 3', licence: 'CC BY-NC-SA 4.0', contributeurs: [] }
    };
}

describe('codes par grille · S.a — le geste et la couleur voyagent, les schémas restent fermés', () => {
    let win, winIE;
    beforeAll(() => {
        const db = { getSync: (cle, defaut) => (defaut !== undefined ? defaut : null) };
        win = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-validation.js', { db }, win);
        chargerScript('js/partage-format.js', { db }, win);
    });
    beforeEach(() => { winIE = chargerScript('js/import-export.js'); });

    it('S.a.1 le PARTAGE transporte le geste ET la couleur', () => {
        const c = win.partageFormat.projeterEntite(grillePhilo(), 'grille').criteres[0];
        expect(c.codesDepuisSousCriteres).toBe(true);
        expect(c.sousCriteres[0].couleur).toBe('#123456');
        expect(c.sousCriteres[1].couleur).toBeUndefined();
    });

    it('S.a.2 l\'IMPORT transporte le geste ET la couleur', () => {
        const c = winIE.assainirObjet(grillePhilo(), winIE.SCHEMAS_IMPORT.grille).criteres[0];
        expect(c.codesDepuisSousCriteres).toBe(true);
        expect(c.sousCriteres[0].couleur).toBe('#123456');
    });

    it('S.a.3 les DEUX schémas restent FERMÉS — un champ étranger sur un sous-critère n\'entre pas', () => {
        const g = grillePhilo();
        g.criteres[0].sousCriteres[0].charge_utile = '<script>alert(1)</script>';
        g.criteres[0].tamponsDepuisSousCriteres = true;   // l'ancien nom, jamais écrit : refusé
        const partage = win.partageFormat.projeterEntite(g, 'grille').criteres[0];
        expect(partage.sousCriteres[0].charge_utile).toBeUndefined();
        expect(partage.tamponsDepuisSousCriteres).toBeUndefined();
        const imp = winIE.assainirObjet(g, winIE.SCHEMAS_IMPORT.grille).criteres[0];
        expect(imp.sousCriteres[0].charge_utile).toBeUndefined();
        expect(imp.tamponsDepuisSousCriteres).toBeUndefined();
    });

    it('S.a.4 déclarés des DEUX côtés, sous le même nom', () => {
        const sp = win.partageSchemas.SCHEMA_ENTITE.grille.champs.criteres.schema;
        expect(sp.codesDepuisSousCriteres).toBeDefined();
        expect(sp.sousCriteres.schema.couleur).toBeDefined();
        const si = winIE.SCHEMAS_IMPORT.grille.criteres.schema;
        expect(si.codesDepuisSousCriteres).toBeDefined();
        expect(si.sousCriteres.schema.couleur).toBeDefined();
    });
});

describe('codes par grille · S.b — l\'aperçu montre ce que les sous-critères donneraient', () => {
    it('S.b.1 geste ou non, le même aperçu ; la couleur choisie passe, la pondération 0 non', () => {
        const fenetre = {};
        chargerScript('js/evaluation-enonces.js', {}, fenetre);
        chargerScript('js/codes-annotation.js', { db: { getSync: (k, d) => d } }, fenetre);
        const m = fenetre.codesAnnotation;
        const critere = grillePhilo().criteres[0];
        critere.sousCriteres.push({ id: 'sc_0', code: '0', nom: 'Aucune erreur', ponderation: 0 });
        const avec = m.apercuCodes(critere);
        delete critere.codesDepuisSousCriteres;
        const sans = m.apercuCodes(critere);
        expect(sans).toEqual(avec);
        expect(avec.map(c => c.id)).toEqual(['errfr_1', 'errfr_2']);
        expect(avec[0].couleur).toBe('#123456');
        expect(avec[1].couleur).toBe(m.COULEURS_DEFAUT[1]);
        // Et la LISTE, elle, suit le geste.
        expect(m.listeCodes({ criteres: [critere] })).toHaveLength(10);
    });
});

describe('codes par grille · S.c — les sources du gabarit et de l\'écran de réglage', () => {
    const grilles = () => source('js/grilles.js');

    it('S.c.1 la case porte les mots de Grégoire et son handler est branché', () => {
        const s = grilles();
        expect(s).toContain('Utiliser ces sous-critères comme codes d\'annotation');
        expect(s).toMatch(/data-on-change="modifierCodesDepuisSousCriteresHandler"/);
        expect(s).toMatch(/window\.modifierCodesDepuisSousCriteresHandler = modifierCodesDepuisSousCriteresHandler/);
    });

    it('S.c.2 décocher RETIRE le champ — `false` ne s\'écrit jamais (absent = repli)', () => {
        const s = grilles();
        const h = s.slice(s.indexOf('async function modifierCodesDepuisSousCriteresHandler'), s.indexOf('function rendreBlocProjectionAlgo'));
        expect(h).toMatch(/delete critere\.codesDepuisSousCriteres/);
        expect(h).not.toMatch(/codesDepuisSousCriteres = false/);
    });

    it('S.c.3 chaque sous-critère a sa couleur, par le même handler que ses autres champs', () => {
        const s = grilles();
        expect(s).toMatch(/class="controle-form sous-critere-input-couleur"/);
        expect(s).toMatch(/data-champ="couleur"/);
        expect(s).toMatch(/type="color"/);
        expect(source('styles.css')).toMatch(/grid-template-columns: 80px 1fr 100px 64px auto;/);
    });

    it('S.c.4 l\'écran de réglage ne dit plus la discipline, et dit à quoi servent ses dix codes', () => {
        const s = source('js/travaux-outils.js');
        expect(s).toContain("Rétroactions — Codes d\\'annotation</h2>");
        expect(s).not.toMatch(/Erreurs de fran\\u00e7ais<\/h2>/);
        expect(s).toContain('Ces dix codes servent à toute copie dont la grille ne porte pas ses propres codes');
    });

    it('S.c.5 les jetons du lot ont bougé', () => {
        const html = source('index.html');
        expect(html).toMatch(/js\/grilles\.js\?v=20260903[f-z]/);
        expect(html).toMatch(/js\/partage-schemas\.js\?v=20260903/);
        expect(html).toMatch(/js\/import-export\.js\?v=20260903[c-z]/);
        expect(html).toMatch(/js\/codes-annotation\.js\?v=20260903[b-z]/);
        expect(html).toMatch(/styles\.css\?v=20260903[e-z]/);
    });
});
