// =======================================================================
// LES PARCOURS « DÉCOUVRIR » ET « METTRE TA CLASSE EN PLACE » (JE REGARDE) — 16 NOVEMBRE 2026
// =======================================================================
// Consigne : `plans de travail/CONSIGNE-2026-11-16-parcours-je-regarde.md` (relais de Cowork, textes réécrits avec
// Grégoire le 16 nov. 2026). Les mots sont jugés par tests/unit/sentinelle-parcours-je-regarde-2026-11-16.test.js ;
// ce banc juge ce que l'écran fait, à 820 × 1180 (l'iPad en portrait), sous WebKit :
//   · le panneau : les quatre lignes, « Je regarde » et « Nous faisons » côte à côte, le nom du temps et l'état dessous ;
//   · les règles du moteur (demandes de Grégoire du 15 nov.) :
//       a. la première bulle porte l'objectif du parcours, sous le titre, avant tout ; les autres ne le portent pas ;
//       b. la page ouvre la bonne section, et elle seule, y défile par une transition, et la bulle ne paraît qu'une
//          fois la page immobile, sans couvrir le nom de la section ;
//       c. le nom de la section porte le halo des entrées du menu, et la bulle le dit tel que la page l'écrit ;
//       d. le triangle du compteur dit si la liste des étapes est ouverte ;
//       e. chaque bulle, sauf la première, s'ouvre sur ce qui confirme le geste précédent ;
//       f. une seule page par bulle : la hauteur de chacune est RELEVÉE (le rapport la cite), rien n'est coupé.
// LE RELEVÉ : avec CAPTURES_PARCOURS=<dossier>, les captures de chaque bulle et `releve-bulles.json` (largeur,
// hauteur, hauteur disponible, ce qui défile) y sont déposés.
// REPRIS LE 16 NOV. APRÈS L'ESSAI DE GRÉGOIRE SUR L'IPAD (`plans de travail/CONSIGNE-2026-11-16-essai-ipad.md`) :
//   A. « Découvrir » choisit lui-même le premier groupe de la démo, à l'ouverture et à la reprise (jugé avec le
//      deuxième groupe présent et choisi dans l'en-tête, à la fin du troisième essai) ;
//   B. le triangle des sections ; les deux lignes de la bulle 2 et son « A 84 % » ; la fin (l'objectif atteint dans la
//      forme de l'objectif, la phrase de la suite) ; la bulle 8 sans « Tout repose ici », les sections refermées
//      derrière ; UNE flèche vers le nom de la section avant « Remplir » ; le groupe nommé à la bulle 6 ; la poignée ;
//   8. LA BULLE NE COUVRE PAS CE DONT ELLE PARLE, dans les deux orientations et à la hauteur que Safari laisse à la
//      page sur l'iPad couché (`ECRANS_DE_LA_BANDE` : 1180 × 740, sous les barres du navigateur ; le défaut ne se
//      voyait pas à 1180 × 820, où la bulle tient sous la bande).
// Break-tests de l'essai (16 nov. 2026), chacun ROUGE puis rétabli :
//   A. `await choisirLeGroupeDeLaDemo();` retiré de `lancer` (js/parcours-decouvrir.js) → la bulle 1 s'ouvre sur le
//      deuxième groupe ;
//   8. `aussiEviter` retiré de la bulle 8 de « Je regarde » (js/parcours-classe.js) → sept points couverts à 1180 × 740 ;
//      `aussiEviter: bandeEtSesPoints` retiré de la bulle 1 de « Découvrir » → le nom de la bande couvert en paysage.
// Break-tests (16 nov. 2026), un par règle, chacun ROUGE puis rétabli :
//   a. `if (etat.i === 0)` retiré de l'objectif (js/parcours-moteur.js) → la bulle 2 porte l'objectif ;
//   b. `attendreLaPage(!!etape.section)` → `attendreLaPage(false)` → la bulle se voit pendant que la page défile ;
//      et la fermeture des autres blocs retirée de `ouvrirBlocModele` → « Cours et services » reste ouvert à la bulle 2 ;
//   c. la ligne `entrees = entrees.concat([s.tete])` retirée de `marquerLieu` → le nom de la section n'a pas le halo ;
//   d. la règle `[aria-expanded="true"]::after` retirée de css/parcours.css → le triangle ne tourne pas ;
//   e. `phrase('parcours-bulle-confirme', …)` retirée → aucune ligne de confirmation.

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {
    CAPTURES, QUATRE_TEMPS, DEUX_TEMPS, sansInsecable, capture, ouvrirEspaceVide, ouvrirPanneau, boutonModele, boutonPratique,
    bulle, carte, enDemo, attendreEtape, contourSur, materiel, optionDont, lireBulle, attendreRemplir, remplirPuisVoir
} from './harness/deux-temps-de-banc.js';

test.setTimeout(240000);

// L'iPad en portrait ; ECRAN_PARCOURS=1180x820 rejoue le relevé en paysage (les hauteurs seules y sont lues).
const [LARGEUR, HAUTEUR] = (process.env.ECRAN_PARCOURS || '820x1180').split('x').map(Number);
const OBJECTIF_DECOUVRIR = 'À la fin de ce parcours, tu seras en mesure de repérer qui a besoin de toi sans attendre une main levée et de nommer précisément son défi.';
const OBJECTIF_CLASSE = "À la fin de ce parcours, tu seras en mesure d'expliquer ce que l'application te demande pour mettre une classe en place et ce qu'elle en tire.";

const releves = [];

