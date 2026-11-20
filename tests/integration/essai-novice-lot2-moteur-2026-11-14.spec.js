import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ESSAI NOVICE DU 14 NOV. 2026, LOT 2 — LE MOTEUR DES PARCOURS
// plans de travail/CONSIGNE-2026-11-14-essai-novice.md, lot 2 (a à e) et règles 2 à 7.
//
// Un parcours FICTIF, joué par le vrai moteur dans la vraie page : ce banc éprouve le moteur, pas
// les textes d'un parcours (ceux de « Mettre ta classe en place » ont le leur).
//   (a) les lignes d'une bulle : une par geste ; faite, elle se grise avec un crochet, sans que la
//       bulle bouge ; les sous-lignes une à une, la mère quand toutes le sont ; une explication ne
//       se grise pas ; la consigne est la dernière ligne ; la flèche d'un champ part avec sa ligne ;
//   (b) le compteur « n sur N » : un bouton (44 px), la liste des étapes, une étape faite se revoit
//       EN VISITE (« Continuer », rien n'avance seul, l'étape la plus loin atteinte reste connue), une étape
//       au-delà ne se touche pas ;
//   (c) « Tu es dans « X », à l'onglet « Y ». », le halo sur les deux entrées du menu, la page en haut ;
//   (d) une bulle qui présente une page sans rien y désigner se range dans son coin, pas au centre ;
//   (e) la dernière bulle : « Voir le parcours N » et « Terminer » de même poids, et la phrase du compteur.
//       (20 nov. 2026, plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, A3 : « Parcours suivant », qui
//       lançait le parcours suivant d'office, devient « Voir le parcours N », qui ouvre le panneau devant lui.)
// ═══════════════════════════════════════════════════════════════════════════════════════════

