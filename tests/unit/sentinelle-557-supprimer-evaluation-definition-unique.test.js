import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

// SENTINELLE #557 — UNE SEULE `supprimerEvaluation`, ET LE MOTIF QUI L'A PRODUITE.
//
// LE DÉFAUT. Deux fichiers définissaient `supprimerEvaluation` et la posaient
// tous deux sur `window` : `liste-evaluations.js` (avec la restauration de
// l'originale d'une reprise — correctif du 8 juin — et la tolérance aux
// orphelines verrouillées — 16 mars) et `evaluation.js` (sans). `evaluation.js`
// étant chargé APRÈS, c'est la version incomplète qui gagnait `window`.
// ⮕ Supprimer une reprise depuis le profil étudiant laissait son originale
//   « remplacée » à jamais, sans moyen de la récupérer.
//
// ⚠ L'ÉNONCÉ DU BACKLOG DISAIT « LA VERSION CORRIGÉE EST INATTEIGNABLE ».
//   Mesuré le 28 août 2026 : c'est plus étroit que ça. `liste-evaluations.js`
//   est encapsulé dans une IIFE, donc son appel interne (`data-action`
//   « supprimer-eval », depuis la Liste des évaluations) résolvait
//   LEXICALEMENT vers sa propre version — la bonne. Seuls les appels passant
//   par le global tombaient sur la mauvaise : le profil étudiant
//   (`profil-etudiant-actions.js`, hors IIFE) et le sidebar d'évaluation
//   (`evaluation.js`). Le même écran pouvait donc se comporter de deux façons
//   selon le bouton employé.
//
// ⮕ CE QUI EST ÉPROUVÉ ICI :
//   1. le global rend bien la version qui restaure l'originale (comportement) ;
//   2. `evaluation.js` ne définit plus ni n'expose ce nom (statique) ;
//   3. le MOTIF est verrouillé : aucun NOUVEAU nom de fonction ne peut être
//      défini et exposé sur `window` par deux modules à la fois (cliquet).

const ID_ORIGINALE = 'EV_originale';
const ID_REPRISE = 'EV_reprise';

function corpusAvecReprise() {
    return [
        {
            id: ID_ORIGINALE, etudiantDA: '2412345', productionId: 'PR_1',
            etudiantNom: 'Camille Roy', productionNom: 'Analyse littéraire',
            remplaceeParId: ID_REPRISE, dateRemplacement: '2026-08-20', archivee: true,
            dateArchivage: '2026-08-20'
        },
        {
            id: ID_REPRISE, etudiantDA: '2412345', productionId: 'PR_1',
            etudiantNom: 'Camille Roy', productionNom: 'Analyse littéraire',
            estReprise: true, evaluationOriginaleId: ID_ORIGINALE
        }
    ];
}

/**
 * Monte `liste-evaluations.js` avec un stockage en mémoire, et rend le `window`
 * peuplé — c'est-à-dire exactement la surface globale que le profil étudiant
 * interroge quand il fait `typeof supprimerEvaluation === 'function'`.
 */
function monter(corpus) {
    const magasin = { 'test_evaluationsSauvegardees': JSON.parse(JSON.stringify(corpus)) };
    const journal = { erreurs: [], succes: [], confirmations: [] };

    const w = chargerScript('js/liste-evaluations.js', {
        db: {
            getSync: (k, d) => (k in magasin ? magasin[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { magasin[k] = v; },
            get: async () => null, set: async () => {}
        },
        cle: (k) => 'test_' + k,
        magasin,
        journal,
        notifications: {
            erreur: (t, m) => journal.erreurs.push(`${t} · ${m}`),
            succes: (m) => journal.succes.push(m)
        },
        confirm: (msg) => { journal.confirmations.push(msg); return true; },
        sauvegarderDonneesSelonMode: (k, v) => { magasin['test_' + k] = v; return true; },
        calculerEtStockerIndicesCP: () => {},
        // `supprimerEvaluation` termine par `initialiserListeEvaluations()`, qui
        // vit dans la MÊME IIFE : l'appel résout lexicalement vers la vraie, pas
        // vers un stub posé sur le sandbox. Il faut donc nourrir ce qu'elle lit,
        // sinon son `try/catch` avale une ReferenceError — un banc vert qui
        // journalise une erreur finit par masquer la prochaine, la vraie.
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null,
        obtenirSeuil: () => null,
        document: {
            getElementById: () => null, addEventListener: () => {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } }),
            body: { appendChild() {} }
        }
    }, {
        // Le sandbox EST le `window` du module : ce que le code appelle sur
        // `window.` doit exister ici, pas dans les globaux injectés.
        addEventListener: () => {}, removeEventListener: () => {}
    });

    // `chargerScript` ne rend que les exports : le magasin et le journal restent
    // à côté, sinon on les lirait sur un objet qui ne les porte pas.
    return { w, magasin, journal };
}

