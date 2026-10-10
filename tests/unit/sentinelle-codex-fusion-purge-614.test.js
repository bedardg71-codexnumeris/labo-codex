import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerCodex } from './_helpers/charger-codex.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// #614 (S8 du plan « chaîne d'importation des travaux », 30 août 2026)
// Deux constats de l'audit du même jour, tous deux dans js/codex.js.
//
// S9 — `_fusionnerTravaux` stocke les blobs du codex externe SANS
//   `validerMagicBytes`, alors que le chemin « ouvrir » (:698-706) l'applique.
//   Un `travaux/FT_x.pdf` contenant du HTML, reçu d'un collègue, était stocké
//   puis servi par la visionneuse.
//
// S10 — le plan de purge #336 ne tient pour référencés que les ids trouvés
//   dans une clé `fichiersTravaux`. Les blobs de `corbeilleFichiers`
//   (conservés par `deplacerEnCorbeille`, restaurables) et de
//   `fichiersModelisation` étaient donc recensés « orphelins » : un
//   enseignant qui suivait la console détruisait sa corbeille restaurable.
//
// T8.1 (mesuré avant d'écrire ce fichier, l'audit ne l'avait pas relu) :
//   `modelisation.js` génère l'id :261, le pose dans les métadonnées :276 et
//   l'emploie comme clé de blob :290 — `fichiersModelisation` est bien un
//   tableau d'objets portant `id`. Idem pour la corbeille, qui copie l'entrée
//   de `fichiersTravaux` en conservant son `id` (travaux-stockage.js:965).

let blobsStockes;
let magicReponses;
let magicAppels;

const travauxStockageStub = {
    stockerBlob: async (id, blob, da, prod) => {
        blobsStockes.push({ id, blob, da, prod });
        return true;
    }
};

const travauxImportStub = {
    validerMagicBytes: async (blob) => {
        magicAppels.push(blob);
        return magicReponses.shift();
    }
};

const dbStub = {
    ready: true,
    init: async () => {},
    get: async (k, def = null) => def,
    set: async () => {},
    remove: async () => {},
    deleteBlob: async () => {},
    flush: async () => {},
    keys: async () => [],
    listBlobIds: async () => [],
    getSync: (k, def = null) => def,
    setSync: () => {},
    // #522 lot 5 : le site écrit par `db.modifier` ; même contrat (un `undefined` n'écrit rien).
    modifier: async (k, mutateur, def = null) => mutateur(def)
};

let Codex;
let CodexSansValidateur;
beforeAll(() => {
    Codex = chargerCodex(dbStub, {
        travauxStockage: travauxStockageStub,
        travauxImport: travauxImportStub
    }).Codex;
    // Même module, mais `window.travauxImport` absent : le cas « le script de
    // validation n'a pas été chargé ». Sert à fixer le comportement choisi.
    CodexSansValidateur = chargerCodex(dbStub, {
        travauxStockage: travauxStockageStub
    }).Codex;
});

function reset(reponsesMagic = []) {
    blobsStockes = [];
    magicAppels = [];
    magicReponses = reponsesMagic;
}

// ZIP externe minimal : chaque chemin rend un contenu distinct.
function zipStub(contenus) {
    return {
        file: (chemin) => (chemin in contenus
            ? { async: async () => contenus[chemin] }
            : null)
    };
}

const DONNEES_EXTERNES = {
    h2026_fichiersTravaux: [
        { id: 'FT_bon', etudiantDA: '1234567', productionId: 'P1' },
        { id: 'FT_piege', etudiantDA: '7654321', productionId: 'P2' }
    ]
};

