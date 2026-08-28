import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #575 (lot 4 du plan SOLO, B1+B2+B3+B4) — le contexte de Grégoire
// est SORTI de l'analyse de sous-groupe, et il ne peut pas y revenir.
//
// CE QUI A ÉTÉ RETIRÉ, ET POURQUOI CE FICHIER REMPLACE `sentinelle-542-a4`.
//
// `analyserSousGroupe` (`js/interventions.js`) rendait un champ `defisCommuns`
// alimenté par `obtenirPerformancesSRPNF` → `convertirNiveauEnPourcentage`
// (`js/portfolio.js`). Cette chaîne portait DEUX fois le contexte de Grégoire :
//
//   B3/B4 — les cinq noms de ses critères en toutes lettres
//           (`['Structure','Rigueur','Plausibilité','Nuance','Français']`) :
//           pour toute autre grille, le compte restait vide.
//   B1/B2 — un QUATRIÈME repli IDME `{0:0, I:32, D:69.5, M:79.5, E:92.5}`,
//           derrière `db.getSync('echellesPerformance')` — une clé que RIEN
//           n'écrivait dans `js/`. Le repli n'était donc pas un filet : c'était
//           le chemin normal. Faux même chez Grégoire (ses valeurs sont
//           40/65/75/100), et `|| 0` rendait 0 % pour tout code non IDME.
//
// ⮕ LA CHAÎNE A ÉTÉ SUPPRIMÉE, PAS RÉPARÉE, et c'est le fond de l'affaire :
// `defisCommuns` était écrit dans `intervention.analyse`, sauvegardé en base —
// et AUCUN écran ne le lisait, depuis sa création (Beta 0.85).
// `genererAffichageAnalyseCartes` n'affiche que les patterns et les niveaux RàI.
// Le besoin, lui, est déjà servi ailleurs et correctement :
// `mettreAJourCriteresCibles` compte les étudiants en défi PAR CRITÈRE DE LA
// GRILLE de l'utilisateur, via `calculerMoyennesCriteres`, et l'affiche à côté
// de chaque case (« — 3/5 en défi »). Réparer le doublon mort aurait été du
// travail sans effet ; c'est le patron `feedback-verifier-consommateurs-avant-brancher`.
//
// ⮕ CE FICHIER REMPLACE `sentinelle-542-a4-defis-communs.test.js`, dont l'objet
// (le champ `defisCommuns`) n'existe plus. Son dernier test annonçait d'ailleurs
// le présent lot : « CONSTAT MESURÉ, PAS CORRIGÉ (lot 4, B3/B4) ».

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racine, rel), 'utf8');

// Le corps du code, commentaires retirés : une valeur citée dans une
// explication ne doit pas faire rougir la sentinelle, mais un `32` qui REVIENT
// dans du code exécutable, si.
function sansCommentaires(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1'))
        .join('\n');
}

function fichiersJs() {
    const dossier = path.join(racine, 'js');
    const trouves = [];
    (function parcourir(rep) {
        for (const entree of readdirSync(rep)) {
            const complet = path.join(rep, entree);
            if (statSync(complet).isDirectory()) parcourir(complet);
            else if (entree.endsWith('.js')) trouves.push(complet);
        }
    })(dossier);
    return trouves;
}

let win;
let evaluationsEnBase = [];

beforeAll(() => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, defaut) => (defaut !== undefined ? defaut : null),
            set: async () => {},
            setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (quoi) =>
            (quoi === 'evaluationsSauvegardees' ? evaluationsEnBase : []),
        obtenirPreference: () => null,
        obtenirEtudiantsCoursActif: () => [],
        obtenirSeuil: (chemin) => (chemin === 'defiSpecifique' ? 0.70 : null),
        chargerSeuilsInterpretation: () => ({
            defiSpecifique: 0.70,
            interpretation: { excellent: 0.85, bon: 0.80, acceptable: 0.70 }
        }),
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0 }),
        determinerNiveauRaiPedagogique: (da) => ({
            niveau: da === '222' ? 3 : 2,
            pattern: da === '222' ? 'Difficulté persistante' : 'Difficulté émergente'
        }),
        calculerProgressionArtefacts: () => null,
        estEtudiantExclu: () => false,
        filtrerEtudiantsParMode: (arr) => arr,
        estModeeLectureSeule: () => false
    };
    win = chargerScript('js/interventions.js', stubs);
});

