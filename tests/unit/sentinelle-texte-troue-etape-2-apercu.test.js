// SENTINELLE — LE TEXTE TROUÉ, ÉTAPE 2 · VOLET 3 : « CE QUE L'ÉLÈVE LIRA », L'APERÇU
// AU NIVEAU DU GABARIT (4 septembre 2026, arrêtés 4 et 5 du cadrage du 2 sept.).
//
//   A. les copies FICTIVES viennent des paliers (`copiesExemple`, registre réel en
//      Node) : une par palier, chacune ATTEINT son palier, plus une non corrigée ;
//      « Aucune projection » en a une quand même ; aucune donnée de personne ;
//   B. la CARTE « Ce que l'élève lira » : sous « Projection », avant les codes,
//      repliée par défaut (règle du 3 sept. : fermé ce qui porte les mots) ; une
//      entrée par copie ; la phrase = décompte du bloc 3 PUIS projection du bloc 2,
//      dans l'ordre d'evaluation-calcul.js ; la copie non corrigée n'a aucune phrase ;
//      la ligne dit ce qui n'est pas montré ;
//   C. une phrase COMPOSÉE (badges) se voit remplie pour la copie de son palier ;
//   D. rendu PUR : aucun handler, rien d'écrit dans la grille ni le stockage ;
//   E. les jetons anti-cache du volet ont bougé.
//
// BREAK-TESTS (faits le 4 septembre 2026, chacun restauré, `cmp` identique) :
//   · A — `precedent` jamais avancé (chaque copie au milieu de [0, seuil]) → A.a et A.c rougissent
//     (« très bien » tombe sur « excellent ») ;
//   · A — la copie non corrigée retirée → A.b rougit ;
//   · B — la projection concaténée AVANT le décompte → B.b rougit ;
//   · B — la carte ouverte par défaut → B.a rougit ;
//   · D — un `data-action` glissé dans l'aperçu → D.a rougit.

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

