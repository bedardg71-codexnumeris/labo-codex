import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LA BARRE D'OUTILS COMPACTE (consigne du 1er nov. 2026, partie A ; ébauche `barre-outils-proposee`).
//
// Le but de Grégoire : le plus d'espace possible à la copie sur l'iPad, et plus de noms d'élèves au carrousel.
// ⚠ AU DOIGT (`hasTouch`, qui rend `pointer: coarse` dans WebKit) : c'est là que vivait la règle des 44 px (#568),
// que la souris du banc ne voit pas. Sans elle, ce banc passerait avec une barre de 53 px sur l'iPad.
//
// Aucun `page.click` ni `waitForTimeout` (règle du 4 septembre). Noms fictifs (règle 6).

test.use({ hasTouch: true, viewport: { width: 1180, height: 820 } });

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const TITRE_LONG = 'Artefact 6, un titre de production nettement trop long pour le menu';

async function ouvrirBarre(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.travauxUI && window.travauxStockage
        && typeof window.executerActionEval === 'function', null, { timeout: 30000 });
    await page.evaluate(({ titre }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const T = 'tbarre', coursId = 'cours-barre';
        const criteres = [{ id: 'c0', nom: 'Contenu', ponderation: 100, type: 'holistique', description: 'x' }];
        const niveaux = [{ code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 }, { code: 'M', nom: 'Maîtrisé', min: 75, max: 100, valeurCalcul: 80 }];
        const noms = [['Attentive', 'Chouette'], ['Patiente', 'Loutre'], ['Courageux', 'Condor'], ['Rieuse', 'Hirondelle'], ['Tenace', 'Kangourou'], ['Sereine', 'Mésange'], ['Vaillant', 'Castor']];
        const eleves = noms.map(([nom, prenom], i) => ({ da: 'TB' + i, nom, prenom, groupe: '01', coursId, groupeCoursId: 'GCB' }));
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GCB', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', eleves);
        window.db.setSync(T + '_productions', [{ id: 'pB', titre, type: 'travail', ponderation: 60, grilleId: 'GB', echelleId: 'EB', groupeCoursId: 'GCB' }]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'GB', nom: 'Grille témoin', type: 'holistique', criteres }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'EB', nom: 'IDME', niveaux }]);
        // Les copies 0 à 3 sont évaluées, la 1 et la 3 verrouillées (comme l'ébauche) ; les autres, importées.
        window.db.setSync(T + '_evaluationsSauvegardees', [0, 1, 2, 3].map((i) => ({
            id: 'EV' + i, etudiantDA: 'TB' + i, productionId: 'pB', groupeCoursId: 'GCB', coursId, fichierId: 'F' + i, grilleId: 'GB', echelleId: 'EB',
            statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-10-15T08:00:00.000Z', noteFinale: 80, niveauFinal: 'M', verrouillee: i % 2 === 1,
            criteres: [{ critereId: 'c0', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 100, retroaction: '' }],
            retroactionFinale: '', retroactionReecrite: false, pointsAnalytiques: {},
            optionsAffichage: { description: true, objectif: false, tache: false, adresse: false, contexte: false, affichageNote: 'complet' }
        })));
        window.db.setSync(T + '_fichiersTravaux', eleves.map((e, i) => ({
            id: 'F' + i, etudiantDA: e.da, productionId: 'pB', coursId, groupeCoursId: 'GCB', nomFichier: 'FICTIF_' + i + '.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-01T12:00:00.000Z', dateModification: '2026-10-01T12:00:00.000Z', source: 'import-local', importePar: 'single', statut: 'present'
        })));
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GCB' });
        window.db.setSync('groupeCoursActif', { id: 'GCB', trimestreId: T });
        window.definirPreference('chronoEvaluation', true);
    }, { titre: TITRE_LONG });
    await entrerDansLaCopie(page);
}