/** Ce que la bulle montre et ce qu'elle mesure : ses phrases d'ouverture, ses lignes, sa place, ce qui défile. */
const lire = (page) => page.evaluate(() => {
    const b = document.getElementById('parcours-bulle');
    const plat = (e) => (e ? e.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : null);
    const r = b.getBoundingClientRect();
    const lignes = b.querySelector('.parcours-bulle-lignes');
    const entete = document.querySelector('header.entete');
    const bandeau = document.getElementById('bandeau-demo');
    const haut = entete ? Math.max(0, entete.getBoundingClientRect().bottom) : 0;
    const bas = bandeau && bandeau.getBoundingClientRect().height ? bandeau.getBoundingClientRect().top : window.innerHeight;
    return {
        titre: plat(b.querySelector('.parcours-bulle-titre')),
        rang: plat(b.querySelector('.parcours-bulle-rang')),
        objectif: plat(b.querySelector('.parcours-bulle-objectif:not(.parcours-bulle-atteint)')),
        atteint: plat(b.querySelector('.parcours-bulle-atteint')),
        suite: plat(b.querySelector('.parcours-bulle-suite')),
        aide: plat(b.querySelector('.parcours-bulle-aide')),
        petits: [...b.querySelectorAll('.parcours-bulle-aide, .parcours-bulle-revue')].map((e) => parseFloat(getComputedStyle(e).fontSize)),
        fleches: [...document.querySelectorAll('.parcours-fleche')].map((g) => g.getAttribute('data-cible')),
        confirme: plat(b.querySelector('.parcours-bulle-confirme:not([hidden])')),
        // 18 nov. 2026 (Grégoire, 14 h 11) : la confirmation au-dessus du titre et du compteur.
        confirmeAuDessus: (() => { const c = b.querySelector('.parcours-bulle-confirme:not([hidden])'), t = b.querySelector('.parcours-bulle-tete');
            return !!c && !!t && c.getBoundingClientRect().bottom <= t.getBoundingClientRect().top + 1 && !!(c.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING); })(),
        // Les marques des lignes : rien devant une explication, « → » devant un geste à faire, « ✓ » devant ce qui est fait.
        marques: [...b.querySelectorAll('.parcours-bulle-lignes > ul > li')].map((li) => {
            const m = getComputedStyle(li, '::before').content;
            const sorte = li.classList.contains('est-faite') ? 'fait' : li.classList.contains('parcours-bulle-ligne--geste') ? 'geste' : 'explication';
            return sorte + ':' + (m === 'none' || m === 'normal' ? '' : m.replace(/["']/g, '').replace(/ \/ .*$/, ''));
        }),
        lieu: plat(b.querySelector('.parcours-bulle-lieu')),
        ordre: [...lignes.children].map((e) => e.className || e.tagName.toLowerCase()),
        liste: [...b.querySelectorAll('.parcours-bulle-lignes > ul > li > .parcours-bulle-ligne-texte')].map(plat),
        pages: !b.querySelector('.parcours-bulle-nav').hidden,
        largeur: Math.round(r.width), hauteur: Math.round(r.height), haut: Math.round(r.top), bas: Math.round(r.bottom),
        disponible: Math.round(bas - haut),
        defile: lignes.scrollHeight - lignes.clientHeight > 1,
        hauteurEntiere: Math.round(r.height + Math.max(0, lignes.scrollHeight - lignes.clientHeight)),
        attente: b.classList.contains('est-en-attente')
    };
});

/** Règle f : une seule page, et la hauteur relevée pour le rapport. */
async function relever(page, parcours, n, etat) {
    const v = await lire(page);
    expect(v.pages, `${parcours} ${n} (${etat}) : une seule page, ni « ← 1/2 → »`).toBe(false);
    expect(v.attente, `${parcours} ${n} (${etat}) : la bulle est montrée`).toBe(false);
    releves.push({ parcours, bulle: n, etat, titre: v.titre, largeurEcran: LARGEUR, hauteurEcran: HAUTEUR, largeurBulle: v.largeur,
        hauteur: v.hauteurEntiere, disponible: v.disponible, tient: !v.defile && v.hauteurEntiere <= v.disponible });
    return v;
}

/** Règle d : le triangle du compteur, fermé puis ouvert, et le texte du bouton qui ne change pas. */
async function triangle(page) {
    const lu = () => page.evaluate(() => {
        const r = document.getElementById('parcours-bulle-rang');
        const s = getComputedStyle(r, '::after');
        const section = getComputedStyle(document.querySelector('.carte.accordeon .accordeon-chevron'));
        return { signe: s.content, tourne: s.transform, taille: parseFloat(s.fontSize), tailleDesSections: parseFloat(section.fontSize),
            cible: Math.round(r.getBoundingClientRect().height), ouvert: r.getAttribute('aria-expanded'), texte: r.textContent };
    });
    // La rotation est une transition : chaque état est lu une fois le triangle arrêté.
    const pose = async (ouvert) => { await expect(page.locator('#parcours-bulle-rang')).toHaveAttribute('aria-expanded', ouvert);
        await expect.poll(async () => { const a = (await lu()).tourne; await page.waitForFunction(() => new Promise((f) => requestAnimationFrame(() => requestAnimationFrame(() => f(true))))); return a === (await lu()).tourne; }, { timeout: 5000 }).toBe(true); return lu(); };
    const ferme = await pose('false');
    await page.click('#parcours-bulle-rang');
    const ouvert = await pose('true');
    // Le triangle lui-même réagit au doigt : touché à son centre, il referme la liste.
    const boite = await page.locator('#parcours-bulle-rang').boundingBox();
    await page.mouse.click(boite.x + boite.width - 8, boite.y + boite.height / 2);
    const referme = await pose('false');
    return { ferme, ouvert, referme };
}

/**
 * RÈGLE 8 : la bulle et la bande d'assiduité. Le nom de la bande et chacun de ses points : à l'écran, et pas sous la
 * bulle ; les flèches qui finissent sur un point.
 */
const lireBande = (page) => page.evaluate(() => {
    const b = document.getElementById('parcours-bulle').getBoundingClientRect();
    const h = document.querySelector('#section-suivi h4[data-tooltip="tdb-assiduite"]');
    const croise = (r) => !(r.right <= b.left || b.right <= r.left || r.bottom <= b.top || b.bottom <= r.top);
    const points = [...h.parentElement.querySelectorAll('.barre-indicateur .barre-etudiant[data-da]')].map((e) => e.getBoundingClientRect());
    const cle = (r) => [r.left, r.top, r.right, r.bottom].map(Math.round).join(',');
    const cibles = [...document.querySelectorAll('.parcours-fleche')].map((g) => g.getAttribute('data-cible'));
    const barre = cle(h.parentElement.querySelector('.barre-indicateur').getBoundingClientRect());
    return { points: points.length, pointsCouverts: points.filter(croise).length, nomCouvert: croise(h.getBoundingClientRect()),
        aLEcran: points.every((r) => r.top >= 0 && r.bottom <= window.innerHeight),
        // Une flèche finit sur un point : sa cible est un point, ou deux points qui se touchent (le moteur les fond).
        flechesSurUnPoint: cibles.filter((c) => {
            const [g, ht, d, bs] = c.split(',').map(Number);
            return c !== barre && d - g < 60 && points.some((r) => { const x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2; return x >= g - 1 && x <= d + 1 && y >= ht - 1 && y <= bs + 1; });
        }).length, flecheSurLaBandeEntiere: cibles.includes(barre) };
});
// L'iPad debout, couché, et couché sous les barres de Safari (la page n'a alors que 740 px de haut environ).
const ECRANS_DE_LA_BANDE = [[820, 1180], [1180, 820], [1180, 740]];
/** La même bulle, rouverte à chaque écran (le moteur replace la page à l'ouverture d'une étape). */
async function aChaqueEcran(page, etape, titre, juger) {
    for (const [l, h] of ECRANS_DE_LA_BANDE) {
        await page.setViewportSize({ width: l, height: h });
        await page.evaluate((i) => ParcoursMoteur.allerA(i), etape);
        await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(titre);
        await expect(bulle(page)).not.toHaveClass(/est-en-attente/);
        // Deux passages de la sonde au moins : la bulle et ses flèches sont à leur place.
        const depart = await page.evaluate(() => ParcoursMoteur.placement().passages);
        await page.waitForFunction((d) => { const p = ParcoursMoteur.placement(); return !!p && p.passages >= d + 2; }, depart);
        // Les points sont redessinés avec le tableau de bord (leur place en hauteur change) ; la flèche les suit au
        // passage suivant de la sonde : on attend l'état, on ne lit pas un instant.
        await expect(async () => juger(await lireBande(page), `${l} × ${h}`)).toPass({ timeout: 5000 });
        await capture(page, `j-bande-${etape + 1}-${l}x${h}`);
    }
    await page.setViewportSize({ width: LARGEUR, height: HAUTEUR });
    await page.evaluate((i) => ParcoursMoteur.allerA(i), etape);
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(titre);
    await expect(bulle(page)).not.toHaveClass(/est-en-attente/);
}

/** La section dont parle la bulle : sa place sous l'en-tête, son halo, les autres blocs du Cadre, la bulle à côté. */
const lireSection = (page, id) => page.evaluate((idBloc) => {
    const bloc = document.getElementById(idBloc);
    const nom = bloc.querySelector('.accordeon-header h3');
    const b = document.getElementById('parcours-bulle').getBoundingClientRect();
    const n = nom.getBoundingClientRect();
    const entete = Math.max(0, document.querySelector('header.entete').getBoundingClientRect().bottom);
    const copie = nom.cloneNode(true);
    copie.querySelectorAll('.accordeon-chevron, button').forEach((x) => x.remove());
    const croise = !(b.right <= n.left || n.right <= b.left || b.bottom <= n.top || n.bottom <= b.top);
    return {
        nomLu: copie.textContent.replace(/\s+/g, ' ').trim(),
        halo: nom.classList.contains('parcours-section-actuelle'),
        sousLEntete: Math.round(n.top - entete),
        // La page ne défile pas plus loin (les dernières sections du Cadre) : le nom ne peut pas monter davantage.
        auBasDeLaPage: window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2,
        ouvert: !bloc.classList.contains('ferme'),
        autresOuverts: [...document.querySelectorAll('#calendrier-trimestre .carte.accordeon:not(.ferme)')].map((a) => a.id).filter((x) => x !== idBloc),
        bulleSurLeNom: croise,
        halos: document.querySelectorAll('#calendrier-trimestre .parcours-section-actuelle').length
    };
}, id);

/**
 * Règle b : pendant qu'une étape à section s'ouvre, on relève à chaque image le défilement de la page et la bulle.
 * La bulle montrée avec le titre de l'étape ne doit se voir qu'une fois la page immobile.
 */
async function suivreLOuverture(page, geste, titre) {
    await page.evaluate(() => {
        window.__suivi = [];
        const tour = () => {
            if (!window.__suivi) return;
            const b = document.getElementById('parcours-bulle');
            const t = b && b.querySelector('.parcours-bulle-titre');
            window.__suivi.push({ y: Math.round(window.scrollY), titre: t ? t.textContent : '', attente: !!b && b.classList.contains('est-en-attente') });
            requestAnimationFrame(tour);
        };
        requestAnimationFrame(tour);
    });
    await geste();
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(titre, { timeout: 10000 });
    await expect(bulle(page)).not.toHaveClass(/est-en-attente/, { timeout: 10000 });
    // Vingt images de plus, bulle montrée : une page qui bougerait encore après l'apparition s'y verrait.
    await page.waitForFunction((t) => window.__suivi.filter((s) => s.titre === t && !s.attente).length >= 20, titre, { timeout: 10000 });
    const suivi = await page.evaluate(() => { const s = window.__suivi; window.__suivi = null; return s; });
    const fin = suivi[suivi.length - 1].y;
    const montree = suivi.filter((s) => s.titre === titre && !s.attente);
    return {
        positions: new Set(suivi.map((s) => s.y)).size,
        cachee: suivi.some((s) => s.attente),
        montreeEnMouvement: montree.filter((s) => Math.abs(s.y - fin) > 1).length,
        fin
    };
}

test.afterAll(() => {
    if (!CAPTURES || !releves.length) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    fs.writeFileSync(path.join(CAPTURES, 'releve-bulles.json'), JSON.stringify(releves, null, 1));
});

test('le panneau : les quatre lignes du 16 nov., « Je regarde » et « Nous faisons » côte à côte, le nom du temps et l’état dessous', async ({ page }) => {
    await ouvrirEspaceVide(page, LARGEUR, HAUTEUR);
    await ouvrirPanneau(page);
    const p = page.locator('#panneau-assistance');
    expect((await p.locator('.assistance-intro-titre, .assistance-intro-temps li').allTextContents()).map(sansInsecable)).toEqual(QUATRE_TEMPS);

    // Les parcours sont ouverts sur cette branche : la liste est là, « À venir » n'y est pas.
    await expect(p.locator('#assistance-a-venir')).toHaveCount(0);
    await expect(p.locator('#assistance-parcours-liste > li')).not.toHaveCount(0);

    for (const id of ['classe', 'evaluer']) {
        await expect(boutonModele(page, id)).toHaveText(DEUX_TEMPS.modele[0]);
        await expect(boutonPratique(page, id)).toHaveText(DEUX_TEMPS.pratique[0]);
        await expect(carte(page, id).locator('.assistance-temps-mots')).toHaveText([DEUX_TEMPS.modele[1], DEUX_TEMPS.pratique[1]]);
        await expect(carte(page, id).locator('.assistance-modele-etat, .assistance-parcours-etat')).toHaveText(['À faire', 'À faire']);
        const forme = await carte(page, id).evaluate((c) => {
            const r = (e) => e.getBoundingClientRect();
            const [a, b] = [...c.querySelectorAll('.assistance-temps button')];
            return { memeLigne: Math.abs(r(a).top - r(b).top) < 1, gaucheDroite: r(a).right <= r(b).left, cible: Math.min(r(a).height, r(b).height),
                dansLePanneau: r(b).right <= r(document.getElementById('panneau-assistance')).right };
        });
        expect(forme, id).toEqual({ memeLigne: true, gaucheDroite: true, cible: expect.any(Number), dansLePanneau: true });
        expect(forme.cible, id + ' : la cible tactile').toBeGreaterThanOrEqual(44);
    }
    // L'état suit : « Étape 3 sur 8 », puis « Fait » ; le bouton garde son nom.
    await page.evaluate(() => { Assistance.definirEtatModele('classe', 'en-cours', 2); Assistance.definirEtat('classe', 'fait', 0); Assistance.fermerPanneau(); });
    await ouvrirPanneau(page);
    await expect(carte(page, 'classe').locator('.assistance-modele-etat')).toHaveText('Étape 3 sur 8');
    await expect(carte(page, 'classe').locator('.assistance-parcours-etat')).toHaveText('Fait');
    await expect(boutonModele(page, 'classe')).toHaveText('Je regarde');
    await expect(boutonPratique(page, 'classe')).toHaveText('Nous faisons');
    // Un parcours sans ses deux temps garde son bouton d'avant.
    await expect(carte(page, 'decouvrir').locator('.assistance-parcours-bouton')).toHaveText('Commencer');
    await capture(page, 'j-panneau');
});

test('« Découvrir » : l’objectif à la première bulle, la confirmation ensuite, les noms du menu lus à l’écran, les trois suites', async ({ page }) => {
    await ouvrirEspaceVide(page, LARGEUR, HAUTEUR);
    await ouvrirPanneau(page);
    await carte(page, 'decouvrir').locator('.assistance-parcours-bouton').click();
    const P = 'Découvrir';
    // « Tu es dans « X », à l'onglet « Y ». » : les noms que le menu montre.
    const lieuDuMenu = () => page.evaluate(() => {
        const nom = (b) => ((b.querySelector('.nav-label') || b).textContent || '').replace(/\s+/g, ' ').trim();
        const visible = (e) => e.getBoundingClientRect().width > 0;
        const s = [...document.querySelectorAll('.navigation-principale button.actif')].filter(visible)[0];
        const o = [...document.querySelectorAll('.sous-navigation button.actif')].filter(visible)[0];
        return 'Tu es dans « ' + nom(s) + " », à l'onglet « " + nom(o) + ' ».';
    });

    // 1. L'objectif, sous le titre, avant tout (règle a) ; pas de confirmation à la première bulle (règle e).
    await attendreEtape(page, 1, 8, "Ta classe d'un coup d'œil");
    expect(await enDemo(page)).toBe(true);
    let v = await relever(page, P, 1, '');
    expect(v.objectif).toBe(OBJECTIF_DECOUVRIR);
    expect(v.ordre[0]).toBe('parcours-bulle-objectif');
    expect(v.confirme).toBeNull();
    expect(v.lieu).toBe('Tu es dans « Suivi », à l\'onglet « Groupe ». La classe est fictive : dix étudiant·es, un trimestre complet.');
    expect(v.liste[v.liste.length - 1]).toBe('Touche « Détails » pour mettre un nom sur chaque point');
    // La poignée, dite à la première bulle, en petit, sous les lignes (essai, B.7).
    expect(v.aide).toBe('Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.');
    expect(v.ordre[v.ordre.length - 1]).toBe('parcours-bulle-aide');
    expect(v.petits.every((t) => t < 14)).toBe(true);
    // Le triangle du compteur (règle d) : celui des sections, à leur taille, couché puis pointe en bas (essai, B.1).
    const t = await triangle(page);
    expect([t.ferme.ouvert, t.ouvert.ouvert, t.referme.ouvert]).toEqual(['false', 'true', 'false']);
    expect(t.ferme.signe).toBe('"▼"');
    expect(t.ferme.tourne).not.toBe('none');
    expect(t.ouvert.tourne).toBe('none');
    expect(t.referme.tourne).toBe(t.ferme.tourne);
    expect(Math.abs(t.ferme.taille - t.ferme.tailleDesSections), `le triangle (${t.ferme.taille} px) a la taille de celui des sections (${t.ferme.tailleDesSections} px)`).toBeLessThanOrEqual(1);
    expect(t.ferme.cible).toBeGreaterThanOrEqual(44);
    expect([t.ferme.texte, t.ouvert.texte]).toEqual(['1 sur 8', '1 sur 8']);
    // RÈGLE 8 : ni le nom de la bande ni un seul point sous la bulle ; la flèche montre un point, pas la bande.
    await aChaqueEcran(page, 0, "Ta classe d'un coup d'œil", (bande, ecran) => {
        expect({ points: bande.points, pointsCouverts: bande.pointsCouverts, nomCouvert: bande.nomCouvert }, 'bulle 1, ' + ecran).toEqual({ points: 10, pointsCouverts: 0, nomCouvert: false });
        expect(bande.flechesSurUnPoint, `bulle 1, ${ecran} : une flèche finit sur un point`).toBe(1);
        expect(bande.flecheSurLaBandeEntiere, `bulle 1, ${ecran} : aucune flèche vers le milieu de la bande`).toBe(false);
    });
    await capture(page, 'j-decouvrir-1');
    await page.click('#btn-toggle-panneau-prioritaire');

    // 2. Le geste précédent, confirmé en le nommant (règle e) ; l'objectif n'est plus redit (règle a).
    await attendreEtape(page, 2, 8, "Qui s'écarte ?");
    v = await relever(page, P, 2, '');
    expect(v.objectif).toBeNull();
    expect(v.confirme).toBe("Tu viens d'ouvrir « Détails » : chaque point a maintenant un nom.");
    expect(v.confirmeAuDessus, 'la confirmation au-dessus du titre (18 nov.)').toBe(true);
    // Les marques (18 nov.) : les explications sans tiret, le geste à faire derrière une flèche.
    expect(v.marques.filter((m) => m.startsWith('explication')).every((m) => m === 'explication:'), JSON.stringify(v.marques)).toBe(true);
    expect(v.marques.filter((m) => m.startsWith('geste')).every((m) => m === 'geste:→'), JSON.stringify(v.marques)).toBe(true);
    expect(v.liste.slice(0, 2)).toEqual(["Pose le doigt sur le point à l'écart : son nom apparaît",
        "C'est Suricate Loyal. Son assiduité est de 84 % ; celle des autres, de 93 % ou plus"]);
    // Ce que dit la bulle est ce que montre l'écran : son nom, et son « A 84 % », que la consigne fait toucher.
    const loyal = page.locator('#panneau-suivi-etudiants .etudiant-suivi-item', { hasText: 'Suricate' });
    await expect(loyal.locator('.prioritaire-indice').first()).toHaveText(/^A 84\s%$/);
    await contourSur(page, '#panneau-suivi-etudiants .etudiant-suivi-item[data-da="' + await page.evaluate(() => db.getSync(cle('groupeEtudiants'), []).find((e) => e.nom === 'Loyal').da) + '"] .prioritaire-indice');
    await capture(page, 'j-decouvrir-2');
    await loyal.locator('.prioritaire-indice').first().click();

    await attendreEtape(page, 3, 8, "Ce qui le met à l'écart");
    v = await relever(page, P, 3, '');
    expect(v.confirme).toBe("Tu viens d'ouvrir le profil de Suricate Loyal.");
    // La page a changé (l'onglet du menu passe de « Groupe » à « Profils ») : la bulle le dit, après la confirmation.
    expect(v.lieu).toBe(await lieuDuMenu());
    expect(v.lieu).toBe("Tu es dans « Suivi », à l'onglet « Profils ».");
    expect(v.confirmeAuDessus).toBe(true);
    expect(v.ordre[0]).toBe('parcours-bulle-lieu');
    await capture(page, 'j-decouvrir-3');
    await page.click('#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="accompagnement"]');

    await attendreEtape(page, 4, 8, 'De quoi il a besoin');
    v = await relever(page, P, 4, '');
    expect(v.confirme).toBe("Tu viens d'ouvrir « Accompagnement ».");
    expect(v.lieu, 'le même onglet du menu qu’à la bulle 3 : le lieu n’est pas redit').toBeNull();
    await capture(page, 'j-decouvrir-4');
    await bulle(page).getByRole('button', { name: 'Continuer', exact: true }).click();

    await attendreEtape(page, 5, 8, "D'où viennent ces signaux");
    v = await relever(page, P, 5, '');
    expect(v.liste[0]).toBe("Tu viens de repérer qui a besoin de toi et de nommer son défi, sans qu'il ait levé la main");
    await capture(page, 'j-decouvrir-5');
    await page.click('.navigation-boutons button[data-onglet="evaluations"]');

    // 6 à 8. « Tu es dans « X », à l'onglet « Y ». » : les noms sont ceux que le menu montre.
    await attendreEtape(page, 6, 8, 'Évaluer');
    v = await relever(page, P, 6, '');
    expect(v.lieu).toBe(await lieuDuMenu());
    expect(v.lieu).toBe("Tu es dans « Évaluation », à l'onglet « Préparer ».");
    await capture(page, 'j-decouvrir-6');
    await page.click('.navigation-boutons button[data-onglet="conception"]');

    await attendreEtape(page, 7, 8, 'Concevoir');
    v = await relever(page, P, 7, '');
    expect(v.lieu).toBe(await lieuDuMenu());
    await capture(page, 'j-decouvrir-7');
    await page.click('.navigation-boutons button[data-onglet="calendrier"]');

    // 8. L'objectif atteint, les trois suites de même poids.
    await attendreEtape(page, 8, 8, 'Poser ton cadre');
    v = await relever(page, P, 8, '');
    expect(v.lieu).toBe(await lieuDuMenu());
    // La fin (essai, B.3) : l'objectif atteint dans la forme de l'objectif, puis la phrase de la suite, la dernière
    // avant les boutons ; « Pour revoir une étape », en petit ; plus rien de cela dans la liste.
    expect(v.atteint).toBe('Objectif atteint : tu es en mesure de repérer qui a besoin de toi sans attendre une main levée et de nommer précisément son défi.');
    expect(v.suite).toBe("Chaque parcours a son objectif. C'est toi qui choisis la suite.");
    expect(v.ordre.slice(-3)).toEqual(['parcours-bulle-note parcours-bulle-revue', 'parcours-bulle-objectif parcours-bulle-atteint', 'parcours-bulle-suite']);
    expect(v.liste.some((l) => /Objectif atteint|Chaque parcours|Tout repose ici/.test(l))).toBe(false);
    expect(v.aide, 'la poignée n’est dite qu’à la première bulle').toBeNull();
    expect(await page.evaluate(() => { const f = (s) => { const c = getComputedStyle(document.querySelector('#parcours-bulle ' + s)); return [c.fontWeight, c.borderTopWidth, c.borderBottomWidth].join(' '); };
        return f('.parcours-bulle-atteint'); })).toBe('600 1px 1px');
    // Elle tient sans défiler, l'iPad couché compris (essai, B.4) ; derrière elle, les sections du Cadre sont refermées.
    // (Plus haute que l'écran utile à sa largeur ordinaire, elle s'élargit : le moteur, « AVANT LE FILET ».)
    expect(v.defile, 'bulle 8 : rien n’y défile').toBe(false);
    expect(v.hauteurEntiere, `bulle 8 : elle tient (${v.hauteurEntiere} px pour ${v.disponible}, large de ${v.largeur})`).toBeLessThanOrEqual(v.disponible);
    expect(v.bas, 'bulle 8 : ses boutons sont au-dessus du bandeau de la démo').toBeLessThanOrEqual(await page.evaluate(() => document.getElementById('bandeau-demo').getBoundingClientRect().top));
    expect(await page.evaluate(() => [...document.querySelectorAll('#calendrier-trimestre .carte.accordeon:not(.ferme)')].map((a) => a.id))).toEqual([]);
    const fin = await lireBulle(page);
    expect(fin.boutons).toEqual(['Explorer la démo par moi-même', 'Voir le parcours suivant', 'Commencer avec ma classe']);
    expect(fin.principal, 'aucun bouton mis en avant').toEqual([]);
    await capture(page, 'j-decouvrir-8');

    // « Voir le parcours suivant » : le « Je regarde » de « Mettre ta classe en place », dans la démo, qui reste ouverte.
    await bulle(page).getByRole('button', { name: 'Voir le parcours suivant', exact: true }).click();
    await attendreEtape(page, 1, 8, 'Un cours');
    expect(await enDemo(page)).toBe(true);
    expect(await page.evaluate(() => Assistance.etatDe('decouvrir').etat)).toBe('fait');
    expect((await lire(page)).objectif).toBe(OBJECTIF_CLASSE);
});

test('« Mettre ta classe en place », Je regarde : la bonne section, son nom encadré, la bulle après le défilement, les deux états de « Remplir »', async ({ page }) => {
    await ouvrirEspaceVide(page, LARGEUR, HAUTEUR);
    await ouvrirPanneau(page);
    const P = 'Mettre ta classe en place (Je regarde)';
    const m = await materiel(page);

    /** Une étape à section : la bonne, et elle seule ; son nom sous l'en-tête, encadré, dit par la bulle, jamais couvert. */
    const jugerSection = async (n, idBloc, phrase) => {
        const s = await lireSection(page, idBloc);
        expect(s.ouvert, `bulle ${n} : la section est ouverte`).toBe(true);
        expect(s.autresOuverts, `bulle ${n} : elle seule est ouverte`).toEqual([]);
        expect(s.halo, `bulle ${n} : le nom de la section a le halo`).toBe(true);
        expect(s.halos, `bulle ${n} : un seul nom de section encadré`).toBe(1);
        expect(s.sousLEntete, `bulle ${n} : le nom de la section est sous l'en-tête`).toBeGreaterThanOrEqual(0);
        expect(s.sousLEntete <= 40 || s.auBasDeLaPage, `bulle ${n} : le nom de la section est juste sous l'en-tête (à ${s.sousLEntete} px), ou la page est à son bas`).toBe(true);
        expect(s.sousLEntete, `bulle ${n} : le nom de la section est à l'écran`).toBeLessThan(HAUTEUR - 100);
        expect(s.bulleSurLeNom, `bulle ${n} : la bulle ne couvre pas le nom de la section`).toBe(false);
        if (phrase) expect((await lire(page)).lieu, `bulle ${n} : le nom dit est celui de la page`).toBe(phrase(s.nomLu));
        return s;
    };
    /** Le nom de la section, comme une flèche le vise. */
    const cibleDuNom = (idBloc) => page.evaluate((id) => {
        const r = document.querySelector('#' + id + ' .accordeon-header h3').getBoundingClientRect();
        return [r.left, r.top, r.right, r.bottom].map(Math.round).join(',');
    }, idBloc);
    const deuxEtats = async (n, { consigne, bouton, idBloc, nommee = !!idBloc }) => {
        await attendreRemplir(page, 'bulle ' + n);
        // Avant « Remplir » (essai, B.5) : UNE flèche, de la bulle vers le nom encadré de la section.
        if (nommee) await expect.poll(async () => (await lire(page)).fleches, { message: `bulle ${n}, avant : une seule flèche, vers le nom de la section` }).toEqual([await cibleDuNom(idBloc)]);
        await relever(page, P, n, 'avant');
        await capture(page, `j-classe-${n}-avant`);
        await remplirPuisVoir(page, { consigne, bouton, contexte: 'bulle ' + n });
        // Après : elle s'efface et laisse la place aux flèches des champs.
        if (nommee) {
            const apres = (await lire(page)).fleches;
            expect(apres.length, `bulle ${n}, après : les flèches des champs`).toBeGreaterThan(0);
            expect(apres, `bulle ${n}, après : plus de flèche vers le nom de la section`).not.toContain(await cibleDuNom(idBloc));
        }
        await relever(page, P, n, 'après');
        await capture(page, `j-classe-${n}-apres`);
        // Remplie, la bulle a grandi : le nom de la section garde son halo, et la bulle ne le couvre toujours pas.
        if (idBloc) {
            const s = await lireSection(page, idBloc);
            expect(s.halo, `bulle ${n}, après : le halo reste`).toBe(true);
        }
    };

    // 1. Un cours : « Cours et services », pas « Trimestre », en haut (défaut vu le 15 nov.).
    const ouverture = await suivreLOuverture(page, () => boutonModele(page, 'classe').click(), 'Un cours');
    await attendreEtape(page, 1, 8, 'Un cours');
    let v = await lire(page);
    expect(v.objectif).toBe(OBJECTIF_CLASSE);
    expect(v.ordre.slice(0, 3)).toEqual(['parcours-bulle-objectif', 'parcours-bulle-lieu', 'parcours-bulle-note']);
    expect(v.confirme).toBeNull();
    await jugerSection(1, 'accordeon-cours', (nom) => `Tu es dans « Cadre », à la section « ${nom} » : c'est là que tu dis quel cours tu donnes.`);
    expect((await lireSection(page, 'accordeon-cours')).nomLu).toBe('Cours et services');
    expect(ouverture.montreeEnMouvement, 'bulle 1 : jamais montrée pendant que la page défile').toBe(0);
    expect(v.aide).toBe('Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.');
    await deuxEtats(1, { consigne: 'Touche « Créer le cours »', bouton: '#v2-btnCreerCours', idBloc: 'accordeon-cours' });
    await expect(page.locator('#v2-codeCours')).toHaveValue(m.cours.code);

    // 2. La liste : le formulaire du cours, resté en « Mode modification », est refermé (défaut vu le 15 nov.) ; la
    // page défile jusqu'à la section, et la bulle ne paraît qu'ensuite (règle b).
    const vers2 = await suivreLOuverture(page, () => page.click('#v2-btnCreerCours'), "Une liste d'étudiant·es");
    expect(vers2.positions, 'la page défile par une transition (plusieurs positions), pas d’un coup').toBeGreaterThan(3);
    expect(vers2.cachee, 'la bulle est cachée pendant le défilement').toBe(true);
    expect(vers2.montreeEnMouvement, 'bulle 2 : jamais montrée pendant que la page défile').toBe(0);
    await attendreEtape(page, 2, 8, "Une liste d'étudiant·es");
    v = await lire(page);
    expect(v.objectif, 'l’objectif n’est dit qu’à la première bulle').toBeNull();
    expect(v.confirme).toBe("C'est fait : le cours est créé.");
    expect(v.confirmeAuDessus).toBe(true);
    expect(v.ordre[0]).toBe('parcours-bulle-lieu');
    const s2 = await jugerSection(2, 'accordeon-groupe-etudiants', (nom) => `Tu es dans la section « ${nom} » : c'est là que tu apportes la liste de ton groupe.`);
    await deuxEtats(2, { consigne: 'Touche « Prévisualiser »', bouton: '#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]', idBloc: 'accordeon-groupe-etudiants' });
    // L'exemple voulu par Grégoire (18 nov. 2026, 14 h 11) : « ✓ Regarde l'exemple se remplir… » (gris), cinq lignes
    // d'explication sans tiret, « → Touche « Prévisualiser » » (orange). Break-test : le tiret rendu aux lignes
    // (`.parcours-bulle-ligne::before { content: '\2013' }`) → ROUGE ici. Rétabli → vert.
    expect((await lire(page)).marques).toEqual(['fait:✓', 'explication:', 'explication:', 'explication:', 'explication:', 'explication:', 'geste:→']);
    expect((await page.inputValue('#v2-donneesCollees')).split('\n')).toHaveLength(10);
    await page.click('#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');

    // 3. Le cours de la liste : la même section ; son nom garde le halo, la phrase du lieu n'est pas redite.
    await attendreEtape(page, 3, 8, 'Le cours de la liste');
    v = await lire(page);
    expect(v.confirme).toBe("C'est fait : l'aperçu est ouvert. Rien n'est encore importé.");
    expect(v.lieu).toBeNull();
    // Le moteur retire le halo au changement d'étape et le repose au premier passage de la suivante : on l'attend.
    await expect(page.locator('#accordeon-groupe-etudiants .accordeon-header h3')).toHaveClass(/parcours-section-actuelle/);
    expect(v.aide, 'la poignée n’est dite qu’à la première bulle').toBeNull();
    await deuxEtats(3, { consigne: 'Touche « Importer 10 étudiant·es »', bouton: '#v2-btnConfirmerImport' });
    await page.click('#v2-btnConfirmerImport');

    // 4. Un horaire.
    await attendreEtape(page, 4, 8, 'Un horaire');
    await expect(bulle(page)).not.toHaveClass(/est-en-attente/);
    expect((await lire(page)).confirme).toBe("C'est fait : les dix étudiant·es sont importé·es.");
    await jugerSection(4, 'accordeon-horaire', (nom) => `Tu es dans la section « ${nom} » : c'est là que tu dis quand ton groupe se rencontre.`);
    await deuxEtats(4, { consigne: "Touche « Créer l'horaire »", bouton: '#v2-btnCreerHoraire', idBloc: 'accordeon-horaire' });
    await page.click('#v2-btnCreerHoraire');

    // 5. Un groupe-cours.
    await attendreEtape(page, 5, 8, 'Un groupe-cours');
    await expect(bulle(page)).not.toHaveClass(/est-en-attente/);
    expect((await lire(page)).confirme).toBe("C'est fait : l'horaire est créé.");
    await jugerSection(5, 'accordeon-groupe-cours', (nom) => `Tu es dans la section « ${nom} » : c'est là que tu réunis ce que tu viens de créer.`);
    await deuxEtats(5, { consigne: "Touche « Créer le groupe-cours » (il apparaîtra dans l'en-tête de l'application)", bouton: '#v2-btnCreerGroupeCours', idBloc: 'accordeon-groupe-cours' });
    await page.click('#v2-btnCreerGroupeCours');

    // 6. D'un groupe à l'autre : plus de section ; le halo a quitté le Cadre.
    await attendreEtape(page, 6, 8, "D'un groupe à l'autre");
    v = await relever(page, P, 6, '');
    expect(v.confirme).toBe("C'est fait : le groupe-cours est créé. La mise en place est terminée.");
    expect(await page.locator('#calendrier-trimestre .parcours-section-actuelle').count()).toBe(0);
    await contourSur(page, '#selectGroupeCoursHeader');
    // La consigne nomme le groupe, tel que la liste de l'en-tête l'affiche (essai, B.6).
    const nomDuGroupe = await page.evaluate((code) => [...document.querySelectorAll('#selectGroupeCoursHeader option')].find((o) => o.textContent.includes(code)).getAttribute('data-principal'), m.cours.code);
    expect(nomDuGroupe).toBe('601-999-DM · gr. 00002');
    expect(v.liste[v.liste.length - 1]).toBe(`Choisis dans l'en-tête le groupe que tu viens de créer : « ${nomDuGroupe} »`);
    await capture(page, 'j-classe-6');
    await page.selectOption('#selectGroupeCoursHeader', await optionDont(page, '#selectGroupeCoursHeader', m.cours.code));

    // 7. Prendre les présences : les noms du menu, lus à l'écran.
    await attendreEtape(page, 7, 8, 'Prendre les présences');
    v = await lire(page);
    expect(v.confirme).toBe("C'est fait : tu es dans ton deuxième groupe.");
    expect(v.lieu).toMatch(/^Tu es dans « Suivi », à l'onglet « [^»]+ »\. Ce qui suit, tu le referas à chaque séance, tes étudiant·es devant toi\.$/);
    // Avant « Remplir » : la première séance du groupe est déjà choisie, tout le monde présent (Grégoire, essai du 18 nov.
    // 2026 sur l'iPad : la saisie s'ouvrait sur une date hors de l'horaire, chaque ligne « 0 /0 » en rouge).
    // Break-test (18 nov. 2026) : `choisirLaPremiereSeance` retiré de l'ouverture de l'étape → ROUGE ici. Rétabli → vert.
    const seance = await page.evaluate(() => {
        const cases = [...document.querySelectorAll('#suivi-saisie input[id^="periodes_"]')];
        return { date: document.getElementById('date-cours').value, n: cases.length, valeurs: [...new Set(cases.map((c) => c.value))], max: [...new Set(cases.map((c) => c.max))] };
    });
    expect(seance.n).toBe(10);
    expect(seance, 'tout le monde présent, 2 périodes sur 2').toMatchObject({ valeurs: ['2'], max: ['2'] });
    expect(await page.evaluate(() => { const s = obtenirSeancesCompletesDuGroupe(db.getSync('groupeCoursActif', null).id);
        return Object.keys(s).filter((d) => Array.isArray(s[d]) && s[d].length).sort()[0]; })).toBe(seance.date);
    await deuxEtats(7, { consigne: "Touche « Verrouiller la saisie » (c'est ce qui dit à l'application que cette séance a eu lieu)", bouton: '#btnVerrouillerSaisiePresences' });
    await page.click('#btnVerrouillerSaisiePresences');

    // 8. La bande : l'objectif atteint, les trois suites de même poids, « Pour revoir une étape ».
    await attendreEtape(page, 8, 8, "Le groupe d'un coup d'œil");
    v = await relever(page, P, 8, '');
    expect(v.confirme).toBe("C'est fait : la séance est verrouillée.");
    expect(v.lieu).toBe("Tu es dans « Suivi », à l'onglet « Groupe ». Reviens-y avant chaque séance.");
    expect(v.atteint).toBe("Objectif atteint : tu es en mesure d'expliquer ce que l'application te demande pour mettre une classe en place et ce qu'elle en tire.");
    expect(v.suite).toBe("Chaque parcours a son objectif. C'est toi qui choisis la suite.");
    expect(v.ordre.slice(-3)).toEqual(['parcours-bulle-note parcours-bulle-revue', 'parcours-bulle-objectif parcours-bulle-atteint', 'parcours-bulle-suite']);
    expect(v.liste.some((l) => /Objectif atteint|Chaque parcours/.test(l))).toBe(false);
    await expect(bulle(page)).toContainText('Pour revoir une étape, touche « 8 sur 8 ».');
    // L'espace insécable devant le point-virgule (essai, 9) : « …étudiant·es ; la bande… » ne se coupe plus devant lui.
    expect(await bulle(page).locator('.parcours-bulle-ligne-texte').first().evaluate((e) => e.textContent)).toContain('étudiant·es\u00a0; la bande «\u00a0Assiduité\u00a0»');
    // RÈGLE 8 : la bulle, haute, ne couvre ni le nom de la bande ni aucun des dix points dont elle parle, l'iPad debout,
    // couché, et couché sous les barres de Safari (vu par Cowork sur la capture de Grégoire : sept points couverts).
    await aChaqueEcran(page, 7, "Le groupe d'un coup d'œil", (bande, ecran) => {
        expect({ points: bande.points, pointsCouverts: bande.pointsCouverts, nomCouvert: bande.nomCouvert, aLEcran: bande.aLEcran }, 'bulle 8, ' + ecran)
            .toEqual({ points: 10, pointsCouverts: 0, nomCouvert: false, aLEcran: true });
        expect(bande.flechesSurUnPoint, `bulle 8, ${ecran} : les trois points à l'écart sont montrés`).toBeGreaterThanOrEqual(1);
    });
    const fin = await lireBulle(page);
    expect(fin.boutons).toEqual(['Le refaire avec ma classe', 'Voir le parcours suivant', 'Terminer']);
    expect(fin.principal, 'aucun bouton mis en avant').toEqual([]);
    await capture(page, 'j-classe-8');
    expect(s2.nomLu.length).toBeGreaterThan(0);

    // ------------------------------------------------------------------------------------------------------------
    // LE DÉFAUT DE L'ESSAI (A) : le deuxième groupe est monté, et c'est lui qui est choisi dans l'en-tête. « Découvrir »
    // choisit lui-même le premier groupe de la démo, celui de Suricate Loyal, à son ouverture et à chaque reprise.
    // ------------------------------------------------------------------------------------------------------------
    const groupeAffiche = () => page.locator('#groupe-affichage-principal').textContent();
    const groupeActif = () => page.evaluate(() => (db.getSync('groupeCoursActif', {}) || {}).id);
    await bulle(page).getByRole('button', { name: 'Terminer', exact: true }).click();
    await expect(bulle(page)).toHaveCount(0);
    expect(await groupeAffiche(), 'avant « Découvrir », le deuxième groupe est choisi').toBe('601-999-DM · gr. 00002');
    await ouvrirPanneau(page);
    await carte(page, 'decouvrir').locator('.assistance-parcours-bouton').click();
    await attendreEtape(page, 1, 8, "Ta classe d'un coup d'œil");
    expect(await groupeActif(), 'à l’ouverture, « Découvrir » a choisi le premier groupe de la démo').toBe('GC_DEMO');
    expect(await groupeAffiche()).toBe('601-101 · gr. 0demo');
    expect(await enDemo(page)).toBe(true);
    await page.click('#btn-toggle-panneau-prioritaire');
    await attendreEtape(page, 2, 8, "Qui s'écarte ?");
    const loyal = page.locator('#panneau-suivi-etudiants .etudiant-suivi-item', { hasText: 'Suricate' });
    await expect(loyal, 'la personne que nomme la bulle 2 est dans la liste').toHaveCount(1);
    await expect(loyal.locator('.prioritaire-indice').first()).toHaveText(/^A 84\s%$/);
    // La reprise : le parcours quitté à la bulle 2, le deuxième groupe choisi de nouveau, « Détails » resté allumé.
    await bulle(page).locator('.parcours-bulle-sortie').click();
    await expect(bulle(page)).toHaveCount(0);
    await page.selectOption('#selectGroupeCoursHeader', await optionDont(page, '#selectGroupeCoursHeader', m.cours.code));
    await expect(page.locator('#groupe-affichage-principal')).toHaveText('601-999-DM · gr. 00002');
    await ouvrirPanneau(page);
    await carte(page, 'decouvrir').locator('.assistance-parcours-bouton').click();
    await attendreEtape(page, 2, 8, "Qui s'écarte ?");
    expect(await groupeActif(), 'à la reprise aussi').toBe('GC_DEMO');
    await expect(loyal).toHaveCount(1);
    await expect(loyal.locator('.prioritaire-indice').first(), 'à la reprise, l’étiquette porte son « A 84 % »').toHaveText(/^A 84\s%$/);
    await capture(page, 'j-decouvrir-2-reprise');
});
