import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const harnessSansCsp = 'file://' + path.join(__dirname, 'harness', 'sandbox-harness.html');
const harnessAvecCsp = 'file://' + path.join(__dirname, 'harness', 'sandbox-harness-csp.html');

// Tests A.1, A.2, A.4 du plan Défense I (PLAN §2 catégorie A).
// A.3 (hash CSP) est dans tests/unit/csp-hash.test.js (statique, Vitest).
//
// Référence : docs/securite/audits/TESTS-DEFENSE-A-2026-05-08.md §3 (9
// vecteurs validés en prototype). Ces tests automatisent les 3 plus
// critiques pour prévenir une régression silencieuse de l'isolation.

test.describe('Défense A · sandbox isolation', () => {

    // A.1 — Origine opaque. Garantie par la spec sandbox sans
    // `allow-same-origin`. Indépendant de la CSP. C'est la défense
    // de premier niveau : même si un payload arrive à s'exécuter dans
    // la sandbox (cas du harness sans CSP), il n'a aucun accès aux
    // ressources du parent.
    test('A.1 · origine opaque · payload ne peut ni lire ni écrire le parent', async ({ page }) => {
        await page.goto(harnessSansCsp);

        const resultat = await page.evaluate(async () => {
            // Pose un canari connu côté parent.
            localStorage.setItem('apercu-sandbox-canary', 'safe-original');
            window.__tentativesRecues = [];
            window.addEventListener('message', (e) => {
                if (e.data && e.data.source === 'apercu-test') {
                    window.__tentativesRecues.push(...(e.data.tentatives || []));
                }
            });

            // Payload qui tente 4 vecteurs d'évasion classiques.
            const payload = `
                <p>Aperçu (test A.1)</p>
                <script>
                    var t = [];
                    try {
                        parent.localStorage.setItem('apercu-sandbox-canary', 'pwned-' + Date.now());
                        t.push({nom: 'localStorage.setItem', ok: true});
                    } catch (e) {
                        t.push({nom: 'localStorage.setItem', ok: false, err: e.name});
                    }
                    try {
                        var v = parent.localStorage.getItem('apercu-sandbox-canary');
                        t.push({nom: 'localStorage.getItem', ok: true, valeur: v});
                    } catch (e) {
                        t.push({nom: 'localStorage.getItem', ok: false, err: e.name});
                    }
                    try {
                        var titre = parent.document.title;
                        t.push({nom: 'document.title', ok: true, valeur: titre});
                    } catch (e) {
                        t.push({nom: 'document.title', ok: false, err: e.name});
                    }
                    try {
                        var c = parent.document.cookie;
                        t.push({nom: 'document.cookie', ok: true, valeur: c});
                    } catch (e) {
                        t.push({nom: 'document.cookie', ok: false, err: e.name});
                    }
                    parent.postMessage({source: 'apercu-test', tentatives: t}, '*');
                <\/script>
            `;

            const conteneur = document.getElementById('conteneur');
            window.ApercuSandbox.afficher(conteneur, payload);
            return true;
        });
        expect(resultat).toBe(true);

        // Attendre que les 4 tentatives reviennent du payload.
        await page.waitForFunction(
            () => window.__tentativesRecues && window.__tentativesRecues.length >= 4,
            null,
            { timeout: 5000 }
        );

        const verdict = await page.evaluate(() => ({
            tentatives: window.__tentativesRecues,
            canari: localStorage.getItem('apercu-sandbox-canary')
        }));

        // Les 4 tentatives doivent toutes échouer (SecurityError attendu).
        expect(verdict.tentatives).toHaveLength(4);
        for (const t of verdict.tentatives) {
            expect(t.ok, `${t.nom} aurait dû lever une erreur`).toBe(false);
            expect(t.err).toBe('SecurityError');
        }
        // Le canari côté parent reste intact.
        expect(verdict.canari).toBe('safe-original');
    });

    // A.2 — CSP `script-src 'self' 'sha256-…'` rejette les scripts inline
    // injectés. Seul le messenger figé (hash en CSP) est autorisé. Le
    // payload n'arrive même pas à s'exécuter, donc aucun message
    // `source: 'apercu-test'` ne peut nous parvenir.
    test('A.2 · CSP rejette les scripts inline injectés dans le contenu', async ({ page }) => {
        await page.goto(harnessAvecCsp);

        await page.evaluate(() => {
            window.__messagesTest = [];
            window.addEventListener('message', (e) => {
                if (e.data && e.data.source === 'apercu-test') {
                    window.__messagesTest.push(e.data);
                }
            });

            const payload = `
                <p>Aperçu (test A.2)</p>
                <script>
                    parent.postMessage({source: 'apercu-test', exfil: 'PAYLOAD-EXECUTE'}, '*');
                <\/script>
                <img src="x" onerror="parent.postMessage({source:'apercu-test',exfil:'IMG-ONERROR'},'*')">
            `;

            const conteneur = document.getElementById('conteneur');
            window.ApercuSandbox.afficher(conteneur, payload);
        });

        // Laisser largement le temps à un éventuel script malicieux de tourner.
        await page.waitForTimeout(800);

        const messages = await page.evaluate(() => window.__messagesTest);
        expect(messages, 'Aucun message `apercu-test` ne doit parvenir au parent — la CSP doit rejeter les scripts inline').toEqual([]);
    });

    // A.4 — Filtrage strict du postMessage côté parent. Le seul effet
    // atteignable est `iframe.style.height` à une valeur numérique
    // clampée. Tout payload mal formé doit être ignoré silencieusement.
    //
    // Subtilité (finding ultrareview) : si on poste les messages depuis
    // le PARENT (`window.postMessage({...}, '*')`), `event.source` côté
    // listener vaut `window` — pas une iframe — donc le filtre « instance
    // trouvée » (boucle ligne ~71-78 de securite-apercu-sandbox.js) rejette
    // tous les messages avant même les filtres source/type/numérique/signe.
    // Pour exercer RÉELLEMENT ces 4 filtres, il faut que les messages
    // proviennent d'une iframe enregistrée dans `instances[]` — donc on
    // injecte le payload dans `htmlContenu` pour qu'il s'exécute dans la
    // sandbox et poste vers `parent`.
    test('A.4 · postMessage filtré · 4 messages malformés depuis l\'iframe rejetés', async ({ page }) => {
        await page.goto(harnessSansCsp);

        // Payload exécuté DANS l'iframe sandbox. Les 4 messages testent
        // chacun un filtre côté listener du parent ; les valeurs 998/999
        // dépassent hauteurMax — si elles passaient, la hauteur clampée
        // serait 600 (preuve d'échec d'un filtre).
        const payloadMalformes = [
            '<p style="height: 30px; margin: 0;">A.4 malformés</p>',
            '<scr' + 'ipt>',
            '  parent.postMessage({source: "autre-marque", type: "hauteur", valeur: 999}, "*");',         // filtre source
            '  parent.postMessage({source: "apercu-sandbox", type: "autre-type", valeur: 998}, "*");',    // filtre type
            '  parent.postMessage({source: "apercu-sandbox", type: "hauteur", valeur: "pas-un-nombre"}, "*");', // filtre numérique
            '  parent.postMessage({source: "apercu-sandbox", type: "hauteur", valeur: -1000}, "*");',     // filtre signe
            '</scr' + 'ipt>'
        ].join('');

        await page.evaluate((p) => {
            const conteneur = document.getElementById('conteneur');
            window.ApercuSandbox.afficher(
                conteneur, p, { hauteurMin: 100, hauteurMax: 600 }
            );
        }, payloadMalformes);

        // Attendre au-delà de setTimeout(800) du messenger natif pour que
        // tous les messages aient eu le temps d'être traités (ou rejetés).
        await page.waitForTimeout(1100);

        const hauteurFinale = await page.evaluate(() =>
            parseInt(document.querySelector('#conteneur iframe').style.height, 10)
        );

        // Si UN SEUL message malformé avait passé le filtre concerné, la
        // hauteur se serait positionnée à hauteurMax (600 pour 998/999) ou
        // à hauteurMin (pour -1000 clampé). Donc :
        //   - hauteurFinale < 600 → les filtres source ET type ont rejeté
        //   - hauteurFinale est cohérente avec un contenu de ~30 px clampé
        //     à hauteurMin → aucun malformé n'a fait grandir l'iframe
        //   - le filtre numérique a rejeté la chaîne (sinon NaN aurait été
        //     traité par le code qui lit `parseInt(data.valeur, 10)`)
        expect(hauteurFinale).toBeGreaterThanOrEqual(100);
        expect(hauteurFinale).toBeLessThan(600);

        // Confirme aussi qu'aucun script n'a été injecté dans le DOM
        // parent (les payloads malformés tournaient dans la sandbox,
        // pas dans le contexte du parent).
        const scriptsParent = await page.evaluate(
            () => document.querySelectorAll('script[data-injecte]').length
        );
        expect(scriptsParent).toBe(0);
    });

});
