/**
 * LE CRITÈRE ALGORITHMIQUE, LOT DE MOTS (21 oct. 2026) — l'aide dit vrai pour toute discipline, et la liste du
 * français écrit est celle de Grégoire.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-21-critere-algorithmique-mots.md ; textes réglés par Grégoire
 * (9 h 51), ajustés par Cowork (9 h 58) : plans de travail/TEXTES-2026-10-21-critere-algorithmique.md.
 *
 * Ce que ce banc verrouille :
 *   T — chaque texte A1 à F1 à son site, par sa chaîne exacte (et chaque chaîne est bien celle du fichier réglé,
 *       apostrophes ramenées à une seule forme : la convention de chaque site décide de la sienne) ;
 *   L — « Partir de la liste du français écrit (codes 1 à 10) » crée dix sous-critères, codes 1 à 10, identiques
 *       à ceux du critère « Français écrit » de la grille démo « Grille-5 FR-ALGO-20 H26 », hors code 0 ;
 *   X — aucune des chaînes parties dans `js/` ni dans la section 5c d'`index.html`.
 *   G — LOT DE MOTS 2 (consigne …-critere-algorithmique-mots-2.md, textes tranchés par Cowork à 10 h 25) : le
 *       lexique « Sous-critères (critère algorithmique) », les deux textes du gabarit, à leur site ; et, au banc X,
 *       ce qui en part (« pondération différenciée », « ponctuation = 0.5 », « de la rédaction », l'Astuce).
 *
 * Break-tests (faits le 21 oct.) : voir la demande de relecture. Grilles et textes FICTIFS.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const plat = (s) => String(s).replace(/\s+/g, ' ').trim();
const apostrophes = (s) => s.replace(/’/g, "'");
// ↻ 22 oct. 2026 (étape 2a) : B1, C2, D3, D4b, D6, D7 et G3 changent avec les deux noms et la parenthèse
// « (5 après pondération) » ; leurs nouveaux textes, provisoires, sont dans le fichier du 22 oct.
const REGLES = apostrophes(lire('plans de travail/TEXTES-2026-10-21-critere-algorithmique.md')
    + '\n' + lire('plans de travail/TEXTES-2026-10-22-noms-critere-algorithmique.md')
    + '\n' + lire('plans de travail/TEXTES-2026-10-26-calculs-tout-faits.md')   // étape 4a : les trois calculs tout faits
    // ↻ #1152, lot 2b (27 oct. 2026) : D0, D2, D2d, D2e, D7, D7a, D7b et D8 de l'entrée de l'Aide, proposés, à valider par Grégoire.
    + '\n' + lire('plans de travail/TEXTES-2026-10-27-aide-critere-algorithmique.md'));

/* ======================================================= T — LES TEXTES À LEURS SITES */

