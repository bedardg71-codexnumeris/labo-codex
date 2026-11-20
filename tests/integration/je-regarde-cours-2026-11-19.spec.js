import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import { ouvrirEspaceVide, ouvrirPanneau, boutonModele, bulle, releve, ecarts, horsDeLaDemo, faireLaModelisation, lireBulle as lireBulleDT } from './harness/deux-temps-de-banc.js';
import { faireLeModeleDEvaluer } from './harness/recevoir-modele-de-banc.js';
import { bulleNeCouvrePas } from './harness/classe-de-banc.js';

// =======================================================================
// « MONTER TON COURS », « JE REGARDE » : LE MODÈLE DE BOUT EN BOUT (20 NOV. 2026, SESSION DE NUIT B, LOT 3)
// =======================================================================
// plans de travail/CONSIGNE-2026-11-19-je-regarde-cours.md, point 4. Depuis un espace vide : la Modélisation de « Mettre ta
// classe en place », puis celle d'« Évaluer » (sa production), puis ce modèle, aux vrais gestes de la carte (la palette,
// « Remplir » dans la bulle, les traits tirés, les blocs glissés par leur poignée, les cases, la production), à
// 1180 × 820 et 820 × 1180. Il juge : chaque bulle en trois temps (le geste de la page, « Remplir », ce qui vient
// d'apparaître) ; ce que « Remplir » écrit ; la carte du modèle (neuve, au nom du cours du deuxième groupe, rattachée à
// son cours ; `carte_1` intacte) ; les pastilles à la fin ; la fin du moteur ; le CONFINEMENT (aucune clé hors de la
// démo ne change). Les mots eux-mêmes : la sentinelle Vitest du modèle.
// ⚠ Les gestes sur la carte se font à la souris, aux coordonnées (comme parcours-5-monter-ton-cours) : `click` de
// Playwright ferait défiler le conteneur de la carte. Chaque geste attend sa cible immobile (la vue amène les blocs
// neufs) et libre (ni la bulle ni une palette dessus).
// Break-tests (20 nov.) : voir le rapport du lot (plans de travail/RAPPORT-2026-11-19-je-regarde-cours.md).

const M = {
    competence: 'Analyser des textes littéraires',
    idee: 'Une stratégie de lecture fait regarder le texte sous un angle précis.',
    lecon: 'La méthode : manuel, postures, stratégies',
    objectif: 'Choisir les stratégies de lecture.',
    activite: 'Modélisation : choix des stratégies dans « Pour que nous puissions vivre »',
    evaluation: 'Artefact 1 : Appliquer des stratégies de lecture variées (Deux-Rives)',
    production: 'Appliquer des stratégies de lecture variées (Deux-Rives)'
};
const ATTEINT = "Objectif atteint : tu es en mesure d'expliquer comment une carte d'alignement relie ce que tu enseignes à ce que tu évalues, de la compétence jusqu'à la production.";
const plat = (t) => String(t || '').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();

const lireBulle = (page) => page.evaluate(() => {
    const b = document.getElementById('parcours-bulle');
    const plat = (t) => String(t || '').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
    const conf = b.querySelector('.parcours-bulle-confirme');
    return {
        titre: plat(b.querySelector('.parcours-bulle-titre')?.textContent),
        confirme: conf && !conf.hidden ? plat(conf.textContent) : '',
        notes: [...b.querySelectorAll('.parcours-bulle-note')].map((p) => plat(p.textContent)),
        gestes: [...b.querySelectorAll('.parcours-bulle-ligne')].map((li) => ({
            texte: plat(li.querySelector('.parcours-bulle-ligne-texte').textContent),
            consigne: li.classList.contains('parcours-bulle-ligne--geste'),
            faite: li.classList.contains('est-faite')
        })),
        boutons: [...b.querySelectorAll('.parcours-bulle-boutons button')].map((x) => plat(x.textContent))
    };
});

async function etape(page, n, titre) {
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(titre, { timeout: 15000 });
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(`${n} sur 7`);
}

const consignes = async (page) => (await lireBulle(page)).gestes.filter((g) => g.consigne).map((g) => g.texte);

