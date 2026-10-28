import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

const html = lire('index.html');
const AIDE = tranche(html, 'id="section-aide"', 'fin section-aide');
const TXT = AIDE.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

// SENTINELLE — lot D de l'audit de conformité de l'Aide (10 sept. 2026).
//
// Le lot cherchait les TROUS : ce que le code fait et dont l'Aide se tait. Il a
// aussi trouvé l'inverse — ce que l'Aide annonce et que le code ne fait pas :
//   · « Filtres par niveau de risque (prévu dans une version future) », présent
//     depuis le 6 déc. 2025 (a9d016f1) et jamais implémenté. Abandonné depuis
//     longtemps (décision de Grégoire, 10 sept.) : la phrase est retirée.
//   · « Module en cours de développement » sur la Modélisation. Décision de
//     Grégoire : le module n'est pas en chantier, c'est l'annotation réemployée
//     pour modéliser un exercice projeté en classe.
//   · quatre noms de fichiers d'export figés, qui ne correspondaient à aucun des
//     quatre exports réels.

describe('Aide — elle n\'annonce pas ce que le code ne fait pas', () => {

    it('aucun filtre par niveau de risque n\'est promis', () => {
        expect(TXT).not.toMatch(/[Ff]iltres? par niveau de risque/);
        // Et le code n'en a toujours pas : si un jour il en a un, c'est le
        // moment de réécrire l'Aide, pas de rétablir la vieille promesse.
        const filtres = html.match(/data-action="[a-zA-Z]*[Ff]iltre[a-zA-Z]*[Rr]isque/);
        expect(filtres).toBeNull();
    });

    // ↻ #1152, lot 2d (28 oct. 2026) : `modelisation` est absorbée par `labo`, qui la dit en une phrase (audit du 24 oct.,
    // verdict final de `modelisation` : « Fusionner avec « Labo — Analyser ta démarche pédagogique » » ; consigne
    // CONSIGNE-LOT-2026-10-28-aide-lot-2d-labo-codex-reference.md, §2, entrée 1). L'id d'avant n'existe plus : la garde lit
    // désormais la carte qui porte la Modélisation, et vérifie qu'elle la nomme.
    it('la Modélisation n\'est plus annoncée « en développement »', () => {
        expect(AIDE).not.toContain('accordeon-aide-modelisation');
        const i = AIDE.indexOf('id="accordeon-aide-labo"');
        expect(i).toBeGreaterThan(-1);
        const carte = AIDE.slice(i, AIDE.indexOf('accordeon-aide-', i + 30));
        expect(carte).toContain('Modélisation');
        expect(carte).not.toMatch(/en (?:cours de )?développement/i);
        // Le module est bien vivant : il réutilise la chaîne d'annotation.
        const mod = lire('js/modelisation.js');
        expect(mod).toMatch(/travaux-annotation|travauxUI/);
    });

    it('les noms de fichiers d\'export sont décrits, pas figés', () => {
        // genererNomFichierExport (cc-license.js) compose
        // <type>-[nom]-[cours]-[discipline]-[CC-BY-SA]-<horodatage>.json :
        // aucun nom figé ne peut rester juste.
        expect(TXT).not.toMatch(/YYYY-MM-DD/);
        const cc = lire('js/cc-license.js');
        expect(cc).toMatch(/function genererNomFichierExport/);
        expect(cc).toMatch(/parties\.push\('CC-BY-SA'\)/);
        // les quatre exports passent bien par cette fonction
        for (const f of ['js/grilles.js', 'js/echelles.js',
                         'js/productions-import-export.js', 'js/cartouches.js']) {
            expect(lire(f), f).toMatch(/genererNomFichierExport/);
        }
    });
});