async function ouvrir(page, largeur = 1180, hauteur = 820) {
    await page.setViewportSize({ width: largeur, height: hauteur });
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await attendreApplication(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await attendreRepos(page);
    await page.evaluate(() => naviguerVers('suivi', 'groupe'));
    await attendreRepos(page);
}

/** Le parcours fictif : trois étapes ; ses champs sont posés dans la page, en haut de la section. */
async function lancerLeFictif(page, opts = {}) {
    await page.evaluate((opts) => {
        const hote = document.createElement('div');
        hote.id = 'banc-fictif';
        hote.style.cssText = 'display:flex;gap:12px;padding:12px;flex-wrap:wrap';
        for (const n of ['a', 'b', 'c', 'd']) {
            const champ = document.createElement('input');
            champ.id = 'banc-' + n;
            champ.className = 'controle-form';
            champ.style.width = '140px';
            champ.setAttribute('aria-label', 'champ ' + n);
            hote.appendChild(champ);
        }
        const creer = document.createElement('button');
        creer.id = 'banc-creer';
        creer.className = 'btn btn-principal';
        creer.textContent = 'Créer';
        hote.appendChild(creer);
        const section = document.querySelector('#suivi-groupe') || document.body;
        section.insertBefore(hote, section.firstChild);
        const el = (id) => document.getElementById(id);
        window.__banc = { cree: false, surEtape: [], termine: 0 };
        el('banc-creer').addEventListener('click', () => { window.__banc.cree = true; });
        const def = {
            id: opts.id || 'banc-fictif',
            lienSortie: 'Plus tard',
            etapes: [
                {
                    titre: 'Première étape',
                    lignes: () => [
                        { texte: 'Aie sous la main ton document.', note: true },
                        { texte: 'Remplis le champ A (il servira)', champs: () => [el('banc-a')] },
                        { texte: 'Donne trois valeurs :', sous: [
                            { texte: 'la B', champs: () => [el('banc-b')] },
                            { texte: 'la C', champs: () => [el('banc-c')] },
                            { texte: 'la D', champs: () => [el('banc-d')] }
                        ] },
                        { texte: 'Ceci est une explication' },
                        { texte: 'Touche « Créer »', geste: true },
                        { texte: 'Le reste peut attendre.', note: true }
                    ],
                    contour: () => el('banc-creer'),
                    atteint: () => window.__banc.cree
                },
                {
                    titre: 'Deuxième étape',
                    lieu: true,
                    lignes: () => [{ texte: 'Regarde cette page' }, { texte: 'Touche « Continuer »', geste: true }],
                    boutons: [{ libelle: 'Continuer', primaire: true, action: (m) => m.allerA(2) }]
                },
                {
                    titre: 'Dernière étape',
                    sansSortie: true,
                    texte: 'Voilà.',
                    geste: 'Touche « Terminer ».',
                    boutons: [{ libelle: 'Terminer', primaire: true, action: () => { window.__banc.termine++; window.ParcoursMoteur.fermer(); } }]
                }
            ]
        };
        window.__banc.def = def;
        return window.ParcoursMoteur.lancer(def, Object.assign({ surEtape: (i) => window.__banc.surEtape.push(i) }, opts.lancer || {}));
    }, opts);
    await page.waitForSelector('#parcours-bulle .parcours-bulle-titre');
}

const titre = (page) => page.locator('#parcours-bulle .parcours-bulle-titre');
const lignes = (page) => page.evaluate(() => [...document.querySelectorAll('#parcours-bulle .parcours-bulle-ligne')].map((li) => ({
    texte: li.querySelector('.parcours-bulle-ligne-texte').textContent, faite: li.classList.contains('est-faite'),
    geste: li.classList.contains('parcours-bulle-ligne--geste'), niveau: li.parentElement.closest('.parcours-bulle-ligne') ? 2 : 1,
    crochet: getComputedStyle(li, '::before').content
})));
const fleches = (page) => page.locator('#parcours-fleches .parcours-fleche').count();
const boite = (page) => page.evaluate(() => { const r = document.getElementById('parcours-bulle').getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), l: Math.round(r.width), h: Math.round(r.height) }; });
/** Attend `n` passages de plus de la sonde du moteur : une condition, pas un délai. */
async function passagesDeLaSonde(page, n = 3) {
    const depart = await page.evaluate(() => (window.ParcoursMoteur.placement() || { passages: 0 }).passages);
    await page.waitForFunction(({ depart, n }) => (window.ParcoursMoteur.placement() || { passages: 0 }).passages >= depart + n, { depart, n });
}
async function remplir(page, id, valeur) {
    await page.fill('#' + id, valeur);
    await passagesDeLaSonde(page);
}

