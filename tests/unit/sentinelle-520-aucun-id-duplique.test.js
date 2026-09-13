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
 * BREAK-TESTS attendus : un second `id="nomEchelleTemplate"` → A et B rougissent ;
 * une seconde écriture de `configEchelle` → C rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

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

describe('#520 · B — les huit ex-doublons survivent, une fois chacun', () => {
    it('le champ Nom de l\'éditeur et les sept conteneurs de compatibilité gardent leur id', () => {
        const compte = compterIds();
        for (const id of HUIT) expect(compte.get(id) || 0, id).toBe(1);
    });

    it('le bloc « ANCIEN SYSTÈME » des échelles est parti', () => {
        expect(HTML).not.toContain('ANCIEN SYSTÈME (Caché par défaut, gardé pour compatibilité)');
    });
});

describe('#520 · C — la clé nue `configEchelle` n\'est plus aplatie', () => {
    it('un seul écrivain reste : `chargerEchelleTemplate`, qui y copie `echelle.config`', () => {
        const ecritures = [...ECHELLES.matchAll(/db\.(?:set|setSync|modifier)\(\s*'configEchelle'/g)];
        expect(ecritures.length, 'écritures de configEchelle dans echelles.js').toBe(1);
        // Règle 10 : tranche() refuse un corps introuvable ou tronqué — un marqueur
        // renommé jette au lieu de rendre une tranche vide où « une écriture » passerait.
        const corps = tranche(ECHELLES, 'async function chargerEchelleTemplate(', '\nasync function ', { longueurMin: 1500 });
        expect(corps.match(/db\.(?:set|setSync|modifier)\(\s*'configEchelle'/g) || [],
            'l\'écriture restante doit être celle de chargerEchelleTemplate').toHaveLength(1);
    });

    it('les deux fonctions qui l\'aplatissaient sont parties', () => {
        expect(ECHELLES).not.toMatch(/function\s+sauvegarderConfigEchelle\s*\(/);
        expect(ECHELLES).not.toMatch(/function\s+changerTypeEchelle\s*\(/);
    });
});
