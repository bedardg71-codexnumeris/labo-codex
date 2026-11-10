import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, ouvrirPanneau, attendreEtape, contourSur, bulleNeCouvrePas, capture, bulle, mettreLaClasseEnPlace } from './harness/classe-de-banc.js';
import { leParcoursEntier, dossierDesCaptures } from './harness/parcours-3-de-banc.js';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// LE CINQUIÈME PARCOURS, « MONTER TON COURS » (9 NOVEMBRE 2026)
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-5-monter-ton-cours.md. Ce banc juge, en faisant les gestes, depuis
// un espace où le troisième parcours est fait (harness/parcours-3-de-banc.js) :
//   · le panneau : cinquième entrée, après « Recevoir… » ; sans production, le bouton ne lance rien et la phrase validée
//     le dit ; à faire, en cours (« Étape 4 sur 7 »), fait ;
//   · les sept étapes sur la carte d'alignement : la compétence, l'idée maîtresse reliée (« se décline en »), la leçon
//     datée et reliée (« se concrétise dans »), l'objectif (la pastille « ! » paraît au départ du champ, question 13),
//     l'activité glissée par sa poignée ⠿ qui sert l'objectif, l'évaluation posée AU-DESSUS de l'activité (la variante
//     ⚠), puis glissée dessous (✓), avec la production du troisième parcours ; « Plus tard », un rechargement et
//     « Reprendre » à l'étape 4 ; la bulle 7 au centre, « Terminer » ;
//   · la zone tactile de 44 px des cercles d'attache sous `pointer: coarse` (question 10), absente à la souris.
// ⚠ Les gestes sur la carte se font à la souris, aux coordonnées : `click`, `dblclick` et `check` de Playwright font
// défiler le conteneur de la carte (`overflow: hidden`) pour atteindre leur cible (mesuré : 4 886 × 3 000 px après un
// `dblclick` sur une poignée), et la carte ne lit plus ses coordonnées. Une personne ne fait pas ce défilement.
// Les blocs neufs se posent à côté du dernier bloc posé, sans le recouvrir, dans la partie visible du canevas (décision du
// 9 nov., 16 h 03, corrigée à la source) : le banc ne les déplace pas, et tire ses traits tels quels.
// Les captures pour Grégoire : CAPTURES_PARCOURS=<dossier>.
// ⚠ Cloud du 9 nov. : Chromium seulement (playwright.chromium.config.js) ; le verdict WebKit se prend sur le Mac.

const DOSSIER = process.env.CAPTURES_PARCOURS || '';
const TOTAL = 7;
const n = (page, k, titre, opts) => attendreEtape(page, k, TOTAL, titre, opts);
const item = (page) => page.locator('#panneau-assistance [data-parcours="monter"]');
const REFUS = 'Commence par « Évaluer une première production » : il te faut une production pour la placer dans ta carte.';
const LIGNE = 'De la compétence à ta production : un outil facultatif qui garde pour toi les liens entre ce que tu enseignes et ce que tu évalues.';

/** Le rappel « Mets ton codex à jour », s'il s'ouvre entre deux parcours (pas pendant) : « Plus tard ». */
async function fermerLeRappel(page) {
    await page.evaluate(() => {
        if (window.backupReminder) window.backupReminder.reporterApresMiseAJourDuCodex();
        const o = document.querySelector('#overlay-backup-reminder.actif');
        const b = o && [...o.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Plus tard');
        if (b) b.click();
    });
}

// ---------- Les gestes sur la carte, à la souris ----------

const rect = (page, sel) => page.evaluate((s) => {
    const e = document.querySelector(s);
    if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2, l: b.left, t: b.top, w: b.width, h: b.height };
}, sel);
const noeud = (id) => `[id="${id}"]`;
const prise = (id) => `[id="${id}"] .planif-noeud-prise`;
const port = (id, dir) => `[id="${id}"] > .planif-noeud-port[data-dir="${dir}"]`;
const ids = (page, type) => page.evaluate((t) => [...planificationCarte.etat.noeuds.values()].filter((x) => x.type === t).map((x) => x.id), type);

async function toucher(page, sel) {
    const r = await rect(page, sel);
    expect(r, sel).not.toBeNull();
    await page.mouse.click(r.x, r.y);
}

