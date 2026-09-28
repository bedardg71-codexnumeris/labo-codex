import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #914 (19 sept. 2026) — L'APPLICATION N'INVENTE PLUS DE DA, DANS LA VRAIE PAGE.
//
// Règle de Grégoire : « Aucune DA ne devrait être inventé de toute pièce dans l'application. Il n'existe qu'un
// seul format, et c'est celui créé par le collège » — sept chiffres, rien d'autre.
//
// Le banc FAIT LE GESTE au formulaire du Cadre › Groupe d'étudiant·es (champs remplis, bouton cliqué ; l'édition
// s'ouvre par le menu « Action » de la rangée, pas par un appel de fonction) et LIT L'ÉCRAN : le message de la
// notification, la liste dessinée. Pack démo : ses DA sont des « DEMO### » — le cas qui interdit de valider à
// chaque enregistrement.
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

test('#914 · DA vide ou non conforme refusé au formulaire, élève de démonstration encore modifiable, DA effacé en édition refusé', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = [];
    page.on('dialog', (d) => d.dismiss());
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
        await window.activerModeDemo();
        await pause(1500);

        const champ = (id) => document.getElementById(id);
        const stock = () => JSON.parse(JSON.stringify(obtenirDonneesSelonMode('groupeEtudiants') || []));
        const liste = () => texte(champ('v2-listeEtudiants')) || '';
        const retirerNotifs = () => {
            document.querySelectorAll('.notification-erreur, .notification-succes').forEach(n => n.remove());
            if (window.temoinEnregistrement) window.temoinEnregistrement.fermer();
            document.querySelector('#temoin-enregistrement .temoin-enregistrement-succes')?.classList.remove('visible');
        };
        // Ce que l'écran DIT après le geste. ↻ Lot E2 (28 sept. 2026, D3) : un refus parle par le
        // témoin commun (« Non enregistré – ‹geste› : ‹raison› ») ; une modification dit « Enregistré ».
        const lireNotifs = () => {
            const echec = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec');
            const succesTemoin = document.querySelector('#temoin-enregistrement .temoin-enregistrement-succes');
            return {
                erreurs: echec && echec.classList.contains('visible') ? [texte(echec.querySelector('.temoin-enregistrement-echec-texte'))] : [],
                succes: [...document.querySelectorAll('.notification-succes:not(.notification-erreur) .notification-texte')].map(texte),
                enregistre: !!(succesTemoin && succesTemoin.classList.contains('visible')),
            };
        };
        const soumettre = async ({ da, nom, prenom }) => {
            retirerNotifs();
            if (da !== undefined) champ('v2-etudiantDA').value = da;
            if (nom !== undefined) champ('v2-etudiantNom').value = nom;
            if (prenom !== undefined) champ('v2-etudiantPrenom').value = prenom;
            champ('v2-btnSoumettreEtudiant').click();
            await pause(900);
            return lireNotifs();
        };
        // LE GESTE de l'édition : le menu « Action » de la rangée, option « editer ».
        const ouvrirEdition = async (da) => {
            const menu = [...document.querySelectorAll('#v2-listeEtudiants select[data-on-change="actionEtudiantV2Handler"]')].find(s => s.dataset.da === da);
            if (!menu) return false;
            menu.value = 'editer';
            menu.dispatchEvent(new Event('change', { bubbles: true }));
            await pause(400);
            return true;
        };

        const r = { stockDepart: stock(), listeDepart: liste(), essais: {} };

        // 1 · Ajout : DA vide, puis quatre formes non conformes.
        for (const da of ['', '123456', '12345678', 'DA1234567', '123 4567']) {
            const notifs = await soumettre({ da, nom: 'Refusé', prenom: 'Rémi' });
            r.essais['ajout:' + da] = { notifs, stockInchange: JSON.stringify(stock()) === JSON.stringify(r.stockDepart), listeInchangee: liste() === r.listeDepart, champDA: champ('v2-etudiantDA').value, champNom: champ('v2-etudiantNom').value };
        }

        // 2 · Ajout conforme (espaces en tête et en fin) : accepté, écrit sans ses espaces.
        const notifsOk = await soumettre({ da: '  9140001  ', nom: 'Accepté', prenom: 'Alix' });
        r.ajoutConforme = { notifs: notifsOk, fiche: stock().find(e => e.da === '9140001') || null, nbFiches: stock().length, dansLaListe: liste().includes('Accepté') };

        // 3 · Édition d'un élève de démonstration SANS toucher au DA.
        const daDemo = r.stockDepart.map(e => e.da).find(d => /^DEMO\d+$/.test(d));
        r.daDemo = daDemo;
        r.menuTrouve = await ouvrirEdition(daDemo);
        r.champDAEnEdition = champ('v2-etudiantDA').value;
        const programmeAvant = (stock().find(e => e.da === daDemo) || {}).programme;
        champ('v2-etudiantProgramme').value = '914.T0';
        const notifsDemo = await soumettre({});
        r.editionDemo = { notifs: notifsDemo, programmeAvant, fiche: stock().find(e => e.da === daDemo) || null, nbFiches: stock().length };

        // 4 · Édition qui EFFACE le DA : refusée, fiche intacte, aucune fiche à identifiant fabriqué.
        const avantEffacement = stock();
        r.menuTrouve2 = await ouvrirEdition(daDemo);
        const notifsEfface = await soumettre({ da: '', nom: 'Ne doit pas passer' });
        r.editionEffacee = { notifs: notifsEfface, stockInchange: JSON.stringify(stock()) === JSON.stringify(avantEffacement) };

        r.fabriques = stock().filter(e => /^(DA|AUTO-)\d{10,}$/.test(String(e.da))).length;
        r.nbAjoutees = stock().length - r.stockDepart.length;
        r.inputmode = champ('v2-etudiantDA').getAttribute('inputmode');
        return r;
    });

    // 1 · cinq refus, chacun LU À L'ÉCRAN, rien d'écrit, liste inchangée, saisie gardée pour correction.
    for (const da of ['', '123456', '12345678', 'DA1234567', '123 4567']) {
        const e = m.essais['ajout:' + da];
        expect(e.notifs.erreurs.length, 'une notification d\'erreur pour « ' + da + ' »').toBe(1);
        expect(e.notifs.erreurs[0]).toContain(da === '' ? 'le DA est manquant' : 'le DA est invalide');
        expect(e.notifs.erreurs[0]).toContain('sept chiffres');
        expect(e.notifs.erreurs[0]).toMatch(/^Non enregistré – Ajouter l'étudiant·e : /);
        expect(e.notifs.succes).toEqual([]);
        expect(e.stockInchange).toBe(true);
        expect(e.listeInchangee).toBe(true);
        expect(e.champNom).toBe('Refusé');               // le formulaire n'est pas vidé : on corrige, on ne ressaisit pas
    }

    // 2 · sept chiffres : accepté.
    expect(m.ajoutConforme.notifs.erreurs).toEqual([]);
    expect(m.ajoutConforme.notifs.succes.length).toBe(1);
    expect(m.ajoutConforme.fiche && m.ajoutConforme.fiche.nom).toBe('Accepté');
    expect(m.ajoutConforme.nbFiches).toBe(m.stockDepart.length + 1);
    expect(m.ajoutConforme.dansLaListe).toBe(true);

    // 3 · l'élève de démonstration se modifie encore, son DA ne bouge pas.
    expect(m.daDemo).toMatch(/^DEMO\d+$/);
    expect(m.menuTrouve).toBe(true);
    expect(m.champDAEnEdition).toBe(m.daDemo);
    expect(m.editionDemo.notifs.erreurs).toEqual([]);
    // Lot E2 : une modification ne fait plus de message, le témoin dit « Enregistré ».
    expect(m.editionDemo.notifs.succes.length).toBe(0);
    expect(m.editionDemo.notifs.enregistre).toBe(true);
    expect(m.editionDemo.programmeAvant).not.toBe('914.T0');
    expect(m.editionDemo.fiche && m.editionDemo.fiche.programme).toBe('914.T0');
    expect(m.editionDemo.fiche.da).toBe(m.daDemo);

    // 4 · DA effacé en édition : refusé, fiche intacte.
    expect(m.menuTrouve2).toBe(true);
    expect(m.editionEffacee.notifs.erreurs.length).toBe(1);
    expect(m.editionEffacee.notifs.erreurs[0]).toContain('le DA est manquant');
    expect(m.editionEffacee.stockInchange).toBe(true);

    expect(m.fabriques).toBe(0);
    expect(m.nbAjoutees).toBe(1);
    expect(m.inputmode).toBe('numeric');
    expect(erreurs).toEqual([]);
});
