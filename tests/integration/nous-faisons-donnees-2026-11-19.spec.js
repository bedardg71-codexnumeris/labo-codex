import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// « METTRE TES DONNÉES À L'ABRI », « NOUS FAISONS » — LES BULLES DU 19 NOVEMBRE 2026
// =======================================================================
// Consigne : plans de travail/CONSIGNE-2026-11-19-nous-faisons-donnees.md (relais, points 1 à 3). Les mots sont jugés par
// tests/unit/sentinelle-parcours-donnees-2026-11-09.test.js ; ce banc juge, au navigateur, en faisant les gestes :
//   1. LA CONFIRMATION (« C'est fait : … », au-dessus du titre) : présente quand l'étape d'avant vient d'être faite DANS
//      CE PASSAGE ; absente à la bulle où l'on reprend (« Quitter le parcours », puis « Reprendre ») ;
//   2. LE GENRE DE CHAQUE LIGNE, tel que l'œil le voit (la flèche, la consigne en gras, le crochet, rien) ;
//   3. LES FORMES DE LA BULLE 3, chemin par chemin : la fenêtre de choix (avec et sans copies manquantes), le fichier tenu,
//      la feuille de partage, le téléchargement (fenêtres du système remplacées par des fausses) ;
//   4. LA FIN : l'objectif atteint, les boutons, la consigne ; mesure (c) : les parcours de l'aperçu (le septième
//      fermé), le moteur n'offre que « Terminer » ;
//   5. la mesure (b) : lancé dans la démo, le parcours en sort avant sa bulle 1.
// Deux tailles, l'iPad couché et debout : 1180 × 820, 820 × 1180. Break-test : voir le rapport du lot.
// ⚠ La PLACE de la bulle 3 (à droite de l'aperçu à partir de 1180 px) n'est pas jugée ici : elle ne tient plus dans la
// fenêtre avec ses lignes validées (rapport du lot, § 8) ; le banc du parcours 6 le mesure.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const TAILLES = [[1180, 820], [820, 1180]];
const bulle = (page) => page.locator('#parcours-bulle');
const ITEM_METTRE_A_JOUR = '#codex-menu .codex-menu-item:not(.codex-menu-item--simple)[data-action="Codex.actionEnregistrer"]';

/** Un espace vide, un trimestre réel, le rappel au loin, et le chemin d'écriture voulu (fenêtres du système fausses). */
async function ouvrirEspace(page, [largeur, hauteur], { chemin = 'fenetre' } = {}) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await attendreApplication(page);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => { const r = indexedDB.deleteDatabase('LaboCodexDB'); r.onsuccess = r.onerror = r.onblocked = () => res(); setTimeout(res, 1500); });
    });
    await page.reload();
    await attendreApplication(page);
    await page.evaluate(() => {
        const loin = new Date(); loin.setDate(loin.getDate() + 30);
        db.setSync('backupProchainRappel', loin.toISOString());
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026' }]);
    });
    await poserChemin(page, chemin);
}

async function poserChemin(page, chemin) {
    await page.evaluate((c) => {
        window.showSaveFilePicker = c === 'fenetre' ? async () => ({
            createWritable: async () => ({ write: async () => {}, close: async () => {}, abort: async () => {} })
        }) : undefined;
        navigator.canShare = c === 'partage' ? () => true : undefined;
        navigator.share = async () => {};
    }, chemin);
}

async function attendreEtape(page, n) {
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(n + ' sur 4', { timeout: 10000 });
}

async function lancer(page) { await page.evaluate(() => Assistance.lancerParcours('donnees')); }

