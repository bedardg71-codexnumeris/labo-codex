import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

// SENTINELLE — l'Aide face à l'audit du 15 octobre 2026
// (plans de travail/CONSIGNE-LOT-2026-10-15-aide-face-a-l-audit.md,
//  plans de travail/COMPARAISON-AUDIT-AIDE-2026-10-15.md).
//
// Même patron que les cinq sentinelles du 10 septembre (`sentinelle-audit-aide-lot-{A..E}`),
// dans l'autre sens : celles-là partaient du texte vers le code ; ici, c'est l'observation de
// l'application qui a montré ce que l'Aide décrivait et que le code n'a plus (l'indice R,
// l'indice E, l'échelle de risque, quatre versions de ce qui fixe le niveau RàI…).
//
// Chaque valeur est LUE là où elle vit — les patterns que le code peut rendre, les seuils de
// départ, ce que contient le rapport de bogue, le nombre d'étapes de la visite — jamais
// recopiée ici. Le point 2 de la consigne (ce que la NOTE fait d'une copie non recevable)
// n'est pas verrouillé : il attend la réponse de Cowork (une famille diverge, voir la demande
// de relecture du lot).

const INDEX = lire('index.html');
const HOVER = lire('js/accompagnement-contenu-hover.js');
const POPUP = lire('js/accompagnement-contenu-popup.js');
const TERME = lire('js/accompagnement-contenu-terme.js');
const VISITE = lire('js/accompagnement.js');
const GUIDES = lire('js/guides-pedagogiques.js');

// La section Aide d'index.html, et elle seule (de son ouverture à sa fermeture).
const AIDE = tranche(INDEX, '<section id="section-aide"', '</section>', { longueurMin: 100000 });

const SURFACES = { 'section Aide': AIDE, infobulles: HOVER, popups: POPUP, glossaire: TERME, visite: VISITE, guides: GUIDES };

/** Le texte d'une infobulle, par sa clé. */
const bulle = (cle) => {
    const m = HOVER.match(new RegExp(`'${cle}':\\s*\\n?\\s*'((?:[^'\\\\]|\\\\.)*)'`));
    expect(m, `l'infobulle ${cle} a disparu`).toBeTruthy();
    return m[1];
};

/** Le corps d'une fonction, borné à la fonction suivante (jamais une fenêtre fixe). */
const corps = (source, nom) => {
    const depuis = tranche(source, `function ${nom}(`);
    const suivante = depuis.slice(10).search(/\n(?:async )?function /);
    return suivante === -1 ? depuis : depuis.slice(0, 10 + suivante);
};

/** Une valeur numérique de SEUILS_PAR_DEFAUT (interpretation-config.js), par sa clé. */
const CONFIG = lire('js/interpretation-config.js');
const defaut = (bloc, cle) => {
    const zone = tranche(CONFIG, bloc ? `${bloc}: {` : 'const SEUILS_PAR_DEFAUT');
    const m = zone.match(new RegExp(`\\b${cle}:\\s*([0-9.]+)`));
    expect(m, `le défaut ${bloc ? bloc + '.' : ''}${cle} a disparu`).toBeTruthy();
    return parseFloat(m[1]);
};