async function glisser(page, de, vers) {
    await page.mouse.move(de.x, de.y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) await page.mouse.move(de.x + (vers.x - de.x) * i / 12, de.y + (vers.y - de.y) * i / 12);
    await page.mouse.up();
}

/** Un point du canevas où rien ne se trouve : y toucher fait quitter le champ en cours, comme une personne le fait. */
async function pointVide(page) {
    return page.evaluate(() => {
        const z = document.getElementById('planif-zone-travail').getBoundingClientRect();
        for (let y = z.bottom - 30; y > z.top + 40; y -= 40) {
            for (let x = z.left + 260; x < z.right - 40; x += 40) {
                const e = document.elementFromPoint(x, y);
                if (e && e.closest('#planif-zone-travail') && !e.closest('.planif-noeud, .planif-palette-flottante, #planif-palette, #planif-palette-nav, .planif-lien-groupe')) return { x, y };
            }
        }
        return null;
    });
}

async function quitterLeChamp(page) {
    const p = await pointVide(page);
    expect(p, 'un point vide du canevas').not.toBeNull();
    await page.mouse.click(p.x, p.y);
}

/** « Touche « <type> » dans la palette », puis écris son titre : le bloc naît au centre, son titre à l'écriture. */
/**
 * Deux passages de la sonde du moteur : le voile reçoit une marque, et chaque passage la remplace (`sonder` dessine le
 * voile, puis lit l'état atteint, d'un seul tenant). Une condition observable, pas un délai : après elle, une étape qui
 * devait avancer l'a fait.
 */
async function deuxSondes(page) {
    for (let k = 0; k < 2; k++) {
        await page.evaluate(() => document.querySelector('#parcours-voile path').setAttribute('d', 'M0,0'));
        await page.waitForFunction(() => document.querySelector('#parcours-voile path').getAttribute('d') !== 'M0,0');
    }
}
const rangActuel = (page) => page.evaluate(() => ParcoursMoteur.etapeCourante());

/**
 * Une saisie lente (`lent`), comme une personne : l'étape n'avance pas tant qu'on écrit (relecture neuve du 9 nov. : elle
 * avançait dès la première lettre, et la bulle prenait le focus). Elle avance quand on quitte le champ.
 */
async function ecrireLentement(page, texte, champ) {
    const rang = await rangActuel(page);
    await page.keyboard.type(texte, { delay: 120 });
    await deuxSondes(page);
    expect(await rangActuel(page), 'l’étape attend qu’on quitte le champ').toBe(rang);
    expect(await page.evaluate((s) => document.activeElement && document.activeElement.matches(s), champ), 'le focus reste au champ').toBe(true);
    expect((await page.locator(`${champ}:focus`).textContent()).trim()).toBe(texte);
}

async function creer(page, type, titre, { lent = false } = {}) {
    const avant = await ids(page, type);
    await toucher(page, `#planif-palette .planif-palette-btn[data-type="${type}"]`);
    await expect(page.locator('.planif-noeud-titre:focus')).toHaveCount(1);
    if (lent) await ecrireLentement(page, titre, '.planif-noeud-titre');
    else await page.keyboard.type(titre);
    await quitterLeChamp(page);
    const id = (await ids(page, type)).find((x) => !avant.includes(x));
    expect(id, 'le bloc ' + type).toBeTruthy();
    return id;
}

/** Le cercle de la source tourné vers la cible (les blocs neufs se posent à côté du dernier : à droite ou dessous). */
async function coteVers(page, sourceId, cibleId) {
    const a = await rect(page, noeud(sourceId)), b = await rect(page, noeud(cibleId));
    const dx = b.x - a.x, dy = b.y - a.y;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'droite' : 'gauche') : (dy > 0 ? 'bas' : 'haut');
}

/** Un trait tiré du cercle de la source tourné vers la cible, jusqu'à son titre ; rien n'est déplacé avant. */
async function relier(page, sourceId, cibleId) {
    const dir = await coteVers(page, sourceId, cibleId);
    await glisser(page, await rect(page, port(sourceId, dir)), await rect(page, `${noeud(cibleId)} .planif-noeud-titre`));
}

