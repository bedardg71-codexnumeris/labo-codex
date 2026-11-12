import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// SUIVI LONGITUDINAL, LOT 1 (11 novembre 2026) — L'ONGLET « TENDANCES », SUR LE VRAI ÉCRAN.
//
// Labo › Suivi longitudinal, 1180 × 820 (iPad en paysage). Le registre est semé avec 24 inscrit·es FICTIF·VES sur trois
// cohortes (Automne 2024, Hiver 2025, Automne 2025), dans des cours qui ne sont PAS ceux de la littérature : rien de
// propre à une discipline n'est écrit dans le code (révision du 11 nov. au soir). Ce banc juge, par les vrais
// dispatchers (el.click(), événement change ; aucun page.click) :
//   T1 · les deux onglets, « Registre » inchangé, « Tendances » qui s'ouvre ; rien n'est écrit ;
//   T2 · la séquence se DÉCLARE dans l'onglet : sans elle, une invitation et aucun nuage ; déclarée, elle est rangée
//        sous sa clé, survit au rechargement, et le registre n'a pas bougé ;
//   T3 · les filtres — toutes les cohortes à l'ouverture, les saisons en raccourcis, une puce cochée une à une, un
//        second cours suivant (« pas encore de note »), les cibles de 44 px ; « Ce que ça dit » ne donne que des comptes ;
//   T4 · toucher une bille ouvre la bulle au bon nom, dans le cadre du nuage ; second toucher et × la ferment ;
//        la cible fait 28 px, la bille 11 px, sans animation, avec la sphère de `.barre-etudiant` ;
//   T5 · le pseudonyme en anonymisation, aucun nom à l'écran ;
//   T6 · « Voir son dossier » ramène à « Registre », sur le dossier ouvert ;
//   T7 · les captures, à 1180 × 820 et à 820 × 1180, en clair et en sombre (CAPTURES=<dossier> ; hors verdict).
// Le passage sous WebKit se fera sur le Mac : ici, Chromium (playwright.chromium.config.js).

const NOMS = ['Alder', 'Bruyère', 'Cormier', 'Dufresne', 'Érable', 'Frêne', 'Genévrier', 'Hêtre', 'If', 'Jonc', 'Kaki', 'Lilas',
    'Mélèze', 'Noyer', 'Orme', 'Pin', 'Quenouille', 'Roseau', 'Saule', 'Tilleul', 'Uva', 'Viorne', 'Yucca', 'Zinnia'];
const PRENOMS = ['Fictalix', 'Fictbéa', 'Fictcléo', 'Fictdan', 'Ficteli', 'Fictflo', 'Fictgab', 'Ficthugo', 'Fictinès', 'Fictjade', 'Fictkim', 'Fictléo',
    'Fictmia', 'Fictnoa', 'Fictoli', 'Fictpaz', 'Fictquin', 'Fictrox', 'Fictsam', 'Ficttom', 'Fictuma', 'Fictval', 'Fictyan', 'Fictzoé'];
const DA = (i) => String(2400001 + i);
const ORIGINE = '201-NYA-05';
const SUIVANT = '201-NYB-05';
const AUTRE = '201-NYC-05';
const UN_SUIVANT = { version: 1, origine: ORIGINE, suivants: [SUIVANT] };

