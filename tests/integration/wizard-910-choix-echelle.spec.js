import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #910 · LA LISTE « ÉCHELLE » DE L'ASSISTANT, DANS LE VRAI `index.html`.
//
// Le banc unitaire juge le HTML produit et la restauration sur un <select>
// modélisé. Seul WebKit prouve les deux points qui tiennent au navigateur :
//   · un nom portant des balises arrive en TEXTE dans l'<option>, sans élément créé ;
//   · `select.value = id` ne prend que si l'<option> existe — c'est le piège :
//     l'échelle retirée de la bibliothèque mais DÉJÀ CHOISIE doit rester offerte,
//     sinon la pratique rouverte perd son échelle en silence.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

test('#910 · la liste offre la bibliothèque, garde l\'échelle déjà choisie, et échappe les noms', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.afficherEtapeWizardV2 !== 'function'
            || typeof window.obtenirEchellesOffertesAdoption !== 'function'
            || !window.wizardState) {
            return { erreur: 'pré-requis absents' };
        }

        // ⚠ Les specs partagent le localStorage de `file://` : on sauve la
        // valeur en place, et on la REMET à la fin, quoi qu'il arrive.
        const cleEchelles = cle('echellesTemplates');
        const avant = db.getSync(cleEchelles, null);
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 59, valeurCalcul: 40, couleur: '#111111' },
            { code: 'M', nom: 'Maîtrisé', min: 60, max: 100, valeurCalcul: 80, couleur: '#333333' }
        ];
        const NOM_PIEGE = 'Cotation <b>gras</b> "><img src=x>';
        const contenu = document.getElementById('wizard-v2-contenu');
        const rendre = (echelleId) => {
            window.wizardState.reponses = { typePratique: 'standards', approcheEvaluation: 'par-artefacts' };
            if (echelleId) window.wizardState.reponses.echelleId = echelleId;
            window.wizardState.etapeActuelle = 'echelle-performance';
            window.wizardState.historique = [];
            window.afficherEtapeWizardV2('echelle-performance');
            const liste = contenu.querySelector('select[name="echelleId"]');
            return {
                liste: !!liste,
                valeurs: liste ? [...liste.options].map((o) => o.value).filter(Boolean) : [],
                selection: liste ? liste.value : null,
                libelles: liste ? [...liste.options].map((o) => o.textContent) : [],
                balisesCreees: contenu.querySelectorAll('b, img').length,
                message: contenu.textContent.replace(/\s+/g, ' ').includes('Aucune échelle de performance n\'a été créée.')
            };
        };
        try {
            await db.set(cleEchelles, [
                { id: 'ECH_910_A', nom: NOM_PIEGE, niveaux },
                { id: 'ECH_910_B', nom: 'Retirée choisie', niveaux, dansBibliotheque: false },
                { id: 'ECH_910_Z', nom: 'Retirée pas choisie', niveaux, dansBibliotheque: false }
            ]);
            const sansChoix = rendre(null);
            const choisieRetiree = rendre('ECH_910_B');

            await db.set(cleEchelles, [
                { id: 'ECH_910_B', nom: 'Retirée choisie', niveaux, dansBibliotheque: false },
                { id: 'ECH_910_Z', nom: 'Retirée pas choisie', niveaux, dansBibliotheque: false }
            ]);
            const toutRetire = rendre(null);

            return { sansChoix, choisieRetiree, toutRetire, NOM_PIEGE };
        } finally {
            await db.set(cleEchelles, avant || []);
            window.wizardState.reponses = {};
            window.wizardState.historique = [];
            if (contenu) contenu.innerHTML = '';
        }
    });

    expect(resultat.erreur).toBeUndefined();

    // Sans échelle choisie : la bibliothèque seulement, et le nom en TEXTE.
    expect(resultat.sansChoix.valeurs).toEqual(['ECH_910_A']);
    expect(resultat.sansChoix.balisesCreees).toBe(0);
    expect(resultat.sansChoix.libelles).toContain(`${resultat.NOM_PIEGE} (2 niveaux)`);

    // LE PIÈGE : la retirée DÉJÀ CHOISIE reste offerte et le vrai select la porte ;
    // l'autre retirée ne revient pas avec elle.
    expect(resultat.choisieRetiree.valeurs).toEqual(['ECH_910_A', 'ECH_910_B']);
    expect(resultat.choisieRetiree.selection).toBe('ECH_910_B');

    // Tout est retiré, rien n'est choisi : le message, pas une liste vide.
    expect(resultat.toutRetire.liste).toBe(false);
    expect(resultat.toutRetire.message).toBe(true);

    expect(erreurs).toEqual([]);
});
