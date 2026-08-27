import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// SENTINELLE #542 lot 3, pas 4 — LE SOLO D'UN CRITÈRE SE LIT, IL NE SE DEVINE
// PLUS DEPUIS SON NOM.
//
// LE DÉFAUT B9, tel qu'il vivait dans `js/trimestres.js` jusqu'au 27 août 2026.
// Deux fonctions jumelles, `obtenirNiveauSOLO()` et `obtenirTypeCritere()`,
// cherchaient cinq mots-clés dans le NOM d'un critère — « structure »,
// « rigueur », « français », « plausibilité », « nuance », c'est-à-dire les
// critères de Grégoire écrits dans le code — pour rendre deux vocabulaires du
// MÊME axe : `multistructural` / `relational` / `extended_abstract` d'un côté,
// `fondamental` / `transitionnel` / `complexe` de l'autre.
//
// ⮕ TROIS DÉFAUTS, et le troisième est le vrai :
//   1. Une grille « Méthode / Résultats / Discussion » recevait `multistructural`
//      sur TOUS ses critères, en silence.
//   2. Le vocabulaire rendu était ANGLAIS, alors que le champ configuré par
//      l'utilisateur est en français.
//   3. **LE CHAMP EXISTE.** `critere.niveauSOLO` est saisi dans l'éditeur de
//      grilles, et `calculerIPB` le lit déjà pour choisir les critères
//      « fondations ». Les deux fonctions devinaient donc une réponse que
//      l'utilisateur avait déjà donnée — et pouvaient la CONTREDIRE.
//
// ⮕ POURQUOI CE TEST RETIRE LES COMMENTAIRES AVANT DE CHERCHER. Le retrait est
// documenté sur place et cite les mots-clés disparus, comme trace. Un grep naïf
// rougirait sur la documentation du correctif au lieu du correctif. Même piège,
// même parade qu'à la sentinelle du pas 3c-3.
//
// ⮕ CE QUE CE TEST NE PEUT PAS COUVRIR, et il faut le savoir : `typeCritereSelonSOLO`
// est privée à l'IIFE de `trimestres.js` et n'est pas exportée. Son comportement
// n'est donc pas appelable ici. Ce qui est tenu, c'est que le NOM ne décide plus
// et que la SOURCE est le champ configuré — les deux moitiés du défaut B9.

const racine = path.resolve(process.cwd(), '..');

