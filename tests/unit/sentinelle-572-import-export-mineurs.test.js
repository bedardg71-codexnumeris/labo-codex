import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #572 (28 août 2026) — volets Import et Export du condensé de l'audit.
// Chaque défaut est petit ; aucun n'est visible quand il se produit.
//
// IMPORT
//   · fuite de `setInterval` : un timer à 200 ms ajouté à CHAQUE ouverture du
//     poste de préparation, jamais arrêté.
//   · `new Date('AAAA-MM-JJ')` est parsé en UTC par la spec : à Toronto la date
//     saisie reculait d'un jour.
//   · `appliquerJetonsReprisePostImport` balayait TOUS les fichiers du trimestre
//     (`obtenirFichiersTravaux`), donc appliquait des jetons de reprise à des
//     élèves d'un autre groupe-cours que celui où l'on venait d'importer.
//
// EXPORT
//   · noms de dossiers ZIP non assainis : un « / » dans un nom d'élève créait une
//     arborescence au lieu d'un dossier.
//   · fichier SANS extension : le nom annoté était identique à l'original, donc
//     la version annotée écrasait la copie de l'élève dans l'archive.
//   · barres de progression jamais remises à zéro : l'export suivant démarrait
//     sur une barre pleine.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. retirer le `clearInterval` d'ouverture → « le timer précédent est arrêté ».
//   2. rendre `new Date(dateStr)` à changerDateFichier → « la date reste locale ».
//   3. rendre `obtenirFichiersTravaux()` au balayage → « restreint au groupe ».
//   4. rendre `nom + '_annote'` sans le cas « pas de point » → « fichier sans
//      extension » rougit.
//   5. retirer un appel à `_reinitialiserBarreProgression` → « barre remise à 0 ».

