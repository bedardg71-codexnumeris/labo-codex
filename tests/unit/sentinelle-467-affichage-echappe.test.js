import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #467 (CO-14, 9 oct. 2026) — UN NOM REÇU S'AFFICHE, IL NE S'EXÉCUTE PAS.
//
// Avec la cohorte, grilles, échelles, cartouches, pratiques, productions et tampons
// passent d'un enseignant à l'autre. Le nom reçu arrivait brut dans le `innerHTML`
// du destinataire : barres latérales, cartes de la Bibliothèque, fenêtres d'import
// par trimestre, éditeurs de tampons. La CSP bloque les scripts, pas l'injection
// de HTML (règle 1 de CLAUDE.md). L'échappement à l'affichage couvre aussi le
// STOCK : ce qui a déjà été importé brut chez quelqu'un n'est pas réécrit.
//
// Ce qu'il tient :
//   A — les points de chute communs des cartes (bibliotheque-ui.js).
//   B — trois barres latérales, rendues pour de vrai avec un nom hostile.
//   C — un cliquet statique sur les quinze fichiers de la passe : toute
//       interpolation brute d'un champ nommé (nom, titre, description, auteur…)
//       dans du balisage rougit, sauf les exceptions NOMMÉES ci-dessous, chacune
//       avec sa raison (une constante du code, jamais une donnée reçue).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const CHARGE = '<img src=x onerror=alert(1)>';