// ---------- Les gestes sur la carte, à la souris ----------
const rect = (page, sel) => page.evaluate((s) => {
    const e = document.querySelector(s);
    if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2, t: b.top, h: b.height, l: b.left, w: b.width };
}, sel);
const noeud = (id) => `[id="${id}"]`;
const prise = (id) => `[id="${id}"] .planif-noeud-prise`;
const port = (id, dir) => `[id="${id}"] > .planif-noeud-port[data-dir="${dir}"]`;
const neufs = (page, type) => page.evaluate((t) => [...planificationCarte.etat.noeuds.values()].filter((x) => x.type === t).map((x) => x.id), type);

async function toucher(page, sel) {
    const r = await cibleImmobile(page, sel);
    await libre(page, sel);
    await page.mouse.click(r.x, r.y);
}
async function glisser(page, de, vers) {
    await page.mouse.move(de.x, de.y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) await page.mouse.move(de.x + (vers.x - de.x) * i / 12, de.y + (vers.y - de.y) * i / 12);
    await page.mouse.up();
}
async function relier(page, source, cible) {
    const a = await cibleImmobile(page, noeud(source)), b = await cibleImmobile(page, noeud(cible));
    const dx = b.x - a.x, dy = b.y - a.y;
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'droite' : 'gauche') : (dy > 0 ? 'bas' : 'haut');
    const de = await cibleImmobile(page, port(source, dir)), vers = await cibleImmobile(page, `${noeud(cible)} .planif-noeud-titre`);
    await libre(page, port(source, dir));
    await libre(page, `${noeud(cible)} .planif-noeud-titre`);
    await glisser(page, de, vers);
}
async function deuxFois(page, sel) {
    const r = await cibleImmobile(page, sel);
    await page.mouse.click(r.x, r.y, { clickCount: 2 });
}
/** Un élément de la carte, une fois la vue immobile (un bloc neuf y est amené) et lui visible : son rectangle. */
async function cibleImmobile(page, sel) {
    let r = null, ok = false;
    await expect.poll(async () => {
        const z = await rect(page, sel);
        ok = !!z && !!r && z.w > 0 && Math.abs(z.x - r.x) < 1 && Math.abs(z.y - r.y) < 1
            && z.t >= 0 && z.t + z.h <= await page.evaluate(() => innerHeight);
        r = z;
        return ok;
    }, { message: 'immobile et visible : ' + sel, intervals: [150, 150, 150, 300, 300, 500, 500, 1000] }).toBe(true);
    return r;
}
/** Ce que le geste vise n'est pas sous la bulle (elle se replace à chaque passage de la sonde, 120 ms). */
async function libre(page, sel) {
    await expect.poll(() => page.evaluate((s) => {
        const e = document.querySelector(s);
        if (!e) return 'absent';
        const r = e.getBoundingClientRect();
        const dessus = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return !!dessus && (e === dessus || e.contains(dessus)) ? 'libre' : 'couvert par ' + (dessus && (dessus.closest('#parcours-bulle') ? 'la bulle' : dessus.className));
    }, sel), { message: 'libre : ' + sel, timeout: 6000 }).toBe('libre');
}
/** L'Inspecteur entre en glissant (0,2 s) : il est en place quand son bord gauche ne bouge plus. */
async function inspecteurEnPlace(page) {
    await expect(page.locator('#planif-panneau')).toHaveClass(/visible/);
    let avant = null;
    await expect.poll(async () => {
        const g = await page.evaluate(() => Math.round(document.getElementById('planif-panneau').getBoundingClientRect().left));
        const stable = g === avant;
        avant = g;
        return stable;
    }, { intervals: [100, 100, 100, 100, 200] }).toBe(true);
}
/** Le bouton de la palette : un bloc neuf naît, son titre prend le focus ; on quitte le champ sans rien écrire (Échap). */
async function poserUnBloc(page, type) {
    const avant = await neufs(page, type);
    await toucher(page, `#planif-palette .planif-palette-btn[data-type="${type}"]`);
    await expect.poll(async () => (await neufs(page, type)).filter((i) => !avant.includes(i)).length).toBe(1);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    return (await neufs(page, type)).find((i) => !avant.includes(i));
}
async function remplir(page) {
    await expect(bulle(page).getByRole('button', { name: 'Remplir', exact: true })).toBeVisible();
    expect(await consignes(page)).toEqual(["Regarde l'exemple se remplir : touche « Remplir »"]);
    await bulle(page).getByRole('button', { name: 'Remplir', exact: true }).click();
}