test('(a) les lignes : une par geste, grisées au crochet une fois faites, la bulle ne bouge pas', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrir(page);
    await lancerLeFictif(page);
    await expect(titre(page)).toHaveText('Première étape');

    // La forme : les notes sont des phrases hors de la liste ; la consigne est la DERNIÈRE ligne de la liste.
    const notes = await page.evaluate(() => [...document.querySelectorAll('#parcours-bulle .parcours-bulle-note')].map((p) => p.textContent));
    expect(notes).toEqual(['Aie sous la main ton document.', 'Le reste peut attendre.']);
    let l = await lignes(page);
    // (L'espace insécable devant les deux-points : le moteur le pose depuis le 16 nov. 2026, pour toutes les bulles.)
    expect(l.map((x) => x.texte)).toEqual(['Remplis le champ A (il servira)', 'Donne trois valeurs\u00a0:', 'la B', 'la C', 'la D', 'Ceci est une explication', 'Touche « Créer »']);
    expect(l.map((x) => x.niveau)).toEqual([1, 1, 2, 2, 2, 1, 1]);
    expect(l[l.length - 1].geste, 'la consigne est la dernière ligne').toBe(true);
    expect(l.filter((x) => x.geste).length).toBe(1);
    expect(l.some((x) => x.faite), 'rien de fait au départ').toBe(false);
    // Une seule page : ni « ← 1/2 → », ni paragraphe.
    await expect(page.locator('#parcours-bulle .parcours-bulle-nav')).toBeHidden();
    await expect(page.locator('#parcours-bulle .parcours-bulle-texte')).toBeHidden();
    // Une flèche par champ encore vide (quatre), et celle de ce qu'il faut toucher.
    expect(await fleches(page)).toBe(5);

    const avant = await boite(page);
    await remplir(page, 'banc-a', 'x');
    l = await lignes(page);
    expect(l[0].faite, 'le champ A rempli : sa ligne se grise').toBe(true);
    expect(l[0].crochet).toContain('✓');
    expect(l[1].faite, 'la ligne mère attend ses trois sous-lignes').toBe(false);
    expect(await fleches(page), 'la flèche du champ A est partie').toBe(4);
    expect(await boite(page), 'la bulle ne bouge pas, la ligne ne disparaît pas').toEqual(avant);

    await remplir(page, 'banc-b', 'x');
    await remplir(page, 'banc-c', 'x');
    l = await lignes(page);
    expect([l[2].faite, l[3].faite, l[4].faite], 'les sous-lignes se grisent une à une').toEqual([true, true, false]);
    expect(l[1].faite).toBe(false);
    await remplir(page, 'banc-d', 'x');
    l = await lignes(page);
    expect(l[1].faite, 'les trois sous-lignes faites : la ligne mère se grise').toBe(true);
    expect(l[5].faite, 'une explication ne se grise pas').toBe(false);
    expect(l[6].faite, 'la consigne non plus').toBe(false);
    expect(await fleches(page), 'il ne reste que la flèche de ce qu\'il faut toucher').toBe(1);
    expect(await boite(page)).toEqual(avant);

    // Défait, le geste revient.
    await remplir(page, 'banc-a', '');
    expect((await lignes(page))[0].faite).toBe(false);
    expect(await fleches(page)).toBe(2);
});

test('(b) le compteur : la liste des étapes, une étape faite revue en visite, jamais au-delà', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrir(page);
    await lancerLeFictif(page);
    const rang = page.locator('#parcours-bulle .parcours-bulle-rang');
    await expect(rang).toHaveText('1 sur 3');
    const cible = await rang.boundingBox();
    expect(cible.height, 'la cible du compteur fait 44 px sous le doigt').toBeGreaterThanOrEqual(44);
    expect(cible.width).toBeGreaterThanOrEqual(44);
    expect(await rang.evaluate((b) => b.tagName)).toBe('BUTTON');

    // À la première étape : seule elle se touche.
    await rang.click();
    const etapes = page.locator('#parcours-bulle .parcours-bulle-etape');
    await expect(etapes).toHaveText(['1. Première étape', '2. Deuxième étape', '3. Dernière étape']);
    expect(await etapes.evaluateAll((bs) => bs.map((b) => b.disabled))).toEqual([false, true, true]);
    for (const b of await etapes.all()) expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await expect(page.locator('#parcours-bulle .parcours-bulle-lignes')).toBeHidden();
    // Échap referme la liste, pas le parcours.
    await page.keyboard.press('Escape');
    await expect(page.locator('#parcours-bulle .parcours-bulle-etapes')).toBeHidden();
    await expect(titre(page)).toHaveText('Première étape');

    // Le geste fait, le parcours avance ; la première étape est faite et se revoit.
    await page.click('#banc-creer');
    await expect(titre(page)).toHaveText('Deuxième étape');
    expect(await page.evaluate(() => window.__banc.surEtape)).toEqual([0, 1]);
    await page.locator('#parcours-bulle .parcours-bulle-rang').click();
    expect(await etapes.evaluateAll((bs) => bs.map((b) => [b.disabled, b.classList.contains('est-faite'), b.getAttribute('aria-current')]))).toEqual([[false, true, null], [false, false, 'step'], [true, false, null]]);
    await etapes.nth(0).click();
    await expect(titre(page)).toHaveText('Première étape');

    // EN VISITE : l'état est déjà atteint, rien n'avance seul ; « Continuer » remplace l'attente ; rien n'est annoncé au parcours.
    await passagesDeLaSonde(page, 4);   // quatre passages de la sonde : l'étape ne doit PAS avancer
    await expect(titre(page)).toHaveText('Première étape');
    expect(await page.evaluate(() => window.ParcoursMoteur.enVisite())).toBe(true);
    await expect(page.locator('#parcours-bulle .parcours-bulle-boutons .btn')).toHaveText(['Continuer']);
    expect((await lignes(page)).filter((x) => x.faite).length, 'ce qui se fait est montré fait').toBe(5);
    // `surEtape` est appelé à chaque étape, revue ou non : les définitions y rangent ce que l'étape quittée a posé.
    expect(await page.evaluate(() => window.__banc.surEtape)).toEqual([0, 1, 0]);
    expect(await page.evaluate(() => window.ParcoursMoteur.plusLoin())).toBe(1);
    await expect(page.locator('#parcours-bulle .parcours-bulle-rang')).toHaveText('1 sur 3');

    await page.locator('#parcours-bulle .parcours-bulle-boutons .btn').click();
    await expect(titre(page)).toHaveText('Deuxième étape');
});

