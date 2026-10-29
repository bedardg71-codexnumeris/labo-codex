import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #542 lot 3, pas 3c-3 — LA CARTE « OBSERVATION DE LA STRUCTURE » REND UN
// BLOC PAR NIVEAU DE L'ÉCHELLE, PLUS QUATRE BLOCS FIGÉS.
//
// CE QUI VIVAIT DANS CETTE CARTE. Quatre blocs écrits dans le code — « Forces
// exceptionnelles », « Forces identifiées », « Défis en développement »,
// « Défis critiques » — dont l'EXISTENCE était décidée par quatre comparaisons
// en dur : `>= 0.85`, `>= seuilMaitrise && < 0.85`, `>= idme.insuffisant &&
// < seuilDeveloppement`, `< idme.insuffisant`. Chacun portait en clair un code
// IDME (« Maîtrisé et étendu (E) ») et sa description SOLO. C'était le plus gros
// des six sites du lot 3, et le seul qui ne se réduisait pas à un remplacement
// de texte : les seuils ne choisissaient pas un libellé, ils choisissaient
// QUELS BLOCS EXISTENT.
//
// ⮕ DÉCISION DE GRÉGOIRE (27 août 2026) : « un bloc par niveau ». Les en-têtes
// Forces/Défis disparaissent ; chaque bloc porte le nom que l'utilisateur a
// donné à SON niveau.
//
// ⚠ POURQUOI CE TEST EST AU NAVIGATEUR. Le regroupement vit dans un template
// de la fonction d'affichage : il n'est pas appelable isolément. Les fonctions
// pures qu'il emploie (`situerPourcentageDansEchelle`, `interpreterNiveauAtteint`)
// sont déjà couvertes en Vitest ; ce qui ne l'est pas, c'est ce que la carte
// MONTRE. Une sentinelle de source dirait que les seuils ont disparu ; elle ne
// dirait pas quels blocs l'élève voit.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    return erreurs;
}

// ⚠ UNE ÉCHELLE DONT AUCUN CODE NE COÏNCIDE AVEC IDME — W/X/Y/Z, comme dans la
// spec du pas 3c-1, et pour la même raison : le « D » d'A/B/C/D est aussi celui
// d'IDME, et un test qui l'emploie rougit sur son propre fixture. Ici tout « I »,
// « D », « M » ou « E » rendu comme niveau ne PEUT PAS venir des données.
//
// ⮕ TROIS NIVEAUX DIFFÉRENTS SONT ATTEINTS, et c'est le cœur du montage : avec
// un seul critère, un rendu à bloc unique passerait pour un rendu « par niveau »
// sans rien prouver.
const NIVEAUX_WXYZ = [
    { code: 'W', nom: 'Amorce',      min: 0,  max: 49,  valeurCalcul: 25, couleur: '#e74c3c' },
    { code: 'X', nom: 'Progression', min: 50, max: 69,  valeurCalcul: 60, couleur: '#f39c12' },
    { code: 'Y', nom: 'Consolidé',   min: 70, max: 84,  valeurCalcul: 78, couleur: '#3498db' },
    { code: 'Z', nom: 'Rayonnant',   min: 85, max: 100, valeurCalcul: 92, couleur: '#27ae60' }
];

const ETIQUETTES_SOLO = {
    W: 'unistructurel',
    X: 'multistructurel',
    Y: 'relationnel',
    Z: 'abstrait_etendu'
};

function echelleWXYZ(avecEtiquettes) {
    return {
        id: 'ECH_WXYZ_3C3',
        nom: 'Échelle W/X/Y/Z',
        niveaux: NIVEAUX_WXYZ.map((n) => (
            avecEtiquettes ? { ...n, niveauSOLO: ETIQUETTES_SOLO[n.code] } : { ...n }
        ))
    };
}

