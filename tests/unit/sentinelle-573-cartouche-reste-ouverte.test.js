import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #573 (28 août 2026) — « ENREGISTRER » NE FERME PLUS CE QU'IL VIENT
// D'ENREGISTRER.
//
// LE SYMPTÔME, RAPPORTÉ PAR GRÉGOIRE : « des fois ça enregistre, des fois non ».
// Il a déclenché l'audit du 25 août, puis celui du 27 qui a désigné ce chemin
// comme candidat sérieux — reproduit alors en harnais jetable, jamais verrouillé.
//
// LA MÉCANIQUE, EN TROIS TEMPS ET TOUS SILENCIEUX :
//   1. `sauvegarderCartouche` écrit en base, puis appelle
//      `chargerCartouchesRetroaction()`, qui se termine par
//      `initialiserNouveauCartouche()` : `cartoucheActuel` devient une cartouche
//      NEUVE (`CART_xxx` jamais écrit), nom et contexte vidés, matrice re-rendue.
//   2. La ligne suivante, `selectCartouche.value = cartoucheActuel.id`, lit donc
//      l'id NEUF — absent des options — et le `<select>` retombe sur
//      « -- Nouvelle cartouche -- ».
//   3. La cellule tapée ensuite passe par `persisterCartouchePartielle` (#517),
//      qui cherche la cartouche EN BASE par cet id absent et rend `false`.
//      **Les deux appelants ignoraient ce verdict.** La frappe était perdue.
//
// ⮕ CE BANC EXÉCUTE LA SÉQUENCE COMPLÈTE — enregistrer, puis taper — plutôt que
// de constater l'état intermédiaire. C'est la seule forme qui prouve le symptôme
// tel que Grégoire l'a vécu.

/* ------------------------------------------------------------------ harnais */

function elementFictif(valeur = '') {
    return {
        value: valeur, innerHTML: '', textContent: '', checked: false,
        style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false },
        querySelectorAll: () => [], querySelector: () => null,
        appendChild() {}, addEventListener() {}, focus() {}, closest: () => null
    };
}