/**
 * Les blocs posés depuis la palette ne se recouvrent pas et tiennent dans la partie visible du canevas, entre les
 * palettes « Nœuds » et « Planificateur » (décision du 9 nov., 16 h 03 : corriger la source).
 */
async function blocsBienPoses(page, ids) {
    const r = await page.evaluate((liste) => {
        const z = document.getElementById('planif-zone-travail').getBoundingClientRect();
        let g = Math.max(z.left, 0), d = Math.min(z.right, innerWidth);
        for (const id of ['planif-palette', 'planif-palette-nav']) {
            const p = document.getElementById(id);
            if (!p || !p.offsetParent) continue;
            const q = p.getBoundingClientRect();
            if (q.right <= (g + d) / 2) g = Math.max(g, q.right); else if (q.left >= (g + d) / 2) d = Math.min(d, q.left);
        }
        const h = Math.max(z.top, 0), b = Math.min(z.bottom, innerHeight);
        const rs = liste.map((id) => document.getElementById(id).getBoundingClientRect());
        const dedans = rs.every((x) => x.left >= g - 1 && x.right <= d + 1 && x.top >= h - 1 && x.bottom <= b + 1);
        const recouvrements = rs.flatMap((a, i) => rs.slice(i + 1).filter((c) => a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom)).length;
        return { dedans, recouvrements };
    }, ids);
    expect(r, 'les blocs neufs : dans la partie visible, sans se recouvrir').toEqual({ dedans: true, recouvrements: 0 });
}