async function monterProfil(page, echelle, options) {
    return page.evaluate(({ echelle, options }) => {
        const opts = options || {};
        for (const dep of ['afficherProfilComplet', 'changerSectionProfil', 'db', 'cle']) {
            if (typeof window[dep] === 'undefined') return { erreur: `window.${dep} absent` };
        }

        // ⚠ LE TRIMESTRE D'ABORD — `window.cle()` préfixe par le trimestre actif ;
        // à froid il n'y en a aucun, et les fixtures s'écriraient sous des clés
        // que l'application ne relit pas. Même piège qu'au pas 3c-1.
        const trimestreId = 'test5423c3';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', trimestreId);

        const coursId = 'cours-542-3c3';
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _modeCours: true }); // security-ok: fixture de test, litteral du fichier, aucune source externe
        window.db.setSync(window.cle('groupeEtudiants'), [ // security-ok: fixture de test, litteral du fichier
            { da: 'TEST3C3', nom: 'Roy', prenom: 'Camille', groupe: '01', coursId }
        ]);
        window.db.setSync(window.cle('productions'), [ // security-ok: fixture de test, litteral du fichier
            { id: 'prod-3c3-1', type: 'production', activiteApprentissage: 'Analyse littéraire',
              dateEcheance: '2026-04-01', groupes: ['01'], ponderation: 100 }
        ]);
        window.db.setSync(window.cle('echellesTemplates'), [echelle]); // security-ok: fixture de test, echelle definie en tete de ce fichier

        // TROIS critères, à TROIS niveaux distincts de l'échelle. Aucun ne
        // s'appelle « Français » : ce nom est écarté de la carte (jugement
        // pédagogique préservé du code d'origine), et l'employer ici ferait
        // disparaître un bloc sans rapport avec ce qu'on mesure.
        window.db.setSync(window.cle('grillesTemplates'), [ // security-ok: fixture de test, litteral du fichier
            { id: 'GR_3C3', nom: 'Grille test', criteres: [
                { id: 'cr1', nom: 'Structure',  ponderation: 34 },
                { id: 'cr2', nom: 'Rigueur',    ponderation: 33 },
                { id: 'cr3', nom: 'Nuance',     ponderation: 33 }
            ] }
        ]);
        // #550 — `sansGrilleReference` laisse la préférence VIDE, ce qui est
        // l'état réel de Grégoire le 27 août au matin : la carte et la liste
        // étaient muettes, faute de quoi que ce soit à comparer.
        if (typeof window.definirPreference === 'function') {
            window.definirPreference('grilleReferenceDepistage', opts.sansGrilleReference ? '' : 'GR_3C3');
        }
        window.db.setSync(window.cle('evaluationsSauvegardees'), [ // security-ok: fixture de test, litteral du fichier
            {
                id: 'eval-3c3-1', etudiantDA: 'TEST3C3', productionId: 'prod-3c3-1',
                echelleId: echelle.id, noteFinale: 65, retroactionFinale: 'Bon travail.',
                criteres: [
                    { critereNom: 'Structure', niveauSelectionne: 'Z' },
                    { critereNom: 'Rigueur',   niveauSelectionne: 'Y' },
                    { critereNom: 'Nuance',    niveauSelectionne: 'W' }
                ]
            }
        ]);

        // La pratique active se lit dans la SSOT `groupesCours[].pratiqueId`.
        // ↻ Lots N1a / N1b (21 sept. 2026) : un pointeur `standards` NU ne mène plus à aucune pratique. Le montage pose
        // donc une VRAIE entrée de bibliothèque, désignée par son id — sinon il exercerait « sans pratique » sans le dire.
        window.db.setSync(window.cle('pratiquesConfigurables'), [ // security-ok: fixture de test, litteral du fichier
            { id: 'std-3c3', nom: 'Standards de banc', type: 'standards', dansBibliotheque: true, calcul_note: { methode: 'conversion_niveaux' },
                configuration: { type: 'standards', approcheEvaluation: 'par-artefacts', echelleId: echelle.id, grilleId: 'GR_3C3',
                    portfolio: { utiliser: true, nombreARetenir: 3, minimumCompletion: 1, methodeSelection: 'meilleurs', reglesConformite: { actif: false } }, notesFinales: false } }
        ]);
        window.db.setSync('groupeCoursActif', { id: 'GC_3C3', trimestreId });
        window.db.setSync(trimestreId + '_groupesCours', [
            { id: 'GC_3C3', trimestreId, coursId, pratiqueId: 'std-3c3', actif: true }
        ]);

        try {
            window.afficherProfilComplet('TEST3C3');
            window.changerSectionProfil('accompagnement');
        } catch (e) {
            return { erreur: 'rendu planté : ' + e.message };
        }

        const container = document.getElementById('contenuProfilEtudiant');
        if (!container) return { erreur: '#contenuProfilEtudiant absent' };
        // Sans le bloc masqué « À propos de cette section » (`.carte-info-toggle`) : depuis les textes du lot 5 de l'Aide
        // (#1152), il nomme la carte « Observation de la structure » avant elle.
        const copie = container.cloneNode(true);
        copie.querySelectorAll('.carte-info-toggle').forEach((n) => n.remove());
        const html = copie.innerHTML;

        // Isoler la carte « Observation de la structure » — c'est elle, et elle
        // seule, que ce pas modifie. Le reste de l'écran a ses propres specs.
        const i = html.indexOf('Observation de la structure');
        const carte = i === -1 ? '' : html.slice(i, i + 4000);

        // GARDE ANTI-SILENCE : sans elle, un montage qui rate sa cible rend un
        // test vert qui n'a rien exercé. Le piège est documenté au pas 3c-1.
        const criteresVus = (typeof window.obtenirCriteresAvecValeurs === 'function')
            ? window.obtenirCriteresAvecValeurs('TEST3C3').map((c) => c.nom + '=' + c.valeur)
            : null;

        // #550 — la liste « Progression par critère », qui était vide en silence.
        const j = html.indexOf('Progression par critère');
        const listeCriteres = j === -1 ? '' : html.slice(j, j + 1200);

        return { aCarte: i !== -1, carte, criteresVus, listeCriteres };
    }, { echelle, options });
}

