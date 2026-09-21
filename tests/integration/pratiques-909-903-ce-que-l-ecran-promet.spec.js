import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #909 et #903 (21 sept. 2026) — CRÉER OU ADOPTER UNE PRATIQUE : CE QUE L'ÉCRAN PROMET EST CE QUI S'APPLIQUE.
// Pack démo, 768 px, par les VRAIS gestes.
//
//   #909 — le trimestre n'a aucune échelle à offrir : les DEUX gestes d'adoption d'un modèle Standards ouvrent quand
//          même une fenêtre, qui dit pourquoi et où aller (la phrase de Grégoire) ; rien n'est adopté, et rien n'est
//          écrit — `pratiquesConfigurables` et `groupesCours` comparés octet pour octet.
//   #903 — une sommative DÉJÀ enregistrée qui porte plafonnement, remplacement et reprises. Le SEUL geste vivant qui
//          rouvre une pratique par l'assistant est « Éditer la pratique » du Comparateur (mesuré : la liste aux boutons
//          « Modifier » de pratiques.js ne rend plus rien). Le Comparateur ne l'annonce plus « Actif » ; l'assistant
//          n'offre plus ces cases ni ne les annonce au récapitulatif ; enregistrée, elle les garde.
//          Deux passes : la première remplit ce que l'assistant exige (établissement, discipline) ; la seconde ne
//          touche à rien — son diff est VIDE.
//
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

const PHRASE = 'Ce modèle a besoin d\'une échelle de performance pour calculer la note, et ce trimestre n\'en a aucune. Crée une échelle dans Conception → Échelles de performance, puis reviens adopter ce modèle.';

async function ouvrirPackDemo(page) {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForTimeout(1500);
}
const allerAuxPratiques = (page) => page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-pratiques-notation'); });

