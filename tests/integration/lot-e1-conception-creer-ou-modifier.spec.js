import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// LOT E1 DE L'ENREGISTREMENT — CRÉER OU MODIFIER, ZONE CONCEPTION (D3, D0 ; 27 sept. 2026)
//
// Décision de Grégoire (D3, 26 sept.) : « Créer quelque chose de neuf : un bouton qui nomme
// le geste. Tant qu'on n'a pas cliqué, rien n'existe ; quitter avant avertit. Modifier ce qui
// existe : tout s'enregistre tout seul, champ par champ. « Annuler » devient « Fermer ». »
//
// Ce banc joue le vrai index.html depuis la démonstration et lit la BASE, pas l'écran :
//   (a) le nom et le contexte spécifique d'une cartouche existante, les jetons d'une pratique,
//       s'écrivent sans bouton, et le témoin dit « Enregistré » ;
//   (b) une grille neuve n'existe pas avant « Créer la grille » ; « Fermer » pose la question,
//       « Rester » ne perd rien, « Quitter sans créer » n'écrit rien ;
//   (c) l'assistant abandonné n'écrit aucune grille ; en modification, il dit « Appliquer » ;
//   (e) un échec d'écriture est dit par le témoin, « Non enregistré – ‹geste› : … », sans succès.
// (d) — le critère ajouté reste — est le banc #957 (grille-critere-ajoute-enregistrer-957).
//
// Noms fictifs seulement. Stockage propre à chaque essai (contexte Playwright neuf).
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
    await page.evaluate(() => { window.__toasts = [];
        new MutationObserver((ms) => ms.forEach(m => m.addedNodes.forEach(n => {
            if (n.nodeType === 1 && n.classList.contains('notification-avec-icone')) window.__toasts.push(n.innerText.replace(/\s+/g, ' ').trim());
        }))).observe(document.body, { childList: true });
    });
}

async function changer(page, selecteur, valeur) {
    const n = await page.evaluate(({ selecteur, valeur }) => {
        const el = document.querySelector(selecteur); if (!el) return 0;
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = valeur; else el.value = valeur;
        el.dispatchEvent(new Event('change', { bubbles: true })); return 1;
    }, { selecteur, valeur });
    expect(n, 'champ introuvable : ' + selecteur).toBe(1);
    await pause(page, 700);
}

async function cliquer(page, selecteur) {
    const n = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) return 0; el.click(); return 1; }, selecteur);
    expect(n, 'élément introuvable : ' + selecteur).toBe(1);
    await pause(page, 700);
}

const temoinSucces = (page) => page.evaluate(() => {
    const el = document.querySelector('#temoin-enregistrement .temoin-enregistrement-succes');
    return !!el && el.classList.contains('visible');
});
const temoinEchec = (page) => page.evaluate(() => {
    const el = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec');
    return el && el.classList.contains('visible') ? el.querySelector('.temoin-enregistrement-echec-texte').textContent : '';
});
const nbGrilles = (page) => page.evaluate(() => (db.getSync(cle('grillesTemplates'), []) || []).length);
const visible = (page, s) => page.evaluate((s) => { const el = document.querySelector(s); return !!el && !el.classList.contains('u-hide'); }, s);
const questionOuverte = (page) => page.evaluate(() => document.getElementById('ui-dialogue-titre')?.textContent || '');
async function repondre(page, texte) {
    const n = await page.evaluate((texte) => {
        const b = [...document.querySelectorAll('#overlay-ui-dialogue button')].find(x => x.textContent.trim() === texte);
        if (!b) return 0; b.click(); return 1;
    }, texte);
    expect(n, 'bouton de la question introuvable : ' + texte).toBe(1);
    await pause(page, 600);
}

