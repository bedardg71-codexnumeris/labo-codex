import { test, expect } from '@playwright/test';
import fs9 from 'node:fs';
import path9 from 'node:path';
import {
    ouvrirEspaceVide, ouvrirPanneau, bulle, enDemo, releve, ecarts, horsDeLaDemo, peuplerUnTrimestreReel, sansInsecable
} from './harness/deux-temps-de-banc.js';

// =======================================================================
// LE NEUVIÈME PARCOURS, « SUIVRE TON GROUPE PAR CIBLES », « JE REGARDE » (23 NOVEMBRE 2026)
// =======================================================================
// Consigne : `plans de travail/CONSIGNE-2026-11-22-parcours-9-je-regarde.md`. Dans l'application réelle, aux deux
// orientations de l'iPad (1180 × 820 et 820 × 1180), un trimestre réel peuplé au départ :
//   A · la carte du panneau (un seul temps, sa ligne) ; les douze bulles, mot pour mot (les mots sont ceux de
//       `ParcoursCibles.textes`, que la sentinelle confronte à la consigne), chaque forme à son tour ; ce que chaque
//       bulle cite de l'écran, relu à l'écran (les cinq cibles et leurs poids, les critères essentiels, l'échelle, ✎,
//       « Inscrire le niveau », les noms des productions, « 1er octobre 2025 », 69 %, 68,8 %, 50 % et 75 %) ; ce que
//       « Remplir » pose ; la date de l'observation (celle de l'histoire, pas celle du jour) ; la bulle dans l'écran ;
//       la fin (la suite suggérée, deux boutons) ; à la sortie de la démo, aucune clé hors de la démo ne change ;
//       « Refaire » : seules les inscriptions de Marmotte Pétillante sur « La lecture stratégique » partent, et le
//       modèle repart de sa première bulle ;
//   B · une démo déjà installée à qui le troisième groupe manque le reçoit avant la première bulle.
// Jugé sous Chromium dans le conteneur (playwright.chromium.config.js) : WebKit n'y existe pas, Safari reste dû au Mac.
//
// BREAK-TESTS (23 nov. 2026) : journal en fin de fichier.

const TAILLES = [[1180, 820], [820, 1180]];
const DA = '9700001';
const CIBLE = 'demo-cible-ls';
const NOM = 'Marmotte Pétillante';

const carte = (page) => page.locator('#panneau-assistance [data-parcours="cibles"]');
const caseDeMarmotte = (page) => page.locator(`.tc-tableau [data-tc="case"][data-da="${DA}"][data-cible="${CIBLE}"]`);
const rangee = (page) => page.locator('.tc-tableau tbody tr', { has: page.locator('.tn-eleve', { hasText: NOM }) });
const ecran = (page) => page.locator('.oc-overlay .oc-fenetre');
const fenetre = (page) => page.locator('.tc-overlay:not(.oc-overlay) .tc-fenetre');
const etape = (page) => page.evaluate(() => ParcoursMoteur.etapeCourante());
const texte = async (loc) => sansInsecable((await loc.textContent()) || '');
const dansLaBulle = (page, nom) => bulle(page).getByRole('button', { name: nom, exact: true });

/** Ce que dit la bulle : son titre, ses lignes dans l'ordre ([genre, texte]), ses boutons, et où elle est. */
const lire = (page) => page.evaluate(() => {
    const b = document.getElementById('parcours-bulle');
    if (!b) return null;
    const t = (e) => (e ? e.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : '');
    const vu = (e) => !!e && !e.hidden && e.offsetParent !== null;
    const un = (sel) => { const e = b.querySelector(sel); return vu(e) ? t(e) : ''; };
    const lignes = [];
    const boite = b.querySelector('.parcours-bulle-lignes');
    [...(boite ? boite.children : [])].forEach((e) => {
        if (e.tagName === 'UL') {
            [...e.children].forEach((li) => lignes.push([li.classList.contains('parcours-bulle-ligne--geste') ? 'c' : 'g', t(li.querySelector('.parcours-bulle-ligne-texte'))]));
        } else if (e.classList.contains('parcours-bulle-aide')) lignes.push(['gris', t(e)]);
        else if (e.className === 'parcours-bulle-note') lignes.push(['n', t(e)]);
    });
    const r = b.getBoundingClientRect();
    const c = document.getElementById('parcours-contour');
    return {
        attente: b.classList.contains('est-en-attente'),
        titre: un('.parcours-bulle-titre'), entree: un('.parcours-bulle-identite'), objectif: un('.parcours-bulle-objectif:not(.parcours-bulle-atteint)'),
        confirme: un('.parcours-bulle-confirme'), lieu: un('.parcours-bulle-lieu'), atteint: un('.parcours-bulle-atteint'),
        suite: un('.parcours-bulle-suite-suggeree'), compteur: un('#parcours-bulle-rang'),
        lignes, boutons: [...b.querySelectorAll('.parcours-bulle-boutons button')].filter(vu).map(t),
        dansLEcran: r.left >= 0 && r.top >= 0 && r.right <= document.documentElement.clientWidth + 0.5 && r.bottom <= window.innerHeight + 0.5,
        contour: !!c && !c.hidden
    };
});

