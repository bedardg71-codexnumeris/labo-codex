/**
 * SENTINELLE #790 (volet C) — LE LIBELLÉ CHANGE, LA CLÉ RESTE.
 *
 * « CAF » (Centre d'Aide en Français) devient « Mesure d'aide » : le champ vit dans une application qui
 * vise toutes les disciplines, et il dit un fait administratif — l'élève EST inscrit à une mesure —, pas
 * une matière. Décision de Grégoire, 8 septembre 2026, après sa remarque : « il s'agit ici du français,
 * ma discipline, mais ce pourrait être une autre matière qui est diagnostiquée. »
 *
 * ⛔ CE QUE CE BANC EMPÊCHE, ET C'EST TOUT SON OBJET : que quelqu'un « finisse le travail » en renommant
 * la CLÉ `caf` en même temps que le libellé. Elle voyage — import CSV, export CSV, pack de démonstration,
 * et les fichiers d'élèves que Grégoire a déjà constitués. La renommer casserait ces fichiers pour un
 * gain nul, puisque personne ne lit le nom de la clé.
 *
 * ⚠ MESURÉ LE 8 SEPTEMBRE, ET ÇA CONTREDIT LE CADRAGE : il annonçait un champ de formulaire
 * (`etudiantCAF`) à renommer. Il n'existe pas. Toute la famille `etudiant*` a disparu d'`index.html` au
 * profit de `v2-etudiant*`, qui ne porte AUCUN champ pour cette donnée — elle n'entre donc que par
 * import CSV. Voir les deux trouvailles inscrites au BACKLOG plutôt que corrigées ici.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

describe('#790 volet C · « Mesure d\'aide » — le libellé change, la clé reste', () => {
    it('la CLÉ `caf` est intacte partout où elle voyage', () => {
        // Import, export et lecture du profil doivent parler de la même clé. Si l'un des trois
        // migrait vers un nom neuf, les fichiers d'élèves déjà constitués cesseraient de se relire.
        expect(lire('js/groupe.js')).toContain('caf: [');
        expect(lire('js/groupe.js')).toContain('s.caf');
        expect(lire('js/profil-etudiant-sections-affichage.js')).toContain("etudiant.caf === 'Oui'");
        expect(lire('js/profil-etudiant-sections-affichage.js')).toContain("eleve.caf === 'Oui'");
    });

    it('plus aucun « CAF » affiché à l\'écran dans les deux sites du profil', () => {
        const src = lire('js/profil-etudiant-sections-affichage.js');
        // On cherche le sigle SEUL, entouré de guillemets ou de balises — pas les codes couleur
        // `#4CAF50`, qui contiennent les mêmes trois lettres et n'ont rien à voir.
        expect(src).not.toMatch(/>CAF</);
        expect(src).not.toMatch(/'CAF'/);
        expect(src).toContain("Mesure d\\'aide");
    });

    it('l\'en-tête d\'export porte le nom neuf', () => {
        expect(lire('js/groupe.js')).toContain("SA,Mesure d\\'aide");
    });

    it('⮕ ET IL SE RELIT : « mesure d\'aide » est reconnu à l\'import, sans que les anciens sortent', () => {
        // Le point qui fait qu'un fichier réexporté aujourd'hui n'est pas perdu demain. Les anciens
        // en-têtes restent dans la liste : un fichier de l'an dernier se relit toujours.
        const alias = lire('js/groupe.js');
        expect(alias).toContain("'mesure d\\'aide'");
        expect(alias).toContain("'caf'");
        expect(alias).toContain("'centre d\\'aide'");
        expect(alias).toContain("'aide français'");
    });
});