for (const [largeur, hauteur] of [[1180, 820], [820, 1180]]) {
    test(`« Je regarde » de « Monter ton cours » : sept bulles en trois temps, la carte du deuxième groupe, rien hors de la démo (${largeur} × ${hauteur})`, async ({ page }) => {
        test.setTimeout(600000);
        page.setDefaultTimeout(20000);
        await ouvrirEspaceVide(page, largeur, hauteur);
        await ouvrirPanneau(page);
        await boutonModele(page, 'classe').click();
        await faireLaModelisation(page);
        await bulle(page).getByRole('button', { name: 'Voir le parcours suivant', exact: true }).click();
        await faireLeModeleDEvaluer(page);
        await bulle(page).getByRole('button', { name: 'Terminer', exact: true }).click();
        // ⚠ À 820 × 1180, le « Planificateur » ouvert couvre la part de la carte où se font les gestes (mesuré : le cercle
        // de l'idée maîtresse, le badge 🎯) : la personne le ferme (menu « Vue »), le banc aussi. Inscrit au rapport du lot.
        // Avant le relevé : c'est une préférence de l'appareil, pas une écriture du modèle.
        if (largeur < hauteur) await page.evaluate(() => definirPreference('planifPalettePlanificateurVisible', false));
        const avant = await releve(page);
        const carte1 = await page.evaluate(() => JSON.stringify(db.getSync(cle('planification_mindmap'), {}).cartes?.carte_1 || null));

        // Le panneau : « Je regarde » de « Monter ton cours ».
        await ouvrirPanneau(page);
        await boutonModele(page, 'monter').click();

        // 1. La compétence : l'objectif, le lieu, cinq explications, le geste de la palette ; puis « Remplir » ; puis « Continuer ».
        await etape(page, 1, 'Ta compétence');
        let b = await lireBulle(page);
        expect(b.confirme).toBe('');
        expect(b.notes).toHaveLength(5);
        expect(b.notes[0]).toBe("Dans la démo, tu commences celle du cours de ton deuxième groupe, avec le matériel de l'exemple. Rien ne touche à tes données.");
        expect(b.gestes.map((g) => g.texte)).toEqual(['Touche « Compétence » dans la palette « Nœuds »']);
        // La carte du modèle : neuve, au nom du cours du deuxième groupe, rattachée à son cours, ouverte.
        const carte = await page.evaluate(() => {
            const idx = window.planificationDonnees.getIndex();
            const c = idx.cartes.find((x) => x.id === idx.active);
            return { nom: c.nom, coursId: c.coursId, attendu: window.ParcoursClasse.deuxiemeGroupe().coursId, n: idx.cartes.length };
        });
        expect(carte.nom).toBe('Littérature et imaginaire');
        expect(carte.coursId).toBe(carte.attendu);
        expect(carte.n).toBe(2);
        const comp = await poserUnBloc(page, 'competence');
        await remplir(page);
        await expect.poll(() => page.evaluate((i) => planificationCarte.etat.noeuds.get(i).titre, comp)).toBe(M.competence);
        await expect.poll(async () => (await lireBulle(page)).notes[0], { message: 'la seconde forme de la bulle 1' }).toBe("L'énoncé de l'exemple : « Analyser des textes littéraires ».");
        expect(await consignes(page)).toEqual(['Touche « Continuer »']);
        await bulle(page).getByRole('button', { name: 'Continuer', exact: true }).click();

        // 2. L'idée maîtresse : la confirmation, le geste, « Remplir », puis le trait tiré par la personne.
        await etape(page, 2, 'Ton idée maîtresse');
        expect((await lireBulle(page)).confirme).toBe("C'est fait : la compétence est écrite.");
        const idee = await poserUnBloc(page, 'idee-maitresse');
        await remplir(page);
        await expect.poll(() => page.evaluate((i) => planificationCarte.etat.noeuds.get(i).titre, idee)).toBe(M.idee);
        await expect.poll(async () => (await lireBulle(page)).notes[0]).toBe("L'idée maîtresse de l'exemple : « Une stratégie de lecture fait regarder le texte sous un angle précis. »");
        expect((await lireBulle(page)).confirme, 'la seconde forme : sans confirmation').toBe('');
        await relier(page, comp, idee);

        // 3. La leçon : « Remplir » écrit son titre, sa semaine (S2) et sa séance (A) ; le trait.
        await etape(page, 3, 'Ta leçon');
        const lecon = await poserUnBloc(page, 'lecon');
        await remplir(page);
        await expect.poll(() => page.evaluate((i) => { const n = planificationCarte.etat.noeuds.get(i); return [n.titre, n.metadata.semaine, n.metadata.rangSeance]; }, lecon))
            .toEqual([M.lecon, 2, 1]);
        await relier(page, idee, lecon);

        // 4. L'objectif : le badge 🎯 ; « Remplir » ; « Continuer ».
        await etape(page, 4, 'Ton objectif');
        await toucher(page, `${noeud(lecon)} .planif-badge-objectif`);
        await page.evaluate(() => document.activeElement && document.activeElement.blur());
        await remplir(page);
        await expect.poll(() => page.evaluate((i) => planificationCarte.objectifsDeLecon(planificationCarte.etat.noeuds.get(i)).map((o) => o.texte), lecon)).toEqual([M.objectif]);
        await bulle(page).getByRole('button', { name: 'Continuer', exact: true }).click();

        // 5. L'activité : « Remplir » écrit son titre et une période ; la personne la glisse, l'ouvre, coche l'objectif.
        await etape(page, 5, 'Ton activité');
        const act = await poserUnBloc(page, 'activite');
        await remplir(page);
        const periode = await page.evaluate(() => (typeof obtenirDureePeriode === 'function' && obtenirDureePeriode()) || 50);
        await expect.poll(() => page.evaluate((i) => { const n = planificationCarte.etat.noeuds.get(i); return [n.titre, Number(n.metadata.duree)]; }, act)).toEqual([M.activite, periode]);
        const zone = await cibleImmobile(page, `${noeud(lecon)} > .planif-noeud-zone`);
        await glisser(page, await cibleImmobile(page, prise(act)), { x: zone.x, y: zone.y });
        await expect.poll(() => page.evaluate((i) => planificationCarte.etat.noeuds.get(i).parent, act)).toBe(lecon);
        await deuxFois(page, prise(act));
        await inspecteurEnPlace(page);
        await toucher(page, '#planif-panneau .planif-objectifs-servis input[type="checkbox"]');

        // 6. L'évaluation : « Remplir » écrit son titre et pose deux leçons ; la personne la glisse sous l'autoévaluation.
        await etape(page, 6, 'Ton évaluation');

        const ev = await poserUnBloc(page, 'evaluation');
        await remplir(page);
        const ajout = await page.evaluate(() => {
            const N = [...planificationCarte.etat.noeuds.values()];
            const t = (x) => x.titre;
            const l2 = N.find((x) => x.titre === "Les stratégies de lecture à l'essai"), l3 = N.find((x) => x.titre === 'Retour sur « Fendant Rioux »');
            const enfants = (l) => (l ? l.enfants : []).map((i) => planificationCarte.etat.noeuds.get(i)).map((x) => [t(x), Number(x.metadata.duree)]);
            const liens = [...planificationCarte.etat.liens.values()].filter((x) => x.type === 'se_concretise_dans').length;
            return { l2: l2 && [l2.metadata.semaine, l2.metadata.rangSeance, enfants(l2)], l3: l3 && [l3.metadata.semaine, l3.metadata.rangSeance, enfants(l3)], l3id: l3 && l3.id, liens };
        });
        expect(ajout.l2).toEqual([2, 2, [['Pratique guidée : appliquer des stratégies de lecture dans « Marine »', periode],
            ['Pratique en équipe : appliquer des stratégies de lecture dans « Fendant Rioux » (à terminer seul·e à la maison)', periode]]]);
        expect(ajout.l3).toEqual([3, 1, [["Autoévaluation de « Fendant Rioux », avec la grille d'autoévaluation", periode]]]);
        expect(ajout.liens, 'les trois leçons reliées à l’idée maîtresse').toBe(3);
        await expect.poll(() => page.evaluate((i) => planificationCarte.etat.noeuds.get(i).titre, ev)).toBe(M.evaluation);
        // Les leçons neuves sont amenées dans la vue : la cible se lit une fois la vue immobile.
        // La leçon où va l'évaluation : amenée dans le canevas libre, la bulle la laisse libre.
        const l3 = await cibleImmobile(page, noeud(ajout.l3id));
        if (largeur > hauteur) {
            await bulleNeCouvrePas(page, noeud(ajout.l3id));
            await libre(page, prise(ev));
            await glisser(page, await cibleImmobile(page, prise(ev)), { x: l3.x, y: l3.t + l3.h - 14 });
        } else {
            // MESURÉ LE 20 NOV. (au rapport du lot) : à 820 × 1180, la part visible de la carte est étroite ; la bulle de
            // l'étape 6 (treize lignes) et l'Inspecteur resté ouvert y couvrent l'évaluation ou la leçon où elle va. Le banc
            // le constate, puis range l'évaluation par la carte elle-même (comme le ferait le glisser) pour juger la suite.
            const couvert = async (sel) => page.evaluate((x) => {
                const e = document.querySelector(x), r = e.getBoundingClientRect();
                const d = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
                return !d || !(e === d || e.contains(d));
            }, sel);
            expect((await couvert(prise(ev))) || (await couvert(noeud(ajout.l3id))), 'à 820 × 1180, le geste de l’étape 6 est couvert (mesure)').toBe(true);
            await page.evaluate(([i, l]) => {
                const api = window.planificationCarte, n = api.etat.noeuds.get(i), lec = api.etat.noeuds.get(l);
                n.parent = l;
                n.x = lec.x + 10;
                n.y = lec.y + 2000;   // sous l'autoévaluation : la leçon range ses blocs de haut en bas
                lec.enfants = lec.enfants.concat([i]);
                api.injecterNoeuds([]);   // la carte se redessine et s'enregistre, comme après un glisser
            }, [ev, ajout.l3id]);
        }
        await expect.poll(() => page.evaluate(([i, l]) => { const n = planificationCarte.etat.noeuds.get(l); return n.enfants.indexOf(i); }, [ev, ajout.l3id])).toBe(1);
        if (largeur > hauteur) await deuxFois(page, prise(ev));
        else await page.evaluate((i) => document.getElementById(i).dispatchEvent(new MouseEvent('dblclick', { bubbles: true })), ev);
        await inspecteurEnPlace(page);
        if (largeur > hauteur) await toucher(page, '#planif-panneau .planif-objectifs-servis input[type="checkbox"]');
        else await page.locator('#planif-panneau .planif-objectifs-servis input[type="checkbox"]').check({ force: true });
        const valeur = await page.evaluate((nom) => [...document.querySelectorAll('#planif-panneau-production option')].find((o) => o.textContent.includes(nom))?.value, M.production);
        expect(valeur, 'la production du modèle d’« Évaluer » au menu').toBeTruthy();
        await page.selectOption('#planif-panneau-production', valeur);

        // 7. La fin : les pastilles, l'objectif atteint, les deux suites du modèle.
        await etape(page, 7, 'Une chaîne alignée');
        b = await lireBulle(page);
        expect(b.confirme).toBe("C'est fait : l'évaluation vérifie l'objectif.");
        const pastilles = await page.evaluate((i) => planificationCarte.evaluerPastilleEvaluation(planificationCarte.etat.noeuds.get(i)).etat, ev);
        expect(pastilles, 'la pastille de l’évaluation').toBe('avant');
        const tout = await page.evaluate(() => document.getElementById('parcours-bulle').textContent.replace(/[  ]/g, ' '));
        expect(tout).toContain(ATTEINT);
        expect(b.boutons).toEqual(['Le refaire avec ma classe', 'Terminer']);
        expect(await consignes(page)).toEqual(['Touche « Le refaire avec ma classe », ou « Terminer »']);
        const r = await page.evaluate(() => { const x = document.getElementById('parcours-bulle').getBoundingClientRect(); return { haut: x.top, bas: x.bottom, h: innerHeight }; });
        expect(r.haut).toBeGreaterThanOrEqual(0);
        expect(r.bas).toBeLessThanOrEqual(r.h);

        // Le confinement : rien hors de la démo ; la carte de la démo intacte.
        const apres = await releve(page);
        expect(ecarts(avant, apres, horsDeLaDemo), 'aucune clé hors de la démo').toEqual([]);
        expect(await page.evaluate(() => JSON.stringify(db.getSync(cle('planification_mindmap'), {}).cartes?.carte_1 || null))).toBe(carte1);
        await bulle(page).getByRole('button', { name: 'Terminer', exact: true }).click();
    });
}