test('#542 pas 3c-3 · la carte rend un bloc par NIVEAU DE L\'ÉCHELLE, pas quatre blocs figés', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });

    const r = await monterProfil(page, echelleWXYZ(true));
    expect(r.erreur, `Erreur : ${r.erreur}`).toBeUndefined();
    expect(r.aCarte, 'la carte « Observation de la structure » doit être rendue').toBe(true);
    expect(r.criteresVus, 'le montage doit avoir produit trois critères évalués').toHaveLength(3);

    // ⮕ L'ASSERTION QUI PORTE LE SENS. Les quatre en-têtes figés ne peuvent pas
    // venir des données : ils étaient écrits dans le code. S'ils réapparaissent,
    // les seuils sont revenus avec eux.
    for (const enteteFige of ['Forces exceptionnelles', 'Forces identifiées', 'Défis en développement', 'Défis critiques']) {
        expect(r.carte, `en-tête figé revenu dans la carte : « ${enteteFige} »`).not.toContain(enteteFige);
    }
    // Et les libellés IDME qui les accompagnaient, écrits en clair.
    for (const libelleIDME of ['Maîtrisé et étendu (E)', 'Maîtrisé (M)', 'En développement (D)', 'Incomplet (I)']) {
        expect(r.carte, `libellé IDME écrit dans le code : « ${libelleIDME} »`).not.toContain(libelleIDME);
    }

    // ⮕ ET LES ASSERTIONS POSITIVES, sans lesquelles les précédentes seraient
    // vraies pour rien : une carte vide passerait « aucun en-tête figé ».
    // Trois niveaux distincts sont atteints, donc trois blocs, chacun nommé
    // comme l'utilisateur a nommé SON niveau.
    expect(r.carte, 'le bloc du niveau Z doit porter le nom de l\'utilisateur').toContain('Rayonnant (Z)');
    expect(r.carte, 'le bloc du niveau Y doit porter le nom de l\'utilisateur').toContain('Consolidé (Y)');
    expect(r.carte, 'le bloc du niveau W doit porter le nom de l\'utilisateur').toContain('Amorce (W)');
    // Le niveau X n'est atteint par aucun critère : la carte montre la structure
    // OBSERVÉE, pas l'échelle en entier.
    expect(r.carte, 'un niveau qu\'aucun critère n\'atteint ne doit pas produire de bloc').not.toContain('Progression (X)');

    // Chaque bloc liste ses critères, et l'interprétation vient de l'ÉTIQUETTE
    // SOLO du niveau — pas d'un seuil.
    expect(r.carte, 'les critères doivent être listés sous leur niveau').toContain('Structure');
    expect(r.carte, 'la description SOLO du niveau étiqueté doit être rendue').toContain('abstrait étendu');
    expect(r.carte, 'la description SOLO du niveau étiqueté doit être rendue').toContain('unistructurel');

    // Une échelle entièrement étiquetée n'a rien à signaler.
    expect(r.carte, 'aucun avis d\'étiquette manquante quand toutes sont posées').not.toContain('associe une étiquette SOLO');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#542 pas 3c-3 · sans étiquette SOLO, le niveau s\'affiche quand même et l\'absence est DITE', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });

    // ⚠ C'EST LE CAS DE GRÉGOIRE AUJOURD'HUI. Le lot 2 a livré le champ
    // `niveauSOLO`, et il naît vide : aucune échelle réelle n'en porte. Ce
    // chemin-là n'est donc pas un cas de bord, c'est le cas courant — et il est
    // le SEUL comportement du pas 3c-3 observable sur ses données, puisque ses
    // bornes coïncident au chiffre près avec les seuils qu'on vient de retirer.
    const r = await monterProfil(page, echelleWXYZ(false));
    expect(r.erreur, `Erreur : ${r.erreur}`).toBeUndefined();
    expect(r.aCarte, 'la carte doit être rendue même sans étiquette SOLO').toBe(true);

    // Option B, tranchée par Grégoire le 27 août : le dépistage ne se tait pas,
    // n'invente pas, et nomme ce qui manque.
    expect(r.carte, 'le nom du niveau reste affiché sans étiquette').toContain('Rayonnant (Z)');
    expect(r.carte, 'l\'absence d\'étiquette SOLO doit être dite').toContain('associe une étiquette SOLO');

    // ⮕ ET ELLE EST DITE UNE FOIS, PAS UNE FOIS PAR BLOC. Trois blocs sans
    // étiquette produiraient trois fois le même avis si le message vivait dans
    // la boucle — c'est le patron « un seul message plutôt qu'un par ligne »
    // retenu au pas 3c-2.
    const occurrences = (r.carte.match(/associe une étiquette SOLO/g) || []).length;
    expect(occurrences, `l'avis d'absence est répété ${occurrences} fois`).toBe(1);

    // Aucune description SOLO ne doit être inventée pour un niveau non étiqueté.
    expect(r.carte, 'aucune description SOLO sans étiquette').not.toContain('À ce niveau');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

