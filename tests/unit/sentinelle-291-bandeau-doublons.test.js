import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #291 Lot 3 · LE BANDEAU DÉSIGNE, IL NE DÉCRIT PLUS.
//
// Plainte de Grégoire, 23 août 2026, capture de la bibliothèque de cartouches :
//
//   « J'ai une information m'indiquant que j'ai des doublons, mais ils ne sont
//     pas identifiés explicitement et les rechercher manuellement par leur ID
//     est laborieux : ILS NE SONT PAS AFFICHÉS ! […] Un utilisateur ne peut pas
//     savoir quoi faire pour résoudre les conflits de doublons. LESQUELS SONT
//     LESQUELS ? »
//
// Le bandeau citait des IDs tronqués que les cartes ne portaient pas, et
// servait une consigne fausse des deux côtés (§1.2 du plan). Ce fichier
// verrouille les quatre réponses : la carte porte son ID (3.1), le bandeau
// classe et nomme (3.2), « Voir » existe sur chaque ligne (3.3), et les gestes
// de résolution sont sur place (3.4).
//
// ▣ L'ORACLE D'ÉCHAPPEMENT EST UN VRAI `echapperHtml`, PAS UN STUB IDENTITÉ.
// Plusieurs suites du projet injectent `echapperHtml: (s) => String(s)`, ce qui
// est correct pour tester une mise en page — et tautologique pour tester une
// défense : le test resterait vert sur du code qui n'échappe rien. On
// reproduit donc fidèlement la sémantique de config.js (voie
// textContent → innerHTML : encode `&`, `<`, `>`, laisse les guillemets), et
// `echapperAttribut` est chargé RÉELLEMENT depuis son module.
//
// BREAK-TESTS (faits le 23 août 2026) :
//  (a) retirer `echapperHtml` autour du nom d'exemplaire dans
//      `renderAvertissementDoublons` → « un nom hostile ressort échappé » ROUGIT ;
//  (b) forcer `classerGroupe` à toujours rendre 'homonymes'
//      → « trois catégories, trois libellés distincts » ROUGIT.