/** Les textes d'une bulle du code (`ParcoursCibles.textes[k]`), forme `f` (-1 : la première). */
const attendu = (page, k, f) => page.evaluate(([k, f]) => {
    const t = window.ParcoursCibles.textes[k];
    const plat = (x) => x.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
    return { titre: t.titre, confirme: t.confirme || '', lieu: t.lieu || '', lignes: (f < 0 ? t.lignes : t.puis[f]).map((l) => [l[0], plat(l[1])]) };
}, [k, f]);

/** La bulle `k` (rang - 1) est à l'écran, dans sa forme `f`, mot pour mot ; elle tient dans l'écran. */
async function bulleEst(page, k, f = -1, { boutons = [], premiere = false, contour = null } = {}) {
    const a = await attendu(page, k, f);
    await expect.poll(async () => {
        const b = await lire(page);
        return b && !b.attente && (await etape(page)) === k ? JSON.stringify(b.lignes) : '';
    }, { message: `bulle ${k + 1}, forme ${f + 2} : ses lignes`, timeout: 15000 }).toBe(JSON.stringify(a.lignes));
    const b = await lire(page);
    expect(b.titre, `bulle ${k + 1} : le titre`).toBe(a.titre);
    expect(b.compteur, `bulle ${k + 1} : le compteur`).toBe(`${k + 1} sur 12`);
    // La seconde forme ne garde que son titre et son compteur (le moule) ; la première porte la confirmation et le lieu.
    expect(b.confirme, `bulle ${k + 1} : la confirmation`).toBe(f < 0 && !premiere ? a.confirme : '');
    expect(b.lieu, `bulle ${k + 1} : la phrase du lieu`).toBe(f < 0 ? a.lieu : '');
    expect(b.boutons, `bulle ${k + 1} : ses boutons`).toEqual(boutons);
    expect(b.dansLEcran, `bulle ${k + 1} : dans l'écran`).toBe(true);
    if (contour !== null) await expect.poll(async () => (await lire(page)).contour, { message: `bulle ${k + 1} : ce qu'il faut toucher est désigné` }).toBe(contour);
    return b;
}

const inscriptionsDeMarmotte = (page) => page.evaluate(([da, cible]) => (db.getSync('demo_inscriptionsCibles', []) || [])
    .filter((x) => x.type === 'inscription' && String(x.da) === da && x.cibleId === cible)
    .map((x) => ({ niveau: x.niveau, date: x.date, productionId: x.productionId, origine: x.origine, noteBreve: x.noteBreve,
        criteres: x.criteres.map((c) => [c.texte, c.respecte]) })), [DA, CIBLE]);
const autresInscriptions = (page) => page.evaluate(([da, cible]) => JSON.stringify((db.getSync('demo_inscriptionsCibles', []) || [])
    .filter((x) => !(String(x.da) === da && x.cibleId === cible))), [DA, CIBLE]);

// 25 nov. 2026 : la bulle 5 touche un tampon d'observation. PARCOURS9_CAPTURES=<dossier> : la bulle 5 avant et après
// « Remplir » (l'écran « Observer » et ses six tampons), puis la bulle 6, à la taille de l'essai en cours.
const CAPTURES9 = process.env.PARCOURS9_CAPTURES || '';
async function capture9(page, nom, L, H) {
    if (!CAPTURES9) return;
    fs9.mkdirSync(CAPTURES9, { recursive: true });
    await page.screenshot({ path: path9.join(CAPTURES9, `${nom}-${L}x${H}-clair.png`) });
}
const OPERATIONS = ['Identification', 'Relation', 'Déduction', 'Interprétation', 'Comparaison', 'Induction'];
/** Les tampons de l'écran « Observer » : [nom lu, retenu ?], dans l'ordre de l'écran. */
const tamponsDeLEcran = (page) => ecran(page).locator('.oc-tampon').evaluateAll((l) => l.map((b) => [b.getAttribute('aria-label'), b.getAttribute('aria-pressed') === 'true']));
/** Deux boîtes se recouvrent-elles ? */
const recouvre = (a, b) => !!a && !!b && a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
/** Les tampons que porte l'inscription (a) de Marmotte Pétillante, tels que rangés dans la démo. */
const tamponsDeLObservation = (page) => page.evaluate(([da, cible]) => (db.getSync('demo_inscriptionsCibles', []) || [])
    .filter((x) => x.type === 'inscription' && String(x.da) === da && x.cibleId === cible && x.niveau === null).map((x) => x.tampons), [DA, CIBLE]);

