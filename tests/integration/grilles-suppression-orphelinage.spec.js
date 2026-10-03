import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// #1007, second lot (3 oct. 2026) : ce banc ne juge pas le codex proposé avant une suppression
// (jugé par 1007-propose-codex-avant-suppression.spec.js). Doublure « codex à jour » : la fenêtre
// qui propose ne paraît pas, et le geste se déroule comme avant le lot.
test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.Codex) window.Codex.proposerAvantSuppression = async () => true;
        });
    });
});

// Sentinelle — supprimer une grille ne peut pas rendre ses cartouches introuvables
// (24 août 2026).
//
// Relevé sur le corpus de Grégoire : « Carte mentale A26 », « Plan de rédaction A26 »
// et « Stratégies de lecture A26 » vivaient dans des clés `cartouches_<grille>` dont
// la grille avait disparu de son trimestre. Rien n'était détruit — mais plus rien ne
// pouvait les lire, puisque la barre latérale n'énumère que les grilles PRÉSENTES.
// Symptôme vécu : « mes cartouches nouvellement configurées n'ont pas persisté ».
//
// `supprimerGrilleDefinitivement` portait déjà la garde ; `supprimerGrilleDepuisSidebar`
// — le chemin le plus utilisé — ne l'avait jamais reçue.
//
// ⚠⚠ MIS À JOUR le 31 août 2026 (#624) — LE RÉGIME A CHANGÉ, PAS L'INVARIANT.
// Les quatre portes délèguent désormais à `supprimerGrilleAvecPorteDeSortie`, et
// « un blocage sans issue n'est pas une garde » : au lieu de refuser sèchement, le
// chemin NOMME les cartouches et PROPOSE de les déplacer vers une autre grille.
// Le refus sec ne subsiste que là où il n'existe aucune grille d'accueil.
//
// ⮕ L'invariant que ce fichier verrouille est INCHANGÉ : *une grille porteuse ne
// part jamais en emportant ses cartouches en silence.* Ce qui change, c'est le
// texte. Les assertions sur l'ÉTAT (la grille est là, ses cartouches aussi) et sur
// le NOMMAGE (« Carte mentale A26 ») sont conservées telles quelles — ce sont elles
// qui portent l'invariant. Un troisième cas est AJOUTÉ pour le refus sec, sinon
// cette branche-là ne serait plus exercée par personne.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set('a2026_grillesTemplates', [
        { id: 'GR_AVEC', nom: 'Grille avec cartouches', criteres: [], dansBibliotheque: true },
        { id: 'GR_SANS', nom: 'Grille sans cartouche', criteres: [], dansBibliotheque: true }
    ]);
    // security-ok: fixture de test, littéral écrit par le spec — aucune source externe.
    await db.set(cle('cartouches_GR_AVEC'), [
        { id: 'C1', nom: 'Carte mentale A26', grilleId: 'GR_AVEC' },
        { id: 'C2', nom: 'Plan de rédaction A26', grilleId: 'GR_AVEC' }
    ]);
    // security-ok: fixture de test, littéral écrit par le spec — aucune source externe.
    await db.set(cle('cartouches_GR_SANS'), []);
}`;

test('PREUVE · supprimer une grille PORTEUSE de cartouches est refusé, et le dit', async ({ page }) => {
    const dialogues = [];
    page.on('dialog', (d) => { dialogues.push(d.message()); d.accept().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        await supprimerGrilleDepuisSidebar('GR_AVEC');
        await new Promise(res => setTimeout(res, 400));
        return {
            grilles: (await db.get('a2026_grillesTemplates') || []).map(g => g.id),
            cartouches: (await db.get(cle('cartouches_GR_AVEC')) || []).map(c => c.nom)
        };
    }, SEMER);

    console.log('REFUS →', JSON.stringify(r));
    console.log('DIALOGUES →', JSON.stringify(dialogues, null, 1));
    expect(r.grilles, 'la grille est toujours là').toContain('GR_AVEC');
    expect(r.cartouches, 'et ses cartouches aussi').toHaveLength(2);
    // Le message NOMME ce qui bloque — sinon l'enseignant ne sait pas quoi faire.
    // C'est l'assertion la plus importante du fichier, et elle est INCHANGÉE depuis
    // le 24 août : un compte seul ne dit pas ce qu'on s'apprête à perdre.
    expect(dialogues.join(' ')).toContain('Carte mentale A26');
    expect(dialogues.join(' '), 'le compte des cartouches est dit').toContain('2 cartouche');
    // #624 — LA PORTE DE SORTIE EST OFFERTE, et c'est ce qui remplace le refus sec.
    expect(dialogues.join(' '), 'l\'issue est proposée, pas seulement le refus')
        .toContain('déplacer');
    expect(dialogues.join(' '), 'le prix de l\'inaction est dit')
        .toContain('introuvables');
    // ⮕ CONSERVÉ du régime précédent, et toujours vrai : on ne demande JAMAIS
    // « Supprimer cette grille ? » avant d'avoir vérifié les dépendances. Cette
    // question-là n'est posée que sur une grille sans cartouche.
    expect(dialogues.join(' '), 'la confirmation nue ne doit pas s\'ouvrir')
        .not.toContain('Supprimer la grille « Grille avec cartouches » ?');
});

test('PREUVE · sans grille d\'accueil, le refus redevient sec — et il dit quoi faire', async ({ page }) => {
    // #624 — LE REFUS SEC N'A PAS DISPARU, il s'est déplacé à la seule situation où
    // il est honnête : quand il n'existe AUCUNE autre grille vers laquelle déplacer.
    // Sans ce cas, cette branche ne serait plus exercée par personne et pourrait
    // pourrir sans que rien ne rougisse.
    const dialogues = [];
    page.on('dialog', (d) => { dialogues.push(d.message()); d.accept().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(async () => {
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        // security-ok: fixture littérale écrite par le spec, aucune source externe.
        await db.set('a2026_grillesTemplates', [
            { id: 'GR_SEULE', nom: 'La seule grille', criteres: [], dansBibliotheque: true }
        ]);
        // security-ok: fixture littérale écrite par le spec, aucune source externe.
        await db.set(cle('cartouches_GR_SEULE'), [{ id: 'C9', nom: 'Grille orpheline A26', grilleId: 'GR_SEULE' }]);
        await supprimerGrilleDepuisSidebar('GR_SEULE');
        await new Promise(res => setTimeout(res, 400));
        return {
            grilles: (await db.get('a2026_grillesTemplates') || []).map(g => g.id),
            cartouches: (await db.get(cle('cartouches_GR_SEULE')) || []).map(c => c.nom)
        };
    });

    console.log('REFUS SEC →', JSON.stringify(r));
    console.log('DIALOGUES →', JSON.stringify(dialogues, null, 1));
    expect(r.grilles, 'la grille est toujours là').toContain('GR_SEULE');
    expect(r.cartouches, 'et sa cartouche aussi').toHaveLength(1);
    expect(dialogues.join(' ')).toContain('Impossible de la supprimer');
    // ⮕ Un refus qui ne dit pas quoi faire est un cul-de-sac : il doit nommer la
    // sortie même quand il n'a pas d'issue automatique à offrir.
    expect(dialogues.join(' '), 'le refus dit quoi faire').toMatch(/Crée d'abord|supprime ces cartouches/i);
});

test('PREUVE · une grille SANS cartouche se supprime toujours normalement', async ({ page }) => {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        await supprimerGrilleDepuisSidebar('GR_SANS');
        await new Promise(res => setTimeout(res, 400));
        return { grilles: (await db.get('a2026_grillesTemplates') || []).map(g => g.id) };
    }, SEMER);

    console.log('SUPPRESSION NORMALE →', JSON.stringify(r));
    expect(r.grilles, 'la garde ne bloque pas ce qui ne risque rien').not.toContain('GR_SANS');
    expect(r.grilles).toContain('GR_AVEC');
});
