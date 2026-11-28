import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// MÉMOS DU CANEVAS (28 nov. 2026) — les six gestes acceptés par Grégoire, joués au navigateur,
// et CHAQUE SITE qui recopie la carte : un site oublié et des mémos se perdent en chemin.
//   emportent les mémos : enregistrement, rechargement, annuler/rétablir, duplication,
//                         « Garder dans ma bibliothèque » puis « Utiliser dans ce trimestre »,
//                         reprise d'un autre trimestre ;
//   les écartent        : le fichier exporté (les deux chemins), l'export du plan, un fichier reçu.
// Les fonctions pures et la couche de données ont leur banc Vitest (sentinelle-memos-canevas).

const DEVIS = Array.from({ length: 60 }, (_, i) => `Élément ${i + 1} de la compétence : énoncé fictif du devis.`).join('\n');

// La carte d'un espace vide, sans la démo (modèle de planif-glisser-relachement-1295) : chaque
// attente est une condition, aucune pause fixe. Une petite carte est semée, sans mémo.
const CARTE_SEMEE = { compteur: 3, compteurLiens: 1,
    noeuds: [
        { id: 'planif-noeud_1', type: 'lecon', titre: 'Leçon de banc', description: '', x: -260, y: -160, parent: null, enfants: ['planif-noeud_2'], metadata: {}, cloneSourceId: null },
        { id: 'planif-noeud_2', type: 'activite', titre: 'Activité de banc', description: '', x: -240, y: -90, parent: 'planif-noeud_1', enfants: [], metadata: {}, cloneSourceId: null },
        { id: 'planif-noeud_3', type: 'factuelle', titre: 'Connaissance de banc', description: '', x: 140, y: 120, parent: null, enfants: [], metadata: {}, cloneSourceId: null }
    ],
    liens: [{ id: 'planif-lien_1', source: 'planif-noeud_3', cible: 'planif-noeud_2', type: 's_acquiert_par' }] };

async function ouvrirCarte(page) {
    await page.goto(indexHtml);
    await attendreApplication(page);
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('section-conception')?.classList.add('active');
        document.getElementById('conception-carte')?.classList.add('active');
    });
    await page.evaluate((carte) => {
        const C = window.planificationCarte, D = window.planificationDonnees;
        C.initialiser(); C.activer();
        D.sauvegarderCarte(D.getIndex().active, carte);
        C.chargerCarte(D.getIndex().active);
        document.getElementById('transition-bandeau')?.remove();
    }, CARTE_SEMEE);
    await page.waitForFunction(() => document.querySelectorAll('#planif-couche-noeuds .planif-noeud').length === 3);
    await deuxImages(page);
}
const deuxImages = (page) => page.evaluate(() => new Promise((fin) => requestAnimationFrame(() => requestAnimationFrame(fin))));

const memos = (page) => page.evaluate(() => Array.from(window.planificationCarte.etat.memos.values()).map(m => ({ ...m })));
const enregistres = (page) => page.evaluate(() => {
    const D = window.planificationDonnees;
    return (D.chargerCarte(D.getIndex().active) || {}).memos || null;
});
// L'enregistrement d'une frappe attend 500 ms sans frappe : on attend que la carte ENREGISTRÉE
// porte ce que le canevas montre, pas un délai.
const attendreEcriture = (page) => page.waitForFunction(() => {
    const D = window.planificationDonnees;
    const vivants = Array.from(window.planificationCarte.etat.memos.values());
    return JSON.stringify((D.chargerCarte(D.getIndex().active) || {}).memos || []) === JSON.stringify(vivants);
});

async function poserMemo(page, texte) {
    await page.locator('#planif-palette-memo').click();
    const champ = page.locator('.planif-memo-texte').last();
    await expect(champ).toBeFocused();
    if (texte) await page.keyboard.insertText(texte);
    await attendreEcriture(page);
    return champ;
}

