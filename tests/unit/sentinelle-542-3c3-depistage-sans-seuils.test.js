import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #542 lot 3, pas 3c-3 — LE DÉPISTAGE NE LIT PLUS LES SEUILS
// `idme.*`, ET LES DEUX FONCTIONS QUI LES PORTAIENT ONT ÉTÉ SUPPRIMÉES.
//
// CE QUE LE PAS A RETIRÉ, ET QUI DOIT LE RESTER :
//
//   1. `interpreterPerformance` (`profil-etudiant-helpers.js`) — QUATRE seuils
//      en dur (0,85 / 0,75 / 0,65 / 0,40) et un TROISIÈME jeu de descriptions
//      SOLO reformulées. Elle était exportée sur `window` et appelée deux fois…
//      dans des variables que rien ne lisait. Retrait complet.
//   2. `interpreterScoreIDME` (`profil-etudiant-sections-affichage.js`) — trois
//      lectures de `obtenirSeuil('idme.*')` pour choisir entre quatre
//      descriptions courtes, assemblées dans un `patternTexte` lui aussi jamais
//      lu. Retrait complet.
//   3. Les quatre blocs figés de la carte « Observation de la structure », dont
//      l'EXISTENCE était décidée par `>= 0.85`, `>= seuilMaitrise && < 0.85`,
//      `>= idme.insuffisant && < seuilDeveloppement`, `< idme.insuffisant`.
//
// ⮕ POURQUOI CETTE SENTINELLE RETIRE LES COMMENTAIRES AVANT DE CHERCHER. Les
// trois retraits sont documentés SUR PLACE, et cette documentation cite le code
// disparu — les noms de fonctions, les seuils, les libellés IDME. Un grep naïf
// rougirait sur la trace du correctif au lieu du correctif. C'est le piège déjà
// rencontré par la sentinelle du repli de `obtenirPratiqueActuelle` : elle a dû
// tenir le COMPORTEMENT plutôt que le texte. Ici on garde le texte, mais on ne
// regarde que le CODE.
//
// ⮕ CE QUE CETTE SENTINELLE NE COUVRE PAS, ET QUI EST AILLEURS : ce que la
// carte AFFICHE désormais — un bloc par niveau de l'échelle de l'utilisateur.
// C'est un rendu, il se vérifie au navigateur :
// `tests/integration/depistage-542-3c3-carte-structure.spec.js`.

const racine = path.resolve(process.cwd(), '..');

