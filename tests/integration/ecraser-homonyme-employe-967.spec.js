import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #967 — « ÉCRASER » UN HOMONYME EMPLOYÉ EST REFUSÉ (8 oct. 2026)
//
// Décision de Grégoire (7 oct. 2026, par Cowork) : un homonyme EMPLOYÉ n'est pas écrasé ;
// refus avec la phrase validée, même forme pour les trois éditeurs, compte réel. Un homonyme
// que rien n'emploie s'écrase comme avant, sans laisser de référence.
//
// Le banc joue le vrai index.html depuis la démonstration, par les vrais boutons (« Créer
// l'échelle », « Créer la grille », le nom d'une cartouche, « Remplacer l'existante »), et lit
// la BASE. Le compte attendu est recalculé ICI, champ par champ, sans les compteurs de l'app :
// un compteur faux ferait différer la phrase.
// Noms fictifs seulement. Contexte Playwright neuf à chaque essai.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirDemo(page) {
    const alertes = [];
    page.on('dialog', async (d) => { alertes.push(d.message()); await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
    return alertes;
}

async function cliquer(page, selecteur) {
    const n = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) return 0; el.click(); return 1; }, selecteur);
    expect(n, 'élément introuvable : ' + selecteur).toBe(1);
    await pause(page, 700);
}

const questionDoublonOuverte = (page) =>
    page.evaluate(() => !!document.getElementById('modalConflitDoublon')?.classList.contains('actif'));
const questionOuverte = (page) => page.evaluate(() => {
    const o = document.getElementById('overlay-ui-dialogue');
    return o && o.offsetParent !== null ? (document.getElementById('ui-dialogue-titre')?.textContent || '') : '';
});
// La proposition du codex (#1007) suit « Remplacer l'existante » quand l'homonyme est libre.
async function passerLeCodexSiPropose(page) {
    const n = await page.evaluate(() => {
        const b = [...document.querySelectorAll('#overlay-ui-dialogue button')].find(x => /sans (codex|mettre à jour)/.test(x.textContent));
        if (!b) return 0; b.click(); return 1;
    });
    if (n) await pause(page, 700);
    return n;
}
const temoinEchec = (page) => page.evaluate(() => {
    const el = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec');
    return el && el.classList.contains('visible') ? el.querySelector('.temoin-enregistrement-echec-texte').textContent : '';
});

// Le stock du trimestre actif que « Écraser » pourrait toucher, en un instantané.
const photo = (page) => page.evaluate(() => {
    const out = {};
    for (const k of ['echellesTemplates', 'grillesTemplates', 'evaluationsSauvegardees', 'productions', 'pratiquesConfigurables']) {
        out[k] = db.getSync(cle(k), []);
    }
    for (const g of db.getSync(cle('grillesTemplates'), []) || []) out['cartouches_' + g.id] = db.getSync(cle('cartouches_' + g.id), []);
    return JSON.stringify(out);
});

// Description et phrase, refaites ici à partir de la décision (pas des fonctions de l'app).
function decrire(nb) {
    const p = (k, s, pl) => `${k} ${k >= 2 ? pl : s}`;
    const parts = [];
    if (nb.evaluations) parts.push(p(nb.evaluations, 'évaluation', 'évaluations'));
    if (nb.productions) parts.push(p(nb.productions, 'production', 'productions'));
    if (nb.pratiques) parts.push(p(nb.pratiques, 'pratique de notation', 'pratiques de notation'));
    if (nb.grilles) parts.push(p(nb.grilles, 'grille', 'grilles'));
    if (nb.cartouches) parts.push(p(nb.cartouches, 'cartouche', 'cartouches'));
    return parts.length === 1 ? parts[0] : parts.slice(0, -1).join(', ') + ' et ' + parts[parts.length - 1];
}
function phrase(sujet, nb) {
    const total = Object.values(nb).reduce((a, b) => a + b, 0);
    return `${sujet} porte déjà ce nom, et ${decrire(nb)} ${total >= 2 ? 'l\'emploient' : 'l\'emploie'} : l'écraser changerait leurs notes. Donne un autre nom à la nouvelle.`;
}