test('(c) et (d) « Tu es dans… », le halo au menu, la page en haut, la bulle dans son coin', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrir(page);
    await lancerLeFictif(page);
    // La page est défilée avant le changement d'étape (une cale la rend assez haute pour l'être, quelle que soit la démo).
    await page.evaluate(() => {
        const cale = document.createElement('div');
        cale.style.height = '3000px';
        document.getElementById('banc-fictif').after(cale);
        window.scrollTo(0, 400);
    });
    expect(await page.evaluate(() => Math.round(window.scrollY)), 'la page est bien défilée avant l\'étape').toBe(400);
    await page.evaluate(() => document.getElementById('banc-creer').click());
    await expect(titre(page)).toHaveText('Deuxième étape');

    // Les noms sont ceux que le menu montre.
    const menu = await page.evaluate(() => ({
        section: document.querySelector('.navigation-principale button.actif .nav-label').textContent.trim(),
        onglet: document.querySelector('.sous-navigation button.actif').textContent.trim()
    }));
    expect(menu).toEqual({ section: 'Suivi', onglet: 'Groupe' });
    await expect(page.locator('#parcours-bulle .parcours-bulle-lieu')).toHaveText('Tu es dans « Suivi », à l\'onglet « Groupe ».');
    expect(await page.evaluate(() => document.querySelector('#parcours-bulle .parcours-bulle-lignes').firstElementChild.className), 'c\'est la première ligne').toBe('parcours-bulle-lieu');

    // Le halo sur les deux entrées du menu, et sur elles seules.
    const halo = await page.evaluate(() => [...document.querySelectorAll('.parcours-section-actuelle')].map((e) => e.textContent.trim()));
    expect(halo.sort()).toEqual(['Groupe', 'Suivi']);
    // La page s'ouvre en haut, navigation visible.
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(0);
    await expect(page.locator('.navigation-principale button.actif').first()).toBeInViewport();
    await expect(page.locator('.sous-navigation button.actif')).toBeInViewport();

    // (d) Rien de désigné : la bulle est dans le coin en bas à droite, pas au centre de la page.
    // (L'écran utile s'arrête au-dessus du bandeau de la démonstration : c'est lui que le moteur mesure.)
    const b = await boite(page);
    const cadre = await page.evaluate(() => window.ParcoursMoteur.placement().cadre);
    expect(Math.abs(b.x + b.l - cadre.droite), 'collée au bord droit de l\'écran utile').toBeLessThanOrEqual(1);
    expect(Math.abs(b.y + b.h - cadre.bas), 'collée au bas de l\'écran utile').toBeLessThanOrEqual(1);
    expect(b.x, 'pas au centre').toBeGreaterThan(1180 / 2);

    // À l'étape suivante, le halo du lieu est retiré.
    await page.locator('#parcours-bulle .parcours-bulle-boutons .btn').click();
    await expect(titre(page)).toHaveText('Dernière étape');
    expect(await page.locator('.parcours-section-actuelle').count()).toBe(0);
    await expect(page.locator('#parcours-bulle .parcours-bulle-lieu')).toHaveCount(0);
});