test.describe('Mémos du canevas', () => {
    let erreurs;
    test.beforeEach(async ({ page }) => {
        erreurs = [];
        page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
        page.on('dialog', (d) => d.accept());
        await ouvrirCarte(page);
    });
    test.afterEach(() => { expect(erreurs, erreurs.join(' | ')).toEqual([]); });

    test('une carte d\'avant le lot s\'ouvre sans être réécrite, et sans clé « memos »', async ({ page }) => {
        const r = await page.evaluate(() => {
            const D = window.planificationDonnees, C = window.planificationCarte;
            const id = D.getIndex().active;
            const avant = JSON.stringify(D.chargerCarte(id));
            C.chargerCarte(id);
            C.sauvegarder();
            const apres = D.chargerCarte(id);
            return { identique: JSON.stringify(apres) === avant, cle: 'memos' in apres, n: C.etat.memos.size };
        });
        expect(r.n).toBe(0);
        expect(r.cle, 'une carte sans mémo ne porte pas la clé').toBe(false);
        expect(r.identique, 'ouvrir puis enregistrer ne change pas un octet').toBe(true);
    });

    test('geste 1 — la palette pose un mémo, à l\'écart des blocs ; il n\'est pas un bloc', async ({ page }) => {
        const avant = await page.evaluate(() => window.planificationCarte.etat.noeuds.size);
        const bouton = page.locator('#planif-palette-memo');
        await expect(bouton).toBeVisible();
        expect(await bouton.evaluate(b => !b.classList.contains('planif-palette-btn') && !b.dataset.type && !b.closest('.planif-palette-categorie')),
            'le bouton n\'est ni un bouton de bloc ni dans une famille de blocs').toBe(true);
        await poserMemo(page, '');
        const m = await memos(page);
        expect(m).toHaveLength(1);
        expect(await page.evaluate(() => window.planificationCarte.etat.noeuds.size), 'aucun bloc créé').toBe(avant);
        await expect(page.locator('.planif-memo')).toBeInViewport();
        expect(await enregistres(page)).toHaveLength(1);
    });

    test('geste 2 — écrire, et coller : seul le texte entre, retours à la ligne gardés, aucun HTML', async ({ page }) => {
        const champ = await poserMemo(page, 'Idée : ');
        // Le collage natif d'un <textarea> ne se rejoue pas par un événement synthétique. On prouve la
        // propriété qui compte : ce que le champ REÇOIT, balises comprises, n'est jamais interprété.
        await champ.fill('Idée : <b>gras</b> <img src=x onerror="window.__xss=1">\nligne 2\n\nligne 4');
        await attendreEcriture(page);
        const m = (await memos(page))[0];
        expect(m.texte).toBe('Idée : <b>gras</b> <img src=x onerror="window.__xss=1">\nligne 2\n\nligne 4');
        const dom = await page.evaluate(() => ({
            enfants: document.querySelector('.planif-memo').querySelectorAll('b, img, script').length,
            xss: window.__xss || 0,
            balise: document.querySelector('.planif-memo-texte').tagName
        }));
        expect(dom.balise, 'le texte vit dans un <textarea> : texte brut par construction').toBe('TEXTAREA');
        expect(dom.enfants, 'aucune balise née du texte').toBe(0);
        expect(dom.xss).toBe(0);
        // Rechargé depuis l'enregistrement : même texte, toujours inerte.
        await page.evaluate(() => { const D = window.planificationDonnees; window.planificationCarte.chargerCarte(D.getIndex().active); });
        expect(await page.locator('.planif-memo-texte').inputValue()).toBe(m.texte);
        expect(await page.evaluate(() => document.querySelector('.planif-memo').querySelectorAll('b, img, script').length + (window.__xss || 0))).toBe(0);
    });

    test('geste 3 — déplacer par la barre, agrandir par le coin ; un long texte défile dans le mémo', async ({ page }) => {
        const champ = await poserMemo(page, '');
        await champ.fill(DEVIS);
        await attendreEcriture(page);
        const depart = (await memos(page))[0];
        const boite = await page.locator('.planif-memo').boundingBox();
        const defile = await champ.evaluate(el => ({ contenu: el.scrollHeight, vue: el.clientHeight }));
        expect(defile.contenu, 'le texte dépasse : il défile').toBeGreaterThan(defile.vue * 2);
        expect(Math.round(boite.height), 'le long texte n\'étire pas le mémo').toBe(depart.h);
        await champ.evaluate(el => { el.scrollTop = 300; });
        expect(await champ.evaluate(el => el.scrollTop)).toBe(300);

        const blocs = await page.evaluate(() => JSON.stringify(Array.from(window.planificationCarte.etat.noeuds.values()).map(n => [n.id, n.x, n.y, n.parent])));
        const barre = await page.locator('.planif-memo-barre').boundingBox();
        await page.mouse.move(barre.x + 30, barre.y + barre.height / 2);
        await page.mouse.down();
        await page.mouse.move(barre.x + 90, barre.y + 50, { steps: 5 });
        await page.mouse.move(barre.x + 150, barre.y + barre.height / 2 + 80, { steps: 5 });
        await page.mouse.up();
        const deplace = (await memos(page))[0];
        expect(deplace.x - depart.x).toBe(120);
        expect(deplace.y - depart.y).toBe(80);
        expect((await enregistres(page))[0].x, 'la position est enregistrée').toBe(deplace.x);
        expect(await page.evaluate(() => JSON.stringify(Array.from(window.planificationCarte.etat.noeuds.values()).map(n => [n.id, n.x, n.y, n.parent]))),
            'déplacer un mémo ne touche aucun bloc').toBe(blocs);

        const coin = await page.locator('.planif-memo-poignee').boundingBox();
        await page.mouse.move(coin.x + coin.width / 2, coin.y + coin.height / 2);
        await page.mouse.down();
        await page.mouse.move(coin.x + 60, coin.y + 40, { steps: 5 });
        await page.mouse.move(coin.x + coin.width / 2 + 100, coin.y + coin.height / 2 + 60, { steps: 5 });
        await page.mouse.up();
        const agrandi = (await memos(page))[0];
        expect(agrandi.l - depart.l).toBe(100);
        expect(agrandi.h - depart.h).toBe(60);
        expect(agrandi.x, 'agrandir ne déplace pas').toBe(deplace.x);
        expect((await enregistres(page))[0].l).toBe(agrandi.l);
    });

    test('geste 4 — il ne se relie à rien : pas de port, ni parent ni enfant, et un bloc déplacé ne l\'entraîne pas', async ({ page }) => {
        await poserMemo(page, 'aide-mémoire');
        let m0 = (await memos(page))[0];
        const r = await page.evaluate((id) => {
            const C = window.planificationCarte, el = document.querySelector('.planif-memo');
            const noeuds = Array.from(C.etat.noeuds.values());
            return {
                ports: el.querySelectorAll('.planif-noeud-port').length,
                estNoeud: el.classList.contains('planif-noeud') || C.etat.noeuds.has(id),
                dansCoucheBlocs: !!el.closest('#planif-couche-noeuds'),
                parentOuEnfant: noeuds.some(n => n.parent === id || (n.enfants || []).includes(id)),
                lie: Array.from(C.etat.liens.values()).some(l => l.source === id || l.cible === id)
            };
        }, m0.id);
        expect(r).toEqual({ ports: 0, estNoeud: false, dansCoucheBlocs: false, parentOuEnfant: false, lie: false });

        // Un bloc glissé à la souris : il bouge, le mémo non. (Le mémo est d'abord écarté : posé au
        // centre de la vue, il peut couvrir des blocs.)
        await page.evaluate(() => { document.activeElement.blur(); const m = window.planificationCarte.etat.memos.values().next().value; m.x += 2000; window.planificationCarte.sauvegarder(); window.planificationMemos.rendre(); });
        m0 = (await memos(page))[0];
        const bloc = await page.evaluate(() => {
            for (const [id, nd] of window.planificationCarte.etat.noeuds) {
                if (nd.parent || (nd.enfants || []).length) continue;   // un bloc libre : sa leçon ne le remet pas en place
                const el = document.getElementById(id); if (!el) continue;
                const b = el.getBoundingClientRect();
                const x = b.left + Math.min(20, b.width / 2), y = b.top + Math.min(12, b.height / 2);
                const dessus = document.elementFromPoint(x, y);
                if (b.width && dessus && dessus.closest('.planif-noeud') === el) return { id, x, y, nx: nd.x, ny: nd.y };
            }
            return null;
        });
        expect(bloc, 'un bloc visible et saisissable sur la carte de démo').not.toBeNull();
        await page.mouse.move(bloc.x, bloc.y);
        await page.mouse.down();
        await page.mouse.move(bloc.x + 40, bloc.y + 30, { steps: 5 });
        await page.mouse.move(bloc.x + 90, bloc.y + 60, { steps: 5 });
        await page.mouse.up();
        const apres = await page.evaluate((id) => { const n = window.planificationCarte.etat.noeuds.get(id); return n ? [n.x, n.y] : null; }, bloc.id);
        expect(apres, 'le bloc a bien bougé').not.toEqual([bloc.nx, bloc.ny]);
        const m1 = (await memos(page))[0];
        expect([m1.x, m1.y], 'le mémo est resté où il était').toEqual([m0.x, m0.y]);
    });

    test('geste 5 — l\'interrupteur cache et montre tous les mémos ; c\'est une préférence, pas une donnée de la carte', async ({ page }) => {
        await poserMemo(page, 'un');
        await poserMemo(page, 'deux');
        const avant = JSON.stringify(await enregistres(page));
        const bouton = page.locator('#planif-btn-memos');
        await expect(bouton).toHaveAttribute('aria-pressed', 'true');
        await bouton.click();
        await expect(bouton).toHaveAttribute('aria-pressed', 'false');
        await expect(page.locator('.planif-memo').first()).toBeHidden();
        expect(await page.locator('.planif-noeud').first().isVisible(), 'la carte reste').toBe(true);
        expect(JSON.stringify(await enregistres(page)), 'masquer n\'écrit rien dans la carte').toBe(avant);
        expect(await page.evaluate(() => obtenirPreference('planifMemosVisibles'))).toBe(false);
        // Masqués, ils survivent à un enregistrement de la carte.
        await page.evaluate(() => window.planificationCarte.sauvegarder());
        expect(JSON.stringify(await enregistres(page))).toBe(avant);
        await bouton.click();
        await expect(bouton).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('.planif-memo')).toHaveCount(2);
        await expect(page.locator('.planif-memo').first()).toBeVisible();
        // Poser un mémo quand ils sont masqués les remontre : il ne naît pas invisible.
        await bouton.click();
        await page.locator('#planif-palette-memo').click();
        await expect(bouton).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('.planif-memo')).toHaveCount(3);
    });

    test('geste 6 — supprimer par le ×, puis Annuler le ramène avec son texte ; Rétablir le retire', async ({ page }) => {
        await poserMemo(page, 'à ne pas perdre');
        await page.locator('.planif-memo-supprimer').click();
        await expect(page.locator('.planif-memo')).toHaveCount(0);
        expect(await enregistres(page), 'la carte sans mémo ne porte plus la clé').toBeNull();
        await expect(page.locator('.planif-toast-lien')).toContainText('Annuler');
        await page.locator('#planif-btn-annuler').click();
        await expect(page.locator('.planif-memo')).toHaveCount(1);
        expect(await page.locator('.planif-memo-texte').inputValue()).toBe('à ne pas perdre');
        expect((await enregistres(page))[0].texte).toBe('à ne pas perdre');
        await page.locator('#planif-btn-retablir').click();
        await expect(page.locator('.planif-memo')).toHaveCount(0);
        expect(await enregistres(page)).toBeNull();
    });

    test('geste 6 bis — glissé jusqu\'à la corbeille comme un bloc, le mémo est supprimé ; Annuler le ramène à sa place', async ({ page }) => {
        await poserMemo(page, 'vers la corbeille');
        const depart = (await memos(page))[0];
        const barre = await page.locator('.planif-memo-barre').boundingBox();
        const corb = await page.evaluate(() => { const r = document.getElementById('planif-corbeille').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        await page.mouse.move(barre.x + 30, barre.y + barre.height / 2);
        await page.mouse.down();
        await page.mouse.move((barre.x + corb.x) / 2, (barre.y + corb.y) / 2, { steps: 6 });
        await page.mouse.move(corb.x, corb.y, { steps: 6 });
        expect(await page.evaluate(() => document.getElementById('planif-corbeille').classList.contains('planif-corbeille-survol')),
            'la corbeille vire au rouge sous le mémo').toBe(true);
        await page.mouse.up();
        expect(await memos(page)).toHaveLength(0);
        await page.locator('#planif-btn-annuler').click();
        const revenu = (await memos(page))[0];
        expect([revenu.x, revenu.y, revenu.texte]).toEqual([depart.x, depart.y, 'vers la corbeille']);
    });

    test('annuler — créer, écrire, déplacer et agrandir s\'annulent un à un, comme le reste', async ({ page }) => {
        const champ = await poserMemo(page, 'premier jet');
        await page.locator('#planif-chaine').click({ position: { x: 2, y: 2 }, force: true }).catch(() => {});
        await champ.evaluate(el => el.blur());
        const m0 = (await memos(page))[0];
        const barre = await page.locator('.planif-memo-barre').boundingBox();
        await page.mouse.move(barre.x + 30, barre.y + 10);
        await page.mouse.down();
        await page.mouse.move(barre.x + 130, barre.y + 60, { steps: 8 });
        await page.mouse.up();
        expect((await memos(page))[0].x).toBe(m0.x + 100);
        const annuler = page.locator('#planif-btn-annuler');
        await annuler.click();                       // le déplacement
        expect((await memos(page))[0]).toMatchObject({ x: m0.x, y: m0.y, texte: 'premier jet' });
        await annuler.click();                       // l'écriture
        expect((await memos(page))[0].texte).toBe('');
        await annuler.click();                       // la création
        expect(await memos(page)).toHaveLength(0);
        await page.locator('#planif-btn-retablir').click();
        await page.locator('#planif-btn-retablir').click();
        expect((await memos(page))[0].texte).toBe('premier jet');
        expect(await page.locator('.planif-memo-texte').inputValue()).toBe('premier jet');
    });

    test('recopie — dupliquer la carte : la copie a ses mémos, et l\'original garde les siens', async ({ page }) => {
        await poserMemo(page, DEVIS);
        const original = await page.evaluate(() => window.planificationDonnees.getIndex().active);
        const copie = await page.evaluate((id) => window.planificationCarte.dupliquerCarte(id), original);
        expect(copie).not.toBe(original);
        const r = await page.evaluate(([a, b]) => {
            const D = window.planificationDonnees;
            // La copie est indépendante : retoucher l'une ne retouche pas l'autre.
            window.planificationCarte.etat.memos.values().next().value.texte = 'retouché dans la copie';
            window.planificationCarte.sauvegarder();
            return { orig: D.chargerCarte(a).memos, copie: D.chargerCarte(b).memos, active: D.getIndex().active };
        }, [original, copie]);
        expect(r.active).toBe(copie);
        await expect(page.locator('.planif-memo')).toHaveCount(1);
        expect(r.copie).toHaveLength(1);
        expect(r.copie[0].texte).toBe('retouché dans la copie');
        expect(r.orig[0].texte, 'l\'original garde son texte').toBe(DEVIS);
    });

    test('recopie — ma bibliothèque garde les mémos, et « Utiliser dans ce trimestre » les rend', async ({ page }) => {
        await poserMemo(page, 'suit en bibliothèque');
        const r = await page.evaluate(async () => {
            const D = window.planificationDonnees;
            const id = D.getIndex().active;
            const pour = D.exporterCartePourBibliotheque(id, { avecMemos: true });
            const item = { id: 'ALI_banc_memos', nom: 'Banc mémos', dansBibliotheque: true, donnees: pour.donnees };
            await window.ajouterAlignementALaBibliotheque(item);
            await window.ajouterAlignementDepuisBibliotheque('ALI_banc_memos');
            const neuve = D.getIndex().active;
            return { memeCarte: neuve === id, gardes: pour.donnees.memos, rendus: D.chargerCarte(neuve).memos };
        });
        expect(r.memeCarte).toBe(false);
        expect(r.gardes[0].texte).toBe('suit en bibliothèque');
        expect(r.rendus[0].texte).toBe('suit en bibliothèque');
        await expect(page.locator('.planif-memo-texte')).toHaveValue('suit en bibliothèque');
    });

    test('recopie — la reprise d\'un autre trimestre emporte les mémos', async ({ page }) => {
        await poserMemo(page, 'repris au trimestre suivant');
        const r = await page.evaluate(() => {
            const D = window.planificationDonnees;
            const id = D.getIndex().active;
            // Un « autre trimestre » fictif qui porte la même clé de cartes, lu par `cleSource`.
            const source = JSON.parse(JSON.stringify(db.getSync(cle('planification_mindmap'))));
            db.setSync(cleSource('planification_mindmap', 'zz2099'), source);
            const avant = D.getIndex().cartes.length;
            window.planificationCarte.reprendreCarte('zz2099', id);
            const neuve = D.getIndex().active;
            return { cree: D.getIndex().cartes.length === avant + 1, memos: D.chargerCarte(neuve).memos, ecran: window.planificationCarte.etat.memos.size };
        });
        expect(r.cree).toBe(true);
        expect(r.memos[0].texte).toBe('repris au trimestre suivant');
        expect(r.ecran).toBe(1);
    });

    test('sorties — ni le fichier exporté (deux chemins), ni le plan, ni la longue-vue ne portent un mémo', async ({ page }) => {
        const MARQUE = 'MEMO-SECRET-7Q';
        await poserMemo(page, MARQUE + ' ne sort nulle part');
        // 1. « Exporter » de la bibliothèque (fichier pour un collègue) : la copie par défaut.
        const pourFichier = await page.evaluate(() => { const D = window.planificationDonnees; return JSON.stringify(D.exporterCartePourBibliotheque(D.getIndex().active)); });
        expect(pourFichier).not.toContain(MARQUE);
        expect(pourFichier).not.toContain('"memos"');
        // 2. `exporterCarte()` : le fichier lui-même, intercepté à la fabrication du Blob.
        const fichier = await page.evaluate(async () => {
            let texte = null; const Vrai = window.Blob;
            window.Blob = function (parts, opts) { texte = parts.join(''); return new Vrai(parts, opts); };
            HTMLAnchorElement.prototype.click = function () {};
            try { window.planificationCarte.exporterCarte(); } finally { window.Blob = Vrai; }
            return texte;
        });
        expect(fichier).toContain('"noeuds"');
        expect(fichier).not.toContain(MARQUE);
        expect(fichier).not.toContain('"memos"');
        // 3. L'export du plan, à tous ses niveaux et formats offerts à l'écran.
        await page.locator('#planif-btn-actions').click();
        await page.locator('#planif-btn-exporter-plan').click();
        const panneau = page.locator('#planif-export-plan-panel');
        await expect(panneau).toBeVisible();
        const plans = await page.evaluate(() => {
            const E = window.planificationExport;
            const sorties = [];
            E.NIVEAUX.forEach((n) => E.FORMATS.forEach((f) => { const doc = E.genererExport(n.id, f.id); if (typeof doc === 'string') sorties.push(doc); }));
            return { n: sorties.length, attendu: E.NIVEAUX.length * E.FORMATS.length, structure: JSON.stringify(E.construirePlan()),
                tout: sorties.join('\n') + document.getElementById('planif-export-plan-panel').innerHTML };
        });
        expect(plans.n, 'les niveaux × formats ont rendu leurs documents (un couple sans rendu est toléré)').toBeGreaterThanOrEqual(plans.attendu - 1);
        expect(plans.tout.length).toBeGreaterThan(500);
        expect(plans.tout).not.toContain(MARQUE);
        expect(plans.structure, 'la traversée unique de l\'export ne voit pas le mémo').not.toContain(MARQUE);
        // 4. La longue-vue montre la carte, pas ce qui l'accompagne.
        await page.keyboard.press('Escape');
        const loupe = await page.evaluate(() => {
            window.planificationCarte.activerLoupe();
            const copies = document.querySelectorAll('.planif-memo').length;
            window.planificationCarte.desactiverLoupe();
            return copies;
        });
        expect(loupe, 'un seul mémo dans le document : aucun clone dans la longue-vue').toBe(1);
    });

    test('entrée — un fichier reçu qui porterait des mémos n\'en dépose aucun', async ({ page }) => {
        const fichier = {
            metadata_cc: { type: 'alignement_pedagogique', nom: 'Carte reçue' },
            donnees: { compteur: 1, compteurLiens: 0, liens: [],
                noeuds: [{ id: 'planif-noeud_1', type: 'lecon', titre: 'Leçon reçue', description: '', x: 0, y: 0, parent: null, enfants: [], metadata: {}, cloneSourceId: null }],
                memos: [{ id: 'planif-memo_1', texte: 'glissé par un fichier', x: 0, y: 0, l: 240, h: 180 }] }
        };
        await page.evaluate(() => window.afficherBibliothequeAlignements());
        await page.locator('#biblio-alignements-fichier-import').setInputFiles({ name: 'recue.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fichier)) });
        const lus = () => page.evaluate(async () => (await window.obtenirTousLesAlignementsBibliotheque()).filter(i => i.nom === 'Carte reçue').map(i => i.donnees));
        await expect.poll(async () => (await lus()).length).toBe(1);
        const items = await lus();
        expect(items[0].noeuds).toHaveLength(1);
        expect('memos' in items[0], 'la carte entre en bibliothèque sans mémos').toBe(false);
    });

    test('au doigt — la barre déplace, le coin agrandit, le texte garde son défilement ; les prises font 44 px', async ({ browser }) => {
        // Un contexte tactile (iPad en paysage). Ce que Chromium peut juger : les zones, leurs tailles et
        // leurs `touch-action`, et le geste envoyé en événements de pointeur `touch`. Le vrai doigt sur
        // Safari se juge sur l'iPad.
        const contexte = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 1180, height: 820 } });
        const page = await contexte.newPage();
        const erreursTactile = [];
        page.on('pageerror', (e) => erreursTactile.push(e.message));
        await ouvrirCarte(page);
        await page.locator('#planif-palette-memo').tap();
        await expect(page.locator('.planif-memo')).toHaveCount(1);
        await page.locator('.planif-memo-texte').fill(DEVIS);
        await attendreEcriture(page);

        const zones = await page.evaluate(() => {
            const cs = (sel) => { const el = document.querySelector(sel), c = getComputedStyle(el), r = el.getBoundingClientRect();
                return { l: Math.round(r.width), h: Math.round(r.height), touch: c.touchAction, hors: c.overscrollBehaviorY, defile: c.overflowY }; };
            return { grossier: matchMedia('(pointer: coarse)').matches, barre: cs('.planif-memo-barre'), fermer: cs('.planif-memo-supprimer'),
                coin: cs('.planif-memo-poignee'), texte: cs('.planif-memo-texte'), palette: cs('#planif-palette-memo') };
        });
        expect(zones.grossier, 'le contexte est bien tactile').toBe(true);
        expect(zones.barre.h).toBeGreaterThanOrEqual(44);
        expect(zones.barre.touch, 'la barre garde le geste : le canevas ne défile pas').toBe('none');
        expect([zones.fermer.l, zones.fermer.h].every(v => v >= 44)).toBe(true);
        expect([zones.coin.l, zones.coin.h].every(v => v >= 44)).toBe(true);
        expect(zones.coin.touch).toBe('none');
        expect(zones.palette.h).toBeGreaterThanOrEqual(44);
        expect(zones.texte.touch, 'le texte laisse le doigt défiler').not.toBe('none');
        expect(zones.texte.defile).toBe('auto');
        expect(zones.texte.hors, 'au bout du texte, le canevas n\'est pas entraîné').toBe('contain');

        // Le geste, en pointeur `touch` : la barre déplace de (90, 50), le coin agrandit de (60, 40).
        const glisser = (selecteur, dx, dy) => page.evaluate(([selecteur, dx, dy]) => {
            const el = document.querySelector(selecteur), r = el.getBoundingClientRect();
            const x = r.left + r.width / 2, y = r.top + r.height / 2;
            const ev = (type, cx, cy) => new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0, clientX: cx, clientY: cy });
            el.dispatchEvent(ev('pointerdown', x, y));
            document.dispatchEvent(ev('pointermove', x + dx / 2, y + dy / 2));
            document.dispatchEvent(ev('pointermove', x + dx, y + dy));
            document.dispatchEvent(ev('pointerup', x + dx, y + dy));
        }, [selecteur, dx, dy]);
        const m0 = (await memos(page))[0];
        const defilement = await page.evaluate(() => { const z = document.getElementById('planif-zone-travail'); return [z.scrollLeft, z.scrollTop]; });
        await glisser('.planif-memo-grip', 90, 50);
        await glisser('.planif-memo-poignee', 60, 40);
        const m1 = (await memos(page))[0];
        expect([m1.x - m0.x, m1.y - m0.y]).toEqual([90, 50]);
        expect([m1.l - m0.l, m1.h - m0.h]).toEqual([60, 40]);
        expect(await page.evaluate(() => { const z = document.getElementById('planif-zone-travail'); return [z.scrollLeft, z.scrollTop]; }), 'le canevas n\'a pas bougé').toEqual(defilement);
        // Un geste repris par le système (pointercancel) ne laisse rien de déplacé.
        await page.evaluate(() => {
            const el = document.querySelector('.planif-memo-grip'), r = el.getBoundingClientRect();
            const ev = (type, cx, cy) => new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 8, pointerType: 'touch', isPrimary: true, button: 0, clientX: cx, clientY: cy });
            el.dispatchEvent(ev('pointerdown', r.left + 5, r.top + 5));
            document.dispatchEvent(ev('pointermove', r.left + 105, r.top + 85));
            document.dispatchEvent(ev('pointercancel', r.left + 105, r.top + 85));
        });
        const m2 = (await memos(page))[0];
        expect([m2.x, m2.y], 'geste annulé : le mémo revient où il était').toEqual([m1.x, m1.y]);
        expect(erreursTactile).toEqual([]);
        await contexte.close();
    });
});
