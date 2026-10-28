import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

// SENTINELLE — #1152, lot 2c de la refonte de l'Aide (28 oct. 2026) : l'Évaluation dit l'écran d'aujourd'hui, en
// moins de mots.
// Audit : plans de travail/audit-aide-2026-10-24/AUDIT-AIDE-2026-10-24.md ; remesure du 27 oct.
// (REMESURE-2026-10-27.md, section Évaluation, gestes neufs n° 5, 6 et 7) ; consigne
// CONSIGNE-LOT-2026-10-28-aide-lot-2c-evaluation.md (§2, §4).
//
// Ce que le banc confronte, calculé des deux côtés :
//   · les entrées de l'Évaluation ⟷ la décision (§2), dans l'ordre ; `evaluer-productions`, absorbée, absente ;
//   · le texte visible de l'Évaluation ⟷ les mots de l'ancien écran ou du jargon ;
//   · chaque libellé cité entre « » dans la liste des évaluations, Annoter et évaluer et les jetons ⟷ l'écran, LU dans
//     index.html (hors de l'Aide) et dans js/ — jamais recopié ici ;
//   · le geste du barème ⟷ les mots validés (TEXTES-2026-10-27-bareme-evaluation.md, H1) ; la ligne de la note remise
//     ⟷ `ligneNoteRemise` ; le plafond des jetons ⟷ le champ de la pratique ; les 30 jours ⟷ la purge de la corbeille.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');
const html = lire('index.html');
const doc = new JSDOM(html).window.document;

const net = (s) => String(s).replace(/[’‘]/g, '\'').replace(/\s+/g, ' ').trim();
const aide = doc.getElementById('section-aide');
const evaluation = doc.getElementById('aide-evaluation');
const entree = (id) => doc.getElementById(`accordeon-aide-${id}`);
const texteDe = (id) => net(entree(id).textContent);

// Côté écran : la page sans la section Aide (texte rendu, entités décodées) et le code de js/ (apostrophes échappées,
// entités et échappements \uXXXX ramenés), d'où l'on cherche chaque libellé.
const pageHorsAide = (() => {
    const d = new JSDOM(html).window.document;
    d.getElementById('section-aide').remove();
    return net(d.body.textContent);
})();
const fichiersJs = (d) => readdirSync(path.join(racine, d)).flatMap((n) => {
    const r = path.join(d, n);
    return statSync(path.join(racine, r)).isDirectory() ? fichiersJs(r) : (r.endsWith('.js') ? [r] : []);
});
const codeJs = net(fichiersJs('js').map((f) => lire(f)).join('\n')
    .replace(/\\'/g, '\'')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16))));

const EVALUATION = ['liste-evaluations', 'preparer-importer', 'annoter-evaluer', 'jetons-reprise', 'irrecevables', 'exporter-archiver'];

describe('#1152 lot 2c · l\'Évaluation', () => {
    it('l\'Évaluation a les entrées de la décision (§2), dans cet ordre ; `evaluer-productions` n\'existe plus nulle part', () => {
        expect([...evaluation.querySelectorAll(':scope > .carte.accordeon')].map((c) => c.id.replace('accordeon-aide-', ''))).toEqual(EVALUATION);
        expect(html).not.toContain('accordeon-aide-evaluer-productions');
        expect(net(entree('liste-evaluations').querySelector('h3').textContent).replace(/^▼ /, '')).toBe('La liste des évaluations');
    });

    it('aucune entrée de l\'Évaluation ne parle de l\'ancien écran ni en jargon', () => {
        const interdits = /crayon|surlignage|autocollants|modifier un document|mode léa|reprise ciblée|en cours — import complété|sidebar|barre latérale/i;
        const fautives = EVALUATION.map((id) => [id, texteDe(id)])
            .filter(([, t]) => interdits.test(t))
            .map(([id, t]) => `${id} : ${t.match(interdits)[0]}`);
        expect(fautives).toEqual([]);
    });

    it('chaque libellé cité entre « » (liste, Annoter et évaluer, jetons) existe à l\'écran, hors de l\'Aide', () => {
        // Un renvoi à une autre entrée de l'Aide n'est pas un libellé d'écran : les titres sont lus dans la page.
        // Un compte variable s'écrit « (N) » : on cherche ce qui le précède, parenthèse comprise. Une valeur variable
        // s'écrit « … » : chaque morceau fixe est cherché. Un chemin « A › B » : chaque étape.
        const titresAide = new Set([...aide.querySelectorAll('.carte.accordeon h3')].map((h) => net(h.textContent).replace(/^▼ /, '')));
        const absents = [];
        let cites = 0;
        for (const id of ['liste-evaluations', 'annoter-evaluer', 'jetons-reprise']) {
            for (const m of texteDe(id).matchAll(/« ([^»]+?) »/g)) {
                if (titresAide.has(m[1])) continue;
                const morceaux = m[1].replace(/\(N\)$/, '(').split(/ › |…/).map((x) => x.trim()).filter(Boolean);
                for (const libelle of morceaux) {
                    cites++;
                    if (!pageHorsAide.includes(libelle) && !codeJs.includes(libelle)) absents.push(`${id} : ${libelle}`);
                }
            }
        }
        expect(cites).toBeGreaterThan(50);
        expect(absents).toEqual([]);
    });
});

