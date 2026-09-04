import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LOT 4, VOLET A — LES PALIERS D'UNE GRILLE ANALYTIQUE, dans un vrai WebKit (4 septembre 2026).
//
// Le « fini quand » : Grégoire crée une cartouche, choisit sa grille analytique — le champ dit
// « Paliers (bornes en %) », l'échelle de départ est déjà choisie, la matrice titre ses colonnes
// « 0–64,99 % », « 65–74,99 % »… — sans qu'on lui ait parlé de « niveaux ». Il passe à une
// grille holistique : les mots des niveaux reviennent. Ce que la cartouche enregistre n'a pas
// changé de forme (code, nom ; clé `critereId_niveau`).
//
// ⚠ [EN ATTENTE] Les mots sont PROPOSÉS à Grégoire ; le spec les lit dans `LIBELLES_PALIERS`
// et `libellePalier`, pas en dur — s'ils changent, il suit.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set(cle('grillesTemplates'), [
        { id: 'G_ANA', nom: 'Analyse littéraire', type: 'analytique', dansBibliotheque: true, criteres: [
            { id: 'C1', nom: 'Langue', type: 'analytique', ponderation: 30 },
            { id: 'C2', nom: 'Structure', type: 'analytique', ponderation: 70 } ] },
        { id: 'G_HOLI', nom: 'Holistique', type: 'holistique', dansBibliotheque: true, criteres: [
            { id: 'C1', nom: 'Contenu', type: 'holistique', ponderation: 100 } ] }
    ]);
    // security-ok: fixture littérale du spec — l'échelle de départ telle qu'echelles.js la sème.
    await db.set(cle('echellesTemplates'), [
        { id: 'ECHELLE_IDME_DEPART', nom: 'Échelle de départ (IDME)', dansBibliotheque: true, niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 64.99, valeurCalcul: 55, couleur: '#c62828' },
            { code: 'D', nom: 'En développement', min: 65, max: 74.99, valeurCalcul: 70, couleur: '#e65100' },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 84.99, valeurCalcul: 80, couleur: '#2e7d32' },
            { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 92, couleur: '#1565c0' } ] },
        { id: 'ECH_2', nom: 'Seconde', dansBibliotheque: true, niveaux: [ { code: 'P', nom: 'Piètre', min: 0, max: 59, valeurCalcul: 50 }, { code: 'R', nom: 'Remarqué', min: 60, max: 100, valeurCalcul: 90 } ] }
    ]);
    window.afficherSection('conception');
    window.afficherSousSection('conception-retroactions');
    await window.creerNouvelleCartouche();
    return { mots: window.LIBELLES_PALIERS, paliers: (await db.get(cle('echellesTemplates')))[0].niveaux.map(n => window.libellePalier(n)) };
}`;

const CHOISIR_GRILLE = (id) => `async () => {
    const sel = document.getElementById('selectGrilleCartouche');
    sel.value = '${id}';
    await window.onChangeSelectionCartouche();
    await new Promise(r => setTimeout(r, 200));
}`;

const LIRE = `() => {
    const m = document.getElementById('matriceContainer');
    return {
        mot: document.getElementById('motEchelleCartouche').textContent,
        echelle: document.getElementById('selectEchelleCartouche').value,
        coin: (m.querySelector('thead th') || {}).textContent,
        // Les blancs ordinaires seulement : l'espace insécable avant « % » fait partie du libellé.
        colonnes: [...m.querySelectorAll('thead th')].slice(1).map(th => th.textContent.replace(/[ \\t\\n]+/g, ' ').trim()),
        cles: [...m.querySelectorAll('textarea[id^="comm_"]')].map(t => t.id),
        placeholder: (m.querySelector('textarea[id="comm_C1_I"]') || {}).placeholder,
        cartouche: window.cartoucheActuel && { echelleId: window.cartoucheActuel.echelleId, niveaux: window.cartoucheActuel.niveaux }
    };
}`;

test('lot 4 · A — une grille analytique a ses paliers : le champ, l\'échelle de départ préremplie, les colonnes par les bornes', async ({ page }) => {
    page.on('dialog', (d) => d.accept().catch(() => {}));   // « Changer de grille va reconfigurer la matrice » : oui
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    const semis = await page.evaluate(eval(SEMER));
    console.log('SEMIS →', JSON.stringify(semis));
    expect(semis.mots.champPaliers).toBeTruthy();

    // 1 — formulaire neuf : le mot de départ, aucune échelle choisie.
    let etat = await page.evaluate(eval(LIRE));
    expect(etat.mot).toBe(semis.mots.champNiveaux);
    expect(etat.echelle).toBe('');

    // 2 — la grille analytique : le mot change, l'échelle de départ est préremplie, les colonnes sont les bornes.
    await page.evaluate(eval(CHOISIR_GRILLE('G_ANA')));
    etat = await page.evaluate(eval(LIRE));
    console.log('ANALYTIQUE →', JSON.stringify(etat));
    expect(etat.mot).toBe(semis.mots.champPaliers);
    expect(etat.echelle).toBe('ECHELLE_IDME_DEPART');
    expect(etat.coin).toBe(semis.mots.coinPaliers);
    expect(etat.colonnes).toEqual(semis.paliers);
    expect(etat.colonnes.join(' ')).not.toContain('Insuffisant');
    expect(etat.placeholder).toBe('Commentaire pour Langue - ' + semis.paliers[0]);
    // Ce qui voyage n'a pas changé de forme.
    expect(etat.cles).toEqual(['comm_C1_I', 'comm_C1_D', 'comm_C1_M', 'comm_C1_E', 'comm_C2_I', 'comm_C2_D', 'comm_C2_M', 'comm_C2_E']);
    expect(etat.cartouche).toEqual({ echelleId: 'ECHELLE_IDME_DEPART', niveaux: [
        { code: 'I', nom: 'Insuffisant' }, { code: 'D', nom: 'En développement' }, { code: 'M', nom: 'Maîtrisé' }, { code: 'E', nom: 'Étendu' } ] });

    // 3 — la grille holistique : les mots des niveaux reviennent ; l'échelle choisie reste.
    await page.evaluate(eval(CHOISIR_GRILLE('G_HOLI')));
    etat = await page.evaluate(eval(LIRE));
    console.log('HOLISTIQUE →', JSON.stringify(etat));
    expect(etat.mot).toBe(semis.mots.champNiveaux);
    expect(etat.coin).toBe(semis.mots.coinNiveaux);
    expect(etat.colonnes[0]).toBe('I Insuffisant');
    expect(etat.echelle).toBe('ECHELLE_IDME_DEPART');
});