async function lancerLeModele(page) {
    await ouvrirPanneau(page);
    await carte(page).locator('.assistance-modele-bouton').click();
    await expect(bulle(page)).toBeVisible({ timeout: 20000 });
}

for (const [L, H] of TAILLES) {
    test(`A · ${L} × ${H} : la carte, les douze bulles mot pour mot, ce qu'elles citent de l'écran, le confinement, « Refaire »`, async ({ page }) => {
        test.setTimeout(420000);
        page.setDefaultTimeout(20000);
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        await ouvrirEspaceVide(page, L, H);
        await peuplerUnTrimestreReel(page);
        const avant = await releve(page);
        const histoire = await page.evaluate(async () => { await window.verserGroupeParStandardsSiAbsent(); return PACK_DEMARRAGE.groupeParStandards.histoire.inscriptions; });

        // La carte du panneau : rang 9, sa ligne, un seul temps (« Je regarde »), aucun « Nous faisons ».
        await ouvrirPanneau(page);
        await expect(carte(page).locator('.assistance-pastille')).toHaveText('9');
        await expect(carte(page).locator('.assistance-parcours-titre')).toHaveText('Suivre ton groupe par cibles');
        expect(await texte(carte(page).locator('.assistance-parcours-ligne'))).toBe('Pour la pratique « Par standards ».');
        await expect(carte(page)).toHaveAttribute('data-temps', 'un');
        await expect(carte(page).locator('button')).toHaveText(['Je regarde']);
        await expect(carte(page).locator('.assistance-modele-etat')).toHaveText('À faire');
        expect(await texte(carte(page))).not.toMatch(/Nous faisons|Pratique guidée/);
        await carte(page).locator('.assistance-modele-bouton').click();
        await expect(bulle(page)).toBeVisible({ timeout: 20000 });
        expect(await enDemo(page), 'le modèle se joue dans la démo').toBe(true);
        const autresAuDepart = await autresInscriptions(page);

        // ---- 1 · Les cibles du cours : l'entrée, l'objectif, le lieu ; la fiche de la pratique.
        let b = await bulleEst(page, 0, -1, { boutons: ['Suivant'], premiere: true, contour: false });
        expect(b.entree).toBe('Parcours 9 · Suivre ton groupe par cibles · Je regarde');
        expect(b.objectif).toBe(sansInsecable(await page.evaluate(() => ParcoursCibles.objectif)));
        expect(await page.evaluate(() => (db.getSync('groupeCoursActif', null) || {}).id), 'le troisième groupe').toBe('GC_DEMO_STD');
        expect(await texte(page.locator('#selectGroupeCoursHeader option:checked'))).toContain('601-998-DM · gr. 00003');
        const fiche = page.locator('#mat-cibles-fiche .cibles-fiche-cible');
        await expect(fiche).toHaveCount(5);
        expect(await Promise.all([0, 1, 2, 3, 4].map(async (k) => [await texte(fiche.nth(k).locator('.cibles-fiche-etiquette')), await texte(fiche.nth(k).locator('.cibles-fiche-poids'))])))
            .toEqual([['La lecture stratégique', 'Poids 25 · 25 %'], ['La lecture analytique', 'Poids 30 · 30 %'], ['Le plan', 'Poids 10 · 10 %'],
                ['La rédaction', 'Poids 25 · 25 %'], ['La révision', 'Poids 10 · 10 %']]);
        // Ce que le menu dit du lieu (la bulle dit « Pratiques de notation » : rapport du lot).
        expect(await page.evaluate(() => [...document.querySelectorAll('.navigation-principale button.actif, .sous-navigation button.actif')]
            .filter((x) => x.offsetParent).map((x) => x.textContent.replace(/\s+/g, ' ').trim()))).toEqual(['Conception', 'Pratiques']);
        await dansLaBulle(page, 'Suivant').click();

        // ---- 2 · Les critères et l'échelle.
        await bulleEst(page, 1, -1, { boutons: ['Suivant'], contour: false });
        const criteres = fiche.nth(0).locator('.cibles-fiche-criteres li');
        expect(await Promise.all([0, 1, 2, 3].map((k) => texte(criteres.nth(k))))).toEqual(
            ['Structure critère essentiel', 'Rigueur critère essentiel', 'Plausibilité critère essentiel', 'Nuance']);
        const echelle = await page.evaluate(() => {
            const p = (db.getSync('demo_pratiquesConfigurables', []) || []).find((x) => x.id === 'demo-cib-litt');
            const e = (db.getSync('demo_echellesTemplates', []) || []).find((x) => x.id === 'ECH_DEMO_STD');
            return { nom: e.nom.replace(/ /g, ' '), niveaux: e.niveaux.map((n) => n.code + ' – ' + n.nom), sansDonnee: p.configuration.codeSansDonnee || p.configuration.niveauSansDonnee };
        });
        expect(echelle.nom).toBe('Échelle de départ – Par standards');
        expect(echelle.niveaux).toEqual(expect.arrayContaining(['0 – Données insuffisantes', '3 – Acquis', '4 – Avancé', '2 – Ça y est presque']));
        expect(echelle.niveaux).toHaveLength(5);
        await dansLaBulle(page, 'Suivant').click();

        // ---- 3 · Observer en classe : le tableau des cibles.
        await bulleEst(page, 2, -1, { contour: true });
        await expect(page.locator('.tc-tableau tbody tr')).toHaveCount(10);
        await expect(page.locator('.tc-tableau thead .tc-col-cible')).toHaveCount(5);
        expect(await page.evaluate(() => [...document.querySelectorAll('.navigation-principale button.actif, .sous-navigation button.actif')]
            .filter((x) => x.offsetParent).map((x) => x.textContent.replace(/\s+/g, ' ').trim()))).toEqual(['Évaluation', 'Tableau de notation']);
        expect(await texte(rangee(page).locator('.tc-note-etat')), 'avant : « En attente »').toBe('En attente');
        expect(await texte(rangee(page).locator('.tc-note-detail'))).toBe('La lecture stratégique');
        await page.locator('[data-tc="observer"]').click();

        // ---- 4 · Une cible, puis une personne à la fois : « Remplir » choisit la cible et tout le groupe.
        await bulleEst(page, 3, -1, { boutons: ['Remplir'], contour: false });
        await expect(ecran(page)).toBeVisible();
        await dansLaBulle(page, 'Remplir').click();
        await bulleEst(page, 3, 0, { contour: true });
        await expect(ecran(page).locator('.oc-tuile[aria-pressed="true"] .oc-tuile-nom')).toHaveText('La lecture stratégique');
        await expect(ecran(page).locator('[data-oc="groupe-entier"]')).toHaveAttribute('aria-pressed', 'true');
        await ecran(page).locator('[data-oc="commencer"]').click();

        // ---- 5 · Ce que tu vois : le carrousel sur Marmotte Pétillante ; (a) posée, inscrite ; l'écran refermé.
        await bulleEst(page, 4, -1, { boutons: ['Remplir'], contour: false });
        await expect(ecran(page).locator('#oc-nom')).toHaveText(NOM);
        // La démo : la rangée « Tampons d'observation » et les six tampons d'« Opérations », aucun retenu ; rien n'est
        // rangé pour cela hors de la démo (la catégorie y est d'observation par lecture).
        expect(await tamponsDeLEcran(page)).toEqual(OPERATIONS.map((n) => [n, false]));
        expect(await page.evaluate(() => db.getSync('categoriesObservation', null)), 'aucune catégorie cochée dans les réglages de la personne').toBeNull();
        // Les six tampons tiennent à l'écran avec les quatre critères, sans cacher « Inscrire et passer au suivant ».
        await expect(ecran(page).locator('.tc-critere')).toHaveCount(4);
        const inscrireB = await ecran(page).locator('[data-oc="inscrire"]').boundingBox();
        expect(inscrireB.y + inscrireB.height, '« Inscrire et passer au suivant » est dans l\'écran').toBeLessThanOrEqual(H + 0.5);
        for (const b of await ecran(page).locator('.oc-tampon').all()) {
            const boite = await b.boundingBox();
            expect(Math.min(boite.width, boite.height), 'une cible de 44 px au moins').toBeGreaterThanOrEqual(44);
            expect(boite.x >= 0 && boite.x + boite.width <= L + 0.5 && boite.y >= 0 && boite.y + boite.height <= H + 0.5, 'le tampon est dans l\'écran').toBe(true);
            expect(recouvre(boite, inscrireB), 'aucun tampon ne recouvre le bouton').toBe(false);
        }
        expect(await ecran(page).locator('.oc-tampon img').evaluateAll((l) => l.map((i) => i.complete && i.naturalWidth > 0))).toEqual([true, true, true, true, true, true]);
        await capture9(page, 'bulle-5-avant-remplir', L, H);
        await dansLaBulle(page, 'Remplir').click();
        await bulleEst(page, 4, 0, { contour: true });
        // « Remplir » a touché « Identification », et lui seul.
        expect(await tamponsDeLEcran(page)).toEqual(OPERATIONS.map((n) => [n, n === 'Identification']));
        // La bulle, dans sa forme la plus haute (trois paragraphes) : elle ne cache ni le tampon touché ni le bouton qu'elle désigne.
        const bulleB = await bulle(page).boundingBox();
        expect(recouvre(bulleB, await ecran(page).locator('[data-oc="inscrire"]').boundingBox()), 'la bulle ne cache pas « Inscrire et passer au suivant »').toBe(false);
        expect(recouvre(bulleB, await ecran(page).locator('.oc-tampon[aria-pressed="true"]').boundingBox()), 'la bulle ne cache pas le tampon touché').toBe(false);
        expect(await bulle(page).evaluate((b) => b.scrollHeight <= b.clientHeight + 1), 'la bulle se lit sans défiler').toBe(true);
        await capture9(page, 'bulle-5-apres-remplir', L, H);
        expect(await ecran(page).locator('.tc-critere').evaluateAll((l) => l.map((li) => (li.querySelector('.tc-coche[aria-pressed="true"]') || { dataset: {} }).dataset.valeur || 'vide')))
            .toEqual(['oui', 'oui', 'non', 'vide']);
        await expect(ecran(page).locator('.oc-note')).toHaveValue(histoire[0].noteBreve);
        await ecran(page).locator('[data-oc="inscrire"]').click();
        await bulleEst(page, 4, 1, { contour: true });
        await capture9(page, 'bulle-5-apres-inscription', L, H);
        // Le ✕ que la bulle demande de toucher est à l'écran, et la bulle ne le cache pas.
        const fermerB = await ecran(page).locator('.modal-fermer').boundingBox();
        expect(fermerB.y >= 0 && fermerB.y + fermerB.height <= H + 0.5, 'le ✕ est dans l\'écran').toBe(true);
        expect(recouvre(await bulle(page).boundingBox(), fermerB), 'la bulle ne cache pas le ✕').toBe(false);
        await expect(ecran(page).locator('#oc-nom'), 'l\'écran passe à la personne suivante').not.toHaveText(NOM);
        await expect(ecran(page).locator('.oc-pastille--vu .oc-pastille-nom')).toHaveText([NOM]);
        expect(await texte(ecran(page).locator('.oc-pastille--vu .oc-marque--vu'))).toBe('vu aujourd’hui');
        // (a) porte la date de l'histoire, pas celle du jour ; son origine est l'observation.
        expect(await inscriptionsDeMarmotte(page)).toEqual([{ niveau: null, date: '2025-09-11', productionId: null, origine: 'observation', noteBreve: histoire[0].noteBreve,
            criteres: [['Structure', true], ['Rigueur', true], ['Plausibilité', false], ['Nuance', null]] }]);
        // (a) porte le tampon touché, copié par l'application (la forme du lot 2), et le texte raccourci.
        expect(await tamponsDeLObservation(page)).toEqual([[{ id: 'action-reperage', nom: 'Identification', categorieId: 'action', categorieNom: 'Opérations', critere: '', emoji: '' }]]);
        expect(histoire[0].noteBreve).toBe('Son hypothèse ne s\'appuie pas encore sur le texte.');
        // « On s'arrête là » : le bouton d'inscription ne répond pas pour la personne suivante.
        await ecran(page).locator('.tc-coche[data-valeur="oui"]').first().click();
        await ecran(page).locator('[data-oc="inscrire"]').click();
        expect(await inscriptionsDeMarmotte(page)).toHaveLength(1);
        expect(await autresInscriptions(page), 'rien ne s\'inscrit pour la personne suivante').toBe(autresAuDepart);
        await ecran(page).locator('.modal-fermer').click();

        // ---- 6 · Une case par cible : ✎, aucun niveau.
        await bulleEst(page, 5, -1, { contour: true });
        await capture9(page, 'bulle-6', L, H);
        await expect(caseDeMarmotte(page).locator('.tc-case-remarque')).toHaveText('✎');
        await expect(caseDeMarmotte(page).locator('.tc-case-sans-donnee')).toHaveText('Données insuffisantes');
        await expect(caseDeMarmotte(page).locator('.tc-case-niveau')).toHaveCount(0);
        await caseDeMarmotte(page).click();

        // ---- 7 · Inscrire un niveau : la fenêtre ; « Remplir » pose (b) sans l'inscrire.
        await bulleEst(page, 6, -1, { boutons: ['Remplir'], contour: false });
        await expect(fenetre(page).locator('.modal-titre')).toHaveText('Inscrire un niveau');
        expect(await fenetre(page).locator('form .tc-section-titre, form .tc-champ-nom').allTextContents())
            .toEqual(['Critères', 'Niveau', 'Rétroaction', 'D’où vient cette inscription ?', 'Date']);
        await dansLaBulle(page, 'Remplir').click();
        await bulleEst(page, 6, 0, { contour: true });
        const lue = () => page.evaluate(() => {
            const f = document.querySelector('.tc-overlay:not(.oc-overlay) [data-tc-bloc]');
            const n = f.querySelector('.tc-niveaux input:checked').closest('label');
            return { coches: [...f.querySelectorAll('.tc-critere')].map((li) => (li.querySelector('.tc-coche[aria-pressed="true"]') || { dataset: {} }).dataset.valeur || 'vide'),
                niveau: n.querySelector('.tc-niveau-code').textContent + ' – ' + n.querySelector('.tc-niveau-nom').textContent,
                retro: f.querySelector('.tc-retroaction').value, origine: f.querySelector('.tc-origine').selectedOptions[0].textContent.replace(/ /g, ' '),
                date: f.querySelector('.tc-date').value, bouton: f.querySelector('[data-tc="inscrire"]').textContent };
        });
        expect(await lue()).toEqual({ coches: ['oui', 'oui', 'non', 'non'], niveau: '2 – Ça y est presque', retro: histoire[1].noteBreve,
            origine: 'Stratégies de lecture sur « Deux-Rives »', date: '2025-09-17', bouton: 'Inscrire le niveau' });
        expect(await inscriptionsDeMarmotte(page), '« Remplir » n\'inscrit rien').toHaveLength(1);
        await fenetre(page).locator('[data-tc="inscrire"]').click();

        // ---- 8 · Deux semaines plus tard : la case montre 2 ; la même case, (c).
        await bulleEst(page, 7, -1, { contour: true });
        await expect(caseDeMarmotte(page).locator('.tc-case-niveau')).toHaveText('2');
        await caseDeMarmotte(page).click();
        await bulleEst(page, 7, 0, { boutons: ['Remplir'], contour: false });
        await dansLaBulle(page, 'Remplir').click();
        await bulleEst(page, 7, 1, { contour: true });
        expect(await lue()).toEqual({ coches: ['oui', 'oui', 'oui', 'non'], niveau: '3 – Acquis', retro: histoire[2].noteBreve,
            origine: 'Stratégies de lecture sur « Marine »', date: '2025-10-01', bouton: 'Inscrire le niveau' });
        await fenetre(page).locator('[data-tc="inscrire"]').click();

        // ---- 9 · Le niveau retenu : la case (3, trois inscriptions), puis son historique.
        await bulleEst(page, 8, -1, { contour: true });
        await expect(caseDeMarmotte(page).locator('.tc-case-niveau')).toHaveText('3');
        await expect(caseDeMarmotte(page).locator('.tc-case-compte')).toHaveText('3');
        expect(await caseDeMarmotte(page).getAttribute('title')).toContain('niveau retenu Acquis, 3 inscriptions, dont 1 trace sans niveau');
        await caseDeMarmotte(page).click();
        await bulleEst(page, 8, 0, { contour: true });
        expect(await texte(fenetre(page).locator('.tc-retenu .tc-retenu-ligne').first())).toBe('Niveau retenu : 3 · Acquis, inscrit le 1er octobre 2025.');
        expect((await fenetre(page).locator('.tc-historique-liste .tc-entree-tete').allTextContents()).map(sansInsecable)).toEqual([
            '1er octobre 2025 3 · Acquis niveau retenu Production : Stratégies de lecture sur « Marine »',
            '17 septembre 2025 2 · Ça y est presque Production : Stratégies de lecture sur « Deux-Rives »',
            '11 septembre 2025 Remarque, sans niveau Observation']);
        // On lit : ni inscription ni annulation ne répond dans cette fenêtre.
        await fenetre(page).locator('.tc-retroaction').fill('Une note du banc.');
        await fenetre(page).locator('[data-tc="inscrire"]').click();
        await fenetre(page).locator('[data-tc="annuler"]').first().click();
        await expect(page.locator('#overlay-ui-dialogue')).toHaveCount(0);
        expect(await inscriptionsDeMarmotte(page)).toHaveLength(3);
        await fenetre(page).locator('.modal-actions [data-tc="fermer"]').click();

        // ---- 10 · La note du cours : 69 %.
        await bulleEst(page, 9, -1, { boutons: ['Suivant'], contour: false });
        expect(await texte(rangee(page).locator('.tc-note-valeur'))).toBe('69 %');
        expect(await texte(page.locator('.tc-tableau thead .tc-col-note'))).toBe('Note');
        await dansLaBulle(page, 'Suivant').click();

        // ---- 11 · D'où vient la note : le profil, section « Cibles ».
        await bulleEst(page, 10, -1, { boutons: ['Suivant'], contour: false });
        const note = page.locator('.pc-panneau .pc-note');
        await expect(note).toBeVisible();
        expect(await texte(note.locator('.pc-titre'))).toContain('Note du cours');
        expect(await texte(note.locator('.pc-note-valeur strong'))).toBe('68,8 %');
        expect((await note.locator('.pc-recit tbody tr').evaluateAll((l) => l.map((tr) => [...tr.children].map((c) => c.textContent.replace(/ /g, ' ').trim())))))
            .toEqual([['La lecture stratégique', '3 · Acquis', '75 %', '25', '25 %'], ['La lecture analytique', '3 · Acquis', '75 %', '30', '30 %'],
                ['Le plan', '3 · Acquis', '75 %', '10', '10 %'], ['La rédaction', '2 · Ça y est presque', '50 %', '25', '25 %'], ['La révision', '3 · Acquis', '75 %', '10', '10 %']]);
        expect(await page.evaluate(() => String(window.profilActuelDA))).toBe(DA);
        await dansLaBulle(page, 'Suivant').click();

        // ---- 12 · La fin : l'objectif atteint, la suite suggérée (le parcours 6), deux boutons.
        const fin = await page.evaluate(() => {
            const t = ParcoursCibles.textes[11];
            return { explication: t.lignes[0][1], atteint: ParcoursCibles.objectifAtteint };
        });
        await expect.poll(() => etape(page)).toBe(11);
        await expect.poll(async () => (await lire(page)).boutons).toEqual(['Voir le parcours 6', 'Terminer']);
        b = await lire(page);
        expect(b.titre).toBe('Ton groupe, cible par cible');
        expect(b.confirme).toBe(sansInsecable(await page.evaluate(() => ParcoursCibles.textes[11].confirme)));
        expect(b.lignes).toEqual([['n', sansInsecable(fin.explication)], ['c', 'Touche « Voir le parcours 6 », ou « Terminer »']]);
        expect(b.atteint).toBe(sansInsecable(fin.atteint));
        expect(b.suite).toBe('Suite suggérée : le parcours 6, « Mettre tes données à l\'abri ».');
        expect(b.dansLEcran).toBe(true);
        expect(await texte(bulle(page))).not.toContain('Le refaire avec ma classe');
        await dansLaBulle(page, 'Terminer').click();
        await expect(bulle(page)).toHaveCount(0);

        // Les trois inscriptions sont celles de l'histoire, dans l'ordre ; rien d'autre n'a bougé dans la liste.
        expect(await inscriptionsDeMarmotte(page)).toEqual(histoire.map((s) => ({ niveau: s.niveau, date: s.date, productionId: s.productionId,
            origine: s.productionId ? 'production' : 'observation', noteBreve: s.noteBreve, criteres: s.criteres.map((c) => [c.texte, c.respecte]) })));
        expect(await autresInscriptions(page)).toBe(autresAuDepart);

        // La carte : « Fait ». « Voir le parcours 6 » n'est pas jugé ici (il ouvre le panneau devant le parcours 6).
        await ouvrirPanneau(page);
        await expect(carte(page)).toHaveAttribute('data-etat', 'fait');
        await expect(carte(page).locator('.assistance-modele-etat')).toHaveText('Fait');
        await page.evaluate(() => Assistance.fermerPanneau());

        // La sortie : aucune clé hors de la démo ne change.
        await page.evaluate(() => desactiverModeDemo());
        await expect.poll(() => enDemo(page)).toBe(false);
        expect(ecarts(avant, await releve(page), horsDeLaDemo), 'aucune clé hors de la démo ne change').toEqual([]);

        // « Refaire » : ce que le modèle a posé part (les trois inscriptions de Marmotte Pétillante sur cette cible), le
        // reste de la démo reste, et le modèle repart de sa première bulle.
        await ouvrirPanneau(page);
        await carte(page).locator('.assistance-modele-bouton').click();
        await expect(bulle(page)).toBeVisible({ timeout: 20000 });
        await bulleEst(page, 0, -1, { boutons: ['Suivant'], premiere: true });
        expect(await inscriptionsDeMarmotte(page)).toEqual([]);
        expect(await autresInscriptions(page)).toBe(autresAuDepart);
        await expect(page.locator('#overlay-ui-dialogue'), '« Refaire » ne remet pas la démo à neuf : aucune question').toHaveCount(0);
        await page.evaluate(() => { ParcoursMoteur.fermer(); naviguerVers('evaluations', 'tableau'); });
        await expect(caseDeMarmotte(page).locator('.tc-case-sans-donnee')).toHaveText('Données insuffisantes');
        await expect(caseDeMarmotte(page).locator('.tc-case-remarque')).toHaveCount(0);
        expect(await texte(rangee(page).locator('.tc-note-etat'))).toBe('En attente');
        await page.evaluate(() => desactiverModeDemo());
        await expect.poll(() => enDemo(page)).toBe(false);
        expect(ecarts(avant, await releve(page), horsDeLaDemo), 'après « Refaire » : aucune clé hors de la démo ne change').toEqual([]);
        expect(erreurs).toEqual([]);
    });
}