const A1 = 'La méthode d’évaluation d’un critère dans une grille. Trois types sont disponibles : holistique (tu attribues un niveau de l’échelle de performance), analytique (tu attribues des points, que son barème décrit) et algorithmique (une formule calcule la note à partir de ce que tu comptes sur la copie).';
const A2 = 'Algorithmique : une formule calcule la note à partir de ce que tu comptes sur la copie.';
const A3 = 'Méthode d’évaluation du critère : holistique (tu attribues un niveau de l’échelle), analytique (tu attribues des points, que son barème décrit) ou algorithmique (une formule calcule la note à partir de ce que tu comptes).';
const B1 = 'La note de ce critère se calcule par une formule. Le champ de ce que tu comptes se remplit avec les codes que tu poses dans Annoter, ou se tape ; celui de ce à quoi tu le rapportes se tape. Les deux portent les noms que tu as donnés au critère dans la grille. La rétroaction se compose avec les phrases écrites dans la grille.';
const B2 = 'Le niveau de chaque évaluation, dans l\'échelle qu\'elle emploie.';
const B3 = 'Résultat calculé en temps réel : le pourcentage pondéré, et son niveau dans l\'échelle de l\'évaluation.';
const C1 = 'somme pondérée';
const C2 = 'Entre parenthèses, le nombre après pondération : « (5 après pondération) ». Il ne paraît que si un sous-critère ne pèse pas 1 ; place-le juste après le nombre. Une phrase sans lui ne montre que le nombre posé, mais la ligne du calcul, dans le PDF, montre la parenthèse.';
// ↻ Étape 4a (27 oct. 2026) : F1 devient le texte de « Pénalité proportionnelle à la longueur », validé par Grégoire le 26 oct.
const F1 = 'Chaque occurrence retire des points en proportion de la longueur de la copie : le même nombre d’occurrences coûte moins sur une copie plus longue. Tu fixes la longueur sur laquelle une occurrence coûte un point.';
const D = {
    // ↻ #1152, lot 1 (audit de l'Aide du 24 oct. 2026, D11 : l'Aide rangée par onglet) : le titre perd son numéro de tête « 5c. », le reste est inchangé.
    D1: 'Les critères algorithmiques',
    // ↻ #1152, lot 2b (27 oct. 2026) : D0, D2e, D7a et D7b ajoutés ; D2, D2d, D7 et D8 réécrits. La remesure du 27 oct.
    // (audit-aide-2026-10-24/REMESURE-2026-10-27.md, `sous-criteres`) les dit faux ou incomplets : un calcul composé n'a pas
    // de réglage (D2) ; l'écran dit « Le calcul, en blocs » (D2d) ; l'étudiant·e lit aussi le cas de sa copie et le nom court
    // de son palier (D7) ; la règle d'une copie déjà évaluée est celle de l'étape « Note calculée » (D8, #1173). Consigne
    // CONSIGNE-LOT-2026-10-27-aide-lot-2b-conception.md, § 2, entrée 7. Textes : TEXTES-2026-10-27-aide-critere-algorithmique.md.
    D0: 'Le critère s\'ouvre en atelier, une étape à la fois, à côté de la « Simulation de ce que l\'étudiant·e lirait ». Ses étapes : voir « Les chaînes d\'étapes ».',
    D2: 'Un critère algorithmique calcule sa note à partir de ce que tu comptes sur la copie. Tu choisis le calcul dans l\'étape « Note calculée » du critère. Un calcul tout fait a un réglage ; un calcul que tu composes n\'en a pas : ses nombres sont dans ses blocs.',
    D2a: 'Pénalité proportionnelle à la longueur : Chaque occurrence retire des points en proportion de la longueur de la copie : le même nombre d’occurrences coûte moins sur une copie plus longue. Tu fixes la longueur sur laquelle une occurrence coûte un point.',
    D2b: 'Rapport visé : Tu fixes le rapport qui donne la note entière, par exemple une occurrence à chaque 60 mots. Une copie qui l’atteint a la note entière ; en deçà, la note baisse en proportion. Une copie sans occurrence a la note entière.',
    D2c: 'Pénalité fixe : Chaque occurrence retire le même nombre de points, quelle que soit la longueur de la copie. La longueur reste comptée pour les phrases de l’étudiant·e, mais n’entre pas dans la note.',
    D2d: '« Le calcul, en blocs » montre le calcul choisi, tes réglages compris. Au moment d\'évaluer, il s\'affiche en chiffres sous le résultat ; sur une copie verrouillée que le calcul actuel ne redonne plus, cette ligne se cache.',
    D2e: '« Retoucher ce calcul » ouvre « Composer ton propre calcul » sur une copie du calcul choisi ; l\'original ne change pas. « Ce calcul sert » dit si ton calcul donne la note ou sert seulement à tes phrases et à tes tables. « Quand une donnée de la copie vaut 0 » dit ce que vaut alors la note.',
    D3: 'Tu nommes, au singulier et au pluriel, ce que tu comptes et ce à quoi tu le rapportes : « erreur » sur des « mots » pour une rédaction, « unité manquante » sur des « calculs » en chimie, « faute de rythme » sur des « mesures » en musique. Ces noms s\'écrivent dans les champs de l\'évaluation, dans la phrase du décompte et dans le PDF de l\'étudiant·e. Un critère créé avant ces noms se lit « erreur » et « mot ».',
    D4: 'Les sous-critères sont les catégories de ce que tu comptes. Chacun porte un code, un nom, une pondération et une observation : ce que l\'étudiant·e lit à propos de ce code. La pondération dit ce que pèse une occurrence : 1 par défaut, 0,5 pour la compter à moitié ; un sous-critère de pondération 0 ne se pose pas.',
    D4b: 'Exemple : sept codes posés, trois d\'un sous-critère qui pèse 1 et quatre d\'un sous-critère qui pèse 0,5. La formule reçoit 3 + 2 = 5, et l\'étudiant·e lit « 7 erreurs (5 après pondération) ».',
    D5: 'Sous le critère, « + Ajouter un sous-critère » en crée un. « Partir de la liste du français écrit » crée d\'un coup dix catégories d\'une correction du français (codes 1 à 10), toutes de pondération 1, que tu modifies ensuite comme les tiennes.',
    D6: 'Dans Annoter, les sous-critères sont les codes que tu poses, sur toute copie évaluée avec cette grille. Chaque code posé compte une occurrence de son sous-critère ; le champ de ce que tu comptes se remplit tout seul, et la formule reçoit le nombre pondéré. Sans code posé, tu tapes le nombre : il compte tel quel, sans pondération. Une grille plus ancienne montre la case « Utiliser ces sous-critères comme codes d\'annotation » ; décochée, sa palette garde les dix codes de départ, des codes de correction du français.',
    D7a: 'L\'étape « Cas d\'interprétation » situe la copie par des paliers, d\'après une limite : une longueur de référence et une tolérance sur cette longueur. « Fixer une limite » en pose une ; « Retirer la limite » la retire sans effacer ce qui est écrit. Chaque palier a un seuil, en pourcentage de la limite, un nom court et ce que l\'étudiant·e lit. La limite ne touche pas la note.',
    D7b: '« + Ajouter une table de cas » choisit un texte selon une valeur de la copie : un compte, la note, la part de la limite, la moyenne, le code le plus fréquent ou l\'un de tes calculs. Une table neuve est vide.',
    D7: 'L\'étudiant·e lit, sous le critère, la phrase du décompte, puis le cas de sa copie dans les paliers, puis le texte des tables de cas. Son PDF imprime aussi le nom court de son palier et la ligne du calcul : « 7 erreurs (5 après pondération) sur 400 mots → 13,75/20 (68,8 %) ». La parenthèse ne paraît que si le nombre pondéré diffère du nombre posé.',
    D8: 'Règle les pondérations avant de corriger. Une copie déjà évaluée garde sa note. Elle ne suit le nouveau calcul que si tu la déverrouilles et la modifies. Verrouillée, si le calcul actuel lui donnerait une autre note, une ligne sous sa note le dit.'
};

