import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1151 (24 oct. 2026) — LE PROFIL INDIVIDUEL : LA RANGÉE DE SÉLECTION AU LIEU DE LA BARRE LATÉRALE.
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-profil-individuel-rangee.md (lot 2 bis).
//
// Dans le vrai index.html, depuis la démonstration :
//   · plus de barre latérale dans le profil ; le titre « Profils individuels » et ses deux aides ;
//   · la rangée : « Liste des étudiant·es », ‹ le menu ›, le compte, les étiquettes ; puis les sections
//     en boutons, dans l'ordre d'avant ; 44 px ;
//   · le menu ouvre l'élève choisi ; ‹ et › changent d'élève et se désactivent aux bouts ;
//   · chaque bouton ouvre sa section et seul lui est plein — y compris après un appel programmatique
//     (`changerSectionProfil('mobilisation')`, celui de tableau-bord-apercu.js) ; la section suit l'élève ;
//   · « Jugement » n'apparaît qu'avec une pratique par dénotation ; « Liste des étudiant·es » mène à la liste ;
//   · en anonymisation, aucun DA dans la rangée.
// Noms fictifs (pack démo). Contexte Playwright neuf à chaque essai.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const SECTIONS_DEMO = ['Productions', 'Engagement ACP', 'Progression temporelle ACP', 'Développement des habiletés',
    'Accompagnement', 'Travaux soumis', 'Rapport'];

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirDemo(page, largeur = 1440) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.setViewportSize({ width: largeur, height: 900 });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
}

/** Ouvre le profil du N-ième élève du menu (0 : le premier), comme le fait la Liste. */
async function ouvrirProfil(page, rang = 1) {
    await page.evaluate((rang) => {
        window.afficherSection('suivi');
        const tous = window.obtenirEtudiantsCoursActif().filter(e => !window.estEtudiantExclu(e))
            .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
        window.afficherProfilComplet(tous[rang].da);
    }, rang);
    await pause(page, 700);
}

/** La rangée, mesurée. */
const rangee = (page) => page.evaluate(() => {
    const r = document.querySelector('#contenuProfilEtudiant .rangee-selection-profil');
    if (!r) return null;
    const visibles = (racine) => [...racine.children].filter(e => e.offsetParent !== null && !e.classList.contains('u-lecteur-ecran'));
    const ligne = r.querySelector('.rangee-selection-ligne');
    const pas = r.querySelector('.rangee-selection-pas');
    const nom = (e) => e.tagName === 'SELECT' ? 'MENU' : (e.className.includes('etiquettes') ? 'ÉTIQUETTES' : (e.className.includes('pas') ? 'PAS' : e.textContent.trim()));
    const boite = (e) => { const b = e.getBoundingClientRect(); return { g: Math.round(b.left), d: Math.round(b.right), h: Math.round(b.top) }; };
    const sections = [...r.querySelectorAll('.rangee-selection-sections [data-action="changerSectionProfil"]')];
    return {
        ligne: visibles(ligne).map(nom),
        pas: visibles(pas).map(nom),
        compte: pas.querySelector('.rangee-selection-compte').textContent.trim(),
        etiquettes: [...r.querySelectorAll('.rangee-selection-etiquette')].map(e => e.textContent.replace(/\s+/g, ' ').trim()),
        sections: sections.map(b => b.textContent.trim()),
        pleines: sections.filter(b => b.getAttribute('aria-current') === 'true').map(b => b.dataset.param),
        hauteurs: [...r.querySelectorAll('button, select')].map(e => Math.round(e.getBoundingClientRect().height)),
        largeurs: [...r.querySelectorAll('.rangee-selection-fleche')].map(e => Math.round(e.getBoundingClientRect().width)),
        precedentDesactive: document.getElementById('profilElevePrecedent').disabled,
        suivantDesactive: document.getElementById('profilEleveSuivant').disabled,
        deborde: r.scrollWidth > r.clientWidth + 1 || document.documentElement.scrollWidth > window.innerWidth + 1,
        rangeeBoite: boite(r), pasBoite: boite(pas), ligneBoite: boite(ligne),
        contenuBoite: boite(document.getElementById('profil-contenu-dynamique')),
        titreSection: (document.querySelector('#profil-contenu-dynamique .profil-contenu-header h2') || {}).textContent || null,
        titreVisible: (() => { const h = document.querySelector('#profil-contenu-dynamique .profil-contenu-header h2'); return !!h && h.getBoundingClientRect().width > 1; })(),
        da: window.profilActuelDA,
        texte: r.textContent
    };
});