test('#909 · trimestre sans échelle : les deux gestes d\'adoption disent la phrase, et rien n\'est adopté ni écrit', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('dialog', (d) => { d.dismiss(); });
    await ouvrirPackDemo(page);

    // Le trimestre n'offre plus aucune échelle : les deux du pack sont retirées de la barre latérale (le geste de l'écran
    // « Échelles de performance »), pas détruites — le reste du pack continue de s'afficher.
    const nbEchelles = await page.evaluate(() => {
        const k = window.cle('echellesTemplates');
        const l = (window.db.getSync(k, []) || []).map(e => Object.assign({}, e, { dansBibliotheque: false }));
        window.db.setSync(k, l); // security-ok: fixture de test sur le pack démo
        return l.length;
    });
    expect(nbEchelles).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.obtenirEchellesOffertesAdoption().length)).toBe(0);
    await allerAuxPratiques(page);
    await page.waitForTimeout(500);

    const empreinte = () => page.evaluate(() => JSON.stringify([window.db.getSync(window.cle('pratiquesConfigurables'), null), window.db.getSync(window.cle('groupesCours'), null)]));
    const lireFenetre = () => page.evaluate(() => {
        const o = document.getElementById('overlay-ui-dialogue');
        if (!o) return null;
        const modale = o.querySelector('[role="dialog"]') || o.querySelector('.modal-contenu');
        const boutons = [...o.querySelectorAll('button')];
        const r = boutons[0].getBoundingClientRect();
        const atteint = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        const rm = modale.getBoundingClientRect();
        return {
            titre: o.querySelector('.modal-titre').textContent.trim(),
            message: [...o.querySelectorAll('p')].map(p => p.textContent.trim()),
            boutons: boutons.map(b => b.textContent.trim()),
            radios: o.querySelectorAll('input[type="radio"]').length,
            auDessus: atteint === boutons[0],
            dansLEcran: rm.left >= 0 && rm.right <= window.innerWidth && rm.top >= 0 && rm.bottom <= window.innerHeight,
            deborde: modale.scrollWidth > modale.clientWidth + 1,
            hauteurBouton: Math.round(r.height)
        };
    });
    const jugerFenetre = (f, titre, auDessusDe) => {
        expect(f.titre).toBe(titre);
        expect(f.message).toEqual([PHRASE]);
        expect(f.boutons).toEqual(['Fermer']);          // aucun « Adopter » : il n'y a rien à adopter
        expect(f.radios).toBe(0);
        expect(f.auDessus, 'la fenêtre doit passer au-dessus de ' + auDessusDe).toBe(true);
        expect(f.dansLEcran).toBe(true);
        expect(f.deborde).toBe(false);
        // Mesuré le 21 sept. 2026 : « Fermer » fait 37 px, comme TOUS les boutons d'action de `uiDialogues` (dont
        // « Adopter » et « Annuler » du lot 34). Sous la cible de 44 px, mais ce n'est pas ce lot : famille de #879.
        expect(f.hauteurBouton).toBeGreaterThanOrEqual(36);
    };
    const auDepart = await empreinte();

    /* ───── GESTE 1 : l'assistant — « + Nouvelle pratique » → « Partir d'un modèle » → « ✓ Créer la pratique » ───── */
    await page.evaluate(() => document.querySelector('button[data-action="creerNouvellePratique"]').click());
    await page.waitForFunction(() => document.getElementById('modalWizardPratiqueV2')?.classList.contains('actif'));
    const cocherEtSuivant = (nom, valeur) => page.evaluate(({ nom, valeur }) => {
        const el = document.querySelector(`input[name="${nom}"][value="${valeur}"]`);
        if (!el) return 'INTROUVABLE ' + nom + '=' + valeur;
        el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true }));
        document.getElementById('wizard-v2-btn-suivant').click();
        return 'ok';
    }, { nom, valeur });
    expect(await cocherEtSuivant('porteEntree', 'modele')).toBe('ok');
    await page.waitForFunction(() => window.wizardState.etapeActuelle === 'choix-modele');
    expect(await cocherEtSuivant('modeleChoisi', 'STD-n-recents')).toBe('ok');
    await page.waitForFunction(() => window.wizardState.etapeActuelle === 'recapitulatif');
    await page.evaluate(() => document.getElementById('wizard-v2-btn-creer').click());
    await page.waitForSelector('#overlay-ui-dialogue');
    jugerFenetre(await lireFenetre(), 'N plus récentes', 'l\'assistant');
    await page.click('#overlay-ui-dialogue button.btn-principal');
    await page.waitForFunction(() => !document.getElementById('overlay-ui-dialogue'));
    await page.waitForTimeout(400);
    expect(await empreinte(), 'geste 1 : rien n\'est écrit').toBe(auDepart);
    // L'assistant reste ouvert, au récapitulatif : on peut choisir autre chose ou le fermer.
    expect(await page.evaluate(() => document.getElementById('modalWizardPratiqueV2').classList.contains('actif') && window.wizardState.etapeActuelle)).toBe('recapitulatif');
    await page.evaluate(() => window.fermerWizardV2());

    /* ───── GESTE 2 : la bibliothèque des pratiques — le bouton « Ajouter » de la carte du modèle ───── */
    await page.evaluate(() => document.querySelector('button[data-action="afficherBibliothequePratiques"]').click());
    await page.waitForSelector('#modalBibliothequePratiques');
    const SEL_AJOUTER = '#modalBibliothequePratiques [data-action="ajouterPratiqueALaSelection"][data-param="STD-n-meilleurs"]';
    await page.waitForSelector(SEL_AJOUTER);
    await page.evaluate((s) => document.querySelector(s).click(), SEL_AJOUTER);
    await page.waitForSelector('#overlay-ui-dialogue');
    jugerFenetre(await lireFenetre(), 'N meilleures évaluations', 'la bibliothèque');
    await page.click('#overlay-ui-dialogue button.btn-principal');
    await page.waitForFunction(() => !document.getElementById('overlay-ui-dialogue'));
    await page.waitForTimeout(400);
    expect(await empreinte(), 'geste 2 : rien n\'est écrit').toBe(auDepart);
    expect(await page.evaluate(() => !!document.getElementById('modalBibliothequePratiques'))).toBe(true);

    // Témoin : un modèle d'une autre famille s'adopte toujours, sans fenêtre, dans ce même trimestre sans échelle.
    const SEL_SOM = '#modalBibliothequePratiques [data-action="ajouterPratiqueALaSelection"][data-param="SOM-litterature"]';
    if (await page.evaluate((s) => !!document.querySelector(s), SEL_SOM)) {
        await page.evaluate((s) => document.querySelector(s).click(), SEL_SOM);
        await page.waitForFunction((avant) => JSON.stringify([window.db.getSync(window.cle('pratiquesConfigurables'), null), window.db.getSync(window.cle('groupesCours'), null)]) !== avant, auDepart, { timeout: 8000 });
        expect(await page.evaluate(() => !!document.getElementById('overlay-ui-dialogue'))).toBe(false);
    }
    expect(erreurs).toEqual([]);
});

