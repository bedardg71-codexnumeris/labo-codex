import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// §1 et §2 du PLAN-2026-09-01 — LA PORTE DU NOUVEL ENSEIGNANT.
//
// La question que ce banc pose est la seule qui compte pour la cohorte 1 :
// **avec ce que l'application sème toute seule, et sans rien créer, une première
// évaluation produit-elle une NOTE ?**
//
// Avant le 1er septembre, la réponse était non, de deux façons : aucune échelle
// n'était semée (#574 avait retiré la seule qui l'était), et les huit échelles
// « disciplinaires » de la bibliothèque — le recours naturel — n'avaient pas de
// `valeurCalcul` et rendaient 0,0 % sans un mot.
//
// ⚠ CE BANC EST EN PLAYWRIGHT PARCE QU'IL JUGE UNE CHAÎNE, pas une fonction :
// semis → sélection → rendu des critères → calcul → affichage. Chaque maillon a
// déjà été rompu séparément dans ce dépôt.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

async function poserUnTrimestreEtSemer(page) {
    return page.evaluate(async () => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestreActif', 'a2026');
        // Repartir d'un espace VIDE : c'est la situation du nouvel enseignant.
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('a2026_echellesTemplates', []);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('a2026_grillesTemplates', []);

        if (typeof window.assurerEchelleIdmeDeDepart !== 'function') {
            return { erreur: 'window.assurerEchelleIdmeDeDepart absent — le semis du §2 n\'est pas livré' };
        }
        if (typeof window.assurerGrilleDeDepart !== 'function') {
            return { erreur: 'window.assurerGrilleDeDepart absent' };
        }
        await window.assurerGrilleDeDepart();
        await window.assurerEchelleIdmeDeDepart();
        return {
            echelles: (window.db.getSync('a2026_echellesTemplates', []) || []).map(e => ({
                id: e.id, nom: e.nom,
                niveaux: (e.niveaux || []).length,
                niveauxMuets: (e.niveaux || []).filter(n => n.valeurCalcul == null
                    || String(n.valeurCalcul).trim() === '' || isNaN(Number(n.valeurCalcul))).length
            })),
            grilles: (window.db.getSync('a2026_grillesTemplates', []) || []).map(g => ({ id: g.id, criteres: (g.criteres || []).length }))
        };
    });
}

