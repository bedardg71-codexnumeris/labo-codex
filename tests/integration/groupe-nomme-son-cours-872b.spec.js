import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #872, mécanisme B (19 sept. 2026) — UN GROUPE, C'EST UN NUMÉRO DANS UN COURS, DANS LA VRAIE PAGE.
//
// Omnivox numérote les groupes par cours : deux cours portent chacun un « 00001 ». Le menu Groupe du Cadre ne
// connaissait que le numéro — une entrée, élèves mêlés, et « Supprimer le groupe » emportait les deux cours.
// Forme tranchée par Grégoire (19 sept.) : le menu nomme le cours (« 00001 · 601-101-MQ »), deux entrées ;
// la liste, le compte et la suppression suivent l'entrée choisie.
//
// Le banc FAIT LES GESTES : il choisit une entrée AU MENU, ajoute et modifie par le formulaire, clique
// « Supprimer le groupe » et « + Nouveau groupe » (les boîtes de dialogue sont lues, puis acceptées).
// Le semis (deux cours, leurs fiches, le cours actif) n'est pas le geste éprouvé.
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

test('#872 B · deux cours portent « 00001 » : deux entrées, liste, ajout, édition, suppression et nouveau groupe par couple', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = [];
    const dialogues = [];
    page.on('dialog', async (d) => {
        dialogues.push({ type: d.type(), message: d.message(), defaut: d.defaultValue() });
        await d.accept(d.type() === 'prompt' ? d.defaultValue() : undefined);
    });
    page.on('pageerror', (e) => erreurs.push(String(e)));
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

    const m = await page.evaluate(async () => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        const texte = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
        const champ = (id) => document.getElementById(id);
        const stock = () => JSON.parse(JSON.stringify(db.getSync(cle('groupeEtudiants'), []) || []));
        const menu = () => champ('v2-selectGroupe');
        const options = () => [...menu().options].map(o => ({ v: o.value, t: texte(o) }));
        const dasListe = () => [...champ('v2-listeEtudiants').querySelectorAll('tbody tr')].map(tr => texte(tr.cells[0]));
        const choisir = async (libelle) => {
            const o = [...menu().options].find(x => texte(x) === libelle);
            if (!o) return false;
            menu().value = o.value;
            menu().dispatchEvent(new Event('change', { bubbles: true }));
            await pause(500);
            return true;
        };
        const r = {};

        await window.activerModeDemo();
        await pause(1500);
        await chargerListeEtudiantsV2();

        // PACK DÉMO : l'ancienne valeur persistée (« 0demo », numéro seul) choisit toujours son entrée.
        const actif = JSON.parse(JSON.stringify(db.getSync('infoCours', null)));
        r.actif = actif;
        r.codeA = actif.codeCours || actif.sigle || actif.code || '';
        r.demo = { persistee: db.getSync(cle('groupeSelectionne'), null), choisie: texte(menu().selectedOptions[0]), valeur: menu().value };

        // SEMIS : un second cours (B) et un troisième (C, sans élève) ; A et B portent chacun un « 00001 » ;
        // une fiche d'avant, sans clé `coursId`, au « 00003 ».
        const biblio = db.getSync('cours', []) || [];
        biblio.push({ id: 'COURS-872-B', codeCours: '601-872', nomCours: 'Second cours du banc', isDemo: true });
        biblio.push({ id: 'COURS-872-C', codeCours: '601-873', nomCours: 'Troisième cours du banc', isDemo: true });
        db.setSync('cours', biblio);
        const fiche = (da, coursId, groupe, nom) => {
            const f = { da, groupe, nom, prenom: 'Banc', programme: '', sa: '' };
            if (coursId !== undefined) f.coursId = coursId;
            return f;
        };
        const depart = stock();
        r.nbDemo = depart.length;
        await db.set(cle('groupeEtudiants'), depart.concat([
            fiche('8721001', actif.id, '00001', 'Alpha'), fiche('8721002', actif.id, '1', 'Aline'),
            fiche('8722001', 'COURS-872-B', '00001', 'Bravo'), fiche('8722002', 'COURS-872-B', '00001', 'Brigitte'), fiche('8722003', 'COURS-872-B', '00001', 'Bruno'),
            fiche('8723001', undefined, '00003', 'Ancienne'),
        ]));
        menu().value = '';
        db.setSync(cle('groupeSelectionne'), '');
        await chargerListeEtudiantsV2();

        // 1 · DEUX ENTRÉES pour « 00001 ».
        r.options = options();
        r.libelleA = `00001 · ${r.codeA}`;

        // 2 · Chaque entrée montre SES élèves ; le compte et le bouton suivent.
        r.choixB = await choisir('00001 · 601-872');
        r.listeB = dasListe();
        r.compteB = texte(champ('v2-resumeNbTotal'));
        r.boutonB = texte(champ('v2-btnSupprimerGroupe'));
        r.persisteeB = db.getSync(cle('groupeSelectionne'), null);
        r.choixA = await choisir(r.libelleA);
        r.listeA = dasListe();

        // 3 · AJOUT À LA MAIN sous l'entrée du cours B, cours actif A → coursId = B.
        await choisir('00001 · 601-872');
        r.phraseAjoutB = texte(champ('v2-ajoutRattachement'));
        r.groupePrerempli = champ('v2-etudiantGroupe').value;
        champ('v2-etudiantDA').value = '8722009';
        champ('v2-etudiantNom').value = 'Ajoutée';
        champ('v2-etudiantPrenom').value = 'Béa';
        champ('v2-btnSoumettreEtudiant').click();
        await pause(900);
        r.ajoutee = stock().find(e => e.da === '8722009') || null;
        r.actifApresAjout = (db.getSync('infoCours', null) || {}).id;

        // 4 · ÉDITION d'une fiche du cours B, cours actif A → coursId RESTE B ; la phrase dit le cours de la fiche.
        const editer = async (da, prenom) => {
            const sel = champ('v2-listeEtudiants').querySelector(`select[data-on-change="actionEtudiantV2Handler"][data-da="${da}"]`);
            if (!sel) return { introuvable: true };
            sel.value = 'editer';
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            await pause(400);
            const phrase = texte(champ('v2-ajoutRattachement'));
            // ↻ Lot E2 (28 sept. 2026, D3) : la fiche s'enregistre au changement du champ et RESTE
            // ouverte ; « Fermer » ramène au formulaire d'ajout (et à sa phrase).
            champ('v2-etudiantPrenom').value = prenom;
            champ('v2-etudiantPrenom').dispatchEvent(new Event('change', { bubbles: true }));
            await pause(900);
            const phraseOuverte = texte(champ('v2-ajoutRattachement'));
            window.fermerFicheEtudiantV2();
            await pause(200);
            return { phrase, phraseOuverte, fiche: stock().find(e => e.da === da) || null, phraseApres: texte(champ('v2-ajoutRattachement')) };
        };
        r.editionB = await editer('8722001', 'Modifié');
        // … et une fiche d'avant, sans `coursId` : elle n'en reçoit pas.
        await choisir('00003 · sans cours');
        r.listeSansCours = dasListe();
        r.editionAncienne = await editer('8723001', 'Modifiée');
        r.ancienneACle = r.editionAncienne.fiche ? Object.prototype.hasOwnProperty.call(r.editionAncienne.fiche, 'coursId') : null;

        // 5 · « SUPPRIMER LE GROUPE » sur le 00001 du cours A laisse celui du cours B intact.
        await choisir(r.libelleA);
        champ('v2-btnSupprimerGroupe').click();
        await pause(1200);
        const apresSuppr = stock();
        r.apresSuppr = {
            resteA: apresSuppr.filter(e => e.coursId === actif.id && /^872/.test(String(e.da))).length,
            resteB: apresSuppr.filter(e => e.coursId === 'COURS-872-B').map(e => e.da).sort(),
            resteDemo: apresSuppr.filter(e => !/^872/.test(String(e.da))).length,
            options: options().map(o => o.t),
        };

        // 6 · ANCIENNE VALEUR PERSISTÉE (numéro seul) : unique → son entrée ; portée par deux cours → « Tous les groupes ».
        menu().value = '';
        db.setSync(cle('groupeSelectionne'), '00003');
        await chargerListeEtudiantsV2();
        r.ancienneUnique = texte(menu().selectedOptions[0]);
        const avecDeux = stock().concat([fiche('8721003', actif.id, '00001', 'Retour')]);
        await db.set(cle('groupeEtudiants'), avecDeux);
        menu().value = '';
        db.setSync(cle('groupeSelectionne'), '00001');
        await chargerListeEtudiantsV2();
        r.ancienneAmbigue = { choisie: texte(menu().selectedOptions[0]), valeur: menu().value };

        // 7 · « + NOUVEAU GROUPE » dans le cours C (actif, sans élève) : « 00001 » est LIBRE, bien que A et B en portent un.
        db.setSync('infoCours', { ...biblio.find(c => c.id === 'COURS-872-C') });
        document.querySelector('[data-action="creerNouveauGroupeV2"]').click();
        await pause(1200);
        r.nouveau = {
            choisie: texte(menu().selectedOptions[0]),
            persistee: db.getSync(cle('groupeSelectionne'), null),
            valeur: menu().value,
            phrase: texte(champ('v2-ajoutRattachement')),
            options: options().map(o => o.t),
        };
        const boite = menu().getBoundingClientRect();
        r.largeur = { menu: Math.round(boite.width), page: document.documentElement.scrollWidth, fenetre: window.innerWidth };
        return r;
    });

    // Pack démo : « 0demo » (ancienne forme) toujours pré-sélectionné, libellé au nouveau format.
    expect(m.demo.persistee).toBe('0demo');
    expect(m.demo.choisie).toMatch(/^0demo · .+ \(démo\)$/);
    expect(m.demo.valeur).toContain('|');

    // 1 · Deux entrées pour « 00001 », une par cours ; « 1 » et « 00001 » restent le même numéro.
    const libelles = m.options.map(o => o.t);
    expect(m.codeA).toBeTruthy();
    expect(libelles).toContain(m.libelleA);
    expect(libelles).toContain('00001 · 601-872');
    expect(libelles).toContain('00003 · sans cours');
    expect(libelles.filter(t => t.startsWith('00001 · '))).toHaveLength(2);
    expect(new Set(m.options.map(o => o.v)).size).toBe(m.options.length);

    // 2 · Chaque entrée montre ses seuls élèves.
    expect(m.choixB).toBe(true);
    expect(m.listeB.sort()).toEqual(['8722001', '8722002', '8722003']);
    expect(m.compteB).toBe('3');
    expect(m.boutonB).toBe('Supprimer le groupe 00001 · 601-872');
    expect(m.persisteeB).toContain('|');
    expect(m.choixA).toBe(true);
    expect(m.listeA.sort()).toEqual(['8721001', '8721002']);

    // 3 · Ajout à la main sous une entrée du cours B → coursId = B, sans changer le cours actif.
    expect(m.phraseAjoutB).toBe('Sera rattaché·e à : 601-872 Second cours du banc');
    expect(m.groupePrerempli).toBe('00001');
    expect(m.ajoutee).toMatchObject({ da: '8722009', coursId: 'COURS-872-B', groupe: '00001' });
    expect(m.actifApresAjout).toBe(m.actif.id);

    // 4 · Édition : la fiche garde son cours ; la phrase le dit, puis revient à celle de l'ajout.
    expect(m.editionB.phrase).toBe('Rattaché·e à : 601-872 Second cours du banc');
    expect(m.editionB.fiche).toMatchObject({ prenom: 'Modifié', coursId: 'COURS-872-B' });
    expect(m.editionB.phraseOuverte, 'la fiche reste ouverte après l\'enregistrement : sa phrase').toBe('Rattaché·e à : 601-872 Second cours du banc');
    expect(m.editionB.phraseApres).toBe('Sera rattaché·e à : 601-872 Second cours du banc');
    expect(m.listeSansCours).toEqual(['8723001']);
    expect(m.editionAncienne.phrase).toBe('Rattaché·e à aucun cours.');
    expect(m.editionAncienne.fiche).toMatchObject({ prenom: 'Modifiée' });
    expect(m.ancienneACle).toBe(false);

    // 5 · La suppression n'emporte que le couple ; la question nomme le groupe, sans « répartis dans N cours ».
    const question = dialogues.find(d => d.type === 'confirm');
    expect(question && question.message).toBe(`Supprimer les 2 étudiant(s) du groupe ${m.libelleA} ? Cette action est irréversible.`);
    expect(m.apresSuppr.resteA).toBe(0);
    expect(m.apresSuppr.resteB).toEqual(['8722001', '8722002', '8722003', '8722009']);
    expect(m.apresSuppr.resteDemo).toBe(m.nbDemo);
    expect(m.apresSuppr.options).not.toContain(m.libelleA);
    expect(m.apresSuppr.options).toContain('00001 · 601-872');

    // 6 · L'ancienne valeur persistée reste lue.
    expect(m.ancienneUnique).toBe('00003 · sans cours');
    expect(m.ancienneAmbigue).toEqual({ choisie: 'Tous les groupes', valeur: '' });

    // 7 · Nouveau groupe : le numéro libre se juge DANS le cours actif.
    const invite = dialogues.find(d => d.type === 'prompt');
    expect(invite && invite.defaut).toBe('00001');
    expect(m.nouveau.choisie).toBe('00001 · 601-873 (vide)');
    expect(m.nouveau.persistee).toBe(m.nouveau.valeur);
    expect(m.nouveau.phrase).toBe('Sera rattaché·e à : 601-873 Troisième cours du banc');
    expect(m.nouveau.options.filter(t => t.startsWith('00001 · '))).toHaveLength(3);

    // Aucun débordement horizontal de la page à 768 px.
    expect(m.largeur.page).toBeLessThanOrEqual(m.largeur.fenetre);
    expect(erreurs).toEqual([]);
});
