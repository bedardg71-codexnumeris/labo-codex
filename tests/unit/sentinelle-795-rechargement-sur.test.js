/**
 * SENTINELLE #795 — L'APP NE SE RECHARGE PAS DANS LE VIDE.
 *
 * Rapport testeur du 9 septembre 2026 (BLOQUANT) : codex ouvert sur
 * app.codexnumeris.org, rechargement accepté, et l'application remplacée par le
 * « Page not found » de Netlify. Mesuré ce jour-là : le déploiement courant
 * était publié depuis 12:46:43 UTC et `ready` (incident à 13:54 UTC), l'origine
 * Netlify sert `index.html` en 200 — la panne était transitoire, côté livraison,
 * et rien dans le code ne la cause. Ce que le code peut faire, et ne faisait
 * pas : ne pas se saborder au pire moment, juste après une écriture.
 *
 * Ce que la sentinelle verrouille : la sonde (`version.json`, même origine,
 * `no-store`) décide du rechargement, l'échec garde la page en place et DIT que
 * les données sont écrites, et les quatre chemins post-import passent par elle.
 *
 * Break-test attendu : rendre la sonde aveugle (`if (!reponse.ok)` retiré) →
 * le cas 404 rougit ; rebrancher un `location.reload()` nu sur un des quatre
 * sites → le câblage rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');

/** Monte le module avec un faux window : protocole, sonde et modale pilotés. */
function monter({ protocol = 'https:', sonde }) {
    const journal = { reloads: 0, dialogues: [], alertes: [], urls: [] };
    const fauxWindow = {
        location: { protocol, reload: () => { journal.reloads++; } },
        fetch: async (url, opts) => { journal.urls.push({ url, opts }); return sonde(); },
        uiDialogues: {
            informer: async (o) => { journal.dialogues.push(o); }
        },
        alert: (m) => { journal.alertes.push(m); }
    };
    chargerScript('js/rechargement-sur.js', {}, fauxWindow);
    return { fauxWindow, journal };
}

describe('#795 · la sonde décide du rechargement', () => {
    it('serveur qui répond : la page se recharge', async () => {
        const { fauxWindow, journal } = monter({ sonde: () => ({ ok: true, status: 200 }) });
        await expect(fauxWindow.rechargerSiLeServeurRepond()).resolves.toBe(true);
        expect(journal.reloads).toBe(1);
        expect(journal.dialogues).toHaveLength(0);
        // Sonde légère et jamais servie depuis un cache.
        expect(journal.urls[0].url).toBe('version.json');
        expect(journal.urls[0].opts).toEqual({ cache: 'no-store' });
    });

    it('404 : la page reste, et la modale dit que les données sont écrites', async () => {
        const { fauxWindow, journal } = monter({ sonde: () => ({ ok: false, status: 404 }) });
        await expect(fauxWindow.rechargerSiLeServeurRepond()).resolves.toBe(false);
        expect(journal.reloads).toBe(0);
        expect(journal.dialogues).toHaveLength(1);
        expect(journal.dialogues[0].message).toContain('404');
        expect(journal.dialogues[0].message).toMatch(/données sont enregistrées/);
    });

    it('serveur injoignable : même refus, motif distinct', async () => {
        const { fauxWindow, journal } = monter({
            sonde: () => { throw new TypeError('Failed to fetch'); }
        });
        await expect(fauxWindow.rechargerSiLeServeurRepond()).resolves.toBe(false);
        expect(journal.reloads).toBe(0);
        expect(journal.dialogues[0].message).toContain('n\'a pas répondu');
        expect(journal.dialogues[0].message).not.toContain('404');
    });

    it('en file:// aucune sonde n\'est possible : le rechargement passe', async () => {
        const { fauxWindow, journal } = monter({
            protocol: 'file:',
            sonde: () => { throw new Error('la sonde ne doit pas être appelée'); }
        });
        await expect(fauxWindow.rechargerSiLeServeurRepond()).resolves.toBe(true);
        expect(journal.reloads).toBe(1);
        expect(journal.urls).toHaveLength(0);
    });

    it('sans uiDialogues, l\'avertissement passe quand même', async () => {
        const { fauxWindow, journal } = monter({ sonde: () => ({ ok: false, status: 503 }) });
        delete fauxWindow.uiDialogues;
        await fauxWindow.rechargerSiLeServeurRepond();
        expect(journal.alertes).toHaveLength(1);
        expect(journal.alertes[0]).toContain('503');
    });
});

describe('#795 · les quatre chemins post-import passent par la sonde', () => {
    const codex = lire('js/codex.js');
    const importExport = lire('js/import-export.js');
    const index = lire('index.html');

    it('l\'ouverture d\'un codex ne recharge plus à l\'aveugle', () => {
        expect(codex).toContain('await window.rechargerSiLeServeurRepond();');
        expect(codex).not.toMatch(/preformate: true\s*\n\s*\}\)\) \{\s*\n\s*window\.location\.reload\(\);/);
    });

    it('les deux rechargements d\'import-export sont branchés', () => {
        // #1047 (lot 12, 11 oct. 2026) : trois → deux, le troisième vivait dans `executerImportLocalStorageBrut`, code mort retiré.
        const appels = importExport.match(/await window\.rechargerSiLeServeurRepond\(\);/g) || [];
        expect(appels).toHaveLength(2);
        // Chacun suit immédiatement un confirm() de rechargement.
        const nus = importExport.match(/confirm\('[^']*[Rr]echarger[^']*'\)\) \{\s*\n\s*location\.reload\(\);/g) || [];
        expect(nus).toHaveLength(0);
    });

    it('le module est chargé avant ses appelants', () => {
        const iSonde = index.indexOf('js/rechargement-sur.js');
        const iImport = index.indexOf('js/import-export.js');
        const iCodex = index.indexOf('js/codex.js');
        expect(iSonde).toBeGreaterThan(-1);
        expect(iSonde).toBeLessThan(iImport);
        expect(iSonde).toBeLessThan(iCodex);
    });
});
