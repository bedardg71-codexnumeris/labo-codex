import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// LE VERROU D'UN EXEMPLE NE SUIT PAS « + NOUVELLE … » (8 oct. 2026)
//
// Symptôme vécu par Grégoire en démo (8 oct., 9 h 48) : après avoir ouvert l'échelle d'exemple
// « IDME 4 niv » (lecture seule, bandeau « Exemple fourni par Labo Codex… »), « + Nouvelle
// échelle » ouvrait un formulaire vide mais TOUJOURS verrouillé : le nom ne se saisissait pas.
// `appliquerModeLectureSeuleDemo` pose le verrou à l'ouverture d'un exemple ; aucune création
// ne le retirait. Même chemin pour la grille, la cartouche et la production.
//
// Le banc joue le vrai index.html depuis la démonstration : il ouvre un exemple, VÉRIFIE que le
// verrou est posé (sans quoi le banc ne mesurerait rien), clique le vrai bouton « + Nouvelle … »,
// puis SAISIT le nom par le clavier (Playwright refuse de remplir un champ désactivé).
// Noms fictifs seulement. Contexte Playwright neuf à chaque essai.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
}

const etatVerrou = (page, conteneurId, champId) => page.evaluate(({ conteneurId, champId }) => {
    const c = document.getElementById(conteneurId);
    return {
        bandeau: !!c.querySelector('.bandeau-demo-readonly'),
        classe: c.classList.contains('demo-readonly'),
        champDesactive: document.getElementById(champId).disabled
    };
}, { conteneurId, champId });

const CAS = [
    {
        nom: 'échelle', sous: 'echelle-performance', conteneur: 'conteneurEditionEchelle', champ: 'nomEchelleTemplate',
        bouton: 'creerNouvelleEchelle', saisie: 'Échelle fictive après exemple',
        // L'exemple du symptôme, par son nom.
        ouvrir: () => {
            const e = (db.getSync(cle('echellesTemplates'), []) || []).find(x => x.nom === 'IDME 4 niv');
            if (!e || !BibliothequeUI.estItemDemo(e)) return false;
            return chargerEchellePourModif(e.id).then(() => true);
        }
    },
    {
        nom: 'grille', sous: 'grille-criteres', conteneur: 'conteneurEditionGrille', champ: 'nomGrilleTemplate',
        bouton: 'creerNouvelleGrille', saisie: 'Grille fictive après exemple',
        ouvrir: () => {
            const g = (db.getSync(cle('grillesTemplates'), []) || []).find(x => BibliothequeUI.estItemDemo(x));
            if (!g) return false;
            return chargerGrillePourModif(g.id).then(() => true);
        }
    },
    {
        nom: 'cartouche', sous: 'retroactions', conteneur: 'infoCartouche', champ: 'nomCartouche',
        bouton: 'creerNouvelleCartouche', saisie: 'Cartouche fictive après exemple',
        // La démonstration ne porte aucune cartouche marquée exemple : le banc en marque une,
        // comme le ferait une cartouche d'exemple reçue de Labo Codex (même verrou, même chemin).
        ouvrir: () => {
            for (const g of db.getSync(cle('grillesTemplates'), []) || []) {
                const liste = db.getSync(cle('cartouches_' + g.id), []) || [];
                if (!liste.length) continue;
                liste[0] = { ...liste[0], isDemo: true };
                db.setSync(cle('cartouches_' + g.id), liste);
                return chargerCartouchePourModif(liste[0].id, g.id).then(() => true);
            }
            return false;
        }
    },
    {
        nom: 'production', sous: 'productions', conteneur: 'formulaireProduction', champ: 'productionTitre',
        bouton: 'creerNouvelleProduction', saisie: 'Production fictive après exemple',
        ouvrir: () => {
            const p = (db.getSync(cle('productions'), []) || []).find(x => BibliothequeUI.estItemDemo(x));
            if (!p) return false;
            return chargerProductionPourModif(p.id).then(() => true);
        }
    }
];

for (const cas of CAS) {
    test(`${cas.nom} : après un exemple, « + Nouvelle ${cas.nom} » donne un formulaire modifiable, sans bandeau`, async ({ page }) => {
        test.setTimeout(90000);
        await ouvrirDemo(page);
        await page.evaluate((s) => naviguerVers('conception', s), cas.sous);
        await pause(page, 900);

        const ouvert = await page.evaluate(`(${cas.ouvrir.toString()})()`);
        expect(ouvert, `la démonstration doit porter un exemple de ${cas.nom}`).toBe(true);
        await pause(page, 900);

        // Préalable : le verrou de l'exemple est bien posé, sans quoi ce banc ne mesure rien.
        expect(await etatVerrou(page, cas.conteneur, cas.champ), 'l\'exemple ouvert est verrouillé')
            .toEqual({ bandeau: true, classe: true, champDesactive: true });

        await page.locator(`button[data-action="${cas.bouton}"]:visible`).first().click();
        await pause(page, 900);

        expect(await etatVerrou(page, cas.conteneur, cas.champ), 'la fiche neuve n\'est pas verrouillée')
            .toEqual({ bandeau: false, classe: false, champDesactive: false });
        await page.locator('#' + cas.champ).fill(cas.saisie, { timeout: 5000 });
        expect(await page.locator('#' + cas.champ).inputValue(), 'le nom se saisit').toBe(cas.saisie);
    });
}
