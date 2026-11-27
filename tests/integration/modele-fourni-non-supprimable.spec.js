import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// LOT modele-fourni-non-supprimable (22 nov. 2026) — dans la bibliothèque des pratiques, un modèle fourni avec
// l'application n'offre plus « Supprimer ».
//
// BUG VÉCU par Grégoire le 22 nov. 2026, 10 h 38, iPad, 1.254.0 : sous « Dans ta bibliothèque », la ligne « Modèle
// sommatif · par Gabarit Labo Codex » (puce #rature : l'identifiant SOM-litterature). « Supprimer » par le ⋮, puis par
// le bloc « Homonymes » : la fenêtre du codex, « Supprimer définitivement… Cette action est irréversible. », il
// confirme, la ligne est toujours là. Rejoué AVANT le correctif (Chromium du conteneur, faute de WebKit) : sa copie
// (`bibliothequePratiques`, même id que le prédéfini) est bien effacée, puis le prédéfini reprend la place à la
// lecture (`obtenirToutesLesPratiquesBibliotheque`) — même ligne, même bandeau.
//
// Ce que le banc fixe, dans le vrai index.html, par les vrais gestes :
//   · copie identique au modèle (le cas du bug) et modèle pur : ni ⋮ ni « Supprimer », la ligne dit « fourni avec
//     l'application » ; pas de groupe « Homonymes » avec la pratique du trimestre de même nom ; la fonction appelée
//     directement refuse et n'efface rien ;
//   · avec un dossier, le ⋮ garde « Classer dans », sans « Supprimer » ni séparateur orphelin ;
//   · copie DIFFÉRENTE du modèle : rien ne change (le geste à lui offrir est une proposition, pas encore tranchée) ;
//   · une pratique qui appartient à l'enseignant·e : « Supprimer » et la suppression, inchangés ;
//   · deux pratiques de même nom DANS CE TRIMESTRE : le groupe reste (seul le côté bibliothèque est filtré).
// Noms fictifs. Contexte Playwright neuf à chaque essai.
//
// Les mots « fourni avec l'application » sont validés par Grégoire (22 nov. 2026) ; constante MENTION ci-dessous.
//
// BREAK-TESTS : voir le rapport du lot (plans de travail/RAPPORT-2026-11-22-modele-fourni-non-supprimable.md).
// ═══════════════════════════════════════════════════════════════════════════════════════════

const SEL = '#modalBibliothequePratiques';
const MENTION = 'fourni avec l\'application';
const ID_MODELE = 'SOM-litterature';   // « Modèle sommatif »

/**
 * Démo, Conception › Pratiques, puis le décor : `copie` = 'identique' | 'differente' | null (la copie du modèle dans
 * `bibliothequePratiques`) ; `homonyme` = une pratique du trimestre nommée « Modèle sommatif », sans parenté.
 */