/** La section, la copie évaluée, puis Annoter sur une copie importée. Rejouée après un vrai rechargement. */
async function entrerDansLaCopie(page) {
    await page.evaluate((png) => {
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        window.travauxStockage.recupererBlob = async function () { return copie; };
    }, PNG);
    await page.evaluate(() => window.afficherSection('evaluations'));
    await page.waitForFunction(() => !!document.querySelector('#section-evaluations.active') && window.travauxUI.getModeCourant() === 'annoter', null, { timeout: 10000 });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400))); // l'initialisation du module, lancée à +100 ms (#761)
    await page.evaluate(() => window.executerActionEval({ value: 'consulter|EV2' }));
    await page.waitForFunction(() => window.travauxVisionneuse?.getFichierActuel?.()?.id === 'F2' && window._modifierEvaluationEnCours === false, null, { timeout: 15000 });
    await page.evaluate(() => window.travauxUI.basculerMode('annoter'));
    await page.waitForFunction(() => window.travauxUI.getModeCourant() === 'annoter');
    await ouvrirCopie(page, 'F5');
    await page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
}

async function ouvrirCopie(page, id) {
    await page.evaluate((id) => window.travauxUI.ouvrirFichier(id), id);
    await page.waitForFunction((id) => window.travauxVisionneuse.getFichierActuel()?.id === id
        && document.querySelector(`.annot-toolbar-fichiers .annot-badge.actif[data-fichier-id="${id}"]`), id, { timeout: 15000 });
}

/** Ce que l'œil voit d'une pastille : sa forme. Et ce que le lecteur d'écran et la bulle en disent. */
const lirePastille = (page, id) => page.evaluate((id) => {
    const p = document.querySelector(`.annot-toolbar-fichiers .annot-badge[data-fichier-id="${id}"] .travaux-badge-pill`);
    const cs = getComputedStyle(p), apres = getComputedStyle(p, '::after');
    const r = p.getBoundingClientRect();
    return {
        mot: p.textContent, aria: p.getAttribute('aria-label'), role: p.getAttribute('role'), bulle: p.title,
        largeur: Math.round(r.width), hauteur: Math.round(r.height), police: parseFloat(cs.fontSize),
        forme: [cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? 'disque' : '', cs.backgroundImage !== 'none' ? 'demi' : '',
            apres.content, apres.borderRightWidth !== '0px' ? 'crochet' : '', apres.backgroundColor !== 'rgba(0, 0, 0, 0)' ? 'point' : ''].join('|')
    };
}, id);

/** Combien d'étiquettes entières dans la bande, à sa position courante. */
const etiquettesEntieres = (page) => page.evaluate(() => {
    const s = document.querySelector('.annot-toolbar-fichiers'), b = s.getBoundingClientRect();
    return [...s.querySelectorAll('.annot-badge')].filter((e) => { const r = e.getBoundingClientRect(); return r.left >= b.left - 0.5 && r.right <= b.right + 0.5; }).length;
});