/** La bulle se replace à chaque passage de la sonde (120 ms) : un bloc neuf est dégagé un instant après sa naissance. */
async function degage(page, sel) {
    await expect.poll(() => page.evaluate((s) => {
        const a = document.querySelector(s).getBoundingClientRect(), b = document.getElementById('parcours-bulle').getBoundingClientRect();
        return a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top;
    }, sel), { message: 'la bulle laisse libre ' + sel }).toBe(true);
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

/** « Touche deux fois cette poignée » : deux appuis, comme un double toucher à la souris. */
async function deuxFois(page, sel) {
    const r = await rect(page, sel);
    await page.mouse.click(r.x, r.y, { clickCount: 2 });
}

/** Le menu de l'en-tête d'une leçon (semaine, séance) : sa liste se peuple au premier contact. */
async function choisirDansEntete(page, sel, valeur) {
    await page.focus(sel);
    await page.selectOption(sel, valeur);
}

const pastilleEvaluation = (page, id) => page.evaluate((i) => planificationCarte.evaluerPastilleEvaluation(planificationCarte.etat.noeuds.get(i)).etat, id);
const texteBulle = (page) => bulle(page).locator('.parcours-bulle-texte');

/** Un espace où le troisième parcours est fait ; sa production sera placée dans la carte. */
async function espaceDuTroisiemeParcours(page) {
    dossierDesCaptures('');
    await leParcoursEntier(page, { niveaux: true, cap: 'p3' });
    await page.keyboard.press('Escape');
    return page.evaluate(() => ParcoursEvaluer.contexte().productionId);
}

test('« Monter ton cours » : les sept étapes, la variante ⚠, « Plus tard » et « Reprendre » à l’étape 4 (1180 px)', async ({ page }) => {
    test.setTimeout(360000);
    const cap = '1180-sombre';
    const pid = await espaceDuTroisiemeParcours(page);
    dossierDesCaptures(DOSSIER);
    await fermerLeRappel(page);

    // Le panneau : cinquième entrée, après « Recevoir… » ; à faire.
    await ouvrirPanneau(page);
    const ordre = await page.locator('#panneau-assistance .assistance-parcours-item').evaluateAll((els) => els.map((e) => e.dataset.parcours));
    expect(ordre.slice(0, 5)).toEqual(['decouvrir', 'classe', 'evaluer', 'recevoir', 'monter']);
    await expect(item(page).locator('.assistance-parcours-titre')).toHaveText('Monter ton cours');
    await expect(item(page).locator('.assistance-parcours-ligne')).toHaveText(LIGNE);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('À faire');
    await expect(item(page).locator('.assistance-parcours-bouton')).toHaveText('Commencer');
    await capture(page, DOSSIER, `panneau-${cap}-a-faire`);
    await item(page).locator('.assistance-parcours-bouton').click();

    // 1. La compétence : Conception › Alignement, contour sur « Compétence ».
    await n(page, 1, 'Ta compétence');
    await expect(page.locator('#conception-carte')).toBeVisible();
    await contourSur(page, '#planif-palette .planif-palette-btn[data-type="competence"]');
    await bulleNeCouvrePas(page, '#planif-palette .planif-palette-btn[data-type="competence"]', 'étape 1');
    // Les cercles d'attache n'ont pas de zone élargie à la souris (question 10 : `pointer: coarse` seulement).
    await capture(page, DOSSIER, `p5-1-${cap}`);
    const comp = await creer(page, 'competence', 'Analyser des textes littéraires', { lent: true });
    expect(await page.evaluate((s) => getComputedStyle(document.querySelector(s), '::before').content, port(comp, 'droite'))).toBe('none');

    // 2. L'idée maîtresse, puis le trait depuis un cercle de la compétence (« se décline en »).
    await n(page, 2, 'Ton idée maîtresse', { focus: false });
    await contourSur(page, '#planif-palette .planif-palette-btn[data-type="idee-maitresse"]');
    await capture(page, DOSSIER, `p5-2-${cap}`);
    const idee = await creer(page, 'idee-maitresse', 'Le texte comme système');
    // Le bloc neuf : la bulle le laisse libre (mesuré avant : elle couvrait sa poignée) ; contours sur les cercles.
    await degage(page, noeud(idee));
    await contourSur(page, port(comp, 'droite'), 'parcours-contour-extra-0');
    await contourSur(page, port(comp, 'bas'), 'parcours-contour-extra-2');
    await capture(page, DOSSIER, `p5-2-cercles-${cap}`);
    await blocsBienPoses(page, [comp, idee]);   // à côté de la compétence, sans rien déplacer
    await deuxSondes(page);
    expect(await rangActuel(page)).toBe(1);   // pas de lien encore
    await relier(page, comp, idee);

    // 3. La leçon : son titre, sa semaine, sa séance, puis le trait depuis l'idée maîtresse (« se concrétise dans »).
    await n(page, 3, 'Ta leçon', { focus: false });
    expect(await page.evaluate(() => [...planificationCarte.etat.liens.values()].map((l) => l.type))).toEqual(['se_decline_en']);
    await contourSur(page, '#planif-palette .planif-palette-btn[data-type="lecon"]');
    await capture(page, DOSSIER, `p5-3-${cap}`);
    const lecon = await creer(page, 'lecon', 'Lire un incipit');
    await degage(page, prise(lecon));
    await blocsBienPoses(page, [comp, idee, lecon]);
    await contourSur(page, `${noeud(lecon)} .planif-noeud-semaine`, 'parcours-contour-extra-0');
    await contourSur(page, `${noeud(lecon)} .planif-noeud-seance`, 'parcours-contour-extra-1');
    await capture(page, DOSSIER, `p5-3-entete-${cap}`);
    await bulleNeCouvrePas(page, `${noeud(lecon)} .planif-noeud-seance`, 'étape 3, l’en-tête de la leçon');
    await choisirDansEntete(page, `${noeud(lecon)} .planif-noeud-semaine`, '2');
    await choisirDansEntete(page, `${noeud(lecon)} .planif-noeud-seance`, '1');
    const versLaLecon = await coteVers(page, idee, lecon);
    await contourSur(page, port(idee, versLaLecon), 'parcours-contour-extra-' + ['droite', 'gauche', 'bas', 'haut'].indexOf(versLaLecon));
    await deuxSondes(page);
    expect(await rangActuel(page)).toBe(2);   // datée, pas encore reliée
    await bulleNeCouvrePas(page, port(idee, versLaLecon), 'étape 3, le cercle de l’idée maîtresse');
    await bulleNeCouvrePas(page, `${noeud(lecon)} .planif-noeud-titre`, 'étape 3, le titre de la leçon');
    await relier(page, idee, lecon);

    // 4. L'objectif : le badge 🎯 ; « Plus tard », un rechargement, « Reprendre ».
    await n(page, 4, 'Ton objectif', { focus: false });
    expect(await page.evaluate(() => [...planificationCarte.etat.liens.values()].map((l) => l.type))).toEqual(['se_decline_en', 'se_concretise_dans']);
    expect(await page.evaluate(() => ParcoursCours.contexte().leconId)).toBe(lecon);
    await contourSur(page, `${noeud(lecon)} .planif-badge-objectif`);
    await capture(page, DOSSIER, `p5-4-${cap}`);
    await bulle(page).getByRole('button', { name: 'Plus tard' }).click();
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('monter'))).toEqual({ etat: 'en-cours', etape: 3 });
    await page.reload();
    await attendreApplication(page);
    await expect(bulle(page)).toHaveCount(0);   // rien ne se rouvre de lui-même
    await fermerLeRappel(page);
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('Étape 4 sur 7');
    await expect(item(page).locator('.assistance-parcours-bouton')).toHaveText('Reprendre');
    await capture(page, DOSSIER, `panneau-${cap}-en-cours`);
    await item(page).locator('.assistance-parcours-bouton').click();
    await n(page, 4, 'Ton objectif');
    await contourSur(page, `${noeud(lecon)} .planif-badge-objectif`);
    await toucher(page, `${noeud(lecon)} .planif-badge-objectif`);
    await toucher(page, `${noeud(lecon)} .planif-noeud-objectif[data-premiere]`);
    await ecrireLentement(page, 'Sera en mesure de repérer les procédés d’un incipit', '.planif-noeud-objectif');
    // Question 13 : la pastille « ! » paraît en quittant le champ, sans Entrée. Lu AUSSITÔT, sans attendre : une
    // reconstruction venue d'ailleurs la ferait paraître plus tard, et le banc ne départagerait plus le correctif.
    const pastille = page.locator(`${noeud(lecon)} .planif-obj-pastille`);
    expect(await pastille.count()).toBe(0);
    await quitterLeChamp(page);
    expect(await pastille.count()).toBe(1);
    await expect(pastille).toHaveText('!');

    // 5. L'activité : glissée dans la leçon par sa poignée, deux touchers, la case de l'objectif.
    await n(page, 5, 'Ton activité', { focus: false });
    await capture(page, DOSSIER, `p5-5-${cap}`);
    await contourSur(page, '#planif-palette .planif-palette-btn[data-type="activite"]');
    const act = await creer(page, 'activite', 'Annoter un incipit');
    await degage(page, noeud(act));
    await contourSur(page, `${noeud(lecon)} > .planif-noeud-zone`);   // libre : la zone de la leçon, où le glisser
    const zone = await rect(page, `${noeud(lecon)} .planif-noeud-zone`);
    const g = await rect(page, prise(act));
    await glisser(page, g, { x: zone.x - 60, y: zone.y });
    await expect.poll(() => page.evaluate((i) => planificationCarte.etat.noeuds.get(i).parent, act)).toBe(lecon);
    await contourSur(page, prise(act), 'parcours-contour-extra-0');
    await deuxFois(page, prise(act));
    await inspecteurEnPlace(page);
    const caseServie = '#planif-panneau .planif-objectifs-servis input[type="checkbox"]';
    await contourSur(page, caseServie, 'parcours-contour-extra-0');
    await bulleNeCouvrePas(page, caseServie, 'étape 5, l’Inspecteur');
    await capture(page, DOSSIER, `p5-5-inspecteur-${cap}`);
    // La palette « Planificateur » ne couvre plus la case (l'Inspecteur passe devant, le temps du parcours).
    expect(await page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2).matches(s); }, caseServie)).toBe(true);
    await toucher(page, caseServie);

    // 6. L'évaluation, posée d'abord AU-DESSUS de l'activité : la variante ⚠ ; puis glissée dessous : ✓.
    await n(page, 6, 'Ton évaluation', { focus: false });
    await contourSur(page, '#planif-palette .planif-palette-btn[data-type="evaluation"]');
    await capture(page, DOSSIER, `p5-6-${cap}`);
    const ev = await creer(page, 'evaluation', 'Journal de lecture 1');
    await degage(page, noeud(ev));
    const haut = await rect(page, noeud(act));
    await glisser(page, await rect(page, prise(ev)), { x: haut.x - 40, y: haut.t - 12 });
    await expect.poll(() => page.evaluate((i) => planificationCarte.etat.noeuds.get(i).enfants, lecon)).toEqual([ev, act]);
    await deuxFois(page, prise(ev));
    await inspecteurEnPlace(page);
    const caseVerifiee = '#planif-panneau .planif-objectifs-servis input[type="checkbox"]';
    await contourSur(page, caseVerifiee, 'parcours-contour-extra-0');
    await contourSur(page, '#planif-panneau-production', 'parcours-contour-extra-1');
    await capture(page, DOSSIER, `p5-6-inspecteur-${cap}`);
    await toucher(page, caseVerifiee);
    // La variante : l'objectif vérifié, mais enseigné APRÈS (l'évaluation vient avant l'activité).
    await expect(texteBulle(page)).toHaveText(await page.evaluate(() => ParcoursCours.texteVariante));
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('6 sur 7');
    expect(await pastilleEvaluation(page, ev)).toBe('apres');
    await degage(page, noeud(ev));   // la variante : la bulle quitte l'Inspecteur pour laisser libre l'évaluation à glisser
    await capture(page, DOSSIER, `p5-6-variante-${cap}`);
    const bas = await rect(page, noeud(act));
    await glisser(page, await rect(page, prise(ev)), { x: bas.x - 40, y: bas.t + bas.h + 30 });
    // Sous l'activité, la pastille passe à ✓ ; sans production, l'étape attend, et la bulle revient à son texte.
    await expect.poll(() => pastilleEvaluation(page, ev)).toBe('avant');
    await deuxSondes(page);
    expect(await rangActuel(page)).toBe(5);
    await expect(texteBulle(page)).not.toHaveText(await page.evaluate(() => ParcoursCours.texteVariante));
    await page.selectOption('#planif-panneau-production', pid);

    // 7. Raffiner : la bulle au centre, sans « Plus tard », « Terminer ».
    await n(page, 7, 'Raffiner, si tu veux', { focus: false });
    expect(await page.evaluate((i) => planificationCarte.etat.noeuds.get(i).enfants, lecon)).toEqual([act, ev]);
    expect(await pastilleEvaluation(page, ev)).toBe('avant');
    expect(await page.evaluate((i) => planificationCarte.etat.noeuds.get(i).metadata.productionId, ev)).toBe(pid);
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
    await capture(page, DOSSIER, `p5-7-${cap}`);
    await bulle(page).getByRole('button', { name: 'Terminer' }).click();
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('monter').etat)).toBe('fait');
    expect(await page.evaluate(() => document.body.classList.contains('parcours-inspecteur-devant'))).toBe(false);
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('Fait');
    await expect(item(page).locator('.assistance-parcours-bouton')).toHaveText('Refaire');
    await capture(page, DOSSIER, `panneau-${cap}-fait`);

    // « Refaire » sur la carte remplie : seul ce qui est créé après compte (décision du 9 nov., 16 h 03) ; la compétence
    // déjà posée ne fait pas avancer l'étape 1. Un autre parcours lancé ferme celui-ci sans « Plus tard » : l'Inspecteur
    // ne reste pas devant (relecture neuve du 9 nov.).
    await item(page).locator('.assistance-parcours-bouton').click();
    await n(page, 1, 'Ta compétence', { focus: false });
    await deuxSondes(page);
    expect(await rangActuel(page)).toBe(0);
    await contourSur(page, '#planif-palette .planif-palette-btn[data-type="competence"]');
    expect(await page.evaluate(() => document.body.classList.contains('parcours-inspecteur-devant'))).toBe(true);
    await page.evaluate(() => Assistance.parcours().find((p) => p.id === 'decouvrir').lancer(0));
    await expect.poll(() => page.evaluate(() => document.body.classList.contains('parcours-inspecteur-devant'))).toBe(false);
    await expect(page.locator('[id^="parcours-contour-extra-"]')).toHaveCount(0);
});