// Même table que `echapperHtml` (config.js, zone protégée, non chargée ici).
const echapperHtml = (t) => (t == null ? '' : String(t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;'));

function conteneurs(ids) {
    const els = {};
    ids.forEach((id) => { els[id] = { innerHTML: '', classList: { add() {}, remove() {} }, style: {} }; });
    return {
        els,
        document: {
            getElementById: (id) => els[id] || null,
            querySelector: () => null,
            querySelectorAll: () => [],
            createElement: () => ({ setAttribute() {}, appendChild() {}, style: {}, classList: { add() {}, remove() {} } }),
            addEventListener() {}, removeEventListener() {},
            body: { appendChild() {}, insertAdjacentHTML() {} }
        }
    };
}

/* --------------------------------------------- A — les points de chute communs */

describe('#467 · A — les cartes de la Bibliothèque', () => {
    const { document } = conteneurs([]);
    const win = chargerScript('js/bibliotheque-ui.js', { echapperHtml, echapperAttribut: echapperHtml, document });
    const B = win.BibliothequeUI;

    // #1159 (verdict du lot 6, § 2.2) — A.a et A.b partis avec `formaterMetadonnees` et `formaterAttribution`,
    // qu'ils étaient seuls à lire (la ligne de métadonnées des cartes) ; les rangées reçoivent leur ligne en
    // texte et `_renderRangee` l'échappe (banc `bibliotheque-liste-1159`, nom hostile).

    it('A.c l\'identifiant de contexte du menu d\'actions (un id importé) ne sort pas de son attribut', () => {
        const html = B.renderMenuActions([{ label: 'Supprimer', action: 'x', param: 'y' }], '"><img src=x onerror=alert(1)>');
        expect(html).not.toContain('<img');
    });
});

/* ------------------------------------------------ B — trois barres latérales */

describe('#467 · B — les sélections affichent le nom, elles ne l\'exécutent pas (#1147 : des menus, plus des barres latérales)', () => {
    const BibliothequeUI = { filtrerParModeDemo: (l) => l, filtrerParMaquette: (l) => l };

    it('B.a pratiques', async () => {
        // #1147 (24 oct. 2026) : la sélection est un menu, dessiné dans son emplacement de la rangée.
        const { els, document } = conteneurs(['selectionPratiques']);
        const win = chargerScript('js/pratiques-gestion.js', {
            document, echapperHtml, BibliothequeUI, cle: (k) => 'a2026_' + k,
            db: { getSync: () => [{ id: 'P1', nom: CHARGE + 'Pratique reçue', dansBibliotheque: true }] },
            genererBadgeTypePratique: () => '', obtenirIdPratiqueActive: () => null
        });
        await win.afficherListePratiquesMateriel();
        expect(els.selectionPratiques.innerHTML).toContain('&lt;img');
        expect(els.selectionPratiques.innerHTML).not.toContain('<img');
    });

    it('B.b échelles', async () => {
        const { els, document } = conteneurs(['selectionEchelles']);
        const win = chargerScript('js/echelles.js', {
            document, echapperHtml, BibliothequeUI, cle: (k) => 'a2026_' + k,
            db: { get: async () => [{ id: 'E1', nom: CHARGE + 'Échelle reçue', niveaux: [] }], getSync: (k, d) => d }
        });
        await win.afficherListeEchelles();
        expect(els.selectionEchelles.innerHTML).toContain('&lt;img');
        expect(els.selectionEchelles.innerHTML).not.toContain('<img');
    });

    it('B.c ensembles d\'objectifs', () => {
        const { els, document } = conteneurs(['listeEnsemblesObjectifs']);
        const win = chargerScript('js/objectifs.js', {
            document, echapperHtml,
            db: { getSync: () => [{ id: 'O1', nom: CHARGE + 'Ensemble reçu', objectifs: [] }] }
        });
        win.initialiserModuleObjectifs();   // le point d'entrée réel de la liste
        expect(els.listeEnsemblesObjectifs.innerHTML).toContain('&lt;img');
        expect(els.listeEnsemblesObjectifs.innerHTML).not.toContain('<img');
    });
});

/* ----------------------------------------------------- C — le cliquet statique */

const FICHIERS = [
    'js/bibliotheque-ui.js', 'js/pratiques-gestion.js', 'js/echelles.js', 'js/grilles.js',
    'js/cartouches.js', 'js/objectifs.js', 'js/productions.js', 'js/productions-bibliotheque-ui.js',
    'js/tampons-bibliotheque.js', 'js/planification-bibliotheque.js', 'js/travaux-outils.js',
    'js/wizard-pratique-v2.js', 'js/profil-etudiant-sections-affichage.js',
    'js/trimestre-v2-cours.js'
];

// Les seules interpolations brutes admises : des constantes du code, jamais une donnée reçue.
const ADMISES = {
    // js/bibliotheque-ui.js : `+ config.titre +` (le titre de fenêtre de `creerModal`) est parti avec lui (#1159, 25 oct.)
    'js/echelles.js': ['${ph.code}', '${ph.nom}'],          // exemples de placeholder, table du code
    'js/travaux-outils.js': ['+ c.nom +', '${m.titre}',     // COULEURS et modes de pointe : tables du code
        '${outil.icone}', '${outil.icone}'],                 // icônes <img> des outils et formes (OUTILS) : D.a
    'js/wizard-pratique-v2.js': ['${opt.description}', '${opt.description}', '${badge.code}', '${badge.description}'],
    // ↑ définitions de l'assistant et TYPE_BADGES : tables du code
    'js/profil-etudiant-sections-affichage.js': ['${niveauRai.description}']   // determinerNiveauRaiPedagogique : table du code
};

const CHAMPS = '(?:nom|titre|description|auteur|auteurOriginal|auteur_original|discipline|etablissement|objectif|tache|activiteApprentissage|licence|icone|code|lettre)';
const GABARIT = new RegExp('\\$\\{\\s*(?!echapper|esc\\()[\\w$.?\\[\\]]*\\.' + CHAMPS + '\\s*(?:\\|\\|[^}]*)?\\}', 'g');
const CONCAT = new RegExp('\\+\\s*(?!echapper|esc\\()[\\w$.?\\[\\]]*\\.' + CHAMPS + '\\s*\\+', 'g');

function interpolationsBrutes(fichier) {
    const trouves = [];
    readFileSync(path.join(racine, fichier), 'utf8').split('\n').forEach((l) => {
        if (/^\s*(\/\/|\*)/.test(l)) return;              // commentaire
        if (!/<\/?[a-zA-Z]|="/.test(l)) return;            // pas de balisage sur la ligne
        for (const m of l.matchAll(GABARIT)) trouves.push(m[0].replace(/\s+/g, ''));
        for (const m of l.matchAll(CONCAT)) trouves.push(m[0].replace(/\s+/g, ' '));
    });
    return trouves;
}

describe('#467 · C — aucune interpolation brute d\'un champ nommé dans le balisage', () => {
    for (const f of FICHIERS) {
        it(f, () => {
            expect(interpolationsBrutes(f).sort()).toEqual([...(ADMISES[f] || [])].sort());
        });
    }

    // Les titres de cartes ne passent pas par un gabarit `${…}` : `nom:` reçoit le
    // résultat de `formaterTitre`, qui ne retire qu'un préfixe [XXX]. Le nom doit
    // donc y entrer DÉJÀ échappé. Exceptions : les appels en contexte TEXTE (libellé
    // d'un select de dossiers, échappé à l'option par bibliotheque-ui.js).
    const TITRE_BRUT = /formaterTitre(?:Demo)?\(\s*(?=\S)(?!echapperHtml\()/g;
    const TITRES_TEXTE = {
        'js/bibliotheque-ui.js': 1,               // formaterTitreDemo → formaterTitre ; #1156 : _labelItem parti avec la ligne-select des dossiers
        'js/pratiques-gestion.js': 2,             // #1156 : le nom des rangées de la fenêtre en deux colonnes, ×2 (texte, échappé par creerFenetreDeuxColonnes) ; `labelItem` parti
        'js/grilles.js': 2,                       // #1154 : le nom des rangées de la fenêtre en deux colonnes, ×2 (texte, échappé par creerFenetreDeuxColonnes) ; `libelle` parti
        'js/echelles.js': 2,                      // #1155 : le nom des rangées de la fenêtre en deux colonnes, ×2 (texte, échappé par creerFenetreDeuxColonnes) ; `libelle` parti
        'js/cartouches.js': 2,                    // #1155 : le nom des rangées de la fenêtre en deux colonnes, ×2 (texte, échappé par creerFenetreDeuxColonnes)
        'js/productions-bibliotheque-ui.js': 1    // #1156 : le nom des rangées (`nomProductionBibliotheque`, texte, échappé par creerFenetreDeuxColonnes) ; `libelle` parti
    };
    it('C.t les titres de cartes reçoivent un nom déjà échappé', () => {
        for (const f of FICHIERS) {
            const src = readFileSync(path.join(racine, f), 'utf8')
                .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
                .replace(/BibliothequeUI\.formaterTitre(?:Demo)? = function\s*\(/g, '');
            expect((src.match(TITRE_BRUT) || []).length, f).toBe(TITRES_TEXTE[f] || 0);
            // Une carte construite sur place : son `nom:` est échappé, ou formaté (règle ci-dessus).
            expect(src.match(/renderCarte\w*\(\{\s*nom:\s*(?=\S)(?!echapperHtml|BibliothequeUI)/g), f).toBeNull();
            // Le `nom` d'une carte est du HTML : le select des dossiers lit `libelle` (texte),
            // sinon « Grille d'analyse » s'y afficherait « Grille d&#39;analyse ».
            expect(src, f).not.toMatch(/labelItem:\s*\(c\)\s*=>\s*c\.nom\b/);
        }
    });

    // Une variable NUE (`${nomPratique}`, `' + nomCat + '`) n'a pas de champ à
    // reconnaître : celles-là sont tenues par un COMPTE, mesuré le 9 oct. après la
    // passe (ids, nombres, fragments HTML déjà construits, et les noms désormais
    // échappés n'y figurent plus). Un nom qu'on désescape fait MONTER le compte.
    // ⚠ Un compte qui BAISSE (échappement ou retrait de plus) se met à jour ici,
    // à la baisse seulement, avec sa raison dans le commit.
    // ↻ 11 oct. 2026 (#574) : echelles.js 23 → 24, SANS désescape. La ligne de niveau
    // est devenue une fonction (`ligneNiveauEchelleHtml`) partagée avec le niveau en
    // attente : ses six `${index}` sont devenus un `${index}` et six `${attrs}` — le
    // même fragment d'identifiants, construit une fois. Aucun nom n'y passe.
    // ↻ 15 oct. 2026 (#821) : profil-etudiant-sections-affichage.js 111 → 112, SANS désescape.
    // La phrase sous le badge du contexte sort dans `_ligneDescriptionContexte` (cliquet de
    // complexité) : sa couleur, un code hexadécimal choisi par le palier, devient `${couleur}`.
    // ↻ 18 oct. 2026 (dissection 2a, C2) : grilles.js 65 → 64 ; `${c.ponderation}%` passe par `texteDePonderation`.
    // ↻ 19 oct. 2026 (#1117) : grilles.js 64 → 65, SANS désescape — même cas que #574. Le menu
    // « Complexité SOLO du critère » sort dans `menuComplexiteSOLOCritere`, partagé par les deux
    // éditeurs ; leurs attributs (handler, `grille.id`, `index`) lui arrivent en `${attrs}`.
    // ↻ 20 oct. 2026 (#1120, lot 1) : grilles.js 65 → 69, SANS désescape — même cas que #574. Une tranche
    // du barème (`trancheBaremeHtml`) reçoit le même fragment d'identifiants dans ses trois champs
    // (`${attrs}` ×3, échappé une fois à sa construction), et le bloc d'un critère pose le barème déjà
    // construit (`${bareme}`). Le nom et le texte d'une tranche passent par `echapperHtml`.
    // ↻ 20 oct. 2026 (sous-critères modifiables) : grilles.js 69 → 73, SANS désescape — même cas que #574.
    // Le bloc d'un critère pose la section déjà construite (`${sous}`), la section ses rangées (`${lignes}`) ;
    // une rangée porte son rang (`${i}`) et la borne de l'assistant (`${max}`), deux nombres. Le nom d'un
    // sous-critère passe par `echapperHtml`.
    // ↻ 25 oct. 2026 (#1154) : bibliotheque-ui.js 29 → 40, SANS désescape — la fenêtre en deux colonnes.
    // Les onze : `contenu` (libellé de passage déjà passé par `echapperHtml`, flèches du code), `ouvert`
    // (booléen), `items` (rangées déjà construites), `b` ×5 (`echapperAttribut(biblio)`), `colonne`
    // (« trimestre » ou « bibliotheque », du code), `compte` (un nombre). Tout nom reçu passe par
    // `echapperHtml` / `echapperAttribut` dans le composant. BREAK-TEST (25 oct.) : `echapperHtml(r.nom)` → `r.nom`
    // dans `_renderRangee` → le volet C ROUGIT.
    // ↻ 25 oct. 2026 (#1156) : bibliotheque-ui.js 40 → 23, à la BAISSE — la zone « Mes dossiers » (`genererZone`)
    // et la ligne-select des dossiers (`renderLigneDossierSelect`) sont retirées, sans lecteur depuis le lot 3 ;
    // productions-bibliotheque-ui.js 1 → 0, l'aperçu d'import réécrit (le nom passe par `echapperHtml`).
    // ↻ 25 oct. 2026 (#1157) : planification-bibliotheque.js 2 → 0, à la BAISSE — la fenêtre de la Carte passe des
    // données au composant en deux colonnes ; ses deux chaînes (`ligneCarteTrimestre`) sont parties.
    // ↻ 25 oct. 2026 (#1158) : tampons-bibliotheque.js 4 → 0, à la BAISSE — la fenêtre des tampons passe des
    // données au composant en deux colonnes ; ses chaînes (`htmlMesTampons`, `boutonsApres`) sont parties.
    const NUES = {
        'js/bibliotheque-ui.js': 19 /* #1159 (25 oct.) : −2, `renderCarteDisponible` (`classeItem`) et `creerModal` (`fermerAttr`) partis ; verdict du lot 6 : −2, `onclickToDataAttrs` (ses paramètres bruts) parti */, 'js/pratiques-gestion.js': 21, /* #1137 (22 oct.) : −5, passées par formaterPourcentage ; #1147 (24 oct.) : −3, la barre latérale et ses badges partis */ 'js/echelles.js': 19, /* #469 (12 oct. 2026) : −3, exporterEchelleActive partie ; #1147 : −2, la barre latérale */
        'js/grilles.js': 117 /* étape 4c du critère algorithmique (27 oct.) : +5, SANS désescape — « Tes calculs pour les phrases et les tables » (`_calculsPourLesPhrases`) pose des fragments construits par le code (`${pastilles}`, chaque texte passé par `esc` ; `${gestes}` ; `${items}`) et les attributs de cible `${datas}` ×3 (`esc(cible)` à leur construction, et l'index, un nombre) ; −1 : la valeur du menu « Selon » passe maintenant par `esc` (`${esc(s)}`), un identifiant de calcul s'y ajoutant aux six constantes ; le nom d'un calcul passe par `esc` · étape 4b du critère algorithmique (27 oct.) : +3, SANS désescape — l'étape « Note calculée » découpée en fonctions (`_carteCalculNote`, `_pastillesDuCalcul`, `_casZeroDuCalcul`, `_gestesCalculCompose`) pose leurs fragments (`${cartes.join('')}`, `${gestes}`, le composeur de `composeurCalcul.rendre`, qui échappe tout ce qu'il pose) et les attributs de cible `${datas}` des gestes « Retirer ce calcul » et de sa confirmation (`esc(cible)` à leur construction, et l'index, un nombre) ; le nom d'un calcul passe par `esc` · étape 4a du critère algorithmique (27 oct.) : +4, SANS désescape — l'étape « Note calculée » pose des fragments construits par le code (`${tete}`, `${reglages}`, `${pastilles}`, `${rangees}` ×2 : chaque texte y passe par `esc`), et les attributs de cible `${datas}` ×3 (`esc(cible)` à leur construction, et l'index, un nombre) ; les fragments d'avant (`${options}`, `${champsParams}`, `${handlerModele}`, `${handlerParam}`, `${datasCommunes}` ×2) sont partis avec le menu · lot 3b de la table de cas (26 oct.) : +25, SANS désescape — les tables de l'enseignant·e : l'identifiant d'une table (`${tid}`, ×11 : `esc(t.id)` à sa construction, et un identifiant que le registre n'admet que dans `[A-Za-z0-9_-]`), les attributs du geste (`${geste}`, ×10) et de la zone (`${zone}`), construits par `esc`, une valeur du menu (`${s}`, une des six constantes `SELONS`), les options et les rangées construites par le code (`${options}`, `${rangees}`) ; tout ce que l'enseignant·e écrit passe par `esc` · lot 3a de la table de cas (26 oct.) : +14, SANS désescape — même cas que #574 : la table des paliers pose des fragments construits par le code (`${tete}`, `${rangees}`, `${menuCollections}`, `${listeCollections}`, `${publicZone}`, `${revenir}`), ses noms de handlers (`${hPalier}`, `${hParam}`, `${actionRetrait}`), ses attributs d'identifiants échappés à leur construction (`${datas}`, `${paramsCible}`, `${retirer}`, `${commun}`) et le rang d'un palier (`${i}`, un nombre) ; tout ce que l'enseignant·e écrit passe par `esc` · étape 2b : −1, la rangée « Poser : » des paliers ; #1147 : −4, la barre latérale ; #1150 : −2, le miroir et les cartes du gabarit */, 'js/cartouches.js': 15 /* #1147 : −1 */, 'js/objectifs.js': 3 /* #1137 : −1 */, 'js/productions.js': 11 /* #1147 : −2, le surlignage de la barre latérale */,
        'js/productions-bibliotheque-ui.js': 0, 'js/tampons-bibliotheque.js': 0,
        'js/planification-bibliotheque.js': 0, 'js/travaux-outils.js': 89,
        'js/wizard-pratique-v2.js': 40, 'js/profil-etudiant-sections-affichage.js': 104, /* #1137 (22 oct.) : −6, passées par formaterPourcentage ; #1148 (24 oct.) : −4, les synthèses de la barre latérale partent ; lot 2 std sans portfolio (29 oct.) : −2, genererSectionCompletion retirée */ 'js/trimestre-v2-cours.js': 0
    };
    it('C.n les interpolations nues ne montent pas', () => {
        const G = /\$\{\s*([A-Za-z_$][\w$]*)\s*\}/g;
        const C = /'\s*\+\s*([A-Za-z_$][\w$]*)\s*\+\s*'/g;
        for (const f of FICHIERS) {
            let n = 0;
            readFileSync(path.join(racine, f), 'utf8').split('\n').forEach((l) => {
                if (/^\s*(\/\/|\*)/.test(l) || !/<\/?[a-zA-Z]|="/.test(l)) return;
                n += [...l.matchAll(G)].length + [...l.matchAll(C)].length;
            });
            expect(n, f).toBe(NUES[f]);
        }
    });

    it('C.0 le cliquet voit bien un site brut (témoin)', () => {
        const ligne = '<div class="x">${grille.nom}</div>';
        expect([...ligne.matchAll(GABARIT)].length).toBe(1);
        expect([...'<div>${echapperHtml(grille.nom)}</div>'.matchAll(GABARIT)].length).toBe(0);
    });
});

/* ------------- D — ce que l'application écrit elle-même n'est pas échappé (relecture de Cowork) */

// L'échappement vaut pour une donnée REÇUE. L'icône des outils et des formes est une
// balise <img> écrite par l'application (OUTILS) : échappée, le bouton afficherait son
// code. Défaut de la première version du lot, trouvé par la relecture de Cowork.
describe('#467 · D — la palette d\'annotation montre ses icônes, pas leur code', () => {
    class ImageStub { constructor() { this.src = ''; } addEventListener() {} removeEventListener() {} }

    function palette(reglages = {}) {
        const stock = new Map(Object.entries(reglages));
        const db = {
            ready: false,
            getSync: (k, d) => (stock.has(k) && stock.get(k) !== null ? JSON.parse(JSON.stringify(stock.get(k))) : d),
            setSync: (k, v) => { stock.set(k, v); },
            removeSync: (k) => { stock.delete(k); }
        };
        const { document } = conteneurs([]);
        const fenetre = { addEventListener: () => {}, removeEventListener: () => {} };
        const w = chargerScript('js/travaux-outils.js', { db, Image: ImageStub, document, echapperHtml }, fenetre);
        return w.travauxOutils;
    }

    it('D.a chaque bouton d\'outil et de forme porte une vraie balise <img>', () => {
        const html = palette().genererHTMLPalette();
        const boutons = html.match(/<button class="travaux-btn-outil[^"]*" data-outil="[^"]+"[\s\S]*?<\/button>/g) || [];
        expect(boutons.length, 'la palette rend bien ses boutons d\'outil').toBeGreaterThanOrEqual(10);
        for (const b of boutons) {
            expect(b, b.slice(0, 120)).not.toContain('&lt;img');
        }
        expect(html).toContain('<img src="');
    });
    // Le symbole personnel, lui, est saisi par l'usager : son icône reste échappée
    // (palette des tampons) ; le cliquet C relève `+ outil.icone +` s'il redevient brut.
});