function monter({ cartouches = [], echelles = [], grilles = null, cartoucheOuverte = null } = {}) {
    const store = {
        'cartouches_G1': cartouches,
        'a2026_echellesTemplates': echelles,
        'a2026_grillesTemplates': grilles || [{
            id: 'G1', nom: 'Grille du test', echelleId: 'ECH_1',
            criteres: [{ id: 'CR_1', nom: 'Analyse' }]
        }]
    };
    const avertissements = [];
    const els = {};
    // ⚠ TOUT id rend un élément, jamais `null` : le chemin traversé ici touche
    // une trentaine de champs, et un `null` ferait échouer le test sur une
    // raison qui n'est pas la sienne.
    const doc = {
        getElementById: (id) => (els[id] || (els[id] = elementFictif())),
        querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
        createElement: () => elementFictif()
    };
    els['selectGrilleRetroaction'] = elementFictif('G1');
    els['selectCartouche'] = elementFictif('');

    const globaux = {
        db: {
            get: async (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
            getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
            set: async (k, v) => { store[k] = v; },
            setSync: (k, v) => { store[k] = v; },
            modifier: async (k, mutateur, defaut) => {
                const valeur = (k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
                const resultat = await mutateur(valeur);
                if (resultat === undefined) return undefined;
                store[k] = resultat;
                return resultat;
            }
        },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        alert: () => {}, confirm: () => true,
        verifierEtGererDoublon: async () => null,
        notifications: {
            succes: () => {}, erreur: () => {}, info: () => {},
            warning: (m, d) => avertissements.push(String(m) + ' | ' + String(d || ''))
        },
        genererIdUnique: (p) => p + Math.random().toString(36).slice(2, 9),
        obtenirIdentiteCCUtilisateur: () => 'Testeur',
        ajouterContributeurSiNecessaire: (c) => c,
        afficherBanqueCartouches: async () => {},
        definirCartoucheActive: () => {},
        calculerPourcentageComplete: async () => {},
        mettreAJourMetriques: () => {},
        // Même raison que `BibliothequeUI` ci-dessous : seul
        // `lirePratiquesSelectionnees` a un contrat qui compte ici (un tableau).
        GabaritsUtils: new Proxy({}, {
            get: (cible, nom) => (nom === 'lirePratiquesSelectionnees' ? (() => []) : (() => ''))
        }),
        // Dépendances de RENDU traversées par `sauvegarderCartouche`, hors sujet de
        // ce banc. Le Proxy rend une fonction inoffensive pour toute méthode
        // demandée : sans lui, chaque helper d'affichage ajouté en amont ferait
        // rougir ce fichier pour une raison qui n'est pas la sienne.
        BibliothequeUI: new Proxy({}, {
            get: (cible, nom) => (nom === 'filtrerParModeDemo' ? ((x) => x || []) : (() => ''))
        }),
        // ⚠ `cartoucheActuel` est une variable de MODULE, reçue en PARAMÈTRE du
        // sandbox : l'assigner sur `win` après le chargement ne l'atteint pas, et
        // chaque fonction testée commence par `if (!cartoucheActuel) return`. Le
        // test passait alors au vert sans jamais entrer dans le code.
        cartoucheActuel: cartoucheOuverte,
        document: doc
    };
    const win = chargerScript('js/cartouches.js', globaux);
    return { win, store, avertissements, els };
}

const ECHELLE = [{
    id: 'ECH_1', nom: 'Cotation W-X-Y-Z',
    niveaux: [
        { code: 'W', nom: 'Amorce', min: 0, max: 49 },
        { code: 'Y', nom: 'Consolidé', min: 50, max: 100 }
    ]
}];

const CARTOUCHE = () => ({
    id: 'CART_EXISTANTE', nom: 'Ma cartouche', grilleId: 'G1',
    contexte: 'Contexte initial', description: '',
    criteres: [{ id: 'CR_1', nom: 'Analyse' }],
    niveaux: [{ code: 'W', nom: 'Amorce' }, { code: 'Y', nom: 'Consolidé' }],
    commentaires: {}, verrouille: false, dansBibliotheque: true
});

describe('#573 · « Enregistrer » ne ferme plus la cartouche qu\'il enregistre', () => {

    it('LE SYMPTÔME : après « Enregistrer », la cellule tapée ATTEINT la base', async () => {
        // Le test qui compte. Avant : `cartoucheActuel` devenait une cartouche
        // neuve absente de la base, `persisterCartouchePartielle` rendait `false`,
        // et la frappe disparaissait sans un mot.
        const { win, store, els } = monter({ cartouches: [CARTOUCHE()], echelles: ECHELLE, cartoucheOuverte: CARTOUCHE() });
        els['nomCartouche'] = elementFictif('Ma cartouche');
        els['contexteCartouche'] = elementFictif('Contexte initial');

        await win.sauvegarderCartouche();

        els['comm_CR_1_W'] = elementFictif('Commentaire tapé APRÈS avoir enregistré');
        await win.sauvegarderCommentaire('CR_1_W');

        const enBase = store['cartouches_G1'].find(c => c.id === 'CART_EXISTANTE');
        expect(enBase.commentaires['CR_1_W']).toBe('Commentaire tapé APRÈS avoir enregistré');
    });

    it('la cartouche ENREGISTRÉE reste ouverte, pas une neuve', async () => {
        const { win, els } = monter({ cartouches: [CARTOUCHE()], echelles: ECHELLE, cartoucheOuverte: CARTOUCHE() });
        els['nomCartouche'] = elementFictif('Ma cartouche');
        els['contexteCartouche'] = elementFictif('Contexte initial');

        await win.sauvegarderCartouche();

        expect(win.cartoucheActuel.id).toBe('CART_EXISTANTE');
        expect(win.cartoucheActuel.nom).toBe('Ma cartouche');
    });

    it('le sélecteur porte l\'id enregistré, pas « -- Nouvelle cartouche -- »', async () => {
        const { win, els } = monter({ cartouches: [CARTOUCHE()], echelles: ECHELLE, cartoucheOuverte: CARTOUCHE() });
        els['nomCartouche'] = elementFictif('Ma cartouche');
        els['contexteCartouche'] = elementFictif('Contexte initial');

        await win.sauvegarderCartouche();

        expect(els['selectCartouche'].value).toBe('CART_EXISTANTE');
    });

    it('APRÈS SUPPRESSION, une cartouche neuve EST bien initialisée', async () => {
        // Le correctif ne doit pas déborder : là, l'objet ouvert n'existe plus,
        // et en rouvrir un neuf est le geste juste. L'appel reste sans argument.
        const { win } = monter({ cartouches: [], echelles: ECHELLE });
        await win.chargerCartouchesRetroaction();
        expect(win.cartoucheActuel).toBeTruthy();
        expect(win.cartoucheActuel.id.startsWith('CART_')).toBe(true);
        expect(win.cartoucheActuel.nom).toBe('');
    });

    // ── LE FILET ─────────────────────────────────────────────────────────────

    it('une cartouche JAMAIS enregistrée le DIT au lieu de perdre la frappe', async () => {
        const { win, avertissements, els } = monter({ cartouches: [], echelles: ECHELLE, cartoucheOuverte: { ...CARTOUCHE(), id: 'CART_JAMAIS_ECRITE' } });
        els['comm_CR_1_W'] = elementFictif('Texte qui part dans le vide');

        await win.sauvegarderCommentaire('CR_1_W');

        expect(avertissements).toHaveLength(1);
        expect(avertissements[0]).toMatch(/pas encore enregistrée/);
    });

    it('il le dit UNE fois, pas à chaque frappe', async () => {
        // Ces fonctions se déclenchent à chaque touche : avertir à chacune serait
        // le harcèlement que #517 a justement refusé pour le nom.
        const { win, avertissements, els } = monter({ cartouches: [], echelles: ECHELLE, cartoucheOuverte: { ...CARTOUCHE(), id: 'CART_JAMAIS_ECRITE' } });
        els['comm_CR_1_W'] = elementFictif('a');

        await win.sauvegarderCommentaire('CR_1_W');
        await win.sauvegarderCommentaire('CR_1_W');
        await win.sauvegarderCommentaire('CR_1_W');

        expect(avertissements).toHaveLength(1);
    });

    it('le CONTEXTE aussi le dit — il y a DEUX sites d\'enregistrement au fil', async () => {
        // ⚠ Trou trouvé par le break-test : le premier jeu de cas ne couvrait que
        // `sauvegarderCommentaire`. Neutraliser le verdict dans
        // `sauvegarderContexteCartouche` laissait la sentinelle verte, alors que
        // c'est le même silence sur le même écran.
        const { win, avertissements, els } = monter({
            cartouches: [], echelles: ECHELLE,
            cartoucheOuverte: { ...CARTOUCHE(), id: 'CART_JAMAIS_ECRITE' }
        });
        els['contexteCartouche'] = elementFictif('Un contexte qui part dans le vide');

        await win.sauvegarderContexteCartouche();

        expect(avertissements).toHaveLength(1);
        expect(avertissements[0]).toMatch(/pas encore enregistrée/);
    });

    it('mais il REVIENT sur une autre cartouche — le drapeau retombe', async () => {
        // ⚠ Cas trouvé par le BREAK-TEST, pas par la lecture : neutraliser la
        // remise à zéro du drapeau laissait la sentinelle verte. Sans ce cas,
        // « une seule fois » aurait pu vouloir dire « une seule fois pour
        // toujours », et le deuxième document aurait perdu sa saisie en silence.
        const { win, avertissements, els } = monter({
            cartouches: [], echelles: ECHELLE,
            cartoucheOuverte: { ...CARTOUCHE(), id: 'CART_PREMIERE' }
        });
        els['comm_CR_1_W'] = elementFictif('a');
        await win.sauvegarderCommentaire('CR_1_W');
        expect(avertissements).toHaveLength(1);

        // Une cartouche neuve s'initialise : le drapeau doit repartir de zéro.
        await win.chargerCartouchesRetroaction();
        await win.sauvegarderCommentaire('CR_1_W');
        expect(avertissements).toHaveLength(2);
    });

    it('aucun avertissement quand l\'écriture a bien eu lieu', async () => {
        const { win, avertissements, els } = monter({ cartouches: [CARTOUCHE()], echelles: ECHELLE, cartoucheOuverte: CARTOUCHE() });
        els['comm_CR_1_W'] = elementFictif('Texte gardé');

        await win.sauvegarderCommentaire('CR_1_W');

        expect(avertissements).toEqual([]);
    });

    // ── LE REPLI IDME (rapport §3 n° 18) ─────────────────────────────────────

    it('sans échelle, une cartouche neuve n\'invente AUCUNE colonne', async () => {
        // Avant : les plages IDME de Grégoire — I/D/M/E, 0-64 / 65-74 / 75-84 /
        // 85-100 — devenaient les colonnes de la cartouche de n'importe qui. Une
        // matrice est indexée par `niveau.code` : ces colonnes sont la structure
        // du document remis à l'élève.
        // ⚠ `initialiserNouveauCartouche` n'est pas exportée sur `window` : on
        // l'atteint par son appelant, ce qui rejoue au passage le chemin réel.
        const { win } = monter({ cartouches: [], echelles: [] });
        await win.chargerCartouchesRetroaction();

        expect(win.cartoucheActuel.niveaux).toEqual([]);
        expect(JSON.stringify(win.cartoucheActuel.niveaux)).not.toMatch(/Incomplet|Développement|Maîtrisé|Étendu/);
    });

    it('avec une échelle, la cartouche neuve prend SES codes', async () => {
        const { win } = monter({ cartouches: [], echelles: ECHELLE });
        await win.chargerCartouchesRetroaction();
        expect(win.cartoucheActuel.niveaux.map(n => n.code)).toEqual(['W', 'Y']);
    });
});
