// SENTINELLE — LA CARTE « BILAN » (cadrage du 5 septembre 2026, décisions de Grégoire à 7 h 55
// et 11 h 41 ; livrée en 1.120 — `plans de travail/CADRAGE-2026-09-05-carte-bilan.md`).
//
// Depuis 1.118, la carte « Observation » du gabarit algorithmique portait le menu du modèle et
// trois énoncés. Deux vont dans le BILAN de l'élève (« Défi prioritaire », « Quand tout est
// maîtrisé ») ; le troisième, « Aucune annotation », ne s'affiche qu'à l'enseignant·e, dans le
// panneau de correction, quand la copie ne porte ni tampon ni erreur. Le titre ne désignait rien
// que quelqu'un voit à l'écran ; la carte mélangeait deux publics. Ce qui est arrêté :
//   1. la carte s'appelle « Bilan » — le mot que l'élève et l'enseignant·e voient déjà ;
//   2. elle ne contient que ce qui va dans le bilan : `priorite`, `concentre` ;
//   3. « Aucune annotation » déménage sous la case « Utiliser ces sous-critères comme codes
//      d'annotation », dans la liste « Sous-critères », sous un pli fermé « Quand la copie ne
//      porte aucun code » — grille enregistrée seulement, comme la case (réserve nommée) ;
//   4. le menu se lit « Modèle des phrases (bilan et décompte) », avec une ligne d'aide ;
//   5. le modèle « Français écrit (formulations d'origine) » devient « Français écrit », avec
//      une description neuve — le « #581 » lu par les collègues part.
// UN RENDU QUI BOUGE, AUCUNE DONNÉE : mêmes clés `enonces.*`, même `modeleEnonces`, mêmes
// handlers ; l'identifiant `discipline_francais` et le défaut `_nomDitFrancais` ne changent pas.
//
//   A. la carte « Bilan » : son titre, sa clé de pli, ses DEUX énoncés dans l'ordre — en édition
//      comme en création ; ni `aucune` ni `decompte` dedans ;
//   B. « Aucune annotation » : rendue UNE fois dans tout le gabarit, sous la case des codes, sous
//      un pli fermé, même zone qu'avant ; absente en création ; le pli vit en mémoire ; échappée ;
//   C. le menu et sa ligne d'aide ; la ligne « Texte de départ » suit ; les classes sont scopées ;
//   D. le modèle « Français écrit » : le nom sans parenthèse, la description au caractère et sans
//      `#`, l'identifiant et le défaut inchangés, la phrase d'hier inchangée ;
//   E. rien n'est écrit ; les jetons anti-cache ont bougé.
//
// BREAK-TESTS (faits le 5 septembre 2026, 12 h 20 ; source mutée, Vitest, remise, empreinte sha256
// identique avant/après ; commande : `cd tests && npx vitest run --reporter=verbose
// unit/sentinelle-carte-bilan.test.js unit/sentinelle-texte-troue-etape-2-une-seule-carte.test.js
// unit/sentinelle-lot4-C-gabarit-algo-range.test.js` — 57 tests, tous verts sans mutation) :
//   · `aucune` réintroduit dans « Bilan » (filtre du décompte seul) → 13 rouges : ici A.a, A.b, A.c,
//     B.a, B.b, B.c, B.d, B.f, E.a ; « une seule carte » A.a, A.b, B.b, E.a ;
//   · le pli retiré de la liste des sous-critères → 7 rouges : ici B.a, B.b, B.c, B.e, B.f, E.a ;
//     « une seule carte » A.a ;
//   · le nom du modèle remis avec sa parenthèse → 2 rouges : D.a, D.c ;
//   · le titre « Observation » remis sur la carte → 5 rouges : ici A.a, A.b, A.c ; « une seule
//     carte » C.a ; lot 4 C B.c ;
//   · l'étiquette du menu remise à « Modèle d'observation » → 3 rouges : ici C.a ; « une seule
//     carte » C.b ; lot 4 C B.a.
// Une sentinelle qui n'a jamais rougi n'a rien prouvé.

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const require = createRequire(import.meta.url);

