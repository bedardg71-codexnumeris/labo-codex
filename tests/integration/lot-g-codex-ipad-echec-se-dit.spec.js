import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LOT G (#988) — « METTRE À JOUR LE CODEX » SUR L'IPAD NE DIT RIEN QUAND IL ÉCHOUE
// =======================================================================
//
// Vécu le 29 sept. 2026 (iPad, Safari, codex d'environ 1 Go) : aucune fenêtre, aucun
// message, aucun fichier. Mesuré avant le lot : une AbortError du partage devenait
// « annulé » (sortie muette), les autres erreurs glissaient vers un téléchargement dont
// l'URL était libérée aussitôt, puis l'état « à jour » était posé sans rien savoir.
//
// Ce banc éprouve, sur le vrai code, avec un faux `navigator.share` (WebKit n'a pas de
// `showSaveFilePicker` : c'est le chemin de l'iPad) :
//   (a) aperçu refusé : la SEULE sortie muette ; la tentative est gardée ;
//   (b) partage rejeté par AbortError : le témoin dit « Codex non mis à jour », reste, la
//       modale propose « Réessayer » et « Télécharger à la place », le menu reste « pas à
//       jour », le rapport de bug a sa section ;
//   (c) « Réessayer » : le MÊME fichier (pas de nouvelle génération), rejeté par
//       NotAllowedError ; puis réussi : « à jour », le témoin s'efface ;
//   (d) « Télécharger à la place » : l'URL n'est pas libérée tout de suite ; « Il n'y est
//       pas » laisse « pas à jour » ; « Il y est » pose « à jour ».
//
// Pack démo, noms fictifs. Aucune écriture disque.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    return erreurs;
}

async function viderLeStockage(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        sessionStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
}

/** Faux partage piloté, aperçu piloté, relevés (toasts, liens cliqués, URL libérées). */
async function poserOutils(page) {
    await page.evaluate(() => {
        window.__toasts = [];
        new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
            if (n.nodeType === 1 && n.classList.contains('notification-avec-icone')) {
                window.__toasts.push(n.className.includes('notification-erreur') ? 'erreur:' + n.textContent : 'succes:' + n.textContent);
            }
        }))).observe(document.body, { childList: true });

        delete window.showSaveFilePicker;
        window.__partages = 0;
        window.__reponsesPartage = [];          // 'AbortError' | 'NotAllowedError' | 'ok'
        Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
        Object.defineProperty(navigator, 'share', {
            configurable: true,
            value: async () => {
                window.__partages++;
                const r = window.__reponsesPartage.shift() || 'ok';
                if (r === 'ok') return;
                const e = new Error('refus simulé (' + r + ')');
                e.name = r;
                throw e;
            }
        });

        window.__generations = 0;
        window.__reponseApercu = true;
        window.__apercuTaille = null;
        window.SecuriteExportPreview.previewZipEtConfirmer = async (zip, libelle, options) => {
            window.__generations++;
            window.__apercuTaille = options && options.taille;
            return window.__reponseApercu;
        };

        window.__liensCliques = 0;
        const clickOrig = HTMLAnchorElement.prototype.click;
        HTMLAnchorElement.prototype.click = function () {
            if (this.download) { window.__liensCliques++; return; }
            return clickOrig.call(this);
        };
        window.__urlsLiberees = 0;
        const revokeOrig = URL.revokeObjectURL;
        URL.revokeObjectURL = function (u) { window.__urlsLiberees++; return revokeOrig.call(URL, u); };
    });
}

async function lireEtat(page) {
    return page.evaluate(() => {
        Codex.toggleMenu();
        const el = document.querySelector('#codex-menu-statut-haut .codex-statut-etat');
        const menu = el ? el.textContent.replace('◉', '').trim() : null;
        Codex.toggleMenu();
        const echec = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec');
        const temoin = echec && echec.classList.contains('visible')
            ? echec.querySelector('.temoin-enregistrement-echec-texte').textContent : null;
        return { menu, temoin };
    });
}

/** La modale d'échec, si elle est ouverte : titre, message, boutons. */
async function lireModale(page) {
    return page.evaluate(() => {
        const o = document.getElementById('overlay-ui-dialogue');
        if (!o) return null;
        return {
            titre: o.querySelector('.modal-titre').textContent,
            message: o.querySelector('.modal-section').textContent,
            boutons: Array.from(o.querySelectorAll('.modal-actions button')).map((b) => b.textContent)
        };
    });
}

async function cliquerBouton(page, texte) {
    await page.evaluate((t) => {
        const b = Array.from(document.querySelectorAll('#overlay-ui-dialogue .modal-actions button')).find((x) => x.textContent === t);
        b.click();
    }, texte);
}

async function attendreModale(page, titre) {
    await page.waitForFunction((t) => {
        const o = document.getElementById('overlay-ui-dialogue');
        return o && o.querySelector('.modal-titre').textContent === t;
    }, titre, { timeout: 30000 });
}

