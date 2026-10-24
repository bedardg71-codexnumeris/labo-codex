import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #745, lot E du cadrage du dépistage (17 sept. 2026) — L'ÉLÈVE EXCLU, DANS LA VRAIE PAGE.
//
// Mesuré en 1.142.27 par une sonde sur le pack démo, un élève passé en « décrochage » : son profil NE S'OUVRAIT PAS
// (« Étudiant·e introuvable », l'ancien profil restait), son A tombait à 0, et son entrée `indicesCP` restait figée à la
// valeur du jour de l'exclusion. Tranché par Grégoire le 16 sept. : son profil se calcule avec la règle de sa pratique,
// affiche son statut, et reste hors des moyennes du groupe.
//
// ⚠ LE PACK DÉMO NE PORTE AUCUN EXCLU : le banc pose lui-même le statut sur DEMO015, dans le stockage de la démo.
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).
//
// Trois mesures : (1) l'exclu lit ses nombres d'élève actif ; (2) l'en-tête dit son statut, le sélecteur le montre ;
// (3) les écrans du groupe rendent les MÊMES nombres avec lui (exclu) que s'il n'était pas dans le groupe du tout.

const DA = 'DEMO015';

test('profil · un élève en décrochage : son profil s\'ouvre, calculé par sa pratique, statut affiché — et le groupe ne bouge pas', async ({ page }) => {
    test.setTimeout(180000);
    const dialogues = [];
    page.on('dialog', (d) => { dialogues.push(d.message()); d.dismiss(); });
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

    const m = await page.evaluate(async (DA) => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        const texte = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
        await window.activerModeDemo();
        await pause(1500);

        // Les écrans du groupe, tels qu'ils s'écrivent : la Liste (moyennes et corrélations) et le tableau de bord.
        // (L'aperçu des présences n'est pas lu : ses cibles `pa-taux-moyen`, `stat-nb-eleves` n'existent pas dans index.html —
        // mesuré le 17 sept. ; une capture y lirait du vide.)
        // Le tableau de bord est rendu UNE fois : la phrase du bilan des fondamentaux est jugée au premier rendu (#906).
        const ecransDuGroupe = async () => {
            afficherListeEtudiantsConsultation(); await pause(500);
            const liste = ['moy-a', 'moy-c', 'moy-p', 'corr-a', 'corr-c'].map(id => id + '=' + texte(document.getElementById(id)));
            chargerTableauBordApercu(); await pause(700);
            const tdb = ['carte-indicateurs-acpe', 'conteneur-indicateurs-apprentissage', 'compteur-suivi', 'liste-etudiants-suivi'].map(id => id + '=' + texte(document.getElementById(id)));
            return { liste, tdb };
        };

        const actif = calculerTousLesIndices(DA);

        // (A) DEMO015 passe en décrochage.
        let etu = obtenirDonneesSelonMode('groupeEtudiants');
        const lui = JSON.parse(JSON.stringify(etu.find(e => e.da === DA)));
        etu.find(e => e.da === DA).statut = 'décrochage';
        sauvegarderDonneesSelonMode('groupeEtudiants', etu);
        const groupeAvecExclu = await ecransDuGroupe();

        afficherProfilComplet('DEMO004'); await pause(400);
        afficherProfilComplet(DA); await pause(500);
        // #1151 : la carte d'identité est partie. Le nom est dans le menu ; le statut, la PREMIÈRE étiquette de la rangée.
        const rangee = document.querySelector('#contenuProfilEtudiant .rangee-selection-profil');
        const etiquettes = rangee ? rangee.querySelector('.rangee-selection-etiquettes') : null;
        const ligne = etiquettes ? etiquettes.querySelector('[data-statut-exclu]') : null;
        const groupe = ligne ? ligne.nextElementSibling : null;
        const select = document.getElementById('selecteurEtudiantProfil');
        const profil = {
            profilActuelDA: window.profilActuelDA,
            nom: select && select.selectedOptions[0] ? texte(select.selectedOptions[0]) : null,
            ligne: texte(ligne),
            ligneSousLeNom: !!(ligne && etiquettes.firstElementChild === ligne),
            indices: calculerTousLesIndices(DA),
            selection: select ? select.value : null,
            nbOptions: select ? select.options.length : null,
            // mise en page à 768 px : la rangée ne déborde pas, l'étiquette du statut tient sur une ligne comme celle du groupe
            deborde: rangee ? (rangee.scrollWidth > rangee.clientWidth + 1) : null,
            hauteurLigne: ligne ? Math.round(ligne.getBoundingClientRect().height) : null,
            hauteurLigneDA: groupe ? Math.round(groupe.getBoundingClientRect().height) : null
        };
        afficherProfilComplet('DEMO004'); await pause(400);
        const selectActif = document.getElementById('selecteurEtudiantProfil');
        const depuisUnActif = { nbOptions: selectActif.options.length, contientExclu: Array.from(selectActif.options).some(o => o.value === DA), ligne: !!document.querySelector('[data-statut-exclu]') };

        // (B) le même groupe SANS lui (ses copies et ses présences restent en base).
        etu = obtenirDonneesSelonMode('groupeEtudiants').filter(e => e.da !== DA);
        sauvegarderDonneesSelonMode('groupeEtudiants', etu);
        const groupeSansLui = await ecransDuGroupe();
        const parti = calculerTousLesIndices(DA);

        // (C) témoin : le même élève ACTIF fait bouger ces écrans (sinon (A) = (B) ne prouverait rien).
        etu = obtenirDonneesSelonMode('groupeEtudiants'); etu.push(lui);
        sauvegarderDonneesSelonMode('groupeEtudiants', etu);
        const groupeAvecActif = await ecransDuGroupe();

        return { actif, groupeAvecExclu, groupeSansLui, groupeAvecActif, profil, depuisUnActif, parti };
    }, DA);

    // (1) Ses nombres d'élève actif, valeurs du pack démo (C figé par le banc #871 : DEMO015 = 80).
    expect(m.actif).toMatchObject({ A: 84, C: 80, P: 68 });
    expect(m.profil.indices).toEqual(m.actif);

    // (2) Le profil s'ouvre, sans dialogue ; le statut est la première étiquette de la rangée (#1151) ; le sélecteur le montre.
    expect(dialogues).toEqual([]);
    expect(m.profil.profilActuelDA).toBe(DA);
    expect(m.profil.nom).toMatch(/^Mandela, Nelson\b/);
    expect(m.profil.ligne).toBe('Décrochage · hors des moyennes du groupe');
    expect(m.profil.ligneSousLeNom).toBe(true);
    expect(m.profil.selection).toBe(DA);
    expect(m.profil.nbOptions).toBe(10);                 // neuf actifs + l'exclu affiché
    expect(m.depuisUnActif).toEqual({ nbOptions: 9, contientExclu: false, ligne: false });
    // Mise en page à 768 px : une étiquette de plus, de la hauteur de celle du groupe, sans débordement.
    expect(m.profil.deborde).toBe(false);
    expect(m.profil.hauteurLigne).toBe(m.profil.hauteurLigneDA);

    // (3) Hors des moyennes du groupe : avec lui exclu = sans lui ; et le témoin actif, lui, déplace les écrans.
    expect(m.groupeAvecExclu).toEqual(m.groupeSansLui);
    expect(m.groupeAvecActif.liste).not.toEqual(m.groupeSansLui.liste);
    expect(m.groupeAvecActif.tdb).not.toEqual(m.groupeSansLui.tdb);
    expect(m.groupeSansLui.tdb[0]).toContain('| 9 personnes');
    expect(m.groupeAvecActif.tdb[0]).toContain('| 10 personnes');
    // Toutes les cibles lues existent et sont écrites (une capture vide rendrait l'égalité ci-dessus sans valeur).
    expect(m.groupeSansLui.liste.concat(m.groupeSansLui.tdb.slice(0, 3)).every(l => !/=null$/.test(l) && !/=—?$/.test(l))).toBe(true);

    // Un DA qui n'est plus dans le groupe : aucun calcul.
    expect(m.parti).toMatchObject({ A: null, C: null, P: null, horsGroupe: true });
});