test('(a) cartouche existante : le nom et le contexte spécifique s\'écrivent sans bouton, le témoin le dit', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'retroactions'));
    await pause(page, 900);
    const cibles = await page.evaluate(() => {
        const out = [];
        for (const g of db.getSync(cle('grillesTemplates'), []) || []) {
            for (const c of db.getSync(cle('cartouches_' + g.id), []) || []) out.push({ id: c.id, grilleId: g.id });
        }
        return out.slice(0, 2);
    });
    expect(cibles.length, 'la démonstration doit porter deux cartouches').toBe(2);
    await page.evaluate(({ id, grilleId }) => chargerCartouchePourModif(id, grilleId), cibles[0]);
    await pause(page, 900);

    expect(await visible(page, '#btnCreerCartouche'), 'fiche existante : pas de « Créer la cartouche »').toBe(false);
    expect(await page.evaluate(() => document.querySelector('[data-action="fermerFicheCartouche"]')?.textContent.trim())).toBe('Fermer');

    await changer(page, '#nomCartouche', 'Cartouche fictive banc E1');
    expect(await temoinSucces(page), 'le témoin dit « Enregistré »').toBe(true);
    await changer(page, '#contexteSpecifiqueCartouche', 'Contexte spécifique fictif E1');

    // Changer de cartouche, sans autre geste.
    await page.evaluate(({ id, grilleId }) => ouvrirCartoucheDepuisListe(id, grilleId), cibles[1]);
    await pause(page, 900);
    const enBase = await page.evaluate(({ id, grilleId }) =>
        JSON.parse(JSON.stringify((db.getSync(cle('cartouches_' + grilleId), []) || []).find(c => c.id === id))), cibles[0]);
    expect(enBase.nom, 'le nom est en base').toBe('Cartouche fictive banc E1');
    expect(enBase.contexteSpecifique, 'le contexte spécifique est en base').toBe('Contexte spécifique fictif E1');
});

test('(a) pratique : le nombre de jetons s\'écrit au changement de champ ; « Enregistrer la pratique » n\'existe plus', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    // Une pratique dont les jetons se règlent dans ce formulaire (pas dans l'assistant, #853).
    const id = await page.evaluate(() => {
        const liste = db.getSync(cle('pratiquesConfigurables'), []) || [];
        const p = liste.find(x => !(x.configuration && x.configuration.jetons) && !(x.config && x.config.jetons));
        return p ? p.id : null;
    });
    expect(id, 'la démonstration doit porter une pratique aux jetons réglés dans le formulaire').toBeTruthy();
    await page.evaluate(() => naviguerVers('conception', 'pratiques-notation'));
    await pause(page, 900);
    await page.evaluate((id) => chargerPratiquePourModif(id), id);
    await pause(page, 900);
    expect(await page.evaluate(() => !!document.querySelector('[data-action="sauvegarderPratiqueMaterielComplet"]'))).toBe(false);

    await changer(page, '#mat-jetons-actif', true);
    await changer(page, '#mat-jetons-nombre', '7');
    expect(await temoinSucces(page)).toBe(true);
    const jetons = await page.evaluate((id) =>
        JSON.parse(JSON.stringify(((db.getSync(cle('pratiquesConfigurables'), []) || []).find(p => p.id === id) || {}).jetons || null)), id);
    expect(jetons && jetons.actif, 'la case « jetons » est en base').toBe(true);
    expect(jetons && jetons.nombre, 'le nombre de jetons est en base').toBe(7);
});