test('« Monter ton cours » : sans production, le refus ; les deux pages du guide ; le panneau à 390 px', async ({ page }) => {
    test.setTimeout(180000);
    const cap = '1180-sombre';
    await ouvrirEspaceVide(page, 1180);
    await mettreLaClasseEnPlace(page);
    await fermerLeRappel(page);
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await expect(item(page).locator('.assistance-parcours-refus')).toHaveText(REFUS);
    await expect(bulle(page)).toHaveCount(0);
    await capture(page, DOSSIER, `panneau-${cap}-sans-production`);
    await page.keyboard.press('Escape');

    // Les deux pages du guide passées à l'écriture inclusive, ouvertes par la frise.
    await page.evaluate(() => naviguerVers('conception', 'carte'));
    await expect(page.locator('#planif-chaine')).toBeVisible();
    await page.locator('#planif-chaine').getByText('Idées maîtresses', { exact: true }).click();
    await expect(page.locator('#planif-guide-panel')).toContainText('ce qui restera quand l’étudiant·e aura oublié les détails');
    await capture(page, DOSSIER, `guide-idees-maitresses-${cap}`);
    await page.locator('#planif-chaine').getByText('Objectifs', { exact: true }).click();
    await expect(page.locator('#planif-guide-panel')).toContainText('ce que l’étudiant·e saura faire à la fin');
    await capture(page, DOSSIER, `guide-objectifs-${cap}`);

    // Le panneau à 390 px, avec ses cinq parcours.
    await page.setViewportSize({ width: 390, height: 844 });
    await ouvrirPanneau(page);
    await expect(item(page)).toBeVisible();
    await capture(page, DOSSIER, 'panneau-390-sombre');
});