const carte = (html, section) => {
    const i = html.indexOf('data-pli="CR:' + section + '"');
    if (i < 0) return '';
    const suivant = html.indexOf('class="carte accordeon gabarit-algo-carte', i + 10);
    return html.slice(i, suivant < 0 ? undefined : suivant);
};
const copiesDe = (apercu) => apercu.split(/<div class="apercu-copie(?=[" ])/).slice(1);
const texteDe = (copie) => (copie.match(/<p class="apercu-copie-texte">([\s\S]*?)<\/p>/) || [])[1];
const desechapper = (t) => String(t).replace(/&#x27;|&#39;/g, '\'').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/* ============================================================ A — LES COPIES */

describe('texte troué 2 · A — les copies fictives viennent des paliers, et chacune atteint le sien', () => {
    const c = P.appliquerAuCritere({}, 'norme_externe', { nomServiceAide: 'Passerelle +' });

    it('A.a une copie par palier, mots = longueur de référence, et `calculer` la place sur CE palier', () => {
        const copies = P.copiesExemple(c);
        const corrigees = copies.filter((x) => x.corrigee);
        expect(corrigees.map((x) => x.cle)).toEqual(['sans_erreur', 'excellent', 'tres_bien', 'bien', 'risque', 'echec']);
        expect(corrigees.map((x) => x.erreurs)).toEqual([0, 5, 11, 14, 23, 45]);
        for (const x of corrigees) {
            expect(x.mots).toBe(900);
            const r = P.calculer(c, { erreurs: x.erreurs, mots: x.mots });
            expect(r.applicable, x.cle).toBe(true);
            expect(r.palier.cle, x.cle).toBe(x.cle);
        }
    });

    it('A.b la dernière copie est NON corrigée : ni erreurs ni mots, et la projection ne conclut pas', () => {
        const copies = P.copiesExemple(c);
        const derniere = copies[copies.length - 1];
        expect(derniere).toEqual({ cle: 'non_corrigee', libelle: '', erreurs: null, mots: null, corrigee: false });
        expect(copies.filter((x) => !x.corrigee).length).toBe(1);
        expect(P.calculer(c, { erreurs: derniere.erreurs, mots: derniere.mots }).applicable).toBe(false);
    });

    it('A.c une autre norme (600 mots, 20 erreurs) et des seuils déplacés : chaque copie atteint encore son palier', () => {
        const autre = P.appliquerAuCritere({}, 'norme_externe', { motsReference: 600, erreursTolerees: 20 }, [
            { cle: 'z', libelle: 'Zéro', sansErreur: true, ratioMax: null, texte: 'z' },
            { cle: 'ok', libelle: 'OK', ratioMax: 0.6, texte: 'ok' },
            { cle: 'limite', libelle: 'Limite', ratioMax: 1.2, texte: 'l' },
            { cle: 'non', libelle: 'Non', ratioMax: null, texte: 'n' }
        ]);
        const copies = P.copiesExemple(autre).filter((x) => x.corrigee);
        expect(copies.map((x) => x.cle)).toEqual(['z', 'ok', 'limite', 'non']);
        for (const x of copies) {
            expect(x.mots).toBe(600);
            expect(P.calculer(autre, { erreurs: x.erreurs, mots: x.mots }).palier.cle, x.cle).toBe(x.cle);
        }
    });

    it('A.d « Aucune projection » : une copie ordinaire quand même (pour le décompte), plus la non corrigée', () => {
        const copies = P.copiesExemple(P.appliquerAuCritere({}, 'aucune', {}));
        expect(copies.map((x) => x.cle)).toEqual(['exemple', 'non_corrigee']);
        expect(copies[0]).toEqual({ cle: 'exemple', libelle: '', erreurs: 3, mots: 300, corrigee: true });
    });

    it('A.e le registre ne lit toujours rien d\'autre que le critère — aucune donnée de personne', () => {
        const src = source('js/evaluation-projection.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect(src).not.toMatch(/\bdb\./);
        expect(src).not.toMatch(/evaluationEnCours/);
        expect(src).not.toMatch(/\bdocument\./);
    });
});

/* ============================================================ B — LA CARTE */

describe('texte troué 2 · B — la carte « Ce que l\'élève lira »', () => {
    const rendu = (grille) => {
        const m = monter([grille || GRILLE]);
        m.win.afficherCriteresGrille(JSON.parse(JSON.stringify(grille || GRILLE)));
        return Object.assign(m, { html: m.liste().innerHTML });
    };

    it('B.a sous « Projection », avant « Codes d\'annotation », repliée par défaut, avec son titre', () => {
        const { html } = rendu();
        const projection = html.indexOf('data-pli="CR:projection"');
        const apercu = html.indexOf('data-pli="CR:apercu"');
        const codes = html.indexOf('data-pli="CR:codes"');
        expect(apercu).toBeGreaterThan(projection);
        expect(apercu).toBeLessThan(codes);
        expect(html).toMatch(/<div class="carte accordeon gabarit-algo-carte ferme" data-pli="CR:apercu">/);
        expect(html).toMatch(/<span class="accordeon-chevron">▶<\/span> Ce que l(?:'|&#x27;|&#39;)élève lira/);
        // En création aussi (mode temp), sans la carte des codes.
        const { win, liste } = monter([]);
        win.tempCriteres = [{ ...ALGO, id: 'T' }];
        win.afficherCriteresTemp();
        expect(liste().innerHTML).toContain('data-pli="T:apercu"');
        expect(liste().innerHTML).not.toContain('data-pli="T:codes"');
    });

    it('B.b une entrée par copie ; la phrase = décompte du bloc 3 PUIS projection du bloc 2, exactement', () => {
        const { html } = rendu();
        const apercu = carte(html, 'apercu');
        const copies = copiesDe(apercu);
        expect(copies.length).toBe(7);   // six paliers + la non corrigée
        const attendues = P.copiesExemple(ALGO).filter((x) => x.corrigee);
        attendues.forEach((x, i) => {
            const decompte = E.enonce(ALGO, 'decompte', { erreurs: x.erreurs, mots: x.mots });
            const projection = P.calculer(ALGO, { erreurs: x.erreurs, mots: x.mots });
            const phrase = [decompte, projection.texte].filter(Boolean).join(' ');
            expect(desechapper(texteDe(copies[i])), x.cle).toBe(phrase);
            expect(copies[i]).toContain(`Copie ${i + 1} — ${x.erreurs} erreur${x.erreurs > 1 ? 's' : ''} pour ${x.mots} mots · palier « ${echapper(x.libelle)} »`);
        });
        // Le témoin du contenu : la copie « Risqué » lit bien le service réglé, après le décompte.
        expect(desechapper(texteDe(copies[4]))).toBe('Ta production contient 23 erreurs pour 900 mots. Tu fais en moyenne 1 erreur à chaque 39 mots. En prévision de l\'EUF, ce ratio est risqué parce qu\'il est près du seuil de l\'échec. Il est recommandé de t\'inscrire au Passerelle +.');
    });

    it('B.c la copie non corrigée n\'a AUCUNE phrase — comme l\'application, qui s\'arrête sans erreurs ni mots', () => {
        const { html } = rendu();
        const copies = copiesDe(carte(html, 'apercu'));
        expect(copies[6]).toContain('apercu-copie--non-corrigee');
        expect(copies[6]).toContain('Copie non corrigée — ni erreurs ni mots saisis');
        expect(desechapper(texteDe(copies[6]))).toBe('Aucune phrase : le décompte et la projection attendent la correction.');
    });

    it('B.d la ligne dit ce que l\'aperçu ne montre pas, et d\'où viennent les copies', () => {
        const { html } = rendu();
        const apercu = carte(html, 'apercu');
        expect(apercu).toContain('Copies fictives, calculées depuis tes paliers — aucune donnée d');
        expect(apercu).toContain('ne montre pas la rétroaction du sous-critère dominant');
    });

    it('B.e « Aucune projection » : le décompte seul, sur une copie, et la non corrigée', () => {
        const { html } = rendu({ ...GRILLE, criteres: [{ ...ALGO, modeleProjection: 'aucune', paramsProjection: {} }] });
        const copies = copiesDe(carte(html, 'apercu'));
        expect(copies.length).toBe(2);
        expect(desechapper(texteDe(copies[0]))).toBe('Ta production contient 3 erreurs pour 300 mots.');
        expect(copies[0]).not.toContain('palier «');
    });
});

/* ============================================================ C — COMPOSÉE */

describe('texte troué 2 · C — une phrase composée se voit remplie pour la copie de son palier', () => {
    it('C.a les badges de « Ce que l\'élève lit » et de la recommandation, remplis ; le préfixe engendré absent', () => {
        const paliers = P.paliersMigration().map((p) => (p.cle === 'risque'
            ? { ...p, texte: 'Palier {palier} : {projection} erreurs pour {longueur} mots, 1 erreur tous les {moyenne} mots.', texteAide: 'Va voir {service} — seuil {seuil}.' }
            : p));
        const critere = { ...ALGO, paliersProjection: paliers };
        const { win, liste } = monter([{ ...GRILLE, criteres: [critere] }]);
        win.afficherCriteresGrille({ ...GRILLE, criteres: [critere] });
        const copies = copiesDe(carte(liste().innerHTML, 'apercu'));
        expect(desechapper(texteDe(copies[4]))).toBe('Ta production contient 23 erreurs pour 900 mots. Palier Risqué : 23 erreurs pour 900 mots, 1 erreur tous les 39 mots. Va voir Passerelle + — seuil 30.');
        // Les autres paliers, non composés, gardent le préfixe d'hier.
        expect(desechapper(texteDe(copies[1]))).toContain('Tu fais en moyenne 1 erreur à chaque 180 mots. En prévision de l\'EUF, ce ratio est excellent.');
    });

    it('C.b l\'aperçu suit le gabarit : changer la longueur de référence change les copies ET les phrases', () => {
        const critere = { ...ALGO, paramsProjection: { motsReference: 600, erreursTolerees: 30, nomServiceAide: '' } };
        const { win, liste } = monter([{ ...GRILLE, criteres: [critere] }]);
        win.afficherCriteresGrille({ ...GRILLE, criteres: [critere] });
        const copies = copiesDe(carte(liste().innerHTML, 'apercu'));
        expect(copies[4]).toContain('Copie 5 — 23 erreurs pour 600 mots · palier « Risqué »');
        expect(desechapper(texteDe(copies[4]))).toBe('Ta production contient 23 erreurs pour 600 mots. Tu fais en moyenne 1 erreur à chaque 26 mots. En prévision de l\'EUF, ce ratio est risqué parce qu\'il est près du seuil de l\'échec.');
    });
});

/* ============================================================ D — RENDU PUR */

describe('texte troué 2 · D — rendu pur : aucun contrôle, rien d\'écrit', () => {
    it('D.a l\'aperçu ne porte ni handler ni action, et le rendu n\'écrit ni dans la grille ni dans le stockage', () => {
        // ⚠ Mesuré : au CHARGEMENT de grilles.js (pas au rendu), `migrerCategoriesVersSousCriteres`
        // fait un `db.modifier` sur la clé des grilles — hors de ce lot. On remet le compteur à
        // zéro après le montage : ce qui compte ici, c'est ce que le RENDU écrit.
        const m = monter([GRILLE]);
        m.ecrits.length = 0;
        const avant = JSON.stringify(m.store[CLE]);
        const copie = JSON.parse(JSON.stringify(GRILLE));
        m.win.afficherCriteresGrille(copie);
        const apercu = carte(m.liste().innerHTML, 'apercu');
        expect(apercu.length).toBeGreaterThan(500);
        expect(apercu).not.toMatch(/data-action=|data-on-change=|<textarea|<input|<select|<button/);
        expect(JSON.stringify(m.store[CLE])).toBe(avant);
        expect(copie).toEqual(GRILLE);
        expect(m.ecrits, 'écritures pendant le rendu en édition').toEqual([]);
        // En CRÉATION : AUCUNE écriture non plus, et rien n'est matérialisé sur le critère.
        const t = monter([]);
        t.ecrits.length = 0;
        t.win.tempCriteres = [{ ...ALGO, id: 'T' }];
        t.win.afficherCriteresTemp();
        expect(t.liste().innerHTML).toContain('data-pli="T:apercu"');
        expect(t.ecrits).toEqual([]);
        expect(t.win.tempCriteres[0].paliersProjection).toBeUndefined();
    });

    it('D.b tout ce qui vient de la grille est échappé dans l\'aperçu', () => {
        const critere = { ...ALGO, paliersProjection: [{ cle: 'x', libelle: 'A <b>gras</b>', ratioMax: null, texte: 'Texte <i>libre</i> "cité".', texteAide: '' }] };
        const { win, liste } = monter([{ ...GRILLE, criteres: [critere] }]);
        win.afficherCriteresGrille({ ...GRILLE, criteres: [critere] });
        const apercu = carte(liste().innerHTML, 'apercu');
        expect(apercu).not.toContain('<b>gras</b>');
        expect(apercu).not.toContain('<i>libre</i>');
        expect(apercu).toContain('&lt;b&gt;gras&lt;/b&gt;');
        expect(apercu).toContain('&lt;i&gt;libre&lt;/i&gt; &quot;cité&quot;.');
    });
});

/* ============================================================ E — ANTI-CACHE */

describe('texte troué 2 · E — les jetons anti-cache du volet 3 ont bougé', () => {
    it('E.a grilles.js, evaluation-projection.js et styles.css', () => {
        const html = source('index.html');
        expect(html).toMatch(/js\/grilles\.js\?v=20260904[j-z]|js\/grilles\.js\?v=2026090[5-9]|js\/grilles\.js\?v=20261/);
        expect(html).toMatch(/js\/evaluation-projection\.js\?v=20260904[e-z]|js\/evaluation-projection\.js\?v=2026090[5-9]|js\/evaluation-projection\.js\?v=20261/);
        expect(html).toMatch(/styles\.css\?v=20260904[g-z]|styles\.css\?v=2026090[5-9]|styles\.css\?v=20261/);
    });
});
