import { describe, it, expect, beforeEach } from 'vitest';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #329 Voûte Phase 1 · lot P2 — sentinelles du pipeline d'export.
// Couvre : résolution des entités dans leurs collections RÉELLES par type
// (y compris l'ancrage cartouches_{grilleId} et les clés namespacées
// productions/pratiques), le contrat de nommage #262 (extension .lcz,
// licence, précision minute), et l'aller-retour du conteneur .lcz avec le
// VRAI JSZip (libs/jszip.min.js, le même qu'en production).
// La modale de confirmation et le téléchargement (DOM) sont couverts au
// terrain par _testPartageExportP2() et le seront en Playwright avec P3.

const requireCjs = createRequire(import.meta.url);
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const JSZip = requireCjs(path.join(racine, 'libs', 'jszip.min.js'));

function fauxDb(donnees) {
    return {
        getSync(k, defaut = null) {
            return Object.prototype.hasOwnProperty.call(donnees, k) ? donnees[k] : defaut;
        }
    };
}

let appelsNomFichier;

function charger(donnees) {
    appelsNomFichier = [];
    const db = fauxDb(donnees);
    const w = chargerScript('js/partage-export.js', {
        db,
        JSZip,
        getCleProductions: () => 'h2026_productions',
        genererNomFichierExport: (type, options) => {
            appelsNomFichier.push({ type, options });
            return `${type}-test${options.extension}`;
        }
    });
    w.cle = (k) => 'h2026_' + k;
    return w;
}

describe('lot P2 · sentinelle exports', () => {
    it('expose l\'API attendue sur window.partageExport', () => {
        const w = charger({});
        ['exporterPourPartager', 'resoudreEntite', 'genererLcz', 'nomFichierLcz'].forEach(nom => {
            expect(w.partageExport[nom], nom).toBeTypeOf('function');
        });
        expect(w.partageExport.NOM_FICHIER_PACKAGE).toBe('package.json');
    });
});

describe('lot P2 · résolution des entités par type', () => {
    it('grille : trouvée dans cle(grillesTemplates), puis repli sur bibliothequeGrilles', () => {
        // #358 Brique D : la résolution d'export cible la copie namespacée du trimestre
        // actif (w.cle = k => 'h2026_'+k) avant le catalogue de gabarits.
        const w = charger({
            h2026_grillesTemplates: [{ id: 'G1', nom: 'Grille perso' }],
            bibliothequeGrilles: [{ id: 'G2', nom: 'Grille pool' }]
        });
        expect(w.partageExport.resoudreEntite('grille', 'G1').nom).toBe('Grille perso');
        expect(w.partageExport.resoudreEntite('grille', 'G2').nom).toBe('Grille pool');
        expect(w.partageExport.resoudreEntite('grille', 'G3')).toBeNull();
    });

    it('echelle : cle(echellesTemplates)', () => {
        const w = charger({ h2026_echellesTemplates: [{ id: 'E1', nom: 'Échelle' }] });
        expect(w.partageExport.resoudreEntite('echelle', 'E1').nom).toBe('Échelle');
    });

    it('production : clé namespacée via getCleProductions, repli bibliothequeProductions', () => {
        const w = charger({
            h2026_productions: [{ id: 'P1', titre: 'Dissertation' }],
            bibliothequeProductions: [{ id: 'P2', titre: 'Pool' }]
        });
        expect(w.partageExport.resoudreEntite('production', 'P1').titre).toBe('Dissertation');
        expect(w.partageExport.resoudreEntite('production', 'P2').titre).toBe('Pool');
    });

    it('pratique : clé namespacée pratiquesConfigurables via cle(), repli bibliothequePratiques', () => {
        const w = charger({
            h2026_pratiquesConfigurables: [{ id: 'PR1', nom: 'STD perso' }],
            bibliothequePratiques: [{ id: 'PR2', nom: 'PAN pool' }]
        });
        expect(w.partageExport.resoudreEntite('pratique', 'PR1').nom).toBe('STD perso');
        expect(w.partageExport.resoudreEntite('pratique', 'PR2').nom).toBe('PAN pool');
    });

    it('cartouche : ancrage cartouches_{grilleId} avec contexte, balayage sans contexte', () => {
        const w = charger({
            grillesTemplates: [{ id: 'G1' }, { id: 'G2' }],
            // ⚠ CLÉ MIGRÉE PAR S5/#623 LE 31 AOÛT 2026 : semée nue, elle vivait dans
            // une case que `resoudreEntite` ne lit plus (routage par `cle(...)`,
            // stub `h2026_` + k, l.42). Les deux chemins du cas — ancrage par
            // grilleId ET balayage sans contexte — doivent la retrouver ici.
            h2026_cartouches_G2: [{ id: 'C1', nom: 'Cartouche', grilleId: 'G2' }]
        });
        expect(w.partageExport.resoudreEntite('cartouche', 'C1', 'G2').nom).toBe('Cartouche');
        expect(w.partageExport.resoudreEntite('cartouche', 'C1').nom).toBe('Cartouche'); // scan
        expect(w.partageExport.resoudreEntite('cartouche', 'C1', 'G1')).toBeNull(); // mauvais contexte
    });

    it('type inconnu → null, jamais d\'exception', () => {
        const w = charger({});
        expect(w.partageExport.resoudreEntite('trimestre', 'X')).toBeNull();
    });
});

describe('lot P2 · nommage du fichier (#262)', () => {
    it('délègue à genererNomFichierExport avec .lcz, licence et précision minute', () => {
        const w = charger({});
        const nom = w.partageExport.nomFichierLcz('grille', { nom: 'Ma grille' });
        expect(nom).toBe('grille-test.lcz');
        expect(appelsNomFichier[0]).toEqual({
            type: 'grille',
            options: { nom: 'Ma grille', extension: '.lcz', inclureLicence: true, precisionDate: 'minute' }
        });
    });

    it('production : repli sur titre quand nom absent', () => {
        const w = charger({});
        w.partageExport.nomFichierLcz('production', { titre: 'Dissertation' });
        expect(appelsNomFichier[0].options.nom).toBe('Dissertation');
    });
});

describe('lot P2 · conteneur .lcz (vrai JSZip de libs/)', () => {
    it('aller-retour : package.json à la racine, contenu intact octet pour octet', async () => {
        const w = charger({});
        const pkg = {
            format: 'labo-codex-partage-v1',
            manifest: { auteur: { nom: 'Tést àccents' }, signature: 'sig' },
            entites: { grilles: [{ id: 'G1', nom: 'Grille — éàç' }] }
        };
        const blob = await w.partageExport.genererLcz(pkg);
        expect(blob.size).toBeGreaterThan(0);

        // JSZip (UMD) ne reconnaît pas le Blob de Node — ArrayBuffer, comme P3 le fera.
        const zip = await JSZip.loadAsync(await blob.arrayBuffer());
        const fichiers = Object.keys(zip.files);
        expect(fichiers).toEqual(['package.json']); // rien d'autre dans le conteneur v1
        const relu = JSON.parse(await zip.file('package.json').async('string'));
        expect(relu).toEqual(pkg);
    });
});