const STOCK_SOM = {
    id: 'pratique_STOCK_903', nom: 'Sommative du stock', auteur: 'A B', etablissement: '', description: '', discipline: '',
    type: 'sommative', variante: 'progressive', pratiques: ['SOM'], dansBibliotheque: true, dateCreation: '2026-09-10T12:00:00.000Z',
    configuration: { afficherRang: true, afficherMoyenneGroupe: true, reglesSommatives: ['remplacement', 'double_verrou', 'plafonnement'],
        remplacement: { actif: true, nbPaires: 3 },
        conditions_speciales: [
            { type: 'double_verrou', condition: { evaluation: 'Dissertation', comparateur: '<', seuil: 90 }, consequence: { action: 'echec', note_max: 50 } },
            { type: 'plafonnement', description: 'Examen non remis', consequence: { action: 'plafonner', valeur: 50 } }],
        reprises: { permises: true, mode: 'limite' } },
    calcul_note: { methode: 'moyenne_ponderee' },
    seuils: { type: 'pourcentage', va_bien: 80, difficulte: 70, grande_difficulte: 60 }, nbEvaluationsPrevues: 8,
    reglesSpeciales: ['remplacement', 'double_verrou', 'plafonnement']
};

test('#903 · une sommative du stock rouverte par « Éditer la pratique » du Comparateur : les cases ont disparu, l\'objet garde ses trois champs, le second diff est vide', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('dialog', (d) => { d.accept().catch(() => {}); });
    await ouvrirPackDemo(page);
    await page.evaluate((stock) => {
        const k = window.cle('pratiquesConfigurables');
        window.db.setSync(k, (window.db.getSync(k, []) || []).concat([stock])); // security-ok: fixture de test, objet qu'écrivait l'ancien assistant
    }, STOCK_SOM);

    const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x)) ? Object.keys(x).sort().reduce((o, c) => { o[c] = x[c]; return o; }, {}) : x);
    const lireStock = () => page.evaluate((id) => (window.db.getSync(window.cle('pratiquesConfigurables'), []) || []).find(p => p.id === id) || null, STOCK_SOM.id);
    const autres = () => page.evaluate((id) => JSON.stringify((window.db.getSync(window.cle('pratiquesConfigurables'), []) || []).filter(p => p.id !== id)), STOCK_SOM.id);
    const autresAuDepart = await autres();

    /** Labo › Comparateur : la pratique du stock dans une colonne, ce que la matrice en dit, puis « Éditer la pratique »
     *  et « Suivant » jusqu'au récapitulatif — ne remplit QUE les champs vides donnés. */
    const rouvrirEtParcourir = async (reponses) => {
        await page.evaluate(() => { window.afficherSection('labo'); window.afficherSousSection('labo-comparateur'); });
        // Le premier rendu du Comparateur est asynchrone : un `change` parti trop tôt est effacé par ce rendu.
        await page.waitForFunction((id) => [...document.querySelectorAll('#comparateur-matrice .comparateur-select option')].some(o => o.value === id), STOCK_SOM.id);
        // … et il peut repasser : le choix de la colonne et le clic sur « Éditer la pratique » se font dans la MÊME
        // passe, reprise tant que le bouton de cette pratique n'est pas à l'écran au moment de cliquer.
        const poignee = await page.waitForFunction((id) => {
            const bouton = document.querySelector('#comparateur-matrice [data-editer-id="' + id + '"]');
            if (bouton) { const texte = document.getElementById('comparateur-matrice').innerText; bouton.click(); return texte; }
            const sel = document.querySelector('#comparateur-matrice .comparateur-select[data-slot="1"]') || document.querySelector('#comparateur-matrice .comparateur-select');
            if (sel && sel.value !== id) { sel.value = id; sel.dispatchEvent(new Event('change', { bubbles: true })); }
            return false;
        }, STOCK_SOM.id, { polling: 250, timeout: 20000 });
        const matrice = await poignee.jsonValue();
        await page.waitForFunction(() => document.getElementById('modalWizardPratiqueV2')?.classList.contains('actif') && window.wizardState.modeEdition === true);
        const vu = { etapes: [], cartesRegles: null, texte: '', matrice };
        for (let tour = 0; tour < 20; tour++) {
            const etape = await page.evaluate(() => window.wizardState.etapeActuelle);
            vu.etapes.push(etape);
            vu.texte += '\n' + await page.evaluate(() => document.getElementById('modalWizardPratiqueV2').innerText);
            if (etape === 'regles-sommative') {
                vu.cartesRegles = await page.evaluate(() => [...document.querySelectorAll('input[name="reglesSommatives"]')].map(i => ({ valeur: i.value, coche: i.checked })));
            }
            if (etape === 'recapitulatif') return vu;
            await page.evaluate(({ reponses }) => {
                for (const [id, valeur] of Object.entries(reponses)) {
                    const el = document.getElementById('wizardv2-' + id);
                    if (!el || (el.value !== '' && el.value != null)) continue;
                    if (valeur === '*premier*' && el.tagName === 'SELECT') { const o = Array.from(el.options).find(o => o.value); if (o) el.value = o.value; }
                    else el.value = valeur;
                    el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new Event('input', { bubbles: true }));
                }
                document.getElementById('wizard-v2-btn-suivant').click();
            }, { reponses });
            await page.waitForFunction((e) => window.wizardState.etapeActuelle !== e, etape, { timeout: 4000 });
        }
        throw new Error('récapitulatif jamais atteint : ' + vu.etapes.join(' → '));
    };
    const enregistrer = async () => {
        await page.evaluate(() => document.getElementById('wizard-v2-btn-creer').click());
        await page.waitForFunction(() => !document.getElementById('modalWizardPratiqueV2')?.classList.contains('actif'), null, { timeout: 8000 });
        await page.waitForTimeout(400);
    };
    const jugerEcran = (vu) => {
        // Le Comparateur : le verrou est toujours annoncé ; ni le remplacement ni le plafonnement.
        expect(vu.matrice).toMatch(/Verrou sur une évaluation/);
        expect(vu.matrice).not.toMatch(/Remplacement automatique|remplace la mi-session|Plafonnement conditionnel/);
        expect(vu.cartesRegles, 'l\'étape des règles spéciales a été traversée').toEqual([
            { valeur: 'double_verrou', coche: true }, { valeur: 'portfolio', coche: false }, { valeur: 'aucune', coche: false }]);
        expect(vu.etapes).toContain('config-sommative-regles');
        expect(vu.texte).toMatch(/Verrou/);                              // le banc a bien lu l'écran
        expect(vu.texte).not.toMatch(/remplacement|plafonn|Reprises permises/i);
    };

    /* ───── PASSE 1 : l'assistant exige établissement et discipline, que ce stock ne portait pas ───── */
    jugerEcran(await rouvrirEtParcourir({ etablissement: 'Cégep banc', discipline: '*premier*' }));
    await enregistrer();
    const p1 = await lireStock();
    expect(p1.etablissement).toBe('Cégep banc');
    expect(p1.discipline).not.toBe('');
    // Tout le reste est l'objet du stock — les trois champs compris.
    expect(canon(Object.assign({}, p1, { etablissement: '', discipline: '' }))).toBe(canon(STOCK_SOM));
    expect(p1.configuration.remplacement).toEqual({ actif: true, nbPaires: 3 });
    expect(p1.configuration.conditions_speciales.map(c => c.type)).toEqual(['double_verrou', 'plafonnement']);
    expect(p1.configuration.reprises).toEqual({ permises: true, mode: 'limite' });

    /* ───── PASSE 2 : rouvrir, ne toucher à rien, enregistrer — le diff est vide ───── */
    jugerEcran(await rouvrirEtParcourir({}));
    await enregistrer();
    expect(canon(await lireStock())).toBe(canon(p1));
    expect(await autres(), 'les autres pratiques du pack ne bougent pas').toBe(autresAuDepart);
    expect(erreurs).toEqual([]);
});