test.describe('La barre d’outils compacte', () => {
    test('au doigt, la barre garde sa hauteur : aucun contrôle sous 32 pt, ni au-dessus de 34', async ({ page }) => {
        await ouvrirBarre(page);
        const m = await page.evaluate(() => {
            const h = (el) => Math.round(el.getBoundingClientRect().height);
            const visibles = [...document.querySelectorAll('.annot-toolbar button, .annot-toolbar select')]
                .filter((b) => b.offsetParent && !b.closest('.actions-dropdown') && !b.closest('.annot-badge') && !b.classList.contains('chrono-btn-etat'));
            return { coarse: matchMedia('(pointer: coarse)').matches, hauteurs: visibles.map(h), barre: h(document.querySelector('.annot-toolbar')), nb: visibles.length };
        });
        expect(m.coarse).toBe(true); // témoin : sans lui, la règle des 44 px ne s'applique pas et ce test ne dit rien
        expect(m.nb).toBeGreaterThan(6);
        expect(Math.min(...m.hauteurs)).toBeGreaterThanOrEqual(32);
        expect(Math.max(...m.hauteurs)).toBeLessThanOrEqual(34);
        expect(m.barre).toBeLessThanOrEqual(43);
    });

    test('l’étiquette : le symbole avant le nom, le cadenas après, puis le profil, aux tailles de l’ébauche', async ({ page }) => {
        await ouvrirBarre(page);
        const m = await page.evaluate(() => {
            const b = document.querySelector('.annot-badge[data-fichier-id="F1"]');
            const x = (s) => b.querySelector(s).getBoundingClientRect();
            const nom = b.querySelector('.annot-badge-nom');
            return {
                ordre: x('.travaux-badge-pill').right <= x('.annot-badge-nom').left && x('.annot-badge-nom').right <= x('.travaux-badge-verrou').left && x('.travaux-badge-verrou').right <= x('.travaux-badge-profil').left,
                hauteur: b.getBoundingClientRect().height, police: getComputedStyle(nom).fontSize,
                verrou: x('.travaux-badge-verrou img').width, profil: x('.travaux-badge-profil').width,
                graisseActive: getComputedStyle(document.querySelector('.annot-badge.actif .annot-badge-nom')).fontWeight,
                graisse: getComputedStyle(nom).fontWeight
            };
        });
        expect(m).toEqual({ ordre: true, hauteur: 32, police: '14px', verrou: 13, profil: 24, graisseActive: '600', graisse: '400' });
    });

    test('le bouton de profil garde 32 pt sous le doigt, derrière ses 24 pt à l’œil', async ({ page }) => {
        await ouvrirBarre(page);
        const atteint = await page.evaluate(() => {
            const b = document.querySelector('.annot-badge[data-fichier-id="F5"] .travaux-badge-profil');
            const r = b.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            return [r.top + r.height / 2 - 14, r.top + r.height / 2 + 14].map((y) => document.elementFromPoint(cx, y) === b);
        });
        expect(atteint).toEqual([true, true]);
    });

    test('les symboles : la copie ouverte « en cours », une copie évaluée « évalué » ; le mot reste, dans la bulle et l’aria-label', async ({ page }) => {
        await ouvrirBarre(page);
        const enCours = await lirePastille(page, 'F5');
        expect(enCours).toMatchObject({ mot: 'EN COURS', aria: 'EN COURS', role: 'img', bulle: 'EN COURS', largeur: 15, hauteur: 15, police: 0 });
        const evalue = await lirePastille(page, 'F0');
        expect(evalue).toMatchObject({ mot: 'Évalué', aria: 'Évalué', role: 'img', bulle: 'Évalué', largeur: 15, hauteur: 15, police: 0 });
        const importe = await lirePastille(page, 'F6');
        expect(importe).toMatchObject({ mot: 'Importé', aria: 'Importé', bulle: 'Importé' });
        expect(enCours.forme).toContain('demi');
        expect(evalue.forme).toContain('disque');
        expect(evalue.forme).toContain('crochet');
    });

    test('les cinq états ont cinq formes, pas seulement cinq couleurs', async ({ page }) => {
        await ouvrirBarre(page);
        const formes = await page.evaluate(() => {
            const p = document.querySelector('.annot-badge[data-fichier-id="F6"] .travaux-badge-pill');
            return [['Évalué', 'evalue'], ['EN COURS', 'en-cours'], ['Importé', 'importe'], ['Annoté', 'annote'], ['Incomplet', 'incomplet']].map(([mot, classe]) => {
                window.travauxUI.poserEtatPastille(p, mot, classe);
                const cs = getComputedStyle(p), a = getComputedStyle(p, '::after');
                return [cs.backgroundColor !== 'rgba(0, 0, 0, 0)', cs.backgroundImage !== 'none', a.content, a.borderRightWidth !== '0px', a.backgroundColor !== 'rgba(0, 0, 0, 0)'].join('|');
            });
        });
        expect(new Set(formes).size).toBe(5);
    });

    test('le mot suit l’état en direct : autre copie, restauration, statut incomplet', async ({ page }) => {
        await ouvrirBarre(page);
        await ouvrirCopie(page, 'F6');
        expect(await lirePastille(page, 'F5')).toMatchObject({ mot: 'Importé', aria: 'Importé', bulle: 'Importé' }); // F5 restaurée
        expect(await lirePastille(page, 'F6')).toMatchObject({ mot: 'EN COURS', aria: 'EN COURS', bulle: 'EN COURS' });
        await page.evaluate(() => window.travauxUI.afficherPastilleActive(document.querySelector('.annot-badge.actif .travaux-badge-pill'), 'incomplet'));
        const incomplet = await lirePastille(page, 'F6');
        expect(incomplet).toMatchObject({ mot: 'Incomplet', aria: 'Incomplet', bulle: 'Incomplet ; travail en cours' });
        expect(incomplet.forme).toContain('"!"');
    });

    test('toucher un symbole ouvre la copie, et rien d’autre', async ({ page }) => {
        await ouvrirBarre(page);
        await page.evaluate(() => document.querySelector('.annot-badge[data-fichier-id="F6"] .travaux-badge-pill').click());
        await page.waitForFunction(() => window.travauxVisionneuse.getFichierActuel()?.id === 'F6');
        expect(await page.evaluate(() => !!document.querySelector('.modal-overlay.active, .modal-overlay.visible'))).toBe(false);
    });

    test('hors du carrousel, la pastille garde ses mots : Liste des évaluations, Archivage', async ({ page }) => {
        await ouvrirBarre(page);
        await page.evaluate(() => window.afficherSousSection('evaluations-liste'));
        await page.waitForFunction(() => document.querySelector('#evaluations-liste.active tr[data-evaluation-id] .travaux-badge-pill')?.offsetParent);
        const liste = await page.evaluate(() => {
            const p = document.querySelector('#evaluations-liste tr[data-evaluation-id] .travaux-badge-pill');
            const r = p.getBoundingClientRect();
            return { police: parseFloat(getComputedStyle(p).fontSize), largeur: r.width, mot: p.textContent.trim(), conteneur: document.querySelector('.conteneur').getBoundingClientRect().width };
        });
        expect(liste.police).toBeGreaterThan(8);
        expect(liste.largeur).toBeGreaterThan(30);
        expect(liste.mot.length).toBeGreaterThan(0);
        expect(liste.conteneur).toBeLessThan(1180); // la Liste garde sa largeur : seule la visionneuse va jusqu'au bord

        await page.evaluate(() => window.afficherSousSection('evaluations-exporter'));
        await page.waitForFunction(() => document.querySelector('#evaluations-contenu-archivage .annot-badge .travaux-badge-pill')?.offsetParent);
        const archivage = await page.evaluate(() => {
            const d = document.getElementById('evaluations-contenu-archivage');
            const p = d.querySelector('.annot-badge .travaux-badge-pill');
            return { police: parseFloat(getComputedStyle(p).fontSize), largeur: p.getBoundingClientRect().width, libelleCache: getComputedStyle(d.querySelector('.travaux-filtre-production-libelle')).display };
        });
        expect(archivage.police).toBeGreaterThan(8);
        expect(archivage.largeur).toBeGreaterThan(30);
        expect(archivage.libelleCache).toBe('none');
    });

    test('le menu de la production : 136 pt, coupé par « … », le titre entier dans la bulle, et il répond au toucher', async ({ page }) => {
        await ouvrirBarre(page);
        const m = await page.evaluate(() => {
            const zone = document.querySelector('.annot-toolbar-production'), sel = zone.querySelector('select'), t = zone.querySelector('.travaux-filtre-production-texte');
            const r = zone.getBoundingClientRect();
            return {
                largeur: r.width, hauteur: r.height, bulle: sel.title, texte: t.textContent, coupe: t.scrollWidth > t.clientWidth, points: getComputedStyle(t).textOverflow,
                touche: document.elementFromPoint(r.left + 60, r.top + 17) === sel, poignee: document.elementFromPoint(r.right - 8, r.top + 17) === sel
            };
        });
        expect(m).toMatchObject({ largeur: 136, hauteur: 34, coupe: true, points: 'ellipsis', touche: true, poignee: true });
        expect(m.bulle.startsWith(TITRE_LONG)).toBe(true);
        expect(m.texte).toBe(m.bulle);
    });

    test('pages et zoom en bandes soudées, aux largeurs de l’ébauche ; « 1/1 » sans espaces', async ({ page }) => {
        await ouvrirBarre(page);
        await page.waitForFunction(() => /^\d+\/\d+$/.test(document.getElementById('travaux-indicateur-page').textContent));
        const m = await page.evaluate(() => {
            const w = (id) => Math.round(document.getElementById(id).getBoundingClientRect().width);
            const bandes = [...document.querySelectorAll('.annot-bande-soudee')].map((b) => [...b.children].map((c) => c.id));
            return {
                bandes, pages: [w('travaux-btn-page-prec'), w('travaux-indicateur-page'), w('travaux-btn-page-suiv')], zoom: [w('travaux-btn-zoom100'), w('travaux-btn-plein-ecran')],
                palettes: [...document.querySelectorAll('#annot-bande-palettes button')].map((b) => Math.round(b.getBoundingClientRect().width)),
                chronoIcone: Math.round(document.querySelector('.travaux-chrono-icone').getBoundingClientRect().width), chronoPolice: getComputedStyle(document.getElementById('chrono-badge')).fontSize
            };
        });
        expect(m).toEqual({
            bandes: [['travaux-btn-page-prec', 'travaux-indicateur-page', 'travaux-btn-page-suiv'], ['travaux-btn-zoom100', 'travaux-btn-plein-ecran']],
            pages: [32, 40, 32], zoom: [46, 32], palettes: [32, 32, 32], chronoIcone: 15, chronoPolice: '13px'
        });
    });

    test('la Modélisation prend la même bande des palettes, et garde ses autres boutons', async ({ page }) => {
        await ouvrirBarre(page);
        const m = await page.evaluate(() => {
            const d = document.createElement('div');
            d.className = 'annot-toolbar';
            d.innerHTML = window.travauxOutils.genererHTMLBandePalettes().replace('id="annot-bande-palettes"', 'id="essai-bande"') + '<button class="travaux-btn-nav" id="essai-nav"></button>'; // security-ok: gabarit de l'application, sans donnée
            document.getElementById('section-evaluations').appendChild(d);
            const b = [...d.querySelectorAll('#essai-bande button')].map((x) => Math.round(x.getBoundingClientRect().width));
            const nav = Math.round(document.getElementById('essai-nav').getBoundingClientRect().height);
            d.remove();
            return { b, nav };
        });
        expect(m).toEqual({ b: [32, 32, 32], nav: 44 }); // hors des bandes soudées, la règle des 44 px tient
    });

    test('à 1180 pt, chronomètre affiché : trois étiquettes entières au moins, sans en couper une à gauche', async ({ page }) => {
        await ouvrirBarre(page);
        await page.evaluate(() => document.getElementById('travaux-chrono-toolbar').classList.remove('u-hide'));
        await page.waitForFunction(() => document.getElementById('travaux-chrono-toolbar').offsetWidth > 0);
        const barre = await page.evaluate(() => document.querySelector('.annot-toolbar').getBoundingClientRect().width);
        expect(barre).toBe(1180); // la visionneuse va jusqu'au bord : les ébauches sont dessinées à 1180
        for (const depart of [0, 190, 380, 600]) {
            await page.evaluate((x) => document.querySelector('.annot-toolbar-fichiers').scrollTo({ left: x, behavior: 'instant' }), depart);
            const r = await page.evaluate(() => {
                const s = document.querySelector('.annot-toolbar-fichiers').getBoundingClientRect();
                const coupees = [...document.querySelectorAll('.annot-toolbar-fichiers .annot-badge')].filter((e) => { const r = e.getBoundingClientRect(); return r.left < s.left - 0.5 && r.right > s.left + 0.5; });
                return coupees.length;
            });
            expect(r, 'une étiquette coupée à gauche, position ' + depart).toBe(0);
            expect(await etiquettesEntieres(page), 'position ' + depart).toBeGreaterThanOrEqual(3);
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
// LA PALETTE CODES EN VERSION COMPACTE (partie B ; ébauches `palette-codes-*`).
// ⚠ Le vrai rechargement passe par le stockage réel : c'est lui qui dit que le choix survit.

const CODES = '#travaux-palette-erreurs-fr';

async function ouvrirCodes(page) {
    await page.evaluate(() => { if (!document.getElementById('travaux-palette-erreurs-fr')) window.travauxOutils.togglePaletteErreursFrancais(); });
    await page.waitForSelector(CODES + ' .travaux-errfr-item');
}
const choisirCompacte = (page) => page.evaluate(() => document.querySelector('#travaux-palette-erreurs-fr [data-disposition="compacte"]').click());
const lireDisposition = (page) => page.evaluate(() => {
    const p = document.getElementById('travaux-palette-erreurs-fr');
    return {
        compacte: p.classList.contains('codes-compacte'),
        marque: [...p.querySelectorAll('[data-disposition]')].filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.disposition),
        largeur: Math.round(p.getBoundingClientRect().width), hauteur: p.getBoundingClientRect().height
    };
});
/** Pose le code actif sur la copie, comme un doigt : les vrais événements sur le vrai canevas. */
const poserAuDoigt = (page) => page.evaluate(() => {
    const c = document.getElementById('travaux-canvas-annotation');
    const r = c.getBoundingClientRect();
    const o = { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    c.dispatchEvent(new PointerEvent('pointerdown', o));
    c.dispatchEvent(new PointerEvent('pointerup', o));
});

test.describe('La palette Codes compacte', () => {
    test('par défaut, les descriptions : ↕ est marqué, les noms sont là, et la zone du nom actif ne se voit pas', async ({ page }) => {
        await ouvrirBarre(page);
        await ouvrirCodes(page);
        expect(await lireDisposition(page)).toMatchObject({ compacte: false, marque: ['v'], largeur: 200 });
        const m = await page.evaluate(() => {
            const p = document.getElementById('travaux-palette-erreurs-fr');
            return {
                nomVisible: p.querySelector('.travaux-errfr-nom').offsetHeight > 0, zone: getComputedStyle(p.querySelector('.travaux-errfr-nom-actif')).display,
                boutons: [...p.querySelectorAll('.palette-barre-droite button')].map((b) => b.dataset.disposition || 'replier'),
                tuiles: [...document.querySelectorAll('.palette-flottante')].filter((x) => x.querySelector('[data-disposition="compacte"]')).length
            };
        });
        expect(m).toEqual({ nomVisible: true, zone: 'none', boutons: ['h', 'v', 'compacte', 'replier'], tuiles: 1 });
    });

    test('compacte : 188 pt, cinq tuiles par rangée à la couleur du code, le numéro en blanc, le nom dans la bulle et l’aria-label', async ({ page }) => {
        await ouvrirBarre(page);
        await ouvrirCodes(page);
        await choisirCompacte(page);
        expect(await lireDisposition(page)).toMatchObject({ compacte: true, marque: ['compacte'], largeur: 188 });
        const m = await page.evaluate(() => {
            const p = document.getElementById('travaux-palette-erreurs-fr');
            const items = [...p.querySelectorAll('.travaux-errfr-item')];
            const rangee = items.filter((i) => i.getBoundingClientRect().top === items[0].getBoundingClientRect().top).length;
            const n = items[4].querySelector('.travaux-errfr-numero'), cs = getComputedStyle(n);
            return {
                nb: items.length, rangee, couleur: cs.backgroundColor !== 'rgba(0, 0, 0, 0)', blanc: cs.color,
                couvre: Math.abs(n.getBoundingClientRect().height - items[4].getBoundingClientRect().height) < 1,
                nomCache: items[4].querySelector('.travaux-errfr-nom').offsetHeight, bulle: items[4].title, aria: items[4].getAttribute('aria-label'),
                poignee: getComputedStyle(p.querySelector('.palette-poignee-redim')).display, barre: p.querySelector('.palette-flottante-barre').scrollWidth <= p.querySelector('.palette-flottante-barre').clientWidth
            };
        });
        expect(m).toMatchObject({ nb: 10, rangee: 5, couleur: true, blanc: 'rgb(255, 255, 255)', couvre: true, nomCache: 0, poignee: 'none', barre: true });
        expect(m.bulle.length).toBeGreaterThan(3);
        expect(m.aria).toBe('Code 5, ' + m.bulle);
    });

    test('un toucher sur une tuile choisit le code, le nom paraît dessous, et la hauteur de la palette ne bouge pas', async ({ page }) => {
        await ouvrirBarre(page);
        await ouvrirCodes(page);
        await choisirCompacte(page);
        const avant = await page.evaluate(() => {
            const p = document.getElementById('travaux-palette-erreurs-fr');
            return { h: p.getBoundingClientRect().height, texte: p.querySelector('.travaux-errfr-nom-actif').textContent };
        });
        expect(avant.texte).toBe('Touche un code : son nom paraît ici.');
        const hauteurs = await page.evaluate(() => {
            const p = document.getElementById('travaux-palette-erreurs-fr');
            return [...p.querySelectorAll('.travaux-errfr-item')].map((t) => {
                t.click();
                const z = p.querySelector('.travaux-errfr-nom-actif');
                const num = t.querySelector('.travaux-errfr-numero').textContent;
                return {
                    h: p.getBoundingClientRect().height, z: z.textContent.startsWith(num + '. ') && z.textContent.endsWith(t.title),
                    liseres: getComputedStyle(t.querySelector('.travaux-errfr-numero')).boxShadow.split('inset').length - 1, zoneH: z.offsetHeight
                };
            });
        });
        for (const x of hauteurs) expect(x).toEqual({ h: avant.h, z: true, liseres: 2, zoneH: 51 });
    });

    test('la tuile pose le code d’un toucher, son compteur monte dans le coin, et le total devient une pastille', async ({ page }) => {
        await ouvrirBarre(page);
        await ouvrirCodes(page);
        await choisirCompacte(page);
        await page.evaluate(() => document.querySelectorAll('#travaux-palette-erreurs-fr .travaux-errfr-item')[2].click());
        await poserAuDoigt(page);
        await page.waitForFunction(() => document.querySelectorAll('#travaux-palette-erreurs-fr .travaux-errfr-compteur')[2].textContent === '1');
        const m = await page.evaluate(() => {
            const p = document.getElementById('travaux-palette-erreurs-fr');
            const t = p.querySelectorAll('.travaux-errfr-item')[2], c = t.querySelector('.travaux-errfr-compteur');
            const rt = t.getBoundingClientRect(), rc = c.getBoundingClientRect();
            const past = document.getElementById('travaux-errfr-total-pastille');
            return {
                auCoin: rc.right <= rt.right && rc.top >= rt.top && rc.width < rt.width / 2, aria: t.getAttribute('aria-label').endsWith(', 1 posé'),
                pastille: past.textContent, bulle: past.title, pastilleVue: past.offsetHeight > 0, mots: getComputedStyle(document.getElementById('travaux-errfr-total-header')).display
            };
        });
        expect(m).toMatchObject({ auCoin: true, aria: true, pastille: '1', pastilleVue: true, mots: 'none' });
        expect(m.bulle).toMatch(/^1 /);
    });

    test('la touche 4 pose le code 4 en version compacte', async ({ page }) => {
        await ouvrirBarre(page);
        await ouvrirCodes(page);
        await choisirCompacte(page);
        await page.keyboard.press('4');
        await page.waitForFunction(() => document.querySelector('#travaux-palette-erreurs-fr .travaux-errfr-item.actif .travaux-errfr-numero')?.textContent === '4');
        expect(await page.evaluate(() => document.getElementById('travaux-errfr-nom-actif').textContent.startsWith('4. '))).toBe(true);
        await poserAuDoigt(page);
        await page.waitForFunction(() => document.querySelector('#travaux-palette-erreurs-fr .travaux-errfr-item.actif .travaux-errfr-compteur').textContent === '1');
    });

    test('le choix reste à la copie suivante, et survit au vrai rechargement ; ↕ le quitte', async ({ page }) => {
        await ouvrirBarre(page);
        await ouvrirCodes(page);
        await choisirCompacte(page);
        await ouvrirCopie(page, 'F6');
        await ouvrirCodes(page);
        expect(await lireDisposition(page)).toMatchObject({ compacte: true, marque: ['compacte'], largeur: 188 });
        expect(await page.evaluate(() => window.db.getSync('preferencesUtilisateur', {}).dispositionPaletteCodes)).toBe('compacte');

        await page.reload();
        await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.travauxUI && window.travauxStockage
            && typeof window.executerActionEval === 'function', null, { timeout: 30000 });
        expect(await page.evaluate(() => window.obtenirPreference('dispositionPaletteCodes'))).toBe('compacte');
        await entrerDansLaCopie(page);
        await ouvrirCodes(page);
        expect(await lireDisposition(page)).toMatchObject({ compacte: true, marque: ['compacte'], largeur: 188 });

        await page.evaluate(() => document.querySelector('#travaux-palette-erreurs-fr [data-disposition="v"]').click());
        const v = await lireDisposition(page);
        expect(v).toMatchObject({ compacte: false, marque: ['v'], largeur: 200 });
        expect(await page.evaluate(() => window.obtenirPreference('dispositionPaletteCodes'))).toBe('v');
    });

    test('↔ quitte la compacte, et sa hauteur est mesurée sur les descriptions (#774)', async ({ page }) => {
        await ouvrirBarre(page);
        await ouvrirCodes(page);
        await choisirCompacte(page);
        const compacte = (await lireDisposition(page)).hauteur;
        await page.evaluate(() => document.querySelector('#travaux-palette-erreurs-fr [data-disposition="h"]').click());
        const h = await lireDisposition(page);
        expect(h).toMatchObject({ compacte: false, marque: ['h'] });
        expect(h.largeur).toBeGreaterThan(1000);
        expect(h.hauteur).toBeLessThan(compacte); // le bandeau : deux lignes de codes, pas la hauteur de la compacte
    });

    /** Une grille aux codes écrits par l'enseignant·e, née avec la marque : sans sous-critère, aucun code (étape 0). */
    const poserCodes = (page, codes) => page.evaluate((codes) => {
        const g = window.db.getSync('tbarre_grillesTemplates', []);
        g[0].criteres.push({
            id: 'cA', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', formule: "nombre d'erreurs / nombre de mots", codesDepuisSousCriteres: true, codesSousCriteresSeulement: true,
            sousCriteres: codes.map((code, i) => ({ id: 'sc' + i, code, nom: 'Sous-critère ' + i, ponderation: 1 }))
        });
        window.db.setSync('tbarre_grillesTemplates', g); // security-ok: fixture du banc, sans source externe
    }, codes);

    test('un code au numéro long : il tient dans sa tuile, jusqu’à 20 caractères', async ({ page }) => {
        await ouvrirBarre(page);
        await poserCodes(page, ['1', '22', 'ABC', 'WWWW', 'WWWWWW', 'WWWWWWW', 'SOUS-CRITERE_LONG-20', 'WWWWWWWWWWWWWWWWWWWW', '8']);
        await ouvrirCopie(page, 'F6');
        await ouvrirCodes(page);
        await choisirCompacte(page);
        const m = await page.evaluate(() => {
            const p = document.getElementById('travaux-palette-erreurs-fr');
            const contenu = p.querySelector('.palette-flottante-contenu');
            return {
                tuiles: [...p.querySelectorAll('.travaux-errfr-numero')].map((n) => ({ t: n.textContent, deborde: n.scrollWidth > n.clientWidth + 1, points: getComputedStyle(n).textOverflow })),
                largeurTenue: contenu.scrollWidth <= contenu.clientWidth
            };
        });
        // 20 lettres W, le pire des cas : coupées par « … », et rien d'autre ne déborde.
        expect(m.tuiles.filter((x) => x.deborde).map((x) => [x.t, x.points])).toEqual([['WWWWWWWWWWWWWWWWWWWW', 'ellipsis']]);
        expect(m.tuiles.map((x) => x.t)).toContain('SOUS-CRITERE_LONG-20');
        expect(m.largeurTenue).toBe(true);
    });

    test('la palette vide le dit aussi en compacte, et le rappel « Touche un code » se tait', async ({ page }) => {
        await ouvrirBarre(page);
        await poserCodes(page, []);
        await ouvrirCopie(page, 'F6');
        await page.evaluate(() => { if (!document.getElementById('travaux-palette-erreurs-fr')) window.travauxOutils.togglePaletteErreursFrancais(); });
        await page.waitForSelector(CODES + ' .travaux-errfr-vide');
        await choisirCompacte(page);
        const m = await page.evaluate(() => {
            const p = document.getElementById('travaux-palette-erreurs-fr');
            const vide = p.querySelector('.travaux-errfr-vide');
            return { items: p.querySelectorAll('.travaux-errfr-item').length, texte: vide.textContent, vu: vide.offsetHeight > 0, large: vide.getBoundingClientRect().width > 150, rappel: !!p.querySelector('.travaux-errfr-nom-actif') };
        });
        expect(m).toMatchObject({ items: 0, vu: true, large: true, rappel: false });
        expect(m.texte).toContain('Aucun code');
    });
});
