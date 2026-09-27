import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// Sentinelle #506 (25 août 2026) — L'ASTÉRISQUE DIT VRAI, DANS LES DEUX SENS.
//
// Demande de Grégoire : marquer d'un astérisque rouge les champs sans lesquels
// l'application ne fonctionne pas.
//
// ⚠⚠ « OBLIGATOIRE » A ÉTÉ ÉTABLI SUR LE CODE, PAS SUR L'INTUITION. Un champ
// est marqué si, et seulement si, une validation REFUSE l'enregistrement quand
// il est vide. C'est vérifiable, et c'est ce que cette sentinelle vérifie.
//
// ⮕ Deux mensonges possibles, et la garde tient les deux :
//   · un champ bloquant SANS astérisque — l'utilisateur remplit son formulaire
//     et se fait refuser à la fin, sans savoir ce qui manquait ;
//   · un champ facultatif AVEC astérisque — il perd du temps à remplir ce que
//     personne ne lui demande. C'est le mensonge le plus discret : rien ne
//     rougit jamais, et il ne le saura pas.
//
// ⚠ CE QUI N'EST PAS MARQUÉ, ET POURQUOI. L'« Activité d'apprentissage » a été
// examinée : Grégoire la croyait indispensable. Elle est lue à plus de quarante
// endroits, TOUJOURS avec un repli (`activiteApprentissage || description ||
// titre`). Rien ne casse sans elle. Elle n'est donc pas marquée — un astérisque
// qui n'est pas exact devient un astérisque qu'on n'écoute plus.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const indexHtml = lire('index.html');

const MARQUE = 'title="Champ obligatoire"';

/** Le <label> qui contient ce texte, tel qu'il est écrit dans le fichier. */
function label(source, texte) {
    const i = source.indexOf(texte);
    if (i < 0) return null;
    const debut = source.lastIndexOf('<label', i);
    const fin = source.indexOf('</label>', i);
    return (debut < 0 || fin < 0) ? null : source.slice(debut, fin);
}

/* --------------------------------- Les champs que le code REFUSE de laisser vides */

const BLOQUANTS = [
    // [fichier, texte du label, preuve dans le code]
    ['index.html', 'Nom de la production',
     ["validerChampsObligatoiresProduction", "!d.titre"]],
    ['index.html', '>Type ',
     ["validerChampsObligatoiresProduction", "!d.type"]],
    ['index.html', 'Pondération (%)',
     ["validerChampsObligatoiresProduction", "d.ponderation === 0"]],
    ['index.html', 'Nom de la grille',
     ["Le nom de la grille est obligatoire"]],
    // ⚠ La preuve est cherchée sans son apostrophe : le source l'échappe
    // (`l\\'échelle`), et une preuve qui ne peut pas être trouvée ferait rougir
    // la garde sur sa propre écriture plutôt que sur le code.
    // ⚠⚠ #520 (13 sept. 2026) — ET CELLE-CI AUSSI PASSAIT SUR DU CODE MORT.
    // « échelle est obligatoire » vivait dans `enregistrerCommeEchelle()`, dont le
    // seul appelant était un bouton du bloc « ANCIEN SYSTÈME » masqué. Le bloc et
    // la fonction sont partis ensemble ; la preuve est réancrée sur le refus du
    // chemin VIVANT, `sauvegarderEchelleComplete()` (le refus y existait déjà :
    // l'astérisque disait vrai, c'est sa preuve qui regardait ailleurs).
    ['index.html', "Nom de l'échelle",
     ["async function sauvegarderEchelleComplete", "Donne un nom à l\\'échelle."]],   // lot E1 : tutoiement
    ['index.html', 'Nom de la cartouche',
     ["Donne un nom à la cartouche."]],   // lot E1 : tutoiement
    // ⚠⚠ #516 (26 août 2026) — CETTE PREUVE-LÀ PASSAIT À VIDE.
    // La chaîne existait bien… dans `sauvegarderCritere()`, qui lit `#critereNom`
    // — un id ABSENT d'index.html — et que plus aucun chemin n'appelle. La garde
    // gardait donc du code mort, et l'astérisque promettait un refus qui n'avait
    // jamais lieu. La preuve est réancrée sur le chemin VIVANT (`REFUS_NOM_CRITERE`,
    // consommé par `modifierCritereGrille`), et le refus lui-même est désormais
    // EXÉCUTÉ par `sentinelle-516-nom-critere-refuse.test.js` — un texte trouvé
    // dans un fichier ne prouvera plus jamais qu'un refus a lieu.
    ['js/grilles.js', 'Nom du critère',
     ["const REFUS_NOM_CRITERE", "if (champ === 'nom' &&"]]
];