/** Fidèle à config.js : textContent → innerHTML n'encode PAS les guillemets. */
const echapperHtmlReel = (t) => t == null ? '' : String(t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let ui, identite;

beforeEach(() => {
    identite = chargerScript('js/identite-item.js');
    const echappement = chargerScript('js/securite-echappement.js');
    ui = chargerScript('js/bibliotheque-ui.js', {
        echapperHtml: echapperHtmlReel,
        echapperAttribut: echappement.echapperAttribut
    }).BibliothequeUI;
});

const NOM_HOSTILE = '<img src=x onerror="alert(1)">';

/* ------------------------------------------------------------------ */
/* 3.1 — la carte porte son identifiant                                */
/* ------------------------------------------------------------------ */

// #1159 (lot 6, 25 oct. 2026) — RÉANCRÉ : les cartes (`renderCarteSelection`, `renderCarteDisponible`)
// sont retirées ; les dix bibliothèques rendent des RANGÉES (`_renderRangee`). Les mêmes promesses se
// jouent sur la fenêtre à une seule liste, rendue dans un `document` qui garde le HTML inséré.
function rendreListe(liste, repli) {
    const echappement = chargerScript('js/securite-echappement.js');
    let html = '';
    const document = {
        getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
        addEventListener() {}, body: { insertAdjacentHTML: (_ou, h) => { html += h; } }
    };
    const B = chargerScript('js/bibliotheque-ui.js', {
        document, echapperHtml: echapperHtmlReel, echapperAttribut: echappement.echapperAttribut
    }).BibliothequeUI;
    B.creerFenetreListe({ modalId: 'modalBanc291', titre: 'Banc', liste: { rangees: liste }, repli: { titre: 'Mis de côté', rangees: repli || [] } });
    return html;
}

describe('#291 §3.1 · « ils ne sont pas affichés ! »', () => {
    it('la rangée affiche l\'ID court et porte l\'ID complet en title', () => {
        const html = rendreListe([{ nom: 'Grille FR', id: 'GRILLE_1755900000_a_b209ef', ligne: '4 critères', afficherId: true }]);
        expect(html).toContain('#b209ef');
        expect(html).toContain('title="Identifiant complet : GRILLE_1755900000_a_b209ef"');
    });

    it('la rangée du groupe replié l\'affiche aussi — « Voir » doit pouvoir l\'atteindre', () => {
        const html = rendreListe([], [{ nom: 'Grille FR', id: 'GRILLE_x_b209ef', ligne: '', afficherId: true }]);
        expect(html).toContain('#b209ef');
    });

    it('les rangées des deux groupes portent l\'ancre qui rend « Voir » possible', () => {
        const html = rendreListe([{ nom: 'G', id: 'ID_42', ligne: '' }], [{ nom: 'H', id: 'ID_43', ligne: '' }]);
        expect(html).toContain('data-biblio-item-id="ID_42"');
        expect(html).toContain('data-biblio-item-id="ID_43"');
    });

    it('la puce reste OPT-IN : les bibliothèques qui ne la demandent pas ne changent pas', () => {
        // Les cours, les trimestres, les groupes-cours n'ont pas demandé d'ID à l'écran.
        const html = rendreListe([{ nom: 'Cours', id: 'COURS_1', ligne: 'Session A25' }]);
        expect(html).not.toContain('biblio-id-court');
    });

    it('un identifiant hostile n\'échappe pas de son attribut', () => {
        const html = rendreListe([{ nom: 'G', id: 'X" onload="alert(1)', ligne: '', afficherId: true }]);
        expect(html).not.toContain('onload="alert(1)"');
        expect(html).toContain('&quot;');
    });
});

/* ------------------------------------------------------------------ */
/* 3.2 — le bandeau classe au lieu de décrire                          */
/* ------------------------------------------------------------------ */

describe('#291 §3.2 · « lesquels sont lesquels ? »', () => {
    const groupesDesTroisCategories = () => [
        identite.analyserDoublons([{ id: 'X', nom: 'Collision' }, { id: 'X', nom: 'Collision' }], 'nom')[0],
        identite.analyserDoublons([{ id: 'A', nom: 'Copie' }, { id: 'B', idOriginal: 'A', nom: 'Copie' }], 'nom')[0],
        identite.analyserDoublons([{ id: 'C', nom: 'Homonyme' }, { id: 'D', nom: 'Homonyme' }], 'nom')[0]
    ];

    it('trois catégories, trois libellés distincts', () => {
        const html = ui.renderAvertissementDoublons(groupesDesTroisCategories(), {});
        expect(html).toContain('Collision d\'identifiant');
        expect(html).toContain('Copies');
        expect(html).toContain('Homonymes');
    });

    it('chaque catégorie a sa classe CSS, donc sa couleur', () => {
        const html = ui.renderAvertissementDoublons(groupesDesTroisCategories(), {});
        expect(html).toContain('biblio-doublon-groupe--collision');
        expect(html).toContain('biblio-doublon-groupe--copie');
        expect(html).toContain('biblio-doublon-groupe--homonymes');
    });

    it('les homonymes sont dits NON DÉFECTUEUX (#450 : les deux « IDME et niv 0 »)', () => {
        const g = identite.analyserDoublons(
            [{ id: 'A', nom: 'IDME et niv 0' }, { id: 'B', nom: 'IDME et niv 0' }], 'nom');
        const html = ui.renderAvertissementDoublons(g, {});
        expect(html).toContain('Ce n\'est pas un défaut');
        expect(html).not.toContain('Copies');
    });

    it('LA CONSIGNE FAUSSE EST SUPPRIMÉE, PAS REFORMULÉE', () => {
        // « IDs identiques = vraies copies, IDs différents = homonymes
        // légitimes » : les deux moitiés étaient fausses (§1.2 du plan).
        const html = ui.renderAvertissementDoublons(groupesDesTroisCategories(), {});
        expect(html).not.toMatch(/IDs identiques/);
        expect(html).not.toMatch(/homonymes légitimes/);
        expect(html).not.toMatch(/Survole un ID/);
        expect(html).not.toMatch(/doublon\(s\) potentiel\(s\)/);
    });

    it('un exemplaire par ligne, avec son ID court VISIBLE', () => {
        const g = identite.analyserDoublons([
            { id: 'GRILLE_a_b209ef', nom: 'G' },
            { id: 'GRILLE_a_6fdd43', nom: 'G' }
        ], 'nom');
        const html = ui.renderAvertissementDoublons(g, {});
        expect(html).toContain('#b209ef');
        expect(html).toContain('#6fdd43');
        expect((html.match(/biblio-doublon-exemplaire"/g) || [])).toHaveLength(2);
    });

    it('la date de modification est affichée, coupée au jour', () => {
        const g = identite.analyserDoublons([
            { id: 'A', nom: 'G', dateModification: '2026-08-12T14:32:11.000Z' },
            { id: 'B', nom: 'G' }
        ], 'nom');
        expect(ui.renderAvertissementDoublons(g, {})).toContain('modifié le 2026-08-12');
    });

    it('un nom hostile ressort échappé (règle #1, non négociable)', () => {
        const g = identite.analyserDoublons(
            [{ id: 'A', nom: NOM_HOSTILE }, { id: 'B', nom: NOM_HOSTILE }], 'nom');
        const html = ui.renderAvertissementDoublons(g, {});
        expect(html).not.toContain('<img src=x');
        expect(html).toContain('&lt;img src=x');
    });

    it('un nom hostile dans le TITRE du groupe ressort échappé lui aussi', () => {
        const g = identite.analyserDoublons(
            [{ id: 'A', nom: NOM_HOSTILE }, { id: 'B', nom: NOM_HOSTILE }], 'nom');
        const html = ui.renderAvertissementDoublons(g, {});
        // Le titre cite le nom entre guillemets français : aucune balise vivante.
        expect(html).not.toMatch(/« <img/);
    });

    it('rien à signaler → chaîne vide, pas de bandeau fantôme', () => {
        expect(ui.renderAvertissementDoublons([], {})).toBe('');
        expect(ui.renderAvertissementDoublons(null, {})).toBe('');
        expect(ui.renderAvertissementDoublons(undefined)).toBe('');
    });

    it('un numéro de lignée n\'apparaît que s\'il y a plusieurs lignées à distinguer', () => {
        const uneSeule = identite.analyserDoublons(
            [{ id: 'A', nom: 'G' }, { id: 'B', idOriginal: 'A', nom: 'G' }], 'nom');
        expect(ui.renderAvertissementDoublons(uneSeule, {})).not.toContain('Lignée');

        const mixte = identite.analyserDoublons([
            { id: 'A', nom: 'G' }, { id: 'B', idOriginal: 'A', nom: 'G' }, { id: 'Q', nom: 'G' }
        ], 'nom');
        const html = ui.renderAvertissementDoublons(mixte, {});
        expect(html).toContain('Lignée 1');
        expect(html).toContain('Lignée 2');
    });
});

/* ------------------------------------------------------------------ */
/* 3.3 — « Voir » pointe l'objet                                       */
/* ------------------------------------------------------------------ */

describe('#291 §3.3 · « les rechercher manuellement par leur ID est laborieux »', () => {
    it('chaque ligne porte un bouton « Voir » câblé sur l\'ID de l\'exemplaire', () => {
        const g = identite.analyserDoublons([{ id: 'A1', nom: 'G' }, { id: 'B2', nom: 'G' }], 'nom');
        const html = ui.renderAvertissementDoublons(g, {});
        expect(html).toContain('data-action="BibliothequeUI.voirItemDoublon" data-param="A1"');
        expect(html).toContain('data-action="BibliothequeUI.voirItemDoublon" data-param="B2"');
    });

    it('la fonction existe et est exposée pour le dispatcher data-action', () => {
        expect(typeof ui.voirItemDoublon).toBe('function');
    });
});

/* ------------------------------------------------------------------ */
/* 3.4 — résoudre sur place                                            */
/* ------------------------------------------------------------------ */

describe('#291 §3.4 · résoudre sans aller chercher un menu ⋮', () => {
    const ACTIONS = {
        retirer: 'retirerGrilleDeBibliotheque',
        supprimer: 'supprimerGrilleDefinitivement',
        supprimerPartagee: 'supprimerGrilleDeBibliothequePartagee'
    };

    it('un item de la barre latérale propose Retirer ET Supprimer', () => {
        const local = { id: 'A', nom: 'G' };
        const g = identite.analyserDoublons([local, { id: 'B', nom: 'G' }], 'nom');
        const html = ui.renderAvertissementDoublons(g, { itemsSelection: [local], actions: ACTIONS });
        expect(html).toContain('data-action="retirerGrilleDeBibliotheque" data-param="A"');
        expect(html).toContain('data-action="supprimerGrilleDefinitivement" data-param="A"');
    });

    it('un item seulement en bibliothèque partagée propose l\'AUTRE suppression', () => {
        const local = { id: 'A', nom: 'G' };
        const partage = { id: 'B', nom: 'G' };
        const g = identite.analyserDoublons([local, partage], 'nom');
        const html = ui.renderAvertissementDoublons(g, { itemsSelection: [local], actions: ACTIONS });
        expect(html).toContain('data-action="supprimerGrilleDeBibliothequePartagee" data-param="B"');
        // …et surtout pas le geste qui viserait un magasin où il n'est pas.
        expect(html).not.toContain('data-action="retirerGrilleDeBibliotheque" data-param="B"');
    });

    it('un item RETIRÉ de la sélection n\'est pas traité comme présent', () => {
        const retire = { id: 'A', nom: 'G', dansBibliotheque: false };
        const g = identite.analyserDoublons([retire, { id: 'B', nom: 'G' }], 'nom');
        const html = ui.renderAvertissementDoublons(g, { itemsSelection: [retire], actions: ACTIONS });
        expect(html).not.toContain('data-action="retirerGrilleDeBibliotheque" data-param="A"');
    });

    it('les cartouches reçoivent leur grilleId en 2e paramètre', () => {
        const c1 = { id: 'C1', nom: 'Cartouche', grilleId: 'G7' };
        const g = identite.analyserDoublons([c1, { id: 'C2', nom: 'Cartouche', grilleId: 'G7' }], 'nom');
        const html = ui.renderAvertissementDoublons(g, {
            itemsSelection: [c1],
            actions: { retirer: 'retirerCartoucheDeBibliotheque', champParam2: 'grilleId' }
        });
        expect(html).toContain('data-param="C1" data-param2="G7"');
    });

    it('ZÉRO HANDLER INLINE dans tout le bandeau', () => {
        const c1 = { id: 'C1', nom: 'G' };
        const g = identite.analyserDoublons([c1, { id: 'C2', nom: 'G' }], 'nom');
        const html = ui.renderAvertissementDoublons(g, { itemsSelection: [c1], actions: ACTIONS });
        expect(html).not.toMatch(/\son[a-z]+\s*=/i);
    });

    it('AUCUNE CASE À COCHER : la catégorie est calculée, jamais basculée', () => {
        // Règle des portes terrain — aucun interrupteur ne porte un verdict.
        const g = identite.analyserDoublons([{ id: 'A', nom: 'G' }, { id: 'B', nom: 'G' }], 'nom');
        const html = ui.renderAvertissementDoublons(g, {});
        expect(html).not.toMatch(/type="checkbox"/);
        expect(html).not.toMatch(/type="radio"/);
    });

    it('les boutons neufs portent la classe des cibles tactiles 44 px', () => {
        const g = identite.analyserDoublons([{ id: 'A', nom: 'G' }, { id: 'B', nom: 'G' }], 'nom');
        const html = ui.renderAvertissementDoublons(g, {});
        // La mesure réelle au navigateur est faite par le test Playwright ;
        // ici on verrouille que la classe qui porte le minimum est bien posée.
        expect(html).toContain('biblio-doublon-action');
    });

    it('sans `actions`, seul « Voir » est proposé — jamais un geste qui échouerait', () => {
        const g = identite.analyserDoublons([{ id: 'A', nom: 'G' }, { id: 'B', nom: 'G' }], 'nom');
        const html = ui.renderAvertissementDoublons(g, {});
        expect(html).toContain('voirItemDoublon');
        expect(html).not.toContain('data-action="retirer');
        expect(html).not.toContain('data-action="supprimer');
    });
});

/* ------------------------------------------------------------------ */
/* CT-29 — les data-param des boutons de carte sont un contexte        */
/* d'attribut (25 août 2026, chantier « supprimer un partagé »)        */
/* ------------------------------------------------------------------ */

// `_btnAttrs` concaténait `data-param2="' + btn.param2 + '"` sans échapper.
// L'`id` d'un item partagé vient d'un `.lcz` reçu d'un tiers : la validation
// d'import refuse le HTML brut (`/<[a-zA-Z!\/]/`) mais laisse passer un
// guillemet seul — de quoi sortir de l'attribut et en greffer d'autres sur le
// bouton. Le menu ⋮ des cartes partagées passe par ce même chemin.
//
// BREAK-TEST (fait le 25 août 2026) : retirer `echapperAttribut` autour de
// `btn.param2` dans `_btnAttrs` → les deux `it` de ce bloc ROUGISSENT.

const ID_HOSTILE = 'PARTAGE_x" data-action="supprimerTout';

describe('CT-29 · les identifiants sortent échappés des attributs de bouton', () => {
    // #1159 : réancré du bouton principal d'une carte au bouton de passage d'une rangée.
    it('bouton de la rangée : un id porteur d\'un guillemet ne peut pas greffer d\'attribut', () => {
        const html = rendreListe([{
            nom: 'Grille partagée', id: 'PARTAGE_1', ligne: '',
            passage: { label: 'Dupliquer', action: 'partageSection.dupliquer', param: 'grille', param2: ID_HOSTILE }
        }]);
        expect(html).toContain('&quot; data-action=&quot;supprimerTout');
        expect(html).not.toContain('" data-action="supprimerTout');
    });

    // ▣ TROU DE COUVERTURE TROUVÉ AU RITUEL DU 25 AOÛT. Les deux `it` ci-dessus
    // ne testaient que `param2` : retirer `echapperAttribut` autour de
    // `btn.action` laissait la suite ENTIÈRE verte (3062/3062), alors que le
    // titre du bloc promet « les identifiants sortent échappés des attributs de
    // bouton ». Les `action` sont des littéraux de code aujourd'hui — le risque
    // est nul, la PROMESSE du test ne l'était pas.
    it('l\'attribut data-action est échappé lui aussi, pas seulement les params', () => {
        const html = ui.renderMenuActions([
            { label: 'Supprimer', action: 'x" data-param="injecte', param: 'grille' }
        ], 'ctx');
        expect(html).toContain('&quot; data-param=&quot;injecte');
        expect(html).not.toContain('x" data-param="injecte');
    });

    it('menu ⋮ : même garde sur les items d\'action', () => {
        const html = ui.renderMenuActions([
            { label: 'Supprimer', action: 'partageSection.supprimer', param: 'grille', param2: ID_HOSTILE }
        ], 'ctx');
        expect(html).toContain('&quot; data-action=&quot;supprimerTout');
        expect(html).not.toContain('" data-action="supprimerTout');
    });
});