test('#1151 · la rangée remplace la barre latérale : titre, ordre, 44 px, compte, étiquettes, sections, pleine largeur', async ({ page }) => {
    await ouvrirDemo(page);
    await ouvrirProfil(page, 1);
    const sousSection = await page.evaluate(() => {
        const s = document.getElementById('suivi-profil');
        const h2 = s.querySelector(':scope > h2.titre-avec-emoji-toggles');
        return {
            active: s.classList.contains('active'),
            barre: s.querySelectorAll('.layout-sidebar-2col, .sidebar-navigation, .sidebar-item, .sidebar-info-card').length,
            titre: h2 ? h2.querySelector('span').textContent.trim() : null,
            aides: h2 ? [...h2.querySelectorAll('.btn-aide-contextuelle')].map(b => b.dataset.aide) : []
        };
    });
    expect(sousSection).toEqual({ active: true, barre: 0, titre: 'Profils individuels',
        aides: ['profil-etudiant-indicateurs', 'profil-etudiant-accompagnement'] });

    const r = await rangee(page);
    expect(r.ligne).toEqual(['Liste des étudiant·es', 'PAS', 'ÉTIQUETTES']);
    expect(r.pas).toEqual(['‹', 'MENU', '›', r.compte]);
    expect(r.compte).toMatch(/^2 sur \d+$/);
    expect(r.etiquettes.some(t => /^Groupe \S+/.test(t))).toBe(true);
    expect(r.etiquettes.some(t => /^Programme \S+/.test(t))).toBe(true);
    expect(r.sections).toEqual(SECTIONS_DEMO);                           // Jugement absent : la démo n'est pas en dénotation
    expect(r.pleines).toEqual(['productions']);
    expect(r.hauteurs.every(h => h >= 44)).toBe(true);
    expect(r.largeurs).toEqual([44, 44]);
    expect(r.deborde).toBe(false);
    // La section sur toute la largeur de la rangée ; son titre au lecteur d'écran seul.
    expect(Math.abs(r.contenuBoite.g - r.rangeeBoite.g)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.contenuBoite.d - r.rangeeBoite.d)).toBeLessThanOrEqual(1);
    expect(r.titreSection).toBe('Productions et évaluations');
    expect(r.titreVisible).toBe(false);
});

test('#1151 · le menu ouvre l\'élève choisi ; ‹ et › changent d\'élève et se désactivent aux bouts', async ({ page }) => {
    await ouvrirDemo(page);
    await ouvrirProfil(page, 1);
    const options = await page.evaluate(() => [...document.getElementById('selecteurEtudiantProfil').options].map(o => o.value));

    // Le geste réel : le menu (dispatcher data-on-change de main.js).
    await page.selectOption('#selecteurEtudiantProfil', options[3]);
    await pause(page, 500);
    let r = await rangee(page);
    expect([r.da, r.compte]).toEqual([options[3], `4 sur ${options.length}`]);

    await page.click('#profilEleveSuivant');
    await pause(page, 500);
    r = await rangee(page);
    expect([r.da, r.compte]).toEqual([options[4], `5 sur ${options.length}`]);
    // Au clavier, le focus reste sur la flèche : le rendu remplace la rangée. (Sous WebKit, un clic ne donne pas
    // le focus à un bouton : c'est le geste du clavier qu'on éprouve.)
    await page.focus('#profilEleveSuivant');
    await page.keyboard.press('Enter');
    await pause(page, 500);
    r = await rangee(page);
    expect([r.da, await page.evaluate(() => document.activeElement && document.activeElement.id)]).toEqual([options[5], 'profilEleveSuivant']);
    await page.click('#profilElevePrecedent');
    await pause(page, 500);

    await page.click('#profilElevePrecedent');
    await pause(page, 500);
    expect((await rangee(page)).da).toBe(options[3]);

    // Aux bouts.
    await page.selectOption('#selecteurEtudiantProfil', options[0]);
    await pause(page, 500);
    r = await rangee(page);
    expect([r.precedentDesactive, r.suivantDesactive, r.compte]).toEqual([true, false, `1 sur ${options.length}`]);
    await page.selectOption('#selecteurEtudiantProfil', options[options.length - 1]);
    await pause(page, 500);
    r = await rangee(page);
    expect([r.precedentDesactive, r.suivantDesactive]).toEqual([false, true]);
});