// 20 nov. 2026 (plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, A3) : le bouton de la suite ne lance plus rien.
// « Voir le parcours N » termine le parcours, ferme la bulle et ouvre le panneau « Assistance » devant la carte du
// parcours N ; la bulle le nomme d'abord (« Suite suggérée : le parcours N, « Nom ». »).
test('(e) la fin : « Voir le parcours N » et « Terminer » de même poids, et la phrase du compteur', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrir(page);
    // Le fictif prend l'identité du premier parcours du panneau : il a donc un suivant.
    const ids = await page.evaluate(() => window.Assistance.parcours().map((p) => p.id));
    expect(ids.length).toBeGreaterThan(1);
    await page.evaluate(() => { window.__lances = []; window.Assistance.lancerParcours = (id) => { window.__lances.push(id); return true; }; });
    await lancerLeFictif(page, { id: ids[0], lancer: { depuis: 2 } });
    await expect(titre(page)).toHaveText('Dernière étape');
    await expect(page.locator('#parcours-bulle .parcours-bulle-note')).toHaveText('Pour revoir une étape, touche « 3 sur 3 ».');
    const boutons = page.locator('#parcours-bulle .parcours-bulle-boutons .btn');
    // Le rang et le nom du parcours qui suit, lus dans le panneau : le deuxième de la liste.
    const suivant = await page.evaluate(() => { const p = window.Assistance.parcours()[1]; return { id: p.id, titre: p.titre }; });
    expect(suivant.id).toBe(ids[1]);
    await expect(boutons).toHaveText(['Voir le parcours 2', 'Terminer']);
    await expect(page.locator('#parcours-bulle .parcours-bulle-suite-suggeree')).toHaveText('Suite suggérée : le parcours 2, «\u00a0' + suivant.titre + '\u00a0».');
    expect(await boutons.evaluateAll((bs) => bs.map((b) => b.className)), 'aucun bouton mis en avant').toEqual(['btn btn-secondaire', 'btn btn-secondaire']);
    // La consigne suit les boutons : le parcours écrit « Touche « Terminer ». », la bulle dit les deux suites.
    await expect(page.locator('#parcours-bulle .parcours-bulle-geste')).toHaveText('Touche «\u00a0Voir le parcours 2\u00a0», ou «\u00a0Terminer\u00a0».');
    // La phrase est avant la consigne, qui reste la dernière ligne de texte.
    expect(await page.evaluate(() => {
        const n = document.querySelector('#parcours-bulle .parcours-bulle-note'), g = document.querySelector('#parcours-bulle .parcours-bulle-geste');
        return !!(n.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING);
    })).toBe(true);

    await boutons.nth(0).click();
    expect(await page.evaluate(() => window.__banc.termine), '« Voir le parcours 2 » termine d\'abord celui-ci').toBe(1);
    // RIEN N'EST LANCÉ : ni bulle, ni moteur, ni appel à `lancerParcours` (remplacé plus haut par un témoin).
    await expect(page.locator('#parcours-bulle')).toHaveCount(0);
    expect(await page.evaluate(() => window.ParcoursMoteur.actif()), 'aucun parcours en cours').toBe(false);
    expect(await page.evaluate(() => window.__lances), 'aucun parcours lancé d\'office').toEqual([]);
    // Le panneau « Assistance » est ouvert devant la carte du parcours 2 : elle seule est marquée, et le focus est à
    // son premier bouton.
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    await expect(page.locator('#panneau-assistance .assistance-parcours-item--suggere')).toHaveCount(1);
    await expect(page.locator('#panneau-assistance [data-parcours="' + ids[1] + '"]')).toHaveClass(/assistance-parcours-item--suggere/);
    await expect(page.locator('#panneau-assistance [data-parcours="' + ids[1] + '"]')).toBeInViewport();
    expect(await page.evaluate((id) => {
        const carte = document.querySelector('#panneau-assistance [data-parcours="' + id + '"]');
        return document.activeElement === carte.querySelector('.assistance-modele-bouton, .assistance-parcours-bouton');
    }, ids[1]), 'le focus au premier bouton de la carte suggérée').toBe(true);
});

