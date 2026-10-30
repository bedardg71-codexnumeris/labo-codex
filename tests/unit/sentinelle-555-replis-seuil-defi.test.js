import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

// #555 lot 2 (28 août 2026) — « les quatre replis divergents ».
//
// CE QUI A ÉTÉ MESURÉ, ET QUI CORRIGE L'ÉNONCÉ DU BACKLOG. Celui-ci affirmait
// que « deux fichiers répondent différemment à la même question quand la
// préférence est absente ». C'est faux : `obtenirSeuil` rend TOUJOURS une
// valeur — clé absente → `SEUILS_PAR_DEFAUT` — et `chargerSeuilsInterpretation`
// auto-guérit le stockage incomplet. Les replis `|| 0.70` / `|| 0.75` ne se
// déclenchaient que sur une valeur falsy, qu'aucun des trois chemins d'écriture
// ne peut produire (`seuilsInterpretation` ne transite ni par l'import ni par
// le Codex). C'étaient donc des VALEURS MORTES qui documentaient deux
// conventions contradictoires — le risque n'était pas un calcul faux, mais un
// lecteur qui prend 0,75 pour la règle.
//
// CE QUE CETTE SENTINELLE VERROUILLE :
//   1. aucun repli local ne se pose sur le retour d'`obtenirSeuil('defiSpecifique')` ;
//   2. les deux MIROIRS de dernier recours (la table de `_obtenirSeuil` dans
//      `pratique-pan-standards.js`, la garde de chargement d'`interventions.js`)
//      portent la valeur de la source, jamais une seconde convention.
//
// Elle COMPARE à `SEUILS_PAR_DEFAUT` au lieu de coder 0,70 en dur : changer la
// source sans changer les miroirs doit rougir (break-test 4). Un chiffre écrit
// ici en ferait une troisième convention de plus.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. remettre `|| 0.75` à `profil-etudiant-sections-affichage.js` → cas 2 rougit.
//   2. remettre `'defiSpecifique': 0.75` à la table de `_obtenirSeuil` → cas 3 rougit.
//   3. changer le `0.70` de la garde d'`interventions.js` → cas 4 rougit.
//   4. porter `defiSpecifique` à 0.80 dans `interpretation-config.js` SEUL →
//      les cas 3 ET 4 rougissent (preuve que la comparaison est réelle).

