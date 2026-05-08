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
    test('A.4 · postMessage avec valeur non numérique est ignoré', async ({ page }) => {
        await page.goto(harnessSansCsp);

        // Ouvre une sandbox avec un contenu prévisible et attend que le
        // messenger ait posé sa hauteur initiale.
        await page.evaluate(() => {
            const conteneur = document.getElementById('conteneur');
            window.ApercuSandbox.afficher(
                conteneur,
                '<p style="height: 50px; margin: 0;">Contenu test A.4</p>',
                { hauteurMin: 100, hauteurMax: 600 }
            );
        });
        await page.waitForTimeout(500);

        const hauteurInitiale = await page.evaluate(() => {
            const iframe = document.querySelector('#conteneur iframe');
            return iframe.style.height;
        });
        expect(hauteurInitiale).toBeTruthy();

        // Bombarder le parent avec 4 messages malformés, qui doivent
        // tous être rejetés par les filtres successifs du listener.
        await page.evaluate(() => {
            // Filtre source : mauvaise marque
            window.postMessage({source: 'autre-marque', type: 'hauteur', valeur: 999}, '*');
            // Filtre type : type inconnu
            window.postMessage({source: 'apercu-sandbox', type: 'autre-type', valeur: 999}, '*');
            // Filtre numérique : valeur = chaîne contenant un script
            window.postMessage({source: 'apercu-sandbox', type: 'hauteur', valeur: '<script>alert(1)</script>'}, '*');
            // Filtre signe : valeur négative
            window.postMessage({source: 'apercu-sandbox', type: 'hauteur', valeur: -50}, '*');
        });
        await page.waitForTimeout(300);

        const hauteurFinale = await page.evaluate(() => {
            const iframe = document.querySelector('#conteneur iframe');
            return iframe.style.height;
        });

        // Aucun des 4 messages malformés n'a modifié la hauteur.
        expect(hauteurFinale).toBe(hauteurInitiale);

        // Confirme aussi qu'aucun script n'a été injecté dans le DOM
        // parent (la chaîne '<script>' était dans `valeur`, jamais
        // interprétée comme HTML).
        const scriptsParent = await page.evaluate(
            () => document.querySelectorAll('script[data-injecte]').length
        );
        expect(scriptsParent).toBe(0);
    });

});
