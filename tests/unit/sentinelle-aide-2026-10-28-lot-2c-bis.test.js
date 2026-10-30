import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE — #1152, lot 2c bis de la refonte de l'Aide (28 oct. 2026) : le Suivi dit vrai, en moins de mots.
// Audit : plans de travail/audit-aide-2026-10-24/AUDIT-AIDE-2026-10-24.md (D3, D4, D13 ; verdicts finals) ; remesure du
// 27 oct. (REMESURE-2026-10-27.md, section Suivi, geste neuf n° 9) ; consigne CONSIGNE-LOT-2026-10-28-aide-lot-2c-bis-suivi.md
// (§2, §4).
//
// Ce que le banc confronte, calculé des deux côtés :
//   · les entrées du Suivi ⟷ la décision, dans l'ordre ; `guide-profil` et `rai-absences`, absorbées, absentes ;
//   · le texte visible du Suivi ⟷ les mots de l'ancien écran (la colonne du profil, ses trois sections, « Voir formules »,
//     l'onglet « Aperçu ») et le vocabulaire du risque ;
//   · D13 mot pour mot ; les bornes du niveau RàI (D3), celles du badge et du rappel « Mobilisation » (D4), le seuil de défi,
//     les filtres de « Détails », la durée d'une intervention ⟷ le code, LUS, jamais recopiés ici ;
//   · chaque libellé cité entre « » dans le profil, les interventions et l'Animation ⟷ l'écran, lu dans index.html (hors de
//     l'Aide, attributs compris) et dans js/.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');
const html = lire('index.html');
const doc = new JSDOM(html).window.document;

const net = (s) => String(s).replace(/[’‘]/g, '\'').replace(/\s+/g, ' ').trim();
const aide = doc.getElementById('section-aide');
const suivi = doc.getElementById('aide-suivi');
const entree = (id) => doc.getElementById(`accordeon-aide-${id}`);
const texteDe = (id) => net(entree(id).textContent);