async function ouvrir(page, { copie = null, homonyme = false, dossier = false, modeleAdopte = false, extraBiblio = [] } = {}) {
    const dialogues = [];
    page.on('dialog', async (d) => { dialogues.push(d.message()); await d.accept(); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await attendreApplication(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await attendreRepos(page);
    await page.evaluate(() => naviguerVers('conception', 'pratiques-notation'));
    await attendreRepos(page);
    await page.evaluate(async ({ copie, homonyme, dossier, modeleAdopte, extraBiblio, idModele }) => {
        // La fenêtre du codex (#1007) a ses propres bancs : ici, on compte seulement qu'elle a été appelée.
        window.__codex = 0;
        Codex.proposerAvantSuppression = async () => { window.__codex++; return true; };
        window.__infos = [];
        notifications.info = (...a) => { window.__infos.push(a.join(' | ')); };

        const biblio = [];
        if (copie) {
            const modele = JSON.parse(JSON.stringify(window.MODELES_PRATIQUES_PREDEFINIS[idModele]));
            // Les champs de tenue qu'une copie porte réellement (ajout, licence) : ils ne la rendent pas différente.
            Object.assign(modele, { dansBibliotheque: true, dateAjoutBiblio: '2026-10-01T12:00:00.000Z',
                metadata_cc: { licence: 'CC BY-NC-SA 4.0', auteur_original: 'Gabarit Labo Codex' } });
            if (copie === 'differente') {
                modele.configuration.evaluations = [{ id: 1, nom: 'Travail unique', type: 'travail', ponderation: 100 }];
            }
            biblio.push(modele);
        }
        await db.set('bibliothequePratiques', biblio.concat(extraBiblio));   // security-ok: fixture littérale écrite par le banc, aucune source externe
        const trimestre = db.getSync(cle('pratiquesConfigurables'), []) || [];
        // Le modèle adopté tel quel (« Utiliser dans ce trimestre » garde son id) : intact, mais à l'enseignant·e.
        if (modeleAdopte) {
            trimestre.push(Object.assign(JSON.parse(JSON.stringify(window.MODELES_PRATIQUES_PREDEFINIS[idModele])),
                { dansBibliotheque: true, dateAjout: '2026-10-01T12:00:00.000Z' }));
        }
        if (homonyme) {
            trimestre.push({ id: 'pratique_banc_homonyme', nom: 'Modèle sommatif', type: 'sommative', pratiques: ['SOM'],
                dansBibliotheque: true, configuration: {} });
        }
        await db.set(cle('pratiquesConfigurables'), trimestre);   // security-ok: fixture littérale écrite par le banc, aucune source externe
        if (dossier) window.repertoiresBibliotheque.creer('Dossier fictif', 'pratiques');
    }, { copie, homonyme, dossier, modeleAdopte, extraBiblio, idModele: ID_MODELE });
    await page.locator('#conception-pratiques-notation button[data-action="afficherBibliothequePratiques"]').click();
    await expect(page.locator(SEL + ' .biblio2-fenetre')).toBeVisible();
    return dialogues;
}

const rangeeBiblio = (page, nom) => page.locator(SEL + ' .biblio2-panneau--bibliotheque .biblio2-liste').first()
    .locator(':scope > .biblio2-rangee', { has: page.locator('.biblio2-rangee-nom', { hasText: nom }) });
const groupeDoublon = (page, nom) => page.locator(SEL + ' .biblio-doublon-groupe', { hasText: '« ' + nom + ' »' });
const idsBibliotheque = (page) => page.evaluate(() => (db.getSync('bibliothequePratiques', []) || []).map(p => p.id));

for (const cas of ['identique', null]) {
    test(`modèle fourni ${cas ? 'avec sa copie identique (le cas du 22 nov.)' : 'pur, sans copie'} : ni ⋮ ni « Supprimer », la mention ; pas de groupe « Homonymes » ; la fonction refuse et n'efface rien`, async ({ page }) => {
        test.setTimeout(90000);
        const dialogues = await ouvrir(page, { copie: cas, homonyme: true });

        const r = rangeeBiblio(page, 'Modèle sommatif');
        await expect(r).toHaveCount(1);
        await expect(r.locator('.biblio2-rangee-meta')).toHaveText('Cumulative · ' + MENTION);
        await expect(r.locator('.biblio2-kebab'), 'aucun ⋮ : il n’aurait rien à offrir').toHaveCount(0);
        await expect(r.locator('.biblio2-passage'), '« Utiliser dans ce trimestre » reste').toHaveCount(1);
        await expect(page.locator(SEL + ' .biblio2-panneau--bibliotheque').getByRole('menuitem', { name: 'Supprimer de ma bibliothèque' })).toHaveCount(0);

        // Le bloc « Homonymes » ne met plus en regard la pratique du trimestre et le modèle fourni.
        await expect(groupeDoublon(page, 'Modèle sommatif')).toHaveCount(0);
        await expect(page.locator(SEL + ' .biblio-doublon-action[data-param="' + ID_MODELE + '"]')).toHaveCount(0);

        // Garde de la fonction (appelée directement) : pas de question, rien d'effacé, le message existant.
        const avant = await idsBibliotheque(page);
        expect(avant).toEqual(cas ? [ID_MODELE] : []);
        await page.evaluate((id) => window.supprimerPratiqueDeBibliothequePartagee(id), ID_MODELE);
        await attendreRepos(page);
        expect(await idsBibliotheque(page), 'aucune donnée effacée').toEqual(avant);
        expect(dialogues, 'aucune question de suppression').toEqual([]);
        expect(await page.evaluate(() => window.__codex), 'la fenêtre du codex ne s’ouvre pas').toBe(0);
        expect(await page.evaluate(() => window.__infos)).toEqual([
            'Gabarit prédéfini | Ce gabarit est fourni par défaut avec l\'application et ne peut pas être supprimé. Il se réinjecte automatiquement au rafraîchissement.'
        ]);
    });
}

test('modèle fourni, avec un dossier : le ⋮ garde « Classer dans », sans « Supprimer » ni séparateur', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { copie: 'identique', dossier: true });
    const r = rangeeBiblio(page, 'Modèle sommatif');
    await r.locator('.biblio2-kebab').click();
    const menu = page.locator(SEL + ' .biblio-menu-popover.actif');
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Classer dans : Dossier fictif']);
    await expect(menu.locator('.biblio-menu-separateur')).toHaveCount(0);
});

test('copie DIFFÉRENTE du modèle : « Supprimer » reste offert, et le geste fait ce qu’il faisait (le modèle reprend sa place)', async ({ page }) => {
    test.setTimeout(90000);
    const dialogues = await ouvrir(page, { copie: 'differente', homonyme: true });

    const r = rangeeBiblio(page, 'Modèle sommatif');
    await expect(r.locator('.biblio2-rangee-meta')).toHaveText(/^Cumulative · par Gabarit Labo Codex/);
    await expect(groupeDoublon(page, 'Modèle sommatif').locator('.biblio-doublon-action[data-param="' + ID_MODELE + '"]', { hasText: 'Supprimer' })).toHaveCount(1);
    await r.locator('.biblio2-kebab').click();
    await page.locator(SEL + ' .biblio-menu-popover.actif').getByRole('menuitem', { name: 'Supprimer de ma bibliothèque' }).click();
    await attendreRepos(page);

    expect(dialogues).toEqual(['Supprimer définitivement la pratique « Modèle sommatif » de la bibliothèque ?\n\nCette action est irréversible.']);
    expect(await page.evaluate(() => window.__codex)).toBe(1);
    expect(await idsBibliotheque(page), 'la copie différente est effacée, comme avant').toEqual([]);
    // Le prédéfini reprend sa place : il est, lui, intact.
    await expect(rangeeBiblio(page, 'Modèle sommatif').locator('.biblio2-rangee-meta')).toHaveText('Cumulative · ' + MENTION);
});

test('une pratique qui appartient à l’enseignant·e : « Supprimer » et la suppression, inchangés', async ({ page }) => {
    test.setTimeout(90000);
    const dialogues = await ouvrir(page, { extraBiblio: [{ id: 'PRAT_BANC_PERSO', nom: 'Pratique fictive personnelle',
        type: 'sommative', pratiques: ['SOM'], auteur: 'Auteur fictif', dansBibliotheque: true, configuration: {} }] });

    const r = rangeeBiblio(page, 'Pratique fictive personnelle');
    await expect(r.locator('.biblio2-rangee-meta')).toHaveText('Cumulative · par Auteur fictif');
    await r.locator('.biblio2-kebab').click();
    await expect(page.locator(SEL + ' .biblio-menu-popover.actif .biblio-menu-item')).toHaveText(['Supprimer de ma bibliothèque']);
    await page.locator(SEL + ' .biblio-menu-popover.actif').getByRole('menuitem', { name: 'Supprimer de ma bibliothèque' }).click();
    await attendreRepos(page);

    expect(dialogues).toEqual(['Supprimer définitivement la pratique « Pratique fictive personnelle » de la bibliothèque ?\n\nCette action est irréversible.']);
    expect(await idsBibliotheque(page)).toEqual([]);
    await expect(rangeeBiblio(page, 'Pratique fictive personnelle')).toHaveCount(0);
});

test('deux pratiques de même nom DANS CE TRIMESTRE (dont le modèle adopté tel quel) : le groupe reste, avec ses gestes du trimestre', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { homonyme: true, modeleAdopte: true });

    const groupe = groupeDoublon(page, 'Modèle sommatif');
    await expect(groupe).toHaveCount(1);
    await expect(groupe.locator('.biblio-doublon-exemplaire')).toHaveCount(2);
    await expect(groupe.locator('.biblio-doublon-lieu')).toHaveText(['Dans ce trimestre', 'Dans ce trimestre']);
    await expect(groupe.locator('.biblio-doublon-action[title="Supprimer définitivement de la Bibliothèque"]')).toHaveCount(0);
});
