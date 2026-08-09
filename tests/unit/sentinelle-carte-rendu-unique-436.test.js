import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE — chemin de rendu unique, ordre des objectifs, sarcelle unie
// (#436, 9 août 2026)
// =======================================================================
//
// Constat terrain de Grégoire, capture à l'appui : « la durée n'est pas
// toujours visible sur les feuilles Exposé — même chose pour les étapes
// d'enseignement explicite ».
//
// ▣ LA CAUSE N'ÉTAIT PAS DANS LE CHAMP DE DURÉE. Le contenu d'un nœud se
// construisait à TROIS endroits — `creerNoeud` (glisser depuis la palette),
// le clone Alt+glisser, et `reconstruireDOM` (rechargement) — et seul le
// troisième était complet. Un bloc fraîchement posé sortait sans son champ
// de durée et sans sa poignée ; un conteneur neuf, sans son compteur Σ, son
// sélecteur de semaine, son badge 🎯 ni sa bordure colorée. Tout
// réapparaissait au rechargement, quand `reconstruireDOM` reprenait la main.
//
// ⮕ Quatre enrichissements de l'en-tête s'étaient succédé (la durée, la
// semaine, les objectifs, la poignée) et les quatre avaient oublié les deux
// mêmes appelants. Ce n'est pas un oubli, c'est une structure qui le
// provoque. D'où le cas A ci-dessous, qui est un CLIQUET de source et non un
// test de comportement : il compte les endroits qui fabriquent un en-tête.
// Un test qui se contenterait de vérifier que le rendu est correct resterait
// vert le jour où quelqu'un rajoute un quatrième chemin.
//
// Ce qui est verrouillé ici :
//   A. UN SEUL endroit construit l'en-tête d'un nœud (cliquet anti-retour) ;
//   B. le rendu d'une feuille porte durée + poignée, celui d'un conteneur
//      porte Σ + semaine + badge 🎯 + poignée de largeur ;
//   C. réordonner un objectif ne RÉATTRIBUE aucun id — sans quoi les
//      `objectifsServis` (#403) suivraient le rang et non l'objectif ;
//   D. chaque ligne d'objectif porte ses quatre commandes, et les flèches
//      des bornes sont inertes (présentes, hors du parcours clavier) ;
//   E. les cinq étapes d'enseignement explicite pointent le MÊME token.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');

let api;
let execCalls;

function monterModule() {
    execCalls = [];
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const db = {
        getSync: (k, d) => (d !== undefined ? d : null),
        setSync: () => {}, get: async (k, d) => d, set: async () => {}
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: {
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {},
            createElement: fauxElement,
            createElementNS: fauxElement,
            execCommand: (cmd, ui, valeur) => { execCalls.push([cmd, ui, valeur]); return true; },
            body: { appendChild() {}, removeChild() {} }
        }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Test' }] }),
        sauvegarderCarte: () => {}, chargerCarte: () => null
    };
    api = win.planificationCarte;
    return api;
}

function poserNoeud(id, type, extra) {
    const n = Object.assign({
        id, type, titre: 'Bloc', x: 0, y: 0,
        parent: null, enfants: [], metadata: {}, cloneSourceId: null
    }, extra || {});
    api.etat.noeuds.set(id, n);
    return n;
}

beforeEach(() => {
    monterModule();
});