// Tout ce qui nomme un id, dans le trimestre actif (pour « aucune référence orpheline »).
const referencesA = (page, id) => page.evaluate((id) => {
    const lignes = [];
    const voir = (k, v) => { if (JSON.stringify(v || []).includes('"' + id + '"')) lignes.push(k); };
    for (const k of ['echellesTemplates', 'grillesTemplates', 'evaluationsSauvegardees', 'productions', 'pratiquesConfigurables']) voir(k, db.getSync(cle(k), []));
    for (const g of db.getSync(cle('grillesTemplates'), []) || []) voir('cartouches_' + g.id, db.getSync(cle('cartouches_' + g.id), []));
    return lignes;
}, id);

/* ─────────────────────────────────────────────────────────────────────────── échelle */

test('échelle : un homonyme employé n\'est pas écrasé — la phrase, les vrais nombres, rien d\'écrit', async ({ page }) => {
    test.setTimeout(90000);
    const alertes = await ouvrirDemo(page);
    const cible = await page.evaluate(() => {
        const ev = db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const prods = db.getSync(cle('productions'), []) || [];
        const prats = db.getSync(cle('pratiquesConfigurables'), []) || [];
        const grilles = db.getSync(cle('grillesTemplates'), []) || [];
        for (const e of db.getSync(cle('echellesTemplates'), []) || []) {
            const nb = {
                evaluations: ev.filter(x => x && x.echelleId === e.id).length,
                productions: prods.filter(x => x && x.echelleId === e.id).length,
                pratiques: prats.filter(p => p && ((p.configuration && p.configuration.echelleId === e.id) || p.echelleId === e.id)).length,
                grilles: grilles.filter(x => x && x.echelleId === e.id).length,
                cartouches: grilles.reduce((s, g) => s + (db.getSync(cle('cartouches_' + g.id), []) || []).filter(c => c && c.echelleId === e.id).length, 0)
            };
            if (nb.evaluations > 0) return { nom: e.nom, nb };
        }
        return null;
    });
    expect(cible, 'la démonstration doit porter une échelle employée par une évaluation').toBeTruthy();
    expect((await page.evaluate((nom) => (db.getSync(cle('echellesTemplates'), []) || []).filter(e => e.nom === nom).length, cible.nom)),
        'un seul homonyme : le compte attendu est le sien').toBe(1);

    await page.evaluate(() => naviguerVers('conception', 'echelle-performance'));
    await pause(page, 800);
    const avant = await photo(page);
    await cliquer(page, '[data-action="creerNouvelleEchelle"]');
    await page.evaluate((nom) => { document.getElementById('nomEchelleTemplate').value = nom; }, cible.nom);
    await cliquer(page, '#btnCreerEchelle');
    expect(await questionDoublonOuverte(page), 'la question du doublon est ouverte').toBe(true);
    await cliquer(page, '#btnDoublonEcraser');
    await pause(page, 500);

    expect(alertes, 'le refus, avec la phrase validée et les vrais nombres').toEqual([phrase('Une échelle', cible.nb)]);
    expect(await questionOuverte(page), 'le codex n\'est pas proposé pour un refus').toBe('');
    expect(await photo(page), 'rien n\'est écrit').toBe(avant);
});