const E = require(path.join(racine, 'js/evaluation-enonces.js'));
const P = require(path.join(racine, 'js/evaluation-projection.js'));

/* ------------------------------------------------------------------ harnais */

const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function fauxElement() {
    return {
        value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        querySelectorAll: () => [], querySelector: () => null,
        addEventListener() {}, appendChild() {}, setAttribute() {}, focus() {}
    };
}

function fauxDocument() {
    const elements = {};
    return {
        _elements: elements, activeElement: null,
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: () => null, querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {} },
        createElement: () => fauxElement(),
        addEventListener() {}, removeEventListener() {}
    };
}

const CLE = 'a2026_grillesTemplates';

function monter(grilles) {
    const store = { [CLE]: JSON.parse(JSON.stringify(grilles)) };
    const ecrits = [];
    const db = {
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { ecrits.push(k); store[k] = v; },
        setSync: (k, v) => { ecrits.push(k); store[k] = v; },
        modifier: async (k, mutateur, defaut) => {
            ecrits.push(k);
            const valeur = (k in store ? store[k] : defaut);
            const resultat = await mutateur(valeur);
            if (resultat === undefined) return undefined;
            store[k] = resultat;
            return resultat;
        }
    };
    const document = fauxDocument();
    const globaux = {
        db, document,
        cle: (k) => 'a2026_' + k,
        echapperHtml: echapper,
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8),
        alert() {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null,
                          filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc',
        grilleTemplateActuelle: null
    };
    const win = chargerScript('js/ui-blocs.js', globaux);
    chargerScript('js/grilles.js', globaux, win);
    win.formulesAlgo = require(path.join(racine, 'js/evaluation-formules.js'));
    win.enoncesAlgo = E;
    win.projectionAlgo = P;
    win.codesAnnotation = require(path.join(racine, 'js/codes-annotation.js'));
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    return { win, store, document, ecrits, liste: () => document.getElementById('listeCriteres') };
}

const ALGO = { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe',
               paramsProjection: { nomServiceAide: 'Passerelle +' } };
const GRILLE = { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [ALGO] };
const COCHEE = { ...GRILLE, criteres: [{ ...ALGO, codesDepuisSousCriteres: true, sousCriteres: [
    { id: 'sc_0', code: '0', nom: 'Aucune erreur', ponderation: 0, retroaction: '' },
    { id: 'sc_1', code: '1', nom: 'Thèse non dégagée', ponderation: 1, retroaction: 'La thèse doit être explicite.' }
] }] };

/** Une carte du gabarit, de son `data-pli` jusqu'à la carte suivante. */
const carte = (html, id, section) => {
    const i = html.indexOf('data-pli="' + id + ':' + section + '"');
    if (i < 0) return '';
    const suivant = html.indexOf('class="carte accordeon gabarit-algo-carte', i + 10);
    return html.slice(i, suivant < 0 ? undefined : suivant);
};
/** Le bloc des sous-critères : de son conteneur à la première carte. */
const blocSousCriteres = (html) => {
    const i = html.indexOf('sous-criteres-conteneur--en-tete');
    if (i < 0) return '';
    const fin = html.indexOf('class="carte accordeon gabarit-algo-carte', i);
    return html.slice(i, fin < 0 ? undefined : fin);
};
/** Le pli « Aucune annotation » : de son `data-pli` à la fin de son contenu (la liste, ou la carte suivante). */
const pliAucune = (html, id) => {
    const i = html.indexOf('data-pli="' + (id || 'CR') + ':aucune"');
    if (i < 0) return '';
    const debut = html.lastIndexOf('<div class="carte accordeon', i);
    const candidats = [html.indexOf('class="sous-criteres-liste-conteneur"', i), html.indexOf('class="sous-criteres-vide-message"', i), html.indexOf('class="carte accordeon gabarit-algo-carte', i)].filter((x) => x > 0);
    return html.slice(debut, candidats.length ? Math.min(...candidats) : undefined);
};
const compter = (h, motif) => (h.split(motif).length - 1);
const clesDe = (h) => [...h.matchAll(/data-enonce-cle="([a-z]+)"/g)].map((m) => m[1]);
const boutons = (bloc) => [...bloc.matchAll(/<button type="button" class="repere-enonce repere-enonce--(posee|remplie)"\s+data-action="insererRepereEnonce" data-jeton="([^"]+)"[^>]*>([^<]*)<\/button>/g)]
    .map((m) => ({ famille: m[1], jeton: m[2], texte: m[3] }));
