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
        objectif: plat(b.querySelector('.parcours-bulle-objectif')),
        confirme: plat(b.querySelector('.parcours-bulle-confirme')),
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
        return { signe: getComputedStyle(r, '::after').content, ouvert: r.getAttribute('aria-expanded'), texte: r.textContent };
    });
    const ferme = await lu();
    await page.click('#parcours-bulle-rang');
    const ouvert = await lu();
    await page.click('#parcours-bulle-rang');
    const referme = await lu();
    return { ferme, ouvert, referme };
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
    await page.waitForTimeout(300);
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
    // Le triangle du compteur (règle d).
    const t = await triangle(page);
    expect([t.ferme.ouvert, t.ouvert.ouvert, t.referme.ouvert]).toEqual(['false', 'true', 'false']);
    expect(t.ferme.signe).not.toBe('none');
    expect(t.ouvert.signe).not.toBe(t.ferme.signe);
    expect(t.referme.signe).toBe(t.ferme.signe);
    expect([t.ferme.texte, t.ouvert.texte]).toEqual(['1 sur 8', '1 sur 8']);
    await capture(page, 'j-decouvrir-1');
    await page.click('#btn-toggle-panneau-prioritaire');

    // 2. Le geste précédent, confirmé en le nommant (règle e) ; l'objectif n'est plus redit (règle a).
    await attendreEtape(page, 2, 8, "Qui s'écarte ?");
    v = await relever(page, P, 2, '');
    expect(v.objectif).toBeNull();
    expect(v.confirme).toBe("Tu viens d'ouvrir « Détails » : chaque point a maintenant un nom.");
    expect(v.ordre[0]).toBe('parcours-bulle-confirme');
    expect(v.liste[0]).toBe("Le point à l'écart, c'est Suricate Loyal");
    // Ce que dit la bulle est ce que montre l'écran : son nom, et 84 %.
    const loyal = page.locator('#panneau-suivi-etudiants .etudiant-suivi-item', { hasText: 'Suricate' });
    await expect(loyal).toContainText('84');
    await capture(page, 'j-decouvrir-2');
    await loyal.locator('.prioritaire-indice').first().click();

    await attendreEtape(page, 3, 8, "Ce qui le met à l'écart");
    v = await relever(page, P, 3, '');
    expect(v.confirme).toBe("Tu viens d'ouvrir le profil de Suricate Loyal.");
    // La page a changé (l'onglet du menu passe de « Groupe » à « Profils ») : la bulle le dit, après la confirmation.
    expect(v.lieu).toBe(await lieuDuMenu());
    expect(v.lieu).toBe("Tu es dans « Suivi », à l'onglet « Profils ».");
    expect(v.ordre.slice(0, 2)).toEqual(['parcours-bulle-confirme', 'parcours-bulle-lieu']);
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
    expect(v.liste).toContain('Objectif atteint : tu es en mesure de repérer qui a besoin de toi sans attendre une main levée et de nommer précisément son défi');
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
    const deuxEtats = async (n, { consigne, bouton, idBloc }) => {
        await attendreRemplir(page, 'bulle ' + n);
        await relever(page, P, n, 'avant');
        await capture(page, `j-classe-${n}-avant`);
        await remplirPuisVoir(page, { consigne, bouton, contexte: 'bulle ' + n });
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
    expect(v.ordre.slice(0, 2)).toEqual(['parcours-bulle-confirme', 'parcours-bulle-lieu']);
    const s2 = await jugerSection(2, 'accordeon-groupe-etudiants', (nom) => `Tu es dans la section « ${nom} » : c'est là que tu apportes la liste de ton groupe.`);
    await deuxEtats(2, { consigne: 'Touche « Prévisualiser »', bouton: '#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]', idBloc: 'accordeon-groupe-etudiants' });
    expect((await page.inputValue('#v2-donneesCollees')).split('\n')).toHaveLength(10);
    await page.click('#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');

    // 3. Le cours de la liste : la même section ; son nom garde le halo, la phrase du lieu n'est pas redite.
    await attendreEtape(page, 3, 8, 'Le cours de la liste');
    v = await lire(page);
    expect(v.confirme).toBe("C'est fait : l'aperçu est ouvert. Rien n'est encore importé.");
    expect(v.lieu).toBeNull();
    expect((await lireSection(page, 'accordeon-groupe-etudiants')).halo).toBe(true);
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
    await capture(page, 'j-classe-6');
    await page.selectOption('#selectGroupeCoursHeader', await optionDont(page, '#selectGroupeCoursHeader', m.cours.code));

    // 7. Prendre les présences : les noms du menu, lus à l'écran.
    await attendreEtape(page, 7, 8, 'Prendre les présences');
    v = await lire(page);
    expect(v.confirme).toBe("C'est fait : tu es dans ton deuxième groupe.");
    expect(v.lieu).toMatch(/^Tu es dans « Suivi », à l'onglet « [^»]+ »\. Ce qui suit, tu le referas à chaque séance, tes étudiant·es devant toi\.$/);
    await deuxEtats(7, { consigne: "Touche « Verrouiller la saisie » (c'est ce qui dit à l'application que cette séance a eu lieu)", bouton: '#btnVerrouillerSaisiePresences' });
    await page.click('#btnVerrouillerSaisiePresences');

    // 8. La bande : l'objectif atteint, les trois suites de même poids, « Pour revoir une étape ».
    await attendreEtape(page, 8, 8, "Le groupe d'un coup d'œil");
    v = await relever(page, P, 8, '');
    expect(v.confirme).toBe("C'est fait : la séance est verrouillée.");
    expect(v.lieu).toBe("Tu es dans « Suivi », à l'onglet « Groupe ». Reviens-y avant chaque séance.");
    expect(v.liste).toContain("Objectif atteint : tu es en mesure d'expliquer ce que l'application te demande pour mettre une classe en place et ce qu'elle en tire");
    await expect(bulle(page)).toContainText('Pour revoir une étape, touche « 8 sur 8 ».');
    // La bulle, haute, ne couvre aucun des dix points dont elle parle (mesuré le 16 nov. : posée sur la bande, elle
    // en cachait sept ; l'étape amène la bande sous l'en-tête, la bulle tient dessous).
    const couverts = await page.evaluate(() => {
        const b = document.getElementById('parcours-bulle').getBoundingClientRect();
        const bloc = document.querySelector('#section-suivi h4[data-tooltip="tdb-assiduite"]').parentElement;
        const points = [...bloc.querySelectorAll('.barre-etudiant[data-da]')].map((e) => e.getBoundingClientRect());
        return { points: points.length, couverts: points.filter((r) => !(r.right <= b.left || b.right <= r.left || r.bottom <= b.top || b.bottom <= r.top)).length,
            aLEcran: points.every((r) => r.top >= 0 && r.bottom <= window.innerHeight) };
    });
    expect(couverts).toEqual({ points: 10, couverts: 0, aLEcran: true });
    const fin = await lireBulle(page);
    expect(fin.boutons).toEqual(['Le refaire avec ma classe', 'Voir le parcours suivant', 'Terminer']);
    expect(fin.principal, 'aucun bouton mis en avant').toEqual([]);
    await capture(page, 'j-classe-8');
    expect(s2.nomLu.length).toBeGreaterThan(0);
});
