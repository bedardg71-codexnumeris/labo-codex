import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle #596 (12 oct. 2026) — LES CLÉS DE SESSION QUI PORTENT UN IDENTIFIANT SONT NAMESPACÉES.
//
// Quatre clés `sessionStorage` rangent un identifiant de production ou de copie :
// `travaux-filtre-production`, `travaux-dernier-fichier`, `travaux-pipeline-production`,
// `travaux-jeton-production`. Nues, elles survivaient à un changement de trimestre dans le même
// onglet et resservaient l'identifiant de l'autre. Elles passent par `cle()` (ou `cleSession`, son
// repli dans travaux-ui.js) sur les cinq fichiers, lecture ET écriture dans le même geste : à moitié
// namespacées, les lectures ne trouveraient plus rien.
// Une cinquième, `travaux-mode-courant`, était écrite et jamais lue : retirée.
// Restent nues, à dessein : `travaux-pipeline-dpi` et `travaux-sidebar-replie` (des préférences
// d'affichage, sans identifiant), `travaux_bulle_annoter_vu` (une bulle d'aide vue une fois).
// Stock : ce qu'un onglet déjà ouvert a rangé sous l'ancien nom meurt avec l'onglet ; rien n'est recopié.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const JS = path.join(RACINE, 'js');
const fichiers = readdirSync(JS).filter((f) => f.endsWith('.js'));
const src = (f) => readFileSync(path.join(JS, f), 'utf8');
const CLES = ['travaux-filtre-production', 'travaux-dernier-fichier', 'travaux-pipeline-production', 'travaux-jeton-production'];

describe('#596 · les quatre clés de session à identifiant sont namespacées', () => {
    for (const nom of CLES) {
        it(`${nom} : aucun accès sessionStorage sous le nom nu, dans tout js/`, () => {
            const nus = [];
            const motif = new RegExp("sessionStorage\\.(?:get|set|remove)Item\\(\\s*['\"`]" + nom + "['\"`]");
            for (const f of fichiers) if (motif.test(src(f))) nus.push(f);
            expect(nus).toEqual([]);
        });
        it(`${nom} : lue ou écrite au moins une fois par cle()/cleSession()`, () => {
            const motif = new RegExp("sessionStorage\\.(?:get|set|remove)Item\\(\\s*(?:cle|cleSession)\\('" + nom + "'\\)");
            expect(fichiers.some((f) => motif.test(src(f)))).toBe(true);
        });
    }

    it('travaux-mode-courant (écrite, jamais lue) est retirée', () => {
        expect(fichiers.filter((f) => src(f).includes('travaux-mode-courant'))).toEqual([]);
    });

    it('cleSession de travaux-ui.js passe par cle quand elle existe', () => {
        expect(src('travaux-ui.js')).toMatch(/const cleSession = \(nom\) => \(typeof cle === 'function' \? cle\(nom\) : nom\);/);
    });
});
