import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import {
    ouvrirEspaceVide, ouvrirPanneau, boutonModele, bulle, carte, enDemo, contourSur, gesteDesigne,
    releve, ecarts, horsDeLaDemo, DE_LA_DEMO, peuplerUnTrimestreReel, faireLaModelisation, lireBulle
} from './harness/deux-temps-de-banc.js';
import { etiqueter } from './harness/classe-de-banc.js';
import { flecheVers, flecheVisant } from './harness/fleches-de-banc.js';
import { faireLeModeleDEvaluer, voirLeParcoursPuisJeRegarde } from './harness/recevoir-modele-de-banc.js';

// =======================================================================
// LOT « JE REGARDE » D'« ÉVALUER UNE PREMIÈRE PRODUCTION » (18 NOVEMBRE 2026)
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-18-je-regarde-evaluer.md. Lancé sous le Chromium du nuage (le verdict WebKit
// viendra à la fusion, sur le Mac), aux deux orientations de l'iPad. Remplace le banc B de
// `deux-temps-modeles-2026-11-13.spec.js` (l'ancien ordre, à neuf étapes).
//   B · le modèle de bout en bout, dans l'ordre du 15 nov. : chaque bulle, ses formes, sa consigne, ce qu'elle désigne ;
//       l'étiquetage une étiquette à la fois, ses confirmations, « Voir la suite de l'exemple » ; la grille jugée par
//       niveaux sans échelle neuve ; ce que le modèle produit (ce que lit le modèle de « Recevoir ») ; le confinement ;
//       la remise à neuf.
//   C · l'étiquetage fini à la main (« Plausibilité » et « Nuance ») : « Créer ma grille » n'arrive qu'à la fin.
// Les textes sont lus dans `ParcoursEvaluer.textes` ; la sentinelle Vitest les confronte à la section D de la consigne.

const ORIENTATIONS = [[820, 1180], [1180, 820]];
const aPlat = (x) => String(x).replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim();
const texteDe = (page, sel) => page.evaluate((s) => [...document.querySelectorAll('#parcours-bulle ' + s)].map((e) => e.textContent), sel).then((l) => l.map(aPlat));

async function consignes(page, attendues, contexte) {
    await expect.poll(async () => (await lireBulle(page)).consignes.map(aPlat), { message: contexte + ' : les consignes', timeout: 10000 })
        .toEqual(attendues.map(aPlat));
}
async function confirme(page, attendu, contexte) {
    // Depuis le 18 nov. 2026, la confirmation a sa place au-dessus du titre, vide et cachée quand l'étape n'en a pas.
    await expect.poll(() => texteDe(page, '.parcours-bulle-confirme').then((l) => l.filter(Boolean)), { message: contexte + ' : la confirmation', timeout: 10000 })
        .toEqual(attendu ? [aPlat(attendu)] : []);
}
async function lieu(page, section, onglet, suite, contexte) {
    const dit = 'Tu es dans « ' + section + ' », à l\'onglet « ' + onglet + ' » ' + suite;
    await expect.poll(() => texteDe(page, '.parcours-bulle-lieu'), { message: contexte + ' : le lieu', timeout: 10000 }).toEqual([aPlat(dit)]);
}
async function lignesContiennent(page, textes, contexte) {
    // La bulle se récrit au passage suivant de la sonde : relue jusqu'à ce qu'elle dise tout.
    for (const t of textes) {
        await expect.poll(() => texteDe(page, '.parcours-bulle-ligne-texte, .parcours-bulle-note'), { message: contexte, timeout: 10000 }).toContain(aPlat(t));
    }
}
/** Les lignes faites (grisées d'un crochet). */
const faites = (page) => lireBulle(page).then((b) => b.faites.map(aPlat));

const ceQuiEstCree = (page, nom) => page.evaluate((n) => {
    const lire = (k) => db.getSync(k, []) || [];
    const g = lire('demo_grillesTemplates').find((x) => x.nom === n);
    const p = g ? lire('demo_productions').find((x) => x.grilleId === g.id) : null;
    return {
        grille: g ? g.criteres.map((c) => [c.nom, c.type, c.ponderation]) : null,
        production: p ? [p.titre, p.type, !!p.echelleId, !!p.cartoucheId] : null,
        pratiques: lire('demo_pratiquesConfigurables').filter((x) => String(x.id).indexOf('demo-') !== 0).length,
        cartouches: g ? lire('demo_cartouches_' + g.id).length : 0,
        evaluations: p ? lire('demo_evaluationsSauvegardees').filter((e) => e.productionId === p.id).length : 0
    };
}, nom);

/** Le jugement de chaque bulle, appelé par le harnais à l'arrivée de chaque étape et entre ses formes. */
function juge(page, t, m, { rangeesAMain }) {
    return async (n) => {
        const ctx = 'étape ' + n;
        switch (n) {
        case 1:
            expect(await enDemo(page)).toBe(true);
            await expect(bulle(page).locator('.parcours-bulle-objectif').first()).toHaveText(new RegExp(aPlat(t.objectif).slice(0, 40).replace(/[()]/g, '.')));
            await lieu(page, 'Conception', 'Pratiques', t.etape1.lieuSuite, ctx);
            await lignesContiennent(page, [t.etape1.phrase].concat(t.etape1.lignes), ctx);
            await consignes(page, t.etape1.consignes, ctx);
            await expect(bulle(page).locator('.parcours-bulle-aide')).toHaveText(/déplacer cette bulle par sa poignée/);
            // 20 nov. 2026 (A1, A2) : au-dessus du titre, la ligne du parcours, puis la phrase de la poignée.
            await expect(bulle(page).locator('.parcours-bulle-identite')).toHaveText(/^Parcours 3 · Évaluer une première production · Je regarde$/);
            expect(await bulle(page).evaluate((b) => [...b.children].filter((e) => !e.hidden).slice(0, 3).map((e) => e.className.split(' ')[0])),
                'la ligne du parcours, la poignée, puis le titre').toEqual(['parcours-bulle-identite', 'parcours-bulle-aide', 'parcours-bulle-tete']);
            await gesteDesigne(page, '#conception-pratiques-notation [data-action="creerNouvellePratique"]', ctx);
            break;
        case 1.5:
            // L'assistant ouvert : la bulle devient la suivante ; l'objectif et le lieu partent.
            await confirme(page, t.etape1.devient.confirme, ctx);
            await consignes(page, t.etape1.devient.consignes, ctx);
            await expect(bulle(page).locator('.parcours-bulle-objectif')).toHaveCount(0);
            await expect(bulle(page).locator('.parcours-bulle-lieu')).toHaveCount(0);
            // 20 nov. 2026 : l'entrée (la ligne du parcours, la poignée) part avec l'objectif. Restée dans cette forme, elle
            // grandissait la bulle, qui couvrait « Partir d'un modèle » à 1180 × 820 (mesuré : la bulle de 276 à 771 px
            // de haut, le bouton radio à 278 px ; le geste du banc tombait sur la bulle).
            await expect(bulle(page).locator('.parcours-bulle-identite')).toBeHidden();
            await expect(bulle(page).locator('.parcours-bulle-aide')).toBeHidden();
            expect(await page.evaluate(() => {
                const b = document.getElementById('parcours-bulle').getBoundingClientRect();
                const r = document.querySelector('#modalWizardPratiqueV2 input[name="porteEntree"][value="modele"]').getBoundingClientRect();
                return !(r.right <= b.left || b.right <= r.left || r.bottom <= b.top || b.bottom <= r.top);
            }), 'la bulle ne couvre pas le choix « Partir d’un modèle »').toBe(false);
            await contourSur(page, '#modalWizardPratiqueV2 .wizard-v2-radio-card:has(input[name="porteEntree"][value="modele"])');
            break;
        case 2:
            await confirme(page, t.etape2.confirme, ctx);
            await lignesContiennent(page, t.etape2.lignes, ctx);
            await consignes(page, t.etape2.consignes, ctx);
            await contourSur(page, `#modalWizardPratiqueV2 .wizard-v2-radio-card:has(input[name="modeleChoisi"][value="${m.pratique.id}"])`);
            break;
        case 2.5:
            await confirme(page, '', ctx);
            await lignesContiennent(page, t.etape2.devient.lignes, ctx);
            await consignes(page, t.etape2.devient.consignes, ctx);
            await contourSur(page, '#wizard-v2-btn-creer');
            await expect(page.locator('#modalWizardPratiqueV2')).toContainText('PAN – Standards');
            break;
        case 3:
            await confirme(page, t.etape3.confirme, ctx);
            await consignes(page, t.etape3.consignes, ctx);
            await expect(page.locator('#ui-dialogue-question')).toBeVisible();
            {
                const k = await page.evaluate((nom) => [...document.querySelectorAll('#overlay-ui-dialogue .ui-dialogue-choix-ligne')].findIndex((l) => l.textContent.includes(nom)), m.echelle);
                expect(k).toBeGreaterThanOrEqual(0);
                await contourSur(page, `#overlay-ui-dialogue .ui-dialogue-choix-ligne:nth-child(${k + 1})`);
            }
            break;
        case 4:
            await confirme(page, t.etape4.confirme, ctx);
            await lignesContiennent(page, [t.etape4.phrase].concat(t.etape4.lignes), ctx);
            await consignes(page, t.etape4.consignes, ctx);
            // L'étape s'ouvre en haut de l'onglet : la personne choisit la pratique, puis défile.
            expect(await page.evaluate(() => window.scrollY)).toBe(0);
            await gesteDesigne(page, '#menuPratiques', ctx);
            break;
        case 5:
            await confirme(page, t.etape5.confirme, ctx);
            await lieu(page, 'Conception', 'Mon matériel', t.etape5.lieuSuite, ctx);
            await lignesContiennent(page, t.etape5.lignes, ctx);
            await consignes(page, t.etape5.consignes, ctx);
            expect((await lireBulle(page)).boutons).toEqual(['Remplir']);
            // Disparues avec l'ancien ordre : les deux bulles d'ouverture.
            await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(t.etape5.titre);
            break;
        case 5.1: {
            // « Structure », une étiquette à la fois, chaque geste confirmé ; la ligne faite se grise d'un crochet.
            await confirme(page, '', ctx);
            await lignesContiennent(page, t.etape5.etiqueter.lignes, ctx);
            expect(await page.locator('#materiel-dissection [data-action="materielDissection.creer"]').count(), '« Créer ma grille » n\'arrive pas avant les étiquettes').toBe(0);
            const morceaux = [m.grille.nom, m.grille.criteres[0][0], m.grille.criteres[0][1], m.grille.criteres[0][2]];
            const types = ['titre', 'critere', 'description', 'ponderation'];
            for (let k = 0; k < 4; k++) {
                await consignes(page, t.etape5.etiqueter.gestes.slice(0, k).map((g) => g[0]).concat([t.etape5.etiqueter.gestes[k][0]]), ctx + ', geste ' + (k + 1));
                await contourSur(page, `#dissection-palette .dissection-etiquette[data-type="${types[k]}"]`);
                await etiqueter(page, types[k], [morceaux[k].replace(/\u00a0/g, ' ')]);
                // Le dernier geste change la bulle (la rangée est faite) : sa confirmation ouvre la suivante.
                if (k < 3) await expect.poll(() => faites(page), { message: ctx + ', geste ' + (k + 1) + ' fait' }).toContain(aPlat(t.etape5.etiqueter.gestes[k][0]));
                await expect.poll(() => texteDe(page, '.parcours-bulle-ligne-texte'), { message: ctx + ', confirmation ' + (k + 1) }).toContain(aPlat(t.etape5.etiqueter.gestes[k][1]));
                // Le 15 nov., la grille se créait après un seul critère : « Créer ma grille » reste retenu.
                const creer = page.locator('#materiel-dissection [data-action="materielDissection.creer"]');
                if (await creer.count()) await expect(creer).toBeDisabled();
            }
            // C1 (20 nov. 2026) : pendant l'étiquetage du modèle, les flèches que la page trace de la légende vers les
            // parties étiquetées sont masquées ; il ne reste que la flèche du geste en cours, celle de la bulle. La
            // légende, elle, reste : c'est là qu'on prend l'étiquette.
            expect(await page.evaluate(() => ({
                marque: document.body.classList.contains('parcours-etiquetage-du-modele'),
                flechesDeLaPage: getComputedStyle(document.getElementById('dissection-fleches')).display,
                legende: getComputedStyle(document.getElementById('dissection-legende')).display !== 'none',
                traits: document.querySelectorAll('#dissection-traits > *').length
            })), ctx + ' : les flèches de la page sont masquées pendant l’étiquetage du modèle').toMatchObject({ marque: true, flechesDeLaPage: 'none', legende: true });
            // « Rigueur », seule : la bulle devient la suivante ; ses confirmations, à mesure.
            await consignes(page, t.etape5.rigueur.consignes, ctx + ', Rigueur');
            await lignesContiennent(page, t.etape5.rigueur.lignes, ctx);
            await etiqueter(page, 'critere', [m.grille.criteres[1][0]]);
            await lignesContiennent(page, [t.etape5.rigueur.confirmations[0]], ctx + ', Rigueur critère');
            break;
        }
        case 5.5:
            await consignes(page, t.etape5.suite.consignes, ctx);
            await lignesContiennent(page, t.etape5.suite.lignes, ctx);
            expect((await lireBulle(page)).boutons).toEqual(rangeesAMain ? [t.etape5.suite.bouton] : [t.etape5.suite.bouton]);
            await expect(page.locator('#materiel-dissection [data-action="materielDissection.creer"]')).toBeDisabled();
            break;
        case 5.8: {
            await consignes(page, t.etape5.lecture.consignes, ctx);
            await lignesContiennent(page, t.etape5.lecture.lignes, ctx);
            await gesteDesigne(page, '#materiel-dissection [data-action="materielDissection.creer"]', ctx);
            // C1 (20 nov. 2026) : avant « Créer ma grille », l'étiquetage du modèle est fini ; les flèches de la page
            // reviennent, et la bulle a une flèche vers chaque chose qu'elle nomme (la grille refaite, son résumé, ce
            // qu'elle dit des niveaux).
            expect(await page.evaluate(() => document.body.classList.contains('parcours-etiquetage-du-modele')), ctx + ' : la marque de l’étiquetage est retirée').toBe(false);
            for (const cible of ['#dissection-comprise', '#dissection-constats', '#dissection-logique']) await flecheVisant(page, cible, ctx + ', ce que la bulle nomme');
            // La lecture tient la grille pour jugée par niveaux : ni « Ce que vaut chaque niveau », ni choix des points.
            // Break-test (18 nov. 2026) : `tenuePourNiveaux` rendant false (js/materiel-dissection.js) → ROUGE ici (« une
            // grille en points »). Rétabli → vert.
            await expect(page.locator('#dissection-logique')).toContainText('grille en niveaux');
            await expect(page.locator('#dissection-creer-niveaux')).toHaveCount(0);
            await expect(page.locator('#dissection-creer-choix')).toHaveCount(0);
            await expect(page.locator('#dissection-comprise')).not.toContainText('Réponses possibles');
            await expect(page.locator('#dissection-constats')).toContainText('4 critères');
            break;
        }
        case 6:
            await confirme(page, t.etape6.confirme, ctx);
            await lieu(page, 'Conception', 'Cartouches', t.etape6.lieuSuite, ctx);
            await consignes(page, t.etape6.consignes, ctx);
            await gesteDesigne(page, '#conception-retroactions [data-action="creerNouvelleCartouche"]', ctx);
            break;
        case 6.2:
            await confirme(page, '', ctx);
            await consignes(page, t.etape6.fiche.consignes, ctx);
            break;
        case 6.5:
            await consignes(page, t.etape6.remplie.consignes, ctx);
            await lignesContiennent(page, t.etape6.remplie.lignes, ctx);
            await gesteDesigne(page, '#btnCreerCartouche', ctx);
            await expect(page.locator('#nomCartouche')).toHaveValue(m.cartouche);
            // A5 (20 nov. 2026) : ce que « Remplir » a posé est en bleu (la couleur des liens) jusqu'à la création ; un champ
            // que « Remplir » n'a pas touché garde sa couleur.
            expect(await page.evaluate(() => {
                const couleur = (e) => getComputedStyle(e).color;
                const lien = document.createElement('span');
                lien.style.color = 'var(--accent-primaire)';
                document.body.appendChild(lien);
                const bleu = couleur(lien);
                lien.remove();
                const nom = document.getElementById('nomCartouche'), cases = [...document.querySelectorAll('#cartoucheZonePrincipale textarea[id^="comm_"]')];
                const autre = document.getElementById('contexteCartouche');
                return { nom: couleur(nom) === bleu, cases: cases.length > 0 && cases.every((c) => c.classList.contains('parcours-rempli') && couleur(c) === bleu),
                    autre: !autre || (couleur(autre) !== bleu && !autre.classList.contains('parcours-rempli')) };
            }), ctx + ' : le bleu de « Remplir »').toEqual({ nom: true, cases: true, autre: true });
            break;
        case 7:
            // A5 : la cartouche créée, plus rien n'est en bleu (la marque part quand l'étape change).
            expect(await page.evaluate(() => document.querySelectorAll('.parcours-rempli').length), ctx + ' : le bleu est parti à la création').toBe(0);
            await confirme(page, t.etape7.confirme, ctx);
            await lieu(page, 'Conception', 'Productions', t.etape7.lieuSuite, ctx);
            await consignes(page, t.etape7.consignes, ctx);
            await gesteDesigne(page, '#conception-productions [data-action="creerNouvelleProduction"]', ctx);
            // C3 (20 nov. 2026) : pendant un parcours, la liste « À vérifier » de la page « Productions » est repliée
            // (son titre reste, ses lignes attendent). La pratique du modèle est par standards : la zone y est.
            expect(await page.evaluate(() => {
                const z = document.getElementById('zone-avertissements-productions'), ul = z && z.querySelector('ul');
                return !z || z.classList.contains('u-hide') ? 'absente' : (ul && getComputedStyle(ul).display === 'none' ? 'repliée' : 'dépliée');
            }), ctx + ' : « À vérifier »').not.toBe('dépliée');
            break;
        case 7.1:
            // Le menu « Type », ouvert par la personne : pas de « Remplir » avant.
            await consignes(page, [t.etape7.fiche.type[0]], ctx);
            expect((await lireBulle(page)).boutons).toEqual([]);
            await contourSur(page, '#productionType');
            break;
        case 7.2:
            await consignes(page, [t.etape7.fiche.type[0], t.etape7.fiche.consignes[0]], ctx);
            expect(await faites(page)).toContain(aPlat(t.etape7.fiche.type[0]));
            await lignesContiennent(page, [t.etape7.fiche.type[1]], ctx);
            expect((await lireBulle(page)).boutons).toEqual(['Remplir']);
            break;
        case 7.5:
            await consignes(page, t.etape7.remplie.consignes, ctx);
            await lignesContiennent(page, t.etape7.remplie.lignes, ctx);
            await gesteDesigne(page, '#btnCreerProduction', ctx);
            await expect(page.locator('#productionTitre')).toHaveValue(m.production.description);
            await expect(page.locator('#productionType')).toHaveValue(m.production.type);
            break;
        case 8:
            await confirme(page, t.etape8.confirme, ctx);
            await lignesContiennent(page, [t.etape8.phrase], ctx);
            await consignes(page, t.etape8.consignes, ctx);
            break;
        case 8.5:
            await confirme(page, '', ctx);
            await consignes(page, t.etape8.remplie.consignes, ctx);
            await lignesContiennent(page, t.etape8.remplie.lignes, ctx);
            // Cinq lignes montrent ce dont elles parlent : au-delà de trois cibles, le moteur n'en trace qu'une flèche, vers leur
            // union ; la pulsation reste sur la case.
            await contourSur(page, '.echeance-simple-ligne');
            // C4 (20 nov. 2026) : le halo de la case des consignes prend la largeur de la case, pas celle de la page.
            expect(await page.evaluate(() => document.getElementById('parcours-contour').getBoundingClientRect().width / document.documentElement.clientWidth),
                ctx + ' : le halo de « Consignes transmises » n’a pas la largeur de la page').toBeLessThan(0.5);
            // C4 : le bloc « Grille d'autoévaluation » s'ouvre à la hauteur de son contenu (les seuils de réussite et de
            // maîtrise ne sont plus sous le bord : rien ne défile dans la zone).
            expect(await page.evaluate((titre) => {
                const bloc = [...document.querySelectorAll('#champsPersonnalisesListe .champ-perso:not([data-ancre])')].find((b) => (b.querySelector('.champ-perso-titre') || {}).value === titre);
                const z = bloc && bloc.querySelector('.champ-perso-contenu');
                return z ? { cache: z.scrollHeight - z.clientHeight, lignes: z.value.split('\n').length } : null;
            }, m.production.autoevaluation.titre), ctx + ' : la zone de l’autoévaluation montre tout son contenu').toMatchObject({ cache: expect.any(Number) });
            expect(await page.evaluate((titre) => {
                const bloc = [...document.querySelectorAll('#champsPersonnalisesListe .champ-perso:not([data-ancre])')].find((b) => (b.querySelector('.champ-perso-titre') || {}).value === titre);
                const z = bloc.querySelector('.champ-perso-contenu');
                return z.scrollHeight - z.clientHeight;
            }, m.production.autoevaluation.titre), ctx + ' : rien de l’autoévaluation n’est sous le bord').toBeLessThanOrEqual(2);
            await expect(page.locator('#productionObjectif')).toHaveValue(m.production.objectif);
            await expect(page.locator('#productionTache')).toHaveValue(m.production.tache);
            await expect(page.locator('#productionDetailTache')).toHaveValue(m.production.detailTache);
            break;
        case 9:
            await confirme(page, t.etape9.confirme, ctx);
            await lieu(page, 'Évaluation', 'Liste', t.etape9.lieuSuite, ctx);
            await consignes(page, t.etape9.consignes, ctx);
            break;
        case 9.3:
            await consignes(page, t.etape9.criteres.consignes, ctx);
            await lignesContiennent(page, t.etape9.criteres.lignes, ctx);
            // La cartouche vient de la production : rien à choisir.
            await expect.poll(() => page.inputValue('#selectCartoucheEval')).not.toBe('');
            break;
        case 9.6:
            await consignes(page, t.etape9.verrou.consignes, ctx);
            await lignesContiennent(page, t.etape9.verrou.lignes, ctx);
            await contourSur(page, '#motPourEtudiant1');
            break;
        case 10:
            await confirme(page, t.etape10.confirme, ctx);
            await lieu(page, 'Suivi', 'Groupe', t.etape10.lieuSuite, ctx);
            await lignesContiennent(page, t.etape10.lignes, ctx);
            expect(await texteDe(page, '.parcours-bulle-atteint')).toEqual([aPlat(t.objectifAtteint)]);
            // 20 nov. 2026 (A3) : « Voir le parcours 4 » remplace « Voir le parcours suivant », et la bulle nomme la suite.
            await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Le refaire avec ma classe', 'Voir le parcours 4', 'Terminer']);
            await expect(bulle(page).locator('.parcours-bulle-suite-suggeree')).toHaveText(/^Suite suggérée\s: le parcours 4, «\sRecevoir les productions, rendre tes rétroactions\s»\.$/);
            // C5 (20 nov. 2026) : une flèche vers le point blanc de Yack Amical dans la bande « Performance (P) ».
            await flecheVers(page, '#section-suivi .barre-indicateur .barre-etudiant[data-da="' + m.etudiantEvalue.da + '"]', 'étape 10, le point de Yack Amical');
            expect((await lireBulle(page)).principal, 'trois boutons de même poids').toEqual([]);
            await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
            await expect(bulle(page).locator('.parcours-bulle-revue')).toHaveText(/Pour revoir une étape, touche «\s10 sur 10\s»\./);
            break;
        default:
        }
    };
}

for (const [L, H] of ORIENTATIONS) {
    test(`B · ${L} × ${H} : le modèle d’« Évaluer une première production », de bout en bout, dans l’ordre du 15 nov. ; le confinement ; la remise à neuf`, async ({ page }) => {
        test.setTimeout(360000);
        page.setDefaultTimeout(20000);
        // La Modélisation préalable se joue en portrait : sous Chromium, en paysage, elle rougit sur sa flèche de l'étape 1
        // (inscrit le 17 nov. 2026, hors de ce lot). L'orientation de l'essai est posée avant d'entrer dans le modèle.
        await ouvrirEspaceVide(page, 820, 1180);
        await peuplerUnTrimestreReel(page);
        const avant = await releve(page);
        const duPack = Object.fromEntries(Object.entries(avant).filter(([k]) => DE_LA_DEMO.test(k)));
        await ouvrirPanneau(page);
        await boutonModele(page, 'classe').click();
        await faireLaModelisation(page);
        await page.setViewportSize({ width: L, height: H });
        // 20 nov. 2026 (A3) : la fin ne lance plus rien ; « Voir le parcours 3 », puis « Je regarde » dans le panneau.
        await voirLeParcoursPuisJeRegarde(page, 3, 'evaluer');
        const m = await page.evaluate(() => JSON.parse(JSON.stringify(window.ParcoursEvaluer.materiel)));
        const t = await page.evaluate(() => JSON.parse(JSON.stringify(window.ParcoursEvaluer.textes)));
        expect(m.grille.nom).toBe('Grille générale à 4 critères');
        const echellesAvant = await page.evaluate(() => (db.getSync(cle('echellesTemplates'), []) || []).length);

        const r = await faireLeModeleDEvaluer(page, { surEtape: juge(page, t, m, { rangeesAMain: false }) });

        // CE QUE LE MODÈLE PRODUIT (consigne, B) : la grille jugée par niveaux, sans échelle neuve ; la production avec sa
        // grille, son échelle, sa cartouche ; ses consignes et le bloc libre ; l'évaluation de Yack Amical.
        expect(await page.evaluate(() => (db.getSync(cle('echellesTemplates'), []) || []).length), 'aucune échelle neuve').toBe(echellesAvant);
        const g = await page.evaluate((id) => db.getSync(cle('grillesTemplates'), []).find((x) => x.id === id), r.grilleId);
        expect(g.description).toBe(m.grille.description);
        expect(g.criteres.map((c) => [c.nom, c.description, c.type, c.ponderation]))
            .toEqual(m.grille.criteres.map((c) => [c[0], c[1], 'holistique', parseInt(c[2], 10)]));
        const p = await page.evaluate((id) => db.getSync(cle('productions'), []).find((x) => x.id === id), r.pid);
        expect([p.titre, p.type, p.grilleId, p.cartoucheId, p.objectif, p.tache, p.detailTache])
            .toEqual([m.production.description, m.production.type, r.grilleId, r.cartoucheId, m.production.objectif, m.production.tache, m.production.detailTache]);
        expect(await page.evaluate((id) => (resoudreEchelleEvaluation(id) || {}).nom, p.echelleId)).toBe(m.echelle);
        expect(p.champsPersonnalises.map((c) => [c.titre, c.contenu])).toEqual([[m.production.autoevaluation.titre, m.production.autoevaluation.contenu]]);
        // Le PDF des consignes porte les blocs libres (#499, #500) : celui-ci y entre, après le détail de la tâche. (La
        // forme qu'il y prend, une rangée par critère et des cases à cocher, n'est pas de ce lot.)
        // Break-test (18 nov. 2026) : les blocs libres retirés de `blocsInformationDocument` (js/export-pdf.js) → ROUGE ici.
        // Rétabli → vert.
        const blocsDuPdf = await page.evaluate((id) => {
            const prod = db.getSync(cle('productions'), []).find((x) => x.id === id);
            return window.blocsInformationDocument(null, { production: prod, inclureObjectif: true, inclureDescription: true, inclureDetailTache: true });
        }, r.pid);
        expect(blocsDuPdf.map((b) => b.titre)).toEqual(["Objectif d'apprentissage :", 'Description de la tâche :', 'Détail de la tâche :', "Grille d'autoévaluation :", expect.any(String)]);
        expect(blocsDuPdf[3].texte).toBe(m.production.autoevaluation.contenu.trim());
        const gc = await page.evaluate(() => db.getSync('groupeCoursActif', null).id);
        expect(p.echeancesParGroupe[gc]).toMatchObject({ assignee: true, date: '2025-09-09' });
        const c = await page.evaluate(([gid, cid]) => db.getSync(cle('cartouches_' + gid), []).find((x) => x.id === cid), [r.grilleId, r.cartoucheId]);
        expect(c.nom).toBe(m.production.description);
        const e = await page.evaluate((id) => db.getSync(cle('evaluationsSauvegardees'), []).find((x) => x.id === id), r.evaluationId);
        expect([e.etudiantDA, e.verrouillee, e.cartoucheId, e.criteres.map((x) => x.niveauSelectionne)]).toEqual(['9900007', true, r.cartoucheId, ['M', 'D', 'D', 'D']]);
        expect(JSON.stringify(e)).toContain(m.mot);
        // La rétroaction porte les commentaires de la cartouche (le niveau 0 de Grégoire le 18 nov. compris dans la cartouche).
        expect(e.retroactionFinale).toContain(/\*\*STRUCTURE \(M\)\*\* : (.*)/.exec(m.commentaires)[1]);
        expect(m.commentaires).toContain("**NUANCE (0)** : L'évaluation n'est pas possible.");
        expect(await page.evaluate((id) => (window.designerPratiqueActive() || {}).idBrut === id, r.pratiqueId)).toBe(true);

        // LA FIN : « Terminer ».
        await bulle(page).getByRole('button', { name: 'Terminer', exact: true }).click();
        await expect(bulle(page)).toHaveCount(0);
        expect(await page.evaluate(() => Assistance.etatModeleDe('evaluer').etat)).toBe('fait');

        // LE CONFINEMENT : aucune clé hors de la démo n'a changé ; ce qui a été créé reste dans la démo.
        // Break-test (18 nov. 2026) : `materielCreation.creer` écrivant aussi la grille sous la clé nue
        // (`db.setSync('grillesTemplates', …)`) → ROUGE ici (`db:grillesTemplates` et `ls:grillesTemplates`). Rétabli → vert.
        expect(await ceQuiEstCree(page, m.grille.nom)).toEqual({
            grille: m.grille.criteres.map((x) => [x[0], 'holistique', parseInt(x[2], 10)]),
            production: [m.production.description, m.production.type, true, true], pratiques: 1, cartouches: 1, evaluations: 1
        });
        await page.evaluate(() => desactiverModeDemo());
        await expect.poll(() => enDemo(page)).toBe(false);
        const apres = await releve(page);
        expect(ecarts(avant, apres, horsDeLaDemo), 'aucune clé hors de la démo ne change').toEqual([]);

        // « Remettre la démo à neuf » les efface.
        await ouvrirPanneau(page);
        await page.click('#assistance-demo-neuf');
        await page.getByRole('dialog').filter({ hasText: 'Remettre la démo à neuf' }).last().getByRole('button', { name: 'Remettre à neuf' }).click();
        await expect(page.locator('.notifications-pile')).toContainText('La démo est remise à neuf.', { timeout: 15000 });
        const neuf = await releve(page);
        expect(ecarts(duPack, neuf, (k) => DE_LA_DEMO.test(k)), 'la démo du pack').toEqual([]);
        expect(ecarts(avant, neuf, horsDeLaDemo), 'les autres clés identiques').toEqual([]);
        if (!(await page.locator('#panneau-assistance').isVisible())) await ouvrirPanneau(page);
        await boutonModele(page, 'evaluer').click();
        await expect(carte(page, 'evaluer').locator('.assistance-parcours-refus')).toContainText('Mettre ta classe en place');
        await expect(bulle(page)).toHaveCount(0);
    });
}

test('C · 820 × 1180 : « Plausibilité » et « Nuance » finies à la main ; « Créer ma grille » n’arrive qu’une fois toutes les rangées étiquetées', async ({ page }) => {
    test.setTimeout(300000);
    page.setDefaultTimeout(20000);
    await ouvrirEspaceVide(page, 820, 1180);
    await ouvrirPanneau(page);
    await boutonModele(page, 'classe').click();
    await faireLaModelisation(page);
    await voirLeParcoursPuisJeRegarde(page, 3, 'evaluer');
    const m = await page.evaluate(() => JSON.parse(JSON.stringify(window.ParcoursEvaluer.materiel)));
    const r = await faireLeModeleDEvaluer(page, { rangeesAMain: true, surEtape: async (n) => {
        if (n !== 5.5) return;
        // Break-test (18 nov. 2026) : l'attente de `tenirPourNiveaux` rendue vide → ROUGE ici (le bouton actif après deux
        // rangées). Rétabli → vert.
        await expect(page.locator('#materiel-dissection [data-action="materielDissection.creer"]')).toBeDisabled();
        await expect(page.locator('#dissection-creer-raisons')).toContainText('toutes les rangées de la grille étiquetées');
    } });
    // Finie à la main, la grille garde ses quatre critères ; la description de la grille, que rien ne fait étiqueter
    // à la main, n'y entre pas (supposition nommée au rapport).
    const g = await page.evaluate((id) => db.getSync(cle('grillesTemplates'), []).find((x) => x.id === id), r.grilleId);
    expect(g.criteres.map((c) => c.nom)).toEqual(m.grille.criteres.map((c) => c[0]));
    await bulle(page).getByRole('button', { name: 'Terminer', exact: true }).click();
});
