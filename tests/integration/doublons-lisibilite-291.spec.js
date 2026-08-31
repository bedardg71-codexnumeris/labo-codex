import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE — RETOUR DE TERRAIN DU 23 AOÛT 2026, relevé de Grégoire (39/43).
//
// Trois lignes rouges, toutes sur du RENDU — donc invérifiables autrement
// qu'au navigateur, et c'est pour ça qu'elles ont survécu à 2959 tests
// unitaires verts :
//
//   2.1c « Rouvrir la même bibliothèque sur iPad »   ✗ lisible sans zoomer
//   2.1d « Basculer en mode clair »                  ✗ contraste suffisant
//   2.1e « Ouvrir les autres bibliothèques »         ✗ même puce partout
//   2.5  mesure : « la modale "Supprimer de la bibliothèque partagée"
//        apparaît SOUS la modale de la bibliothèque »
//
// CE QUI A ÉTÉ MESURÉ, et qui explique les trois d'un coup :
//   · la puce d'identifiant rendait à **11,8 px** — elle héritait en `em` de
//     `.biblio-carte-meta` (0,9em) et se composait à 0,82em de ça ;
//   · son contraste tombait à **4,01:1** en mode clair, sous le minimum
//     WCAG AA de 4,5:1 (paire `--bleu-meta` sur `--bleu-tres-pale`).
//   La puce était bien PRÉSENTE dans les cinq familles — 2.1e n'était pas un
//   manque, c'était l'impossibilité de le constater.
//
//   · `uiDialogues` construit un `.modal-overlay` à **z-index 9999**, quand
//     les modales de bibliothèque sont posées à **10000**. La confirmation
//     naissait derrière ce qui l'avait demandée.
//
// BREAK-TESTS (faits le 23 août 2026) :
//  (a) remettre `font-size: 0.82em` sur `.biblio-id-court` → la taille rougit ;
//  (b) remettre `color: var(--bleu-meta)` → le contraste rougit en mode clair ;
//  (c) retirer `#overlay-ui-dialogue { z-index: 10005 }` → l'empilement rougit.

const TAILLE_MIN = 13;    // px — plancher de lisibilité en chasse fixe sur iPad
const CONTRASTE_MIN = 4.5; // WCAG 2.1 AA, texte normal

const FAMILLES = [
    ['Grilles', 'afficherBibliothequeGrilles'],
    ['Échelles', 'afficherBibliothequeEchelles'],
    ['Cartouches', 'afficherBibliothequeCartouches'],
    ['Productions', 'afficherBibliothequeProductions'],
    ['Pratiques', 'afficherBibliothequePratiques']
];

/** Jeu d'essai : deux exemplaires de même nom dans chacune des cinq familles. */
const SEMER = async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'A2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    const G = 'GRILLE_aaaa_b209ef';
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    await db.set(cle('grillesTemplates'), [
        { id: G, nom: 'Grille SRPNF', criteres: [], dansBibliotheque: true },
        { id: 'GRILLE_bbbb_6fdd43', idOriginal: G, nom: 'Grille SRPNF', criteres: [], dansBibliotheque: true }]);
    await db.set('bibliothequeGrilles', []);
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    await db.set(cle('echellesTemplates'), [
        { id: 'ECH_aaaa_111111', nom: 'IDME et niv 0', niveaux: [], dansBibliotheque: true },
        { id: 'ECH_bbbb_222222', nom: 'IDME et niv 0', niveaux: [], dansBibliotheque: true }]);
    await db.set('bibliothequeEchelles', []);
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    await db.set(cle('productions'), [
        { id: 'PROD_aaaa_333333', titre: 'Artefact 1', type: 'portfolio', ponderation: 0, dansBibliotheque: true },
        { id: 'PROD_bbbb_444444', titre: 'Artefact 1', type: 'portfolio', ponderation: 0, dansBibliotheque: true }]);
    await db.set('bibliothequeProductions', []);
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    await db.set(cle('cartouches_' + G), [
        { id: 'CART_aaaa_555555', nom: 'Cartouche A', grilleId: G, dansBibliotheque: true },
        { id: 'CART_bbbb_666666', nom: 'Cartouche A', grilleId: G, dansBibliotheque: true }]);
    await db.set('bibliothequeCartouches', []);
    db.setSync(cle('pratiquesConfigurables'), [
        { id: 'pratique_aaaa_777777', nom: 'Ma pratique', dansBibliotheque: true },
        { id: 'pratique_bbbb_888888', nom: 'Ma pratique', dansBibliotheque: true }]);
};

