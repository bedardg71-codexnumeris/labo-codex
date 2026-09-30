import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LOT J0 BIS (#988) — LE PARTAGE DU CODEX REFUSÉ APRÈS UNE PRÉPARATION LONGUE
// =======================================================================
//
// Vécu le 30 sept. 2026 (iPad, Safari 27, 1.170.1, codex de 1,3 Go) : la préparation dure
// 8 secondes après le toucher « Télécharger » de l'aperçu, puis `navigator.share` rend
// NotAllowedError ; « Réessayer » réussit. Mesuré le même jour sous WebKit 26.4 : le partage
// exige l'activation du dernier toucher, qui s'éteint après 5 s environ (actif à 4,5 s,
// éteint à 5,5 s), et `navigator.userActivation.isActive` lit cette même activation.
//
// Deux bancs, sur le vrai code :
//   1. « simulé » : une fausse activation et un faux partage qui rejette NotAllowedError
//      quand elle est inactive. Déterministe ; porte les cas (fenêtre, « Enregistrer »,
//      « Annuler », Échap, toucher actif, API absente, échec après le toucher frais).
//   2. « réel » : de vrais clics, la vraie activation de WebKit, le vrai `navigator.share`
//      (qui se résout sans feuille dans le WebKit du banc), une préparation allongée pour de
//      bon. ⚠ `page.evaluate` accorde lui-même une activation d'environ 5 s (mesuré) : entre
//      le clic et le partage, ce banc n'en fait AUCUN ; il attend côté Node.
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

async function ouvrirLaDemoAvecUnCodexActif(page) {
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
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
    await page.evaluate(() => db.setSync('_codex_etat', {
        actif: true, nom: 'Codex du banc', derniereSauvegarde: new Date().toISOString(),
        modificationsDepuis: null, manifeste: null, temoinFiable: true
    }));
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
}

/** Relevés communs aux deux bancs : toasts, titres de toutes les modales ouvertes. */
async function poserReleves(page) {
    await page.evaluate(() => {
        window.__toasts = [];
        window.__titresModales = [];
        new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
            if (n.nodeType !== 1) return;
            if (n.classList.contains('notification-avec-icone')) {
                window.__toasts.push(n.className.includes('notification-erreur') ? 'erreur:' + n.textContent : 'succes:' + n.textContent);
            }
            if (n.id === 'overlay-ui-dialogue') window.__titresModales.push(n.querySelector('.modal-titre').textContent);
        }))).observe(document.body, { childList: true });
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

async function lireModale(page) {
    return page.evaluate(() => {
        const o = document.getElementById('overlay-ui-dialogue');
        if (!o) return null;
        return {
            titre: o.querySelector('.modal-titre').textContent,
            message: o.querySelector('.modal-section').textContent,
            boutons: Array.from(o.querySelectorAll('.modal-actions button')).map((b) => b.textContent),
            principal: Array.from(o.querySelectorAll('.modal-actions button.btn-principal')).map((b) => b.textContent)
        };
    });
}

async function attendreModale(page, titre) {
    await page.waitForFunction((t) => {
        const o = document.getElementById('overlay-ui-dialogue');
        return o && o.querySelector('.modal-titre').textContent === t;
    }, titre, { timeout: 30000 });
}

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
const TITRE_PRET = 'Ton codex est prêt';
// Les mots acceptés par Grégoire le 30 sept. 2026 ; la taille est celle que dit déjà le message d'échec.
const MESSAGE_PRET = /^Le fichier \(environ \d+ (Ko|Mo)\) est préparé\. Touche « Enregistrer » pour choisir où le ranger\.$/;
const REFUS_WEBKIT = 'The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.';
const succes = (toasts) => toasts.filter((t) => t.startsWith('succes:Codex mis à jour'));