let cat, section;
beforeAll(() => {
    cat = {};
    const win = { accompagnement: { ajouterEntrees: (e) => Object.assign(cat, e) } };
    chargerScript('js/accompagnement-contenu-terme.js', {}, win);
    chargerScript('js/accompagnement-contenu-popup.js', {}, win);
    chargerScript('js/accompagnement-contenu-hover.js', {}, win);
    const dom = new JSDOM(lire('index.html'));
    section = dom.window.document.getElementById('accordeon-aide-sous-criteres');
});

describe('lot de mots · T — chaque texte à son site', () => {
    it('T.0 chaque chaîne du banc est celle du fichier réglé', () => {
        // F1 n'a pas de texte réglé : « retirer la phrase […] ; le reste de la description ne change pas ».
        // ↻ Étape 4a (27 oct.) : D2a à D2c sont « nom : texte validé » — le texte se lit dans les TEXTES du 26 oct. ;
        // ↻ #1152, lot 2b : D2, réécrit, est maintenant dans le fichier du 27 oct. (TEXTES-2026-10-27-aide-critere-algorithmique.md) :
        // plus d'exception.
        const aRegler = (k, s) => (/^D2[abc]$/.test(k) ? s.split(' : ').slice(1).join(' : ') : s);
        for (const [k, s] of Object.entries({ A1, A2, A3, B1, B2, B3, C1, C2, ...D })) {
            expect(REGLES.includes(apostrophes(aRegler(k, s))), k).toBe(true);
        }
    });

    it('A1 au lexique, A2 à l’aide « i », A3 à la bulle du champ', () => {
        expect(cat['terme-type-de-critere'].terme.definition).toBe(A1);
        const items = cat['grille-type-critere-detail'].popup.sections[0].items;
        expect(items.map((i) => i.replace(/<[^>]+>/g, ''))).toContain(A2);
        expect(cat['cn-grille-type-critere'].hover).toBe(A3);
    });

    it('B1 à B3 aux bulles de l’évaluation', () => {
        expect(cat['eval-francais-ecrit'].hover).toBe(B1);
        expect(cat['eval-col-niveau'].hover).toBe(B2);
        expect(cat['eval-note-finale'].hover).toBe(B3);
    });

    it('C1 et C2 : le repère {points}', () => {
        const r = chargerScript('js/evaluation-enonces.js').enoncesAlgo.listerReperes().find((x) => x.espaceDeTete);
        expect(r.libelle).toBe(C1);
        expect(r.aide).toBe(C2);
    });

    it('F1 : le texte de « Pénalité proportionnelle à la longueur », sans la phrase de l’origine', () => {
        expect(chargerScript('js/evaluation-formules.js').formulesAlgo.obtenirModele('penalite_normalisee').texte).toBe(F1);
    });

    it('D0 à D8 dans la section 5c, D9 parti', () => {
        expect(plat(section.querySelector('h3').textContent).replace(/^▼ /, '')).toBe(D.D1);
        const blocs = [...section.querySelectorAll('.accordeon-contenu > p, .accordeon-contenu li, .accordeon-contenu > .alerte')].map((e) => plat(e.textContent));
        for (const [k, s] of Object.entries(D)) {
            if (k !== 'D1') expect(blocs, k).toContain(s);
        }
        // D2 : une ligne par modèle, et seulement elles.
        expect([...section.querySelectorAll('li')].map((e) => plat(e.textContent))).toEqual([D.D2a, D.D2b, D.D2c]);
        expect(section.textContent).not.toContain('Avantages pédagogiques');
    });
});