test('§2 · un espace vide reçoit une échelle SEMÉE, et tous ses niveaux savent calculer', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    const r = await poserUnTrimestreEtSemer(page);

    expect(r.erreur, `Erreur : ${r.erreur}`).toBeUndefined();
    expect(r.echelles.map(e => e.id), 'aucune échelle semée — le trou du §2 est revenu').toEqual(['ECHELLE_IDME_DEPART']);
    expect(r.echelles[0].niveaux).toBe(4);
    // LA condition de #574 : une échelle semée qui ne calcule pas est pire que
    // pas d'échelle du tout, parce qu'elle rend 0,0 % au lieu de « -- ».
    expect(r.echelles[0].niveauxMuets, 'des niveaux semés sans `valeurCalcul`').toBe(0);
    expect(r.grilles.map(g => g.id)).toEqual(['GRILLE_GENERIQUE']);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('§1+§2 · BOUT EN BOUT — sans rien créer, une première évaluation produit une VRAIE note', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    const prep = await poserUnTrimestreEtSemer(page);
    expect(prep.erreur, `Erreur : ${prep.erreur}`).toBeUndefined();

    const r = await page.evaluate(() => {
        const grille = window.db.getSync('a2026_grillesTemplates', [])[0];
        const echelle = window.db.getSync('a2026_echellesTemplates', [])[0];

        // Les lecteurs du calcul lisent la clé du trimestre ACTIF via `cle()`.
        evaluationEnCours = { grilleId: grille.id, echelleId: echelle.id, criteres: {} };
        window.evaluationEnCours = evaluationEnCours;
        const selEch = document.getElementById('selectEchelle1');
        if (selEch) selEch.value = echelle.id;

        window.afficherCriteresDepuisGrille(grille.id, echelle.id);
        // L'enseignant coche « Maîtrisé » partout — le geste le plus banal.
        grille.criteres.forEach(c => { evaluationEnCours.criteres[c.id] = 'M'; });
        window.calculerNote();

        return {
            nbCriteres: grille.criteres.length,
            note: document.getElementById('noteProduction1').textContent,
            niveau: document.getElementById('niveauProduction1').textContent,
            noteCalculee: window.noteCalculeeCourante,
            valeurM: (echelle.niveaux.find(n => n.code === 'M') || {}).valeurCalcul
        };
    });

    expect(r.nbCriteres, 'la grille générique porte quatre critères').toBe(4);
    // ⚠ LE CŒUR DU BANC. « 0.0 % » est ce que rendait une échelle sans
    // `valeurCalcul` : un CHIFFRE qui se lit comme un résultat. On exige donc la
    // valeur exacte du niveau coché, pas seulement « quelque chose de non nul ».
    expect(r.noteCalculee, 'la note ne vaut pas la valeur ponctuelle de « M »').toBe(r.valeurM);
    expect(r.note).toBe(String(Math.round(r.valeurM * 10) / 10).replace('.', ',') + '\u00A0%');   // 21 oct. 2026 : norme française
    expect(r.niveau, 'le niveau global doit être nommé, pas « -- »').toBe('M');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

// #674 (énoncé 5) — LE GESTE QUE GRÉGOIRE FAIT POUR VÉRIFIER : ouvrir une évaluation,
// laisser un critère sans niveau, et voir que l'application LE DIT au lieu de monter
// la note. Avant le 2 septembre 2026, `calculerNote()` renormalisait les pondérations
// restantes à 100 % (grille 50/30/20 : 84,0 % avec les trois critères, 95,0 % quand
// celui à 20 % perd son niveau — onze points et un niveau de plus, sans un mot). Le
// témoin exact 84 → 95 est rejoué sur la fonction réelle par
// `tests/unit/sentinelle-674-la-note-dit-sur-quoi-elle-porte.test.js` ; ce banc-ci
// juge la CHAÎNE dans le vrai DOM : élément `#porteeNote1`, classe `u-hide`, texte.
test('§1+§2 · #674 — un critère laissé sans niveau : l\'écran RETIENT la note et NOMME le critère ; renseigné, la note revient sans un mot de plus', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    const prep = await poserUnTrimestreEtSemer(page);
    expect(prep.erreur, `Erreur : ${prep.erreur}`).toBeUndefined();

    const r = await page.evaluate(() => {
        const grille = window.db.getSync('a2026_grillesTemplates', [])[0];
        const echelle = window.db.getSync('a2026_echellesTemplates', [])[0];

        evaluationEnCours = { grilleId: grille.id, echelleId: echelle.id, criteres: {} };
        window.evaluationEnCours = evaluationEnCours;
        const selEch = document.getElementById('selectEchelle1');
        if (selEch) selEch.value = echelle.id;
        window.afficherCriteresDepuisGrille(grille.id, echelle.id);

        const lire = () => {
            const p = document.getElementById('porteeNote1');
            return {
                note: document.getElementById('noteProduction1').textContent,
                niveau: document.getElementById('niveauProduction1').textContent,
                porteeVisible: !!p && !p.classList.contains('u-hide'),
                porteeTexte: p ? p.textContent : '(élément absent)',
                ponderationCouverte: window.porteeCalculeeCourante ? window.porteeCalculeeCourante.ponderationCouverte : null
            };
        };

        // Tous les critères SAUF le dernier : le geste exact du défaut mesuré.
        const dernier = grille.criteres[grille.criteres.length - 1];
        grille.criteres.forEach(c => { if (c.id !== dernier.id) evaluationEnCours.criteres[c.id] = 'M'; });
        window.calculerNote();
        const incomplet = lire();

        // Puis le critère manquant reçoit son niveau.
        evaluationEnCours.criteres[dernier.id] = 'M';
        window.calculerNote();
        const complet = lire();

        return {
            dernierNom: dernier.nom,
            dernierPond: Number(dernier.ponderation) || 0,
            sommeGrille: grille.criteres.reduce((s, c) => s + (Number(c.ponderation) || 0), 0),
            valeurM: (echelle.niveaux.find(n => n.code === 'M') || {}).valeurCalcul,
            incomplet, complet
        };
    });

    // Incomplet : la note est retenue, le critère est nommé AVEC son poids, la portée est publiée.
    expect(r.incomplet.note, 'plus jamais une note renormalisée en silence').toBe('--');
    expect(r.incomplet.niveau).toBe('--');
    expect(r.incomplet.porteeVisible, 'la portée doit être DITE sous la note').toBe(true);
    expect(r.incomplet.porteeTexte).toContain(r.dernierNom);
    expect(r.incomplet.porteeTexte).toContain(r.dernierPond + '\u00A0%');
    expect(r.incomplet.ponderationCouverte).toBe(r.sommeGrille - r.dernierPond);

    // Complet : la note revient, et PAS UN MOT DE PLUS.
    expect(r.complet.note).toBe(String(Math.round(r.valeurM * 10) / 10).replace('.', ',') + '\u00A0%');
    expect(r.complet.niveau).toBe('M');
    expect(r.complet.porteeVisible, 'une évaluation complète ne reçoit aucun avertissement').toBe(false);
    expect(r.complet.porteeTexte).toBe('');
    expect(r.complet.ponderationCouverte).toBe(r.sommeGrille);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('§1 · TÉMOIN NÉGATIF — la même chaîne sur une échelle SANS `valeurCalcul` retient la note (« -- ») et DIT ce qui manque (#674)', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    await poserUnTrimestreEtSemer(page);

    const r = await page.evaluate(() => {
        const grille = window.db.getSync('a2026_grillesTemplates', [])[0];
        // La forme EXACTE des huit échelles disciplinaires retirées le 1er sept. :
        // `valeur:` et jamais `valeurCalcul:`.
        const echelleCassee = {
            id: 'ECHELLE_TEMOIN_VALEUR',
            nom: 'Témoin — niveaux en `valeur`',
            niveaux: [
                { code: 'I', nom: 'Incomplet', min: 0, max: 54, valeur: 40 },
                { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeur: 82 }
            ]
        };
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync('a2026_echellesTemplates', [echelleCassee]);

        evaluationEnCours = { grilleId: grille.id, echelleId: echelleCassee.id, criteres: {} };
        window.evaluationEnCours = evaluationEnCours;
        const selEch = document.getElementById('selectEchelle1');
        if (selEch) selEch.value = echelleCassee.id;
        grille.criteres.forEach(c => { evaluationEnCours.criteres[c.id] = 'M'; });
        window.calculerNote();

        const portee = document.getElementById('porteeNote1');
        return {
            note: document.getElementById('noteProduction1').textContent,
            niveau: document.getElementById('niveauProduction1').textContent,
            porteeVisible: !!portee && !portee.classList.contains('u-hide'),
            porteeTexte: portee ? portee.textContent : '(élément absent)',
            nomsCriteres: grille.criteres.map(c => c.nom)
        };
    });

    // Ce témoin documentait un défaut : jusqu'au 2 septembre 2026, l'écran rendait
    // ici « 0.0 % · -- » comme un résultat, sans un mot (#674, mécanisme 2). Il a
    // rougi le jour où #674 a été livré — la bonne nouvelle annoncée — et il garde
    // maintenant le comportement corrigé : la note est RETENUE (« -- »), et ce qui
    // manque est NOMMÉ sous elle, critère par critère. Il continue de servir de
    // témoin négatif au test précédent : sans lui, un « 79.5 % » pourrait venir
    // de n'importe où.
    expect(r.note, 'l\'écran ne doit plus rendre 0.0 % comme un résultat (#674)').toBe('--');
    expect(r.niveau).toBe('--');
    expect(r.porteeVisible, 'la portée doit être DITE sous la note').toBe(true);
    for (const nom of r.nomsCriteres) {
        expect(r.porteeTexte, 'chaque critère hors note est nommé').toContain(nom);
    }
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