describe('#506 · chaque champ marqué est refusé s\'il est vide', () => {
    for (const [fichier, texte, preuves] of BLOQUANTS) {
        it(`${texte.trim()} — marqué, et le code le refuse`, () => {
            const l = label(lire(fichier), texte);
            expect(l, `label « ${texte} » trouvé dans ${fichier}`).toBeTruthy();
            expect(l, 'doit porter l\'astérisque').toContain(MARQUE);

            // La preuve : quelque part, une validation refuse ce champ vide.
            const sources = ['js/productions.js', 'js/grilles.js',
                             'js/echelles.js', 'js/cartouches.js'].map(lire).join('\n');
            for (const preuve of preuves) {
                expect(sources, `preuve « ${preuve} »`).toContain(preuve);
            }
        });
    }

    it('La grille et l\'échelle d\'une cartouche : sans elles, la matrice reste masquée', () => {
        for (const texte of ['Grille (critères)', 'Échelle (niveaux)']) {
            expect(label(indexHtml, texte), texte).toContain(MARQUE);
        }
        // La preuve de leur nécessité : le rendu s'arrête là.
        expect(lire('js/cartouches.js')).toContain('if (!grilleId || !echelleId)');
    });
});

/* ------------------------- L'AUTRE SENS : pas d'astérisque de complaisance */

describe('#506 · aucun astérisque sur un champ facultatif', () => {
    const FACULTATIFS = [
        ["Activité d'apprentissage", 'lue partout avec un repli — rien ne casse sans elle'],
        ['Objectif d\'apprentissage', 'aucune validation ne l\'exige'],
        ['Détail de la tâche', 'Grégoire l\'a dit lui-même : pas nécessaire'],
        ['Description (optionnel)', 'son libellé le dit déjà']
    ];

    for (const [texte, raison] of FACULTATIFS) {
        it(`${texte} — PAS d'astérisque (${raison})`, () => {
            // Le label peut vivre dans le HTML ou dans un rendu JS.
            for (const f of ['index.html', 'js/productions.js']) {
                const l = label(lire(f), texte);
                if (l) expect(l, `${texte} dans ${f}`).not.toContain(MARQUE);
            }
        });
    }

    it('LE POINT DE FOND : « Activité d\'apprentissage » est toujours lue avec un repli', () => {
        // C'est ce qui l'a fait écarter de la liste, contre la prémisse de
        // départ. Si un jour un site la lit SANS repli, elle devient bloquante
        // — et cette garde rougira pour le dire.
        const sources = ['js/evaluation-retroaction.js', 'js/synthese-retroaction-data.js',
                         'js/profil-etudiant-calculs.js'].map(lire).join('\n');
        const usages = sources.split('\n').filter(l => l.includes('activiteApprentissage')
            && !l.trim().startsWith('//') && !l.trim().startsWith('*'));
        expect(usages.length, 'des usages à vérifier').toBeGreaterThan(0);
        for (const u of usages) {
            expect(u, `usage sans repli : ${u.trim().slice(0, 90)}`).toMatch(/\|\||\?\./);
        }
    });
});

/* ------------------------------- La marque « recommandé » (#507, 25 août) */

describe('#507 · « recommandé » se distingue d\'« obligatoire »', () => {
    const RECO = 'class="champ-recommande"';

    it('a. Les trois champs de l\'en-tête de rétroaction sont marqués', () => {
        // `_rendreOptionsProduction` n'écrit chaque ligne QUE si son champ est
        // rempli. Vide, la ligne ne manque pas : elle n'existe pas.
        expect(label(indexHtml, "Activité d'apprentissage"), 'activité').toContain(RECO);
        const prods = lire('js/productions.js');
        for (const cle of ["cle: 'objectif'", "cle: 'tache'"]) {
            const i = prods.indexOf(cle);
            expect(i, cle).toBeGreaterThan(-1);
            expect(prods.slice(i, i + 700), cle + ' doit être recommandé').toContain('recommande: true');
        }
    });

    it('b. LE POINT DÉCISIF : recommandé N\'EST PAS obligatoire', () => {
        // Les confondre ferait refuser un enregistrement que le code accepte,
        // ou l'inverse. Aucun champ recommandé ne porte la marque rouge.
        expect(label(indexHtml, "Activité d'apprentissage")).not.toContain(MARQUE);
        // Et le détail de la tâche, que Grégoire a dit facultatif, n'a ni l'une
        // ni l'autre.
        const prods = lire('js/productions.js');
        const i = prods.indexOf("cle: 'detailTache'");
        expect(prods.slice(i, i + 700)).not.toContain('recommande: true');
    });

    it('c. La LÉGENDE existe : deux astérisques sans elle sont une énigme', () => {
        const legende = indexHtml.match(/<p class="legende-marques">[\s\S]*?<\/p>/);
        expect(legende, 'légende trouvée').toBeTruthy();
        expect(legende[0], 'elle explique le rouge').toContain('obligatoire');
        expect(legende[0], 'et le gris').toContain('Recommandé');
        expect(legende[0]).toContain('champ-requis');
        expect(legende[0]).toContain('champ-recommande');
    });

    it('d. Les deux marques ont un style, et il diffère', () => {
        const css = lire('styles.css');
        expect(css).toContain('.champ-recommande {');
        expect(css).toContain('.legende-marques {');
        // La marque recommandée ne doit pas emprunter le rouge de l'obligatoire.
        const bloc = tranche(css, '.champ-recommande {', '.legende-marques {');
        expect(bloc, 'pas de rouge sur du recommandé').not.toMatch(/danger|#c0392b|red/i);
    });

    it('e. Chaque marque dit pourquoi, au survol', () => {
        expect(indexHtml).toContain('title="Champ obligatoire"');
        expect(indexHtml + lire('js/productions.js')).toContain('title="Recommandé');
    });
});
