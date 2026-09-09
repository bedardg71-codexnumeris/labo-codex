import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const FICHIER = path.join(__dirname, 'fixtures-import-grilles-pointage.json');

// Sentinelle — après un import, la grille importée est SOUS LES YEUX (8 sept. 2026).
//
// Rapport testeur du 8 septembre, gravité GÊNANT : « la bibliothèque n'est pas
// rafraîchie au moment de l'importation d'une grille ». Mesure faite ce jour-là :
// elle L'ÉTAIT. Sur une bibliothèque de 60 grilles, la carte importée arrivait
// 61e sur 61, à 8 548 px sous le bas de la zone visible, sur une modale que la
// reconstruction remet en haut (scrollTop 0, 9 326 px de contenu pour 646 px
// visibles). L'écriture, la relecture et le rendu étaient bons — le résultat
// n'était simplement jamais montré.
//
// Aucun test de logique pure ne peut voir ça : il faut une géométrie de page.
//
// Le second essai couvre l'autre moitié du même défaut : quand un filtre mange
// tout le résultat, l'app annonçait « 1 grille ajoutée » devant une liste
// inchangée. Un succès qu'on ne peut pas voir doit se DIRE.

async function ouvrir(page) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
}

/** Sème une bibliothèque assez longue pour que la modale défile vraiment. */
const SEMER = `async (biblio, selection) => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    db.setSync('demo-actif', 'false');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set('a2026_grillesTemplates', selection);
    await db.set('bibliothequeGrilles', biblio);
    await afficherBibliothequeGrilles();
}`;

function grilleLongue(i) {
    return {
        id: 'GR_' + i,
        nom: 'Grille de travail numéro ' + i,
        description: 'Description assez longue pour que la carte pèse en hauteur. '.repeat(10),
        criteres: Array.from({ length: 8 }, (_, k) => ({
            id: 'c' + i + '_' + k, nom: 'Critère ' + k, ponderation: 12,
            description: 'Énoncé du critère, formulé pour l\'élève. '.repeat(6)
        }))
    };
}

async function importer(page, paquet) {
    fs.writeFileSync(FICHIER, JSON.stringify(paquet, null, 2));
    try {
        await page.setInputFiles('#fichier-import-grilles-modal', FICHIER);
        await page.waitForTimeout(500);
        await page.evaluate(() => {
            document.querySelector('.modal-import-grilles [data-action="confirmerEtFermerImportGrilles"]').click();
        });
        await page.waitForTimeout(1600); // écriture + re-rendu + défilement `smooth`
    } finally {
        fs.unlinkSync(FICHIER);
    }
}

test('PREUVE · la grille importée est amenée dans le cadre visible, et signalée', async ({ page }) => {
    await ouvrir(page);
    await page.evaluate(async ([semer, biblio]) => { await eval(semer)(biblio, []); },
        [SEMER, Array.from({ length: 60 }, (_, i) => grilleLongue(i))]);
    await page.waitForTimeout(400);

    await importer(page, {
        metadata: { licence: 'CC BY-SA 4.0', auteur_original: 'Un collègue' },
        contenu: { grilles: [{ id: 'GR_NEUVE', nom: 'Grille venue du collègue', criteres: [{ id: 'x', nom: 'A', ponderation: 100 }] }] }
    });

    const r = await page.evaluate(() => {
        const contenu = document.querySelector('#modalBibliothequeGrilles .modal-js-contenu');
        const carte = document.querySelector('[data-biblio-item-id="GR_NEUVE"]');
        if (!contenu || !carte) return { carteRendue: !!carte, contenuRendu: !!contenu };
        const rc = contenu.getBoundingClientRect();
        const rn = carte.getBoundingClientRect();
        return {
            carteRendue: true,
            contenuRendu: true,
            listeDefileVraiment: contenu.scrollHeight > contenu.clientHeight + 200,
            rang: Array.from(document.querySelectorAll('.grille-disponible-item')).indexOf(carte) + 1,
            total: document.querySelectorAll('.grille-disponible-item').length,
            dansLeCadre: rn.top < rc.bottom && rn.bottom > rc.top,
            pxSousLeBasDuCadre: Math.round(rn.top - rc.bottom),
            pointee: carte.classList.contains('biblio-carte--pointee')
        };
    });

    console.log('POINTAGE →', JSON.stringify(r));
    expect(r.carteRendue, 'la carte importée est bien rendue').toBe(true);
    expect(r.listeDefileVraiment, 'le montage produit bien une liste plus haute que la fenêtre').toBe(true);
    expect(r.rang, 'la carte est bien en fin de liste — c\'est la situation qui produisait la plainte').toBe(r.total);
    expect(r.dansLeCadre, 'et pourtant elle est SOUS LES YEUX : c\'est ce que corrige le lot').toBe(true);
    expect(r.pointee, 'elle est mise en évidence, pour qu\'on sache laquelle vient d\'arriver').toBe(true);
});

test('PREUVE · un import que les filtres masquent le DIT, au lieu d\'annoncer un succès invisible', async ({ page }) => {
    await ouvrir(page);
    // La grille importée porte l'auteur démo : en mode normal, la bibliothèque
    // la masque au rendu. L'écriture réussit, l'écran ne montre rien.
    await page.evaluate(async ([semer]) => { await eval(semer)([], []); }, [SEMER]);
    await page.waitForTimeout(400);

    await importer(page, {
        metadata: { licence: 'CC BY-SA 4.0', auteur_original: 'Demo' },
        contenu: { grilles: [{ id: 'GR_MASQUEE', nom: 'Grille venue de la démo', auteur: 'Demo Labo Codex', criteres: [] }] }
    });

    const r = await page.evaluate(async () => {
        const notif = document.querySelector('.notification-succes');
        return {
            enBase: ((await db.get('bibliothequeGrilles')) || []).some(g => g.id === 'GR_MASQUEE'),
            carteRendue: !!document.querySelector('[data-biblio-item-id="GR_MASQUEE"]'),
            texteNotif: notif ? notif.innerText : ''
        };
    });

    console.log('MASQUÉ →', JSON.stringify(r));
    expect(r.enBase, 'la grille est bien écrite en bibliothèque').toBe(true);
    expect(r.carteRendue, 'mais aucune carte ne la porte — le filtre démo la masque').toBe(false);
    expect(r.texteNotif, 'et l\'app le dit, au lieu d\'annoncer un succès que l\'écran ne montre pas')
        .toContain('un filtre d\'affichage les masque ici');
});