describe('#557 · une seule définition de supprimerEvaluation', () => {

    // ── 1. LE GLOBAL REND LA VERSION CORRIGÉE ───────────────────────────────

    it('supprimer une reprise par le GLOBAL restaure son originale', () => {
        // C'est le chemin du profil étudiant : `profil-etudiant-actions.js` n'est
        // pas dans une IIFE, son appel résout vers `window.supprimerEvaluation`.
        const { w, magasin, journal } = monter(corpusAvecReprise());
        expect(typeof w.supprimerEvaluation).toBe('function');

        w.supprimerEvaluation(ID_REPRISE);

        const restantes = magasin['test_evaluationsSauvegardees'];
        const originale = restantes.find(e => e.id === ID_ORIGINALE);

        // La reprise est partie.
        expect(restantes.map(e => e.id)).toEqual([ID_ORIGINALE]);

        // Et l'originale n'est plus « remplacée » — c'est tout l'objet du
        // correctif du 8 juin, que la version d'`evaluation.js` ne portait pas.
        expect(originale.remplaceeParId).toBeUndefined();
        expect(originale.dateRemplacement).toBeUndefined();
        expect(originale.archivee).toBeUndefined();
        expect(originale.dateArchivage).toBeUndefined();

        expect(journal.succes.join(' ')).toMatch(/originale restaurée/i);
    });

    it('la confirmation NOMME ce qu\'on détruit — apport absorbé de la version retirée', () => {
        const { w, journal } = monter(corpusAvecReprise());
        w.supprimerEvaluation(ID_REPRISE);

        // Depuis le profil ou le sidebar, rien à l'écran ne rappelle sur quelle
        // évaluation le clic vient de porter : la question doit le dire.
        expect(journal.confirmations.join(' ')).toContain('Camille Roy');
        expect(journal.confirmations.join(' ')).toContain('Analyse littéraire');
    });

    it('un identifiant introuvable est refusé, pas annoncé comme supprimé', () => {
        // Sans cette garde — l'autre apport absorbé — le filtrage était sans
        // effet et la notification de succès partait quand même.
        const { w, magasin, journal } = monter(corpusAvecReprise());
        w.supprimerEvaluation('EV_qui_nexiste_pas');

        expect(magasin['test_evaluationsSauvegardees']).toHaveLength(2);
        expect(journal.succes).toEqual([]);
        expect(journal.erreurs.join(' ')).toMatch(/introuvable/i);
    });

    // ── 2. LA SECONDE DÉFINITION N'EST PAS REVENUE ──────────────────────────

    it('`evaluation.js` ne définit plus et n\'expose plus ce nom', () => {
        const code = sansCommentaires(lire('js/evaluation.js'));

        expect(code).not.toMatch(/(?:^|\n)\s*(?:async\s+)?function\s+supprimerEvaluation\s*\(/);
        expect(code).not.toMatch(/window\.supprimerEvaluation\s*=/);

        // Mais il continue de l'APPELER : le retrait ne devait pas emporter le
        // bouton de suppression du sidebar.
        expect(code).toMatch(/\bsupprimerEvaluation\(/);
    });

    it('`liste-evaluations.js` en est le seul poseur', () => {
        const poseurs = fichiersJs().filter(f => {
            const code = sansCommentaires(lire(f));
            return /(?:^|\n)\s*window\.supprimerEvaluation\s*=/.test(code);
        });
        expect(poseurs).toEqual(['js/liste-evaluations.js']);
    });

    // ── 3. LE MOTIF EST VERROUILLÉ (CLIQUET) ────────────────────────────────

    // ⚠ CE CLIQUET N'EST PAS À ZÉRO, ET C'EST DÉLIBÉRÉ. Neuf autres noms
    // présentent le même défaut, mesurés le 28 août 2026. Ils sont hors du
    // périmètre de #557 et inscrits au backlog sous #587. Ce qui est verrouillé
    // ici, c'est qu'il n'en apparaisse pas un DIXIÈME, et que
    // `supprimerEvaluation` ne revienne pas.
    //
    // ⚠⚠ CETTE LISTE A D'ABORD COMPTÉ SIX NOMS, ET C'ÉTAIT FAUX. Le détecteur
    // ne cherchait que `window.X = X;` — la forme « référence à une fonction
    // nommée ». Il manquait `window.X = function` et `window.X = async
    // function`, qui représentent 133 expositions dans le dépôt, et donc trois
    // doublons entiers : `_apresOuvertureFichier`, `afficherSection` (posé par
    // TROIS fichiers) et `afficherSousSection`.
    // ⮕ Un cliquet ne vaut que ce que vaut son détecteur : celui-ci doit
    //   couvrir TOUTES les formes d'exposition, pas la plus courante.
    // ⮕ LA LISTE A RACCOURCI DE NEUF À SIX LE 31 AOÛT 2026 (#626, S8 du plan
    //   Conception). Trois doublons ne sont plus des doublons : la définition
    //   PERDANTE a été retirée dans chaque cas, celle que l'ordre de chargement
    //   d'index.html écrasait déjà en silence. `creerNouvellePratique` :
    //   pratiques-gestion.js retirée, pratiques.js (le wizard V2) reste.
    //   `listerTrimestresAvecGrilles` / `listerTrimestresAvecCartouches` : les
    //   versions des deux modules `*-bibliotheque.js` scannaient les suffixes
    //   obsolètes `_grilles` / `_cartouches` et rendaient toujours `[]`.
    //   C'est ce banc qui a signalé qu'il fallait raccourcir la liste.
    // ⮕ DE SIX À CINQ LE 15 SEPT. 2026 (#868) : `evaluerProduction`. La version
    //   de profil-etudiant-actions.js, écrasée au chargement par evaluation.js,
    //   visait deux identifiants inexistants ; retirée, avec la copie locale de
    //   liste-evaluations.js. evaluation.js garde la définition unique.
    // ⮕ DE QUATRE À TROIS LE 12 OCT. 2026 (#587, lot 22) : `afficherTableauProductions` de
    //   donnees-v2.js, écrasée par productions.js et dont le conteneur n'existe pas, est retirée.
    //   L'interception de `afficherSection` par rapport-bug.js aussi (chargé avant navigation.js,
    //   elle ne s'est jamais posée).
    // ⮕ LES TROIS QUI RESTENT SONT DES EXCEPTIONS JUSTIFIÉES (règle de Grégoire, 28 août : « l'alias
    //   devient l'exception justifiée »), pas des doublons à retirer :
    //   · `afficherSection`, `afficherSousSection` — bilan-reflexif.js et planification.js les
    //     ENVELOPPENT (chaque enveloppe appelle la précédente, puis navigation.js) : c'est le seul
    //     point d'extension de la navigation, et navigation.js est en zone protégée. Les retirer
    //     demande un événement de navigation, donc l'accord de Grégoire sur navigation.js.
    //   · `_apresOuvertureFichier` — un emplacement de rappel à usage unique, pas une fonction :
    //     posé par l'écran qui ouvre une copie, consommé et vidé par travaux-ui.js.
    const DOUBLONS_CONNUS = [
        '_apresOuvertureFichier',            // emplacement de rappel : evaluation / liste-evaluations / profil-etudiant-actions
        'afficherSection',                   // enveloppes : bilan-reflexif.js / planification.js
        'afficherSousSection'                // enveloppes : bilan-reflexif.js / planification.js
        // 'fermerModalBibliothequePratiques' : réglé par #587 (11 oct. 2026), une seule pose.
        // 'afficherTableauProductions' : réglé par #587 (12 oct. 2026), productions.js seul.
    ];

    it('aucun NOUVEAU nom de fonction n\'est posé sur window par deux modules', () => {
        const poseurs = new Map();
        const noter = (nom, f) => {
            if (!poseurs.has(nom)) poseurs.set(nom, new Set());
            poseurs.get(nom).add(f);
        };

        for (const f of fichiersJs()) {
            const code = sansCommentaires(lire(f));
            const definies = new Set(
                [...code.matchAll(/(?:^|\n)\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1])
            );

            // Forme A — `window.X = X;` : référence à une fonction nommée du fichier.
            for (const m of code.matchAll(/(?:^|\n)\s*window\.([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\s*;/g)) {
                if (m[1] === m[2] && definies.has(m[1])) noter(m[1], f);
            }
            // Forme B — `window.X = function` / `async function` : définition directe.
            for (const m of code.matchAll(/(?:^|\n)\s*window\.([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\b/g)) {
                noter(m[1], f);
            }
            // Forme C — `window.X = (…) => …` : la même chose, en flèche.
            for (const m of code.matchAll(/(?:^|\n)\s*window\.([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g)) {
                noter(m[1], f);
            }
        }

        const doublons = [...poseurs.entries()]
            .filter(([, fs2]) => fs2.size > 1)
            .map(([nom]) => nom)
            .sort();

        // Le cliquet ne descend pas tout seul : si un doublon connu est corrigé,
        // ce banc rougit pour le dire, et la liste se raccourcit à la main.
        expect(doublons).toEqual(DOUBLONS_CONNUS);
    });

    it('#587 · rapport-bug.js, chargé avant navigation.js, n\'enveloppe plus afficherSection', () => {
        // L'enveloppe ne pouvait pas se poser (la fonction n'existait pas encore) : retirée.
        // La liste ci-dessus ne le verrait pas revenir, le nom y restant pour les deux autres.
        expect(sansCommentaires(lire('js/rapport-bug.js'))).not.toMatch(/window\.afficherSection\s*=/);
    });

    it('supprimerEvaluation n\'est pas dans la liste des doublons tolérés', () => {
        // Le piège d'un cliquet à liste : rendre le défaut vert en l'y ajoutant.
        expect(DOUBLONS_CONNUS).not.toContain('supprimerEvaluation');
    });
});

// ── outils ──────────────────────────────────────────────────────────────────

function lire(rel) {
    return fs.readFileSync(path.join(racine, rel), 'utf8');
}

function sansCommentaires(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

function fichiersJs() {
    const sortie = [];
    (function marcher(rel) {
        for (const e of fs.readdirSync(path.join(racine, rel), { withFileTypes: true })) {
            if (e.name === '_archives') continue;
            const suivant = rel + '/' + e.name;
            if (e.isDirectory()) marcher(suivant);
            else if (e.name.endsWith('.js')) sortie.push(suivant);
        }
    })('js');
    return sortie.sort();
}