test('échelle : un homonyme que rien n\'emploie s\'écrase comme avant, sans laisser de référence', async ({ page }) => {
    test.setTimeout(90000);
    const alertes = await ouvrirDemo(page);
    const NOM = 'Échelle fictive Zéphyr 967';
    await page.evaluate(() => naviguerVers('conception', 'echelle-performance'));
    await pause(page, 800);
    // L'homonyme libre, créé par le même geste.
    await cliquer(page, '[data-action="creerNouvelleEchelle"]');
    await page.evaluate((nom) => { document.getElementById('nomEchelleTemplate').value = nom; }, NOM);
    await cliquer(page, '#btnCreerEchelle');
    const ancien = await page.evaluate((nom) => (db.getSync(cle('echellesTemplates'), []) || []).filter(e => e.nom === nom).map(e => e.id), NOM);
    expect(ancien.length, 'l\'homonyme libre est créé').toBe(1);
    const n0 = await page.evaluate(() => (db.getSync(cle('echellesTemplates'), []) || []).length);

    await cliquer(page, '[data-action="creerNouvelleEchelle"]');
    await page.evaluate((nom) => { document.getElementById('nomEchelleTemplate').value = nom; }, NOM);
    await cliquer(page, '#btnCreerEchelle');
    expect(await questionDoublonOuverte(page)).toBe(true);
    await cliquer(page, '#btnDoublonEcraser');
    await passerLeCodexSiPropose(page);
    await pause(page, 600);

    const apres = await page.evaluate((nom) => {
        const l = db.getSync(cle('echellesTemplates'), []) || [];
        return { n: l.length, ids: l.filter(e => e.nom === nom).map(e => e.id) };
    }, NOM);
    expect(alertes, 'aucun refus').toEqual([]);
    expect(apres.n, 'une part, une arrive').toBe(n0);
    expect(apres.ids.length, 'une seule échelle porte le nom').toBe(1);
    expect(apres.ids[0], 'c\'est la nouvelle').not.toBe(ancien[0]);
    expect(await referencesA(page, ancien[0]), 'aucune référence à l\'ancienne').toEqual([]);
});

/* ─────────────────────────────────────────────────────────────────────────── grille */

test('grille : un homonyme employé n\'est pas écrasé — la phrase, les vrais nombres, rien d\'écrit', async ({ page }) => {
    test.setTimeout(90000);
    const alertes = await ouvrirDemo(page);
    const cible = await page.evaluate(() => {
        const ev = db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const prods = db.getSync(cle('productions'), []) || [];
        const prats = db.getSync(cle('pratiquesConfigurables'), []) || [];
        const grilles = db.getSync(cle('grillesTemplates'), []) || [];
        for (const g of grilles) {
            const cs = db.getSync(cle('cartouches_' + g.id), []);
            const nb = {
                evaluations: ev.filter(x => x && x.grilleId === g.id).length,
                productions: prods.filter(x => x && x.grilleId === g.id).length,
                pratiques: prats.filter(p => p && p.configuration && p.configuration.grilleId === g.id).length,
                cartouches: Array.isArray(cs) ? cs.length : 0
            };
            if (nb.evaluations > 0 && grilles.filter(x => x.nom === g.nom).length === 1) return { nom: g.nom, nb };
        }
        return null;
    });
    expect(cible, 'la démonstration doit porter une grille employée par une évaluation').toBeTruthy();

    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await pause(page, 800);
    const avant = await photo(page);
    await cliquer(page, '[data-action="creerNouvelleGrille"]');
    await page.evaluate((nom) => { document.getElementById('nomGrilleTemplate').value = nom; }, cible.nom);
    await cliquer(page, '#btnCreerGrille');
    expect(await questionDoublonOuverte(page), 'la question du doublon est ouverte').toBe(true);
    await cliquer(page, '#btnDoublonEcraser');
    await pause(page, 500);

    expect(alertes, 'le refus, avec la phrase validée et les vrais nombres').toEqual([phrase('Une grille', cible.nb)]);
    expect(await questionOuverte(page), 'le codex n\'est pas proposé pour un refus').toBe('');
    expect(await photo(page), 'rien n\'est écrit').toBe(avant);
});

