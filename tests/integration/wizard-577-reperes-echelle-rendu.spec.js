import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #577 · L'ÉTAPE « ÉCHELLE DE PERFORMANCE » DE L'ASSISTANT REND LE BLOC DES
// REPÈRES DANS LE VRAI `index.html`, ET UN `change` L'ÉCRIT SUR L'ÉCHELLE.
//
// Le banc unitaire prouve le HTML produit et l'écriture par appel direct. Seul
// WebKit prouve que le `change` d'une liste, résolu par NOM de handler par le
// dispatcher de la page, atteint `ecrireRepereEchelle` — et que l'étape est
// re-rendue ensuite avec l'état enregistré.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

test('#577 · l\'assistant rend les repères de l\'échelle choisie, et un change les écrit', async ({ page }) => {
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
            || typeof window.ecrireRepereEchelle !== 'function'
            || !window.wizardState) {
            return { erreur: 'pré-requis absents' };
        }

        // ⚠ Les specs partagent le localStorage de `file://` : on sauve la
        // valeur en place, et on la REMET à la fin, quoi qu'il arrive.
        const cleEchelles = cle('echellesTemplates');
        const avant = db.getSync(cleEchelles, null);
        try {
            await db.set(cleEchelles, [{
                id: 'ECH_SPEC_577',
                nom: 'Cotation W-X-Y-Z',
                niveaux: [
                    { code: 'Y', nom: 'Consolidé', min: 70, max: 89, valeurCalcul: 80, couleur: '#333333' },
                    { code: 'W', nom: 'Amorce',    min: 0,  max: 49, valeurCalcul: 30, couleur: '#111111' },
                    { code: 'Z', nom: 'Transféré', min: 90, max: 100, valeurCalcul: 95, couleur: '#444444' },
                    { code: 'X', nom: 'En chemin', min: 50, max: 69, valeurCalcul: 60, couleur: '#222222' }
                ]
            }]);

            window.wizardState.reponses = { typePratique: 'standards', approcheEvaluation: 'par-artefacts', echelleId: 'ECH_SPEC_577' };
            window.wizardState.etapeActuelle = 'echelle-performance';
            window.wizardState.historique = [];
            window.afficherEtapeWizardV2('echelle-performance');

            const contenu = document.getElementById('wizard-v2-contenu');
            const selects = () => [...contenu.querySelectorAll('select[data-champ^="seuil"]')];
            const texte = () => contenu.textContent.replace(/\s+/g, ' ').trim();
            const enBase = () => (db.getSync(cleEchelles, []) || []).find((e) => e.id === 'ECH_SPEC_577');

            const rendu = {
                titrePresent: texte().includes('Repères de maîtrise'),
                champs: selects().map((s) => s.dataset.champ),
                handlers: selects().map((s) => s.dataset.onChange),
                echelleIds: selects().map((s) => s.dataset.echelleId),
                options: selects().map((s) => [...s.options].map((o) => o.value)),
                avertissement: texte().includes('Sans ces deux repères'),
                ditSeuil: /seuil/i.test(texte()),
                listeRafraichit: contenu.querySelector('select[name="echelleId"]')?.dataset.onChange || null
            };

            // Le geste de l'utilisateur : un `change` natif sur la liste.
            const poser = async (champ, code) => {
                const s = selects().find((x) => x.dataset.champ === champ);
                s.value = code;
                s.dispatchEvent(new Event('change', { bubbles: true }));
                await new Promise((r) => setTimeout(r, 150));
            };
            await poser('seuilSuffisance', 'X');
            const apresSuffisance = { enBase: enBase().seuilSuffisance, selection: selects().map((s) => s.value) };
            await poser('seuilMaitrise', 'Y');
            const apresMaitrise = {
                enBase: { s: enBase().seuilSuffisance, m: enBase().seuilMaitrise },
                selection: selects().map((s) => s.value),
                avertissement: texte().includes('Sans ces deux repères'),
                apercuZones: ['à travailler', 'suffisant', 'maîtrisé'].every((z) => texte().includes(z))
            };
            // Un refus : la suffisance au-dessus de la maîtrise.
            await poser('seuilSuffisance', 'Z');
            const apresRefus = {
                enBase: { s: enBase().seuilSuffisance, m: enBase().seuilMaitrise },
                marque: selects().find((x) => x.dataset.champ === 'seuilSuffisance').classList.contains('champ-refuse')
            };

            return { rendu, apresSuffisance, apresMaitrise, apresRefus };
        } finally {
            await db.set(cleEchelles, avant || []);
            window.wizardState.reponses = {};
            window.wizardState.historique = [];
            const contenu = document.getElementById('wizard-v2-contenu');
            if (contenu) contenu.innerHTML = '';
        }
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.rendu.titrePresent).toBe(true);
    expect(resultat.rendu.champs).toEqual(['seuilSuffisance', 'seuilMaitrise']);
    expect(resultat.rendu.handlers).toEqual(['wizardV2ModifierRepereEchelle', 'wizardV2ModifierRepereEchelle']);
    expect(resultat.rendu.echelleIds).toEqual(['ECH_SPEC_577', 'ECH_SPEC_577']);
    expect(resultat.rendu.options[0]).toEqual(['', 'W', 'X', 'Y', 'Z']);
    expect(resultat.rendu.avertissement).toBe(true);
    expect(resultat.rendu.ditSeuil).toBe(false);
    expect(resultat.rendu.listeRafraichit).toBe('wizardV2RafraichirEtapeCourante');

    // Chaque `change` a écrit en base par le dispatcher, et l'étape re-rendue
    // montre l'état enregistré.
    expect(resultat.apresSuffisance.enBase).toBe('X');
    expect(resultat.apresSuffisance.selection).toEqual(['X', '']);
    expect(resultat.apresMaitrise.enBase).toEqual({ s: 'X', m: 'Y' });
    expect(resultat.apresMaitrise.selection).toEqual(['X', 'Y']);
    expect(resultat.apresMaitrise.avertissement).toBe(false);
    expect(resultat.apresMaitrise.apercuZones).toBe(true);

    // Le refus n'écrit rien, et se voit.
    expect(resultat.apresRefus.enBase).toEqual({ s: 'X', m: 'Y' });
    expect(resultat.apresRefus.marque).toBe(true);

    expect(erreurs).toEqual([]);
});
