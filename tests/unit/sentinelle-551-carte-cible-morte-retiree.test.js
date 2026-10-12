import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// SENTINELLE #551 — `genererCarteCibleIntervention` EST RETIRÉE, ET CE QU'ELLE
// SEULE ATTEIGNAIT DOIT RESTER EN PLACE.
//
// CE QUI A ÉTÉ RETIRÉ, ET POURQUOI. La fonction rendait la carte « Cible
// d'intervention » du profil. Elle était MORTE : une seule occurrence dans tout
// le dépôt — sa définition — sans export `window`, sans appel, sans dispatch
// dynamique. Ses règles CSS `.carte-cible-*` (`styles.css`) sont parties avec
// elle, n'ayant aucune autre consommatrice.
//
// ⮕ CE QUE SA MORT A RÉVÉLÉ, ET QUI EST LE VRAI SUJET DE #551. Elle était LE
// SEUL consommateur, dans toute l'application, de `pratique.identifierPattern(da)`
// et de `pratique.genererCibleIntervention(da)`. Les CINQ implémentations de
// `identifierPattern` (PAN-Standards, Sommative, PAN-Spécifications,
// Configurable, Test) ne sont donc plus atteintes que par `testerPratiqueTest`
// et `testerPratiqueTest`, deux fonctions de console jamais appelées.
//
// ⚠ ET C'EST EXACTEMENT CE QUE CETTE SENTINELLE PROTÈGE. Le geste devait retirer
// la consommatrice morte SANS toucher aux cinq implémentations : `identifierPattern`
// et `genererCibleIntervention` sont deux des huit méthodes OBLIGATOIRES du contrat
// IPratique, vérifiées à l'enregistrement (`pratique-registre.js`, `throw` si
// absentes). Elles sont peut-être sans consommateur parce que le câblage du système
// de pratiques n'est pas fini (#307) — pas parce qu'elles sont périmées. Une
// suppression « de nettoyage » qui les emporterait casserait l'enregistrement de
// toutes les pratiques, et le test 4 est là pour le dire avant la mise en ligne.
//
// ⮕ POURQUOI LES COMMENTAIRES SONT RETIRÉS AVANT LA RECHERCHE. Le retrait est
// documenté sur place, dans le JS comme dans le CSS, et cette documentation cite
// le nom disparu et les classes disparues. Un grep naïf rougirait sur la trace du
// correctif au lieu du correctif. Même piège, même parade qu'à la sentinelle du
// pas 3c-3 de #542.

const racine = path.resolve(process.cwd(), '..');

function lireSansCommentaires(chemin) {
    const brut = fs.readFileSync(path.join(racine, chemin), 'utf8');
    const sansBlocs = brut.replace(/\/\*[\s\S]*?\*\//g, '');
    return sansBlocs
        .split('\n')
        .filter((ligne) => !/^\s*\/\//.test(ligne))
        .join('\n');
}

const AFFICHAGE = 'js/profil-etudiant-sections-affichage.js';
const REGISTRE = 'js/pratiques/pratique-registre.js';

const PRATIQUES = [
    'js/pratiques/pratique-pan-standards.js',
    'js/pratiques/pratique-sommative.js',
    'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/pratique-configurable.js'
    // #469 (lot 12, 11 oct. 2026) : `pratique-test.js` retiré.
];

describe('#551 · la carte « Cible d\'intervention » morte est retirée', () => {

    it('1. `genererCarteCibleIntervention` n\'existe plus nulle part dans le code', () => {
        // Tout le dépôt, pas seulement son fichier : c'est l'absence d'appel
        // autant que l'absence de définition qui compte.
        const fichiers = [AFFICHAGE, 'js/profil-etudiant-actions.js', 'js/tableau-bord-apercu.js', 'index.html'];
        for (const f of fichiers) {
            const code = f.endsWith('.html')
                ? fs.readFileSync(path.join(racine, f), 'utf8').replace(/<!--[\s\S]*?-->/g, '')
                : lireSansCommentaires(f);
            expect(code, `« genererCarteCibleIntervention » est revenue dans ${f}`)
                .not.toContain('genererCarteCibleIntervention');
        }
    });

    it('2. ses VOISINES du même fichier sont toujours là — une coupe trop large les emporterait en silence', () => {
        // La fonction retirée était encadrée par ces deux-là. Sans cette
        // assertion, une suppression de 200 lignes au lieu de 84 passerait le
        // test 1 avec les honneurs.
        const code = lireSansCommentaires(AFFICHAGE);
        for (const voisine of ['function genererSectionCollapsible(', 'function genererSectionAccompagnement(']) {
            expect(code, `voisine emportée par le retrait : ${voisine}`).toContain(voisine);
        }
    });

    it('3. le chemin VIVANT du même besoin est intact', () => {
        // ⚠ CE TEST A ÉTÉ CORRIGÉ PAR #552, ET C'EST LA MESURE QUI L'A EXIGÉ.
        //
        // Il tenait que `determinerCibleIntervention` était appelée DEUX fois :
        // depuis l'écran d'accompagnement et depuis la zone critique du tableau
        // de bord. La première moitié était fausse — pas l'appel, qui existait
        // bien, mais ce qu'il alimentait. Son résultat ne servait qu'à remplir
        // `badgeClasse` et `badgeLabel`, deux variables assignées quatre fois et
        // jamais lues. Le badge RàI rendu à l'écran vient de `niveauRai`, donc de
        // `determinerNiveauRaiPedagogique`.
        //
        // ⮕ L'appel mort a été retiré par #552. Ce qui reste à tenir, et qui
        // porte le sens de #551 : le tableau de bord, LUI, consomme vraiment la
        // fonction — et il n'en lit que `.pattern`.
        const bord = lireSansCommentaires('js/tableau-bord-apercu.js');
        expect(bord, 'la zone critique du tableau de bord n\'appelle plus determinerCibleIntervention')
            .toContain('determinerCibleIntervention(e.da)');

        const affichage = lireSansCommentaires(AFFICHAGE);
        expect(affichage, 'l\'appel mort à determinerCibleIntervention est revenu dans l\'accompagnement')
            .not.toContain('determinerCibleIntervention(da)');
    });

    it('4. les CINQ `identifierPattern` et leur contrat IPratique n\'ont pas été emportés', () => {
        // L'assertion qui porte le sens du geste : on a retiré la consommatrice,
        // pas les implémentations. Si un nettoyage ultérieur les emporte, toutes
        // les pratiques échouent à s'enregistrer — et ça doit rougir ICI.
        for (const fichier of PRATIQUES) {
            const code = lireSansCommentaires(fichier);
            expect(code, `identifierPattern retirée de ${fichier}`).toMatch(/\bidentifierPattern\s*\(da\)\s*\{/);
            expect(code, `genererCibleIntervention retirée de ${fichier}`).toMatch(/\bgenererCibleIntervention\s*\(da\)\s*\{/);
        }

        const registre = lireSansCommentaires(REGISTRE);
        for (const methode of ['identifierPattern', 'genererCibleIntervention']) {
            expect(registre, `« ${methode} » retirée du contrat IPratique — les pratiques ne s'enregistreront plus`)
                .toContain(`'${methode}'`);
        }
    });

    it('5. les règles CSS `.carte-cible-*` sont parties avec leur seule consommatrice', () => {
        const brut = fs.readFileSync(path.join(racine, 'styles.css'), 'utf8');
        const sansCommentaires = brut.replace(/\/\*[\s\S]*?\*\//g, '');
        expect(sansCommentaires, 'une règle .carte-cible-* est revenue sans consommatrice')
            .not.toContain('carte-cible');
    });
});
