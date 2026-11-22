/**
 * SENTINELLE (21 nov. 2026) — « À L'ESSAI » : UNE SEULE CONSTANTE POUR TROIS ENDROITS.
 *
 * Mandat de la release 1.253.0, point 1 (décision de Grégoire, 21 nov. 2026, 14 h 17) : la pratique « Par standards » part
 * en ligne à l'essai. La mention se lit sans survol à la carte du modèle en vue simple, aux cartes de l'assistant de
 * création où la pratique se choisit, et dans l'en-tête de sa fiche. Elle s'enlèvera quand les testeurs auront confirmé la
 * pratique : `A_L_ESSAI` passe à `false` dans js/pratiques/ensembles-cibles.js, et rien d'autre n'est à toucher.
 *
 * VERROUILLÉ ICI (ce qui se juge sans navigateur ; les trois écrans, la constante éteinte en mémoire et le contraste dans
 * les deux thèmes se jugent dans tests/integration/par-standards-a-l-essai.spec.js) :
 *   E1. La constante est allumée, déclarée une seule fois, et l'étiquette la lit sur l'objet publié : éteinte, rien.
 *   E2. Le mot « À l'essai » n'est écrit qu'à UNE place du code de l'application (ensembles-cibles.js).
 *   E3. Les trois endroits passent par la constante : la carte de la vue simple (`estALEssai`), les deux options de
 *       l'assistant où « Par standards » se choisit et la carte du « Modèle par standards » (21 nov., lot
 *       modèle-par-standards) (`essai: true`, dessinées par `_etiquetteEssaiDeLOption`), l'en-tête
 *       de la fiche (`etiquetteEssaiHTML`, pour la seule famille `cibles`). Aucune autre option, aucun autre modèle.
 *
 * BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const charger = () => { const w = { echapperHtml }; chargerScript('js/pratiques/ensembles-cibles.js', { echapperHtml }, w); return w.EnsemblesCibles; };
const horsCommentaires = (f, motif) => lire(f).split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*|<!--)/.test(l) && motif.test(l));
// Les scripts que l'application CHARGE (`<script src>`), pas ceux qu'un commentaire d'index.html nomme.
const SCRIPTS = [...new Set([...lire('index.html').matchAll(/<script src="(js\/[\w./-]+\.js)/g)].map((m) => m[1]))];
const MOT = 'À l’essai';

describe('E1. La constante', () => {
    it('la liste des scripts lus n\'est pas vide (une absence cherchée dans rien serait vraie par construction)', () => {
        expect(SCRIPTS.length).toBeGreaterThan(100);
        expect(SCRIPTS).toContain('js/pratiques/ensembles-cibles.js');
        expect(SCRIPTS).toContain('js/vue-simple.js');
    });

    it('est allumée pour la 1.253.0, et le mot est « À l’essai »', () => {
        const EC = charger();
        expect(EC.A_L_ESSAI).toBe(true);
        expect(EC.MOT_A_L_ESSAI).toBe(MOT);
        expect(EC.estALEssai()).toBe(true);
        expect(EC.etiquetteEssaiHTML()).toBe(`<span class="etiquette-essai">${MOT}</span>`);
    });

    it('éteinte sur l\'objet publié, l\'étiquette ne rend rien', () => {
        const EC = charger();
        EC.A_L_ESSAI = false;
        expect(EC.estALEssai()).toBe(false);
        expect(EC.etiquetteEssaiHTML()).toBe('');
    });

    it('n\'est déclarée qu\'une fois, dans ensembles-cibles.js, et nulle part ailleurs dans les scripts de l\'application', () => {
        const declarations = SCRIPTS.filter((f) => horsCommentaires(f, /\bA_L_ESSAI\s*(=[^=]|:)/).length);
        expect(declarations).toEqual(['js/pratiques/ensembles-cibles.js']);
        expect(horsCommentaires('js/pratiques/ensembles-cibles.js', /\bconst A_L_ESSAI = (true|false);/).length).toBe(1);
    });
});

describe('E2. Le mot n\'est écrit qu\'à une place', () => {
    it('aucun script de l\'application ni index.html ne l\'écrit, hors de ensembles-cibles.js (commentaires mis à part)', () => {
        const motif = /À l[’']essai/;
        // Le commentaire en fin de ligne (`// …`, `<!-- … -->`) est retiré : seul ce qui s'exécute ou s'affiche compte.
        const sansFin = (l) => l.replace(/<!--.*?-->/g, '').replace(/\s\/\/ .*$/, '');
        const vus = SCRIPTS.concat(['index.html']).filter((f) => horsCommentaires(f, motif).some((l) => motif.test(sansFin(l))));
        expect(vus).toEqual(['js/pratiques/ensembles-cibles.js']);
        expect(horsCommentaires('js/pratiques/ensembles-cibles.js', motif).length).toBe(1);
    });
});

describe('E3. Les trois endroits passent par la constante', () => {
    it('la vue simple : seul le modèle « Par standards » est marqué, et sa carte lit `estALEssai` et le mot commun', () => {
        const VS = lire('js/vue-simple.js');
        const cartes = tranche(VS, 'modeles: [', '        ],');
        expect((cartes.match(/essai:/g) || []).length).toBe(1);
        expect(cartes).toMatch(/\{ famille: 'cibles', modele: 'par-standards', titre: 'Par standards', essai: true, /);
        const rendu = tranche(VS, 'function _choixModeleHTML() {', '\n    }');
        expect(rendu).toContain('(m.essai && window.EnsemblesCibles && window.EnsemblesCibles.estALEssai())');
        expect(rendu).toContain('<p class="vs-etape-essai">${esc(window.EnsemblesCibles.MOT_A_L_ESSAI)}</p>');
    });

    it('l\'assistant : les deux options `cibles` et le « Modèle par standards » sont marqués, aucun autre, et les cartes passent par `etiquetteEssaiHTML`', () => {
        const W = lire('js/wizard-pratique-v2.js');
        const marquees = horsCommentaires('js/wizard-pratique-v2.js', /\bessai: true\b/);
        // 21 nov. 2026 (lot modèle-par-standards) : une troisième place, la carte du « Modèle par standards » dans
        // « Choisis un modèle ». Elle seule ; les cinq modèles prédéfinis ne portent pas la marque.
        expect(marquees.length).toBe(3);
        expect(marquees.filter(l => /Object\.assign\(versOption\(MODELE_PAR_STANDARDS\), \{ essai: true \}\)/.test(l)).length).toBe(1);
        // Chaque option `value: 'cibles'` d'une liste de cartes porte la marque (sur sa ligne ou la suivante).
        const lignes = W.split('\n');
        const options = lignes.map((l, i) => ({ l, i })).filter(({ l }) => /^\s*(\{ )?value: 'cibles',/.test(l));
        expect(options.length).toBe(2);
        for (const { l, i } of options) expect(/essai: true/.test(l) || /essai: true/.test(lignes[i + 1]), `ligne ${i + 1}`).toBe(true);
        const aide = tranche(W, 'function _etiquetteEssaiDeLOption(opt) {', '\n}');
        expect(aide).toContain("(opt && opt.essai && window.EnsemblesCibles) ? ' ' + window.EnsemblesCibles.etiquetteEssaiHTML() : ''");
        expect(tranche(W, 'function genererRadioCards(champ) {', '\n}')).toContain('${opt.label}${_etiquetteEssaiDeLOption(opt)}');
    });

    it('la fiche : l\'en-tête a sa place, remplie pour la seule famille `cibles`, par `etiquetteEssaiHTML`', () => {
        expect((lire('index.html').match(/<span id="mat-essai-pratique"><\/span>/g) || []).length).toBe(1);
        const G = lire('js/pratiques-gestion.js');
        expect(horsCommentaires('js/pratiques-gestion.js', /mat-essai-pratique/).length).toBe(1);
        // La fiche l'appelle à chaque remplissage, avec la famille de la pratique ouverte.
        expect(tranche(G, 'function remplirFormulairePratique(', '\n}')).toContain('afficherEssaiPratiqueMat(typeCanon);');
        expect(G).toContain("essaiPratique.innerHTML = (typeCanon === 'cibles' && window.EnsemblesCibles) ? window.EnsemblesCibles.etiquetteEssaiHTML() : '';");
    });

    it('l\'étiquette de la vue étendue a son style, sans couleur d\'alerte', () => {
        const regle = tranche(lire('styles.css'), '.etiquette-essai {', '}');
        expect(regle).toContain('color: var(--texte-secondaire);');
        expect(regle).toContain('border: 1px solid var(--texte-secondaire);');
    });
});

/*
 * JOURNAL DES BREAK-TESTS (21 nov. 2026, sur le Mac, WebKit pour le banc d'intégration). Chaque sabotage est défait ensuite.
 *   S1. La carte de la vue simple ne lit plus `estALEssai` (`m.essai && window.EnsemblesCibles`) : E3 (vue simple) rouge ;
 *       par-standards-a-l-essai.spec.js, essai « vue simple », rouge (la mention reste, constante éteinte).
 *   S2. `_etiquetteEssaiDeLOption` écrit l'étiquette en dur : E2 et E3 (assistant) rouges ; essai « l'assistant » rouge.
 *   S3. L'en-tête de la fiche écrit l'étiquette en dur : E2 et E3 (fiche) rouges ; essai « la fiche » rouge.
 *   S4. Une option de trop marquée `essai: true` (« Par sélection de productions ») : E3 (assistant) rouge ; essai
 *       « l'assistant » rouge (deux étiquettes au lieu d'une).
 *   S5. `const A_L_ESSAI = false` : E1 rouge ; les trois essais d'intégration rouges ; les écrans épinglés des deux
 *       modèles actuels (vue-simple-modeles-actuels-epingles.spec.js) restent VERTS, comme attendu.
 * ⚠ Le jour où la mention s'enlève : `A_L_ESSAI` passe à `false`, E1 (« est allumée ») et le banc d'intégration disent
 *   alors l'inverse de l'écran et se retirent avec elle — c'est le signal voulu, pas un défaut.
 */