test('(b) grille neuve : rien avant « Créer la grille » ; « Fermer » pose la question ; Rester / Quitter sans créer', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await pause(page, 800);
    const avant = await nbGrilles(page);

    await cliquer(page, '[data-action="creerNouvelleGrille"]');
    expect(await visible(page, '#btnCreerGrille'), 'en création : « Créer la grille » paraît').toBe(true);
    expect(await page.evaluate(() => document.getElementById('btnCreerGrille').textContent.trim())).toBe('Créer la grille');
    await page.evaluate(() => { document.getElementById('nomGrilleTemplate').value = 'Grille fictive banc E1'; });
    await changer(page, '#nomGrilleTemplate', 'Grille fictive banc E1');
    expect(await nbGrilles(page), 'rien en base avant le clic').toBe(avant);

    // « Fermer » → la question ; « Rester » ne perd rien.
    await cliquer(page, '[data-action="fermerFicheGrille"]');
    expect(await questionOuverte(page)).toBe('Cette grille n\'est pas encore créée.');
    await repondre(page, 'Rester');
    expect(await visible(page, '#conteneurEditionGrille'), '« Rester » garde la fiche').toBe(true);
    expect(await page.evaluate(() => document.getElementById('nomGrilleTemplate').value)).toBe('Grille fictive banc E1');

    // Ouvrir une autre grille depuis la liste : la même question.
    const autre = await page.evaluate(() => (db.getSync(cle('grillesTemplates'), []) || [])[0].id);
    await page.evaluate((id) => { ouvrirGrilleDepuisListe(id); }, autre);   // sans attendre : la question attend sa réponse
    await pause(page, 600);
    expect(await questionOuverte(page)).toBe('Cette grille n\'est pas encore créée.');
    await repondre(page, 'Rester');

    // « Quitter sans créer » n'écrit rien.
    await cliquer(page, '[data-action="fermerFicheGrille"]');
    await repondre(page, 'Quitter sans créer');
    expect(await visible(page, '#conteneurEditionGrille')).toBe(false);
    expect(await nbGrilles(page), 'quitter sans créer n\'écrit rien').toBe(avant);

    // Créer, pour de vrai.
    await cliquer(page, '[data-action="creerNouvelleGrille"]');
    await page.evaluate(() => { document.getElementById('nomGrilleTemplate').value = 'Grille fictive banc E1'; });
    await cliquer(page, '#btnCreerGrille');
    await pause(page, 600);
    expect(await nbGrilles(page), '« Créer la grille » écrit la grille').toBe(avant + 1);
    expect(await page.evaluate(() => window.__toasts)).toContainEqual(expect.stringMatching(/Grille « Grille fictive banc E1 » créée\./));
    expect(await visible(page, '#btnCreerGrille'), 'après la création, la fiche passe en modification').toBe(false);
    // Fermer une fiche existante ne pose aucune question.
    await cliquer(page, '[data-action="fermerFicheGrille"]');
    expect(await questionOuverte(page)).toBe('');
});

test('(b) échelle et cartouche neuves : la même question, avec leur nom', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'echelle-performance'));
    await pause(page, 800);
    await cliquer(page, '[data-action="creerNouvelleEchelle"]');
    expect(await visible(page, '#btnCreerEchelle')).toBe(true);
    await page.evaluate(() => { document.getElementById('nomEchelleTemplate').value = 'Échelle fictive banc E1'; });
    await cliquer(page, '[data-action="fermerFicheEchelle"]');
    expect(await questionOuverte(page)).toBe('Cette échelle n\'est pas encore créée.');
    await repondre(page, 'Quitter sans créer');

    await page.evaluate(() => naviguerVers('conception', 'retroactions'));
    await pause(page, 800);
    await cliquer(page, '[data-action="creerNouvelleCartouche"]');
    await pause(page, 600);
    expect(await visible(page, '#btnCreerCartouche')).toBe(true);
    await page.evaluate(() => { document.getElementById('nomCartouche').value = 'Cartouche fictive banc E1'; });
    await cliquer(page, '[data-action="fermerFicheCartouche"]');
    expect(await questionOuverte(page)).toBe('Cette cartouche n\'est pas encore créée.');
    await repondre(page, 'Rester');
    expect(await page.evaluate(() => document.getElementById('nomCartouche').value)).toBe('Cartouche fictive banc E1');
});

test('(c) assistant : la grille de base n\'est pas écrite s\'il est abandonné ; en modification, « Appliquer à la pratique »', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    const avant = await nbGrilles(page);
    await page.evaluate(() => ouvrirWizardV2(false, null));
    await pause(page, 600);
    expect(await page.evaluate(() => document.getElementById('wizard-v2-btn-creer').textContent.trim())).toBe('Créer la pratique');
    await page.evaluate(() => wizardV2CreerGrilleDemo());
    await pause(page, 400);
    expect(await nbGrilles(page), 'la grille de base attend « Créer la pratique »').toBe(avant);
    await page.evaluate(() => fermerWizardV2());
    await pause(page, 400);
    expect(await nbGrilles(page), 'assistant abandonné : aucune grille écrite').toBe(avant);

    const id = await page.evaluate(() => (db.getSync(cle('pratiquesConfigurables'), []) || [])[0].id);
    await page.evaluate((id) => ouvrirWizardV2(true, id), id);
    await pause(page, 600);
    expect(await page.evaluate(() => document.getElementById('wizard-v2-btn-creer').textContent.trim())).toBe('Appliquer à la pratique');
    await page.evaluate(() => fermerWizardV2());
});