test('(e) le dernier parcours du panneau n\'offre que « Terminer » ; une carte sans rang n\'a ni compteur ni phrase', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrir(page);
    const ids = await page.evaluate(() => window.Assistance.parcours().map((p) => p.id));
    await lancerLeFictif(page, { id: ids[ids.length - 1], lancer: { depuis: 2 } });
    await expect(page.locator('#parcours-bulle .parcours-bulle-boutons .btn')).toHaveText(['Terminer']);
    await expect(page.locator('#parcours-bulle .parcours-bulle-geste')).toHaveText('Touche «\u00a0Terminer\u00a0».');
    await page.evaluate(() => {
        window.ParcoursMoteur.fermer();
        const def = Object.assign({}, window.__banc.def, { sansRang: true });
        return window.ParcoursMoteur.lancer(def, { depuis: 2 });
    });
    await expect(titre(page)).toHaveText('Dernière étape');
    await expect(page.locator('#parcours-bulle .parcours-bulle-rang')).toHaveCount(0);
    await expect(page.locator('#parcours-bulle .parcours-bulle-etapes')).toHaveCount(0);
    await expect(page.locator('#parcours-bulle .parcours-bulle-note')).toHaveCount(0);
});

// 14 nov. 2026 (retouche demandée par Cowork) : dans CHAQUE parcours du panneau, la consigne de la dernière bulle
// correspond à ses boutons. Le banc prend la vraie dernière étape de chaque parcours (sa consigne, ses boutons),
// lue en interceptant son lancement, et la joue dans le moteur sous l'identité du parcours : la place dans le
// panneau décide du second bouton. Les gestes propres à chaque parcours ont leurs bancs à eux.
// Break-test (14 nov.) : `consigneDeLaFin` qui rend le texte tel quel → ROUGE ici (sept parcours disent « Terminer »
// seul sous deux boutons).
test('(e) dans chaque parcours du panneau, la consigne de la dernière bulle correspond à ses boutons', async ({ page }) => {
    test.setTimeout(180000);
    await ouvrir(page);
    const fins = await page.evaluate(async () => {
        const vrai = window.ParcoursMoteur.lancer;
        // La dernière étape de chacun. Cinq parcours l'exposent pour les bancs ; les quatre autres la livrent au moteur à
        // leur lancement, intercepté ici (rien ne part). Aucun n'est lancé pour de vrai : leurs conditions d'entrée
        // ne sont pas ce qu'on juge.
        const EXPOSES = {
            evaluer: () => window.ParcoursEvaluer.etapes(),
            monter: () => window.ParcoursCours.etapes(),
            'lire-ta-classe': () => window.ParcoursLireTaClasse.etapes,
            // Ses étapes ne sont construites qu'au lancement, selon la famille : le banc prend le texte de sa dernière
            // bulle (TEXTES) et son bouton « Terminer » (DEFINITIONS['plus-loin'], jugé par son propre banc).
            'notation-alternative': () => [{ titre: window.ParcoursNotationAlternative.TEXTES['plus-loin'].titre,
                geste: window.ParcoursNotationAlternative.TEXTES['plus-loin'].geste, boutons: [{ libelle: 'Terminer', primaire: true }] }],
            recevoir: () => Object.values(window.ParcoursRecevoir.voies())[0]
        };
        const defs = [];
        for (const p of window.Assistance.parcours()) {
            let def = null;
            if (EXPOSES[p.id]) {
                def = { etapes: EXPOSES[p.id]() };
            } else {
                window.ParcoursMoteur.lancer = (d) => { def = d; return Promise.resolve(); };
                try { await Promise.race([Promise.resolve(p.lancer()), new Promise((ok) => setTimeout(ok, 4000))]); } catch (e) { /* le banc ne juge pas le lancement */ }
                window.ParcoursMoteur.lancer = vrai;
            }
            defs.push({ id: p.id, def: def && def.etapes && def.etapes.length ? def : null });
        }
        const lus = [];
        for (const { id, def } of defs) {
            if (!def) { lus.push({ id, sansDef: true }); continue; }
            const fin = def.etapes[def.etapes.length - 1];
            let geste = null, lignes = null;
            try { geste = fin.geste || null; } catch (e) { geste = null; }
            try { lignes = fin.lignes ? fin.lignes() : null; } catch (e) { lignes = null; }
            const propre = geste || ((lignes || []).filter((l) => l.geste).pop() || {}).texte || null;
            window.ParcoursMoteur.fermer();
            await vrai({ id, etapes: [{
                titre: fin.titre, texte: lignes ? undefined : 'Banc.', geste: geste || undefined,
                lignes: lignes ? () => lignes : undefined, sansSortie: true, centre: true,
                boutons: (fin.boutons || []).map((b) => ({ libelle: b.libelle, primaire: b.primaire, action: () => window.ParcoursMoteur.fermer() }))
            }] }, {});
            const b = document.getElementById('parcours-bulle');
            const dite = b.querySelector('.parcours-bulle-geste') || [...b.querySelectorAll('.parcours-bulle-ligne--geste')].pop();
            lus.push({ id, propre, aUnSuivant: !!window.Assistance.suivantDe(id),
                boutons: [...b.querySelectorAll('.parcours-bulle-boutons .btn')].map((x) => x.textContent),
                dite: dite ? dite.textContent.replace(/\u00a0/g, ' ') : null });
            window.ParcoursMoteur.fermer();
        }
        return lus;
    });
    expect(fins.filter((f) => f.sansDef).map((f) => f.id), 'chaque parcours a livré sa définition').toEqual([]);
    const simple = (t) => /^Touche « Terminer »\.?$/.test(t || '');
    const simples = fins.filter((f) => simple(f.propre));
    expect(fins).toHaveLength(9);
    // Les sept parcours dont la fin dit « Touche « Terminer » » ; les deux autres ont leur consigne à eux.
    expect(simples.map((f) => f.id).sort()).toEqual(['classe', 'commentaires', 'monter', 'donnees', 'lire-ta-classe', 'notation-alternative', 'recevoir'].sort());
    expect(simples.some((f) => f.aUnSuivant)).toBe(true);
    for (const f of simples) {
        const point = f.propre.endsWith('.') ? '.' : '';
        if (f.aUnSuivant) {
            // 20 nov. 2026 (consigne du 20 nov., A3) : N est le rang du parcours qui suit dans le panneau.
            const n = fins.indexOf(f) + 2;
            expect(f.boutons, f.id).toEqual(['Voir le parcours ' + n, 'Terminer']);
            expect(f.dite, f.id).toBe('Touche « Voir le parcours ' + n + ' », ou « Terminer »' + point);
        } else {
            expect(f.boutons, f.id).toEqual(['Terminer']);
            expect(f.dite, f.id).toBe('Touche « Terminer »' + point);
        }
    }
    // Hors de la règle, nommés : « Découvrir » offre ses deux boutons à lui ; « Évaluer » finit sur un geste composé
    // (« … verrouille, puis touche « Terminer ». ») que le moteur ne réécrit pas (signalé à Cowork le 14 nov.).
    const autres = fins.filter((f) => !simple(f.propre));
    expect(autres.map((f) => f.id).sort()).toEqual(['decouvrir', 'evaluer']);
    for (const f of autres) expect(f.dite, f.id).toBe(f.propre);
});
