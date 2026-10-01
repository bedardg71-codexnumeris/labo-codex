import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerCodex } from './_helpers/charger-codex.js';

/**
 * Skeleton de tests pour js/codex.js — préparation pour l'ultrareview
 * du 12 mai 2026 (PR #16, branche review/codex-2026-05-12).
 *
 * Catégories anticipées (cf. description PR #16) :
 *   - Sécurité : échappement HTML, validation imports ZIP/JSON
 *   - Rétrocompat : format du manifeste codex (rétrocompat-breaking si modifié)
 *   - Code mort / IIFE structure / exports window.*
 *   - FSAPI : auto-save Chrome/Edge vs fallback download (sprint #239)
 *   - Comparer vs Fusionner : sérialisation rapport (sprint #243)
 *
 * Convention : 1 test Vitest par bug fixé. Couvrir le comportement attendu,
 * pas le bug spécifique (cf. SESSION.md du 13 mai 2026 §85-90).
 */

let win;
beforeAll(() => {
    win = chargerCodex();
});

describe('codex.js — sanity load', () => {

    it('charge sans erreur et expose window.Codex', () => {
        expect(win.Codex).toBeDefined();
        expect(typeof win.Codex).toBe('object');
    });

    it('expose les actions attendues du menu Codex', () => {
        const actions = [
            'actionOuvrir',
            'actionEnregistrer',
            'actionEnregistrerSous',
            'actionNouveau',
            'actionDetails',
            'actionRenommer',
            'actionFusionner',
            'actionComparer',
            'actionExporterSelection',
            'actionFermer'
        ];
        for (const nom of actions) {
            expect(typeof win.Codex[nom]).toBe('function');
        }
    });

    it('expose l\'état et le marqueur de modification', () => {
        expect(typeof win.Codex.etat).toBe('function');
        expect(typeof win.Codex.marquerModification).toBe('function');
    });

    it('expose les helpers de la modale Comparer (#243)', () => {
        expect(typeof win.Codex.fermerModalComparer).toBe('function');
        expect(typeof win.Codex.copierRapportComparaison).toBe('function');
        expect(typeof win.Codex.telechargerRapportComparaison).toBe('function');
    });

});

// ====================================================================
// TESTS À AJOUTER QUAND LES FINDINGS DE L'ULTRAREVIEW ARRIVENT
// ====================================================================
//
// describe('codex.js — sécurité', () => {
//     it.todo('échappe les balises HTML dans les noms importés du manifeste');
//     it.todo('validerCodex rejette un ZIP avec un manifeste manquant');
//     it.todo('lireCodexExterne rejette un manifeste à version non supportée');
// });
//
// describe('codex.js — rétrocompat manifeste', () => {
//     it.todo('FORMAT_VERSION reste à 1 (changement = breaking pour codex existants)');
//     it.todo('NOM_MANIFESTE_ANCIEN ("classeur-manifeste.json") accepté à l\'import');
// });
//
// describe('codex.js — fusion 3-way', () => {
//     it.todo('_analyserFusion détecte les conflits sur valeurs scalaires divergentes');
//     it.todo('_analyserFusionTravaux gère un travail supprimé localement et modifié externe');
// });
//
// describe('codex.js — comparaison (#243)', () => {
//     it.todo('_construireRapportComparaison produit toutes les catégories attendues');
// });
//
// describe('codex.js — FSAPI (#239)', () => {
//     it.todo('_peutPartagerFichier détecte correctement le support navigator.share');
// });