test('(e) un échec d\'écriture dans la Conception : « Non enregistré – ‹geste› : … », aucun succès', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await pause(page, 800);
    const id = await page.evaluate(() => (db.getSync(cle('grillesTemplates'), []) || []).find(g => (g.criteres || []).length >= 1).id);
    await page.evaluate((id) => chargerGrillePourModif(id), id);
    await pause(page, 900);
    await page.evaluate(() => { window.__toasts = []; db._setIndexedDB = () => Promise.reject(new Error('panne simulée par le banc E1')); });
    await changer(page, `[data-on-change="modifierCritereGrilleHandler"][data-grille-id="${id}"][data-critere-index="0"][data-champ="nom"]`, 'Nom fictif banc E1');
    expect(await temoinEchec(page)).toBe('Non enregistré – Modifier la grille : le navigateur a refusé l\'écriture.');
    expect(await temoinSucces(page), 'aucun « Enregistré »').toBe(false);
    expect(await page.evaluate(() => window.__toasts)).toEqual([]);
});

test('(e bis) un nom de critère vidé : « Non enregistré : le nom du critère est obligatoire. »', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await pause(page, 800);
    const id = await page.evaluate(() => (db.getSync(cle('grillesTemplates'), []) || []).find(g => (g.criteres || []).length >= 1).id);
    await page.evaluate((id) => chargerGrillePourModif(id), id);
    await pause(page, 900);
    await page.evaluate(() => { window.__toasts = []; });
    await changer(page, `[data-on-change="modifierCritereGrilleHandler"][data-grille-id="${id}"][data-critere-index="0"][data-champ="nom"]`, '');
    expect(await temoinEchec(page)).toBe('Non enregistré : le nom du critère est obligatoire.');
    expect(await page.evaluate(() => window.__toasts), 'un seul message : plus de panneau d\'erreur en double').toEqual([]);
});

test('placement : « Fermer » et « Créer la … » à 360, 768, 1024 et 1180 px, dans l\'écran et hors du témoin', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const mesurer = () => page.evaluate(() => {
        const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { g: b.left, d: b.right, h: b.top, b: b.bottom, l: b.width }; };
        const t = document.querySelector('#temoin-enregistrement .visible');
        return {
            fermer: r(document.querySelector('[data-action="fermerFicheGrille"]')),
            creer: document.getElementById('btnCreerGrille').classList.contains('u-hide') ? null : r(document.getElementById('btnCreerGrille')),
            temoin: r(t), largeur: document.documentElement.clientWidth
        };
    });
    // ⚠ 360 px : la zone d'édition de la grille est elle-même plus large que l'écran (758 px
    // mesurés : les critères sont en colonnes fixes) — antérieur au lot, noté dans la demande de
    // relecture. La barre suit sa zone : à 360, on vérifie « visible » et « hors du témoin ».
    const dansLEcran = (b, m, largeur) => largeur === 360 || (b.g >= 0 && b.d <= m.largeur);
    const chevauche = (a, b) => !!(a && b && a.g < b.d && b.g < a.d && a.h < b.b && b.h < a.b);
    for (const largeur of [360, 768, 1024, 1180]) {
        await page.setViewportSize({ width: largeur, height: 900 });
        await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
        await pause(page, 600);
        // Fiche existante, après une écriture : le témoin est visible.
        const id = await page.evaluate(() => (db.getSync(cle('grillesTemplates'), []) || [])[0].id);
        await page.evaluate((id) => chargerGrillePourModif(id), id);
        await pause(page, 700);
        await changer(page, '#nomGrilleTemplate', await page.evaluate(() => document.getElementById('nomGrilleTemplate').value));
        const m1 = await mesurer();
        expect(m1.fermer && m1.fermer.l > 0, `${largeur} px : « Fermer » visible`).toBe(true);
        expect(dansLEcran(m1.fermer, m1, largeur), `${largeur} px : « Fermer » dans l'écran`).toBe(true);
        expect(chevauche(m1.fermer, m1.temoin), `${largeur} px : « Fermer » sous le témoin`).toBe(false);
        // Fiche en création.
        await page.evaluate(() => annulerFormGrille());
        await cliquer(page, '[data-action="creerNouvelleGrille"]');
        const m2 = await mesurer();
        expect(m2.creer && m2.creer.l > 0, `${largeur} px : « Créer la grille » visible`).toBe(true);
        expect(dansLEcran(m2.creer, m2, largeur), `${largeur} px : « Créer la grille » dans l'écran`).toBe(true);
        expect(chevauche(m2.creer, m2.temoin), `${largeur} px : « Créer la grille » sous le témoin`).toBe(false);
        await page.evaluate(() => annulerFormGrille());
    }
});

