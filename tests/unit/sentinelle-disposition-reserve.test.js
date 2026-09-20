import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceIndex = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
const sourceCss = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');

// DISPOSITION DE LA RÉSERVE « NON PLANIFIÉ » (7 août 2026).
//
// Proposition de Grégoire du 6 août, tranchée le 7 : offrir DEUX dispositions
// et laisser l'utilisateur choisir selon son écran.
//   'bas'    — la réserve sous la grille (défaut historique) ;
//   'gauche' — la réserve en colonne à côté, où elle cesse de défiler avec la
//              grille : on y PUISE des pastilles pendant que la grille défile.
//
// ⚠ CE QUE CETTE SENTINELLE VERROUILLE EN PRIORITÉ : que le GLISSER ne connaisse
// pas la disposition. Le dépôt « ici = désancrer » repose sur l'attribut
// `data-grille-semaine=""` ; un mode qui le changerait casserait le dépôt en
// silence, sans qu'aucun test de rendu ne bouge.
//
// (L'arithmétique du plancher de largeur — sans lequel la colonne ne laisse
// qu'une pastille par rangée — est verrouillée dans
// `sentinelle-largeur-planificateur`, volet 3.)

let store;
let elements;
let prefs;
let boutonDispo;

function monterModule() {
    store = {};
    prefs = {};
    boutonDispo = {
        title: '', attributs: {}, classes: new Set(),
        setAttribute(k, v) { this.attributs[k] = v; },
        getAttribute(k) { return this.attributs[k]; },
        classList: {
            toggle: (c, on) => { if (on) boutonDispo.classes.add(c); else boutonDispo.classes.delete(c); },
            add: (c) => boutonDispo.classes.add(c),
            remove: (c) => boutonDispo.classes.delete(c),
            contains: (c) => boutonDispo.classes.has(c)
        },
        addEventListener() {}
    };
    elements = {
        'planif-sommaire': { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] },
        'planif-btn-disposition-reserve': boutonDispo
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const fauxDocument = {
        getElementById: (id) => elements[id] || null,
        querySelectorAll: () => [], addEventListener: () => {},
        createElement: fauxElement, createElementNS: fauxElement,
        body: { appendChild() {}, removeChild() {} }
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: fauxDocument,
        obtenirPreference: (k) => prefs[k],
        definirPreference: (k, v) => { prefs[k] = v; }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

function poser(api, id, type, { titre = type, parent = null, enfants = [], metadata = {} } = {}) {
    api.etat.noeuds.set(id, { id, type, titre, x: 0, y: 0, parent, enfants, metadata, cloneSourceId: null });
}

function poserCadre() {
    store['a2026_calendrierComplet'] = {
        '2026-08-20': { statut: 'cours', numeroSemaine: 1 },
        '2026-08-27': { statut: 'cours', numeroSemaine: 2 }
    };
}

/** Une carte avec une leçon placée et une leçon en réserve. */
function poserCarteMixte(api) {
    poser(api, 'planif-l1', 'lecon', { titre: 'Placée', metadata: { semaine: 1 } });
    poser(api, 'planif-lx', 'lecon', { titre: 'En réserve', metadata: {} });
}

const rendu = () => elements['planif-sommaire'].innerHTML;

let api;
beforeEach(() => { api = monterModule(); poserCadre(); });

describe('Disposition · la préférence', () => {
    it('le défaut est « bas » — la disposition historique', () => {
        expect(api.dispositionReserve()).toBe('bas');
    });

    it('une valeur inconnue retombe sur « bas » plutôt que de casser le rendu', () => {
        prefs.planifReserveDisposition = 'diagonale';
        expect(api.dispositionReserve()).toBe('bas');
    });

    it('la bascule permute et MÉMORISE', () => {
        api.basculerDispositionReserve();
        expect(prefs.planifReserveDisposition).toBe('gauche');
        expect(api.dispositionReserve()).toBe('gauche');

        api.basculerDispositionReserve();
        expect(prefs.planifReserveDisposition).toBe('bas');
    });
});

describe('Disposition · le rendu', () => {
    it('en « bas », la réserve suit la grille et il n’y a pas d’enveloppe', () => {
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        const html = rendu();

        expect(html).not.toContain('planif-cotecote');
        expect(html).not.toContain('planif-reserve-colonne');
        // La grille vient AVANT la réserve.
        expect(html.indexOf('planif-grille-rangee')).toBeLessThan(html.indexOf('planif-grille-nonplanifie'));
    });

    it('en « gauche », la réserve PRÉCÈDE la grille dans une enveloppe', () => {
        prefs.planifReserveDisposition = 'gauche';
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        const html = rendu();

        expect(html).toContain('planif-cotecote');
        expect(html).toContain('planif-reserve-colonne');
        // C'est l'ORDRE qui produit la colonne de gauche.
        expect(html.indexOf('planif-grille-nonplanifie')).toBeLessThan(html.indexOf('planif-grille-rangee'));
    });

    it('l’enveloppe est refermée — un div ouvert casserait tout ce qui suit', () => {
        prefs.planifReserveDisposition = 'gauche';
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        const html = rendu();

        const ouvertures = (html.match(/<div/g) || []).length;
        const fermetures = (html.match(/<\/div>/g) || []).length;
        expect(ouvertures).toBe(fermetures);
    });

    it('les deux dispositions rendent les MÊMES éléments — seul l’ordre change', () => {
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        const bas = rendu();

        prefs.planifReserveDisposition = 'gauche';
        api.mettreAJourPlanificateur();
        const gauche = rendu();

        ['Placée', 'En réserve'].forEach((t) => {
            expect(bas).toContain(t);
            expect(gauche).toContain(t);
        });
        // Autant de rangées de semaine d'un côté que de l'autre.
        const compter = (h) => (h.match(/planif-grille-rangee/g) || []).length;
        expect(compter(gauche)).toBe(compter(bas));
    });

});

// =======================================================================
// #929 — LA ZONE SE REND MÊME VIDE (tranché par Grégoire, 20 sept. 2026)
// =======================================================================
//
// RENVERSEMENT ASSUMÉ. Jusqu'au 20 sept., cette sentinelle affirmait l'inverse
// (« sans rien en réserve, aucune colonne vide n'est fabriquée ») — c'était une
// décision du 7 août, pas un oubli. Le terrain l'a défaite : tout planifié, le
// bouton de disposition pivotait sans rien avoir à déplacer (dix clics dans le
// journal de Grégoire), et la seule cible de désancrage avait disparu — plus
// aucune leçon ne pouvait quitter le calendrier par le glisser.
const PHRASE_ZONE_VIDE = 'Glisse ici une leçon pour la retirer du calendrier.';

describe('#929 · la zone « Non planifié » se rend même vide', () => {
    function poserToutPlanifie() {
        poser(api, 'planif-l1', 'lecon', { titre: 'Placée', metadata: { semaine: 1 } });
    }
    /** La zone seule, de son ouverture à la fin du rendu ou à la grille qui suit. */
    function zone(html) {
        const debut = html.indexOf('<div class="planif-grille-nonplanifie');
        if (debut < 0) return '';
        const grille = html.indexOf('planif-grille-rangee', debut);
        return grille < 0 ? html.slice(debut) : html.slice(debut, grille);
    }

    it('en « bas » : titre, phrase validée, APRÈS la grille', () => {
        poserToutPlanifie();
        api.mettreAJourPlanificateur();
        const html = rendu();

        expect(zone(html)).toContain('planif-grille-nonplanifie-titre">Non planifié<');
        expect(zone(html)).toContain(PHRASE_ZONE_VIDE);
        expect(html).not.toContain('planif-cotecote');
        expect(html.indexOf('planif-grille-rangee')).toBeLessThan(html.indexOf('planif-grille-nonplanifie'));
    });

    it('en « gauche » : titre, phrase validée, en colonne AVANT la grille', () => {
        prefs.planifReserveDisposition = 'gauche';
        poserToutPlanifie();
        api.mettreAJourPlanificateur();
        const html = rendu();

        expect(zone(html)).toContain('planif-reserve-colonne');
        expect(zone(html)).toContain('planif-grille-nonplanifie-titre">Non planifié<');
        expect(zone(html)).toContain(PHRASE_ZONE_VIDE);
        expect(html.indexOf('planif-grille-nonplanifie')).toBeLessThan(html.indexOf('planif-grille-rangee'));
    });

    it('le bouton a donc toujours quelque chose à déplacer : la bascule change l’ordre du rendu', () => {
        poserToutPlanifie();
        api.mettreAJourPlanificateur();
        const avant = rendu();
        api.basculerDispositionReserve();
        const apres = rendu();

        expect(apres).not.toBe(avant);
        expect(apres).toContain('planif-cotecote');
    });

    it('vide ou pleine, la cible de dépôt porte le MÊME balisage', () => {
        const ouverture = (html) => html.match(/<div class="planif-grille-nonplanifie[^>]*>/)[0];

        poserToutPlanifie();
        api.mettreAJourPlanificateur();
        const vide = ouverture(rendu());

        poser(api, 'planif-lx', 'lecon', { titre: 'En réserve', metadata: {} });
        api.mettreAJourPlanificateur();
        const pleine = ouverture(rendu());

        expect(vide).toBe(pleine);
        expect(vide).toContain('data-grille-semaine=""');
    });

    it('la phrase disparaît dès qu’un élément entre dans la zone', () => {
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();

        expect(rendu()).not.toContain(PHRASE_ZONE_VIDE);
        expect(rendu()).not.toContain('planif-grille-nonplanifie-vide');
    });

    it('les div restent équilibrés, zone vide, dans les deux dispositions', () => {
        poserToutPlanifie();
        ['bas', 'gauche'].forEach((d) => {
            prefs.planifReserveDisposition = d;
            api.mettreAJourPlanificateur();
            const html = rendu();
            expect((html.match(/<div/g) || []).length).toBe((html.match(/<\/div>/g) || []).length);
        });
    });

    it('la phrase a une règle CSS — une classe jamais définie n’est pas un lot fini', () => {
        expect(sourceCss).toMatch(/\.planif-grille-nonplanifie-vide\s*\{[^}]*flex:\s*0 0 100%/);
    });
});

describe('Disposition · le GLISSER ne doit pas la connaître', () => {
    it('la cible de dépôt « désancrer » est identique dans les deux modes', () => {
        // C'est LE point critique : le dépôt repose sur `data-grille-semaine=""`.
        // Un mode qui changerait cet attribut casserait le désancrage en
        // silence — le rendu paraîtrait juste, le geste ne ferait plus rien.
        poserCarteMixte(api);

        api.mettreAJourPlanificateur();
        expect(rendu()).toContain('planif-grille-nonplanifie" data-grille-semaine=""');

        prefs.planifReserveDisposition = 'gauche';
        api.mettreAJourPlanificateur();
        expect(rendu()).toContain('planif-reserve-colonne" data-grille-semaine=""');
    });

    it('les rangées gardent leur numéro de semaine en mode colonne', () => {
        prefs.planifReserveDisposition = 'gauche';
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();

        expect(rendu()).toContain('data-grille-semaine="1"');
        expect(rendu()).toContain('data-grille-semaine="2"');
    });
});

// =======================================================================
// LE BOUTON DOIT EXISTER À L'ŒIL — correctif du 7 août
// =======================================================================
//
// Constat terrain de Grégoire : « je ne vois pas de bouton ». Il était pourtant
// dans le DOM, avec son écouteur et sa préférence. Deux défauts qu'AUCUNE de mes
// sentinelles ne pouvait voir, parce qu'elles vérifiaient le balisage et
// l'arithmétique :
//
//  1. le glyphe « ⫿ » (U+2AFF, Supplemental Math Operators) n'existe pas dans
//     les polices courantes — il s'affichait en carré vide. Un glyphe qui ne
//     rend pas est un bouton qui n'existe pas ;
//  2. `justify-content: space-between` répartit TROIS enfants : le bouton se
//     retrouvait seul au milieu de la barre, sans l'air d'un contrôle.
//
// C'est « vert et inerte » une troisième fois, dans un costume que les tests
// précédents ne couvraient pas.

describe('Bouton de disposition · visible et lisible', () => {
    /** Blocs Unicode sûrs — présents dans les polices système Mac et iPad. */
    const BLOCS_SURS = [
        [0x20, 0x7e],     // Latin de base
        [0xa0, 0xff],     // Latin-1
        [0x2000, 0x206f], // Ponctuation générale (dont − U+2212 ? non : 2212 est ci-dessous)
        [0x2190, 0x21ff], // Flèches
        [0x2200, 0x22ff], // Opérateurs mathématiques (− U+2212)
        [0x25a0, 0x25ff]  // Formes géométriques (◧ U+25E7)
    ];
    const estSur = (cp) => BLOCS_SURS.some(([a, b]) => cp >= a && cp <= b);

    const libelles = [...sourceIndex.matchAll(
        /<button[^>]*class="[^"]*planif-palette-toggle[^"]*"[^>]*>([^<]*)<\/button>/g
    )].map((m) => m[1]);

    it('les boutons de barre de palette sont bien là', () => {
        // Un seul depuis le 7 août : les boutons de « repli » des deux palettes
        // sont retirés au profit des boutons d'affichage de la barre d'outils.
        // Reste le bouton de disposition de la réserve.
        expect(libelles.length).toBeGreaterThanOrEqual(1);
    });

    it('AUCUN n’utilise un glyphe hors des blocs sûrs', () => {
        for (const libelle of libelles) {
            for (const car of [...libelle.trim()]) {
                const cp = car.codePointAt(0);
                expect(
                    estSur(cp),
                    `U+${cp.toString(16).toUpperCase()} (« ${car} ») risque le carré vide`
                ).toBe(true);
            }
        }
    });

    it('chacun porte un title — le glyphe seul ne dit pas ce qu’il fait', () => {
        const boutons = [...sourceIndex.matchAll(
            /<button[^>]*class="[^"]*planif-palette-toggle[^"]*"[^>]*>/g
        )].map((m) => m[0]);
        for (const b of boutons) expect(b).toMatch(/title="/);
    });

    it('la barre GROUPE ses boutons — le titre absorbe la place libre', () => {
        // Sans `flex: 1` sur le titre, `space-between` éparpille les trois
        // enfants et isole le bouton au milieu de la barre.
        const regle = /\.planif-palette-titre\s*\{[^}]*\}/.exec(sourceCss);
        expect(regle).toBeTruthy();
        expect(regle[0]).toMatch(/flex:\s*1/);
    });
});

// =======================================================================
// UNE CLASSE DE STYLE NE DÉSIGNE PAS UN BOUTON — correctif du 7 août
// =======================================================================
//
// Second constat terrain de Grégoire : « il n'y a plus de disposition verticale
// une fois qu'on a choisi l'horizontale ». Cause :
// `palette.querySelector('.planif-palette-toggle')` rend le PREMIER élément de
// cette classe. Depuis l'ajout du bouton de disposition, c'était LUI — donc le
// comportement « replier » s'y attachait, réécrivait son libellé en « + » / « − »
// (d'où le glyphe ◧ disparu des captures), et le vrai bouton de repli ne faisait
// plus rien. Le bouton de disposition devenait inatteignable : un aller sans
// retour.
//
// ▣ GÉNÉRAL — une classe qui sert à STYLER ne peut pas servir à DÉSIGNER. Dès
// qu'un deuxième élément la porte, tout `querySelector` sur elle devient un pari
// sur l'ordre du DOM.

// ▣ MISE À JOUR DU 7 AOÛT (soir) — le mécanisme de repli est RETIRÉ : afficher
// ou masquer une palette se commande depuis la barre d'outils. Les assertions
// qui portaient sur `.planif-palette-replier` sont donc supprimées plutôt que
// laissées vraies-pour-rien : une assertion dont le sujet a disparu est un
// faux-vert, pas une garde.
//
// CE QUI SURVIT, et qui est le vrai invariant : le code ne doit JAMAIS désigner
// un bouton par `.planif-palette-toggle`. La règle est intacte et reste
// mordante — c'est elle qui rattrapera le jour où un deuxième bouton rejoindra
// la barre et où quelqu'un tendra la main vers la classe de style.

describe('Sélecteurs · désigner et styler sont deux rôles distincts', () => {
    it('aucun comportement ne se branche sur la classe de STYLE', () => {
        expect(sourceCarte).not.toContain("querySelector('.planif-palette-toggle')");
        expect(sourceCarte).not.toContain('querySelector(".planif-palette-toggle")');
    });

    it('les boutons qui portent un comportement sont désignés par leur id', () => {
        // Chaque bouton de la barre de palette et de la barre d'outils est
        // atteint par getElementById — une identité, pas une apparence.
        for (const id of ['planif-btn-disposition-reserve',
                          'planif-btn-palette-noeuds',
                          'planif-btn-palette-planificateur']) {
            expect(sourceIndex).toContain(`id="${id}"`);
        }
        expect(sourceCarte).toContain("getElementById('planif-btn-disposition-reserve')");
    });

    it('le mécanisme de repli a bien disparu du DOM, du CSS et du comportement', () => {
        // Le HTML et le CSS ne doivent plus porter la moindre trace : là-bas,
        // toute occurrence est vivante.
        expect(sourceIndex).not.toContain('planif-palette-replier');
        expect(sourceCss).not.toContain('planif-palette-replie');
        // Dans le JS, on vise l'USAGE et non la chaîne : le commentaire qui
        // raconte le retrait mentionne la classe, et c'est très bien ainsi —
        // une sentinelle qui interdirait d'en parler effacerait la mémoire du
        // piège en même temps que le code.
        expect(sourceCarte).not.toMatch(/querySelector\(['"]\.planif-palette-replier/);
        expect(sourceCarte).not.toMatch(/classList\.\w+\(['"]planif-palette-replie/);
    });
});

// =======================================================================
// L'ÉTAT SE LIT DANS LA FORME — proposition de Grégoire, 7 août
// =======================================================================
//
// Le glyphe dépeint la disposition COURANTE : ◧ montre la moitié pleine à
// gauche (réserve en colonne) ; pivoté de −90°, elle passe en bas (réserve sous
// la grille). Un seul caractère, deux états.
//
// Pourquoi une rotation CSS plutôt qu'un second caractère : le bloc sûr (Formes
// géométriques) ne contient pas de « carré moitié basse noircie ». ⬓ (U+2B13)
// vit dans Miscellaneous Symbols and Arrows — le bloc même qui a donné le carré
// vide de 1.53.1. La rotation garde le glyphe dans le bloc sûr.

describe('Bouton de disposition · l’état se lit dans la FORME', () => {
    const regleRotation = /#planif-btn-disposition-reserve:not\(\.actif\)\s*\{[^}]*\}/.exec(sourceCss);

    it('l’état « bas » pivote le glyphe', () => {
        expect(regleRotation).toBeTruthy();
        expect(regleRotation[0]).toMatch(/transform:\s*rotate\(\s*-?90deg\s*\)/);
    });

    it('les deux états ne se distinguent PAS par la seule couleur', () => {
        // Règle d'accessibilité du projet : un état signalé uniquement par la
        // couleur est invisible à qui la distingue mal. La rotation porte
        // l'information ; la couleur ne suffirait pas.
        const reglesBouton = [...sourceCss.matchAll(
            /#planif-btn-disposition-reserve[^{]*\{([^}]*)\}/g
        )].map((m) => m[1]).join('\n');
        expect(reglesBouton).toMatch(/transform/);
    });

    it('le title annonce ce que le clic PRODUIRA, dans les DEUX états', () => {
        // Vérifié sur le bouton réel, pas par recherche de chaîne : un
        // `if (false)` ou un libellé déplacé dans une autre ligne passait
        // inaperçu à la lecture de la source (break-tests AA/AB).
        api.basculerDispositionReserve(); // → gauche
        expect(boutonDispo.title).toContain('remettre sous la grille');

        api.basculerDispositionReserve(); // → bas
        expect(boutonDispo.title).toContain('mettre à gauche');
    });

    it('un aria-label décrit l’état ET l’action — le glyphe seul est muet', () => {
        api.basculerDispositionReserve(); // → gauche
        const enColonne = boutonDispo.getAttribute('aria-label');
        expect(enColonne).toBeTruthy();
        expect(enColonne).toContain('colonne');
        expect(enColonne).toContain('cliquer');

        api.basculerDispositionReserve(); // → bas
        const enBas = boutonDispo.getAttribute('aria-label');
        expect(enBas).toContain('sous la grille');
        expect(enBas).not.toBe(enColonne);
    });

    it('la classe d’état suit réellement la disposition', () => {
        api.basculerDispositionReserve();
        expect(boutonDispo.classList.contains('actif')).toBe(true);
        api.basculerDispositionReserve();
        expect(boutonDispo.classList.contains('actif')).toBe(false);
    });
});