/** Contraste WCAG entre deux couleurs `rgb(...)` calculées par le navigateur. */
function contraste(avant, arriere) {
    const relative = (c) => {
        const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const l1 = relative(avant), l2 = relative(arriere);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

test.beforeEach(async ({ page }) => {
    await page.addInitScript(`window.__semer = ${SEMER.toString()};`);
});

test('porte 2.1c-e · la puce d\'identifiant est lisible dans les 5 familles, en sombre ET en clair', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('dialog', (d) => d.dismiss());

    // Format iPad Air en portrait — l'appareil où la porte a rougi.
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    await page.evaluate(async () => { await window.__semer(); });

    const trop = [];

    for (const mode of ['sombre', 'clair']) {
        await page.evaluate((m) => {
            document.body.classList.toggle('mode-clair', m === 'clair');
        }, mode);

        for (const [nom, fn] of FAMILLES) {
            const r = await page.evaluate(async ([fn]) => {
                document.querySelectorAll('[id^="modalBibliotheque"]').forEach((m) => m.remove());
                if (typeof window[fn] !== 'function') return { absente: true };
                await window[fn]();
                await new Promise((res) => setTimeout(res, 450));

                const puces = [...document.querySelectorAll('.biblio-id-court')];
                if (!puces.length) return { puces: 0 };

                const s = getComputedStyle(puces[0]);
                // Fond EFFECTIF : on remonte tant que c'est transparent, sinon
                // on mesurerait un contraste contre du vide.
                let el = puces[0], fond = s.backgroundColor;
                while (fond === 'rgba(0, 0, 0, 0)' && el.parentElement) {
                    el = el.parentElement;
                    fond = getComputedStyle(el).backgroundColor;
                }
                return { puces: puces.length, taille: parseFloat(s.fontSize), couleur: s.color, fond };
            }, [fn]);

            expect(r.absente, `${nom} : fonction d'affichage introuvable`).toBeFalsy();
            expect(r.puces, `${nom} (${mode}) : aucune puce d'identifiant — porte 2.1e`)
                .toBeGreaterThan(0);

            if (r.taille < TAILLE_MIN) {
                trop.push(`${nom} (${mode}) : ${r.taille}px — sous ${TAILLE_MIN}px`);
            }
            const ratio = contraste(r.couleur, r.fond);
            if (ratio < CONTRASTE_MIN) {
                trop.push(`${nom} (${mode}) : contraste ${ratio.toFixed(2)}:1 — sous ${CONTRASTE_MIN}:1`);
            }
        }
    }

    expect(
        trop,
        'La puce d\'identifiant redevient illisible — c\'est le retour de porte 2.1c/2.1d :\n  ' +
        trop.join('\n  ')
    ).toEqual([]);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('porte 2.5 · une confirmation passe AU-DESSUS de la modale qui l\'a demandée', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    await page.evaluate(async () => { await window.__semer(); });

    const r = await page.evaluate(async () => {
        document.querySelectorAll('[id^="modalBibliotheque"]').forEach((m) => m.remove());
        await window.afficherBibliothequeProductions();
        await new Promise((res) => setTimeout(res, 450));

        const biblio = document.querySelector('#modalBibliothequeProductions');
        const zBiblio = biblio ? parseInt(getComputedStyle(biblio).zIndex, 10) : null;

        // On n'ATTEND pas la promesse : `confirmerAction` ne se résout qu'au clic.
        uiDialogues.confirmerAction({ titre: 'Essai', message: 'Essai', texteConfirmer: 'Oui' });
        await new Promise((res) => setTimeout(res, 350));

        const dlg = document.querySelector('#overlay-ui-dialogue');
        if (!dlg) return { zBiblio, absente: true };

        // LA mesure qui tranche — un z-index plus élevé ne prouve rien si un
        // contexte d'empilement s'interpose. On demande au navigateur QUI est
        // réellement atteint au centre du dialogue.
        const boite = dlg.querySelector('.modal-contenu').getBoundingClientRect();
        const cible = document.elementFromPoint(
            boite.left + boite.width / 2, boite.top + boite.height / 2);

        return {
            zBiblio,
            zDlg: parseInt(getComputedStyle(dlg).zIndex, 10),
            atteignable: !!(cible && cible.closest('#overlay-ui-dialogue')),
            atteint: cible ? (cible.id || cible.className || cible.tagName) : '(rien)'
        };
    });

    expect(r.absente, 'la confirmation n\'a pas été construite').toBeFalsy();
    expect(r.zDlg, `confirmation à ${r.zDlg}, bibliothèque à ${r.zBiblio}`)
        .toBeGreaterThan(r.zBiblio);
    expect(
        r.atteignable,
        `Au centre du dialogue, le navigateur atteint « ${r.atteint} » et non la ` +
        'confirmation : elle est SOUS la modale de bibliothèque, donc incliquable. ' +
        'C\'est le retour de porte 2.5 du 23 août.'
    ).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