// ── Relecture croisée de Cowork (27 sept. 2026) ─────────────────────────────────────────────
// R1 : la question du doublon arrive APRÈS le blur, donc pendant qu'une autre cartouche s'ouvre.
// Annuler ne doit pas réécrire le champ de celle-ci avec le nom de la première : le prochain
// `change` la renommerait.
test('R1 : question du doublon annulée pendant qu\'une autre cartouche s\'ouvre — son champ garde son nom', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'retroactions'));
    await pause(page, 900);
    // A et B : deux cartouches de la même grille, aux noms différents (la question porte sur
    // les cartouches de la grille de A).
    const paire = await page.evaluate(() => {
        for (const g of db.getSync(cle('grillesTemplates'), []) || []) {
            const cs = (db.getSync(cle('cartouches_' + g.id), []) || []).filter(c => c.nom);
            for (const a of cs) {
                const b = cs.find(x => x.id !== a.id && x.nom !== a.nom);
                if (b) return { grilleId: g.id, a: { id: a.id, nom: a.nom }, b: { id: b.id, nom: b.nom } };
            }
        }
        return null;
    });
    expect(paire, 'la démonstration doit porter deux cartouches d\'une même grille').toBeTruthy();
    await page.evaluate(({ a, grilleId }) => chargerCartouchePourModif(a.id, grilleId), paire);
    await pause(page, 900);

    // A prend le nom de B : la question du doublon s'ouvre (sans attendre sa réponse).
    await page.evaluate((nom) => {
        const el = document.getElementById('nomCartouche');
        el.value = nom;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }, paire.b.nom);
    await pause(page, 600);
    expect(await page.evaluate(() => document.getElementById('modalConflitDoublon')?.classList.contains('actif')),
        'la question du doublon est ouverte').toBe(true);

    // Pendant la question, l'usager ouvre B depuis la liste.
    await page.evaluate(({ b, grilleId }) => ouvrirCartoucheDepuisListe(b.id, grilleId), paire);
    await pause(page, 900);
    expect(await page.evaluate(() => document.getElementById('nomCartouche').value)).toBe(paire.b.nom);

    // Puis il annule la question.
    await cliquer(page, '#btnDoublonAnnuler');
    expect(await page.evaluate(() => document.getElementById('nomCartouche').value),
        'le champ de B affiche toujours le nom de B').toBe(paire.b.nom);
    const noms = await page.evaluate(({ a, b, grilleId }) => {
        const l = db.getSync(cle('cartouches_' + grilleId), []) || [];
        return { a: l.find(c => c.id === a.id).nom, b: l.find(c => c.id === b.id).nom };
    }, paire);
    expect(noms, 'rien n\'est renommé en base').toEqual({ a: paire.a.nom, b: paire.b.nom });
});