/** Le rapport tel que la fenêtre « Signaler un bug » l'affiche (ouverte, lue, refermée). */
const rapport = (page) => page.evaluate(() => {
    ouvrirModalRapportBug();
    const texte = document.getElementById('rapportBugTexte').textContent;
    fermerModalRapportBug();
    return texte;
});
const sectionDuRapport = (r) => {
    const i = r.indexOf('--- DERNIÈRE MISE À JOUR DU CODEX ---');
    return i < 0 ? null : r.slice(i, r.indexOf('\n\n', i));
};

const A_JOUR = 'Ton codex est à jour';
const PAS_A_JOUR = 'Ton codex n\'a pas tes derniers changements';
const TEMOIN_ECHEC = /^Codex non mis à jour : le fichier \(environ \d+ (Ko|Mo)\) n'a pas été enregistré\. Tes données restent dans l'application\.$/;

test.describe('Lot G (#988) — l\'échec de la mise à jour du codex se dit', () => {
    test.setTimeout(180000);

    test('aperçu refusé, partage refusé, réessayer, télécharger à la place', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await viderLeStockage(page);
        await page.evaluate(() => activerModeDemo());
        await page.waitForTimeout(3000);
        await page.evaluate(() => db.setSync('_codex_etat', {
            actif: true, nom: 'Codex du banc', derniereSauvegarde: new Date().toISOString(),
            modificationsDepuis: null, manifeste: null, temoinFiable: true
        }));
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(5000);
        await poserOutils(page);

        // Avant toute tentative, le rapport le dit.
        expect(sectionDuRapport(await rapport(page))).toContain('Aucune tentative dans cet onglet');

        await page.evaluate(() => sauvegarderDonneesSelonMode('banc_lotG_a', { n: 1 }));
        expect((await lireEtat(page)).menu).toBe(PAS_A_JOUR);

        // (a) Aperçu refusé : aucun message, aucun témoin, aucune modale, toujours « pas à jour ».
        await page.evaluate(() => { window.__reponseApercu = false; });
        await page.evaluate(() => Codex.actionEnregistrer());
        await page.waitForTimeout(800);
        expect(await page.evaluate(() => window.__toasts)).toEqual([]);
        expect(await lireModale(page)).toBeNull();
        expect(await lireEtat(page)).toEqual({ menu: PAS_A_JOUR, temoin: null });
        expect(await page.evaluate(() => window.__apercuTaille)).toMatch(/^environ \d+ (Ko|Mo)$/);
        let section = sectionDuRapport(await rapport(page));
        expect(section).toContain('Étape atteinte: aperçu');
        expect(section).toContain('Issue: aperçu refusé par l\'usager');
        await page.evaluate(() => { window.__reponseApercu = true; });

        // (b) Partage rejeté par AbortError : l'échec se dit, et reste.
        await page.evaluate(() => { window.__reponsesPartage = ['AbortError', 'NotAllowedError', 'ok']; });
        await page.evaluate(() => { Codex.actionEnregistrer(); });
        await attendreModale(page, 'Codex non mis à jour');
        const generationsAvant = await page.evaluate(() => window.__generations);
        const modale = await lireModale(page);
        expect(modale.message).toMatch(/^Le fichier \(environ \d+ (Ko|Mo)\) n'a pas été enregistré\. Si ton appareil manque d'espace, libères-en, puis réessaie\. Tes données restent dans l'application\.$/);
        expect(modale.boutons).toEqual(['Fermer', 'Télécharger à la place', 'Réessayer']);
        let etat = await lireEtat(page);
        expect(etat.menu).toBe(PAS_A_JOUR);
        expect(etat.temoin).toMatch(TEMOIN_ECHEC);
        expect(await page.evaluate(() => window.__toasts)).toEqual([]);
        expect(await page.evaluate(() => window.__liensCliques)).toBe(0);
        const r1 = await rapport(page);
        section = sectionDuRapport(r1);
        expect(section).toContain('Étape atteinte: enregistrement du fichier');
        expect(section).toContain('Stratégie: partage (Enregistrer dans Fichiers)');
        expect(section).toContain('Erreur: AbortError – refus simulé (AbortError)');
        expect(section).toContain('Issue: échec de l\'écriture du fichier');
        expect(section).toContain('Essais d\'écriture: 1');
        expect(section).toMatch(/Taille du fichier: \d+ octets/);
        expect(section).not.toContain('Codex du banc');           // rien de personnel : ni nom, ni fichier
        expect(r1).toContain('--- AVERTISSEMENTS DU CODEX');
        expect(r1).toContain('[Codex] Partage du fichier échoué : AbortError');

        // (c) Réessayer : le même fichier (aucune nouvelle génération), rejeté par NotAllowedError.
        await cliquerBouton(page, 'Réessayer');
        await page.waitForFunction(() => window.__partages === 2, null, { timeout: 10000 });
        await attendreModale(page, 'Codex non mis à jour');
        expect(await page.evaluate(() => window.__generations)).toBe(generationsAvant);
        expect((await lireEtat(page)).menu).toBe(PAS_A_JOUR);
        section = sectionDuRapport(await rapport(page));
        expect(section).toContain('Erreur: NotAllowedError – refus simulé (NotAllowedError)');
        expect(section).toContain('Essais d\'écriture: 2');

        // … puis réussi : « à jour », le témoin s'efface, un succès.
        await cliquerBouton(page, 'Réessayer');
        await page.waitForFunction(() => window.__partages === 3, null, { timeout: 10000 });
        await page.waitForFunction(() => !Codex.etat().modificationsNonSauvees, null, { timeout: 10000 });
        expect(await lireEtat(page)).toEqual({ menu: A_JOUR, temoin: null });
        expect(await lireModale(page)).toBeNull();
        expect((await page.evaluate(() => window.__toasts)).filter((t) => t.startsWith('succes:Codex mis à jour'))).toHaveLength(1);
        section = sectionDuRapport(await rapport(page));
        expect(section).toContain('Issue: réussie');
        expect(section).toContain('Erreur: —');

        // (d) Télécharger à la place.
        await page.evaluate(() => sauvegarderDonneesSelonMode('banc_lotG_b', { n: 2 }));
        await page.evaluate(() => { window.__reponsesPartage = ['NotAllowedError']; });
        await page.evaluate(() => { Codex.actionEnregistrer(); });
        await attendreModale(page, 'Codex non mis à jour');
        const liberationsAvant = await page.evaluate(() => window.__urlsLiberees);
        await cliquerBouton(page, 'Télécharger à la place');
        await attendreModale(page, 'Téléchargement lancé');
        expect(await page.evaluate(() => window.__liensCliques)).toBe(1);
        await page.waitForTimeout(1500);
        // L'URL du fichier n'est pas libérée tout de suite (Safari écrit après le clic).
        expect(await page.evaluate(() => window.__urlsLiberees)).toBe(liberationsAvant);
        expect((await lireModale(page)).boutons).toEqual(['Il n\'y est pas', 'Il y est']);
        // Tant que l'usager n'a rien dit, rien n'est posé.
        expect((await lireEtat(page)).menu).toBe(PAS_A_JOUR);
        section = sectionDuRapport(await rapport(page));
        expect(section).toContain('Stratégie: téléchargement direct');
        expect(section).toContain('Étape atteinte: téléchargement lancé, en attente de l\'usager');

        // « Il n'y est pas » : pas à jour, l'échec se redit.
        await cliquerBouton(page, 'Il n\'y est pas');
        await attendreModale(page, 'Codex non mis à jour');
        etat = await lireEtat(page);
        expect(etat.menu).toBe(PAS_A_JOUR);
        expect(etat.temoin).toMatch(TEMOIN_ECHEC);
        expect(sectionDuRapport(await rapport(page))).toContain('Issue: téléchargement non trouvé par l\'usager');

        // « Il y est » : à jour.
        await cliquerBouton(page, 'Télécharger à la place');
        await attendreModale(page, 'Téléchargement lancé');
        await cliquerBouton(page, 'Il y est');
        await page.waitForFunction(() => !Codex.etat().modificationsNonSauvees, null, { timeout: 10000 });
        expect(await lireEtat(page)).toEqual({ menu: A_JOUR, temoin: null });
        expect(sectionDuRapport(await rapport(page))).toContain('Issue: téléchargement confirmé par l\'usager');

        // « Fermer » la modale : pas à jour, le témoin reste.
        await page.evaluate(() => sauvegarderDonneesSelonMode('banc_lotG_c', { n: 3 }));
        await page.evaluate(() => { window.__reponsesPartage = ['AbortError']; });
        await page.evaluate(() => { Codex.actionEnregistrer(); });
        await attendreModale(page, 'Codex non mis à jour');
        await cliquerBouton(page, 'Fermer');
        await page.waitForTimeout(500);
        expect(await lireModale(page)).toBeNull();
        etat = await lireEtat(page);
        expect(etat.menu).toBe(PAS_A_JOUR);
        expect(etat.temoin).toMatch(TEMOIN_ECHEC);

        expect(erreurs).toEqual([]);
    });

    test('une page rechargée pendant la tentative se lit « interrompue » dans le rapport', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await viderLeStockage(page);
        await page.evaluate(() => activerModeDemo());
        await page.waitForTimeout(3000);
        await poserOutils(page);
        // L'aperçu ne répond jamais : la tentative reste « en cours », puis l'onglet recharge.
        await page.evaluate(() => {
            window.SecuriteExportPreview.previewZipEtConfirmer = () => new Promise(() => {});
            Codex.actionEnregistrer();
        });
        await page.waitForFunction(() => Codex.derniereTentative() && Codex.derniereTentative().etape === 'aperçu', null, { timeout: 30000 });
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const section = sectionDuRapport(await rapport(page));
        expect(section).toContain('Étape atteinte: aperçu');
        expect(section).toContain('Issue: interrompue (la page a été rechargée pendant la tentative)');
        expect(erreurs).toEqual([]);
    });
});