// ---------------------------------------------------------------------------
// PORTE #550 — SANS GRILLE DE RÉFÉRENCE, L'ÉCRAN NOMME LA CAUSE.
//
// Symptôme vécu par Grégoire le 27 août 2026 au matin, sur ses données réelles :
// la carte affichait « Aucune force ni défi identifié selon la taxonomie SOLO »
// — un verdict rassurant SUR L'ÉLÈVE — et « Progression par critère » était
// vide, ce qui se lit comme « rien à signaler ». Dans les deux cas la vérité
// était « je n'ai aucun critère à quoi comparer ».
//
// ⚠ POURQUOI CE TEST EST AU NAVIGATEUR ALORS QUE LA SENTINELLE VITEST EXISTE.
// Celle-ci vérifie que le diagnostic REND le bon message et que les blocs le
// lisent. Elle ne dit pas qu'il ARRIVE À L'ÉCRAN — or c'est exactement ce qui
// manquait à #550 : le message existait dans aucun des deux blocs.
// ---------------------------------------------------------------------------

test('#550 · sans grille de référence, la carte ET la liste disent la cause', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });

    const r = await monterProfil(page, echelleWXYZ(true), { sansGrilleReference: true });
    expect(r.erreur, `Erreur : ${r.erreur}`).toBeUndefined();
    expect(r.aCarte, 'la carte doit être rendue même sans grille de référence').toBe(true);

    // GARDE ANTI-SILENCE : le montage doit avoir réellement produit l'état qu'il
    // croit exercer — sans critère, pas de #550 à observer.
    expect(r.criteresVus, 'le montage doit avoir laissé la liste des critères vide').toHaveLength(0);

    // ⮕ LE VERDICT RASSURANT NE DOIT PLUS APPARAÎTRE.
    expect(r.carte, 'le verdict rassurant est revenu')
        .not.toContain('Aucune force ni défi identifié');

    // ⮕ ET LA CAUSE DOIT ÊTRE NOMMÉE, AVEC LE CHEMIN POUR LA RÉGLER — dans les
    // DEUX blocs, parce que les deux étaient muets et qu'en corriger un seul
    // laisserait l'autre mentir.
    expect(r.carte, 'la carte ne nomme pas la cause').toMatch(/grille/i);
    expect(r.carte, 'la carte ne donne pas le chemin de réglage').toContain('Outils d');

    expect(r.listeCriteres, 'la liste « Progression par critère » doit être rendue').toBeTruthy();
    expect(r.listeCriteres, 'la liste reste muette — c\'est le second symptôme de #550')
        .toMatch(/grille/i);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
