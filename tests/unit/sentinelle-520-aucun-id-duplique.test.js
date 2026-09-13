/**
 * SENTINELLE #520 — `index.html` NE PORTE AUCUN IDENTIFIANT DUPLIQUÉ, ET LA
 * CONFIGURATION D'ÉCHELLE N'EST PLUS APLATIE EN SILENCE.
 *
 * Jusqu'au 13 sept. 2026, un bloc `u-hide` « ANCIEN SYSTÈME (Caché par défaut,
 * gardé pour compatibilité) » doublait huit identifiants : apercuEchelle,
 * champAutreEchelle, nomEchelleContainer, nomEchelleTemplate,
 * selectEchelleTemplate, seuilReussite, tableauNiveaux, typeEchelle.
 * `getElementById` rend la PREMIÈRE occurrence. ⚠ Ce n'était PAS l'éditeur
 * vivant, sauf pour `nomEchelleTemplate` (le champ Nom) : les sept autres
 * étaient des `<div>` VIDES d'un autre bloc caché, « Conteneurs cachés pour
 * compatibilité ». L'éditeur vivant porte d'autres ids (tableauNiveauxEchelle,
 * apercuEchelleNiveaux, conteneurEditionEchelle…). Les deux blocs étaient morts,
 * le second doublement. Le premier est retiré : 8 identifiants dupliqués → 0.
 *
 * ⚠⚠ CE N'ÉTAIT PAS INOFFENSIF. `#typeEchelle` étant un `<div>`, `changerTypeEchelle`
 * appelait `sauvegarderConfigEchelle`, qui réécrivait la clé nue `configEchelle`
 * aplatie (`notePassage` et `codesPersonnalises` vides, `typeEchelle` perdu s'il
 * n'avait jamais été posé) juste après que `chargerEchelleTemplate` y eut copié
 * `echelle.config`. L'ablation emporte `#notePassageContainer` : la garde mordait
 * désormais à chaque appel, et les deux fonctions sont retirées. SOURCE TARIE ;
 * le stock déjà aplati n'est pas réparé (fiche #520).
 *
 * ↻ 13 sept. 2026 (#658) : le second bloc, « Conteneurs cachés pour compatibilité »,
 * est retiré à son tour, avec tout ce qui rendait dedans. B et C sont RÉANCRÉS —
 * leur motif est écrit à côté de chacun.
 *
 * BREAK-TESTS attendus : un second `id="nomEchelleTemplate"` → A et B rougissent ;
 * un accès à `configEchelle` reposé dans echelles.js → C rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const HTML = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
const ECHELLES = readFileSync(path.join(racineProjet, 'js/echelles.js'), 'utf8');

/** Compte des attributs `id` des balises ouvrantes (pas `data-id`, pas `aria-*`). */
function compterIds() {
    const compte = new Map();
    for (const m of HTML.matchAll(/<[a-zA-Z][^<>]*>/g)) {
        for (const a of m[0].matchAll(/(?:^|\s)id\s*=\s*"([^"]*)"/g)) {
            compte.set(a[1], (compte.get(a[1]) || 0) + 1);
        }
    }
    return compte;
}

const HUIT = ['apercuEchelle', 'champAutreEchelle', 'nomEchelleContainer', 'nomEchelleTemplate',
              'selectEchelleTemplate', 'seuilReussite', 'tableauNiveaux', 'typeEchelle'];

describe('#520 · A — aucun identifiant dupliqué dans index.html', () => {
    it('chaque `id` n\'apparaît qu\'une fois', () => {
        const doublons = [...compterIds()].filter(([, n]) => n > 1).map(([id, n]) => `${id} ×${n}`);
        expect(doublons, 'getElementById ne rend que la PREMIÈRE occurrence : les suivantes sont mortes').toEqual([]);
    });
});

describe('#520 · B — le champ Nom survit une fois ; les sept conteneurs sont partis', () => {
    // ↻ RÉANCRÉ le 13 sept. 2026 (#658). Ce cas exigeait que les HUIT ex-doublons gardent
    // chacun leur id. Pour sept d'entre eux, l'occurrence survivante était un `<div>` vide du
    // bloc « Conteneurs cachés pour compatibilité », sans éditeur vivant derrière : #658 retire
    // ce bloc. Ce qui reste vrai, et que ce cas tient : le champ Nom de l'éditeur vivant est là,
    // UNE fois, et aucun des sept ne revient.
    it('`nomEchelleTemplate` garde son id ; les sept autres n\'existent plus', () => {
        const compte = compterIds();
        // Règle 10 : un compte vide rendrait « 0 » pour tout le monde, et le cas passerait.
        expect(compte.size, 'identifiants lus dans index.html').toBeGreaterThan(500);
        expect(compte.get('nomEchelleTemplate') || 0, 'nomEchelleTemplate').toBe(1);
        for (const id of HUIT.filter((i) => i !== 'nomEchelleTemplate')) expect(compte.get(id) || 0, id).toBe(0);
    });

    it('le bloc « ANCIEN SYSTÈME » des échelles est parti', () => {
        expect(HTML).not.toContain('ANCIEN SYSTÈME (Caché par défaut, gardé pour compatibilité)');
    });
});

describe('#520 · C — la clé nue `configEchelle` n\'est plus aplatie', () => {
    // ↻ RÉANCRÉ DÉLIBÉRÉMENT le 13 sept. 2026 (#658) — pas ajusté pour repasser au vert.
    // Ce cas exigeait EXACTEMENT UNE écriture de `configEchelle`, celle de
    // `chargerEchelleTemplate`. La mesure de #658 a montré que cette fonction n'avait plus
    // AUCUN déclencheur vivant : ses deux appelants étaient un bouton rendu dans
    // `#vueEchellesNiveaux` (conteneur caché) et `ajouterNiveauAEchelle` (sans appelant).
    // Le seul lecteur, `chargerConfigurationEchelle`, ne posait que des `.value` sur des
    // `<div>`. Ni écrivain atteignable, ni lecteur utile : la clé part avec #658.
    // Passer le compte de 1 à 0 aurait laissé un titre qui ment (« un seul écrivain reste ») ;
    // ce que le cas tient maintenant est plus fort : AUCUN accès ne subsiste, donc rien ne
    // peut plus l'aplatir. Le stock déjà écrit chez les gens reste, inerte (fiche #659).
    it('aucun accès à `configEchelle` ne subsiste dans echelles.js', () => {
        // Règle 10 : le même motif, sur la clé vivante du module, doit trouver ses accès —
        // sinon un motif cassé rendrait ce cas vert par construction.
        expect((ECHELLES.match(/db\.(?:get|getSync|set|setSync|modifier)\(\s*cle\('echellesTemplates'\)/g) || []).length,
            'le motif trouve les accès de la clé vivante').toBeGreaterThan(5);
        expect(ECHELLES.match(/db\.(?:get|getSync|set|setSync|modifier)\(\s*'configEchelle'/g) || [],
            'accès à configEchelle dans echelles.js').toEqual([]);
    });

    it('les deux fonctions qui l\'aplatissaient sont parties', () => {
        expect(ECHELLES).not.toMatch(/function\s+sauvegarderConfigEchelle\s*\(/);
        expect(ECHELLES).not.toMatch(/function\s+changerTypeEchelle\s*\(/);
    });
});