/** `declaree` : la séquence rangée avant l'ouverture (null : rien n'est déclaré). */
async function monter(page, { largeur = 1180, hauteur = 820, clair = false, anonyme = false, declaree = UN_SUIVANT } = {}) {
    await page.setViewportSize({ width: largeur, height: hauteur });
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherSection === 'function'
        && typeof window.registreLongitudinal !== 'undefined' && typeof window.tendancesLongitudinal !== 'undefined');
    await page.evaluate(({ NOMS, PRENOMS, ORIGINE, SUIVANT, AUTRE, clair, anonyme, declaree }) => {
        // security-ok: fixtures littérales du banc, noms fictifs, aucune source externe.
        const cohortes = [['a2024', 'Automne 2024'], ['h2025', 'Hiver 2025'], ['a2025', 'Automne 2025']];
        let graine = 7;
        const alea = () => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine / 2147483648; };
        const eleves = {};
        NOMS.forEach((nom, i) => {
            const da = String(2400001 + i);
            const [trimestre, trimestreNom] = cohortes[i % 3];
            const noteOrigine = Math.round((52 + alea() * 44) * 10) / 10;
            const noteSuivant = Math.max(41, Math.min(98, Math.round(noteOrigine + (alea() - 0.55) * 30)));
            const apres = trimestre[0] === 'a' ? 'H' + (Number(trimestre.slice(1)) + 1) : 'A' + trimestre.slice(1);
            // Automne 2025 : seule une partie de la cohorte a déjà sa note du cours suivant.
            const resultats = i % 3 === 2 && i > 12 ? [] : [{ cours: SUIVANT, trimestre: apres, note: noteSuivant }];
            // Le second cours suivant : seule la première cohorte l'a déjà suivi.
            if (i % 3 === 0) resultats.push({ cours: AUTRE, trimestre: 'A2025', note: Math.max(45, noteSuivant - 4) });
            eleves[da] = { da, nom, prenom: PRENOMS[i], inscritLe: '2026-09-18', reprise913: true,
                dossiers: [{ capteLe: '2026-09-18T12:00:00.000Z', trimestre, trimestreNom, coursId: 'C1', coursCode: ORIGINE, groupe: '00001',
                    evaluations: [], presences: [], empreinte: { grilles: [], echelles: [] }, grillesIds: [], echellesIds: [],
                    // Le sixième (Frêne) : note d'origine non constructible — compté, pas placé.
                    indices: { cp: { actuel: { C: 90, P: noteOrigine, noteConstructible: i !== 5 } }, assiduite: null, patternsRaI: null } }],
                resultatsUlterieurs: resultats };
        });
        window.db.setSync('registreLongitudinal', { format: 'registre-longitudinal', version: 1, eleves, modeles: { grilles: {}, echelles: {} } });
        if (declaree) window.db.setSync('tendancesSequence', declaree);
        document.body.classList.toggle('mode-clair', clair);
        if (anonyme) window.estModeAnonymisation = () => true;
        window.afficherSection('labo');
        window.afficherSousSection('labo-longitudinal');
    }, { NOMS, PRENOMS, ORIGINE, SUIVANT, AUTRE, clair, anonyme, declaree });
    await page.waitForFunction(() => { const o = document.getElementById('rl-onglet-tendances'); return !!o && o.offsetParent !== null; });
    return erreurs;
}

const cliquer = (page, selecteur) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) throw new Error('absent : ' + s); el.click(); }, selecteur);
const ouvrirTendances = async (page) => { await cliquer(page, '#rl-onglet-tendances'); await page.waitForSelector('#rl-panneau h3'); };
const rangee = (page, cle) => page.evaluate((c) => JSON.stringify(window.db.getSync(c, null)), cle);
const enfonces = (page) => page.evaluate(() => Array.from(document.querySelectorAll('.tend-filtres .tend-bascule[aria-pressed="true"]')).map((b) => b.dataset.cours || b.dataset.saison || b.dataset.cohorte));
const nbBilles = (page) => page.evaluate(() => document.querySelectorAll('.tend-cible').length);
const phrasesDites = (page) => page.evaluate(() => Array.from(document.querySelectorAll('#tend-phrases li')).map((li) => li.textContent));