test('grille : un homonyme que rien n\'emploie s\'écrase comme avant, sans laisser de référence', async ({ page }) => {
    test.setTimeout(90000);
    const alertes = await ouvrirDemo(page);
    const NOM = 'Grille fictive Zéphyr 967';
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await pause(page, 800);
    await cliquer(page, '[data-action="creerNouvelleGrille"]');
    await page.evaluate((nom) => { document.getElementById('nomGrilleTemplate').value = nom; }, NOM);
    await cliquer(page, '#btnCreerGrille');
    const ancien = await page.evaluate((nom) => (db.getSync(cle('grillesTemplates'), []) || []).filter(g => g.nom === nom).map(g => g.id), NOM);
    expect(ancien.length, 'l\'homonyme libre est créé').toBe(1);
    const n0 = await page.evaluate(() => (db.getSync(cle('grillesTemplates'), []) || []).length);
    await cliquer(page, '[data-action="fermerFicheGrille"]');

    await cliquer(page, '[data-action="creerNouvelleGrille"]');
    await page.evaluate((nom) => { document.getElementById('nomGrilleTemplate').value = nom; }, NOM);
    await cliquer(page, '#btnCreerGrille');
    expect(await questionDoublonOuverte(page)).toBe(true);
    await cliquer(page, '#btnDoublonEcraser');
    await passerLeCodexSiPropose(page);
    await pause(page, 600);

    const apres = await page.evaluate((nom) => {
        const l = db.getSync(cle('grillesTemplates'), []) || [];
        return { n: l.length, ids: l.filter(g => g.nom === nom).map(g => g.id) };
    }, NOM);
    expect(alertes, 'aucun refus').toEqual([]);
    expect(apres.n, 'une part, une arrive').toBe(n0);
    expect(apres.ids.length, 'une seule grille porte le nom').toBe(1);
    expect(apres.ids[0], 'c\'est la nouvelle').not.toBe(ancien[0]);
    expect(await referencesA(page, ancien[0]), 'aucune référence à l\'ancienne').toEqual([]);
});

/* ─────────────────────────────────────────────────────────────────────────── cartouche */

// A et B dans la même grille : B employé par au moins une évaluation, A différent de B.
const paireCartouches = (page, bEmployee) => page.evaluate((bEmployee) => {
    const ev = db.getSync(cle('evaluationsSauvegardees'), []) || [];
    const prods = db.getSync(cle('productions'), []) || [];
    for (const g of db.getSync(cle('grillesTemplates'), []) || []) {
        const cs = (db.getSync(cle('cartouches_' + g.id), []) || []).filter(c => c && c.nom);
        for (const b of cs) {
            const nb = {
                evaluations: ev.filter(x => x && x.cartoucheId === b.id).length,
                productions: prods.filter(x => x && x.cartoucheId === b.id).length
            };
            if (bEmployee !== (nb.evaluations + nb.productions > 0)) continue;
            if (cs.filter(x => x.nom === b.nom).length !== 1) continue;
            const a = cs.find(x => x.id !== b.id && x.nom !== b.nom);
            if (a) return { grilleId: g.id, a: { id: a.id, nom: a.nom }, b: { id: b.id, nom: b.nom }, nb };
        }
    }
    return null;
}, bEmployee);

async function renommerCartouche(page, paire, nom) {
    await page.evaluate(({ a, grilleId }) => chargerCartouchePourModif(a.id, grilleId), paire);
    await pause(page, 900);
    await page.evaluate((nom) => {
        const el = document.getElementById('nomCartouche');
        el.value = nom;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }, nom);
    await pause(page, 600);
    expect(await questionDoublonOuverte(page), 'la question du doublon est ouverte').toBe(true);
}

test('cartouche : un homonyme employé n\'est pas écrasé — la phrase, les vrais nombres, rien d\'écrit', async ({ page }) => {
    test.setTimeout(90000);
    const alertes = await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'retroactions'));
    await pause(page, 900);
    const paire = await paireCartouches(page, true);
    expect(paire, 'la démonstration doit porter une cartouche employée et une autre dans sa grille').toBeTruthy();
    const avant = await photo(page);

    await renommerCartouche(page, paire, paire.b.nom);
    await cliquer(page, '#btnDoublonEcraser');
    await pause(page, 500);

    expect(alertes, 'le refus, avec la phrase validée et les vrais nombres').toEqual([phrase('Une cartouche', paire.nb)]);
    expect(await questionOuverte(page), 'le codex n\'est pas proposé pour un refus').toBe('');
    expect(await photo(page), 'rien n\'est écrit').toBe(avant);
    expect(await page.evaluate(() => document.getElementById('nomCartouche').value), 'le champ reprend le nom en base').toBe(paire.a.nom);
});