// -----------------------------------------------------------------------
describe('#436 · A — un seul chemin construit l’en-tête (cliquet)', () => {
    it('la classe « planif-noeud-entete » n’est fabriquée qu’à UN endroit', () => {
        // C'est LE test qui aurait vu le défaut. On compte les occurrences
        // où la classe est écrite dans une chaîne de construction : il doit y
        // en avoir exactement une, dans `contenuNoeudHTML`. Trois signifiait
        // trois rendus qui divergent ; deux signifierait qu'un chemin s'est
        // remis à fabriquer le sien dans son coin.
        const occurrences = sourceCarte.match(/'<div class="planif-noeud-entete">'/g) || [];
        expect(occurrences.length).toBe(1);
    });

    it('les deux autres appelants DÉLÈGUENT à contenuNoeudHTML', () => {
        // Le cliquet ci-dessus dit qu'il n'y a qu'une fabrique ; celui-ci dit
        // que les appelants s'en servent vraiment, au lieu d'avoir été
        // simplement vidés de leur rendu.
        const appels = sourceCarte.match(/innerHTML = contenuNoeudHTML\(/g) || [];
        expect(appels.length).toBe(3);
    });

    it('la poignée de redimensionnement n’est fabriquée qu’à UN endroit', () => {
        // Elle manquait aux nœuds fraîchement posés pour la même raison, et
        // personne ne l'avait remarqué : elle est invisible tant qu'on ne la
        // cherche pas. Verrouillée avec le reste.
        const occurrences = sourceCarte.match(/class="planif-noeud-poignee/g) || [];
        expect(occurrences.length).toBe(2); // feuille + variante largeur
    });
});

// -----------------------------------------------------------------------
describe('#436 · B — le rendu porte ses contrôles, quel que soit le type', () => {
    it('une feuille « Exposé » porte son champ de durée ET sa poignée', () => {
        const n = poserNoeud('n-1', 'expose', { metadata: { duree: 50 } });
        const html = api.contenuNoeudHTML(n);
        expect(html).toContain('planif-noeud-duree');
        expect(html).toContain('value="50"');
        expect(html).toContain('planif-noeud-poignee');
    });

    it('une feuille SANS durée porte quand même le champ, vide', () => {
        // La découvrabilité était le motif d'origine du champ toujours
        // visible : un contrôle qui n'apparaît qu'une fois rempli est
        // indécouvrable. Le régresser rendrait le symptôme de Grégoire.
        const n = poserNoeud('n-2', 'expose');
        const html = api.contenuNoeudHTML(n);
        expect(html).toContain('planif-noeud-duree');
        expect(html).toContain('value=""');
    });

    it('les CINQ étapes d’enseignement explicite portent leur durée', () => {
        // Le second volet du constat terrain : « c'est la même chose avec les
        // étapes d'enseignement explicite ».
        ['ouverture', 'modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture']
            .forEach((type) => {
                const n = poserNoeud(`n-${type}`, type);
                expect(api.contenuNoeudHTML(n), type).toContain('planif-noeud-duree');
            });
    });

    it('un conteneur « Leçon » porte Σ, semaine, badge 🎯 et poignée de largeur', () => {
        const n = poserNoeud('l-1', 'lecon');
        const html = api.contenuNoeudHTML(n);
        expect(html, 'compteur Σ').toContain('planif-noeud-rollup');
        expect(html, 'sélecteur de semaine').toContain('planif-noeud-semaine');
        expect(html, 'badge objectifs').toContain('planif-badge-objectif');
        expect(html, 'poignée de largeur').toContain('planif-noeud-poignee--largeur');
    });

    it('un conteneur ne porte PAS de champ de durée saisissable', () => {
        // Sa durée est une SOMME (rollup), pas une saisie : offrir les deux
        // créerait deux sources de vérité pour le même nombre.
        const n = poserNoeud('l-2', 'lecon');
        expect(api.contenuNoeudHTML(n)).not.toContain('planif-noeud-duree"');
    });
});

// -----------------------------------------------------------------------
describe('#436 · C — réordonner ne déplace pas les liens', () => {
    it('permuter deux objectifs conserve leurs id', () => {
        // L'invariant qui compte. Les `objectifsServis` d'une activité visent
        // un id d'objectif (#403) : si réordonner réattribuait les id au rang,
        // une activité se mettrait silencieusement à servir l'objectif voisin.
        const lecon = poserNoeud('l-3', 'lecon');
        api.appliquerObjectifs(lecon, ['Premier', 'Deuxième', 'Troisième']);
        const avant = lecon.metadata.objectifs.map((o) => ({ id: o.id, texte: o.texte }));

        // Le déplacement tel que le fait le bouton ▼ sur la première ligne :
        // on permute les lignes LUES, id compris.
        const lignes = avant.map((o) => ({ id: o.id, texte: o.texte }));
        lignes.splice(1, 0, lignes.splice(0, 1)[0]);
        api.appliquerObjectifs(lecon, lignes);

        const apres = lecon.metadata.objectifs;
        expect(apres.map((o) => o.texte)).toEqual(['Deuxième', 'Premier', 'Troisième']);
        // Chaque texte a gardé SON id d'origine.
        avant.forEach((o) => {
            const jumeau = apres.find((a) => a.texte === o.texte);
            expect(jumeau.id, o.texte).toBe(o.id);
        });
    });

    it('permuter ne crée ni ne perd d’objectif', () => {
        const lecon = poserNoeud('l-4', 'lecon');
        api.appliquerObjectifs(lecon, ['A', 'B', 'C']);
        const ids = lecon.metadata.objectifs.map((o) => o.id);
        const lignes = lecon.metadata.objectifs.map((o) => ({ id: o.id, texte: o.texte }));
        lignes.splice(0, 0, lignes.splice(2, 1)[0]);
        api.appliquerObjectifs(lecon, lignes);
        expect(lecon.metadata.objectifs).toHaveLength(3);
        expect(new Set(lecon.metadata.objectifs.map((o) => o.id))).toEqual(new Set(ids));
    });
});

// -----------------------------------------------------------------------
describe('#436 · D — les quatre commandes de ligne', () => {
    function lignesDe(lecon) {
        return api.objectifsLeconHTML(lecon).split('planif-noeud-objectif-ligne').slice(1);
    }

    it('chaque ligne porte ▲ ▼ + −', () => {
        const lecon = poserNoeud('l-5', 'lecon', { metadata: { objectifDeplie: true } });
        api.appliquerObjectifs(lecon, ['Un', 'Deux', 'Trois']);
        lignesDe(lecon).forEach((ligne, i) => {
            expect(ligne, `ligne ${i} · monter`).toContain('planif-obj-monter');
            expect(ligne, `ligne ${i} · descendre`).toContain('planif-obj-descendre');
            expect(ligne, `ligne ${i} · ajouter`).toContain('planif-obj-ajouter');
            expect(ligne, `ligne ${i} · retirer`).toContain('planif-obj-retirer');
        });
    });

    it('la PREMIÈRE ligne ne peut pas monter, la DERNIÈRE ne peut pas descendre', () => {
        const lecon = poserNoeud('l-6', 'lecon', { metadata: { objectifDeplie: true } });
        api.appliquerObjectifs(lecon, ['Un', 'Deux', 'Trois']);
        const lignes = lignesDe(lecon);
        expect(lignes).toHaveLength(3);

        const inerte = (ligne, classe) =>
            new RegExp(`${classe} planif-obj-btn--inerte`).test(ligne);

        expect(inerte(lignes[0], 'planif-obj-monter'), 'première · ▲ inerte').toBe(true);
        expect(inerte(lignes[0], 'planif-obj-descendre'), 'première · ▼ actif').toBe(false);
        expect(inerte(lignes[1], 'planif-obj-monter'), 'milieu · ▲ actif').toBe(false);
        expect(inerte(lignes[1], 'planif-obj-descendre'), 'milieu · ▼ actif').toBe(false);
        expect(inerte(lignes[2], 'planif-obj-descendre'), 'dernière · ▼ inerte').toBe(true);
        expect(inerte(lignes[2], 'planif-obj-monter'), 'dernière · ▲ actif').toBe(false);
    });

    it('une commande inerte sort du parcours clavier et de la synthèse vocale', () => {
        // Présente pour tenir l'alignement des colonnes, mais un bouton qui ne
        // fait rien n'a rien à annoncer ni à recevoir le focus.
        const lecon = poserNoeud('l-7', 'lecon', { metadata: { objectifDeplie: true } });
        api.appliquerObjectifs(lecon, ['Seul']);
        const ligne = lignesDe(lecon)[0];
        const bloc = ligne.match(/<span class="planif-obj-btn planif-obj-monter planif-obj-btn--inerte"[^>]*>/);
        expect(bloc).not.toBeNull();
        expect(bloc[0]).toContain('aria-hidden="true"');
        expect(bloc[0]).not.toContain('tabindex');
        expect(bloc[0]).not.toContain('role="button"');
    });

    it('un objectif seul ne peut ni monter ni descendre', () => {
        const lecon = poserNoeud('l-8', 'lecon', { metadata: { objectifDeplie: true } });
        api.appliquerObjectifs(lecon, ['Seul']);
        const ligne = lignesDe(lecon)[0];
        expect(/planif-obj-monter planif-obj-btn--inerte/.test(ligne)).toBe(true);
        expect(/planif-obj-descendre planif-obj-btn--inerte/.test(ligne)).toBe(true);
    });

    it('les objectifs repliés ne rendent aucune ligne', () => {
        const lecon = poserNoeud('l-9', 'lecon');
        api.appliquerObjectifs(lecon, ['Un']);
        expect(api.objectifsLeconHTML(lecon)).toBe('');
    });

    it('le handler du bouton refuse un déplacement hors bornes', () => {
        // Le rendu marque la borne, mais le rendu n'est pas une garantie : la
        // logique doit refuser d'elle-même. Sans cette garde, un appel forgé
        // (ou une ligne d'accueil décalant les rangs) sortirait du tableau.
        const garde = sourceCarte.match(/if \(cible < 0 \|\| cible >= textes\.length\) return;/);
        expect(garde).not.toBeNull();
    });

    it('le déplacement empile un état d’annulation', () => {
        // Le bouton empêche le focus (preventDefault au pointerdown), donc
        // l'écouteur `focus` de la ligne — le seul autre point qui empile —
        // ne se déclenche pas. Sans appel explicite, ⌘Z sauterait par-dessus.
        const bloc = sourceCarte.slice(
            sourceCarte.indexOf('var monte = btn.classList.contains'),
            sourceCarte.indexOf('if (btn.classList.contains(\'planif-obj-ajouter\'))')
        );
        expect(bloc).toContain('enregistrerPourUndo()');
    });
});

// -----------------------------------------------------------------------
describe('#436 · F — coller apporte le texte, pas la typographie', () => {
    function champEspion() {
        const champ = {
            ecouteurs: {},
            evenements: [],
            addEventListener(type, fn) { champ.ecouteurs[type] = fn; },
            dispatchEvent(e) { champ.evenements.push(e); }
        };
        return champ;
    }

    function coller(champ, brut, html) {
        let empeche = false;
        champ.ecouteurs.paste({
            clipboardData: {
                getData: (type) => (type === 'text/plain' ? brut : (html || ''))
            },
            preventDefault() { empeche = true; }
        });
        return empeche;
    }

    it('le collage est intercepté et n’insère que le text/plain', () => {
        const champ = champEspion();
        api.collerEnTexteBrut(champ);
        const empeche = coller(champ, 'Postures et stratégies de lecture',
            '<span style="font-size:24px;font-weight:800">Postures…</span>');
        expect(empeche, 'le collage natif doit être empêché').toBe(true);
        expect(execCalls).toEqual([
            ['insertText', false, 'Postures et stratégies de lecture']
        ]);
    });

    it('le text/html du presse-papiers n’est JAMAIS lu', () => {
        // L'assertion qui compte : le défaut de Grégoire vient de ce que le
        // navigateur préfère le text/html. Lire cette forme, même pour la
        // nettoyer ensuite, rouvrirait la porte.
        const champ = champEspion();
        api.collerEnTexteBrut(champ);
        const demandes = [];
        champ.ecouteurs.paste({
            clipboardData: { getData: (type) => { demandes.push(type); return 'Texte'; } },
            preventDefault() {}
        });
        expect(demandes).toEqual(['text/plain']);
    });

    it('un collage multiligne devient une ligne', () => {
        // Les deux champs sont des libellés d'UNE ligne (tous deux
        // interceptent Entrée) : des sauts de ligne y grandiraient le bloc.
        const champ = champEspion();
        api.collerEnTexteBrut(champ);
        coller(champ, '  Premier\n\n  Deuxième \r\n Troisième  ');
        expect(execCalls[0][2]).toBe('Premier Deuxième Troisième');
    });

    it('un presse-papiers vide n’insère rien', () => {
        const champ = champEspion();
        api.collerEnTexteBrut(champ);
        coller(champ, '   ');
        expect(execCalls).toHaveLength(0);
    });

    it('les DEUX champs éditables de la carte sont protégés', () => {
        // Un seul des deux protégé laisserait le défaut visible sur l'autre.
        expect(sourceCarte).toContain('collerEnTexteBrut(titreEl)');
        expect(sourceCarte).toContain('collerEnTexteBrut(ligne)');
    });

    it('la CSS impose la typographie de la carte au contenu inséré', () => {
        // Filet structurel : un glisser-déposer de texte enrichi n'émet pas
        // d'événement `paste` et échapperait au filtre JS.
        const bloc = css.match(/\.planif-noeud-titre \*,\s*\.planif-noeud-objectif \*\s*\{[^}]+\}/);
        expect(bloc).not.toBeNull();
        expect(bloc[0]).toContain('font-size: inherit !important');
        expect(bloc[0]).toContain('font-weight: inherit !important');
        expect(bloc[0]).toContain('color: inherit !important');
    });
});

// -----------------------------------------------------------------------
describe('#436 · G — le bandeau « en développement actif » est parti', () => {
    const indexHtml = readFileSync(path.join(racine, 'index.html'), 'utf8');

    it('ni le badge ni sa note ne sont dans la page', () => {
        expect(indexHtml).not.toContain('planif-badge-evolution');
        expect(indexHtml).not.toContain('planif-note-evolution');
        expect(indexHtml).not.toContain('Présentement en développement actif');
    });

    it('leur CSS est parti avec eux (pas de style orphelin)', () => {
        // Un style sans porteur se recopie tout seul au prochain module « en
        // évolution » — c'est comme ça qu'un retrait revient par la bande.
        expect(css).not.toMatch(/\.planif-badge-evolution\s*\{/);
        expect(css).not.toMatch(/\.planif-note-evolution\s*\{/);
    });

    it('le titre de la sous-section survit au retrait', () => {
        // Le badge vivait DANS le <h2> : le retirer d'un cran trop large
        // emporterait le titre de la section avec lui.
        expect(indexHtml).toMatch(/<h2 class="titre-avec-emoji-toggles">\s*<span>[^<]+<\/span>\s*<\/h2>/);
    });
});

// -----------------------------------------------------------------------
// §H — LE DOUBLE COMPORTEMENTAL DES INVARIANTS F1
//
// `sentinelle-objectif-lecon-metadata.test.js` verrouille ces mêmes règles en
// LISANT la source. Elles y sont restées vertes pendant que quatre
// enrichissements successifs sortaient des en-têtes incomplètes : une
// assertion de source dit où le code est écrit, jamais ce qu'il produit.
// Les mêmes règles sont donc reprises ici en RENDANT un nœud. Les deux
// familles se complètent — l'une attrape le déplacement du code, l'autre
// attrape le rendu qui ment.
describe('#436 · H — les invariants F1, vérifiés au rendu', () => {
    it('une leçon SANS objectif rend quand même son badge 🎯, marqué vide', () => {
        // Cause racine de F1 : un badge conditionné à la présence d'un
        // objectif ne se découvre jamais.
        const n = poserNoeud('h-1', 'lecon');
        const html = api.contenuNoeudHTML(n);
        expect(html).toContain('planif-badge-objectif');
        expect(html).toContain('planif-badge-objectif--vide');
    });

    it('une leçon AVEC objectifs rend le badge sans la marque vide', () => {
        const n = poserNoeud('h-2', 'lecon');
        api.appliquerObjectifs(n, ['Un']);
        const html = api.contenuNoeudHTML(n);
        expect(html).toContain('planif-badge-objectif');
        expect(html).not.toContain('planif-badge-objectif--vide');
    });

    it('l’ordre rendu est TYPE → objectifs → titre', () => {
        const n = poserNoeud('h-3', 'lecon', { titre: 'Ma leçon', metadata: { objectifDeplie: true } });
        api.appliquerObjectifs(n, ['Un', 'Deux']);
        const html = api.contenuNoeudHTML(n);
        const iType = html.indexOf('planif-noeud-type');
        const iObjs = html.indexOf('planif-noeud-objectifs');
        const iTitre = html.indexOf('planif-noeud-titre');
        expect(iType).toBeGreaterThan(-1);
        expect(iObjs).toBeGreaterThan(iType);
        expect(iTitre).toBeGreaterThan(iObjs);
    });

    it('les commandes + et − rendues sont atteignables au clavier', () => {
        const n = poserNoeud('h-4', 'lecon', { metadata: { objectifDeplie: true } });
        api.appliquerObjectifs(n, ['Un', 'Deux']);
        const lignes = api.objectifsLeconHTML(n).split('planif-noeud-objectif-ligne').slice(1);
        expect(lignes).toHaveLength(2);
        lignes.forEach((ligne, i) => {
            ['planif-obj-ajouter', 'planif-obj-retirer'].forEach((classe) => {
                const bouton = ligne.match(new RegExp(`<span class="planif-obj-btn ${classe}"[^>]*>`));
                expect(bouton, `ligne ${i} · ${classe}`).not.toBeNull();
                expect(bouton[0], `ligne ${i} · ${classe} · focus`).toContain('tabindex="0"');
                expect(bouton[0], `ligne ${i} · ${classe} · rôle`).toContain('role="button"');
                expect(bouton[0], `ligne ${i} · ${classe} · nom`).toContain('aria-label=');
            });
        });
    });

    it('le titre est ÉCHAPPÉ dans le rendu, quel que soit le type de nœud', () => {
        // Le rendu unique ne doit pas avoir avalé l'échappement au passage :
        // c'est l'invariant de #386, revérifié ici à la sortie.
        const marqueur = '<img src=x onerror=alert(1)>';
        [['h-5', 'expose'], ['h-6', 'lecon']].forEach(([id, type]) => {
            const n = poserNoeud(id, type, { titre: marqueur });
            // Le harnais injecte un echapperHtml identité : on vérifie donc le
            // CHEMIN (le titre passe par la fonction), pas l'échappement lui-même.
            expect(api.contenuNoeudHTML(n), type).toContain('planif-noeud-titre');
        });
        expect(sourceCarte).toMatch(/contenteditable="true">' \+ echapperHtml\(n\.titre \|\| ''\)/);
    });
});

// -----------------------------------------------------------------------
describe('#436 · E — une seule sarcelle pour l’enseignement explicite', () => {
    const ETAPES = ['ouverture', 'modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture'];

    it('le token unique existe', () => {
        expect(css).toMatch(/--planif-couleur-enseignement-explicite:\s*#0891b2;/);
    });

    it('les cinq étapes POINTENT le token, aucune ne porte sa propre valeur', () => {
        // Cinq copies de la même valeur divergeraient au premier ajustement —
        // on retrouverait le dégradé qu'on vient justement de retirer.
        ETAPES.forEach((etape) => {
            const decl = css.match(new RegExp(`--planif-couleur-${etape}:\\s*([^;]+);`));
            expect(decl, etape).not.toBeNull();
            expect(decl[1].trim(), etape).toBe('var(--planif-couleur-enseignement-explicite)');
        });
    });

    it('aucune étape n’est redéfinie ailleurs avec une couleur en dur', () => {
        // Une surcharge en mode clair rétablirait le dégradé sur un seul mode,
        // et le défaut ne se verrait que chez qui utilise ce mode-là.
        ETAPES.forEach((etape) => {
            const toutes = css.match(new RegExp(`--planif-couleur-${etape}:\\s*[^;]+;`, 'g')) || [];
            expect(toutes.length, `${etape} déclaré ${toutes.length} fois`).toBe(1);
        });
    });

    it('les cinq types de nœud lisent bien ces variables', () => {
        // Le lien entre le token CSS et le modèle : si un type se mettait à
        // porter une couleur littérale, le token ne le commanderait plus.
        ETAPES.forEach((etape) => {
            expect(sourceCarte, etape).toContain(`var(--planif-couleur-${etape})`);
        });
    });
});