// Côté écran : la page sans la section Aide (texte rendu ET source, pour les libellés posés en attribut, comme
// « Gérer les questions ») et le code de js/ (apostrophes échappées, entités et échappements \uXXXX ramenés).
const { pageHorsAide, sourceHorsAide } = (() => {
    const d = new JSDOM(html).window.document;
    d.getElementById('section-aide').remove();
    return { pageHorsAide: net(d.body.textContent), sourceHorsAide: net(d.body.innerHTML.replace(/&nbsp;/g, ' ')) };
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

// La décision (consigne §1 et §2, demande de relecture du lot) : l'ordre des sous-onglets de js/config.js, chaque entrée qui
// explique un calcul à côté de l'écran qui l'affiche. Suivi du groupe : `tableau-bord`, puis A-C-P, le suivi des fondamentaux
// (« Structure des apprentissages fondamentaux (SOLO) », filtre « Suivi ») et les captures (« Développement du groupe ») ;
// Saisie des présences ; Profils individuels, puis les mots de A et C, la RàI et les patterns (cartes d'Accompagnement) ;
// Interventions ; Animation. « Rencontres » n'a pas d'entrée (un des sept trous, lot 4).
// ↻ #1152, lot 4 (29 oct. 2026) : `rencontres`, neuve, entre `planifier-rai` et `tirage-sort` (consigne CONSIGNE-LOT-2026-10-28-aide-lot-4-les-trous.md, §1, trou 5).
const SUIVI = ['tableau-bord', 'acp', 'suivi-apprentissage', 'snapshots', 'saisie-presences', 'profil-etudiant', 'diagnostics', 'rai', 'patterns', 'planifier-rai', 'rencontres', 'tirage-sort'];

/** Une valeur numérique de SEUILS_PAR_DEFAUT (interpretation-config.js). */
const CONFIG = lire('js', 'interpretation-config.js');
const pct = (bloc, cle) => {
    const zone = bloc ? tranche(CONFIG, `${bloc}: {`) : CONFIG;
    const m = zone.match(new RegExp(`\\b${cle}:\\s*([0-9.]+)`));
    expect(m, `${bloc ? bloc + '.' : ''}${cle} introuvable`).toBeTruthy();
    return Math.round(parseFloat(m[1]) * 100);
};

describe('#1152 lot 2c bis · le Suivi', () => {
    it('le Suivi a les entrées de la décision, dans cet ordre ; `guide-profil` et `rai-absences` n\'existent plus nulle part', () => {
        expect([...suivi.querySelectorAll(':scope > .carte.accordeon')].map((c) => c.id.replace('accordeon-aide-', ''))).toEqual(SUIVI);
        expect(html).not.toContain('accordeon-aide-guide-profil');
        expect(html).not.toContain('accordeon-aide-rai-absences');
    });

    it('les entrées qui nomment un sous-onglet (« Navigation : Suivi → … ») suivent l\'ordre des sous-onglets de config.js', () => {
        const bloc = lire('js', 'config.js').match(/'suivi': \[([\s\S]*?)\]/)[1];
        const onglets = [...bloc.matchAll(/label: '([^']+)'/g)].map((m) => m[1]);
        expect(onglets).toContain('Profils individuels');
        // Note (#1152, lot 2d, 28 oct. 2026) : cet essai lit l'ordre de la constante SUIVI, pas celui de la page ; l'essai
        // précédent, qui lit la page, couvre l'ordre. Sans conséquence aujourd'hui.
        const rangs = SUIVI.map((id) => texteDe(id).match(/Navigation : Suivi → (.+?)(?:,|$| [A-ZÀ-Ý«])/))
            .filter(Boolean)
            .map((m) => onglets.findIndex((o) => m[1].startsWith(o)));
        expect(rangs.length).toBeGreaterThanOrEqual(6);
        expect(rangs).not.toContain(-1);
        expect(rangs).toEqual([...rangs].sort((x, y) => x - y));
    });

    it('aucune entrée du Suivi ne parle de l\'ancien écran, de l\'onglet « Aperçu » ni du risque', () => {
        // Retouche du 28 oct. (verdict de Cowork) : « seul endroit » était faux (la Liste se trie par colonnes, etudiants.js) ;
        // « urgence » est le nom d'une fonction, le vocabulaire qui jugeait l'élève (#821).
        const interdits = /sidebar|barre latérale|3 sections|voir formules|navigation : aperçu|risque|seul endroit|urgence|Préc\.|Suiv\./i;
        const fautives = SUIVI.map((id) => [id, texteDe(id)])
            .filter(([, t]) => interdits.test(t))
            .map(([id, t]) => `${id} : ${t.match(interdits)[0]}`);
        expect(fautives).toEqual([]);
    });

    it('chaque libellé cité entre « » (profil, interventions, Animation) existe à l\'écran, hors de l\'Aide', () => {
        // Un renvoi à une autre entrée de l'Aide n'est pas un libellé d'écran : les titres sont lus dans la page. Une
        // valeur coupée s'écrit « … » : chaque morceau fixe est cherché.
        const titresAide = new Set([...aide.querySelectorAll('.carte.accordeon h3')].map((h) => net(h.textContent).replace(/^▼ /, '')));
        const absents = [];
        let cites = 0;
        for (const id of ['profil-etudiant', 'planifier-rai', 'tirage-sort']) {
            for (const m of texteDe(id).matchAll(/« ([^»]+?) »/g)) {
                if (titresAide.has(m[1])) continue;
                for (const libelle of m[1].split('…').map((x) => x.trim()).filter(Boolean)) {
                    cites++;
                    if (!pageHorsAide.includes(libelle) && !sourceHorsAide.includes(libelle) && !codeJs.includes(libelle)) absents.push(`${id} : ${libelle}`);
                }
            }
        }
        expect(cites).toBeGreaterThan(45);
        expect(absents).toEqual([]);
    });

    it('chaque renvoi du Suivi à une autre entrée (« voir « … » ») nomme un titre de l\'Aide, et la FAQ suit le titre neuf', () => {
        const titresAide = new Set([...aide.querySelectorAll('.carte.accordeon h3')].map((h) => net(h.textContent).replace(/^▼ /, '')));
        const renvois = SUIVI.flatMap((id) => [...texteDe(id).matchAll(/voir « ([^»]+?) »/g)].map((m) => m[1]));
        expect(renvois.length).toBeGreaterThanOrEqual(6);
        expect(renvois.filter((r) => !titresAide.has(r))).toEqual([]);
        expect(net(entree('diagnostics').querySelector('h3').textContent).replace(/^▼ /, '')).toBe('Les mots qui décrivent A et C');
        expect(net(aide.textContent)).not.toContain('Comprendre les diagnostics automatiques');
    });
});

describe('#1152 lot 2c bis · ce que les entrées affirment, lu dans le code', () => {
    it('rai : D13 mot pour mot', () => {
        expect(texteDe('rai')).toContain('Elle dépiste des difficultés et classe des niveaux de besoin, pour éclairer et soutenir tes décisions d\'intervention et d\'accompagnement.');
    });

    it('rai et patterns : les bornes du niveau sont les repères de l\'échelle que lit `determinerNiveauRaiPedagogique` (décision du 30 oct. 2026)', () => {
        const calculs = lire('js', 'profil-etudiant-calculs.js');
        const niveau = tranche(calculs, 'function determinerNiveauRaiPedagogique(', '\nfunction ');
        // Lot 2 des seuils (30 oct. 2026) : le niveau compare au groupe ; les bornes de l'échelle restent celles du pattern.
        expect(niveau).toContain('classerNiveauDansLeGroupe(');
        expect(niveau).toContain('reperesPerformance()');
        expect(tranche(calculs, 'function identifierPatternActuel(', '\nfunction ')).toContain('window.bornesDepistage()');
        expect(niveau).not.toContain('idme.');
        // Aucun champ de l'écran ni des préférences n'écrit de seuil de performance : les repères se posent sur l'échelle.
        expect(html + lire('js', 'preferences-v2.js')).not.toMatch(/idme\.(insuffisant|developpement)|seuil-idme/);
        expect(texteDe('rai')).toContain('Ses bornes sont les repères de ton échelle, « Suffisant à partir de » et « Maîtrisé à partir de »');
        expect(texteDe('rai')).not.toMatch(/\b(64|75) %/);
        // Retouche 2 du lot 2 (constat 1) : la moitié « texte » de cette sentinelle gardait la règle retirée.
        expect(texteDe('patterns')).toContain('Le pattern nomme le besoin sans fixer le niveau : le niveau compare la moyenne des copies au groupe-cours');
        expect(texteDe('patterns')).not.toMatch(/Le niveau suit une seule règle|donnent le niveau [123]/);
    });

    it('patterns : chaque ligne est la condition de `identifierPatternActuel`', () => {
        const calculs = lire('js', 'profil-etudiant-calculs.js');
        const fn = tranche(calculs, 'function identifierPatternActuel(', '\nfunction ');
        expect(fn).toMatch(/performancePAN3 < bornes\.bas\) \{\s*return 'Difficulté persistante';/);
        expect(fn).toMatch(/bornes\.maitrise !== null && performancePAN3 < bornes\.maitrise && aUnDefi\) \{\s*return 'Difficulté émergente';/);
        expect(fn).toMatch(/if \(aUnDefi\) \{\s*return 'Défi spécifique';/);
        const t = texteDe('patterns');
        expect(t).toContain('Difficulté persistante : une performance sous le repère de suffisance (sans ce repère, sous la note de passage)');
        expect(t).toContain('Difficulté émergente : sous le repère de maîtrise, avec au moins un défi');
        expect(t).toContain('Défi spécifique : au repère de maîtrise ou au-dessus, avec au moins un défi');
        expect(t).toContain('Stable : aucun défi, et une performance au repère de suffisance ou au-dessus');
        expect(t).not.toMatch(/Action :|RàI et mobilisation/);
    });

    it('le seuil de défi, la fenêtre et la progression sont les défauts du code et de l\'écran', () => {
        const defi = pct(null, 'defiSpecifique');
        for (const id of ['profil-etudiant', 'patterns', 'suivi-apprentissage']) {
            expect(texteDe(id), id).toContain(`« Seuil de défi spécifique » (${defi} % par défaut`);
        }
        // 30 oct. 2026 : les champs n'ont plus de `value` en dur ; `preferences-v2.js` les remplit depuis la source.
        const fenetre = pct(null, 'nombreProductionsAnalyse') / 100;
        const progression = pct(null, 'progressionArtefacts');
        expect(doc.getElementById('v2-pref-fenetre-patterns').getAttribute('value')).toBeNull();
        expect(doc.getElementById('v2-seuil-progression').getAttribute('value')).toBeNull();
        const t = texteDe('suivi-apprentissage');
        expect(t).toContain(`« Fenêtre d'analyse » (${fenetre} dernières productions par défaut)`);
        expect(t).toContain(`« Progression des artefacts » (${progression} points par défaut)`);
        expect(texteDe('rai')).toContain(`pattern des derniers artefacts (${pct(null, 'nombreProductionsAnalyse') / 100} par défaut)`);
    });

    it('suivi-apprentissage : la carte suit le réglage SOLO de `criteresSuiviFondations`', () => {
        const helpers = lire('js', 'profil-etudiant-helpers.js');
        expect(helpers).toMatch(/function criteresSuiviFondations\(grille\) \{\s*const surveilles = criteresSurveillesParDepistage\(grille\);\s*if \(!etiquettesSOLOLuesParDepistage\(\)\) return surveilles;\s*return surveilles\.filter\(c => \(c\.niveauSOLO \|\| 'multistructurel'\) === 'multistructurel'\);/);
        const t = texteDe('suivi-apprentissage');
        expect(t).toContain('il ne lit que les critères multistructurels de cette grille (un critère sans étiquette compte comme tel, « Aucun » l\'écarte) ; décochée, il lit tous les critères.');
        expect(t).not.toMatch(/organiser, être rigoureux|seuil de maîtrise|prof de chimie/);
    });

    it('profil : les paliers du badge et le rappel « Mobilisation » lisent les trois champs (décision du 30 oct. 2026)', () => {
        const qualif = lire('js', 'contexte-qualification.js');
        for (const borne of ['excellent', 'bon', 'acceptable']) expect(qualif).toContain(`A >= s.${borne} && C >= s.${borne}`);
        const affichage = lire('js', 'profil-etudiant-sections-affichage.js');
        expect(affichage).toMatch(/window\.sousLePalierRares\(aVal\)\) alertes\.push\('Assiduité '/);
        expect(affichage).not.toMatch(/aVal < \d+/);
        const t = texteDe('profil-etudiant');
        expect(t).toContain('suit les trois bornes réglées dans Labo → Outils d\'observation, que A et C doivent atteindre ensemble');
        expect(t).toContain('paraît dès que A ou C passe sous « Absences rares »');
    });

    it('profil : la bande à deux lignes et les huit sections, lues dans `SECTIONS_PROFIL`', () => {
        const affichage = lire('js', 'profil-etudiant-sections-affichage.js');
        const table = tranche(affichage, 'const SECTIONS_PROFIL = [', '];');
        const libelles = [...table.matchAll(/libelle: '([^']+)'/g)].map((m) => m[1]);
        expect(libelles).toHaveLength(8);
        const t = texteDe('profil-etudiant');
        expect(t).toContain('jusqu\'à huit sections en boutons');
        // Les sections, dans l'ordre de la rangée.
        const dites = [...entree('profil-etudiant').querySelectorAll('li > strong')].map((s) => net(s.textContent).replace(/^« | »$/g, ''));
        expect(dites).toEqual(libelles);
        // Les icônes « i » : les sections dont `aide` n'est pas nul.
        const avecAide = [...table.matchAll(/libelle: '([^']+)'[^\n]*aide: '[a-z]+'/g)].map((m) => m[1]);
        expect(avecAide).toEqual(['Engagement ACP', 'Développement des habiletés', 'Accompagnement']);
        expect(t).toContain('L\'icône « i » d\'« Engagement ACP », de « Développement des habiletés » et d\'« Accompagnement » explique leurs calculs.');
        // #803 : l'astuce de l'étoile survit à la fusion.
        expect(t).toContain('la modalité réglée dans ta pratique');
        expect(t).toMatch(/L'étoile[^.]*jeton de reprise ou de délai/);
    });

    it('tableau-bord : les filtres de « Détails » sont ceux de `tableau-bord-apercu.js`', () => {
        const tdb = lire('js', 'tableau-bord-apercu.js');
        expect(tdb).toContain('{ id: \'P\', label: \'P < \' + formaterPourcentage(window.borneBassePerformance(reperesP)) }');
        expect(tdb).toContain('{ id: \'rai\', label: \'RàI 2-3\' }');
        expect(tdb).toContain('{ id: \'suivi\', label: \'Suivi\' }');
        expect(tdb).toContain('label: \'A ou C < \' + formaterPourcentage(window.borneBasseAssiduiteCompletion())');
        const t = texteDe('tableau-bord');
        expect(t).toContain('Les filtres sur P, sur A ou C, « Suivi » et « RàI 2-3 » se combinent');
        expect(t).toContain('Le filtre sur P part du repère « Suffisant à partir de » de ton échelle, ou de la note de passage sans repère ; celui sur A ou C, du palier le plus bas réglé dans Labo → Outils d\'observation.');
        expect(t).toContain('Navigation : Suivi → Suivi du groupe');
        // Les mots de Grégoire (28 oct., 12 h 07) ⟷ le tri de `appliquerFiltres` : sans filtre, l'ordre alphabétique ; avec
        // filtres, un score qui s'ADDITIONNE d'un filtre à l'autre (« cumulent ») et range le plus grand en tête.
        const filtrer = tranche(tdb, 'function appliquerFiltres(', '\nfunction ');
        const sansFiltre = tranche(filtrer, 'if (_filtresActifs.length === 0)', 'return;');
        expect(sansFiltre).toMatch(/localeCompare/);
        expect(filtrer).toMatch(/for \(var i = 0; i < _filtresActifs\.length; i\+\+\)/);
        expect((filtrer.match(/score \+= /g) || []).length).toBe(4);
        expect(filtrer).toMatch(/var diff = urgence\(b\) - urgence\(a\);/);
        expect(t).toContain('se combinent : ils ne gardent que les étudiant·es qui répondent à tous, et mettent en tête ceux qui cumulent les plus grands écarts ; sans filtre, l\'ordre est alphabétique.');
    });

    it('les quatre titres neufs sont ceux que Grégoire a validés (28 oct. 2026, 12 h 07, « on garde »)', () => {
        const titre = (id) => net(entree(id).querySelector('h3').textContent).replace(/^▼ /, '');
        expect(['tableau-bord', 'profil-etudiant', 'diagnostics', 'tirage-sort'].map(titre)).toEqual([
            'Consulter le suivi du groupe', 'Lire le profil d\'un·e étudiant·e', 'Les mots qui décrivent A et C',
            'Questions flash, tirage au sort et équipes',
        ]);
        for (const id of ['tableau-bord', 'profil-etudiant', 'diagnostics', 'tirage-sort']) {
            const avant = html.slice(0, html.indexOf(`id="accordeon-aide-${id}"`));
            expect(avant.slice(avant.lastIndexOf('<!--')), id).toContain('validé par Grégoire le 28 oct. 2026 à 12 h 07');
        }
    });

    it('planifier-rai : la case de report et ses mots sont ceux de l\'écran ; la durée par défaut est celle du champ', () => {
        const interv = lire('js', 'interventions.js');
        const caseReport = interv.match(/caseReport: '([^:]+) :/)[1];
        const uneFois = interv.match(/caseReportUneFois: '([^:]+) :/)[1];
        const duree = interv.match(/id="interventionDuree"[^>]*value="\$\{intervention\.duree \|\| (\d+)\}"/)[1];
        const t = texteDe('planifier-rai');
        expect(t).toContain(`« ${caseReport}… », décochée par défaut`);
        expect(t).toContain(`${uneFois}.`);
        expect(t).toContain(`« Durée (périodes) », ${duree} par défaut`);
        // Le rattrapage seul marque les non-participant·es (interventions.js, enregistrement de la fiche).
        expect(interv).toMatch(/if \(contexteSave === 'rattrapage'\) \{[^}]*marquerNonParticipantsMotives = true;/);
        expect(t).toMatch(/en « Séance de rattrapage — les non-participants ont congé », les autres reçoivent une absence motivée/);
        expect(t).not.toMatch(/2 heures|transfère automatiquement|se propagent/);
    });

    it('snapshots : une capture prise garde ses valeurs jusqu\'à « Recalculer les captures » (#1175)', () => {
        expect(lire('js', 'snapshots.js')).toContain('une capture déjà écrite garde son C jusqu\'à « Recalculer les captures »');
        expect(pageHorsAide).toContain('Recalculer les captures');
        const t = texteDe('snapshots');
        expect(t).toContain('Une capture déjà prise garde ses valeurs.');
        expect(t).not.toMatch(/ponctuel|24h|heures/);
    });
});