/* ======================================================= L — LA LISTE DU FRANÇAIS ÉCRIT */

function listeDemo() {
    const win = chargerScript('js/pack-demo-10.js');
    const g = win.PACK_DEMARRAGE.grillesTemplates.find((x) => x.nom === 'Grille-5 FR-ALGO-20 H26');
    return g.criteres.find((c) => c.nom === 'Français écrit').sousCriteres;
}

/** Le vrai `grilles.js` sur les vrais registres (comme le banc de l'étape 0) : le bouton écrit sur un critère en création. */
function monterBouton() {
    const dom = new JSDOM('<!doctype html><html><body><div id="listeCriteres"></div><span id="totalPonderationAffichage"></span></body></html>');
    const document = dom.window.document;
    const win = { echapperHtml: (s) => String(s), addEventListener() {}, removeEventListener() {} };
    const db = { get: async () => null, getSync: (k, d) => d, set: async () => {}, setSync() {}, modifier: async () => undefined };
    chargerScript('js/ui-blocs.js', { document }, win);
    chargerScript('js/bareme.js', {}, win);
    chargerScript('js/evaluation-formules.js', {}, win);
    chargerScript('js/evaluation-enonces.js', {}, win);
    chargerScript('js/evaluation-projection.js', {}, win);
    chargerScript('js/codes-annotation.js', { db }, win);
    chargerScript('js/atelier-algo.js', { document: dom.window.document }, win);   // #1150 : l'atelier du critère, qui rend le gabarit
    win.temoinEnregistrement = { enregistre() {}, fermer() {}, nonEnregistre() {} };
    chargerScript('js/grilles.js', {
        db, cle: (k) => 'a2032_' + k, document: dom.window.document, echapperHtml: (s) => String(s), alert() {}, confirm: () => true,
        genererIdUnique: (p) => p + 'banc', notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} }
    }, win);
    return { win, document };
}