describe('Ce qui n\'existe plus dans le code ne réapparaît dans aucune surface', () => {
    // L'échelle de risque a été remplacée le 14 nov. 2025, l'indice E retiré le 16 avr. 2026
    // (commentaires de contexte-qualification.js et en-tête de snapshots.js).
    const FANTOMES = [
        [/R\s*=\s*\(2\s*×\s*A/, 'la formule de R'],
        [/Indice composite \(R\)/, 'l\'entrée « Indice composite (R) »'],
        [/Indices? R \(Risque\)|Indice de risque \(R\)|selon l'indice R\b/, 'l\'indice R'],
        [/1\s*-\s*\(?A\s*×\s*C\s*×\s*P|1\s*−\s*A\s*×/, 'la formule du risque d\'échec'],
        [/risque d'échec|RISQUE D'ÉCHEC/i, 'le risque d\'échec'],
        [/échelle de risque/i, 'l\'échelle de risque'],
        [/selon l'indice de risque|niveau de risque/i, 'le niveau de risque'],
        [/Niveau d'attention \(N\)/, 'le niveau d\'attention N'],
        [/E ↔ P/, 'la corrélation E ↔ P'],
    ];
    for (const [nom, texte] of Object.entries(SURFACES)) {
        it(`${nom} : aucune trace de R, du risque d'échec, de l'échelle de risque, de N ni de E`, () => {
            for (const [motif, quoi] of FANTOMES) {
                expect(texte, `${quoi} est revenu dans ${nom}`).not.toMatch(motif);
            }
        });
    }

    it('le code, lui, n\'a toujours ni indice R ni indice E (sinon cette sentinelle se trompe de sens)', () => {
        const calculs = lire('js/profil-etudiant-calculs.js') + lire('js/indices.js');
        expect(calculs).not.toMatch(/2\s*\*\s*A\s*\+\s*C\s*\+\s*P/);
        expect(lire('js/snapshots.js')).toMatch(/indice E \(engagement\) a été retiré/);
    });
});

describe('Ce qui fixe le niveau RàI : une seule version, celle du code', () => {
    const NIVEAU = corps(lire('js/profil-etudiant-calculs.js'), 'determinerNiveauRaiPedagogique');
    const fenetre = defaut(null, 'nombreProductionsAnalyse');

    it('le code décide par la note provisoire devant la ligne (lot 3 des seuils) — pas par l\'IPB', () => {
        expect(corps(lire('js/profil-etudiant-calculs.js'), '_besoinDesCopies')).toContain('identifierPatternActuel(');
        expect(NIVEAU).toContain('classerNiveauAuCritere(');
        expect(NIVEAU, 'le niveau RàI lit maintenant l\'IPB : l\'Aide est à revoir').not.toMatch(/calculerIPB\(/);
        // ↻ #1117, suite (20 oct. 2026) : « Aucun » n'exclut que si l'observation SOLO est activée.
        expect(lire('js/profil-etudiant-helpers.js')).toMatch(/function estCritereSurveilleParDepistage\(critere\)\s*\{\s*if \(!critere\) return false;\s*if \(!etiquettesSOLOLuesParDepistage\(\)\) return true;\s*return critere\.niveauSOLO !== 'aucun';/);
    });

    it('les anciennes versions ont disparu de toutes les surfaces', () => {
        const ANCIENNES = [
            /\(IPB\) détermine automatiquement le niveau/,
            /calculé uniquement à partir des critères multistructurels/,
            /selon la performance globale \(indice P, tous critères\)/,
            /se base sur la <strong>performance globale<\/strong>/,
            /classe les étudiant·es selon leur <strong>performance globale<\/strong>/,
            /diagnostic croisé \(IPB × direction\), mais/,
        ];
        for (const [nom, texte] of Object.entries(SURFACES)) {
            for (const motif of ANCIENNES) expect(texte, `${nom} : ${motif}`).not.toMatch(motif);
        }
    });

    it('la version du code est dite là où l\'Aide décrit le niveau, avec la fenêtre de départ lue à la source', () => {
        const phrase = `pattern des derniers artefacts (${fenetre} par défaut)`;
        expect(bulle('tdb-rai')).toContain(phrase);
        expect(TERME).toContain(phrase);
        // ↻ #1152, lot 3 (28 oct. 2026) : « au moins trois fois » comptait deux redites du glossaire statique (Indice RàI, RàI),
        // parti avec lui (consigne CONSIGNE-LOT-2026-10-28-aide-lot-3-un-seul-glossaire.md, §2.5). La règle reste dite là où
        // l'Aide décrit le niveau (l'entrée du Suivi) et dans le seul glossaire (TERME, ci-dessus).
        // ↻ Lot 3 des seuils (30 oct. 2026) : la carte RàI validée ne nomme plus cette fenêtre ; l'Aide la dit au Suivi de l'apprentissage.
        expect(AIDE, 'la section Aide ne dit plus la fenêtre du code').toContain(`(${fenetre} dernières productions par défaut)`);
        expect(TERME).toContain('il ne fixe pas le niveau');
        expect(AIDE).toContain('nomme la cible de l\'intervention');
    });

    it('le niveau 2 porte le mot que l\'application affiche, et lui seul', () => {
        const m = lire('js/profil-etudiant-calculs.js').match(/label: 'Niveau 2 - ([^']+)'/);
        expect(m).toBeTruthy();
        const mot = m[1];
        expect(mot).toBe('Préventif');   // ce que l'écran affiche ; s'il change, l'Aide suit
        for (const [nom, texte] of Object.entries(SURFACES)) {
            expect(texte, `${nom} nomme encore le niveau 2 « Ciblé »`).not.toMatch(/Niveau 2\s*(?:—|-)\s*Ciblé|\(Ciblé, 15%\)|Universel, Ciblé, Intensif/);
        }
    });
});

describe('Les patterns : toutes les énumérations nomment ceux que le code rend', () => {
    const CALCULS = lire('js/profil-etudiant-calculs.js');
    const PATTERN = corps(CALCULS, 'identifierPatternActuel');
    const NIVEAU = corps(CALCULS, '_niveauNonParticipation') + corps(CALCULS, '_besoinSansCopie');
    const PATTERNS = [
        ...[...PATTERN.matchAll(/return '([^']+)';/g)].map((m) => m[1]),
        ...[...NIVEAU.matchAll(/pattern: '([^']+)'/g)].map((m) => m[1]),
    ];

    it('le code rend six valeurs, dont « Non-participation » et « Données insuffisantes »', () => {
        expect(new Set(PATTERNS)).toEqual(new Set(['Difficulté persistante', 'Difficulté émergente', 'Défi spécifique', 'Stable', 'Non-participation', 'Données insuffisantes']));
    });

    const enumerations = {
        'infobulle du filtre de la liste': () => bulle('liste-filtre-pattern'),
        'carte « Options configurables »': () => tranche(AIDE, 'Option 1 : Détection des patterns', 'Option 2 : Observation'),
        // ↻ #1152, lot 2c bis (28 oct. 2026) : l'encadré « RàI et mobilisation » (théorie) part de la carte (audit du 24 oct.,
        // verdict final de `patterns` ; consigne CONSIGNE-LOT-2026-10-28-aide-lot-2c-bis-suivi.md, §2, entrée 8) : la tranche
        // finit au niveau « En attente », dernière phrase de la carte, qui suit « Données insuffisantes ».
        'carte « Repérer les patterns »': () => tranche(AIDE, 'id="accordeon-aide-patterns"', 'le niveau RàI «&nbsp;En attente&nbsp;»'),
        'guide RàI': () => tranche(GUIDES, 'patterns observables', 'guide-pedagogique-astuce'),
    };
    for (const [nom, extraire] of Object.entries(enumerations)) {
        it(`${nom} : chaque pattern du code y est nommé`, () => {
            const texte = extraire().toLowerCase();
            expect(texte.length, `${nom} introuvable`).toBeGreaterThan(50);
            for (const p of PATTERNS) {
                const cle = p === 'Stable' ? 'stable' : p.toLowerCase();
                expect(texte, `${nom} ne nomme pas « ${p} »`).toContain(cle);
            }
        });
    }
});

describe('Les seuils A et C : une seule table, bornes et mots lus à la source (quatre paliers, 30 oct. 2026)', () => {
    const QUALIF = lire('js/contexte-qualification.js');
    const mots = (nom) => {
        const m = QUALIF.match(new RegExp(`const ${nom} = \\[([^\\]]+)\\]`));
        expect(m, `${nom} a disparu`).toBeTruthy();
        return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
    };
    const PRESENCE = mots('MOTS_PRESENCE');
    const REMISE = mots('MOTS_REMISE');
    const pct = (x) => Math.round(x * 100);
    const [excellent, bon, acceptable] = ['excellent', 'bon', 'acceptable'].map((c) => pct(defaut('interpretation', c)));

    // 30 oct. 2026 : l'Aide n'a plus de copie : `remplirAideSeuilsDeDepart` écrit le tableau, depuis les défauts et les mots.
    const aideRemplie = () => {
        const fenetre = new JSDOM(INDEX).window;
        const db = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {}, get: async () => null, set: async () => {} };
        const win = chargerScript('js/interpretation-config.js', { db });
        chargerScript('js/contexte-qualification.js', { obtenirSeuil: win.obtenirSeuil }, win);
        win.remplirAideSeuilsDeDepart(fenetre.document);
        return fenetre.document;
    };
    const ins = '\u00A0';
    const bornes = [`≥ ${excellent}${ins}%`, `${bon}-${excellent - 1}${ins}%`, `${acceptable}-${bon - 1}${ins}%`, `< ${acceptable}${ins}%`];

    it('quatre rangées, chacune avec la borne lue et les deux mots de son palier, dans l\'ordre', () => {
        expect(PRESENCE).toHaveLength(4);
        const lignes = [...aideRemplie().querySelectorAll('#aide-table-paliers-a-c tbody tr')].map((tr) => [...tr.querySelectorAll('td')].map((c) => c.textContent));
        expect(lignes).toHaveLength(4);
        lignes.forEach((ligne, i) => {
            expect(ligne, `rangée ${i}`).toEqual([bornes[i], PRESENCE[i], REMISE[i]]);
        });
    });

    it('dans `index.html`, le tableau n\'a aucune rangée : aucune copie des bornes ni des mots', () => {
        const table = tranche(AIDE, 'id="aide-table-paliers-a-c"', '</table>');
        expect(tranche(table, '<tbody>', '</tbody>')).not.toMatch(/<tr|\d&nbsp;%/);
    });

    it('les bornes citées sous le tableau sont lues à la même source, note de passage comprise', () => {
        const doc = aideRemplie();
        const lus = Object.fromEntries([...doc.querySelectorAll('[data-seuil-depart]')].map((el) => [el.getAttribute('data-seuil-depart'), el.textContent]));
        expect(lus).toEqual({ excellent: `${excellent}${ins}%`, bon: `${bon}${ins}%`, acceptable: `${acceptable}${ins}%`, notePassage: `60${ins}%` });
    });

    it('les deux autres tables ont disparu, et leurs mots avec elles', () => {
        expect(AIDE).not.toContain('Seuils harmonisés A/C/M');
        expect(AIDE).not.toContain('Les deux indices utilisent les mêmes seuils harmonisés');
        expect(AIDE).not.toMatch(/Fragile - Surveiller de près|Critique - Intervention immédiate/);
        expect(AIDE).not.toMatch(/<td>Confortable<\/td>|<td>Maîtrisé<\/td>/);
        expect(AIDE.split('<table').length - 1 >= 1).toBe(true);
    });

    it('la FAQ dit que les seuils se règlent, et où, avec les défauts lus à la source', () => {
        // Ancre retouchée le 28 oct. (verdict de Cowork, lot 2d de #1152) : il n'y a pas d'indice M (« M » nomme le filtre
        // « A ou C », tableau-bord-apercu.js) ; la question dit « A et C ».
        const faq = tranche(AIDE, 'Puis-je modifier les seuils des indices A et C ?', '</details>');
        expect(faq).not.toContain('ne sont pas modifiables');
        expect(faq).toContain('Labo → Outils d\'observation');
        // 30 oct. 2026 : défauts lus à la source, plus de borne fixe, et la carte Mobilisation lit les mêmes champs.
        expect(faq, 'la FAQ recopie des bornes').not.toMatch(/\d&nbsp;%/);
        expect(faq, 'la FAQ dit encore qu\'une borne est fixe').not.toMatch(/est fixe|sont fixes/);
        // et l'écran qui les règle existe, avec ces trois champs
        for (const id of ['v2-seuil-fragile', 'v2-seuil-acceptable', 'v2-seuil-bon']) expect(INDEX).toContain(`id="${id}"`);
    });
});

describe('Le rapport de bogue : l\'infobulle dit ce qui part', () => {
    const RAPPORT = lire('js/rapport-bug.js');
    const max = (nom) => parseInt(RAPPORT.match(new RegExp(`const ${nom} = (\\d+);`))[1], 10);

    it('les nombres d\'actions et d\'erreurs sont ceux du code', () => {
        const texte = bulle('entete-signaler-bug');
        expect(texte).toContain(`${max('MAX_ACTIONS')} dernières actions`);
        expect(texte).toContain(`${max('MAX_ERREURS')} dernières erreurs`);
    });

    it('chaque rubrique nommée par l\'infobulle est écrite par le rapport', () => {
        const texte = bulle('entete-signaler-bug');
        const rubriques = { 'l’appareil': 'Appareil:', 'le navigateur': 'Navigateur:', 'd’étudiant·es': 'Nb étudiants:', 'de cours': 'Nb cours:', 'de productions': 'Nb productions:' };
        for (const [dit, ecrit] of Object.entries(rubriques)) {
            expect(texte, `l'infobulle ne dit plus ${dit}`).toContain(dit);
            expect(RAPPORT, `le rapport n'écrit plus « ${ecrit} »`).toContain(ecrit);
        }
        expect(texte).not.toContain('Le numéro de build part automatiquement');
    });

    // ↻ #1075, point 10 (22 oct. 2026) : l'historique ne garde plus le texte cliqué
    // (`sentinelle-1075-rapport-bug-sans-texte`). La bulle n'a pas changé : ses mots sont à Grégoire.
    it('elle ne promet pas l\'absence de nom, et l\'historique ne garde plus le texte cliqué', () => {
        expect(RAPPORT).not.toMatch(/textContent\?\.substring\(0, 30\)/);
        expect(bulle('entete-signaler-bug')).not.toMatch(/aucun nom/i);
        expect(bulle('entete-signaler-bug')).toContain('relis le rapport avant de l’envoyer');
    });
});

describe('Les gestes décrits sont ceux du code', () => {
    it('réinitialiser : un codex à part, deux confirmations, « EFFACER », aucun mot de passe', () => {
        const fn = corps(lire('js/import-export.js'), 'reinitialiserDonnees');
        expect(fn).toContain('Codex.ecrireAPartAvantSuppression');
        expect((fn.match(/\bconfirm\(/g) || []).length).toBe(2);
        expect(fn).toContain('"EFFACER"');
        expect(fn).not.toMatch(/mot de passe|password/i);
        const texte = bulle('donnees-reinitialiser');
        expect(texte).toContain('deux confirmations');
        expect(texte).toContain('« EFFACER »');
        expect(texte).toContain('codex');
        expect(texte).not.toMatch(/mot de passe|triple/i);
    });

    it('l\'assiduité ne compte que les séances saisies', () => {
        expect(lire('js/saisie-presences.js')).toContain('\'Séance non saisie\'');
        expect(bulle('presences-assiduite-col')).toContain('séances saisies');
        for (const texte of [HOVER, AIDE, GUIDES]) {
            expect(texte).not.toMatch(/Taux de présence cumulé de l’étudiant·e depuis le début du trimestre|nombre de présences \/ nombre de séances|la proportion des périodes du trimestre/);
        }
        // ↻ #1152, lot 4 (29 oct. 2026) : « tant que la barre dit « Séance non saisie »… » est remplacé par le trou 3 validé
        // (consigne CONSIGNE-LOT-2026-10-28-aide-lot-4-les-trous.md, §1) ; le fait qu'on verrouille ici reste dit, par la phrase d'avant qu'on garde.
        expect(AIDE).toContain('Seules les séances saisies entrent dans A.');
        expect(TERME).toContain('« Séance non saisie »');   // #1152, lot 3 : la formule de A, versée du glossaire statique
        expect(GUIDES).toContain('sur les seules séances saisies');
    });

    it('une copie non recevable reste au dénominateur de la complétion', () => {
        // Le code : la complétion de chaque famille qui compte des productions lit la règle unique de la remise
        // (25 oct. 2026), et cette règle écarte une copie non recevable.
        for (const f of ['js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-configurable.js']) {
            expect(lire(f), f).toContain('window.evaluationCompteCommeRemise(e, evaluations)');   // E15 (28 oct. 2026) : avec la liste où chercher la reprise
        }
        expect(tranche(lire('js/pratiques/pratique-registre.js'), 'function evaluationCompteCommeRemise(', 'function compterEvaluationsEcarteesDeLaNote(')).toContain('if (evaluationNonRecevable(evaluation)) return false;');
        const carte = tranche(AIDE, 'Travail NON RECEVABLE', 'Travail SOUPÇONNÉ');
        expect(carte).toContain('7/9');
        expect(carte).not.toMatch(/7\/8|Exclu du total attendu/);
        expect(AIDE).not.toMatch(/N\/A \(exclu du total\)|exclu du dénominateur|jamais existé dans les attentes/);
    });

    it('l\'horaire se décrit en séances et en périodes, plus en formats 2×2h / 1×4h', () => {
        expect(INDEX).toContain('id="v2-hor-nbSeances"');
        for (const [nom, texte] of Object.entries(SURFACES)) {
            expect(texte, nom).not.toMatch(/2×2h|1×4h|2h par bloc|4h continu/);
        }
    });

    it('les captures sont hebdomadaires', () => {
        expect(lire('js/snapshots.js')).toMatch(/snapshots\.hebdomadaires\.some\(s => s\.numSemaine === numSemaineActuelle\)/);
        expect(AIDE).not.toMatch(/À chaque saisie de présences, une capture|à chaque séance, créant un historique/);
        expect(AIDE).toContain('une fois par semaine');
    });

    it('partager : un .lcz signé ; changer d\'appareil : le codex', () => {
        expect(lire('js/partage-export.js')).toContain('extension: \'.lcz\'');
        expect(AIDE).not.toMatch(/Ressources partageables \(JSON\)|Transférer le fichier JSON|un fichier <code>\.json<\/code> dont le nom/);
        expect(AIDE).toContain('Ressources partageables (.lcz signé)');
        expect(AIDE).toContain('Transférer le fichier codex');
    });

    it('le dépistage lit les niveaux, pas le texte des rétroactions', () => {
        expect(AIDE).not.toMatch(/analysant tes rétroactions écrites|analyse tes rétroactions pour/);
    });

    it('la visite guidée : le nombre d\'étapes lu dans la visite, relancée depuis l\'en-tête', () => {
        const bloc = tranche(VISITE, 'const ETAPES_TOUR = [', 'const TOUR_NAV');
        const n = (bloc.match(/^\s{8}id: \d+,/gm) || []).length;
        expect(n).toBeGreaterThan(0);
        expect(TERME).toContain(`Un parcours en ${n} étapes`);
        // ↻ #1152, lot 3 (28 oct. 2026) : « Parcours en N étapes » n'était, dans l'Aide, que dans le glossaire statique, parti ;
        // le seul glossaire le dit (TERME, ci-dessus ; consigne du lot 3, §2.5).
        expect(AIDE).not.toContain('Parcours en 7 &eacute;tapes');
        expect(INDEX).toMatch(/data-action="afficherAideContextuelle" data-param="tour-guide"/);
        expect(TERME).not.toContain('depuis les Préférences');
    });

    it('le mode anonymisé : « Élève 1, Élève 2 », décrit d\'une seule façon', () => {
        expect(lire('js/modes.js')).toContain('prenom: `Élève ${prochainNumero}`');
        expect(AIDE).not.toContain('Cerf agile');
        expect(bulle('entete-mode-affichage')).not.toContain('noms fictifs ou numéros');
        expect(bulle('entete-mode-affichage')).toContain('« Élève 1 »');
    });

    it('l\'échelle IDME d\'exemple n\'a plus de trou : ses bornes sont celles de l\'échelle de départ', () => {
        const echelles = lire('js/echelles.js');
        const minD = parseInt(tranche(echelles, 'nom: \'Développement\'').match(/min: (\d+)/)[1], 10);
        expect(AIDE).not.toMatch(/Incomplet<\/strong> : &lt; 64(&nbsp;)?%|nsuffisant \(&lt; 64(&nbsp;)?%\)/);
        // ↻ #1152, lot 2b (27 oct. 2026) : « Exemple IDME » quitte `creer-echelles` et l'échelle passe, sous son nom
        // d'écran, au tableau de `solo` (audit de l'Aide du 24 oct., `creer-echelles` et `idme` ; remesure du 27 oct. ;
        // consigne CONSIGNE-LOT-2026-10-27-aide-lot-2b-conception.md, §2, entrées 8 et 9). La borne reste lue ici ;
        // les quatre rangées sont vérifiées par sentinelle-aide-2026-10-27-lot-2b.test.js.
        // ↻ Retouche du lot 2b (27 oct., § 4.3-4.4 du verdict) : « I » commence à 40 % (le niveau « PS » le précède) ;
        // la plage de « I » se termine juste sous la borne de « D », lue ici.
        expect(AIDE).toContain(`<td class="text-center">40 à ${minD - 1},99&nbsp;%</td>`);
    });

    it('plus de langue de code dans l\'Aide', () => {
        expect(AIDE).not.toMatch(/Ce module (GÉNÈRE|LIT) (les )?indices/);
    });
});

describe('Une copie non recevable dans la note, famille par famille (décisions de Grégoire, 15 oct., 14 h 36 et 15 h 30)', () => {
    const CARTE = tranche(AIDE, 'Travail NON RECEVABLE', 'Travail SOUPÇONNÉ');
    const ACTIONS = lire('js/profil-etudiant-actions.js');

    // ↻ 28 oct. 2026 (CONSIGNE-LOT-2026-10-28-copie-non-recevable-note.md) : le 0 ne venait PAS des menus — leur sélecteur
    // ne trouvait rien, la copie gardait 87,5. Il se lit désormais au calcul, par le registre ; le bloc des menus est retiré.
    // Les valeurs, famille par famille, sont jugées par sentinelle-copie-non-recevable-vaut-la-regle-28-oct.test.js.
    it('sommative : elle vaut 0 au calcul (registre), les critères gardent l\'évaluation ; la reprise la remplace', () => {
        const statut = corps(lire('js/evaluation-sauvegarde.js'), 'changerStatutIntegrite');
        expect(statut).toMatch(/statut === 'plagiat' \|\| statut === 'ia'/);
        expect(statut).not.toContain("select.value = '0'");
        const perf = corps(lire('js/pratiques/pratique-sommative.js').replace(/^    calculerPerformance\(/m, 'function calculerPerformance('), 'calculerPerformance');
        expect(perf).not.toContain('statutIntegrite');
        expect(perf).toContain('window.noteRetenueParLeCalcul(evaluation) * ponderation');
        // E4 (28 oct. 2026) : la reprise remplace l'originale quand elle entre elle-même dans la note (`originaleEstRemplacee`).
        expect(corps(lire('js/pratiques/pratique-registre.js'), 'evaluationEntreDansLaNote')).toContain('if (evaluation.remplaceeParId && originaleEstRemplacee(evaluation, evaluations)) return false;');
        expect(CARTE).toContain('<li>en sommative, elle vaut 0, sauf si une reprise la remplace ;</li>');
        expect(CARTE, 'la clause des meilleures productions ne joue jamais en sommative').not.toMatch(/meilleures productions/);
    });

    it('spécifications : un travail non satisfaisant (sa note 0 reste sous le seuil)', () => {
        const spe = lire('js/pratiques/pratique-pan-specifications.js');
        expect(tranche(spe, '_estTravailAcceptable(evaluation, typeTravail) {', '\n    }')).toContain('return evaluation.noteFinale >= seuil;');
        expect(CARTE).toContain('<li>en spécifications, elle compte comme un travail non satisfaisant ;</li>');
    });

    it('standards : hors du portfolio ; la terminale, et l\'obligatoire en hybride avec les notes finales, valent 0', () => {
        // ↻ 28 oct. 2026 : la règle est lue au registre (`valeurCopieNonRecevable`), plus sur le statut ; la terminale vaut 0 par lui.
        expect(corps(ACTIONS, '_filtrerEvaluationsArtefactsValides')).toMatch(/if \(nonRecevable && !nonRecevable\.dansLePortfolio\) return false;/);
        expect(corps(ACTIONS, '_obtenirNoteTerminaleEtudiant')).not.toContain('statutIntegrite');
        expect(corps(ACTIONS, '_obtenirNoteTerminaleEtudiant')).toContain('window.noteRetenueParLeCalcul(evaluationTerminale)');
        const hybride = corps(ACTIONS, '_selectionnerArtefactsHybride');
        expect(hybride).toContain('const denominateurObl = estFinale ? nombreObligatoiresTotal : evalsObligatoires.length;');
        expect(hybride).toMatch(/const nombreObligatoiresTotal = productionsNonPortfolio\s*\.filter\(p => p\.categorie === 'obligatoire' && p\.id !== terminalId\)\.length;/);
        expect(CARTE).toContain("<li>en standards, elle sort du portfolio : la compétence n'est jugée qu'à la reprise. Exceptions : une terminale non recevable vaut 0, et, en mode hybride une fois les notes finales cochées, une obligatoire non recevable aussi, comme une obligatoire non remise ;</li>");
    });

    it('dénotation : la note est le jugement saisi, aucune copie n\'y entre par calcul', () => {
        const den = tranche(lire('js/pratiques/pratique-configurable.js'), '_calculerPerformanceDenotation(da) {', '\n    }');
        expect(den).toContain('lireJugementDenotation(pratiqueId, da)');
        expect(den).not.toMatch(/evaluationsSauvegardees|_lireEvaluations/);
        expect(CARTE).toContain("<li>en dénotation, ta note est ton jugement : la copie n'y entre pas par calcul.</li>");
    });

    it('les anciennes affirmations ne reviennent ni dans la carte ni dans l\'infobulle', () => {
        expect(CARTE).not.toMatch(/Exclu du calcul de la moyenne|n'est pas une note de 0|absence d'évaluation/);
        expect(bulle('eval-integrite')).not.toMatch(/exclus des calculs de moyenne et de l\\'indice P/);
        expect(bulle('eval-integrite')).toContain('compte comme non remise dans la complétion');
    });
});