test.describe('Les cercles d’attache au doigt (question 10)', () => {
    test.use({ hasTouch: true });
    test('sous `pointer: coarse`, chaque cercle et la poignée ⠿ portent une zone de 44 px tournée vers l’extérieur ; leur dessin ne change pas', async ({ page }) => {
        test.setTimeout(120000);
        await ouvrirEspaceVide(page, 1180);
        await mettreLaClasseEnPlace(page);
        await page.evaluate(() => naviguerVers('conception', 'carte'));
        await expect(page.locator('#planif-palette')).toBeVisible();
        expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
        await page.locator('#planif-palette .planif-palette-btn[data-type="competence"]').tap();
        await page.keyboard.type('Analyser des textes littéraires');
        const comp = (await ids(page, 'competence'))[0];
        const mesures = await page.evaluate((id) => [...document.querySelectorAll(`[id="${id}"] > .planif-noeud-port`)].map((p) => {
            const avant = getComputedStyle(p, '::before');
            const r = p.getBoundingClientRect();
            const c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            // 14 px hors du cercle, vers l'extérieur du bloc : encore le cercle.
            const d = { droite: [14, 0], gauche: [-14, 0], bas: [0, 14], haut: [0, -14] }[p.dataset.dir];
            const sous = document.elementFromPoint(c.x + d[0], c.y + d[1]);
            return { dir: p.dataset.dir, dessin: Math.round(r.width), zone: [avant.width, avant.height], dehors: sous === p };
        }), comp);
        expect(mesures).toEqual(['droite', 'gauche', 'bas', 'haut'].map((dir) => ({ dir, dessin: 12, zone: ['44px', '44px'], dehors: true })));
        // La poignée ⠿ avait déjà la sienne (16 août).
        // La poignée ⠿ : sa zone (16 août) gagne, au doigt, 12 px vers l'extérieur du bloc, au-dessus de son bord, sans
        // rien perdre à droite. Un toucher à 4 px au-dessus du bord du bloc, à l'aplomb de la poignée, la vise.
        const prise = await page.evaluate((id) => {
            const g = document.querySelector(`[id="${id}"] .planif-noeud-prise`);
            const a = getComputedStyle(g, '::after');
            const r = g.getBoundingClientRect(), b = document.getElementById(id).getBoundingClientRect();
            // Groupe 3 (9 nov.) : la zone s'arrête avant le sélecteur de type, qui la suit à droite.
            const sel = document.getElementById(id).querySelector('.planif-noeud-type-select');
            return { zone: [parseFloat(a.width), parseFloat(a.height)], dehors: document.elementFromPoint(r.left + r.width / 2, b.top - 4) === g,
                deborde: sel ? r.right - parseFloat(a.right) - sel.getBoundingClientRect().left : 0 };
        }, comp);
        expect(Math.min(...prise.zone)).toBeGreaterThanOrEqual(44);
        expect(prise.deborde, 'la zone de la poignée n\'empiète pas sur le sélecteur de type').toBeLessThanOrEqual(0.5);
        expect(prise.dehors).toBe(true);
    });
});