/** La bulle telle que l'œil la lit (voir le banc du parcours 2) : la confirmation, puis chaque ligne et son genre. */
async function lireBulle(page) {
    return page.evaluate(() => {
        const b = document.getElementById('parcours-bulle');
        const plat = (t) => String(t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
        const marque = (li) => {
            const c = getComputedStyle(li, '::before').content;
            if (/✓/.test(c)) return 'F';
            if (!/→/.test(c)) return '-';
            return li.classList.contains('parcours-bulle-ligne--geste') && getComputedStyle(li.querySelector('.parcours-bulle-ligne-texte')).fontWeight >= 600 ? 'C' : 'G';
        };
        const lignes = [];
        [...b.querySelectorAll('.parcours-bulle-lignes > *')].forEach((x) => {
            if (x.tagName !== 'UL') {
                lignes.push((x.classList.contains('parcours-bulle-objectif') ? 'O' : x.classList.contains('parcours-bulle-lieu') ? 'L' : 'E') + ' ' + plat(x.textContent));
                return;
            }
            [...x.children].forEach((li) => lignes.push(marque(li) + ' ' + plat(li.querySelector('.parcours-bulle-ligne-texte').textContent)));
        });
        const c = b.querySelector('.parcours-bulle-confirme');
        // 20 nov. 2026 (consigne du 20 nov., A1 et A2) : l'entrée de la première bulle, au-dessus du titre.
        const dit = (sel) => { const e = b.querySelector(sel); return e && !e.hidden && getComputedStyle(e).display !== 'none' ? plat(e.textContent) : null; };
        return { confirme: c && !c.hidden && getComputedStyle(c).display !== 'none' ? plat(c.textContent) : null, lignes, identite: dit('.parcours-bulle-identite'), aide: dit('.parcours-bulle-aide') };
    });
}
const genres = async (page) => (await lireBulle(page)).lignes.map((l) => l.slice(0, 1)).join('');

// 20 nov. 2026 (plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, A1 et A2) : la phrase de la poignée n'est plus la
// dernière des lignes de la première bulle ; elle est au-dessus du titre (`.parcours-bulle-aide`), sous la ligne qui
// nomme le parcours (`.parcours-bulle-identite` ; ce parcours n'a pas de « Je regarde » : pas de troisième partie).
const IDENTITE = "Parcours 6 · Mettre tes données à l'abri";
const POIGNEE = 'Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.';
const DEBUT_3 = [
    "E Le « i » de l'aperçu te dit ce que contient le fichier.",
    "E Ton codex contient les noms, les DA et les productions de tes étudiant·es, et il n'est pas chiffré : quiconque a le fichier peut le lire.",
    'E Sa place est dans un lieu protégé : une clé USB chiffrée, ou un dossier synchronisé avec un infonuage chiffré, protégé par un mot de passe solide et une double authentification.',
    'E Ton appareil, lui, devrait avoir un mot de passe et un disque chiffré.'
];
const REECRITURE = "E Jusqu'à ce que tu recharges la page, chaque mise à jour réécrira ce même fichier, sans rien te demander.";

async function jusquALApercu(page) {
    await attendreEtape(page, 1);
    await page.click('#btn-codex');
    await attendreEtape(page, 2);
    await page.click(ITEM_METTRE_A_JOUR);
    await expect(page.locator('.export-preview-modal')).toBeVisible();
    await attendreEtape(page, 3);
}

for (const taille of TAILLES) {
    const nom = taille.join(' × ');

    test(`la fenêtre de choix de bout en bout : la confirmation présente, puis absente à la reprise ; le genre de chaque ligne ; la fin (${nom})`, async ({ page }) => {
        test.setTimeout(120000);
        await ouvrirEspace(page, taille);
        await lancer(page);

        // 1. Pourquoi un codex : l'objectif, quatre explications, la consigne ; aucune phrase du lieu, aucune confirmation.
        await attendreEtape(page, 1);
        let vu = await lireBulle(page);
        expect(vu.confirme).toBeNull();
        expect(vu.lignes).toEqual([
            "O À la fin de ce parcours, tu seras en mesure de mettre tes données à l'abri : ton codex à jour, rangé dans un lieu protégé.",
            'E Tes données demeurent dans le navigateur de cet appareil : Labo Codex ne les envoie nulle part.',
            "E Elles peuvent donc se perdre si tu effaces les données de sites, ou si tu changes de navigateur ou d'ordinateur.",
            "E Ton codex en est une copie complète, productions de tes étudiant·es comprises, dans un seul fichier que tu rouvres sur n'importe quel appareil.",
            "E Ce fichier ne change que quand tu le mets à jour : l'application ne le fait jamais à ta place.",
            "C Touche « Codex », en haut de l'écran"
        ]);
        expect([vu.identite, vu.aide], 'la première bulle : le parcours, puis la phrase de la poignée, au-dessus du titre').toEqual([IDENTITE, POIGNEE]);
        await page.click('#btn-codex');

        // 2. Mettre à jour : le menu vient d'être ouvert.
        await attendreEtape(page, 2);
        vu = await lireBulle(page);
        expect([vu.identite, vu.aide], 'la deuxième bulle ne porte plus l’entrée').toEqual([null, null]);
        expect(vu.confirme).toBe("C'est fait : le menu Codex est ouvert.");
        expect(vu.lignes).toEqual([
            "E Mettre ton codex à jour, c'est rassembler tes données et les fichiers des productions de tes étudiant·es en un seul fichier.",
            'E Plus tu as importé de productions, plus il est lourd, et plus sa préparation peut prendre un moment.',
            "E Refais ce geste chaque semaine, et après chaque travail important : une saisie de présences, une série d'évaluations.",
            'C Touche « Mettre à jour le codex »'
        ]);
        // « Quitter le parcours », puis « Reprendre » : un autre passage, rien n'est confirmé.
        await bulle(page).getByRole('button', { name: 'Quitter le parcours' }).click();
        await expect(bulle(page)).toHaveCount(0);
        expect(await page.evaluate(() => Assistance.etatDe('donnees'))).toEqual({ etat: 'en-cours', etape: 1 });
        await lancer(page);
        await attendreEtape(page, 2);
        expect((await lireBulle(page)).confirme, 'repris : le menu avait été ouvert dans le passage d’avant').toBeNull();
        await page.click(ITEM_METTRE_A_JOUR);
        await expect(page.locator('.export-preview-modal')).toBeVisible();

        // 3. Range ton fichier, la fenêtre de choix : confirmé (dans ce passage) ; « Touche « Mettre à jour » » est un geste,
        // la consigne vient ensuite, puis l'explication de la réécriture.
        await attendreEtape(page, 3);
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : l'aperçu de ton codex est ouvert. Rien n'est encore écrit.");
        expect(vu.lignes).toEqual([...DEBUT_3,
            'G Touche « Mettre à jour »',
            "C Dans la fenêtre qui te demande où l'enregistrer, choisis ta clé ou ton dossier synchronisé",
            REECRITURE]);
        await page.click('.export-preview-modal .btn-confirmer');

        // 4. Quand le rouvrir : des explications, la fin du moteur. Tous les parcours ouverts (les bancs) : « Voir le parcours 7 ».
        await attendreEtape(page, 4);
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : ton codex est à jour.");
        expect(vu.lignes).toEqual([
            'E Ton codex te servira dans deux cas : pour travailler sur un autre appareil, ou pour retrouver tes données si ce navigateur les perd.',
            'E Tu l\'ouvriras alors par « Ouvrir un codex… », ici, dans le menu.',
            "E Attention : ouvrir un codex remplace tout ce qui est dans l'application par le contenu du fichier. C'est donc toujours ton codex le plus récent qu'il faut ouvrir.",
            'E Le haut du menu te dit où tu en es : « Ton codex est à jour », ou « Ton codex n\'a pas tes derniers changements ».',
            'E Et si tu oublies, le rappel « Mets ton codex à jour » reviendra toutes les deux semaines, ou au rythme que tu choisis.',
            'E Pour revoir une étape, touche « 4 sur 4 ».',
            "O Objectif atteint : tu es en mesure de mettre tes données à l'abri (ton codex à jour, rangé dans un lieu protégé).",
            "E Chaque parcours a son objectif. C'est toi qui choisis la suite.",
            'E Suite suggérée : le parcours 7, « Lire ta classe et intervenir ».',
            'C Touche « Voir le parcours 7 », ou « Terminer »'
        ]);
        // 20 nov. 2026 (consigne du 20 nov., A3) : « Voir le parcours 7 » remplace « Parcours suivant », et la bulle nomme
        // la suite. Le bouton ne lance rien : jugé à la fin de cet essai.
        await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Voir le parcours 7', 'Terminer']);
        // Mesure (c) : les parcours de l'aperçu (« Lire ta classe et intervenir » fermé) : « Terminer » seul, et sa consigne.
        await page.evaluate(() => Assistance.ouvrirLesParcours(['decouvrir', 'classe', 'evaluer', 'recevoir', 'donnees']));
        await page.evaluate(() => ParcoursMoteur.allerA(3));
        await attendreEtape(page, 4);
        await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Terminer']);
        expect((await lireBulle(page)).lignes.slice(-1)).toEqual(['C Touche « Terminer »']);
        await bulle(page).getByRole('button', { name: 'Terminer' }).click();
        expect(await page.evaluate(() => Assistance.etatDe('donnees').etat)).toBe('fait');

        // « Refaire » : le fichier est tenu ; « Touche « Mettre à jour » » est la consigne, suivie de la réécriture.
        await lancer(page);
        await jusquALApercu(page);
        expect((await lireBulle(page)).lignes).toEqual([...DEBUT_3, 'C Touche « Mettre à jour »', REECRITURE]);
        await page.click('.export-preview-modal .btn-confirmer');
        await attendreEtape(page, 4);
        // 20 nov. 2026 (consigne du 20 nov., A3) : tous les parcours rouverts, « Voir le parcours 7 » NE LANCE RIEN. Il
        // termine ce parcours, ferme la bulle et ouvre le panneau devant la carte de « Lire ta classe et intervenir »,
        // suggérée, le focus sur son premier bouton (ce parcours n'a pas de « Je regarde »).
        await page.evaluate(() => Assistance.ouvrirLesParcours(true));
        await page.evaluate(() => ParcoursMoteur.allerA(3));
        await attendreEtape(page, 4);
        await bulle(page).getByRole('button', { name: 'Voir le parcours 7', exact: true }).click();
        await expect(bulle(page)).toHaveCount(0);
        await expect(page.locator('#panneau-assistance')).toBeVisible();
        expect(await page.evaluate(() => ({ actif: ParcoursMoteur.actif(), fait: Assistance.etatDe('donnees').etat, suivant: Assistance.etatDe('lire-ta-classe').etat })))
            .toEqual({ actif: false, fait: 'fait', suivant: 'a-faire' });
        const suivante = page.locator('#panneau-assistance [data-parcours="lire-ta-classe"]');
        await expect(suivante).toHaveClass(/assistance-parcours-item--suggere/);
        await expect(suivante.locator('button').first()).toBeFocused();
    });

    test(`la bulle 3, chemin par chemin : partage, téléchargement (le geste se grise), copies manquantes (${nom})`, async ({ page }) => {
        test.setTimeout(150000);
        await ouvrirEspace(page, taille, { chemin: 'partage' });
        await lancer(page);
        await jusquALApercu(page);
        expect((await lireBulle(page)).lignes).toEqual([...DEBUT_3, 'G Touche « Mettre à jour »',
            "C Quand ton appareil te propose de partager le fichier, choisis de l'enregistrer, sur ta clé ou dans ton dossier synchronisé"]);
        await page.click('.export-preview-modal .btn-confirmer');
        await attendreEtape(page, 4);
        await bulle(page).getByRole('button', { name: 'Terminer' }).click();

        // Le téléchargement : « Mettre à jour » touché, la fenêtre « Téléchargement lancé » ouverte : son geste est fait.
        await poserChemin(page, 'telechargement');
        await lancer(page);
        await jusquALApercu(page);
        expect((await lireBulle(page)).lignes).toEqual([...DEBUT_3, 'G Touche « Mettre à jour »',
            'C Quand le fichier est dans tes téléchargements, réponds « Il y est », puis déplace-le sur ta clé ou dans ton dossier synchronisé',
            "E Chaque mise à jour t'en remettra un nouveau : c'est le plus récent qui compte."]);
        await page.click('.export-preview-modal .btn-confirmer');
        const fenetre = page.locator('#overlay-ui-dialogue');
        await expect(fenetre).toContainText('Téléchargement lancé');
        await expect.poll(() => genres(page), { message: 'l’aperçu refermé sur une écriture en cours : « Touche « Mettre à jour » » se grise' })
            .toBe('EEEEFCE');
        await fenetre.getByRole('button', { name: 'Il y est' }).click();
        await attendreEtape(page, 4);
        await bulle(page).getByRole('button', { name: 'Terminer' }).click();

        // Des copies qui manquent : la fenêtre de choix, sans l'explication de la réécriture.
        await poserChemin(page, 'fenetre');
        await page.evaluate(() => db.setSync(cle('fichiersTravaux'), [{ id: 'ft-fictif-1', nomFichier: 'production-fictive.pdf' }]));   // security-ok: banc, donnée fictive créée ici
        await lancer(page);
        await attendreEtape(page, 1);
        await page.click('#btn-codex');
        await attendreEtape(page, 2);
        await page.click(ITEM_METTRE_A_JOUR);
        const avertissement = page.locator('#overlay-ui-dialogue');
        await expect(avertissement).toBeVisible();
        await avertissement.locator('.btn-supprimer').click();
        await expect(page.locator('.export-preview-modal')).toBeVisible();
        await attendreEtape(page, 3);
        expect((await lireBulle(page)).lignes).toEqual([...DEBUT_3, 'G Touche « Mettre à jour »',
            "C Dans la fenêtre qui te demande où l'enregistrer, choisis ta clé ou ton dossier synchronisé"]);
    });
}

test('mesure (b) : lancé dans la démo, avec un trimestre réel, le parcours en sort avant sa bulle 1', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirEspace(page, TAILLES[0]);
    await page.evaluate(() => activerModeDemo());
    await expect.poll(() => page.evaluate(() => estEnModeDemo())).toBe(true);
    await page.evaluate(() => {
        window.__bulles = [];
        new MutationObserver(() => { if (document.querySelector('#parcours-bulle .parcours-bulle-rang')) window.__bulles.push(estEnModeDemo()); })
            .observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    await lancer(page);
    await attendreEtape(page, 1);
    const vues = await page.evaluate(() => window.__bulles);
    expect(vues.length).toBeGreaterThan(0);
    expect(vues.every((d) => d === false), 'aucune bulle rendue pendant que la démo est ouverte').toBe(true);
    // Rentrer dans la démo en cours de route ferme le parcours (comme aux parcours 2 et 4).
    await page.evaluate(() => activerModeDemo());
    await expect.poll(() => page.evaluate(() => estEnModeDemo())).toBe(true);
    await expect(bulle(page)).toHaveCount(0, { timeout: 5000 });
});