describe('codex.js — bilan d\'une ouverture incomplète (#334 session B ; porté par la fenêtre de rechargement depuis #1012)', () => {

    // Le cadre commun aux quatre causes (mots acceptés par Grégoire le 1er oct. 2026).
    const TITRE = 'Codex ouvert, mais incomplet';
    const SUITE = ' Tes données, elles, sont complètes, et ton fichier de codex n\'a pas changé.';
    const QUESTION = '\n\nRecharger la page pour appliquer les données ?';
    const CONSEIL_ESPACE = (une) => 'Pour retrouver ' + (une ? 'cette copie' : 'ces copies') + ' : si tu es en navigation privée, rouvre l\'application dans une fenêtre normale. Sinon, libère de l\'espace sur le disque de l\'appareil (vide la corbeille, retire de gros fichiers), puis rouvre le même codex.';
    const bilanDe = (attendues, { quota = 0, erreur = 0, format = 0, absentes = 0 }) => win.Codex.construireBilanImport({
        nbCles: 120,
        nbBlobs: attendues - quota - erreur - format - absentes,
        nbBlobsAttendus: attendues,
        blobsEchecs: [
            ...Array.from({ length: quota }, (_, i) => ({ id: 'FT_q' + i, raison: 'quota' })),
            ...Array.from({ length: erreur }, (_, i) => ({ id: 'FT_e' + i, raison: 'erreur' }))
        ],
        blobsRefusesMagic: Array.from({ length: format }, (_, i) => 'FT_f' + i),
        blobsAbsentsDuZip: Array.from({ length: absentes }, (_, i) => 'FT_a' + i)
    });

    it('expose construireBilanImport (fonction pure)', () => {
        expect(typeof win.Codex.construireBilanImport).toBe('function');
    });

    // Les mots des trois autres causes, acceptés par Grégoire le 1er oct. 2026 (17 h 55), à la
    // place des phrases de #334. Tenus en entier, au pluriel et au singulier.
    it('copies absentes du fichier → les rouvrir ne les ramènera pas', () => {
        expect(bilanDe(12, { absentes: 4 })).toEqual({
            titre: TITRE,
            message: '4 copies sur 12 ne sont pas dans ce fichier de codex.' + SUITE
                + '\n\nElles manquaient déjà quand ce codex a été écrit : le rouvrir ne les ramènera pas. Cherche-les dans un codex plus ancien ou dans une archive.'
                + QUESTION
        });
        expect(bilanDe(12, { absentes: 1 })).toEqual({
            titre: TITRE,
            message: '1 copie sur 12 n\'est pas dans ce fichier de codex.' + SUITE
                + '\n\nElle manquait déjà quand ce codex a été écrit : le rouvrir ne la ramènera pas. Cherche-la dans un codex plus ancien ou dans une archive.'
                + QUESTION
        });
    });

    it('format non reconnu → rouvrir le même codex ne les ramènera pas', () => {
        expect(bilanDe(10, { format: 2 })).toEqual({
            titre: TITRE,
            message: '2 copies sur 10 n\'ont pas été reprises : leur contenu n\'est ni une image ni un PDF.' + SUITE
                + '\n\nRouvrir le même codex ne les ramènera pas.'
                + QUESTION
        });
        expect(bilanDe(10, { format: 1 })).toEqual({
            titre: TITRE,
            message: '1 copie sur 10 n\'a pas été reprise : son contenu n\'est ni une image ni un PDF.' + SUITE
                + '\n\nRouvrir le même codex ne la ramènera pas.'
                + QUESTION
        });
    });

    // Sans « : le détail y sera » : mesuré par le geste, le détail de l'erreur n'est plus dans
    // le signalement après « Recharger ». Le bouton nommé est celui d'index.html.
    it('erreur technique → rouvrir le même codex, puis le signalement', () => {
        expect(bilanDe(2, { erreur: 2 })).toEqual({
            titre: TITRE,
            message: '2 copies sur 2 n\'ont pas pu revenir, à cause d\'une erreur.' + SUITE
                + '\n\nPour retrouver ces copies : rouvre le même codex. Si l\'erreur revient, utilise « Signaler un bug ou donner ton avis ».'
                + QUESTION
        });
        expect(bilanDe(2, { erreur: 1 })).toEqual({
            titre: TITRE,
            message: '1 copie sur 2 n\'a pas pu revenir, à cause d\'une erreur.' + SUITE
                + '\n\nPour retrouver cette copie : rouvre le même codex. Si l\'erreur revient, utilise « Signaler un bug ou donner ton avis ».'
                + QUESTION
        });
    });

    it('mélange des quatre causes → le nombre par cause, puis le conseil de chacune sous son nom, l\'espace en premier', () => {
        expect(bilanDe(12, { quota: 2, erreur: 1, format: 1, absentes: 3 })).toEqual({
            titre: TITRE,
            message: '7 copies sur 12 n\'ont pas pu revenir : 2 faute d\'espace, 3 absentes du fichier, 1 dans un format non reconnu, 1 à cause d\'une erreur.' + SUITE
                + '\n\nFaute d\'espace. ' + CONSEIL_ESPACE(false)
                + '\n\nAbsentes du fichier. Elles manquaient déjà quand ce codex a été écrit : le rouvrir ne les ramènera pas. Cherche-les dans un codex plus ancien ou dans une archive.'
                + '\n\nDans un format non reconnu. Rouvrir le même codex ne la ramènera pas.'
                + '\n\nÀ cause d\'une erreur. Pour retrouver cette copie : rouvre le même codex. Si l\'erreur revient, utilise « Signaler un bug ou donner ton avis ».'
                + QUESTION
        });
    });

    it('mélange de deux causes → seules les causes présentes sont nommées et conseillées', () => {
        expect(bilanDe(3, { quota: 1, absentes: 1 })).toEqual({
            titre: TITRE,
            message: '2 copies sur 3 n\'ont pas pu revenir : 1 faute d\'espace, 1 absente du fichier.' + SUITE
                + '\n\nFaute d\'espace. ' + CONSEIL_ESPACE(true)
                + '\n\nAbsente du fichier. Elle manquait déjà quand ce codex a été écrit : le rouvrir ne la ramènera pas. Cherche-la dans un codex plus ancien ou dans une archive.'
                + QUESTION
        });
    });

    it('les phrases de #334 ont disparu de tous les bilans', () => {
        const tous = [bilanDe(3, { quota: 1 }), bilanDe(3, { erreur: 1 }), bilanDe(3, { format: 1 }), bilanDe(3, { absentes: 1 }),
            bilanDe(12, { quota: 2, erreur: 1, format: 1, absentes: 3 })];
        // Témoin : les bilans sont bien composés (un bilan vide rendrait les absences vacantes).
        tous.forEach((b) => expect(b.message.endsWith(QUESTION)).toBe(true));
        tous.forEach((b) => {
            expect(b.titre).toBe(TITRE);
            expect(b.message).not.toContain('ZIP');
            expect(b.message).not.toContain('Import incomplet');
            expect(b.message).not.toContain('fichiers sur');
            expect(b.message).not.toContain('clés');
        });
    });

    // #1012 — les mots acceptés par Grégoire le 1er oct. 2026 (12 h 40), pour le seul cas
    // où toutes les copies manquantes ont été refusées faute d'espace. Tenus en entier.
    it('faute d\'espace seulement → les mots de Grégoire, au pluriel', () => {
        const bilan = win.Codex.construireBilanImport({
            nbCles: 1014,
            nbBlobs: 330,
            nbBlobsAttendus: 397,
            blobsEchecs: Array.from({ length: 67 }, (_, i) => ({ id: 'FT_' + i, raison: 'quota' })),
            blobsRefusesMagic: [],
            blobsAbsentsDuZip: []
        });
        expect(bilan).toEqual({
            titre: 'Codex ouvert, mais incomplet',
            message: '67 copies sur 397 n\'ont pas pu revenir, faute d\'espace. Tes données, elles, sont complètes, et ton fichier de codex n\'a pas changé.'
                + '\n\nPour retrouver ces copies : si tu es en navigation privée, rouvre l\'application dans une fenêtre normale. Sinon, libère de l\'espace sur le disque de l\'appareil (vide la corbeille, retire de gros fichiers), puis rouvre le même codex.'
                + '\n\nRecharger la page pour appliquer les données ?'
        });
    });

    it('faute d\'espace seulement, une seule copie → accord au singulier', () => {
        const bilan = win.Codex.construireBilanImport({
            nbCles: 10,
            nbBlobs: 2,
            nbBlobsAttendus: 3,
            blobsEchecs: [{ id: 'FT_z', raison: 'quota' }],
            blobsRefusesMagic: [],
            blobsAbsentsDuZip: []
        });
        expect(bilan).toEqual({
            titre: 'Codex ouvert, mais incomplet',
            message: '1 copie sur 3 n\'a pas pu revenir, faute d\'espace. Tes données, elles, sont complètes, et ton fichier de codex n\'a pas changé.'
                + '\n\nPour retrouver cette copie : si tu es en navigation privée, rouvre l\'application dans une fenêtre normale. Sinon, libère de l\'espace sur le disque de l\'appareil (vide la corbeille, retire de gros fichiers), puis rouvre le même codex.'
                + '\n\nRecharger la page pour appliquer les données ?'
        });
    });

});

