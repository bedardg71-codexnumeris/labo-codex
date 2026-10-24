import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1148 (24 oct. 2026) — LE CADRE : LA RANGÉE DE SÉLECTION EN TÊTE DES SIX ACCORDÉONS DU TRIMESTRE.
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-bibliotheques-menu-cadre.md (lot 2 sur 4).
//
// Pour chacun des six accordéons, dans le vrai index.html, depuis la démonstration :
//   · la rangée en tête : « Consulter la bibliothèque » (Trimestre, Cours, Groupe-cours), le menu,
//     « + Nouveau … » à droite, des cibles de 44 px ; plus de colonne de gauche ; le formulaire sur toute
//     la largeur de la rangée ;
//   · le menu fait ce qu'il faisait (le geste réel : `selectOption`, le dispatcher de main.js) : activer
//     (Trimestre), filtrer (Groupe), ouvrir la fiche (les quatre autres) ;
//   · « + Nouveau … » ouvre la création.
// La Carte d'alignement : son couple bouton + menu a l'apparence de la rangée, « Actions ▾ » marche.
// Et la défense livrée en chemin (règle 5) : un nom de programme importé n'entre plus brut dans le résumé.
// Noms fictifs. Contexte Playwright neuf à chaque essai.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(d.defaultValue()); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
}

async function ouvrirCadre(page, largeur = 1440) {
    await page.setViewportSize({ width: largeur, height: 900 });
    await page.evaluate(() => { window.afficherSection('calendrier'); window.afficherSousSection('calendrier-trimestre'); });
    await pause(page, 900);
}

/** Ouvre un accordéon fermé par son vrai en-tête. */
async function deplier(page, id) {
    const ferme = await page.evaluate((id) => document.getElementById(id).classList.contains('ferme'), id);
    if (ferme) {
        await page.locator(`#${id} > .accordeon-header`).click();
        await pause(page, 600);
    }
}

/** La rangée d'un accordéon, mesurée. */
const rangee = (page, id) => page.evaluate((id) => {
    const a = document.getElementById(id);
    const r = a.querySelector('.rangee-selection');
    const enfants = [...r.children].filter(e => e.offsetParent !== null);
    const boite = (e) => { const b = e.getBoundingClientRect(); return { g: Math.round(b.left), d: Math.round(b.right) }; };
    const fiche = a.querySelector('.panneau-formulaire');
    return {
        ordre: enfants.map(e => e.tagName === 'BUTTON' ? e.textContent.trim() : (e.querySelector('select') ? 'MENU' : e.tagName)),
        rangee: boite(r), fiche: boite(fiche), nouveau: boite(r.querySelector('.rangee-selection-nouveau')),
        hauteurs: [...r.querySelectorAll('button, select')].filter(e => e.offsetParent !== null).map(e => Math.round(e.getBoundingClientRect().height)),
        colonnes: a.querySelectorAll('.panneau-bibliotheque, .disposition-bibliotheque-formulaire').length,
        // Le menu garde la place de son chevron (`#calendrier-trimestre select` posait 6 px 10 px).
        paddingDroit: parseFloat(getComputedStyle(r.querySelector('select')).paddingRight)
    };
}, id);

const visible = (page, id) => page.evaluate((id) => {
    const el = document.getElementById(id);
    return !!el && !el.classList.contains('u-hide') && el.offsetParent !== null;
}, id);

/** La première option choisissable autre que celle déjà choisie. */
const autreOption = (page, menu) => page.evaluate((menu) => {
    const s = document.getElementById(menu);
    const o = [...s.options].find(o => o.value && !o.disabled && o.value !== s.value);
    return o ? o.value : null;
}, menu);