// Trouvaille 1 (a), décision de Grégoire : « Écraser » un homonyme ne supprime rien si la
// création échoue à ses vérifications. Avant : l'ancienne échelle partait, la nouvelle n'était
// pas créée. Depuis #967 (8 oct.), un homonyme EMPLOYÉ est refusé avant : l'essai porte donc sur
// un homonyme libre, créé par le même geste — sinon il passerait sans rien éprouver.
test('trouvaille 1 (a) : « Écraser » + une échelle sans niveau — l\'ancienne échelle est toujours là', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'echelle-performance'));
    await pause(page, 800);
    await cliquer(page, '[data-action="creerNouvelleEchelle"]');
    await page.evaluate(() => { document.getElementById('nomEchelleTemplate').value = 'Échelle fictive Aulne E1'; });
    await cliquer(page, '#btnCreerEchelle');
    const ancienne = await page.evaluate(() => {
        const e = (db.getSync(cle('echellesTemplates'), []) || []).find(x => x && x.nom === 'Échelle fictive Aulne E1');
        return e ? { id: e.id, nom: e.nom } : null;
    });
    expect(ancienne, 'l\'homonyme libre est créé').toBeTruthy();
    expect(await page.evaluate((id) => window.compterPorteursHomonymesEchelle([{ id }]).then(n => n.total), ancienne.id),
        'rien ne l\'emploie : « Écraser » n\'est pas refusé').toBe(0);
    const avant = await page.evaluate(() => (db.getSync(cle('echellesTemplates'), []) || []).length);
    await cliquer(page, '[data-action="creerNouvelleEchelle"]');
    await page.evaluate((nom) => { document.getElementById('nomEchelleTemplate').value = nom; }, ancienne.nom);
    // Retirer tous les niveaux par le geste de la fiche.
    await page.evaluate(() => { while ((window._niveauxNouvelleEchelle || []).length) supprimerNiveauTemp(0); });
    expect(await page.evaluate(() => window._niveauxNouvelleEchelle.length)).toBe(0);

    await cliquer(page, '#btnCreerEchelle');
    expect(await page.evaluate(() => document.getElementById('modalConflitDoublon')?.classList.contains('actif')),
        'la question du doublon est ouverte').toBe(true);
    await cliquer(page, '#btnDoublonEcraser');
    // La proposition du codex (#1007) suit « Remplacer l'existante » : on la passe.
    await page.evaluate(() => {
        const b = [...document.querySelectorAll('#overlay-ui-dialogue button')].find(x => /sans (codex|mettre à jour)/.test(x.textContent));
        if (b) b.click();
    });
    await pause(page, 600);

    const apres = await page.evaluate((id) => {
        const l = db.getSync(cle('echellesTemplates'), []) || [];
        return { n: l.length, present: l.some(e => e && e.id === id) };
    }, ancienne.id);
    expect(apres.present, 'l\'ancienne échelle n\'a pas été supprimée').toBe(true);
    expect(apres.n, 'aucune échelle créée ni retirée').toBe(avant);
});

// Rechargement ou fermeture de l'onglet pendant une création (Nouvelles de 1.164 : « l'application te
// prévient si tu […] recharges la page avant »). L'évènement est émis par script, annulable comme celui
// du navigateur : la question native elle-même ne se pose pas sous Playwright.
test('rechargement : une grille neuve saisie retient la page ; vide ou déjà créée, non', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    const retient = () => page.evaluate(() => {
        const e = new Event('beforeunload', { cancelable: true });
        window.dispatchEvent(e);
        return e.defaultPrevented;
    });
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await pause(page, 800);
    expect(await retient(), 'aucune fiche en création : rien ne retient la page').toBe(false);

    await cliquer(page, '[data-action="creerNouvelleGrille"]');
    expect(await retient(), 'fiche neuve encore vide : rien à perdre').toBe(false);
    await page.evaluate(() => { document.getElementById('nomGrilleTemplate').value = 'Grille fictive banc E1'; });
    expect(await retient(), 'une saisie en création retient la page').toBe(true);

    await cliquer(page, '#btnCreerGrille');
    await pause(page, 600);
    expect(await retient(), 'une fois créée, la grille s\'enregistre toute seule : rien ne retient la page').toBe(false);
});