test('#1151 · chaque bouton ouvre sa section, seul lui est plein — y compris par appel programmatique — et la section suit l\'élève', async ({ page }) => {
    await ouvrirDemo(page);
    await ouvrirProfil(page, 1);
    const ATTENDU = { productions: 'Productions et évaluations', mobilisation: 'Engagement ACP', progression: 'Progression temporelle ACP',
        performance: 'Développement des habiletés', accompagnement: 'Accompagnement', travaux: 'Travaux soumis', rapport: 'Rapport' };
    for (const [id, titre] of Object.entries(ATTENDU)) {
        await page.click(`.rangee-selection-sections [data-param="${id}"]`);
        await pause(page, 300);
        const r = await rangee(page);
        expect([id, r.pleines, r.titreSection]).toEqual([id, [id], titre]);
    }

    // L'appel de tableau-bord-apercu.js (clic sur A, C ou P dans le Suivi du groupe) : sans clic, sans `event`.
    await page.evaluate(() => window.changerSectionProfil('mobilisation'));
    await pause(page, 300);
    let r = await rangee(page);
    expect([r.pleines, r.titreSection]).toEqual([['mobilisation'], 'Engagement ACP']);

    // La section suit l'élève.
    const avant = r.da;
    await page.click('#profilEleveSuivant');
    await pause(page, 500);
    r = await rangee(page);
    expect(r.da).not.toBe(avant);
    expect([r.pleines, r.titreSection]).toEqual([['mobilisation'], 'Engagement ACP']);
});

test('#1151 · « Jugement » n\'apparaît qu\'avec une pratique par dénotation, juste après Productions', async ({ page }) => {
    await ouvrirDemo(page);
    await ouvrirProfil(page, 1);
    expect((await rangee(page)).sections).not.toContain('Jugement');
    // La condition d'aujourd'hui (`denotationSaisie.estActive()`) ; l'activation réelle d'une DEN est couverte par denotation-saisie-DEN2.
    await page.evaluate(() => { window.denotationSaisie.estActive = () => true; window.afficherProfilComplet(window.profilActuelDA); });
    await pause(page, 500);
    const r = await rangee(page);
    expect(r.sections).toEqual(['Productions', 'Jugement', ...SECTIONS_DEMO.slice(1)]);
    await page.click('.rangee-selection-sections [data-param="jugement"]');
    await pause(page, 300);
    expect((await rangee(page)).pleines).toEqual(['jugement']);
});

test('#1151 · « Liste des étudiant·es » mène à la liste', async ({ page }) => {
    await ouvrirDemo(page);
    await ouvrirProfil(page, 1);
    await page.click('#contenuProfilEtudiant .rangee-selection-profil >> text=Liste des étudiant·es');
    await pause(page, 600);
    const etat = await page.evaluate(() => ({
        liste: document.getElementById('suivi-liste').classList.contains('active'),
        profil: document.getElementById('suivi-profil').classList.contains('active')
    }));
    expect(etat).toEqual({ liste: true, profil: false });
});

test('#1151 · en anonymisation, aucun DA dans la rangée', async ({ page }) => {
    await ouvrirDemo(page);
    await ouvrirProfil(page, 1);
    // Témoin : hors anonymisation, le DA est dans le menu (sinon l'absence plus bas ne prouverait rien).
    const da = (await rangee(page)).da;
    expect((await rangee(page)).texte).toContain(da);
    await page.evaluate(async () => { await window.changerMode('anonymisation'); });
    await pause(page, 1000);
    await ouvrirProfil(page, 1);
    const r = await rangee(page);
    expect(r).not.toBeNull();
    expect(r.texte).not.toMatch(/DEMO\d{3}/);
});

for (const largeur of [1180, 820, 700]) {
    test(`#1151 · à ${largeur} px : rien ne déborde, 44 px au doigt${largeur < 760 ? ', ‹ menu › sur sa ligne' : ''}`, async ({ page }) => {
        await ouvrirDemo(page, largeur);
        await ouvrirProfil(page, 1);
        await page.click('.rangee-selection-sections [data-param="performance"]');
        await pause(page, 400);
        const r = await rangee(page);
        expect(r.deborde).toBe(false);
        expect(r.hauteurs.every(h => h >= 44)).toBe(true);
        if (largeur < 760) {
            // ‹ menu › prend toute la largeur de la ligne.
            expect(Math.abs(r.pasBoite.g - r.ligneBoite.g)).toBeLessThanOrEqual(1);
            expect(Math.abs(r.pasBoite.d - r.ligneBoite.d)).toBeLessThanOrEqual(1);
        }
    });
}