const titre = (t) => new RegExp('<span class="accordeon-chevron">[▶▼]</span> ' + t.replace(/'/g, "(?:'|&#x27;|&#39;)") + '\\s*<');

function rendu(grille) {
    const m = monter([grille || GRILLE]);
    m.win.afficherCriteresGrille(JSON.parse(JSON.stringify(grille || GRILLE)));
    const html = m.liste().innerHTML;
    return Object.assign(m, { html, bilan: carte(html, 'CR', 'commentaire'), projection: carte(html, 'CR', 'projection'), sousCriteres: blocSousCriteres(html) });
}
function renduTemp(critere) {
    const m = monter([]);
    m.ecrits.length = 0;
    m.win.tempCriteres = [{ ...ALGO, ...(critere || {}), id: 'T' }];
    m.win.afficherCriteresTemp();
    const html = m.liste().innerHTML;
    return Object.assign(m, { html, bilan: carte(html, 'T', 'commentaire'), projection: carte(html, 'T', 'projection') });
}

const REGISTRE = Object.fromEntries(E.listerCles().map((c) => [c.cle, c]));

/* ====================================================== A — LA CARTE « BILAN » */

describe('carte « Bilan » · A — le titre, la clé de pli, DEUX énoncés : ce que l\'élève lit dans son bilan', () => {
    it('A.a en ÉDITION : « Bilan » (clé `commentaire`, repliée), le menu puis « Défi prioritaire » et « Quand tout est maîtrisé » ; ni « Aucune annotation » ni le décompte', () => {
        const { html, bilan } = rendu();
        expect(bilan.length).toBeGreaterThan(0);
        expect(html).toMatch(titre('Bilan'));
        expect(html).toContain('class="carte accordeon gabarit-algo-carte ferme" data-pli="CR:commentaire"');
        expect(clesDe(bilan)).toEqual(['priorite', 'concentre']);
        expect(bilan).toContain('>' + REGISTRE.priorite.libelle + '</label>');
        expect(bilan).toContain('>' + REGISTRE.concentre.libelle + '</label>');
        expect(bilan.indexOf('<select')).toBeLessThan(bilan.indexOf('data-enonce-cle="priorite"'));
        expect(bilan).not.toContain('data-enonce-cle="aucune"');
        expect(bilan).not.toContain('Aucune annotation');
        expect(bilan).not.toContain('Quand la copie ne porte aucun code');
        expect(bilan).not.toContain('data-enonce-cle="decompte"');
        // Témoin : la zone est celle d'avant — même handler, même grille, même index, même clé.
        expect(bilan).toMatch(/<textarea class="controle-form" rows="2"\s+data-on-change="modifierTexteEnonceGrilleHandler" data-grille-id="G1" data-critere-index="0" data-enonce-cle="priorite"/);
    });

    it('A.b en CRÉATION (mode temp) : la même carte, par le handler temp — « Aucune annotation » sous les sous-critères, comme en édition (#1131)', () => {
        const { html, bilan } = renduTemp();
        expect(html).toMatch(titre('Bilan'));
        expect(clesDe(bilan)).toEqual(['priorite', 'concentre']);
        expect(bilan).toMatch(/<textarea[^>]*data-on-change="modifierTexteEnonceTempHandler" data-critere-index="0" data-enonce-cle="concentre"/);
        // ↻ 21 oct. 2026 (#1131) : les sous-critères existent en création ; « Aucune annotation » les suit, hors du « Bilan ».
        expect(clesDe(html)).toEqual(['aucune', 'priorite', 'concentre', 'decompte']);
        expect(html).toMatch(/<textarea[^>]*data-on-change="modifierTexteEnonceTempHandler" data-critere-index="0" data-enonce-cle="aucune"/);
    });

    it('A.c dans le code : la carte se titre « Bilan », plus « Observation » ; « Bilan » filtre le décompte ET « aucune »', () => {
        const src = source('js/grilles.js');
        expect(src).toMatch(/carteGabaritAlgo\(critere, ctx, 'commentaire', 'Bilan', rendreBlocEnoncesAlgo\(critere, ctx\), true\)/);
        expect(src).not.toMatch(/carteGabaritAlgo\(critere, ctx, 'commentaire', 'Observation'/);
        expect((src.match(/listerCles\(\)\.filter\(\(c\) => c\.cle !== 'decompte' && c\.cle !== 'aucune'\)/g) || []).length).toBe(1);
    });
});

/* ============================================ B — « AUCUNE ANNOTATION », SOUS LA CASE DES CODES */

describe('carte « Bilan » · B — « Aucune annotation » vit sous la case des codes, sous un pli fermé, une fois', () => {
    it('B.a en ÉDITION, case décochée : UNE zone `aucune` dans tout le gabarit, dans la liste des sous-critères, après la case et avant les cartes, sous le pli « Quand la copie ne porte aucun code »', () => {
        const { html, sousCriteres } = rendu();
        expect(compter(html, 'data-enonce-cle="aucune"')).toBe(1);
        expect(compter(sousCriteres, 'data-enonce-cle="aucune"')).toBe(1);
        const pli = pliAucune(html);
        expect(pli.length).toBeGreaterThan(0);
        expect(pli).toContain('<div class="carte accordeon sous-critere-pli sous-critere-pli--aucune ferme" data-pli="CR:aucune">');
        expect(pli).toContain('<span class="accordeon-chevron">▶</span> Quand la copie ne porte aucun code</h3>');
        expect(pli).not.toMatch(/sous-critere-pli--aucune[^>]*\sid=/);
        // Après la case (son handler), avant la première carte ; la case est décochée et la phrase est là quand même.
        expect(html.indexOf('data-on-change="modifierCodesDepuisSousCriteresHandler"')).toBeLessThan(html.indexOf('data-pli="CR:aucune"'));
        expect(html.indexOf('data-pli="CR:aucune"')).toBeLessThan(html.indexOf('data-pli="CR:formule"'));
        expect(html).not.toContain('sous-criteres-codes--actif');
        // La zone est celle d'avant : même handler, même grille, même index, même clé, même valeur, même étiquette, même aide.
        expect(pli).toMatch(/<textarea class="controle-form" rows="2"\s+data-on-change="modifierTexteEnonceGrilleHandler" data-grille-id="G1" data-critere-index="0" data-enonce-cle="aucune"/);
        expect(pli).toContain('>' + echapper(E.normaliser(ALGO).enonces.aucune) + '</textarea>');
        expect(pli).toContain('>' + REGISTRE.aucune.libelle + '</label>');
        expect(pli).toContain(echapper(REGISTRE.aucune.aide));
        // Sa palette : {critere} seul — jamais {erreurs}, qui y vaudrait toujours vide (le cas qui a fait trancher Grégoire le 3 sept.).
        expect(boutons(pli).map((b) => [b.jeton, b.famille, b.texte])).toEqual([['{critere}', 'posee', 'critere']]);
        expect(pli.indexOf('class="reperes-enonce"')).toBeLessThan(pli.indexOf('<textarea'));
    });

    it('B.b case cochée, avec des sous-critères : toujours UNE zone `aucune`, avant les rangées ; les plis « Observation » des rangées sont intacts', () => {
        const { html, bilan } = rendu(COCHEE);
        expect(compter(html, 'data-enonce-cle="aucune"')).toBe(1);
        expect(html).toContain('sous-criteres-codes--actif');
        expect(html.indexOf('data-pli="CR:aucune"')).toBeLessThan(html.indexOf('class="sous-critere-item avec-outils"'));
        expect(compter(html, 'data-champ="retroaction"')).toBe(2);
        expect(html).toContain('class="carte accordeon sous-critere-pli ferme" data-pli="CR:sc:sc_1"');
        expect(bilan).not.toContain('data-enonce-cle="aucune"');
    });

    it('B.c sans sous-critère : la case est là, inactive, et la phrase sous son pli aussi', () => {
        const G = { id: 'G5', criteres: [{ id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20 }] };
        const { html } = rendu(G);
        expect(html).toMatch(/data-on-change="modifierCodesDepuisSousCriteresHandler"[^>]*\sdisabled/);
        expect(compter(html, 'data-enonce-cle="aucune"')).toBe(1);
        expect(html.indexOf('data-pli="CR:aucune"')).toBeLessThan(html.indexOf('class="sous-criteres-vide-message"'));
    });

    it('B.d en CRÉATION (↻ #1131, 21 oct. 2026) : la case et la phrase, comme en édition — une zone `aucune`, un pli, la cible `temp`', () => {
        const { html } = renduTemp();
        expect(compter(html, 'data-enonce-cle="aucune"')).toBe(1);
        expect(html).toContain('Quand la copie ne porte aucun code');
        expect(html).toMatch(/data-on-change="modifierCodesDepuisSousCriteresHandler" data-grille-id="temp" data-critere-index="0"/);
        expect(html).not.toContain('Les sous-critères se définissent une fois la grille enregistrée.');
    });

    it('B.e le pli vit en mémoire : déplié par l\'enseignant·e, il reste déplié au redessin qui suit une frappe ; rien n\'entre dans la grille', () => {
        const m = monter([GRILLE]);
        m.win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const avant = JSON.stringify(m.store[CLE]);
        m.liste().querySelectorAll = (sel) => sel === '.carte.accordeon[data-pli]'
            ? [{ dataset: { pli: 'CR:aucune' }, classList: { contains: () => false } }]
            : [];
        m.win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = m.liste().innerHTML;
        expect(html).toContain('<div class="carte accordeon sous-critere-pli sous-critere-pli--aucune" data-pli="CR:aucune">');
        expect(html).toContain('<span class="accordeon-chevron">▼</span> Quand la copie ne porte aucun code</h3>');
        expect(html).toContain('class="carte accordeon gabarit-algo-carte ferme" data-pli="CR:commentaire"');
        expect(JSON.stringify(m.store[CLE])).toBe(avant);
        expect(avant).not.toMatch(/"pli|plisGabarit|data-pli|aucune"/);
    });

    it('B.f une phrase écrite par l\'enseignant·e se relit sous le pli, échappée, et nulle part ailleurs', () => {
        const ecrit = 'Rien <b>à</b> signaler sur "{critere}".';
        const { html, bilan } = rendu({ ...GRILLE, criteres: [{ ...ALGO, enonces: { aucune: ecrit } }] });
        expect(pliAucune(html)).toContain('>' + echapper(ecrit) + '</textarea>');
        expect(html).not.toContain('<b>à</b>');
        expect(compter(html, echapper(ecrit))).toBe(1);
        expect(bilan).not.toContain('Rien ');
    });
});

/* ============================================================ C — LE MENU ET SES LIGNES */

describe('carte « Bilan » · C — « Modèle des phrases (bilan et décompte) », sa ligne d\'aide, la ligne « Texte de départ », les classes scopées', () => {
    const AIDE = 'Fournit le texte de départ des deux phrases du bilan et du décompte de la carte « Ce que l\'élève lit ».';

    it('C.a le menu est dans « Bilan », étiqueté au mot ; la ligne d\'aide suit le menu et précède la description du modèle ; « Modèle d\'observation » n\'existe plus', () => {
        const { bilan, projection } = rendu();
        expect(bilan).toContain('>Modèle des phrases (bilan et décompte)</label>');
        expect(bilan).toContain('<small class="modele-phrases-aide">' + AIDE + '</small>');
        expect(compter(bilan, 'modele-phrases-aide')).toBe(1);
        const select = bilan.indexOf('</select>');
        const aide = bilan.indexOf('modele-phrases-aide');
        const description = bilan.indexOf(echapper(E.obtenirModele('generique').description));
        expect(select).toBeGreaterThan(-1);
        expect(select).toBeLessThan(aide);
        expect(aide).toBeLessThan(description);
        expect(bilan).toContain('data-on-change="modifierModeleEnoncesGrilleHandler"');
        expect(projection).not.toContain('modele-phrases-aide');
        expect(source('js/grilles.js')).not.toContain('Modèle d\'observation');
        expect(bilan).not.toContain('Modèle d\'observation');
    });

    it('C.b la ligne sous le décompte dit d\'où vient le texte de départ : le modèle des phrases, carte « Bilan »', () => {
        const { projection } = rendu();
        expect(compter(projection, 'decompte-texte-depart')).toBe(1);
        expect(projection).toContain('Texte de départ : le modèle des phrases, carte « Bilan ».');
        expect(projection).not.toContain('carte « Observation »');
    });

    it('C.c les classes vivent dans styles.css, scopées à l\'éditeur ; le pli neuf ne porte aucun style inline', () => {
        const css = source('styles.css');
        expect(css).toMatch(/#listeCriteres \.sous-critere-pli--aucune \{[^}]*margin: 0 0 12px/);
        expect(css).toMatch(/#listeCriteres \.modele-phrases-aide \{[^}]*color: var\(--gris-clair\)/);
        expect(css).toMatch(/#listeCriteres \.sous-critere-pli \.accordeon-header \{[^}]*min-height: 44px/);
        const { html } = rendu();
        const pli = pliAucune(html);
        const enveloppe = pli.slice(0, pli.indexOf('<div class="accordeon-contenu">'));
        expect(enveloppe).not.toContain('style=');
        expect(enveloppe).not.toMatch(/\son[a-z]+=/);
    });
});

/* ============================================================ D — LE MODÈLE « FRANÇAIS ÉCRIT » */

describe('carte « Bilan » · D — le modèle « Français écrit » : le nom sans parenthèse, la description au caractère, l\'identifiant et le défaut inchangés', () => {
    const DESCRIPTION = 'Les phrases parlent du français écrit (« erreurs de français », « la qualité du français »). Pour un critère d\'une autre discipline, choisis « Générique », qui nomme le critère tel qu\'il est écrit dans la grille.';

    it('D.a `listerModeles()` : deux modèles, les mêmes ids ; « Français écrit » au mot, sa description au caractère, aucun `#` nulle part', () => {
        const modeles = E.listerModeles();
        expect(modeles.map((m) => m.id)).toEqual(['generique', 'discipline_francais']);
        const fr = modeles.find((m) => m.id === 'discipline_francais');
        expect(fr.nom).toBe('Français écrit');
        expect(fr.nom).not.toContain('(');
        expect(fr.description).toBe(DESCRIPTION);
        modeles.forEach((m) => {
            expect(m.description, m.id).not.toContain('#');
            expect(m.nom, m.id).not.toContain('#');
            expect(m.description, m.id).not.toMatch(/formulations d.origine|d.avant/);
        });
        // Dans le fichier : le bloc des modèles ne porte ni numéro de fiche ni « formulations ».
        const src = source('js/evaluation-enonces.js');
        const bloc = src.slice(src.indexOf('var MODELES = ['), src.indexOf('var MODELE_PAR_DEFAUT'));
        expect(bloc.length).toBeGreaterThan(100);
        expect(bloc).not.toContain('#');
        expect(bloc).not.toContain('formulations');
        expect(bloc).toContain("nom: 'Français écrit',");
    });

    it('D.b le défaut n\'a pas bougé : un critère qui dit « français » prend `discipline_francais`, les autres le générique ; la phrase d\'hier sort au caractère', () => {
        expect(E.normaliser({ nom: 'Français écrit', type: 'algorithmique' }).modeleId).toBe('discipline_francais');
        expect(E.normaliser({ nom: 'Maîtrise de la langue française', type: 'algorithmique' }).modeleId).toBe('discipline_francais');
        expect(E.normaliser({ nom: 'Précision des calculs', type: 'algorithmique' }).modeleId).toBe('generique');
        expect(E.normaliser({ nom: 'Précision des calculs', type: 'algorithmique', modeleEnonces: 'discipline_francais' }).modeleId).toBe('discipline_francais');
        expect(E.enonce({ nom: 'Français écrit', type: 'algorithmique' }, 'aucune', {})).toBe('Aucun tampon ni erreur de français annotés.');
        expect(E.MODELE_PAR_DEFAUT).toBe('generique');
    });

    it('D.c le gabarit offre le nom neuf au menu, l\'id inchangé comme valeur ; « formulations » n\'apparaît plus à l\'écran', () => {
        const { html, bilan } = rendu({ ...GRILLE, criteres: [{ ...ALGO, nom: 'Français écrit' }] });
        expect(bilan).toContain('<option value="discipline_francais" selected>Français écrit</option>');
        expect(bilan).toContain(echapper(DESCRIPTION));
        expect(html).not.toContain('formulations');
        expect(html).not.toContain('#581');
    });
});

/* ============================================================ E — RIEN N'EST ÉCRIT, LES JETONS */

describe('carte « Bilan » · E — le rendu n\'écrit rien ; les jetons anti-cache ont bougé', () => {
    it('E.a en édition comme en création, ni la grille ni le stockage ne bougent, et `enonces` n\'est pas semé', () => {
        const m = monter([GRILLE]);
        m.ecrits.length = 0;
        const avant = JSON.stringify(m.store[CLE]);
        const copie = JSON.parse(JSON.stringify(GRILLE));
        m.win.afficherCriteresGrille(copie);
        expect(compter(m.liste().innerHTML, 'data-enonce-cle="aucune"')).toBe(1);
        expect(JSON.stringify(m.store[CLE])).toBe(avant);
        expect(copie).toEqual(GRILLE);
        expect(m.ecrits).toEqual([]);
        const t = renduTemp();
        expect(t.ecrits).toEqual([]);
        expect(t.win.tempCriteres[0].enonces).toBeUndefined();
    });

    it('E.b grilles.js, evaluation-enonces.js et styles.css portent un jeton postérieur à 1.119', () => {
        const html = source('index.html');
        expect(html).toMatch(/js\/grilles\.js\?v=20260905[f-z]|js\/grilles\.js\?v=2026090[6-9]|js\/grilles\.js\?v=202609[1-3]|js\/grilles\.js\?v=20261/);
        expect(html).toMatch(/js\/evaluation-enonces\.js\?v=20260905[b-z]|js\/evaluation-enonces\.js\?v=2026090[6-9]|js\/evaluation-enonces\.js\?v=202609[1-3]|js\/evaluation-enonces\.js\?v=20261/);
        expect(html).toMatch(/styles\.css\?v=20260905[g-z]|styles\.css\?v=2026090[6-9]|styles\.css\?v=202609[1-3]|styles\.css\?v=20261/);
    });
});