// Mémoire du projet : une assertion statique qui lit la source DOIT retirer les
// commentaires d'abord, sinon elle est satisfaite par sa propre documentation —
// les commentaires posés par ce chantier citent `|| 0.75` mot pour mot.
function lireCodeSansCommentaires(chemin) {
    const brut = readFileSync(path.join(racine, chemin), 'utf8');
    return brut
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter((ligne) => !/^\s*\/\//.test(ligne))
        .join('\n');
}

// La SOURCE, lue et non recopiée.
function seuilSource() {
    const code = lireCodeSansCommentaires('js/interpretation-config.js');
    const bloc = code.match(/defiSpecifique:\s*([0-9.]+)/);
    expect(bloc, '`defiSpecifique` a disparu de SEUILS_PAR_DEFAUT').not.toBeNull();
    return parseFloat(bloc[1]);
}

// Les fichiers qui consomment le seuil de défi, mesurés le 28 août 2026.
const CONSOMMATEURS = [
    'js/profil-etudiant-calculs.js',
    'js/profil-etudiant-sections-affichage.js',
    'js/interventions.js',
    'js/pratiques/pratique-pan-standards.js'
];

describe('#555 lot 2 · le seuil de défi n\'a qu\'une source', () => {

    it('1. la source existe et reste un nombre exploitable', () => {
        const source = seuilSource();
        expect(Number.isFinite(source), 'le défaut n\'est plus un nombre').toBe(true);
        expect(source > 0 && source <= 1, 'le défaut est sorti de l\'échelle 0-1').toBe(true);
    });

    it('2. aucun repli local ne se pose sur le retour d\'obtenirSeuil(\'defiSpecifique\')', () => {
        const fautifs = [];
        for (const fichier of CONSOMMATEURS) {
            const code = lireCodeSansCommentaires(fichier);
            // `obtenirSeuil('defiSpecifique')` ou `this._obtenirSeuil(...)`, suivi
            // d'un `||` et d'un nombre — le patron exact des replis retirés.
            const motif = /_?obtenirSeuil\(\s*['"]defiSpecifique['"]\s*\)\s*\|\|\s*[0-9]/g;
            const trouves = code.match(motif);
            if (trouves) fautifs.push(`${fichier} → ${trouves.join(', ')}`);
        }
        expect(fautifs, 'un repli local est revenu masquer la source').toEqual([]);
    });

    it('3. le miroir de pratique-pan-standards porte la valeur de la source', () => {
        const source = seuilSource();
        const code = lireCodeSansCommentaires('js/pratiques/pratique-pan-standards.js');
        const miroir = code.match(/['"]defiSpecifique['"]\s*:\s*([0-9.]+)/);
        expect(miroir, 'la table de repli de `_obtenirSeuil` a disparu').not.toBeNull();
        expect(
            parseFloat(miroir[1]),
            'le miroir de `_obtenirSeuil` diverge de SEUILS_PAR_DEFAUT — c\'est exactement le défaut de #555'
        ).toBe(source);
    });

    it('4. la garde de chargement d\'interventions.js porte la valeur de la source', () => {
        const source = seuilSource();
        const code = lireCodeSansCommentaires('js/interventions.js');
        // Le ternaire de garde : fonction absente → valeur de dernier recours.
        const garde = code.match(
            /typeof\s+obtenirSeuil\s*===\s*['"]function['"][\s\S]{0,120}?:\s*([0-9.]+)/
        );
        expect(garde, 'la garde de chargement d\'`interventions.js` a disparu ou changé de forme').not.toBeNull();
        expect(
            parseFloat(garde[1]),
            'la garde d\'`interventions.js` diverge de SEUILS_PAR_DEFAUT'
        ).toBe(source);
    });

    it('5. la garde d\'interventions.js sépare bien le chargement de la valeur', () => {
        const code = lireCodeSansCommentaires('js/interventions.js');
        // L'ancienne forme enveloppait le ternaire ENTIER dans un `|| 0.70`, ce
        // qui confondait « fonction absente » et « valeur falsy ». Elle ne doit
        // pas revenir : le `)` fermant du ternaire suivi d'un `||` la signe.
        const ancienneForme = /\?\s*obtenirSeuil\(\s*['"]defiSpecifique['"]\s*\)\s*:\s*null\s*\)\s*\|\|/;
        expect(
            ancienneForme.test(code),
            'la forme qui confond garde de chargement et repli de valeur est revenue'
        ).toBe(false);
    });

    it('5 bis. (#551, ↻ 30 oct. 2026) la suggestion d\'objectif lit les repères de l\'échelle : plus aucun seuil idme.*, plus aucun repli', () => {
        // Le comportement (un repère à 0 reste 0) est éprouvé par la sentinelle #746-#551 ; ceci est le cliquet de FORME.
        const code = lireCodeSansCommentaires('js/interventions.js');
        expect(code).not.toMatch(/obtenirSeuil\(\s*['"]idme\./);
        expect(code).toMatch(/window\.bornesDepistage\(\)/);
        expect(code).not.toMatch(/bornes\.(bas|maitrise)\s*\|\|/);
    });

    it('6. la table miroir ne porte plus que le seuil de défi : idme.* est sorti du modèle et du miroir', () => {
        const config = lireCodeSansCommentaires('js/interpretation-config.js');
        const code = lireCodeSansCommentaires('js/pratiques/pratique-pan-standards.js');
        expect(config).not.toMatch(/\bidme\s*:/);
        expect(code).not.toMatch(/['"]idme\./);
    });
});