// #1012 — l'avertissement à l'écriture d'un codex auquel des copies manquent. Mots acceptés par
// Grégoire le 1er oct. 2026 (17 h 52) ; l'accord en nombre est de la grammaire. Tenus en entier.
describe('codex.js — avertissement des copies manquantes (#1012)', () => {

    it('au pluriel', () => {
        expect(win.Codex.construireAvertissementCopiesManquantes(67, 397)).toEqual({
            titre: 'Ce codex n\'aura pas toutes tes copies',
            message: '67 copies sur 397 ne sont pas dans l\'application. Le codex que tu vas écrire ne les contiendra pas.'
                + '\n\nSi un autre fichier de codex les contient encore, ne le remplace pas : donne un autre nom à celui-ci.',
            texteConfirmer: 'Écrire sans ces copies'
        });
    });

    it('une seule copie → accord au singulier, jusqu\'au bouton', () => {
        expect(win.Codex.construireAvertissementCopiesManquantes(1, 3)).toEqual({
            titre: 'Ce codex n\'aura pas toutes tes copies',
            message: '1 copie sur 3 n\'est pas dans l\'application. Le codex que tu vas écrire ne la contiendra pas.'
                + '\n\nSi un autre fichier de codex la contient encore, ne le remplace pas : donne un autre nom à celui-ci.',
            texteConfirmer: 'Écrire sans cette copie'
        });
    });
});