const ACCORDEONS = [
    { nom: 'Trimestre', id: 'accordeon-gestion-trimestres', menu: 'selectTrimestreActif', biblio: true, nouveau: '+ Nouveau trimestre' },
    { nom: 'Cours', id: 'accordeon-cours', menu: 'v2-selectCours', biblio: true, nouveau: '+ Nouveau cours', fiche: 'cours-formulaire-edition' },
    { nom: 'Enseignant·e', id: 'accordeon-enseignant', menu: 'v2-selectEnseignant', biblio: false, nouveau: '+ Nouveau profil', fiche: 'enseignant-formulaire-edition' },
    { nom: 'Étudiant·es', id: 'accordeon-groupe-etudiants', menu: 'v2-selectGroupe', biblio: false, nouveau: '+ Nouveau groupe' },
    { nom: 'Horaire', id: 'accordeon-horaire', menu: 'v2-selectHoraire', biblio: false, nouveau: '+ Nouvel horaire', fiche: 'v2-formulaireHoraire' },
    { nom: 'Groupe-cours', id: 'accordeon-groupe-cours', menu: 'v2-selectGroupeCours', biblio: true, nouveau: '+ Nouveau groupe-cours', fiche: 'v2-formulaireGroupeCours' }
];

for (const a of ACCORDEONS) {
    test(`${a.nom} : la rangée en tête, le formulaire sur toute la largeur, des cibles de 44 px`, async ({ page }) => {
        test.setTimeout(90000);
        await ouvrirDemo(page);
        await ouvrirCadre(page);
        await deplier(page, a.id);

        const r = await rangee(page, a.id);
        console.log(a.nom.toUpperCase(), 'RANGÉE →', JSON.stringify(r));
        expect(r.colonnes, 'plus de colonne de gauche').toBe(0);
        if (a.biblio) expect(r.ordre[0]).toBe('Consulter la bibliothèque');
        expect(r.ordre[a.biblio ? 1 : 0]).toBe('MENU');
        expect(r.ordre[r.ordre.length - 1]).toBe(a.nouveau);
        expect(r.rangee.d - r.nouveau.d, '« + Nouveau … » poussé à droite').toBeLessThanOrEqual(16);
        expect(r.fiche.d - r.fiche.g, 'le formulaire prend toute la largeur de la rangée').toBeGreaterThanOrEqual(r.rangee.d - r.rangee.g - 2);
        expect(Math.min(...r.hauteurs), 'cibles de 44 px').toBeGreaterThanOrEqual(44);
        expect(r.paddingDroit, 'la place du chevron').toBeGreaterThanOrEqual(30);
    });
}

test('Trimestre : le menu ACTIVE le trimestre choisi (son gestionnaire et le rechargement restent)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    // Un second trimestre, pour avoir un choix : fixture littérale du banc.
    await page.evaluate(() => {
        const t = window.db.getSync('trimestres', []);
        if (t.length < 2) window.db.setSync('trimestres', t.concat([{ id: 'h2027', nom: 'Hiver 2027', annee: 2027, session: 'H', actif: false, archive: false }]));
    });
    await ouvrirCadre(page);
    const avant = await page.evaluate(() => window.db.getSync('trimestreActif', null));
    const choix = await autreOption(page, 'selectTrimestreActif');
    expect(choix, 'un autre trimestre à choisir').not.toBeNull();
    await page.locator('#selectTrimestreActif').selectOption(choix);
    await pause(page, 2500);
    const apres = await page.evaluate(() => window.db.getSync('trimestreActif', null));
    console.log('TRIMESTRE ACTIF', avant, '→', apres);
    expect(apres).toBe(choix);
    await expect(page.locator('#selectTrimestreActif')).toHaveValue(choix);
    // Le libellé reste visible : ce menu fait autre chose qu'ouvrir une fiche.
    await expect(page.locator('#accordeon-gestion-trimestres label[for="selectTrimestreActif"]')).toBeVisible();
});

