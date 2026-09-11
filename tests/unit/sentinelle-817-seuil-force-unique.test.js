import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

// #817 (10 sept. 2026) — « trois seuils pour force et défi, l'Aide n'en décrit qu'un ».
//
// CE QUI A ÉTÉ MESURÉ. L'Aide annonce une symétrie : force ≥ 70 %, défi < 70 %.
// Le code ne l'avait pas. `defiSpecifique` (0,70, réglable dans Labo > Outils
// d'observation) décidait le DÉFI, pendant que 0,7125 — écrit en dur, sans
// commentaire d'origine, dans DEUX fichiers d'affichage — décidait la FORCE.
// Le diagnostic par critère écrivait même ce nombre à l'écran : « seuil force :
// 0.7125 ». Arbitrage de Grégoire, ce jour-là : « ce seuil est un résidu, c'est
// l'utilisateur qui doit fixer les seuils. » Les deux copies lisent désormais
// `obtenirSeuil('defiSpecifique')`, et la symétrie décrite par l'Aide est réelle.
//
// ⚠ Le troisième seuil du constat (0,75, borne D→M de l'échelle IDME) n'est PAS
// visé ici : ce n'est pas un seuil de dépistage mais une borne de niveau. Le
// rapprocher serait un autre chantier, et un autre arbitrage.
//
// CE QUE CETTE SENTINELLE VERROUILLE :
//   1. plus aucun 0,7125 vivant dans `js/` ;
//   2. les deux fonctions de couleur ne peuvent plus CONTREDIRE leur étiquette —
//      une seule branche rend le vert, et c'est celle du seuil. La branche
//      `>= 0.75` retirée rendait le MÊME vert que celle du dessous : inoffensive
//      tant que le seuil valait 0,7125, elle aurait peint en vert un « Défi »
//      dès que l'utilisateur monte le curseur au-dessus de 0,75 ;
//   3. « Force » et « Défi » se départagent au MÊME seuil (la symétrie) ;
//   4. le libellé affiché DÉRIVE du seuil au lieu de le recopier.
//
// Elle ne code aucun chiffre : elle lit `SEUILS_PAR_DEFAUT`. Changer la source
// sans changer les lecteurs doit rougir.
//
// Break-tests (faits rougir AVANT de faire confiance à cette sentinelle) :
//   1. remettre `0.7125` à `estForce` → cas 2 et 4 rougissent.
//   2. remettre la branche `if (score >= 0.75) return 'var(--vert-succes)'` à
//      `obtenirCouleurScore` → cas 3 rougit.
//   3. écrire `70` en dur dans le titre du diagnostic → cas 5 rougit.
//   4. comparer `estDefi` à un autre seuil que `estForce` → cas 4 rougit.

// Mémoire du projet : une assertion statique qui lit la source DOIT retirer les
// commentaires d'abord, sinon elle est satisfaite par sa propre documentation —
// les commentaires posés par ce chantier citent « 0.7125 » mot pour mot.
function sansCommentaires(brut) {
    return brut
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter((ligne) => !/^\s*\/\//.test(ligne))
        .join('\n');
}

function lireCode(chemin) {
    return sansCommentaires(readFileSync(path.join(racine, chemin), 'utf8'));
}

function listerJs(dossier) {
    const out = [];
    for (const entree of readdirSync(dossier)) {
        const complet = path.join(dossier, entree);
        if (statSync(complet).isDirectory()) out.push(...listerJs(complet));
        else if (entree.endsWith('.js')) out.push(complet);
    }
    return out;
}

// La SOURCE, lue et non recopiée.
function seuilSource() {
    const bloc = lireCode('js/interpretation-config.js').match(/defiSpecifique:\s*([0-9.]+)/);
    expect(bloc, '`defiSpecifique` a disparu de SEUILS_PAR_DEFAUT').not.toBeNull();
    return parseFloat(bloc[1]);
}

// Isole le corps d'une fonction fléchée déclarée `const <nom> = (score) => { … };`
function corpsDeLaFonction(code, nom) {
    const debut = code.indexOf(`const ${nom} = (score) => {`);
    expect(debut, `\`${nom}\` a disparu ou changé de signature`).toBeGreaterThan(-1);
    const fin = code.indexOf('};', debut);
    expect(fin, `\`${nom}\` n'a plus de fin lisible`).toBeGreaterThan(debut);
    return code.slice(debut, fin);
}

// ↻ #824 (11 sept. 2026) : la seconde copie du seuil vivait dans `genererDiagnosticSRPNF`
// (`js/profil-etudiant-diagnostics.js`), un chemin MORT — aucun appelant, jamais affiché.
// Retirée avec lui ; ce banc ne garde que la copie VIVANTE, celle des badges du profil.
const BADGES = 'js/profil-etudiant-sections-affichage.js';

describe('#817 · le seuil force/défi n\'a qu\'une source, et la couleur ne peut pas le contredire', () => {

    it('1. la source existe et reste un nombre exploitable', () => {
        const source = seuilSource();
        expect(Number.isFinite(source), 'le défaut n\'est plus un nombre').toBe(true);
        expect(source > 0 && source <= 1, 'le défaut est sorti de l\'échelle 0-1').toBe(true);
    });

    it('2. plus aucun 0,7125 vivant dans js/', () => {
        const fautifs = [];
        for (const fichier of listerJs(path.join(racine, 'js'))) {
            const code = sansCommentaires(readFileSync(fichier, 'utf8'));
            if (/0\.7125|71\.25/.test(code)) fautifs.push(path.relative(racine, fichier));
        }
        expect(fautifs, 'le seuil résiduel de #817 est revenu en dur').toEqual([]);
    });

    it('3. une SEULE branche rend le vert dans chaque fonction de couleur, et c\'est celle du seuil', () => {
        const cas = [
            { fichier: BADGES, fonction: 'obtenirCouleurBadge' }
        ];
        for (const { fichier, fonction } of cas) {
            const corps = corpsDeLaFonction(lireCode(fichier), fonction);
            const branchesVertes = corps.match(/if\s*\([^)]*\)\s*return\s*'var\(--vert-succes\)'/g) || [];
            expect(
                branchesVertes.length,
                `${fonction} rend le vert par ${branchesVertes.length} branches : une couleur peut désormais contredire son étiquette`
            ).toBe(1);
            expect(
                branchesVertes[0],
                `${fonction} rend le vert sur autre chose que le seuil de force`
            ).toMatch(/score\s*>=\s*seuilForce/);
        }
    });

    it('4. « Force » et « Défi » se départagent au même seuil, lu dans la source', () => {
        expect(
            lireCode(BADGES),
            'les badges de critères ne lisent plus la source'
        ).toMatch(/const\s+seuilForce\s*=\s*obtenirSeuil\(\s*['"]defiSpecifique['"]\s*\)/);
    });

    it('5. aucun libellé « seuil force : N % » ne recopie un nombre en dur — le titre du diagnostic par critère, jamais affiché, est parti avec #824', () => {
        for (const fichier of listerJs(path.join(racine, 'js'))) {
            const code = sansCommentaires(readFileSync(fichier, 'utf8'));
            for (const m of code.matchAll(/seuil force[^\n]*/g)) {
                expect(
                    /:\s*&nbsp;?\s*[0-9]/.test(m[0]),
                    `${path.relative(racine, fichier)} : un pourcentage en dur dans « ${m[0].slice(0, 40)} »`
                ).toBe(false);
            }
        }
    });
});