describe('lot de mots · L — la liste du français écrit est celle de Grégoire', () => {
    it('L.a le bouton crée les dix sous-critères de la grille démo, codes 1 à 10, sans le code 0', async () => {
        const { win } = monterBouton();
        win.tempCriteres = [{ nom: 'Français écrit', type: 'algorithmique', ponderation: 20 }];
        await win.initialiserSousCriteresParDefaut('temp', 0);
        const crees = win.tempCriteres[0].sousCriteres;
        expect(crees.map((s) => s.code)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
        expect(crees).toEqual(listeDemo().filter((s) => s.code !== '0'));
    });

    it('L.b chaque pression donne une copie neuve : la liste du code ne se modifie pas par la grille', async () => {
        const { win } = monterBouton();
        win.tempCriteres = [{ type: 'algorithmique' }, { type: 'algorithmique' }];
        await win.initialiserSousCriteresParDefaut('temp', 0);
        await win.initialiserSousCriteresParDefaut('temp', 1);
        win.tempCriteres[0].sousCriteres[0].nom = 'Retouché';
        expect(win.tempCriteres[1].sousCriteres[0].nom).toBe('Construction syntaxique ou accord du verbe');
    });

    it('L.c une seule définition de la liste dans le code applicatif', () => {
        const fichiers = (d) => readdirSync(path.join(racine, d)).flatMap((n) => {
            const r = path.join(d, n);
            return statSync(path.join(racine, r)).isDirectory() ? fichiers(r) : (r.endsWith('.js') ? [r] : []);
        });
        const porteurs = fichiers('js').filter((f) => f !== path.join('js', 'pack-demo-10.js') && lire(f).includes('Accord du pronom ou le lien avec son antécédent'));
        expect(porteurs).toEqual([path.join('js', 'grilles.js')]);
        expect(lire('js/grilles.js').split('Accord du pronom ou le lien avec son antécédent').length - 1).toBe(1);
    });
});

/* ======================================================= G — LOT DE MOTS 2 */

const G1_TERME = 'Sous-critères (critère algorithmique)';
const G1 = 'Les catégories de ce que compte un critère algorithmique. Chaque sous-critère porte un code, un nom, une pondération (ce que pèse un code posé : 1 par défaut, 0,5 pour le compter à moitié) et une observation, que l\'étudiant·e lit. Le calcul reçoit la somme pondérée des codes posés. « Partir de la liste du français écrit » en crée dix d\'un coup. Configuration : Conception → Grilles de critères → type « Algorithmique ».';
const G2 = '💡 La pondération dit ce que pèse un code posé : 1 par défaut, 0,5 pour le compter à moitié.';
// ↻ 22 oct. 2026 (étape 2a) : les champs portent les noms du critère ; la liste du français écrit les pose.
// ↻ 27 oct. 2026 (étape 4a) : la phrase sous la formule est partie avec le menu des modèles — l'ébauche validée, qui
// fait foi, ne la porte pas ; l'étape « Note calculée » s'ouvre sur « Chaque code posé compte pour la pondération de
// son sous-critère : c'est le compte pondéré. », et la carte choisie dit son texte (F1).
const G3 = 'Lors de l\'évaluation, « Erreurs » se remplit avec les codes que tu poses dans Annoter, ou se tape ; « Mots » se tape.';

/** Le gabarit d'un critère « Français écrit » en création, rendu après la pression du bouton (modèle par défaut). */
async function gabaritRendu() {
    const { win, document } = monterBouton();
    win.tempCriteres = [{ nom: 'Français écrit', type: 'algorithmique', ponderation: 20 }];
    await win.initialiserSousCriteresParDefaut('temp', 0);
    return document.getElementById('listeCriteres');
}

describe('lot de mots 2 · G — trois textes restés faux', () => {
    it('G1 au lexique de l’onglet Aide : le terme et sa définition', () => {
        const dt = [...new JSDOM(lire('index.html')).window.document.querySelectorAll('dt.titre-section-aide')]
            .filter((d) => /^Sous-critères/.test(plat(d.textContent)));
        expect(dt.map((d) => plat(d.textContent))).toEqual([G1_TERME]);
        expect(plat(dt[0].nextElementSibling.textContent)).toBe(G1);
    });

    it('G2 sous les sous-critères ; G3 parti (étape 4a), la carte choisie dit son texte', async () => {
        const gabarit = await gabaritRendu();
        expect(plat(gabarit.querySelector('.sous-criteres-info').textContent)).toBe(G2);
        expect(plat(gabarit.textContent)).not.toContain(G3);
        expect(plat(gabarit.querySelector('.calc-carte[data-actif] .calc-texte').textContent)).toBe(F1);
    });
});

/* ======================================================= X — CE QUI EST PARTI */

describe('lot de mots · X — ce qui ne doit plus rester', () => {
    const PARTIS = [
        'Méthodes quantitatives',
        'Annexe de grammaire de ton manuel',
        'Activer la catégorisation des erreurs',
        '3;3;1',
        'depuis l’origine pour le français écrit',
        'nombre d’erreurs / nombre de mots × 100'
    ];

    it('X.a aucune chaîne partie dans js/', () => {
        const fichiers = (d) => readdirSync(path.join(racine, d)).flatMap((n) => {
            const r = path.join(d, n);
            return statSync(path.join(racine, r)).isDirectory() ? fichiers(r) : (r.endsWith('.js') ? [r] : []);
        });
        const touches = [];
        for (const f of fichiers('js')) {
            const t = lire(f);
            for (const s of PARTIS) if (t.includes(s)) touches.push(f + ' : ' + s);
        }
        expect(touches).toEqual([]);
    });

    it('X.b aucune chaîne partie dans la section 5c', () => {
        const t = section.innerHTML;
        expect(PARTIS.filter((s) => t.includes(s))).toEqual([]);
        // Lot 2 : l'« Astuce professionnelle » part, encadré compris (le seul encadré « succès » de la section).
        expect(t).not.toContain('Astuce professionnelle');
        expect(section.querySelector('.alerte-succes')).toBeNull();
    });

    // Lot 2 : ce qui part du lexique et du gabarit. « de la rédaction » vit encore dans le pack démo (une donnée) :
    // le gabarit se cherche donc rendu, et dans grilles.js, pas dans tout js/.
    const PARTIS_GABARIT = ['ponctuation = 0.5', 'de la rédaction'];

    it('X.c lot 2 : ni « Pondération différenciée » dans index.html, ni « ponctuation = 0.5 » ou « de la rédaction » dans le gabarit', async () => {
        expect(lire('index.html').toLowerCase()).not.toContain('pondération différenciée');
        const gabarit = (await gabaritRendu()).innerHTML;
        const source = lire('js/grilles.js');
        expect(PARTIS_GABARIT.filter((s) => gabarit.includes(s) || source.includes(s))).toEqual([]);
    });
});