test.describe('Suivi longitudinal, lot 1 — l\'onglet « Tendances », 1180 × 820', () => {
    test('T1 · deux onglets : « Registre » inchangé, « Tendances » s\'ouvre, rien n\'est écrit', async ({ page }) => {
        const erreurs = await monter(page);
        const avant = [await rangee(page, 'registreLongitudinal'), await rangee(page, 'tendancesSequence')];
        const onglets = await page.evaluate(() => Array.from(document.querySelectorAll('.rl-onglets [role="tab"]')).map((o) => [o.textContent, o.getAttribute('aria-selected'), Math.round(o.getBoundingClientRect().height)]));
        expect(onglets.map((o) => o.slice(0, 2))).toEqual([['Registre', 'true'], ['Tendances', 'false']]);
        onglets.forEach((o) => expect(o[2]).toBeGreaterThanOrEqual(44));
        // « Registre » : l'écran d'avant, entier (recherche, saisie, liste des 24).
        expect(await page.evaluate(() => [!!document.getElementById('rl-zone-recherche'), !!document.querySelector('#rl-zone-saisie form'), document.querySelectorAll('.rl-eleve').length])).toEqual([true, true, 24]);

        await ouvrirTendances(page);
        expect(await page.evaluate(() => [document.getElementById('rl-onglet-tendances').getAttribute('aria-selected'), !!document.getElementById('rl-zone-recherche'),
            !!document.querySelector('#rl-panneau h3').textContent])).toEqual(['true', false, true]);
        expect(await nbBilles(page)).toBeGreaterThan(0);
        await cliquer(page, '#rl-onglet-registre');
        expect(await page.evaluate(() => document.querySelectorAll('.rl-eleve').length)).toBe(24);
        expect([await rangee(page, 'registreLongitudinal'), await rangee(page, 'tendancesSequence')]).toEqual(avant);
        expect(erreurs).toEqual([]);
    });

    test('T2 · la séquence se déclare dans l\'onglet : invitation sans elle, nuage avec elle, rangée sous sa clé, gardée au rechargement', async ({ page }) => {
        const erreurs = await monter(page, { declaree: null });
        const registreAvant = await rangee(page, 'registreLongitudinal');
        await ouvrirTendances(page);
        // Rien n'est déclaré : l'invitation, aucun nuage, et les cours offerts sont ceux du registre.
        const offre = await page.evaluate(() => ({ invite: document.querySelector('#rl-panneau .etat-vide-liste').textContent, plan: !!document.getElementById('tend-plan'),
            origines: Array.from(document.querySelectorAll('#tend-origine option')).map((o) => o.value),
            suivants: Array.from(document.querySelectorAll('.tend-sequence .tend-bascule')).map((b) => [b.dataset.cours, b.getAttribute('aria-pressed')]),
            hauteurs: [document.getElementById('tend-origine')].concat(Array.from(document.querySelectorAll('.tend-sequence .tend-bascule'))).map((e) => Math.round(e.getBoundingClientRect().height)) }));
        expect(offre.invite).toBe('Choisis un cours d\'origine et au moins un cours suivant pour voir le nuage.');
        expect(offre.plan).toBe(false);
        expect(offre.origines).toEqual(['', ORIGINE]);
        expect(offre.suivants).toEqual([[SUIVANT, 'false'], [AUTRE, 'false']]);
        offre.hauteurs.forEach((h) => expect(h).toBeGreaterThanOrEqual(44));
        expect(await rangee(page, 'tendancesSequence')).toBe('null');

        // L'origine seule ne suffit pas ; avec un cours suivant, le nuage paraît.
        await page.evaluate((ORIGINE) => { const liste = document.getElementById('tend-origine'); liste.value = ORIGINE; liste.dispatchEvent(new Event('change', { bubbles: true })); }, ORIGINE);
        await page.waitForFunction(() => { const s = window.db.getSync('tendancesSequence', null); return !!s && !!s.origine; });
        expect(await page.evaluate(() => !!document.getElementById('tend-plan'))).toBe(false);
        await cliquer(page, '.tend-sequence [data-cours="' + SUIVANT + '"]');
        await page.waitForSelector('#tend-plan');
        expect(JSON.parse(await rangee(page, 'tendancesSequence'))).toEqual({ version: 1, origine: ORIGINE, suivants: [SUIVANT] });
        expect(await nbBilles(page)).toBe(19);
        // Les mots de l'écran sont ceux des cours déclarés.
        const mots = await page.evaluate(() => ({ axes: Array.from(document.querySelectorAll('.tend-axe-nom')).map((p) => p.textContent), zones: Array.from(document.querySelectorAll('.tend-zone-nom')).map((z) => z.textContent) }));
        expect(mots.axes).toEqual(['Note en ' + SUIVANT, 'Note finale en ' + ORIGINE]);
        expect(mots.zones).toEqual(['Réussite en ' + ORIGINE + ' et en ' + SUIVANT, 'Réussite en ' + ORIGINE + ', échec en ' + SUIVANT, 'Sous 60 en ' + ORIGINE]);

        // Rechargée, l'application retrouve la séquence ; le registre n'a pas bougé.
        await page.reload();
        await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherSection === 'function' && typeof window.tendancesLongitudinal !== 'undefined');
        await page.evaluate(() => { window.afficherSection('labo'); window.afficherSousSection('labo-longitudinal'); });
        await ouvrirTendances(page);
        await page.waitForSelector('#tend-plan');
        expect(await page.evaluate(() => [document.getElementById('tend-origine').value, document.querySelector('.tend-sequence [aria-pressed="true"]').dataset.cours])).toEqual([ORIGINE, SUIVANT]);
        expect(await rangee(page, 'registreLongitudinal')).toBe(registreAvant);
        // Retirer le seul cours suivant : le nuage part, l'invitation revient.
        await cliquer(page, '.tend-sequence [data-cours="' + SUIVANT + '"]');
        await page.waitForFunction(() => !document.getElementById('tend-plan'));
        expect(JSON.parse(await rangee(page, 'tendancesSequence')).suivants).toEqual([]);
        expect(erreurs).toEqual([]);
    });

    test('T3 · les filtres : toutes les cohortes à l\'ouverture, saisons, puces une à une, second cours suivant, cibles de 44 px ; des comptes seulement', async ({ page }) => {
        const erreurs = await monter(page, { declaree: { version: 1, origine: ORIGINE, suivants: [SUIVANT, AUTRE] } });
        await ouvrirTendances(page);
        // À l'ouverture : le premier cours suivant, et TOUTES les cohortes — aucune saison n'est choisie d'office.
        expect(await enfonces(page)).toEqual([SUIVANT, 'toutes', 'a2024', 'h2025', 'a2025']);
        expect(await nbBilles(page)).toBe(19);   // 8 d'Automne 2024, 8 d'Hiver 2025, 3 d'Automne 2025 (4 ont leur note, dont 1 non placé·e)
        // « Ce que ça dit » : le compte de réussite et le compte des non placé·es. Rien qui juge les données.
        const dites = await phrasesDites(page);
        expect(dites.length).toBe(2);
        expect(dites[0]).toMatch(new RegExp('^\\d+ des \\d+ étudiant·es qui ont réussi le ' + ORIGINE + ' ont aussi réussi le ' + SUIVANT + '\\.$'));
        expect(dites[1]).toBe('1 inscrit·e n\'a pas de note de ' + ORIGINE + ' calculable et n\'est pas placé·e.');
        expect(await page.evaluate(() => document.getElementById('rl-panneau').textContent)).not.toMatch(/c'est peu|preuve|trop tôt|correcteur|hors séquence|Tu mêles|En général/);
        // Les comptes des trois zones font le compte des billes.
        const zones = await page.evaluate(() => Array.from(document.querySelectorAll('.tend-zone-compte')).map((z) => Number(z.textContent)));
        expect(zones.reduce((s, n) => s + n, 0)).toBe(19);

        await cliquer(page, '[data-saison="hiver"]');
        expect(await enfonces(page)).toEqual([SUIVANT, 'hiver', 'h2025']);
        expect(await nbBilles(page)).toBe(8);
        expect((await phrasesDites(page)).length).toBe(1);   // la personne non placée est d'Automne 2025
        await cliquer(page, '[data-saison="automne"]');
        expect(await enfonces(page)).toEqual([SUIVANT, 'automne', 'a2024', 'a2025']);
        expect(await nbBilles(page)).toBe(11);

        // Une puce, décochée seule : plus aucun bouton de saison n'est enfoncé ; recochée : « Automne » l'est de nouveau.
        await cliquer(page, '[data-cohorte="a2025"]');
        expect(await enfonces(page)).toEqual([SUIVANT, 'a2024']);
        await cliquer(page, '[data-cohorte="a2025"]');
        expect(await enfonces(page)).toEqual([SUIVANT, 'automne', 'a2024', 'a2025']);
        await cliquer(page, '[data-saison="toutes"]');

        // Le second cours suivant : seule la première cohorte y a des notes — les autres gardent leur puce, avec « pas encore de note ».
        await cliquer(page, '.tend-filtres [data-cours="' + AUTRE + '"]');
        expect(await enfonces(page)).toEqual([AUTRE, 'toutes', 'a2024', 'h2025', 'a2025']);
        expect(await nbBilles(page)).toBe(8);
        expect(await page.evaluate(() => Array.from(document.querySelectorAll('.tend-puce')).map((p) => p.textContent))).toEqual(
            ['Automne 2024', 'Hiver 2025pas encore de note', 'Automne 2025pas encore de note']);
        await cliquer(page, '[data-cohorte="a2024"]');
        expect(await page.evaluate(() => document.querySelector('.tend-nuage-vide').textContent)).toBe('Aucune note de ' + AUTRE + ' pour les cohortes cochées.');

        const hauteurs = await page.evaluate(() => Array.from(document.querySelectorAll('.tend-filtres .tend-bascule')).map((b) => Math.round(b.getBoundingClientRect().height)));
        expect(hauteurs.length).toBe(8);
        hauteurs.forEach((h) => expect(h).toBeGreaterThanOrEqual(44));
        expect(erreurs).toEqual([]);
    });

    test('T4 · toucher une bille ouvre la bulle au bon nom, dans le cadre ; second toucher et × la ferment', async ({ page }) => {
        const erreurs = await monter(page);
        await ouvrirTendances(page);

        // La cible : un vrai bouton nommé de 28 px ; la bille : 11 px, la sphère de .barre-etudiant, sans animation.
        const mesure = await page.evaluate((da) => {
            const cible = document.querySelector('.tend-cible[data-da="' + da + '"]');
            const bille = cible.querySelector('.tend-bille');
            const cs = getComputedStyle(bille);
            const r = cible.getBoundingClientRect(), rb = bille.getBoundingClientRect();
            return { balise: cible.tagName, nom: cible.getAttribute('aria-label'), cible: [Math.round(r.width), Math.round(r.height)], bille: [Math.round(rb.width), Math.round(rb.height)],
                classeSphere: bille.classList.contains('barre-etudiant'), degrade: cs.backgroundImage.startsWith('radial-gradient(circle at 30% 30%'),
                animation: cs.animationName, ombre: cs.boxShadow !== 'none', teinte: cs.backgroundColor, melange: cs.backgroundBlendMode };
        }, DA(0));
        expect(mesure.balise).toBe('BUTTON');
        expect(mesure.nom).toMatch(new RegExp('^Alder, Fictalix, Automne 2024, ' + ORIGINE + ' : [\\d,]+ · ' + SUIVANT + ' : [\\d,]+$'));
        expect(mesure.cible).toEqual([28, 28]);
        expect(mesure.bille).toEqual([11, 11]);
        expect([mesure.classeSphere, mesure.degrade, mesure.animation, mesure.ombre, mesure.melange]).toEqual([true, true, 'none', true, 'multiply']);
        expect(mesure.teinte).toBe('rgb(47, 127, 209)');
        // Une teinte par cohorte : trois cohortes, trois teintes.
        expect(await page.evaluate(() => new Set(Array.from(document.querySelectorAll('.tend-cible .tend-bille')).map((b) => getComputedStyle(b).backgroundColor)).size)).toBe(3);

        // Chaque bille, une à une : la bulle dit SON nom, et reste dans le cadre du nuage.
        const das = await page.evaluate(() => Array.from(document.querySelectorAll('.tend-cible')).map((c) => c.dataset.da));
        for (const da of das) {
            await cliquer(page, '.tend-cible[data-da="' + da + '"]');
            const etat = await page.evaluate((da) => {
                const bulle = document.getElementById('tend-bulle');
                const b = bulle.getBoundingClientRect(), p = document.getElementById('tend-plan').getBoundingClientRect();
                const cible = document.querySelector('.tend-cible[data-da="' + da + '"]');
                return { nom: bulle.querySelector('.tend-bulle-nom').textContent, notes: Array.from(bulle.querySelectorAll('.tend-bulle-notes')).map((p) => p.textContent).join(' · '), etiquette: cible.getAttribute('aria-label'),
                    dedans: b.left >= p.left && b.right <= p.right && b.top >= p.top && b.bottom <= p.bottom, nbBulles: document.querySelectorAll('.tend-bulle').length,
                    ouverte: cible.getAttribute('aria-expanded'), anneau: !!cible.querySelector('.tend-anneau') };
            }, da);
            const i = Number(da) - 2400001;
            expect(etat.nom, da).toBe(NOMS[i] + ', ' + PRENOMS[i]);
            expect(etat.etiquette, da).toContain(etat.nom + ', ');
            expect(etat.etiquette, da).toContain(etat.notes);
            expect([etat.dedans, etat.nbBulles, etat.ouverte, etat.anneau], da).toEqual([true, 1, 'true', true]);
        }
        // La bille touchée grossit (après sa transition) et son anneau est blanc.
        await page.waitForFunction(() => document.querySelector('.tend-cible-ouverte .tend-bille').getBoundingClientRect().width > 16);
        expect(await page.evaluate(() => getComputedStyle(document.querySelector('.tend-cible-ouverte .tend-anneau')).borderTopColor)).toBe('rgb(255, 255, 255)');

        // Second toucher : fermée. Rouverte, puis × : fermée.
        const dernier = das[das.length - 1];
        await cliquer(page, '.tend-cible[data-da="' + dernier + '"]');
        expect(await page.evaluate(() => [document.querySelectorAll('.tend-bulle').length, document.querySelectorAll('.tend-cible[aria-expanded="true"]').length])).toEqual([0, 0]);
        await cliquer(page, '.tend-cible[data-da="' + dernier + '"]');
        const fermer = await page.evaluate(() => { const f = document.querySelector('.tend-bulle-fermer'); const r = f.getBoundingClientRect(); return [f.getAttribute('aria-label'), Math.round(r.width), Math.round(r.height)]; });
        expect(fermer).toEqual(['Fermer', 44, 44]);
        await cliquer(page, '.tend-bulle-fermer');
        expect(await page.evaluate(() => document.querySelectorAll('.tend-bulle').length)).toBe(0);
        expect(erreurs).toEqual([]);
    });

    test('T5 · en anonymisation : le pseudonyme dans la bulle et sur les billes, aucun nom à l\'écran', async ({ page }) => {
        const erreurs = await monter(page, { anonyme: true });
        await ouvrirTendances(page);
        await cliquer(page, '.tend-cible[data-da="' + DA(0) + '"]');
        const rendu = await page.evaluate(() => {
            const panneau = document.getElementById('rl-panneau');
            return { texte: panneau.textContent + ' ' + Array.from(panneau.querySelectorAll('[aria-label]')).map((e) => e.getAttribute('aria-label')).join(' '),
                nom: document.querySelector('.tend-bulle-nom').textContent };
        });
        expect(rendu.nom).toBe('Élève R1');
        NOMS.concat(PRENOMS).forEach((nom) => expect(rendu.texte, nom).not.toMatch(new RegExp('(^|[^\\p{L}])' + nom + '(?![\\p{L}])', 'u')));
        expect((rendu.texte.match(/Élève R\d+/g) || []).length).toBeGreaterThanOrEqual(19);
        expect(erreurs).toEqual([]);
    });

    test('T6 · « Voir son dossier » ramène à « Registre », sur le dossier ouvert de cet·te étudiant·e', async ({ page }) => {
        const erreurs = await monter(page);
        await ouvrirTendances(page);
        await cliquer(page, '.tend-cible[data-da="' + DA(13) + '"]');
        const lien = await page.evaluate(() => { const b = document.querySelector('.tend-bulle-dossier'); return [b.textContent, Math.round(b.getBoundingClientRect().height)]; });
        expect(lien[0]).toBe('Voir son dossier');
        expect(lien[1]).toBeGreaterThanOrEqual(44);
        await cliquer(page, '.tend-bulle-dossier');
        const etat = await page.evaluate(() => {
            const ouverts = Array.from(document.querySelectorAll('.rl-dossier')).filter((d) => d.open).map((d) => d.closest('.rl-eleve'));
            // Le nom de la rangée est À L'ÉCRAN, et rien ne le recouvre (un en-tête collant le cacherait).
            const nom = ouverts[0] ? ouverts[0].querySelector('.rl-nom') : null;
            const r = nom ? nom.getBoundingClientRect() : null;
            const dessus = r ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
            return { onglet: document.getElementById('rl-onglet-registre').getAttribute('aria-selected'), tendances: !!document.getElementById('tend-plan'),
                ouverts: ouverts.map((li) => [li.dataset.da, li.querySelector('.rl-nom').textContent]),
                visible: !!r && r.top >= 0 && r.bottom < window.innerHeight && dessus === nom, haut: r && r.top, foyer: document.activeElement === (ouverts[0] && ouverts[0].querySelector('.rl-dossier > summary')), titre: ouverts[0] ? ouverts[0].querySelector('.rl-dossier-bloc h4').textContent : '' };
        });
        expect([etat.onglet, etat.tendances]).toEqual(['true', false]);
        expect(etat.ouverts).toEqual([[DA(13), 'Noyer, Fictnoa']]);
        expect(etat.visible, 'haut du nom : ' + etat.haut).toBe(true);
        expect(etat.foyer).toBe(true);
        expect(etat.titre).toContain('Hiver 2025');
        // Changer d'onglet puis revenir : le dossier ne reste pas ouvert de force.
        await cliquer(page, '#rl-onglet-tendances');
        await cliquer(page, '#rl-onglet-registre');
        expect(await page.evaluate(() => Array.from(document.querySelectorAll('.rl-dossier')).filter((d) => d.open).length)).toBe(0);
        expect(erreurs).toEqual([]);
    });

    // Les captures de la livraison : CAPTURES=<dossier où les ranger> npx playwright test -c playwright.chromium.config.js suivi-tendances-lot1
    test('T7 · captures à 1180 × 820 et à 820 × 1180, en clair et en sombre', async ({ page }) => {
        test.skip(!process.env.CAPTURES, 'captures : seulement sur demande (CAPTURES=<dossier>)');
        const dossier = path.resolve(process.env.CAPTURES);
        fs.mkdirSync(dossier, { recursive: true });
        for (const [largeur, hauteur] of [[1180, 820], [820, 1180]]) {
            for (const clair of [false, true]) {
                await monter(page, { largeur, hauteur, clair, declaree: { version: 1, origine: ORIGINE, suivants: [SUIVANT, AUTRE] } });
                await ouvrirTendances(page);
                await cliquer(page, '.tend-cible[data-da="' + DA(13) + '"]');
                await page.evaluate(() => { document.activeElement && document.activeElement.blur(); document.querySelector('.rl-onglets').scrollIntoView(); });
                // Une image nette : le fondu d'ouverture de la section et la bille qui grossit sont finis (les animations sans fin ne s'attendent pas).
                await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect && isFinite(a.effect.getComputedTiming().endTime)).map((a) => a.finished.catch(() => {}))));
                await page.waitForFunction(() => document.querySelector('.tend-cible-ouverte .tend-bille').getBoundingClientRect().width > 16.9);
                await page.screenshot({ path: path.join(dossier, `chromium-${largeur}x${hauteur}-${clair ? 'clair' : 'sombre'}.png`) });
            }
        }
    });
});
