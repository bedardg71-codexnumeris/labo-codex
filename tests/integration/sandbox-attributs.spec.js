import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const harnessSansCsp = 'file://' + path.join(__dirname, 'harness', 'sandbox-harness.html');

// Tests E.13 et E.14 du plan Défense I — intégration côté Défense A
// (cf. PLAN §2.E + Défense A SP2). Préviennent une régression où
// quelqu'un retirerait `allow-scripts allow-popups` au profit de
// `allow-same-origin` (catastrophique : retire l'origine opaque) ou
// laisserait fuir des références iframe dans `instances[]`.

test.describe('Défense A · intégration', () => {

    test('E.13 · iframe sandbox a les bons attributs (pas d\'allow-same-origin)', async ({ page }) => {
        await page.goto(harnessSansCsp);

        const attrs = await page.evaluate(() => {
            const conteneur = document.getElementById('conteneur');
            window.ApercuSandbox.afficher(conteneur, '<p>Aperçu test</p>');
            const iframe = conteneur.querySelector('iframe');
            return {
                sandbox: iframe.getAttribute('sandbox'),
                referrerpolicy: iframe.getAttribute('referrerpolicy'),
                aSrcdoc: iframe.hasAttribute('srcdoc'),
                srcExterne: iframe.getAttribute('src')
            };
        });

        // L'attribut sandbox doit contenir allow-scripts et allow-popups
        // mais SURTOUT pas allow-same-origin (qui retirerait l'origine opaque).
        expect(attrs.sandbox).toBeTruthy();
        const tokens = attrs.sandbox.split(/\s+/);
        expect(tokens).toContain('allow-scripts');
        expect(tokens).toContain('allow-popups');
        expect(tokens).not.toContain('allow-same-origin');
        expect(tokens).not.toContain('allow-top-navigation');
        expect(tokens).not.toContain('allow-forms');

        expect(attrs.referrerpolicy).toBe('no-referrer');
        // Le contenu vient via srcdoc (sandbox autonome), pas via src externe.
        expect(attrs.aSrcdoc).toBe(true);
        expect(attrs.srcExterne).toBeNull();
    });

    test('E.14 · auto-cleanup MutationObserver · instances[] redescend à 0', async ({ page }) => {
        await page.goto(harnessSansCsp);

        const trace = await page.evaluate(async () => {
            const t = { initial: 0, apresOuverture: 0, apresDetachement: 0 };
            t.initial = window.ApercuSandbox.__nbInstances();

            // Créer 5 wrappers + 5 sandboxes (cas d'usage : la modale
            // d'import qui crée plusieurs aperçus dans une session).
            const wrappers = [];
            for (let i = 0; i < 5; i++) {
                const wrapper = document.createElement('div');
                wrapper.id = 'test-wrapper-' + i;
                wrapper.style.width = '400px';
                document.body.appendChild(wrapper);
                window.ApercuSandbox.afficher(wrapper, '<p>Aperçu ' + i + '</p>');
                wrappers.push(wrapper);
            }
            t.apresOuverture = window.ApercuSandbox.__nbInstances();

            // Simuler le pattern « call-site retire son wrapper sans rappeler
            // ApercuSandbox.fermer() ». Le MutationObserver doit attraper
            // le détachement et libérer chaque entrée.
            for (const w of wrappers) w.remove();

            // Laisser le MutationObserver s'exécuter (microtask + un cycle).
            await new Promise(r => setTimeout(r, 100));

            t.apresDetachement = window.ApercuSandbox.__nbInstances();
            return t;
        });

        expect(trace.initial).toBe(0);
        expect(trace.apresOuverture).toBe(5);
        expect(trace.apresDetachement).toBe(0);
    });

});