describe('#1152 lot 2c · ce que les entrées affirment, lu dans le code', () => {
    it('annoter-evaluer : le geste du barème dit les mots validés (H1), et les marques de l\'écran', () => {
        const h1 = lire('plans de travail', 'TEXTES-2026-10-27-bareme-evaluation.md').match(/## H1[^\n]*\n(.+)\n/)[1].trim();
        const ecran = lire('js', 'evaluation-chargement.js').match(/const TEXTES_BAREME_EVAL = \{ ouTape: '([^']+)', horsBareme: '([^']+)', aCompleter: '([^']+)' \}/);
        expect(ecran).toBeTruthy();
        const t = texteDe('annoter-evaluer');
        expect(t).toContain(h1.charAt(0).toLowerCase() + h1.slice(1, -1));   // « touche la tranche qui décrit la copie, puis ses points »
        for (const mot of ecran.slice(1)) expect(t, mot).toContain(`« ${mot} »`);
    });

    it('annoter-evaluer : la ligne de la note remise est celle de `ligneNoteRemise`', () => {
        const m = lire('js', 'evaluation-calcul.js').match(/return '(Note remise : )' \+ r \+ '\. (Avec le calcul actuel de la grille, elle serait de) ' \+ a/);
        expect(m).toBeTruthy();
        expect(texteDe('annoter-evaluer')).toContain(`« ${m[1]}… ${m[2]} … »`);
    });

    it('annoter-evaluer : `evaluer-productions` n\'y a versé que la phrase sur C et P, réécrite d\'après le code', () => {
        const t = texteDe('annoter-evaluer');
        expect(t).toContain('La complétion (C) et la performance (P) viennent de tes évaluations : la pratique de notation active les calcule.');
        expect(t).not.toMatch(/% d'artefacts remis|Qualité moyenne|Comptage erreurs|Temps estimé/);
        expect(t).not.toMatch(/gomme/i);
    });

    it('jetons-reprise : le plafond par défaut est celui du champ de la pratique', () => {
        const champ = doc.getElementById('mat-jetons-nombre');
        expect(champ).toBeTruthy();
        expect(texteDe('jetons-reprise')).toContain(`« Nombre de jetons alloués par étudiant·e » (${champ.getAttribute('value')} par défaut)`);
    });

    it('liste-evaluations : les copies se restaurent pendant la durée de la corbeille', () => {
        const jours = Number(lire('js', 'travaux-stockage.js').match(/const DUREE_CORBEILLE_MS = (\d+) \* 24 \* 60 \* 60 \* 1000/)[1]);
        expect(texteDe('liste-evaluations')).toContain(`elles s'y restaurent pendant ${jours} jours`);
    });

    it('irrecevables : quatre situations, dans l\'ordre de la carte ; le sous-titre que cite l\'infobulle `eval-integrite` existe', () => {
        const sousTitres = [...entree('irrecevables').querySelectorAll('h4')].map((h) => net(h.textContent));
        expect(sousTitres).toEqual(['Travail NON REMIS', 'Travail NON RECEVABLE (Plagiat ou IA)', 'Travail SOUPÇONNÉ (À vérifier)', 'Travail INCOMPLET (travail en cours)']);
        const renvoi = lire('js', 'accompagnement-contenu-hover.js').match(/Aide › « ([^»]+) »/)[1];
        expect(sousTitres.some((s) => s.startsWith(renvoi))).toBe(true);
        expect(texteDe('irrecevables')).not.toMatch(/Principe clé|Résultats des calculs|deux situations/);
    });
});
