import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// LE PARAMÈTRE ANTI-CACHE DE main.js (7 août 2026).
//
// INCIDENT. La migration #367 vit dans `main.js`, au boot. Elle a été livrée
// sans toucher au `?v=` de son <script> — resté au 6 août. Le navigateur de
// Grégoire voyait donc la MÊME URL qu'avant et servait son `main.js` en cache,
// SANS le bloc de migration. Constat terrain : `drapeau: false`, 38 entrées
// encore dans la clé nue, plusieurs heures après le déploiement.
//
// Le détecteur prévu pour ça (`init-inline.js` compare le build de
// `version.json` au `_SCRIPT_BUILD_main` embarqué) ne peut PAS fonctionner en
// `file://` : la lecture de version.json y est bloquée par CORS. Le filet
// existait donc, mais pas dans le mode d'usage réel de Grégoire.
//
// ⚠ `main.js` porte les MIGRATIONS AU BOOT. Un `main.js` périmé ne dégrade pas
// l'affichage — il empêche des migrations de données de s'exécuter, en silence
// et sans limite de durée. C'est le fichier où la péremption coûte le plus cher.
//
// INVARIANT VERROUILLÉ : la date du `?v=` de main.js doit être CELLE du build
// qu'il embarque. Le script de release réécrit `_SCRIPT_BUILD_main` à chaque
// version — si le `?v=` ne suit pas, ce test rougit.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceIndex = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
const sourceMain = readFileSync(path.join(racineProjet, 'js', 'main.js'), 'utf8');

describe('Anti-cache · main.js porte les migrations, il ne doit jamais être servi périmé', () => {
    const balise = /js\/main\.js\?v=(\d{8})([a-z]*)/.exec(sourceIndex);
    const build = /window\._SCRIPT_BUILD_main = '(\d{2})(\d{2})-\d{4}'/.exec(sourceMain);

    it('le <script> de main.js porte un paramètre anti-cache daté', () => {
        expect(balise, 'js/main.js?v=AAAAMMJJ… introuvable dans index.html').toBeTruthy();
    });

    it('main.js embarque bien son build', () => {
        expect(build, "window._SCRIPT_BUILD_main = 'MMJJ-HHMM' introuvable").toBeTruthy();
    });

    it('la DATE du ?v= est celle du build embarqué', () => {
        // C'est l'invariant qui aurait attrapé l'incident : le build passait au
        // 0807 pendant que le ?v= restait au 20260806.
        const mmjjParam = balise[1].slice(4);          // AAAAMMJJ → MMJJ
        const mmjjBuild = build[1] + build[2];         // MMJJ
        expect(
            mmjjParam,
            `?v=${balise[1]}${balise[2]} (${mmjjParam}) ne correspond pas au build ${mmjjBuild} : ` +
            'un navigateur qui a déjà chargé la page servira un main.js périmé, ' +
            'donc SANS les migrations au boot.'
        ).toBe(mmjjBuild);
    });

    // --- #417 (8 août 2026) : init-inline.js, l'angle mort du filet ---------
    //
    // `release.mjs` réécrit les DEUX fallbacks de version d'init-inline.js à
    // chaque release — mais n'a jamais bumpé son `?v=`, resté au 20260629
    // après plus de vingt réécritures. Même classe de défaut que l'incident
    // #367 ci-dessus, un fichier plus loin.
    //
    // Gravité propre : init-inline.js ne porte pas de migration, mais il porte
    // les FALLBACKS de version — précisément ce qui s'affiche en `file://`, où
    // la lecture de version.json est bloquée par CORS. Un init-inline.js
    // périmé annonce donc une vieille version à l'utilisateur exactement dans
    // le mode d'usage où aucun autre indicateur ne le contredit.
    //
    // Le correctif est dans `release.mjs` (il bumpe désormais lui-même le ?v=
    // des fichiers qu'il embarque) ; ce test est le cliquet qui le maintient.
    describe('#417 · init-inline.js porte les fallbacks de version — jamais périmé non plus', () => {
        const sourceInit = readFileSync(path.join(racineProjet, 'js', 'init-inline.js'), 'utf8');
        const baliseInit = /js\/init-inline\.js\?v=(\d{8})([a-z]*)/.exec(sourceIndex);
        const buildInit = /let BUILD_ID = '(\d{2})(\d{2})-\d{4}'/.exec(sourceInit);

        it('le <script> d’init-inline.js porte un paramètre anti-cache daté', () => {
            expect(baliseInit, 'js/init-inline.js?v=AAAAMMJJ… introuvable dans index.html').toBeTruthy();
        });

        it('init-inline.js embarque bien le build', () => {
            expect(buildInit, "let BUILD_ID = 'MMJJ-HHMM' introuvable").toBeTruthy();
        });

        it('la DATE du ?v= est celle du BUILD_ID qu’il embarque', () => {
            const mmjjParam = baliseInit[1].slice(4);
            const mmjjBuild = buildInit[1] + buildInit[2];
            expect(
                mmjjParam,
                `?v=${baliseInit[1]}${baliseInit[2]} (${mmjjParam}) ne correspond pas au BUILD_ID ${mmjjBuild} : ` +
                'en file://, l’utilisateur verra un numéro de version périmé sans rien pour le détromper.'
            ).toBe(mmjjBuild);
        });
    });

    it('les modules touchés par le chantier alignement portent tous un ?v=', () => {
        // Un fichier sans paramètre est mis en cache sans aucune porte de sortie.
        const modules = [
            'js/main.js', 'js/planification-carte.js', 'js/planification-donnees.js',
            'js/organisateur.js', 'js/trimestres.js', 'js/preferences.js',
            'js/changelog-data.js'
        ];
        for (const m of modules) {
            const re = new RegExp(m.replace(/[.\/]/g, '\\$&') + '\\?v=[0-9a-zA-Z]+');
            expect(re.test(sourceIndex), `${m} chargé sans ?v=`).toBe(true);
        }
    });
});