test('B · une démo déjà installée sans le troisième groupe le reçoit avant la première bulle', async ({ page }) => {
    test.setTimeout(120000);
    page.setDefaultTimeout(20000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirEspaceVide(page, 1180, 820);
    await expect.poll(() => page.evaluate(() => !!window.PACK_DEMARRAGE && Array.isArray(db.getSync('demo_groupesCours', null)))).toBe(true);
    // Une démo d'avant le 22 nov. : ce que le bloc du troisième groupe y a versé en est retiré.
    await page.evaluate(async () => {
        const a = window.ajoutsDuGroupeParStandards(window.PACK_DEMARRAGE);
        const ids = new Set([a.groupeCours.id, a.horaire.id, a.groupeCours.coursId]);
        Object.values(a.collections).forEach((l) => l.forEach((x) => x && x.id && ids.add(x.id)));
        for (const k of await db.keys()) {
            if (k.indexOf('demo_') !== 0) continue;
            const v = db.getSync(k, null);
            if (!Array.isArray(v)) continue;
            const reste = v.filter((x) => !(x && ids.has(x.id)));
            if (reste.length === v.length) continue;
            if (reste.length) db.setSync(k, reste); else db.removeSync(k);
        }
        await db.flush();
    });
    expect(await page.evaluate(() => db.getSync('demo_groupesCours', []).map((g) => g.id))).toEqual(['GC_DEMO']);
    await lancerLeModele(page);
    await bulleEst(page, 0, -1, { boutons: ['Suivant'], premiere: true });
    expect(await page.evaluate(() => db.getSync('demo_groupesCours', []).map((g) => g.id))).toEqual(['GC_DEMO', 'GC_DEMO_STD']);
    expect(await page.evaluate(() => (db.getSync('groupeCoursActif', null) || {}).id)).toBe('GC_DEMO_STD');
    await expect(page.locator('#mat-cibles-fiche .cibles-fiche-cible')).toHaveCount(5);
    expect(erreurs).toEqual([]);
});

// BREAK-TESTS (23 nov. 2026, Chromium, A à 1180 × 820, B), chacun rouge puis le code remis à l'identique (`cmp`) :
//   BB1. « Remplir » de la bulle 4 ne donne plus la date de l'histoire à l'écran d'observation (il garde celle du jour)
//        → A rouge : l'observation inscrite n'est pas celle de l'histoire, la bulle 5 n'arrive pas à sa troisième forme.
//   BB2. la garde de la fin de la bulle 5 retirée → A rouge : une inscription s'écrit pour la personne suivante.
//   BB3. `defaireModele` ne retire plus rien → A rouge : après « Refaire », le modèle ne repart pas de sa première bulle.
//   BB4. le versement du troisième groupe retiré de `lancerModele` → B rouge : aucune bulle ne paraît.
//   BB5. une clé écrite hors de la démo au lancement → A rouge : « aucune clé hors de la démo ne change ».
