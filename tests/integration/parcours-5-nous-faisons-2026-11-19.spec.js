import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import { ouvrirPanneau, attendreEtape, bulle } from './harness/classe-de-banc.js';
import { leParcoursEntier, dossierDesCaptures } from './harness/parcours-3-de-banc.js';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// « MONTER TON COURS », « NOUS FAISONS » : LES BULLES UNE À UNE (19-20 NOV. 2026, SESSION DE NUIT B, LOT 2)
// =======================================================================
// plans de travail/CONSIGNE-2026-11-19-nous-faisons-cours.md, point 3. Le geste lui-même (glisser, tirer un trait, écrire
// dans la carte) est jugé par parcours-5-monter-ton-cours-2026-11-09.spec.js. Ce banc-ci juge la BULLE, bulle par bulle,
// en posant l'état de la carte par son API (le chemin le plus court vers chaque état) :
//   · la confirmation au-dessus du titre : présente quand l'étape d'avant a été faite pendant ce passage, absente à
//     l'étape où « Reprendre » rentre, et dans la seconde forme de la bulle 6 ;
//   · le classement : les explications en phrases sans marque, les gestes en liste, la consigne en dernier ;
//   · les gestes qui se grisent quand la carte dit qu'ils sont faits ;
//   · les deux formes de la bulle 6, puis la fin : l'objectif atteint, « Pour revoir une étape… », la phrase de la suite,
//     la consigne et les boutons du moteur ; la bulle 7 tient dans la fenêtre.
// Aux deux tailles de l'iPad (1180 × 820, 820 × 1180). Les textes eux-mêmes : la sentinelle Vitest du parcours.
// Break-tests (19-20 nov.) : voir le rapport du lot (plans de travail/RAPPORT-2026-11-19-nous-faisons-cours.md).

const OBJECTIF = "À la fin de ce parcours, tu seras en mesure d'aligner une première chaîne de ton cours, de sa compétence jusqu'à ta production.";
const ATTEINT = "Objectif atteint : tu es en mesure d'aligner une première chaîne de ton cours, de sa compétence jusqu'à ta production.";
const item = (page) => page.locator('#panneau-assistance [data-parcours="monter"]');
const plat = (t) => String(t || '').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();

/** Ce que la bulle montre, à plat : la confirmation, les phrases, la liste (avec son état), les boutons. */
const lireBulle = (page) => page.evaluate(() => {
    const b = document.getElementById('parcours-bulle');
    const plat = (t) => String(t || '').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
    const conf = b.querySelector('.parcours-bulle-confirme');
    return {
        confirme: conf && !conf.hidden ? plat(conf.textContent) : '',
        objectif: plat(b.querySelector('.parcours-bulle-objectif')?.textContent),
        lieu: plat(b.querySelector('.parcours-bulle-lieu')?.textContent),
        notes: [...b.querySelectorAll('.parcours-bulle-note')].map((p) => plat(p.textContent)),
        gestes: [...b.querySelectorAll('.parcours-bulle-ligne')].map((li) => ({
            texte: plat(li.querySelector('.parcours-bulle-ligne-texte').textContent),
            consigne: li.classList.contains('parcours-bulle-ligne--geste'),
            faite: li.classList.contains('est-faite')
        })),
        boutons: [...b.querySelectorAll('.parcours-bulle-boutons button')].map((x) => plat(x.textContent))
    };
});

/** La sonde du moteur passe (120 ms) : on attend qu'elle ait relu l'état, par une condition sur la bulle. */
async function ligneFaite(page, debut, faite = true) {
    await expect.poll(async () => {
        const g = (await lireBulle(page)).gestes.find((x) => x.texte.startsWith(debut));
        return g ? g.faite : 'absente';
    }, { message: `« ${debut}… » ${faite ? 'grisée' : 'à faire'}` }).toBe(faite);
}

const carte = (page, fn, arg) => page.evaluate(fn, arg);
// Des identifiants que la carte garde tels quels au rechargement (elle préfixe les autres de « planif- »).
async function poser(page, noeuds) {
    // La carte d'abord chargée (sinon son chargement, s'il arrive après, efface le bloc posé), puis le bloc dans son état.
    await page.waitForFunction(() => window.planificationCarte?.etat?.initialise === true && !!document.getElementById('planif-palette')?.offsetParent);
    await carte(page, (n) => window.planificationCarte.injecterNoeuds(n), noeuds);
    await page.waitForFunction((ids) => ids.every((i) => window.planificationCarte.etat.noeuds.has(i) && document.getElementById(i)), noeuds.map((n) => n.id));
}
const titrer = (page, id, titre) => carte(page, ([i, t]) => { window.planificationCarte.etat.noeuds.get(i).titre = t; }, [id, titre]);
const lier = (page, source, cible, type) => carte(page, ([s, c, t]) => {
    window.planificationCarte.etat.liens.set('banc-' + s + '-' + c, { id: 'banc-' + s + '-' + c, source: s, cible: c, type: t });
}, [source, cible, type]);
const enfants = (page, parent, ids) => carte(page, ([p, liste]) => {
    const api = window.planificationCarte;
    api.etat.noeuds.get(p).enfants = liste.slice();
    liste.forEach((i) => { api.etat.noeuds.get(i).parent = p; });
}, [parent, ids]);

