import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =====================================================================
// SENTINELLE DU CHANTIER DU DÉMO — LES DEUX GARDES SANS CIBLE (relecture de 1.186.5, #1034 b)
// =====================================================================
//
// T5 (1.186.5) a appris à `verifierReferencesPasDemo` qu'une écriture DANS la démo (cible
// `demo_…`) peut désigner le matériel du pack. Deux appelants ne passaient pas la cible :
//   · pratiques-gestion.js, l'échelle d'une pratique ;
//   · trimestre-v2-groupes-cours.js, le groupe-cours (cours, horaire, enseignant, pratique),
//     qui passait en outre `cle('horaires')` à une garde qui applique cle() elle-même.
// Mesuré (lecture) : en démo, les modèles du pack portent `isDemo: true` (demo-namespace.js),
// les cours et enseignants du démo aussi dans les globaux (demo-activation.js), et les
// pratiques du pack ont l'id `demo-…` : les deux gardes refusaient le matériel du pack.
//
// CE QUE CE BANC JUGE : l'APPEL RÉEL de chaque site (extrait du fichier) est exécuté contre la
// vraie garde (js/bibliotheque-ui.js). En démo : aucun refus. Hors démo : le refus demeure.
// TÉMOINS : la cible retirée de l'appel, le refus revient en démo (rouge attendu).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** L'appel `BibliothequeUI.verifierReferencesPasDemo(...)` tel qu'écrit dans le fichier. */
function appelDuSite(fichier, apres) {
    const source = readFileSync(path.join(racine, fichier), 'utf8');
    const debut = source.indexOf('BibliothequeUI.verifierReferencesPasDemo([', source.indexOf(apres));
    if (debut === -1) throw new Error('appel introuvable dans ' + fichier);
    const fin = source.indexOf(');', source.indexOf(']', debut));
    return source.slice(debut, fin + 1);
}

function garde(trimestre) {
    const magasin = {
        [trimestre + '_echellesTemplates']: [{ id: 'ECH_DEMO_1', nom: 'Échelle du pack', isDemo: true }],
        [trimestre + '_horaires']: [{ id: 'HOR_1' }],
        cours: [{ id: 'demo-cours', isDemo: true }],
        enseignants: [{ id: 'ENS_DEMO', isDemo: true }],
        [trimestre + '_pratiquesConfigurables']: [{ id: 'demo-std-litt', auteur: 'Demo Labo Codex' }]
    };
    const cle = (nom) => (/^[a-z]\d{4}_|^demo_/.test(nom) || nom === 'cours' || nom === 'enseignants') ? nom : trimestre + '_' + nom;
    const db = { getSync: (k, d) => (k in magasin ? magasin[k] : d), setSync() {} };
    const win = chargerScript('js/bibliotheque-ui.js', { db, cle, notifications: { erreur() {} } });
    return { BibliothequeUI: win.BibliothequeUI, cle };
}

function executer(appel, trimestre, valeurs) {
    const { BibliothequeUI, cle } = garde(trimestre);
    const noms = Object.keys(valeurs);
    // eslint-disable-next-line no-new-func
    return new Function('BibliothequeUI', 'cle', ...noms, 'return ' + appel)(BibliothequeUI, cle, ...noms.map((n) => valeurs[n]));
}

const SITE_PRATIQUE = ['js/pratiques-gestion.js', 'async function sauvegarderConfigPratiqueMat('];
const SITE_GROUPE = ['js/trimestre-v2-groupes-cours.js', 'Phase 4.C : interdire les références à des items démo'];
const VALEURS_PRATIQUE = { echelleIdCourante: 'ECH_DEMO_1' };
const VALEURS_GROUPE = { coursId: 'demo-cours', horaireId: 'HOR_1', enseignantId: 'ENS_DEMO', pratiqueId: 'demo-std-litt' };

describe('l\'échelle d\'une pratique (pratiques-gestion.js)', () => {
    const appel = appelDuSite(...SITE_PRATIQUE);

    it('en démo, l\'échelle du pack n\'est pas refusée', () => {
        expect(executer(appel, 'demo', VALEURS_PRATIQUE)).toBeNull();
    });
    it('hors démo, elle l\'est toujours', () => {
        expect(executer(appel, 'a2026', VALEURS_PRATIQUE)).toMatchObject({ type: 'échelle' });
    });
    it('break-test : sans la cible, la démo refuse son propre pack (rouge attendu)', () => {
        const sansCible = appel.replace(/\], \{ cible: [^}]*\}\)/, '])');
        expect(sansCible).not.toBe(appel);
        expect(executer(sansCible, 'demo', VALEURS_PRATIQUE)).toMatchObject({ type: 'échelle' });
    });
});

describe('le groupe-cours (trimestre-v2-groupes-cours.js)', () => {
    const appel = appelDuSite(...SITE_GROUPE);

    it('en démo, le matériel du pack n\'est pas refusé', () => {
        expect(executer(appel, 'demo', VALEURS_GROUPE)).toBeNull();
    });
    it('hors démo, le refus demeure', () => {
        expect(executer(appel, 'a2026', VALEURS_GROUPE)).toMatchObject({ type: 'cours' });
    });
    it('la collection des horaires est passée en nom nu (plus de double préfixe)', () => {
        expect(appel).toContain("collection: 'horaires'");
        expect(appel).not.toContain("cle('horaires')");
    });
    it('break-test : sans la cible, la démo refuse son propre pack (rouge attendu)', () => {
        const sansCible = appel.replace(/\], \{ cible: [^}]*\}\)/, '])');
        expect(sansCible).not.toBe(appel);
        expect(executer(sansCible, 'demo', VALEURS_GROUPE)).not.toBeNull();
    });
});
