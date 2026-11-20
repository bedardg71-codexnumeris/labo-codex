import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import { ouvrirPanneau, attendreEtape, bulle } from './harness/classe-de-banc.js';
import { flecheVers } from './harness/fleches-de-banc.js';
import { leParcoursEntier, dossierDesCaptures } from './harness/parcours-3-de-banc.js';
import { attendreApplication } from './harness/attendre-application.js';
import { pointCanevas, compteAnnotations } from './harness/banc-copie-annotation.js';

// =======================================================================
// « RECEVOIR LES PRODUCTIONS, RENDRE TES RÉTROACTIONS », « NOUS FAISONS » — LES BULLES DU 19 NOVEMBRE 2026
// =======================================================================
// Consigne : plans de travail/CONSIGNE-2026-11-19-nous-faisons-recevoir.md (relais, points 1, 2 et 4). Les mots sont jugés
// par tests/unit/sentinelle-parcours-recevoir-2026-11-09.test.js ; ce banc juge, au navigateur, en faisant les gestes,
// depuis un espace où le troisième parcours est fait, dans les deux voies :
//   1. LA CONFIRMATION (« C'est fait : … », au-dessus du titre) : présente quand l'étape d'avant vient d'être faite DANS
//      CE PASSAGE ; absente à la bulle où l'on reprend (« Plus tard », puis « Reprendre ») ;
//   2. LE GENRE DE CHAQUE LIGNE, tel que l'œil le voit : la flèche devant un geste à faire, la consigne en gras, le
//      crochet quand il est fait, rien devant une explication ; les gestes qui se grisent (la production choisie, une
//      marque puis un tampon posés, chaque critère, la production de l'export) ;
//   3. LES DEUX FORMES des bulles 4 (la fenêtre des tampons) et 6 sans fichier (l'évaluation ouverte) ;
//   4. LA FIN : l'objectif atteint, les boutons, la consigne qui les suit ; et la mesure 1 du relais : parcours 5 fermé
//      (l'aperçu), le moteur n'offre que « Terminer », et sa consigne le dit.
// Deux tailles, l'iPad couché et debout : 1180 × 820, 820 × 1180.
// Break-test (19 nov.) : voir le rapport du lot (plans de travail/RAPPORT-2026-11-19-nous-faisons-recevoir.md).

const TAILLES = [[1180, 820], [820, 1180]];
const PDF_LEA = 'Baobab_Basile_2390002_Journal de lecture 1__Remis_le_2026-11-03_10h00m00s.png';
const item = (page) => page.locator('#panneau-assistance [data-parcours="recevoir"]');
const n = (page, k, total, titre, opts = { focus: false }) => attendreEtape(page, k, total, titre, opts);

function png() {
    return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
}

/** Dépose des fichiers sur la zone, comme un glisser-déposer. */
async function deposer(page, noms) {
    const dt = await page.evaluateHandle(([b64, liste]) => {
        const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const d = new DataTransfer();
        const t = Date.UTC(2026, 10, 3, 15, 0, 0);
        liste.forEach((nom, i) => d.items.add(new File([octets], nom, { type: 'image/png', lastModified: t + i })));
        return d;
    }, [png().toString('base64'), noms]);
    await page.dispatchEvent('#travaux-drop-zone', 'drop', { dataTransfer: dt });
}

/** Le rappel « Mets ton codex à jour », reporté : il ne s'ouvre pas entre deux gestes du banc. */
async function fermerLeRappel(page) {
    await page.evaluate(() => {
        if (window.backupReminder) window.backupReminder.reporterApresMiseAJourDuCodex();
        const o = document.querySelector('#overlay-backup-reminder.actif');
        const b = o && [...o.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Plus tard');
        if (b) b.click();
    });
}

/** Le troisième parcours fait (sa production a grille, échelle et cartouche), puis le quatrième lancé à la taille voulue. */
async function lancerLeQuatrieme(page, taille) {
    dossierDesCaptures('');
    await leParcoursEntier(page, { niveaux: true, cap: 'p3' });
    test.setTimeout(480000);   // l'aide du troisième parcours pose 240 s ; les deux parcours en demandent plus
    await page.keyboard.press('Escape');
    // Un rechargement entre les deux parcours (comme le banc du quatrième parcours, qui recharge à son étape 4). Sans lui,
    // mesuré 1 fois sur 3 : à l'entrée de l'étape 6, le formulaire d'évaluation garde un instant les niveaux de la copie
    // évaluée au troisième parcours, sous le DA du fichier ouvert, et l'étape avance sans qu'aucun niveau soit choisi.
    // Défaut antérieur à ce lot, inscrit au BACKLOG (#1299) ; ce banc juge les bulles, pas ce chargement.
    await page.reload();
    await attendreApplication(page);
    await fermerLeRappel(page);
    await page.setViewportSize({ width: taille[0], height: taille[1] });
    const pid = await page.evaluate(() => ParcoursEvaluer.contexte().productionId);
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    return pid;
}

async function reprendre(page) {
    await bulle(page).getByRole('button', { name: 'Plus tard' }).click();
    await expect(bulle(page)).toHaveCount(0);
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
}

/**
 * La bulle telle que l'œil la lit : sa confirmation (ou null), puis chaque élément de ses lignes avec son genre.
 * O : l'objectif ; L : la phrase du lieu ; E : une phrase sans marque ; G : un geste à faire (la flèche, sans le gras) ;
 * C : la consigne (la flèche, en gras) ; F : un geste fait (le crochet) ; « - » : une ligne de liste sans marque.
 */
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
        return { confirme: c && !c.hidden && getComputedStyle(c).display !== 'none' ? plat(c.textContent) : null, lignes };
    });
}