describe('#614 · S9 — la fusion valide les octets avant de stocker', () => {

    it('un blob dont les magic bytes sont invalides n\'entre JAMAIS dans le store', async () => {
        reset([false]);
        const zip = zipStub({ 'travaux/FT_piege.pdf': '<html>pas un PDF</html>' });

        const stats = await Codex._fusionnerTravaux(
            zip, DONNEES_EXTERNES, ['travaux/FT_piege.pdf']
        );

        expect(blobsStockes).toEqual([]);          // le point qui compte
        expect(stats.importes).toBe(0);
        expect(stats.ignores).toBe(1);
        expect(stats.erreurs.length).toBe(1);
        expect(stats.erreurs[0]).toContain('travaux/FT_piege.pdf');
    });

    it('un blob valide est stocké, avec son DA et sa production', async () => {
        reset([true]);
        const zip = zipStub({ 'travaux/FT_bon.pdf': '%PDF-1.4 vrai' });

        const stats = await Codex._fusionnerTravaux(
            zip, DONNEES_EXTERNES, ['travaux/FT_bon.pdf']
        );

        expect(stats.importes).toBe(1);
        expect(stats.ignores).toBe(0);
        expect(stats.erreurs).toEqual([]);
        expect(blobsStockes.length).toBe(1);
        expect(blobsStockes[0].id).toBe('FT_bon');
        expect(blobsStockes[0].da).toBe('1234567');
        expect(blobsStockes[0].prod).toBe('P1');
    });

    it('un lot mixte : le valide passe, le piégé est refusé, le compte est exact', async () => {
        reset([true, false]);
        const zip = zipStub({
            'travaux/FT_bon.pdf': '%PDF-1.4 vrai',
            'travaux/FT_piege.pdf': '<html>pas un PDF</html>'
        });

        const stats = await Codex._fusionnerTravaux(
            zip, DONNEES_EXTERNES, ['travaux/FT_bon.pdf', 'travaux/FT_piege.pdf']
        );

        expect(stats.importes).toBe(1);
        expect(stats.ignores).toBe(1);
        expect(blobsStockes.map(b => b.id)).toEqual(['FT_bon']);
    });

    it('la validation est appelée AVANT le stockage, une fois par fichier', async () => {
        reset([true]);
        const zip = zipStub({ 'travaux/FT_bon.pdf': '%PDF-1.4 vrai' });
        await Codex._fusionnerTravaux(zip, DONNEES_EXTERNES, ['travaux/FT_bon.pdf']);
        expect(magicAppels.length).toBe(1);
        expect(magicAppels[0]).toBe('%PDF-1.4 vrai');
    });

    it('validateur non chargé → FAIL-CLOSED qui DIT pourquoi (arbitrage #614)', async () => {
        // Le chemin « ouvrir » (:698-706) est fail-open : il stocke quand le
        // module manque. Sur la fusion, un module de validation non chargé ne
        // peut pas valoir « validation réussie » — on refuse, et le message
        // nomme la cause au lieu de laisser croire à un fichier corrompu.
        reset([]);
        const zip = zipStub({ 'travaux/FT_bon.pdf': '%PDF-1.4 vrai' });

        const stats = await CodexSansValidateur._fusionnerTravaux(
            zip, DONNEES_EXTERNES, ['travaux/FT_bon.pdf']
        );

        expect(blobsStockes).toEqual([]);
        expect(stats.importes).toBe(0);
        expect(stats.ignores).toBe(1);
        expect(stats.erreurs.join(' ')).toMatch(/validation impossible/i);
    });

});

describe('#614 · S10 — la purge ne recense ni la corbeille ni la modélisation', () => {

    it('les blobs de la CORBEILLE ne sont pas des orphelins (restaurables)', () => {
        const donnees = {
            h2026_fichiersTravaux: [{ id: 'F_ACTIF' }],
            h2026_corbeilleFichiers: [{ id: 'F_CORBEILLE', dateSuppression: '2026-08-01' }]
        };
        const plan = Codex._planifierPurgeEspace(donnees, [], ['F_ACTIF', 'F_CORBEILLE']);
        expect(plan.blobsOrphelins).toEqual([]);
    });

    it('les blobs de la MODÉLISATION ne sont pas des orphelins', () => {
        const donnees = {
            h2026_fichiersTravaux: [{ id: 'F_ACTIF' }],
            h2026_fichiersModelisation: [{ id: 'FM_carte' }]
        };
        const plan = Codex._planifierPurgeEspace(donnees, [], ['F_ACTIF', 'FM_carte']);
        expect(plan.blobsOrphelins).toEqual([]);
    });

    it('un blob RÉELLEMENT orphelin reste recensé (le correctif ne blanchit pas tout)', () => {
        const donnees = {
            h2026_fichiersTravaux: [{ id: 'F_ACTIF' }],
            h2026_corbeilleFichiers: [{ id: 'F_CORBEILLE' }],
            h2026_fichiersModelisation: [{ id: 'FM_carte' }]
        };
        const plan = Codex._planifierPurgeEspace(
            donnees, [], ['F_ACTIF', 'F_CORBEILLE', 'FM_carte', 'VIEUX_RESIDU']
        );
        expect(plan.blobsOrphelins).toEqual(['VIEUX_RESIDU']);
    });

    it('corbeille et modélisation de TOUS les trimestres du codex sont couvertes', () => {
        const donnees = {
            h2026_fichiersTravaux: [{ id: 'F1' }],
            h2026_corbeilleFichiers: [{ id: 'C_H2026' }],
            a2025_corbeilleFichiers: [{ id: 'C_A2025' }],
            a2025_fichiersModelisation: [{ id: 'FM_A2025' }]
        };
        const plan = Codex._planifierPurgeEspace(
            donnees, [], ['F1', 'C_H2026', 'C_A2025', 'FM_A2025', 'ORPHELIN']
        );
        expect(plan.blobsOrphelins).toEqual(['ORPHELIN']);
    });

    it('corbeille non-tableau ou entrées sans id → tolérées sans crash', () => {
        const donnees = {
            h2026_fichiersTravaux: [{ id: 'F1' }],
            h2026_corbeilleFichiers: 'pas-un-tableau',
            h2026_fichiersModelisation: [null, {}, { id: 'FM_OK' }]
        };
        const plan = Codex._planifierPurgeEspace(donnees, [], ['F1', 'FM_OK', 'AUTRE']);
        expect(plan.blobsOrphelins).toEqual(['AUTRE']);
    });

    it('le recensement ne touche PAS le filtre des clés orphelines', () => {
        // S10 ne concerne que les blobs. Une clé de corbeille d'un ancien
        // trimestre absent du codex reste une clé orpheline.
        const donnees = { h2026_fichiersTravaux: [{ id: 'F1' }] };
        const plan = Codex._planifierPurgeEspace(
            donnees, ['h2026_fichiersTravaux', 'a2024_corbeilleFichiers'], []
        );
        expect(plan.clesOrphelines).toEqual(['a2024_corbeilleFichiers']);
    });

});