test('Étudiant·es : le menu FILTRE la liste ; « + Nouveau groupe » crée et choisit le groupe ; les actions sont en tête de la liste', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    // Trouvaille (antérieure au lot, inscrite au rapport) : un premier rendu de la liste à 0 élève pose
    // `display: none` sur les actions, qu'un rendu suivant avec élèves ne retire pas. On repart d'une page
    // rechargée, dont le premier rendu porte déjà les élèves de la démo.
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1500);
    await ouvrirCadre(page);
    await deplier(page, 'accordeon-groupe-etudiants');
    const lignes = () => page.locator('#v2-listeEtudiants tbody tr').count();
    // « Tous les groupes », puis le groupe de la démo : la liste suit le menu, aller et retour.
    await page.locator('#v2-selectGroupe').selectOption('');
    await pause(page, 900);
    const tous = await lignes();
    const choix = await autreOption(page, 'v2-selectGroupe');
    expect(choix, 'la démo a un groupe').not.toBeNull();
    // Un élève fictif d'un autre groupe : le filtre doit l'écarter (sinon le banc ne distingue rien).
    await page.evaluate(async () => {
        // security-ok: fixture littérale du banc.
        const cleE = window.cle('groupeEtudiants');
        const e = window.db.getSync(cleE, []);
        window.db.setSync(cleE, e.concat([{ ...e[0], da: '9990009', nom: 'Fictif', prenom: 'Ailleurs', groupe: '00099' }]));
        await window.chargerListeEtudiantsV2();
    });
    await pause(page, 600);
    const tousPlusUn = await lignes();
    expect(tousPlusUn, 'l’élève d’un autre groupe paraît sous « Tous les groupes »').toBe(tous + 1);
    await page.locator('#v2-selectGroupe').selectOption(choix);
    await pause(page, 900);
    console.log('FILTRE', tousPlusUn, '→', await lignes());
    expect(await lignes(), 'le filtre écarte l’élève d’un autre groupe').toBeLessThan(tousPlusUn);
    await expect(page.locator('#v2-selectGroupe')).toHaveValue(choix);
    await expect(page.locator('#accordeon-groupe-etudiants label[for="v2-selectGroupe"]')).toBeVisible();

    // Les actions : dans la liste, au-dessus du tableau, à droite.
    const actions = await page.evaluate(() => {
        const z = document.getElementById('v2-actionsEtudiants');
        const liste = document.getElementById('v2-listeEtudiants');
        const p = z.closest('.panneau-liste-etudiants').getBoundingClientRect();
        const b = z.getBoundingClientRect();
        return { visible: z.offsetParent !== null, auDessus: b.bottom <= liste.getBoundingClientRect().top + 1, droite: Math.round(p.right - b.right) };
    });
    console.log('ACTIONS →', JSON.stringify(actions));
    expect(actions.visible).toBe(true);
    expect(actions.auDessus).toBe(true);

    // « + Nouveau groupe » : la question d'Omnivox (acceptée telle quelle), puis le menu choisit le groupe neuf.
    await page.locator('#accordeon-groupe-etudiants .rangee-selection-nouveau').click();
    await pause(page, 900);
    const choisi = await page.locator('#v2-selectGroupe').inputValue();
    expect(choisi, 'le groupe neuf est choisi').not.toBe('');
});

for (const a of ACCORDEONS.filter(x => x.fiche)) {
    test(`${a.nom} : choisir dans le menu ouvre la fiche ; « ${a.nouveau} » ouvre la création`, async ({ page }) => {
        test.setTimeout(90000);
        await ouvrirDemo(page);
        await ouvrirCadre(page);
        await deplier(page, a.id);

        const choix = await autreOption(page, a.menu);
        if (choix) {
            await page.locator('#' + a.menu).selectOption(choix);
            await pause(page, 900);
            expect(await visible(page, a.fiche), 'la fiche s’ouvre').toBe(true);
            await expect(page.locator('#' + a.menu)).toHaveValue(choix);
        }
        await expect(page.locator(`#${a.id} label[for="${a.menu}"]`), 'libellé au lecteur d’écran').toHaveClass(/u-lecteur-ecran/);

        await page.locator(`#${a.id} .rangee-selection-nouveau`).click();
        await pause(page, 900);
        expect(await visible(page, a.fiche), 'la création s’ouvre').toBe(true);
    });
}