function sansCommentaires(txt) {
    return txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

const srcPrep = sansCommentaires(readFileSync(path.join(racineProjet, 'js', 'travaux-preparation.js'), 'utf8'));
const srcUI = sansCommentaires(readFileSync(path.join(racineProjet, 'js', 'travaux-ui.js'), 'utf8'));
const srcArch = sansCommentaires(readFileSync(path.join(racineProjet, 'js', 'travaux-archivage.js'), 'utf8'));

function monterArchivage() {
    const win = chargerScript('js/travaux-archivage.js', {
        db: { get: async () => null, getSync: (_k, d) => d, set: async () => {}, setSync: () => {} },
        cle: (k) => k,
        obtenirDonneesSelonMode: () => [],
        sauvegarderDonneesSelonMode: () => true,
        obtenirTrimestreActif: () => null,
        travauxStockage: {}, travauxResolution: {}, travauxExportPDF: {},
        alert: () => {}, JSZip: function () {}
    }, { addEventListener: () => {}, removeEventListener: () => {} });
    return win.travauxArchivage;
}

describe('#572 Export · les noms de dossiers ZIP ne créent plus d’arborescence', () => {
    const a = () => monterArchivage()._assainirSegmentChemin;

    it('un « / » dans un nom d’élève ne crée plus de sous-dossier', () => {
        const r = a()('Roy/Tremblay_Anne_123456');
        expect(r).not.toContain('/');
        expect(r).toContain('Roy');
        expect(r).toContain('Tremblay');
    });

    it('les autres séparateurs et interdits sont neutralisés', () => {
        expect(a()('a\\b')).not.toContain('\\');
        expect(a()('a:b')).not.toContain(':');
        expect(a()('a?b')).not.toContain('?');
    });

    it('« .. » ne peut pas remonter l’arborescence', () => {
        expect(a()('..')).toBe('sans-nom');
        expect(a()('.')).toBe('sans-nom');
    });

    it('un segment vide devient un nom sûr plutôt qu’un chemin cassé', () => {
        expect(a()('')).toBe('sans-nom');
        expect(a()(null)).toBe('sans-nom');
    });

    it('contrôle : les accents d’un nom d’élève sont CONSERVÉS', () => {
        // C'est un dossier lu par un humain : pas d'ASCII-fication punitive.
        expect(a()('Gagnon_Noémie_123')).toBe('Gagnon_Noémie_123');
    });
});

describe('#572 Export · la version annotée n’écrase plus la copie de l’élève', () => {
    const n = () => monterArchivage()._nomVersionAnnotee;

    it('fichier SANS extension : le nom annoté reste DISTINCT de l’original', () => {
        // Le cœur du défaut : l'ancien calcul rendait 'copie' pour 'copie'.
        expect(n()('copie')).toBe('copie_annote');
        expect(n()('copie')).not.toBe('copie');
    });

    it('fichier avec extension : le suffixe se place avant l’extension', () => {
        expect(n()('devoir.pdf')).toBe('devoir_annote.pdf');
    });

    it('nom à points multiples : seule la vraie extension est préservée', () => {
        expect(n()('devoir.v2.final.pdf')).toBe('devoir.v2.final_annote.pdf');
    });

    it('fichier caché sans extension : suffixé, jamais confondu', () => {
        const r = n()('.gitkeep');
        expect(r).not.toBe('.gitkeep');
        expect(r).toContain('_annote');
    });
});

describe('#572 Export · les barres de progression repartent de zéro', () => {
    it('les deux exports réinitialisent leur barre avant de commencer', () => {
        expect(srcArch).toContain("function _reinitialiserBarreProgression");
        expect(srcArch).toContain("_reinitialiserBarreProgression('travaux-barre-progression',");
        expect(srcArch).toContain("_reinitialiserBarreProgression('travaux-barre-progression-lea',");
    });

    it('la remise à zéro touche la largeur ET le compteur textuel', () => {
        const i = srcArch.indexOf('function _reinitialiserBarreProgression');
        const corps = srcArch.slice(i, i + 400);
        expect(corps).toContain("width = '0%'");
        expect(corps).toContain('textContent');
    });
});

describe('#572 Import · le timer du poste de préparation ne fuit plus', () => {
    it('le timer précédent est arrêté avant d’en créer un nouveau', () => {
        const i = srcPrep.indexOf('setInterval(verifierBoutonsOutils');
        expect(i, 'le setInterval doit exister').toBeGreaterThan(-1);
        const avant = srcPrep.slice(Math.max(0, i - 200), i);
        expect(avant, 'un clearInterval doit précéder la création').toContain('clearInterval(timerBoutonsOutils)');
    });

    it('le timer est aussi arrêté à la fermeture', () => {
        const i = srcPrep.indexOf('function fermer(');
        const corps = srcPrep.slice(i, i + 500);
        expect(corps).toContain('clearInterval(timerBoutonsOutils)');
    });

    it('plus aucun setInterval nu dans le module', () => {
        expect(srcPrep).not.toMatch(/(?<!=\s)(?<!timerBoutonsOutils = )setInterval\(verifierBoutonsOutils/);
    });
});

describe('#572 Import · la date saisie ne recule plus d’un jour', () => {
    it('changerDateFichier passe par le constructeur local', () => {
        const i = srcUI.indexOf('function changerDateFichier');
        expect(i, 'changerDateFichier doit exister').toBeGreaterThan(-1);
        const corps = srcUI.slice(i, i + 600);
        expect(corps).toContain('_dateLocaleDepuisAAAAMMJJ');
        // `new Date(dateStr)` sur une chaîne ISO seule = parsing UTC : c'est le défaut.
        expect(corps).not.toMatch(/new Date\(dateStr\)/);
    });

    it('le helper construit bien une date à minuit LOCAL', () => {
        const i = srcUI.indexOf('function _dateLocaleDepuisAAAAMMJJ');
        expect(i, 'le helper doit exister').toBeGreaterThan(-1);
        const corps = srcUI.slice(i, i + 400);
        // Constructeur à trois arguments = heure locale, contrairement à la chaîne.
        expect(corps).toMatch(/new Date\(Number\(m\[1\]\), Number\(m\[2\]\) - 1, Number\(m\[3\]\)\)/);
    });
});

describe('#572 Import · les jetons de reprise ne débordent plus sur un autre groupe', () => {
    it('le balayage post-import est restreint au groupe-cours actif', () => {
        const i = srcUI.indexOf('function appliquerJetonsReprisePostImport');
        expect(i, 'la fonction doit exister').toBeGreaterThan(-1);
        const corps = srcUI.slice(i, i + 900);
        expect(corps).toContain('obtenirFichiersGroupeActif()');
        expect(corps, 'ne doit plus balayer tout le trimestre')
            .not.toContain('obtenirFichiersTravaux()');
    });
});