describe('#575 B1+B2 · le quatrième repli IDME et sa clé morte ont disparu', () => {

    it('`convertirNiveauEnPourcentage` n\'existe plus nulle part', () => {
        // Ratchet. Elle n'était exposée sur aucun `window` : un appelant qui la
        // ressusciterait la redéclarerait en global, silencieusement.
        const coupables = fichiersJs().filter((f) =>
            /convertirNiveauEnPourcentage/.test(sansCommentaires(readFileSync(f, 'utf8'))));
        expect(coupables.map((f) => path.relative(racine, f))).toEqual([]);
    });

    it('les quatre valeurs du repli ne sont plus écrites dans `portfolio.js`', () => {
        const code = sansCommentaires(lire('js/portfolio.js'));
        // 69.5 / 79.5 / 92.5 sont les valeurs SIGNATURE de ce repli : elles
        // n'apparaissent nulle part ailleurs dans le fichier.
        expect(code).not.toMatch(/69\.5/);
        expect(code).not.toMatch(/79\.5/);
        expect(code).not.toMatch(/92\.5/);
        expect(code).not.toMatch(/valeursDefaut/);
    });

    it('la clé `echellesPerformance` n\'est plus ni lue ni écrite', () => {
        // C'était le cœur de B2 : une clé LUE et JAMAIS ÉCRITE rend son repli
        // permanent (patron `feedback-cle-db-lue-jamais-ecrite`). La garde vaut
        // dans les deux sens — une écriture neuve ressusciterait la lecture.
        const coupables = fichiersJs().filter((f) =>
            /echellesPerformance/.test(sansCommentaires(readFileSync(f, 'utf8'))));
        expect(coupables.map((f) => path.relative(racine, f))).toEqual([]);
    });
});

describe('#575 B3+B4 · les cinq critères de Grégoire sont sortis de `interventions.js`', () => {

    it('aucun des cinq noms n\'est écrit dans le code du module', () => {
        const code = sansCommentaires(lire('js/interventions.js'));
        for (const nom of ['Structure', 'Rigueur', 'Plausibilité', 'Nuance', 'Français']) {
            expect(code).not.toContain(`'${nom}'`);
            expect(code).not.toContain(`"${nom}"`);
        }
    });

    it('`obtenirPerformancesSRPNF` n\'existe plus', () => {
        const coupables = fichiersJs().filter((f) =>
            /obtenirPerformancesSRPNF/.test(sansCommentaires(readFileSync(f, 'utf8'))));
        expect(coupables.map((f) => path.relative(racine, f))).toEqual([]);
    });

    it('le compteur de défis VIVANT lit la grille de l\'utilisateur, pas une liste', () => {
        // `mettreAJourCriteresCibles` est le chemin qui reste — celui qui affiche
        // « — 3/5 en défi » à côté de chaque case. Vérification statique et non
        // par exécution : la fonction lit le DOM (`getElementById`,
        // `parentElement`), et l'environnement des tests est `node`, sans jsdom.
        // Ce qui compte ici est sa SOURCE de critères, et elle se lit.
        const src = lire('js/interventions.js');
        const debut = src.indexOf('function mettreAJourCriteresCibles');
        expect(debut).toBeGreaterThan(-1);
        // ⚠ COMMENTAIRES RETIRÉS AVANT D'ASSERTER. Mesuré au break-test : le corps
        // de cette fonction CITE `calculerMoyennesCriteres` dans un commentaire
        // (« correspondre aux clés de… »), et un `toContain` brut restait donc vert
        // alors que l'appel réel avait été remplacé par une valeur fixe. C'est le
        // défaut d'assertion relevé au §4 de l'audit du 27 août sur #549 : une
        // sentinelle satisfaite par sa propre ligne d'ancrage ne prouve rien.
        const corps = sansCommentaires(src.slice(debut, src.indexOf('\n}', debut)));
        expect(corps).toContain('calculerMoyennesCriteres(da)');
        expect(corps).toContain("obtenirSeuil('defiSpecifique')");
        // Les cases elles-mêmes sont bâties sur `grilleRef.criteres` :
        expect(src).toContain('grilleRef.criteres.map');
    });
});

describe('#575 · `analyserSousGroupe` fonctionne toujours, amputée de ce qu\'elle inventait', () => {

    it('elle ne rend plus `defisCommuns`', () => {
        evaluationsEnBase = [];
        const analyse = win.analyserSousGroupe(['111']);
        expect(analyse).not.toHaveProperty('defisCommuns');
    });

    it('elle rend toujours les patterns et les niveaux RàI du sous-groupe', () => {
        // Ce qu'elle produit d'utile — et ce que l'aperçu affiche réellement.
        // Sans ce test, retirer `defisCommuns` pourrait emporter le reste sans
        // qu'aucun rouge ne le dise.
        // ⚠ TROIS étudiants, dont DEUX qui partagent un pattern : c'est ce qui
        // rend l'assertion capable de mordre. Avec un seul étudiant par pattern,
        // un comptage cassé en `= 1` rendrait le même objet que le comptage juste
        // — la sentinelle serait verte sur le défaut (mesuré au break-test).
        const analyse = win.analyserSousGroupe(['111', '222', '333']);
        expect(analyse.nbEtudiants).toBe(3);
        expect(analyse.patternsCommuns).toEqual({
            'Difficulté émergente': 2,
            'Difficulté persistante': 1
        });
        expect(analyse.niveauxRai).toEqual({ '1': 0, '2': 2, '3': 1 });
    });
});