const POIGNEE = 'E Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.';
const genres = async (page) => (await lireBulle(page)).lignes.map((l) => l.slice(0, 1)).join('');

for (const taille of TAILLES) {
    const nom = taille.join(' × ');

    test(`voie des fichiers : la confirmation, présente puis absente à la reprise ; le genre de chaque ligne ; les deux formes de la bulle 4 ; la fin (${nom})`, async ({ page }) => {
        test.setTimeout(420000);
        const pid = await lancerLeQuatrieme(page, taille);

        // 1. La zone de dépôt : l'objectif, le lieu, deux gestes qui ne se grisent jamais, la consigne ; aucune confirmation.
        await n(page, 1, 9, 'Leurs productions');
        let vu = await lireBulle(page);
        expect(vu.confirme).toBeNull();
        expect(vu.lignes).toEqual([
            "O À la fin de ce parcours, tu seras en mesure de recevoir les productions de ton groupe et de rendre à chacun·e sa rétroaction en PDF.",
            "L Tu es dans « Évaluation », à l'onglet « Préparer » : c'est là que tu reçois les productions de tes étudiant·es.",
            "E Cette fois, ce sont les productions de ton groupe : chacune se rangera sous le nom de son étudiant·e, dans ton application.",
            "G Télécharge dans un dossier les fichiers que tes étudiant·es t'ont remis en ligne, sans les renommer (leur nom porte le DA de l'étudiant·e : l'application s'en sert pour trouver à qui est chaque production)",
            "G S'ils arrivent dans un fichier ZIP, décompresse-le (la zone ne prend que des PDF et des images)",
            "E Ta production est sur papier, ou c'est un exposé, une performance, une entrevue ? « Rien à importer » te mène directement à l'évaluation.",
            'C Dépose les fichiers dans la zone, ou touche « Rien à importer »',
            POIGNEE
        ]);
        await deposer(page, [PDF_LEA]);

        // 2. Vérifier avant d'importer.
        await n(page, 2, 9, "Vérifie avant d'importer");
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : tes fichiers sont dans la zone. Rien n'est encore importé.");
        expect(vu.lignes.map((l) => l.slice(0, 1)).join('')).toBe('EEGGCE');
        await page.selectOption('.pipeline-production-selecteur select', pid);
        await expect.poll(() => genres(page), { message: 'la production choisie : son geste se grise' }).toBe('EEGFCE');
        await page.click('[data-action="travauxUI.appliquerEtImporter"]');
        await page.locator('.modal-overlay.actif button', { hasText: 'Oui, importer' }).click();

        // 3. La Liste.
        await n(page, 3, 9, 'La liste');
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : les productions sont importées.");
        expect(vu.lignes).toEqual([
            "L Tu es dans « Évaluation », à l'onglet « Liste » : c'est là que tu vois où en est chaque production de ton groupe.",
            "E Chaque production est rangée sous le nom de son étudiant·e, avec le statut « Importé ». Qui n'a rien remis reste « Non reçu » : tu vois d'un coup d'œil qui relancer.",
            "E Une production est sous le mauvais nom ? « Actions › Réassigner » la déplace.",
            "C Sur la ligne d'une production importée, touche « Actions › Annoter »"
        ]);
        const annoter = await page.evaluate(() => [...document.querySelectorAll('#evaluations-liste select.eval-actions-select option')].map((o) => o.value).find((v) => v.startsWith('annoter|')));
        await page.locator('#evaluations-liste select.eval-actions-select', { has: page.locator(`option[value="${annoter}"]`) }).selectOption(annoter);

        // 4. Les tampons, première forme ; puis « Plus tard » et « Reprendre » : un autre passage, rien n'est confirmé.
        await n(page, 4, 9, 'Tes tampons');
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : la production est ouverte.");
        expect(vu.lignes).toEqual([
            "L Tu es dans « Évaluation », à l'onglet « Annoter » : c'est là que tu examines la production et que tu y poses tes marques.",
            "E La palette « Tampons » : un tampon est un signe que tu poses sur la production ; chacun ajoute sa phrase à la rétroaction de l'étudiant·e.",
            "E Ces phrases sont les tiennes : tu les écris une fois, elles servent d'une production à l'autre et d'un trimestre à l'autre.",
            "C Touche l'engrenage de la palette « Tampons »"
        ]);
        await reprendre(page);
        await n(page, 4, 9, 'Tes tampons');
        expect((await lireBulle(page)).confirme, 'repris : la production avait été ouverte dans le passage d’avant').toBeNull();
        // La seconde forme : la fenêtre ouverte, ni confirmation ni lieu ; ce qu'elle montre, puis ses gestes.
        await page.locator('#travaux-palette-tampons [title="Personnaliser"]').click();
        await expect(page.locator('#modal-retro-observations')).toBeVisible();
        await expect.poll(async () => (await lireBulle(page)).lignes).toEqual([
            "E Chaque tampon, avec la phrase qu'il ajoute. Ceux de départ sont des exemples : lis leurs phrases avant de t'en servir.",
            'G Garde les phrases qui disent ce que tu dirais, réécris les autres',
            'C Touche « Enregistrer »',
            "E Tu peux aussi changer leur image ou créer tes propres tampons. « Exporter mes tampons » te permet de les partager avec tes collègues."
        ]);
        expect((await lireBulle(page)).confirme).toBeNull();
        await page.click('#modal-retro-observations [data-action="travauxOutils.enregistrerRetroObservations"]');

        // 5. Annoter : une marque, puis un tampon, posés sur la production ; chacun grise son geste.
        await n(page, 5, 9, 'Annoter');
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : tes tampons sont enregistrés.");
        expect(vu.lignes.map((l) => l.slice(0, 1)).join('')).toBe('EEEEGGC');
        expect(vu.lignes.slice(4)).toEqual(['G Annote la production', 'G Pose tes tampons là où tu observes quelque chose',
            'C Quand tu as fini, touche « Annoter ▾ », puis choisis « Évaluer »']);
        await page.evaluate(() => window.travauxOutils.setOutilActif('stylo'));
        const a = await pointCanevas(page, 0.3, 0.3), b = await pointCanevas(page, 0.5, 0.35);
        await page.mouse.move(a.x, a.y);
        await page.mouse.down();
        await page.mouse.move((a.x + b.x) / 2, a.y + 4, { steps: 4 });
        await page.mouse.move(b.x, b.y, { steps: 4 });
        await page.mouse.up();
        await expect.poll(() => compteAnnotations(page)).toMatchObject({ strokes: 1, stickers: 0 });
        await expect.poll(() => genres(page), { message: 'une marque posée : « Annote la production » se grise' }).toBe('EEEEFGC');
        await page.evaluate(() => document.querySelector('#travaux-palette-tampons .travaux-autocollant-item[data-action="travauxOutils.setAutocollantActif"]').click());
        const t = await pointCanevas(page, 0.4, 0.6);
        await page.mouse.click(t.x, t.y);
        await expect.poll(() => compteAnnotations(page)).toMatchObject({ stickers: 1 });
        await expect.poll(() => genres(page), { message: 'un tampon posé : son geste se grise' }).toBe('EEEEFFC');
        await page.evaluate(() => window.travauxOutils.setOutilActif('position'));
        await page.click('#travaux-btn-actions');
        await page.locator('[data-action="travauxUI.basculerMode"]', { hasText: 'Évaluer' }).first().click();

        // 6. Évaluer : la consigne a ses champs, les critères ; sa parenthèse hors du gras. La palette « Rétroaction »,
        // repliée ici, doit être dépliée à l'étape suivante.
        await n(page, 6, 9, 'Évaluer');
        // Mesuré : à l'entrée, les menus gardent un instant (moins de 300 ms) les niveaux de la copie précédente ; la
        // consigne paraît faite, puis ne l'est plus (rapport du lot). Le banc juge l'état qui tient.
        await expect.poll(() => genres(page), { message: 'la consigne, une fois les menus de la copie à jour', timeout: 15000 }).toBe('EGC');
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : tu es en mode Évaluer.");
        expect(vu.lignes).toEqual([
            "E Dans la palette « Paramètres », ce que porte la production que tu leur as demandée : sa grille (les critères), son échelle (les niveaux) et sa cartouche (une phrase de rétroaction prévue pour chaque critère et chaque niveau). L'application les a choisies pour toi.",
            'G Vérifie que ce sont les bonnes, au moins à ta première évaluation (ce sont elles qui feront la note et la rétroaction)',
            'C Dans la palette « Évaluation », choisis le niveau ou les points de chaque critère (la note se calcule à mesure)'
        ]);
        expect(await page.evaluate(() => getComputedStyle(document.querySelector('#parcours-bulle .parcours-bulle-ligne-precision')).fontWeight)).toBe('400');
        // Les critères paraissent un moment après l'entrée (mesuré : environ une seconde après un rechargement).
        await expect.poll(() => page.locator('#listeCriteresGrille1 select[id^="eval_"]').count(), { timeout: 15000 }).toBe(4);
        const champs = await page.evaluate(() => [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]')].map((x) => x.id));
        for (const id of champs.slice(0, 3)) await page.selectOption('#' + id, 'S');
        expect(await genres(page), 'un critère reste : la consigne n’est pas faite').toBe('EGC');
        await page.selectOption('#' + champs[3], 'S');

        // 7. La rétroaction, deux flèches (son titre, « Verrouiller »). Mesuré : repliée à l'étape 6, la palette « Rétroaction »
        // est reconstruite par l'application avant l'étape 7. Repliée PENDANT l'étape 7, puis « Plus tard » et « Reprendre »,
        // elle l'est encore : c'est là que l'étape la déplie.
        await n(page, 7, 9, 'Ta rétroaction');
        const repliee = () => page.evaluate(() => document.getElementById('travaux-palette-eval-retro').classList.contains('replie'));
        expect(await repliee(), 'la palette « Rétroaction » dépliée à l’entrée').toBe(false);
        expect((await lireBulle(page)).confirme).toBe("C'est fait : chaque critère est évalué.");
        await page.evaluate(() => window.travauxUI.togglePaletteEvalReplie('travaux-palette-eval-retro'));
        expect(await repliee()).toBe(true);
        await reprendre(page);
        await n(page, 7, 9, 'Ta rétroaction');
        expect(await repliee(), 'reprise : la palette dépliée par l’étape').toBe(false);
        expect((await lireBulle(page)).confirme, 'repris : rien n’est confirmé').toBeNull();
        vu = await lireBulle(page);
        expect(vu.lignes).toEqual([
            'E La palette « Rétroaction » montre ce que ton étudiant·e lira dans sa synthèse :',
            "E « Générale » : les phrases de ta cartouche, choisies d'après ton évaluation de chaque critère",
            'E « Spécifique » : les phrases de tes tampons, avec le nombre de fois où tu les as posés',
            "E « Bilan » : ses défis et sa force du moment ; plus tard, son progrès d'une production à l'autre",
            'E Un mot personnel ? Écris-le dans « Un mot pour ton étudiant·e » : il s\'imprime sur son PDF.',
            "E Verrouiller dit que l'évaluation est terminée : elle compte alors dans la note, et sa rétroaction ne bouge plus par mégarde.",
            'G Relis la rétroaction comme ton étudiant·e la lira',
            'C Touche le cadenas « Verrouiller », en haut de « Paramètres »'
        ]);
        await flecheVers(page, '#travaux-palette-eval-retro > .palette-flottante-barre .palette-flottante-titre', 'bulle 7, le titre de la palette');
        await flecheVers(page, '#btnVerrouillerEvaluation', 'bulle 7, le cadenas');
        await page.click('#btnVerrouillerEvaluation');

        // 8. Rendre : la production de l'export choisie grise son geste.
        await n(page, 8, 9, 'Rends tes rétroactions');
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : l'évaluation est verrouillée.");
        expect(vu.lignes[0]).toBe("L Tu es dans « Évaluation », à l'onglet « Exporter » : c'est là que tu prépares ce que tu remets à tes étudiant·es.");
        expect(vu.lignes.slice(4)).toEqual(expect.arrayContaining(['C Touche « Exporter pour Léa »']));
        await page.selectOption('#travaux-archivage-lea-production', pid);
        await expect.poll(() => genres(page)).toBe('LEEEFC');
        const telechargement = page.waitForEvent('download');
        await page.click('[data-action="travauxUI.lancerExportLea"]');
        await telechargement;

        // 9. Remets-les : des explications, la fin du moteur. Tous les parcours ouverts (les bancs) : « Parcours suivant ».
        await n(page, 9, 9, 'Remets-les');
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : tes rétroactions sont exportées.");
        expect(vu.lignes).toEqual([
            "E Dernier geste, hors de l'application : remettre les PDF.",
            'E Garde le fichier exporté tel quel : son nom, avec la production et la date, en fait une archive facile à retrouver.',
            "E Pour Léa, fais-en une copie renommée « travaux.zip », dépose-la dans la liste des travaux de la production, puis touche « Transmettre » : chaque PDF rejoint l'étudiant·e dont il porte le nom et le DA.",
            'E Ailleurs, dépose chaque PDF là où tes étudiant·es reçoivent leurs travaux évalués. Sans fichier, tu peux aussi imprimer la synthèse et la remettre, avec la production si elle est sur papier.',
            'E Pour revoir une étape, touche « 9 sur 9 ».',
            "O Objectif atteint : tu es en mesure de recevoir les productions de ton groupe et de rendre à chacun·e sa rétroaction en PDF.",
            "E Chaque parcours a son objectif. C'est toi qui choisis la suite.",
            'C Touche « Parcours suivant », ou « Terminer »'
        ]);
        await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Parcours suivant', 'Terminer']);
        // Mesure 1 du relais : les parcours ouverts de l'aperçu (le cinquième fermé). Le moteur n'offre que « Terminer », et
        // sa consigne le dit.
        await page.evaluate(() => Assistance.ouvrirLesParcours(['decouvrir', 'classe', 'evaluer', 'recevoir']));
        await page.evaluate(() => ParcoursMoteur.allerA(8));
        await n(page, 9, 9, 'Remets-les');
        await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Terminer']);
        expect((await lireBulle(page)).lignes.slice(-1)).toEqual(['C Touche « Terminer »']);
        await bulle(page).getByRole('button', { name: 'Terminer' }).click();
        expect(await page.evaluate(() => Assistance.etatDe('recevoir').etat)).toBe('fait');
    });

    test(`voie sans fichier : « Rien à importer » confirmé, les deux formes de la bulle 6, « La section « Rétroaction » », la reprise sans confirmation (${nom})`, async ({ page }) => {
        test.setTimeout(420000);
        const pid = await lancerLeQuatrieme(page, taille);
        await n(page, 1, 9, 'Leurs productions');
        await bulle(page).getByRole('button', { name: 'Rien à importer' }).click();

        // 1 sur 4, première forme : « Rien à importer » vient d'être touché ; sur la Liste. Ni objectif (dit à la bulle 1).
        await n(page, 1, 4, 'Évaluer');
        let vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : pas de fichier à importer.");
        expect(vu.lignes).toEqual([
            "L Tu es dans « Évaluation », à l'onglet « Liste » : c'est là que tu vois où en est chaque production de ton groupe.",
            "C Sur la ligne d'un·e étudiant·e, touche « Actions › Évaluer »",
            POIGNEE
        ]);
        const evaluer = await page.evaluate(() => [...document.querySelectorAll('#evaluations-liste select.eval-actions-select option')].map((o) => o.value).find((v) => v.startsWith('evaluer|2390002|')));
        await page.locator('#evaluations-liste select.eval-actions-select', { has: page.locator(`option[value="${evaluer}"]`) }).selectOption(evaluer);

        // Seconde forme : l'évaluation ouverte ; ni confirmation ni phrase du lieu (le moteur), le lieu en ligne.
        await expect(page.locator('#evaluations-contenu-evaluation')).toBeVisible();
        await expect.poll(async () => (await lireBulle(page)).lignes, { timeout: 15000 }).toEqual([
            "E Tu es dans l'onglet « Annoter » : sans fichier, il n'y a rien à annoter, tu évalues directement.",
            "E Dans le panneau « Paramètres », ce que porte la production que tu leur as demandée : sa grille (les critères), son échelle (les niveaux) et sa cartouche (une phrase de rétroaction prévue pour chaque critère et chaque niveau). L'application les a choisies pour toi.",
            'G Vérifie que ce sont les bonnes, au moins à ta première évaluation (ce sont elles qui feront la note et la rétroaction)',
            'C Dans le panneau « Critères », choisis le niveau ou les points de chaque critère (la note se calcule à mesure)',
            POIGNEE
        ]);
        expect((await lireBulle(page)).confirme).toBeNull();
        await expect.poll(() => page.locator('#listeCriteresGrille1 select[id^="eval_"]').count()).toBe(4);
        for (const id of await page.evaluate(() => [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]')].map((x) => x.id))) {
            await page.selectOption('#' + id, 'P');
        }

        // 2 sur 4 : « La section », sans « Spécifique » ; deux flèches (le titre de la section, « Verrouiller »).
        await n(page, 2, 4, 'Ta rétroaction');
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : chaque critère est évalué.");
        expect(vu.lignes).toEqual([
            'E La section « Rétroaction » montre ce que ton étudiant·e lira dans sa synthèse :',
            "E « Générale » : les phrases de ta cartouche, choisies d'après ton évaluation de chaque critère",
            "E « Bilan » : ses défis et sa force du moment ; plus tard, son progrès d'une production à l'autre",
            'E Un mot personnel ? Écris-le dans « Un mot pour ton étudiant·e » : il s\'imprime sur son PDF.',
            "E Verrouiller dit que l'évaluation est terminée : elle compte alors dans la note, et sa rétroaction ne bouge plus par mégarde.",
            'G Relis la rétroaction comme ton étudiant·e la lira',
            'C Touche le cadenas « Verrouiller », en haut de « Paramètres »'
        ]);
        // Sans fichier, le titre de la section est masqué par la page : la ligne montre la section. À l'entrée, elle est sous
        // le bas de l'écran ; sa flèche paraît quand on y descend.
        await page.evaluate(() => document.getElementById('travaux-eval-retroaction').scrollIntoView({ block: 'center' }));
        // La section est grande (sa largeur, 400 px de haut) : la bulle peut en couvrir un coin, et la pointe s'arrêter
        // alors dans sa partie visible plutôt qu'à son bord. Une flèche part du bord de la bulle et pointe dans la section.
        await expect.poll(() => page.evaluate(() => {
            const s = document.getElementById('travaux-eval-retroaction').getBoundingClientRect();
            const b = document.getElementById('parcours-bulle').getBoundingClientRect();
            const pres = (x, y, r, m) => x >= r.left - m && x <= r.right + m && y >= r.top - m && y <= r.bottom + m;
            return [...document.querySelectorAll('#parcours-fleches g.parcours-fleche')].some((g) => {
                const v = g.getAttribute('data-trace').match(/-?\d+(\.\d+)?/g).map(Number);
                const depart = pres(v[0], v[1], b, 1.5) && !pres(v[0], v[1], { left: b.left + 2, top: b.top + 2, right: b.right - 2, bottom: b.bottom - 2 }, 0);
                return depart && pres(v[4], v[5], s, 9) && !pres(v[4], v[5], b, 0);
            });
        }), { message: 'sans fichier : une flèche va de la bulle à la section « Rétroaction »' }).toBe(true);
        await page.click('#btnVerrouillerEvaluation');

        // 3 sur 4 : confirmé ; puis « Plus tard » et « Reprendre » : plus rien de confirmé.
        await n(page, 3, 4, 'Rends tes rétroactions');
        expect((await lireBulle(page)).confirme).toBe("C'est fait : l'évaluation est verrouillée.");
        await reprendre(page);
        await n(page, 3, 4, 'Rends tes rétroactions');
        expect((await lireBulle(page)).confirme, 'repris : le verrou était du passage d’avant').toBeNull();
        await page.selectOption('#travaux-archivage-lea-production', pid);
        const telechargement = page.waitForEvent('download');
        await page.click('[data-action="travauxUI.lancerExportLea"]');
        await telechargement;

        // 4 sur 4 : confirmé (l'export vient d'être fait dans ce passage) ; la fin.
        await n(page, 4, 4, 'Remets-les');
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : tes rétroactions sont exportées.");
        expect(vu.lignes.slice(-4)).toEqual([
            'E Pour revoir une étape, touche « 4 sur 4 ».',
            "O Objectif atteint : tu es en mesure de recevoir les productions de ton groupe et de rendre à chacun·e sa rétroaction en PDF.",
            "E Chaque parcours a son objectif. C'est toi qui choisis la suite.",
            'C Touche « Parcours suivant », ou « Terminer »'
        ]);
        await bulle(page).getByRole('button', { name: 'Terminer' }).click();
    });
}