function lireCodeSansCommentaires(chemin) {
    const brut = fs.readFileSync(path.join(racine, chemin), 'utf8');
    const sansBlocs = brut.replace(/\/\*[\s\S]*?\*\//g, '');
    return sansBlocs
        .split('\n')
        .filter((ligne) => !/^\s*\/\//.test(ligne))
        .join('\n');
}

describe('#542 pas 4 · le SOLO d\'un critère vient du champ configuré', () => {

    it('1. les deux fonctions qui devinaient depuis le nom n\'existent plus', () => {
        const code = lireCodeSansCommentaires('js/trimestres.js');
        expect(code, '`obtenirNiveauSOLO` est revenue').not.toMatch(/function\s+obtenirNiveauSOLO\b/);
        expect(code, '`obtenirTypeCritere` est revenue').not.toMatch(/function\s+obtenirTypeCritere\b/);
        // Et plus aucun appel non plus — une définition retirée dont l'appel reste
        // est un `ReferenceError` à la première exportation.
        expect(code, 'appel orphelin à `obtenirNiveauSOLO`').not.toContain('obtenirNiveauSOLO(');
        expect(code, 'appel orphelin à `obtenirTypeCritere`').not.toContain('obtenirTypeCritere(');
    });

    it('2. aucun nom de critère de Grégoire n\'est écrit dans le code', () => {
        const code = lireCodeSansCommentaires('js/trimestres.js');
        // ⮕ C'EST L'ASSERTION QUI PORTE LE SENS DU PAS. Le défaut n'était pas
        // « une fonction de trop » : c'était cinq noms de critères d'un
        // utilisateur particulier, écrits dans du code que tout le monde exécute.
        const motsCles = ['structure', 'rigueur', 'français', 'plausibilité', 'plausibilite', 'nuance'];
        for (const mot of motsCles) {
            const trouve = code.match(new RegExp(`includes\\(\\s*['"]${mot}['"]`, 'i'));
            expect(trouve, `nom de critère revenu dans une comparaison : « ${mot} »`).toBeNull();
        }
    });

    it('3. l\'export de recherche lit le champ configuré, pour les DEUX champs', () => {
        const code = lireCodeSansCommentaires('js/trimestres.js');

        // `niveau_solo` doit venir de `c.niveauSOLO`, sur la même ligne : c'est la
        // moitié « la source est la donnée » du correctif.
        expect(code, '`niveau_solo` ne lit plus le champ configuré')
            .toMatch(/niveau_solo:\s*\(?\s*c\.niveauSOLO/);

        // `type` passe par le dérivateur, qui lit lui aussi `niveauSOLO`.
        expect(code, '`type` ne passe plus par le dérivateur').toMatch(/type:\s*typeCritereSelonSOLO\(/);
        expect(code, 'le dérivateur ne lit pas `niveauSOLO`')
            .toMatch(/function\s+typeCritereSelonSOLO[\s\S]{0,400}niveauSOLO/);
    });

    it('4. le défaut « multistructurel » est le MÊME que celui de calculerIPB', () => {
        // ⮕ LE POINT DE FOND, et la raison pour laquelle ce test existe. Trois
        // endroits lisent désormais `critere.niveauSOLO` : l'éditeur de grilles
        // (qui présélectionne), `calculerIPB` (qui choisit les critères
        // « fondations »), et l'export de recherche. S'ils ne partagent pas le
        // même défaut, un critère sans étiquette serait « fondation » pour l'IPB
        // et autre chose dans l'export — deux vérités sur la même donnée.
        const trimestres = lireCodeSansCommentaires('js/trimestres.js');
        const calculs = lireCodeSansCommentaires('js/profil-etudiant-calculs.js');

        expect(calculs, 'calculerIPB ne lit plus `niveauSOLO` avec son défaut')
            .toMatch(/c\.niveauSOLO\s*\|\|\s*'multistructurel'/);
        expect(trimestres, 'l\'export n\'applique pas le même défaut que calculerIPB')
            .toMatch(/niveauSOLO\s*\)?\s*\|\|\s*'multistructurel'/);
    });

    // -----------------------------------------------------------------------
    // #542 lot 3, pas 4 (suite) — L'EXPORT N'ANNONCE PLUS UNE ÉCHELLE QU'IL
    // N'A PAS LUE.
    //
    // ⚠ POURQUOI CES DEUX TESTS PÈSENT PLUS QUE LEURS VOISINS. Un affichage
    // trompeur se corrige au rechargement suivant. Un jeu de données de
    // recherche part ailleurs, est analysé, cité — et survit à sa correction.
    // L'export annonçait `['I','D','M','E']` à tout le monde, y compris à qui
    // note en W/X/Y/Z ; ce fichier-là n'était pas incomplet, il était faux.
    // -----------------------------------------------------------------------

    it('5. l\'échelle IDME et le seuil de réussite ne sont plus écrits dans l\'export', () => {
        const code = lireCodeSansCommentaires('js/trimestres.js');

        expect(code, 'la liste IDME en dur est revenue dans l\'export')
            .not.toMatch(/echelle:\s*\[\s*'I'\s*,\s*'D'\s*,\s*'M'\s*,\s*'E'\s*\]/);
        // `seuil_reussite` est retiré SANS remplaçant : aucune donnée du dépôt ne
        // dit quel niveau marque la réussite. Le champ ne peut donc pas revenir
        // « rempli autrement » — il ne peut revenir que supposé.
        expect(code, '`seuil_reussite` est revenu — or rien ne peut le renseigner')
            .not.toContain('seuil_reussite');
    });

    it('6. l\'export livre le catalogue des échelles, et chaque évaluation dit laquelle lire', () => {
        const code = lireCodeSansCommentaires('js/trimestres.js');

        // Le catalogue vient de la variable que la fonction chargeait déjà et
        // jetait sans usage.
        expect(code, 'le catalogue des échelles a disparu de l\'export')
            .toMatch(/echelles:\s*\(echelles\s*\|\|\s*\[\]\)/);

        // ⮕ ET SES PLAGES AVEC, sans quoi le catalogue ne servirait à rien : un
        // code de niveau seul ne dit ni à quel pourcentage il correspond, ni ce
        // qu'il signifie.
        const bloc = (code.match(/echelles:\s*\(echelles[\s\S]{0,900}/) || [''])[0];
        for (const champ of ['min', 'max', 'niveau_solo']) {
            expect(bloc, `le catalogue n'exporte plus « ${champ} »`).toContain(champ);
        }

        // Le lien entre une évaluation et son échelle. Sans lui, le catalogue est
        // là mais rien ne dit lequel de ses éléments s'applique.
        expect(code, 'les évaluations exportées ne portent plus leur `echelle_id`')
            .toMatch(/echelle_id:\s*e\.echelleId/);
    });
});