async function fermerLeRappel(page) {
    await page.evaluate(() => {
        if (window.backupReminder) window.backupReminder.reporterApresMiseAJourDuCodex();
        const o = document.querySelector('#overlay-backup-reminder.actif');
        const b = o && [...o.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Plus tard');
        if (b) b.click();
    });
}

for (const [largeur, hauteur] of [[1180, 820], [820, 1180]]) {
    test(`« Nous faisons » : la bulle de chaque étape, sa confirmation, ses gestes qui se grisent, ses deux formes et sa fin (${largeur} × ${hauteur})`, async ({ page }) => {
        test.setTimeout(360000);
        dossierDesCaptures('');
        await leParcoursEntier(page, { niveaux: true, cap: 'p3' });
        await page.keyboard.press('Escape');
        const pid = await page.evaluate(() => ParcoursEvaluer.contexte().productionId);
        await page.setViewportSize({ width: largeur, height: hauteur });
        await fermerLeRappel(page);
        await ouvrirPanneau(page);
        await item(page).locator('.assistance-parcours-bouton').click();

        // 1. L'objectif, la phrase du lieu, six explications, deux gestes ; aucune confirmation.
        await attendreEtape(page, 1, 7, 'Ta compétence');
        let b = await lireBulle(page);
        expect(b.objectif).toBe(OBJECTIF);
        expect(b.lieu).toBe("Tu es dans « Conception », à l'onglet « Alignement » : c'est là que tu construis ta carte d'alignement.");
        expect(b.confirme).toBe('');
        expect(b.notes).toHaveLength(6);
        expect(b.gestes.map((g) => g.consigne)).toEqual([false, true]);
        expect(b.gestes.every((g) => !g.faite)).toBe(true);
        await poser(page, [{ id: 'planif-bC', type: 'competence', titre: '' }]);
        await ligneFaite(page, 'Touche « Compétence »');
        await ligneFaite(page, 'Écris son énoncé', false);
        await titrer(page, 'planif-bC', 'Analyser des textes littéraires');

        // 2. La confirmation ; toucher, écrire, relier.
        await attendreEtape(page, 2, 7, 'Ton idée maîtresse', { focus: false });
        b = await lireBulle(page);
        expect(b.confirme).toBe("C'est fait : ta compétence est écrite.");
        expect(b.objectif, 'l’objectif : la bulle 1 seulement').toBe('');
        expect(b.lieu, 'la phrase du lieu : la bulle 1 seulement').toBe('');
        expect(b.gestes.map((g) => g.consigne)).toEqual([false, false, true]);
        await poser(page, [{ id: 'planif-bI', type: 'idee-maitresse', titre: '' }]);
        await ligneFaite(page, 'Touche « Idée maîtresse »');
        await ligneFaite(page, 'Écris ton idée maîtresse', false);
        await titrer(page, 'planif-bI', 'Le texte comme système');
        await ligneFaite(page, 'Écris ton idée maîtresse');
        await lier(page, 'planif-bC', 'planif-bI', 'se_decline_en');

        // 3. La leçon : toucher, titre, semaine et séance, relier. Puis « Plus tard » à l'étape 4, et « Reprendre ».
        await attendreEtape(page, 3, 7, 'Ta leçon', { focus: false });
        expect((await lireBulle(page)).confirme).toBe("C'est fait : ton idée maîtresse est reliée à ta compétence.");
        await poser(page, [{ id: 'planif-bL', type: 'lecon', titre: '' }]);
        await ligneFaite(page, 'Touche « Leçon »');
        await titrer(page, 'planif-bL', 'Lire un incipit');
        await ligneFaite(page, 'Donne-lui un titre');
        await ligneFaite(page, 'Dans son en-tête', false);
        await carte(page, () => { const api = window.planificationCarte; api.definirSemaineLecon('planif-bL', 2); api.definirRangSeance('planif-bL', 1); });
        await ligneFaite(page, 'Dans son en-tête');
        await lier(page, 'planif-bI', 'planif-bL', 'se_concretise_dans');
        await attendreEtape(page, 4, 7, 'Ton objectif', { focus: false });
        expect((await lireBulle(page)).confirme).toBe("C'est fait : ta leçon est datée et reliée à ton idée maîtresse.");
        await bulle(page).getByRole('button', { name: 'Plus tard' }).click();
        await page.reload();
        await attendreApplication(page);
        await fermerLeRappel(page);
        await ouvrirPanneau(page);
        await item(page).locator('.assistance-parcours-bouton').click();

        // 4. Repris ici : aucune confirmation (l'étape d'avant n'a pas été faite pendant ce passage).
        await attendreEtape(page, 4, 7, 'Ton objectif');
        b = await lireBulle(page);
        expect(b.confirme, 'après « Reprendre », la première bulle ne confirme rien').toBe('');
        expect(b.gestes.map((g) => g.consigne)).toEqual([false, true]);
        await ligneFaite(page, 'Touche le badge 🎯', false);
        await carte(page, () => document.querySelector('[id="planif-bL"] .planif-badge-objectif').click());
        await ligneFaite(page, 'Touche le badge 🎯');
        await carte(page, () => { document.activeElement && document.activeElement.blur(); window.planificationCarte.definirObjectifsLecon('planif-bL', ['Repérer les procédés d’un incipit']); });

        // 5. La confirmation revient (l'étape 4 a été faite pendant ce passage) ; glisser, ouvrir, cocher.
        await attendreEtape(page, 5, 7, 'Ton activité', { focus: false });
        expect((await lireBulle(page)).confirme).toBe("C'est fait : ton objectif est écrit.");
        await poser(page, [{ id: 'planif-bA', type: 'activite', titre: 'Annoter un incipit' }]);
        await ligneFaite(page, 'Donne-lui un titre');
        await ligneFaite(page, 'Glisse le bloc dans ta leçon', false);
        await enfants(page, 'planif-bL', ['planif-bA']);
        await ligneFaite(page, 'Glisse le bloc dans ta leçon');
        await carte(page, () => document.getElementById('planif-bA').dispatchEvent(new MouseEvent('dblclick', { bubbles: true })));
        await ligneFaite(page, 'Touche deux fois cette poignée');
        const objectif = await carte(page, () => window.planificationCarte.objectifsDeLecon(window.planificationCarte.etat.noeuds.get('planif-bL'))[0].id);
        await carte(page, (o) => window.planificationCarte.definirObjectifsServis('planif-bA', [o]), objectif);

        // 6. La première forme, puis la seconde (l'évaluation avant l'activité), puis la première de nouveau.
        await attendreEtape(page, 6, 7, 'Ton évaluation', { focus: false });
        b = await lireBulle(page);
        expect(b.confirme).toBe("C'est fait : ton activité sert ton objectif.");
        expect(b.gestes.map((g) => g.consigne)).toEqual([false, false, false, false, false, true]);
        await poser(page, [{ id: 'planif-bE', type: 'evaluation', titre: 'Journal de lecture 1' }]);
        await carte(page, (o) => window.planificationCarte.definirObjectifsServis('planif-bE', [o]), objectif);
        await enfants(page, 'planif-bL', ['planif-bE', 'planif-bA']);
        await expect.poll(async () => (await lireBulle(page)).gestes.map((g) => g.texte), { message: 'la seconde forme' })
            .toEqual(['Glisse ton évaluation sous ton activité, par sa poignée ⠿']);
        b = await lireBulle(page);
        expect(b.confirme, 'la seconde forme ne garde que son titre et son compteur').toBe('');
        expect(b.notes).toEqual(["Ta pastille affiche « ⚠ » : dans ta leçon, l'évaluation vient avant l'activité qui enseigne son objectif."]);
        await enfants(page, 'planif-bL', ['planif-bA', 'planif-bE']);
        await expect.poll(async () => (await lireBulle(page)).gestes.length, { message: 'la première forme revient' }).toBe(6);
        expect((await lireBulle(page)).confirme).toBe("C'est fait : ton activité sert ton objectif.");
        await ligneFaite(page, "Dans l'Inspecteur, coche l'objectif que ton évaluation vérifie");
        await ligneFaite(page, 'Choisis dans « Production »', false);
        await carte(page, (p) => { window.planificationCarte.etat.noeuds.get('planif-bE').metadata.productionId = p; }, pid);

        // 7. La fin du moteur : l'objectif atteint, « Pour revoir… », la phrase de la suite, la consigne, les boutons.
        await attendreEtape(page, 7, 7, 'Raffiner, si tu veux', { focus: false });
        b = await lireBulle(page);
        expect(b.confirme).toBe("C'est fait : ton évaluation vérifie ton objectif.");
        const tout = await carte(page, () => document.getElementById('parcours-bulle').textContent.replace(/[  ]/g, ' '));
        expect(tout).toContain(ATTEINT);
        expect(tout).toContain('Chaque parcours a son objectif. C\'est toi qui choisis la suite.');
        expect(tout).toContain('Pour revoir une étape, touche « 7 sur 7 ».');
        const suite = await carte(page, () => !!(window.Assistance && window.Assistance.suivantDe && window.Assistance.suivantDe('monter')));
        expect(b.gestes.map((g) => g.texte)).toEqual([suite ? 'Touche « Parcours suivant », ou « Terminer »' : 'Touche « Terminer »']);
        expect(b.boutons).toEqual(suite ? ['Parcours suivant', 'Terminer'] : ['Terminer']);
        // La bulle 7, au centre, tient dans la fenêtre.
        const r = await carte(page, () => { const x = document.getElementById('parcours-bulle').getBoundingClientRect(); return { haut: x.top, bas: x.bottom, h: innerHeight }; });
        expect(r.haut).toBeGreaterThanOrEqual(0);
        expect(r.bas).toBeLessThanOrEqual(r.h);
    });
}