function lireCodeSansCommentaires(chemin) {
    const brut = fs.readFileSync(path.join(racine, chemin), 'utf8');
    // Les blocs `/* … */` d'abord (JSDoc), puis les lignes dont le premier
    // caractère non blanc est `//`. Ne touche pas aux `//` internes d'une chaîne
    // (une URL, par exemple), qui ne commencent jamais une ligne.
    const sansBlocs = brut.replace(/\/\*[\s\S]*?\*\//g, '');
    return sansBlocs
        .split('\n')
        .filter((ligne) => !/^\s*\/\//.test(ligne))
        .join('\n');
}

describe('#542 pas 3c-3 · le dépistage ne lit plus les seuils IDME', () => {

    it('1. `interpreterPerformance` n\'existe plus — ni la fonction, ni son export', () => {
        // Le COMPORTEMENT, pas le texte : le module se charge, et le nom n'est
        // pas là. C'est la seule formulation qu'un commentaire de retrait ne peut
        // pas rendre verte par accident.
        const win = chargerScript('js/profil-etudiant-helpers.js', {
            db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
            cle: (k) => 'test_' + k,
            echapperHtml: (s) => String(s == null ? '' : s),
            obtenirDonneesSelonMode: () => [],
            obtenirPreference: () => null,
            obtenirEtudiantsCoursActif: () => [],
            afficherNotificationCopiee: () => {}, afficherSection: () => {}, afficherSousSection: () => {},
            calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
            obtenirSeuil: () => 0.70, chargerSeuilsInterpretation: () => ({}),
            estEtudiantExclu: () => false, filtrerEtudiantsParMode: (a) => a,
            estModeeLectureSeule: () => false, genererSeancesCompletes: () => {},
            calculerEtSauvegarderIndicesAssiduite: () => {}, calculerEtStockerIndicesCP: () => {}
        });
        // #821 lot A (10 sept. 2026) : `interpreterCompletion` et `interpreterAssiduite`
        // ont déménagé dans `contexte-qualification.js`. L'assertion tient toujours
        // — elles doivent EXISTER — mais on les cherche là où elles vivent.
        chargerScript('js/contexte-qualification.js', { obtenirSeuil: () => 0.70 }, win);

        expect(typeof win.interpreterPerformance,
            'la fonction est revenue, ou son export n\'a pas été retiré').toBe('undefined');

        // ⮕ SES DEUX VOISINES, ELLES, DOIVENT RESTER. C'est l'asymétrie qui a
        // démasqué le défaut : `interpreterCompletion` et `interpreterAssiduite`
        // lisent leurs seuils par `obtenirSeuil`, elle seule ne consultait rien.
        // Une suppression trop large les emporterait, et rien d'autre ne le dirait.
        expect(typeof win.interpreterCompletion, 'voisine emportée par erreur').toBe('function');
        expect(typeof win.interpreterAssiduite, 'voisine emportée par erreur').toBe('function');

        // Et les deux helpers qui ont pris le relais du chantier doivent être là.
        expect(typeof win.situerPourcentageDansEchelle).toBe('function');
        expect(typeof win.interpreterNiveauAtteint).toBe('function');
    });

    it('2. aucune lecture de seuil `idme.*` ne subsiste dans le code du dépistage', () => {
        const code = lireCodeSansCommentaires('js/profil-etudiant-sections-affichage.js');
        const lectures = code.match(/obtenirSeuil\(\s*['"]idme\.[a-z]+['"]\s*\)/g) || [];
        expect(lectures, `seuils IDME relus dans le code : ${lectures.join(', ')}`).toEqual([]);
    });

    it('3. aucun libellé IDME ni en-tête figé n\'est écrit dans le code de la carte', () => {
        const code = lireCodeSansCommentaires('js/profil-etudiant-sections-affichage.js');

        // Les quatre en-têtes que les seuils faisaient exister.
        for (const entete of ['Forces exceptionnelles', 'Forces identifiées', 'Défis en développement', 'Défis critiques']) {
            expect(code, `en-tête figé revenu : « ${entete} »`).not.toContain(entete);
        }
        // Les quatre libellés IDME écrits en clair à côté des critères.
        for (const libelle of ['Maîtrisé et étendu (E)', 'Maîtrisé (M)', 'En développement (D)', 'Incomplet (I)']) {
            expect(code, `libellé IDME revenu : « ${libelle} »`).not.toContain(libelle);
        }
    });

    it('4. les quatre descriptions SOLO d\'`interpreterPerformance` ont disparu du code', () => {
        const code = lireCodeSansCommentaires('js/profil-etudiant-helpers.js');
        const descriptions = [
            'Maîtrise étendue des compétences avec transfert',
            'Maîtrise globale avec liens établis entre les concepts',
            'Points pertinents identifiés, liens à consolider',
            'Compréhension superficielle, renforcement nécessaire'
        ];
        for (const d of descriptions) {
            expect(code, `description SOLO concurrente revenue : « ${d} »`).not.toContain(d);
        }

        // ⮕ ET LA SOURCE UNIQUE, ELLE, DOIT PORTER LES SIENNES. Sans cette
        // assertion, le test resterait vert si les descriptions disparaissaient
        // de PARTOUT — y compris de l'endroit où elles doivent vivre.
        const echelles = fs.readFileSync(path.join(racine, 'js/echelles.js'), 'utf8');
        expect(echelles, 'la table NIVEAUX_SOLO_ECHELLE doit porter les descriptions')
            .toContain('NIVEAUX_SOLO_ECHELLE');
        expect(echelles, 'la description du niveau relationnel doit vivre dans la table')
            .toContain('À ce niveau relationnel');
    });
});