test.describe('Lot J0 bis (#988) — le partage du codex après une préparation longue', () => {
    test.setTimeout(240000);

    test('simulé : toucher expiré → « Ton codex est prêt », puis le partage dans le geste', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await ouvrirLaDemoAvecUnCodexActif(page);
        await poserReleves(page);

        // La fausse activation et le faux partage, tenus par les règles mesurées sous WebKit :
        //   · un clic (même scripté) accorde l'activation ; le partage la consomme ;
        //   · sans activation, le partage rejette NotAllowedError, le message de WebKit mot pour mot ;
        //   · l'aperçu (faux) répond « Télécharger » : c'est le dernier toucher avant le partage ;
        //     `__preparationLongue` dit si l'activation a expiré avant la fin de la préparation.
        await page.evaluate((refus) => {
            delete window.showSaveFilePicker;
            window.__activation = { active: false };
            window.__apiAbsente = false;
            window.__preparationLongue = true;
            document.addEventListener('click', () => { window.__activation.active = true; }, true);
            Object.defineProperty(navigator, 'userActivation', {
                configurable: true,
                get: () => (window.__apiAbsente ? undefined : { get isActive() { return window.__activation.active; } })
            });

            window.__partages = 0;
            window.__refusSansActivation = 0;
            window.__reponsesPartage = [];          // après le contrôle d'activation : 'AbortError' | 'ok'
            Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
            Object.defineProperty(navigator, 'share', {
                configurable: true,
                value: async () => {
                    window.__partages++;
                    if (!window.__activation.active) {
                        window.__refusSansActivation++;
                        const e = new Error(refus);
                        e.name = 'NotAllowedError';
                        throw e;
                    }
                    window.__activation.active = false;
                    const r = window.__reponsesPartage.shift() || 'ok';
                    if (r === 'ok') return;
                    const e = new Error('refus simulé (' + r + ')');
                    e.name = r;
                    throw e;
                }
            });

            window.__generations = 0;
            window.SecuriteExportPreview.previewZipEtConfirmer = async () => {
                window.__generations++;
                window.__activation.active = !window.__preparationLongue;
                return true;
            };
        }, REFUS_WEBKIT);

        const compteurs = () => page.evaluate(() => ({
            partages: window.__partages, refus: window.__refusSansActivation, generations: window.__generations
        }));
        const cliquerBouton = (texte) => page.evaluate((t) => {
            Array.from(document.querySelectorAll('#overlay-ui-dialogue .modal-actions button')).find((x) => x.textContent === t).click();
        }, texte);
        const modifier = (cle) => page.evaluate((c) => sauvegarderDonneesSelonMode(c, { n: 1 }), cle);

        // (a) Préparation longue : la fenêtre, les mots, et AUCUN partage tenté.
        await modifier('banc_j0bis_a');
        expect((await lireEtat(page)).menu).toBe(PAS_A_JOUR);
        await page.evaluate(() => { Codex.actionEnregistrer(); });
        await attendreModale(page, TITRE_PRET);
        let modale = await lireModale(page);
        expect(modale.message).toMatch(MESSAGE_PRET);
        expect(modale.boutons).toEqual(['Annuler', 'Enregistrer']);
        expect(modale.principal).toEqual(['Enregistrer']);
        expect(await compteurs()).toEqual({ partages: 0, refus: 0, generations: 1 });
        expect(await lireEtat(page)).toEqual({ menu: PAS_A_JOUR, temoin: null });
        let section = sectionDuRapport(await rapport(page));
        expect(section).toContain('Étape atteinte: enregistrement du fichier');
        expect(section).toContain('Toucher frais: demandé (toucher expiré)\n');
        expect(section).toContain('Issue: en cours');

        // (b) « Enregistrer » : le partage du MÊME fichier, une fois, dans le geste ; « à jour ».
        await cliquerBouton('Enregistrer');
        await page.waitForFunction(() => !Codex.etat().modificationsNonSauvees, null, { timeout: 10000 });
        expect(await compteurs()).toEqual({ partages: 1, refus: 0, generations: 1 });
        expect(await lireModale(page)).toBeNull();
        expect(await lireEtat(page)).toEqual({ menu: A_JOUR, temoin: null });
        expect(succes(await page.evaluate(() => window.__toasts))).toHaveLength(1);
        section = sectionDuRapport(await rapport(page));
        expect(section).toContain('Stratégie: partage (Enregistrer dans Fichiers)');
        expect(section).toContain('Toucher frais: demandé (toucher expiré), accordé');
        expect(section).toContain('Essais d\'écriture: 1');
        expect(section).toContain('Erreur: —');
        expect(section).toContain('Issue: réussie');

        // (c) « Annuler », puis Échap : l'annulation existante. Ni partage, ni fenêtre d'échec,
        //     ni témoin, ni message ; le codex n'est pas marqué à jour.
        for (const sortie of ['Annuler', 'Échap']) {
            await modifier('banc_j0bis_c_' + sortie);
            const avant = await compteurs();
            await page.evaluate(() => { window.__titresModales.length = 0; window.__toasts.length = 0; Codex.actionEnregistrer(); });
            await attendreModale(page, TITRE_PRET);
            if (sortie === 'Annuler') await cliquerBouton('Annuler');
            else await page.keyboard.press('Escape');
            await page.waitForFunction(() => !document.getElementById('overlay-ui-dialogue'), null, { timeout: 10000 });
            await page.waitForTimeout(600);
            expect(await lireModale(page)).toBeNull();
            expect(await page.evaluate(() => window.__titresModales)).toEqual([TITRE_PRET]);
            expect(await page.evaluate(() => window.__toasts)).toEqual([]);
            expect(await lireEtat(page)).toEqual({ menu: PAS_A_JOUR, temoin: null });
            expect(await compteurs()).toEqual({ partages: avant.partages, refus: 0, generations: avant.generations + 1 });
            section = sectionDuRapport(await rapport(page));
            expect(section).toContain('Toucher frais: demandé (toucher expiré), refusé');
            expect(section).toContain('Issue: fenêtre « Ton codex est prêt » refusée par l\'usager');
            expect(section).toContain('Erreur: —');
        }

        // (d) Préparation courte : le toucher tient encore, partage direct, AUCUNE fenêtre.
        await page.evaluate(() => { window.__preparationLongue = false; window.__titresModales.length = 0; window.__toasts.length = 0; });
        let avant = await compteurs();
        await page.evaluate(() => { Codex.actionEnregistrer(); });
        await page.waitForFunction(() => !Codex.etat().modificationsNonSauvees, null, { timeout: 30000 });
        expect(await compteurs()).toEqual({ partages: avant.partages + 1, refus: 0, generations: avant.generations + 1 });
        expect(await page.evaluate(() => window.__titresModales)).toEqual([]);
        expect(await lireEtat(page)).toEqual({ menu: A_JOUR, temoin: null });
        expect(succes(await page.evaluate(() => window.__toasts))).toHaveLength(1);
        section = sectionDuRapport(await rapport(page));
        expect(section).toContain('Toucher frais: non demandé');
        expect(section).toContain('Issue: réussie');

        // (e) API d'activation absente (Safari d'avant 16.4) : on ne sait pas, donc la fenêtre,
        //     même si le toucher tient encore.
        await modifier('banc_j0bis_e');
        await page.evaluate(() => { window.__apiAbsente = true; window.__titresModales.length = 0; });
        avant = await compteurs();
        await page.evaluate(() => { Codex.actionEnregistrer(); });
        await attendreModale(page, TITRE_PRET);
        expect((await compteurs()).partages).toBe(avant.partages);
        expect(sectionDuRapport(await rapport(page))).toContain('Toucher frais: demandé (activation illisible)\n');
        await cliquerBouton('Enregistrer');
        await page.waitForFunction(() => !Codex.etat().modificationsNonSauvees, null, { timeout: 10000 });
        expect(await compteurs()).toEqual({ partages: avant.partages + 1, refus: 0, generations: avant.generations + 1 });
        expect(sectionDuRapport(await rapport(page))).toContain('Toucher frais: demandé (activation illisible), accordé');
        await page.evaluate(() => { window.__apiAbsente = false; });

        // (f) Le partage échoue APRÈS le toucher frais : le parcours du lot G, inchangé. Puis
        //     « Réessayer » : son clic est un toucher frais, partage direct, pas de seconde fenêtre.
        //     Joué API absente : c'est le seul cas où repasser par la fenêtre se verrait.
        await modifier('banc_j0bis_f');
        await page.evaluate(() => {
            window.__apiAbsente = true;
            window.__preparationLongue = true;
            window.__reponsesPartage = ['AbortError'];
            window.__titresModales.length = 0;
            window.__toasts.length = 0;
        });
        avant = await compteurs();
        await page.evaluate(() => { Codex.actionEnregistrer(); });
        await attendreModale(page, TITRE_PRET);
        await cliquerBouton('Enregistrer');
        await attendreModale(page, 'Codex non mis à jour');
        modale = await lireModale(page);
        expect(modale.boutons).toEqual(['Fermer', 'Télécharger à la place', 'Réessayer']);
        let etat = await lireEtat(page);
        expect(etat.menu).toBe(PAS_A_JOUR);
        expect(etat.temoin).toMatch(/^Codex non mis à jour : le fichier \(environ \d+ (Ko|Mo)\) n'a pas été enregistré\./);
        section = sectionDuRapport(await rapport(page));
        expect(section).toContain('Toucher frais: demandé (activation illisible), accordé');
        expect(section).toContain('Erreur: AbortError – refus simulé (AbortError)');
        expect(section).toContain('Issue: échec de l\'écriture du fichier');
        await cliquerBouton('Réessayer');
        await page.waitForFunction(() => !Codex.etat().modificationsNonSauvees, null, { timeout: 10000 });
        expect(await compteurs()).toEqual({ partages: avant.partages + 2, refus: 0, generations: avant.generations + 1 });
        expect(await page.evaluate(() => window.__titresModales)).toEqual([TITRE_PRET, 'Codex non mis à jour']);
        expect(await lireEtat(page)).toEqual({ menu: A_JOUR, temoin: null });
        section = sectionDuRapport(await rapport(page));
        expect(section).toContain('Essais d\'écriture: 2');
        expect(section).toContain('Issue: réussie');

        expect(erreurs).toEqual([]);
    });

    test('réel : vrais clics, vraie activation de WebKit, vrai partage', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await ouvrirLaDemoAvecUnCodexActif(page);
        await poserReleves(page);

        // Le vrai partage, seulement écouté ; la préparation, allongée pour de bon à la compression.
        const outillage = await page.evaluate(() => {
            const vraiPartage = navigator.share.bind(navigator);
            window.__journalPartage = [];
            Object.defineProperty(navigator, 'share', {
                configurable: true,
                value: (donnees) => {
                    const ligne = { actif: navigator.userActivation.isActive, issue: 'en cours' };
                    window.__journalPartage.push(ligne);
                    return vraiPartage(donnees).then(
                        (v) => { ligne.issue = 'résolu'; return v; },
                        (e) => { ligne.issue = 'rejeté: ' + e.name + ' – ' + e.message; throw e; }
                    );
                }
            });
            window.__retardPreparationMs = 0;
            const vraieCompression = JSZip.prototype.generateAsync;
            JSZip.prototype.generateAsync = async function () {
                if (window.__retardPreparationMs) await new Promise((r) => setTimeout(r, window.__retardPreparationMs));
                return vraieCompression.apply(this, arguments);
            };
            return { selecteurFichier: typeof window.showSaveFilePicker, activation: typeof navigator.userActivation };
        });
        // Le chemin de l'iPad : pas de fenêtre de choix de fichier, et l'API d'activation présente.
        expect(outillage).toEqual({ selecteurFichier: 'undefined', activation: 'object' });

        const attendreCoteNode = (ms) => new Promise((r) => setTimeout(r, ms));
        const centreDe = (selecteur, texte) => page.evaluate(([s, t]) => {
            const b = Array.from(document.querySelectorAll(s)).find((x) => !t || x.textContent.trim() === t);
            const r = b.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }, [selecteur, texte]);

        /** Menu « Codex » › « Mettre à jour le codex » › « Télécharger » de l'aperçu, en vrais clics. */
        async function mettreAJourParLeMenu(retardMs) {
            await page.evaluate((ms) => {
                window.__retardPreparationMs = ms;
                window.__journalPartage.length = 0;
                window.__titresModales.length = 0;
                window.__toasts.length = 0;
                sauvegarderDonneesSelonMode('banc_j0bis_reel_' + ms + '_' + Date.now(), { n: 1 });
            }, retardMs);
            await page.click('#btn-codex');
            await page.click('#codex-menu [data-action="Codex.actionEnregistrer"]');
            await page.waitForSelector('.export-preview-modal .btn-confirmer', { timeout: 30000 });
            const telecharger = await centreDe('.export-preview-modal .btn-confirmer', 'Télécharger');
            await page.mouse.click(telecharger.x, telecharger.y);      // le dernier toucher avant le partage
        }
        const lireLeJournal = () => page.evaluate(() => ({
            journal: window.__journalPartage.slice(), titres: window.__titresModales.slice(), toasts: window.__toasts.slice()
        }));

        // 1. Préparation longue (6,5 s de plus) : à son terme, le toucher a expiré. La fenêtre
        //    s'ouvre, et le partage n'a PAS été tenté. Sur `main` : un partage rejeté
        //    NotAllowedError et « Codex non mis à jour ».
        await mettreAJourParLeMenu(6500);
        await attendreCoteNode(10000);
        let lu = await lireLeJournal();
        expect(lu.journal).toEqual([]);
        expect(lu.titres).toEqual([TITRE_PRET]);
        let modale = await lireModale(page);
        expect(modale.message).toMatch(MESSAGE_PRET);
        expect(modale.boutons).toEqual(['Annuler', 'Enregistrer']);

        //    « Enregistrer », d'un vrai clic, après avoir laissé s'éteindre l'activation que les
        //    lectures ci-dessus ont accordée : seul ce clic peut autoriser le partage.
        const enregistrer = await centreDe('#overlay-ui-dialogue .modal-actions button', 'Enregistrer');
        await attendreCoteNode(6500);
        await page.mouse.click(enregistrer.x, enregistrer.y);
        await attendreCoteNode(2000);
        lu = await lireLeJournal();
        expect(lu.journal).toEqual([{ actif: true, issue: 'résolu' }]);
        expect(lu.titres).toEqual([TITRE_PRET]);
        expect(succes(lu.toasts)).toHaveLength(1);
        expect(await lireModale(page)).toBeNull();
        expect(await lireEtat(page)).toEqual({ menu: A_JOUR, temoin: null });
        expect(sectionDuRapport(await rapport(page))).toContain('Toucher frais: demandé (toucher expiré), accordé');

        // 2. La même, validée au clavier : Entrée sur « Enregistrer » (il a le focus) est un toucher frais.
        await mettreAJourParLeMenu(6500);
        await attendreCoteNode(10000);
        expect((await lireLeJournal()).titres).toEqual([TITRE_PRET]);
        await attendreCoteNode(6500);
        await page.keyboard.press('Enter');
        await attendreCoteNode(2000);
        lu = await lireLeJournal();
        expect(lu.journal).toEqual([{ actif: true, issue: 'résolu' }]);
        expect(await lireEtat(page)).toEqual({ menu: A_JOUR, temoin: null });

        // 3. Préparation courte : partage direct sur le toucher de l'aperçu, aucune fenêtre.
        await mettreAJourParLeMenu(0);
        await attendreCoteNode(4000);
        lu = await lireLeJournal();
        expect(lu.journal).toEqual([{ actif: true, issue: 'résolu' }]);
        expect(lu.titres).toEqual([]);
        expect(succes(lu.toasts)).toHaveLength(1);
        expect(await lireEtat(page)).toEqual({ menu: A_JOUR, temoin: null });
        expect(sectionDuRapport(await rapport(page))).toContain('Toucher frais: non demandé');

        expect(erreurs).toEqual([]);
    });
});
