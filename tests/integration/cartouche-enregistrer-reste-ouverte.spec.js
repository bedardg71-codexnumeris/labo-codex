import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #573 · « ENREGISTRER » NE FERME PLUS LA CARTOUCHE — VÉRIFIÉ EN NAVIGATEUR.
//
// ⮕ L'AUDIT DU 27 AOÛT AVAIT REPRODUIT CE DÉFAUT EN HARNAIS NODE ET NOTAIT
// « non vérifié en navigateur ». C'est précisément l'écart que la nuit du 27-28
// a rendu coûteux : Vitest tourne dans `node`, sans DOM réel ; ce chemin traverse
// une trentaine de champs, deux rafraîchissements de banque et un re-rendu de
// matrice. Le banc unitaire prouve la mécanique ; celui-ci prouve qu'elle tient
// dans WebKit, contre le vrai `index.html`.
//
// LE SCÉNARIO EST CELUI DE GRÉGOIRE : ouvrir une cartouche, cliquer
// « Enregistrer », puis taper dans une cellule. Avant le correctif, cette
// dernière frappe n'atteignait pas la base — sans un mot.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

test('#573 · enregistrer, puis taper : la frappe atteint la base', async ({ page }) => {
    const erreurs = [];
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

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    const resultat = await page.evaluate(async () => {
        // ⚠ `chargerMatriceRetroaction` n'est PAS exportée sur `window` : la
        // cartouche s'ouvre ici par `chargerCartouchesRetroaction(id)`, qui l'est
        // — et qui est justement le chemin corrigé par #573.
        if (typeof window.sauvegarderCartouche !== 'function'
            || typeof window.chargerCartouchesRetroaction !== 'function'
            || typeof window.sauvegarderCommentaire !== 'function') {
            return { erreur: 'pré-requis absents' };
        }

        // Une échelle et une grille SANS aucune lettre d'IDME : si un repli
        // fabriqué revenait, il se verrait dans les colonnes de la matrice.
        const echelle = {
            id: 'ECH_SPEC_573', nom: 'Cotation W-Y',
            niveaux: [
                { code: 'W', nom: 'Amorce', min: 0, max: 49, valeurCalcul: 30 },
                { code: 'Y', nom: 'Consolidé', min: 50, max: 100, valeurCalcul: 80 }
            ]
        };
        const grille = {
            id: 'G_SPEC_573', nom: 'Grille de la spec', echelleId: 'ECH_SPEC_573',
            criteres: [{ id: 'CR_1', nom: 'Analyse', ponderation: 100 }]
        };
        const cartouche = {
            id: 'CART_SPEC_573', nom: 'Cartouche de la spec', grilleId: 'G_SPEC_573',
            contexte: 'Contexte initial', description: '',
            criteres: [{ id: 'CR_1', nom: 'Analyse' }],
            niveaux: [{ code: 'W', nom: 'Amorce' }, { code: 'Y', nom: 'Consolidé' }],
            commentaires: {}, verrouille: false, dansBibliotheque: true
        };

        await window.db.set(window.cle('echellesTemplates'), [echelle]);   // security-ok: fixture littérale de ce fichier, aucune source externe
        await window.db.set(window.cle('grillesTemplates'), [grille]);     // security-ok: fixture littérale de ce fichier, aucune source externe
        await window.db.set('cartouches_G_SPEC_573', [cartouche]);         // security-ok: fixture littérale de ce fichier, aucune source externe

        const selectGrille = document.getElementById('selectGrilleRetroaction');
        if (selectGrille) {
            selectGrille.innerHTML = '<option value="G_SPEC_573">Grille de la spec</option>';
            selectGrille.value = 'G_SPEC_573';
        }

        // Ouvrir la cartouche par le chemin réel.
        await window.chargerCartouchesRetroaction('CART_SPEC_573');
        const idAvant = window.cartoucheActuel && window.cartoucheActuel.id;

        const champNom = document.getElementById('nomCartouche');
        if (champNom) champNom.value = 'Cartouche de la spec';

        // LE GESTE : cliquer « Enregistrer ».
        await window.sauvegarderCartouche();
        const idApres = window.cartoucheActuel && window.cartoucheActuel.id;
        // ⚠ CAPTURÉ ICI, PAS DANS LE `return`. La suite du scénario rouvre une
        // cartouche NEUVE pour éprouver le repli : tout ce qui est lu à la fin
        // décrit CELLE-LÀ. Une mesure prise au mauvais moment décrit un autre
        // objet et le dit avec aplomb.
        const nomApres = window.cartoucheActuel && window.cartoucheActuel.nom;
        const valeurSelect = (document.getElementById('selectCartouche') || {}).value;

        // LA SUITE : taper dans une cellule, comme après un enregistrement.
        let cellule = document.getElementById('comm_CR_1_W');
        if (!cellule) {
            cellule = document.createElement('textarea');
            cellule.id = 'comm_CR_1_W';
            document.body.appendChild(cellule);
        }
        cellule.value = 'Frappe posée APRÈS avoir enregistré';
        await window.sauvegarderCommentaire('CR_1_W');

        const enBase = (await window.db.get('cartouches_G_SPEC_573') || [])
            .find((c) => c.id === 'CART_SPEC_573');

        // ⚠ ET LE REPLI IDME, SUR SON PROPRE CHEMIN. Lire les colonnes de la
        // cartouche qu'on vient d'ouvrir ne prouvait RIEN : elle porte déjà les
        // siennes, et le repli ne joue qu'à la CRÉATION, sans échelle. Défaut
        // d'assertion trouvé au break-test — la mutation qui remettait les plages
        // de Grégoire laissait cette spec verte.
        await window.db.set(window.cle('echellesTemplates'), []);          // security-ok: tableau vide, aucune donnée écrite
        await window.chargerCartouchesRetroaction();
        const codesCartoucheNeuve =
            ((window.cartoucheActuel && window.cartoucheActuel.niveaux) || []).map((n) => n.code);

        return {
            idAvant, idApres, valeurSelect,
            commentaireEnBase: enBase ? enBase.commentaires['CR_1_W'] : null,
            nomEnMemoire: nomApres,
            codesCartoucheNeuve
        };
    });

    expect(resultat.erreur).toBeUndefined();

    // La cartouche enregistrée reste ouverte — c'est la cause du symptôme.
    expect(resultat.idAvant).toBe('CART_SPEC_573');
    expect(resultat.idApres).toBe('CART_SPEC_573');
    expect(resultat.valeurSelect).toBe('CART_SPEC_573');
    expect(resultat.nomEnMemoire).toBe('Cartouche de la spec');

    // ⮕ LE SYMPTÔME LUI-MÊME : la frappe suivante atteint la base.
    expect(resultat.commentaireEnBase).toBe('Frappe posée APRÈS avoir enregistré');

    // Sans échelle, une cartouche neuve n'invente AUCUNE colonne — les plages
    // I/D/M/E de Grégoire ne deviennent pas la structure du document d'un autre.
    expect(resultat.codesCartoucheNeuve).toEqual([]);

    expect(erreurs).toEqual([]);
});