test('Groupe-cours : le résumé (complétude) passe sous la rangée quand une fiche est ouverte, et se tait sans fiche', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await ouvrirCadre(page);
    await deplier(page, 'accordeon-groupe-cours');
    // La démo n'a qu'un groupe-cours, déjà choisi : on le referme, puis on le rechoisit par le menu.
    const choix = await page.evaluate(() => ([...document.getElementById('v2-selectGroupeCours').options].find(o => o.value) || {}).value || null);
    expect(choix, 'la démo a un groupe-cours').not.toBeNull();
    await page.locator('#v2-selectGroupeCours').selectOption('');
    await pause(page, 600);
    await page.locator('#v2-selectGroupeCours').selectOption(choix);
    await pause(page, 900);
    const resume = page.locator('#v2-carteResumeGroupeCours');
    await expect(resume).toBeVisible();
    await expect(resume).toContainText(/Complet|configurés/);
    const ordre = await page.evaluate(() => {
        const r = document.querySelector('#accordeon-groupe-cours .rangee-selection').getBoundingClientRect();
        const c = document.getElementById('v2-carteResumeGroupeCours').getBoundingClientRect();
        const f = document.getElementById('v2-panneauFormGroupeCours').getBoundingClientRect();
        return { sousLaRangee: c.top >= r.bottom - 1, avantLaFiche: c.bottom <= f.top + 1 };
    });
    expect(ordre).toEqual({ sousLaRangee: true, avantLaFiche: true });
    await page.evaluate(() => window.mettreAJourCarteResumeGroupeCoursV2(null));
    await expect(resume, '« Aucun groupe-cours sélectionné » ne se répète pas sous la rangée').toBeHidden();
});

test('Règle 5 · un nom de programme importé entre ÉCHAPPÉ dans le résumé des élèves', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await ouvrirCadre(page);
    await page.evaluate(async () => {
        // security-ok: charge hostile littérale du banc, posée pour prouver l'échappement.
        // Les élèves de la démo sont remplacés par trois élèves fictifs : leur programme est alors le seul du
        // « top 3 » du résumé.
        const cleE = window.cle('groupeEtudiants');
        const coursId = ((window.db.getSync(cleE, [])[0]) || {}).coursId || '';
        window.db.setSync(cleE, ['Alix', 'Sam', 'Noa'].map((prenom, i) => (
            { da: '999000' + (i + 1), nom: 'Fictif', prenom, groupe: '00001', coursId, programme: '<img src=x id=programme-pirate>' })));
        await window.chargerListeEtudiantsV2();
    });
    await pause(page, 600);
    const r = await page.evaluate(() => ({
        balise: document.querySelectorAll('#v2-topProgrammes img, #programme-pirate').length,
        texte: (document.getElementById('v2-topProgrammes') || {}).textContent || ''
    }));
    console.log('PROGRAMMES →', JSON.stringify(r));
    expect(r.balise, 'aucune balise injectée').toBe(0);
    expect(r.texte, 'le nom est lu en texte').toContain('<img src=x id=programme-pirate>');
});

test('Carte d’alignement : le couple bouton + menu a l’apparence de la rangée ; « Actions ▾ » s’ouvre', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => naviguerVers('conception', 'carte'));
    await pause(page, 1500);
    const m = await page.evaluate(() => {
        const z = document.getElementById('planif-selecteur-cartes');
        const s = document.getElementById('planif-liste-cartes');
        const b = document.getElementById('planif-btn-bibliotheque');
        const rangee = document.querySelector('.rangee-selection');
        return {
            fond: getComputedStyle(z).backgroundColor,
            hauteurMenu: Math.round(s.getBoundingClientRect().height),
            hauteurBouton: Math.round(b.getBoundingClientRect().height),
            gras: getComputedStyle(s).fontWeight,
            apparence: getComputedStyle(s).webkitAppearance || getComputedStyle(s).appearance,
            fondAttendu: rangee ? getComputedStyle(rangee).backgroundColor : null
        };
    });
    console.log('CARTE →', JSON.stringify(m));
    expect(m.hauteurMenu).toBeGreaterThanOrEqual(44);
    expect(m.hauteurBouton).toBeGreaterThanOrEqual(44);
    expect(Number(m.gras)).toBeGreaterThanOrEqual(600);
    expect(m.apparence).toBe('none');
    if (m.fondAttendu) expect(m.fond, 'la bande bleu pâle de la rangée').toBe(m.fondAttendu);
    await page.locator('#planif-btn-actions').click();
    await pause(page, 400);
    await expect(page.locator('#planif-actions-dropdown')).toBeVisible();
});