test('cartouche : un homonyme que rien n\'emploie s\'écrase comme avant, sans laisser de référence', async ({ page }) => {
    test.setTimeout(90000);
    const alertes = await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'retroactions'));
    await pause(page, 900);
    const source = await paireCartouches(page, true);
    expect(source).toBeTruthy();
    // L'homonyme libre : une copie de A par « Dupliquer » (aucune évaluation ne la nomme).
    await page.evaluate(({ a, grilleId }) => dupliquerCartouche(a.id, grilleId), source);
    await pause(page, 900);
    const copie = await page.evaluate(({ a, grilleId }) => {
        const l = db.getSync(cle('cartouches_' + grilleId), []) || [];
        const c = l[l.length - 1];
        return c && c.id !== a.id ? { id: c.id, nom: c.nom } : null;
    }, source);
    expect(copie, 'la copie est créée').toBeTruthy();
    const paire = { grilleId: source.grilleId, a: source.b, b: copie };   // B (employée) prend le nom de la copie
    const n0 = await page.evaluate((g) => (db.getSync(cle('cartouches_' + g), []) || []).length, paire.grilleId);

    await renommerCartouche(page, paire, copie.nom);
    await cliquer(page, '#btnDoublonEcraser');
    await passerLeCodexSiPropose(page);
    await pause(page, 600);

    const apres = await page.evaluate(({ grilleId, a }) => {
        const l = db.getSync(cle('cartouches_' + grilleId), []) || [];
        return { n: l.length, a: (l.find(c => c.id === a.id) || {}).nom };
    }, paire);
    expect(alertes, 'aucun refus').toEqual([]);
    expect(apres.n, 'la copie part').toBe(n0 - 1);
    expect(apres.a, 'la cartouche renommée porte le nom').toBe(copie.nom);
    expect(await referencesA(page, copie.id), 'aucune référence à la copie écrasée').toEqual([]);
});

// Cas noté à la fiche : l'homonyme ouvert pendant la question ne disparaît pas sous les yeux.
test('cartouche : l\'homonyme ouvert pendant la question reste — rien n\'est écrit, le témoin le dit', async ({ page }) => {
    test.setTimeout(90000);
    const alertes = await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'retroactions'));
    await pause(page, 900);
    const source = await paireCartouches(page, true);
    expect(source).toBeTruthy();
    await page.evaluate(({ a, grilleId }) => dupliquerCartouche(a.id, grilleId), source);
    await pause(page, 900);
    const copie = await page.evaluate(({ grilleId }) => {
        const l = db.getSync(cle('cartouches_' + grilleId), []) || [];
        const c = l[l.length - 1];
        return { id: c.id, nom: c.nom };
    }, source);
    const paire = { grilleId: source.grilleId, a: source.b, b: copie };
    const avant = await photo(page);

    await renommerCartouche(page, paire, copie.nom);
    // Pendant la question, l'usager ouvre l'homonyme depuis la liste.
    await page.evaluate(({ b, grilleId }) => ouvrirCartoucheDepuisListe(b.id, grilleId), paire);
    await pause(page, 900);
    expect(await page.evaluate(() => document.getElementById('nomCartouche').value)).toBe(copie.nom);
    await cliquer(page, '#btnDoublonEcraser');
    await passerLeCodexSiPropose(page);
    await pause(page, 600);

    expect(alertes).toEqual([]);
    expect(await photo(page), 'rien n\'est écrit : l\'homonyme ouvert reste, A garde son nom').toBe(avant);
    expect(await page.evaluate(() => document.getElementById('nomCartouche').value), 'le champ ouvert est intact').toBe(copie.nom);
    expect(await temoinEchec(page)).toContain('la cartouche du même nom est ouverte.');
});