// #1012 — verrou structurel : l'avertissement vit dans l'appelant de la génération. Tout site
// qui génère le codex entier pour l'écrire hors de l'application doit passer la confirmation ;
// un second appelant qui l'oublierait écrirait un codex amputé sans rien dire.
describe('codex.js — tout appelant de la génération passe l\'avertissement (#1012)', () => {
    const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
    const fichiersJs = readdirSync(path.join(racine, 'js'), { recursive: true })
        .filter((f) => String(f).endsWith('.js'))
        .map((f) => ({ nom: String(f), code: readFileSync(path.join(racine, 'js', String(f)), 'utf8') }));

    it('un seul site appelle la génération, et il passe `confirmerCopiesManquantes`', () => {
        const appels = [];
        fichiersJs.forEach(({ nom, code }) => {
            code.split('\n').forEach((ligne) => {
                if (/(^|[^.\w])genererCodex\(|Codex\.generer\(/.test(ligne) && !/function genererCodex\(/.test(ligne)) appels.push(nom + ' : ' + ligne.trim());
            });
        });
        expect(appels).toEqual(['codex.js : resultat = await genererCodex({ suivreTentative: true, confirmerCopiesManquantes: confirmerCopiesManquantes });']);
    });

    it('l\'export d\'une sélection demande toujours où écrire et n\'adopte jamais sa destination', () => {
        const codex = fichiersJs.find((f) => f.nom === 'codex.js').code;
        const debut = codex.indexOf('async function actionExporterSelection(');
        const fin = codex.indexOf('function _formaterNomTrimestre(');
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
        const corps = codex.slice(debut, fin);
        const ecritures = corps.split('\n').filter((l) => l.includes('sauvegarderVersDestination('));
        expect(ecritures.map((l) => l.trim())).toEqual(['var resultatSave = await sauvegarderVersDestination(zipBlob, nomFichier, { forcerDialogue: true, sansAdoption: true });']);
    });
});