describe('#614 · sentinelle statique — ce que le fichier doit continuer de dire', () => {

    const src = readFileSync(path.join(racine, 'js/codex.js'), 'utf8');
    // Les commentaires mentent dans les deux sens : on assert sur du code.
    const codeSeul = src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .map((l) => l.replace(/\/\/.*$/, ''))
        .join('\n');

    function corpsDe(nom) {
        const i = codeSeul.indexOf('async function ' + nom);
        expect(i).toBeGreaterThan(-1);
        const j = codeSeul.indexOf('\n}', i);
        return codeSeul.slice(i, j);
    }

    it('_fusionnerTravaux appelle validerMagicBytes', () => {
        expect(corpsDe('_fusionnerTravaux')).toMatch(/validerMagicBytes/);
    });

    it('la validation précède le stockage dans le corps de la fusion', () => {
        const corps = corpsDe('_fusionnerTravaux');
        expect(corps.indexOf('validerMagicBytes'))
            .toBeLessThan(corps.indexOf('stockerBlob'));
    });

    it('le recensement de purge nomme les trois familles de références', () => {
        const i = codeSeul.indexOf('function _planifierPurgeEspace');
        const j = codeSeul.indexOf('\n}', i);
        const corps = codeSeul.slice(i, j);
        // #1014 (2 oct. 2026) : la liste vit dans une constante du module, que le codex emploie aussi
        // pour emporter et rendre les fichiers. Le recensement la lit ; la constante nomme les trois.
        expect(corps).toMatch(/LISTES_DE_FICHIERS\.some\(/);
        const constante = codeSeul.match(/const LISTES_DE_FICHIERS = \[([^\]]*)\];/);
        expect(constante, 'la constante des listes de fichiers existe').not.toBeNull();
        expect(constante[1]).toMatch(/'fichiersTravaux'/);
        expect(constante[1]).toMatch(/'corbeilleFichiers'/);
        expect(constante[1]).toMatch(/'fichiersModelisation'/);
    });

    it('la garde blobStatut du chemin « ouvrir » est intacte (hors périmètre #614)', () => {
        // Vérifié au code le 30 août : `_fusionnerTravaux` itère sur les
        // chemins RÉELLEMENT présents dans le ZIP, donc un `exporte` n'y entre
        // jamais — cas structurellement absent, pas gardé. La garde ci-dessous
        // appartient au chemin « ouvrir » et ne doit pas être déplacée ici.
        // #1028 : la garde porte aussi les copies aux archives ; « exporte » reste gardé.
        expect(codeSeul).toMatch(/var blobAttendu = f\.blobStatut !== 'exporte'( && !auxArchives\[f\.id\])?;/);
        expect(corpsDe('_fusionnerTravaux')).not.toMatch(/blobStatut/);
    });

});
