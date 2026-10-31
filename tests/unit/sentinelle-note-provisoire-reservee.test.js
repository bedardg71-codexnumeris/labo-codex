import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE (30 octobre 2026) — « NOTE PROVISOIRE » EST RÉSERVÉE AUX PRATIQUES ALTERNATIVES.
//
// Principe validé par Grégoire : ailleurs, « note du cours à ce jour », ou « note du cours » quand
// on dit qu'elle s'affiche ou non. Ce banc lit les mots à l'écran (les chaînes et les gabarits de
// js/, le HTML de index.html, sans les commentaires) et refuse « note provisoire », sauf les
// exceptions NOMMÉES ci-dessous. Une exception qui ne se trouve plus rougit aussi : la liste suit
// le code, elle ne garde pas de place à ce qui est parti.
//
// Hors de ce banc, délibérément : les commentaires du code ; les noms internes (`noteProvisoire`).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

const NOTE_PROVISOIRE = /\bnotes?(?:\s|&nbsp;)+provisoires?\b/gi;

// #1207 (décision de Grégoire, 30 oct. ; textes du 31 oct.) : en sommative, « Note actuelle du cours ».
const PRATIQUE_ALTERNATIVE = 'pratique alternative, le mot que le principe garde';
// Un gabarit peut composer le mot : `Note ${estFinale ? 'finale' : 'provisoire'}`. Aucune chaîne seule ne le porte.
const GABARIT_COMPOSE = 'Note provisoire (gabarit composé)';

const EXCEPTIONS = [
    { fichier: 'index.html', contient: '(en pratique alternative de notation, la note provisoire)', nb: 1, motif: PRATIQUE_ALTERNATIVE },
    { fichier: 'js/changelog-data.js', contient: 'en tête de sa rétroaction et sa note provisoire', nb: 1, motif: 'Nouvelles déjà publiées' },
    { fichier: 'js/changelog-data.js', contient: 'Le bloc «&nbsp;Note provisoire&nbsp;» y garde', nb: 1, motif: 'Nouvelles déjà publiées' },
    { fichier: 'js/profil-etudiant-sections-affichage.js', contient: 'Note provisoire de session', nb: 2, motif: PRATIQUE_ALTERNATIVE },
    { fichier: 'index.html', contient: 'ou de « Note provisoire » (pratique alternative), et retire la liste', nb: 1, motif: PRATIQUE_ALTERNATIVE },
    { fichier: 'js/accompagnement-contenu-terme.js', contient: 'ou de « Note provisoire » (pratique alternative), et ne listent plus', nb: 1, motif: PRATIQUE_ALTERNATIVE },
    { fichier: 'js/synthese-retroaction-rendu.js', contient: 'Note provisoire', nb: 4, motif: PRATIQUE_ALTERNATIVE },
];

function fichiersJs(dossier) {
    return readdirSync(dossier, { withFileTypes: true }).flatMap(e => {
        const chemin = path.join(dossier, e.name);
        if (e.isDirectory()) return fichiersJs(chemin);
        return e.name.endsWith('.js') ? [chemin] : [];
    });
}

// Les textes qu'un fichier .js peut mettre à l'écran : ses chaînes et les morceaux de ses gabarits.
function textesDuJs(source) {
    const textes = [];
    const jetons = acorn.tokenizer(source, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true });
    for (const jeton of jetons) {
        if ((jeton.type.label === 'string' || jeton.type.label === 'template') && typeof jeton.value === 'string') {
            textes.push(jeton.value);
        }
    }
    return textes;
}

// Les gabarits qui composent le mot : un morceau finit par « note », et son `${…}` rend « provisoire ».
function textesComposesDuJs(source) {
    const jetons = [...acorn.tokenizer(source, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true })];
    const textes = [];
    jetons.forEach((jeton, i) => {
        if (jeton.type.label !== 'template' || !/\bnotes?(?:\s|&nbsp;)+$/i.test(String(jeton.value))) return;
        for (let j = i + 2, profondeur = 0; j < jetons.length; j++) {
            const nature = jetons[j].type.label;
            if (nature === '{' || nature === '${') profondeur++;
            if (nature === '}' && profondeur-- === 0) break;
            if (nature === 'string' && /^provisoires?$/i.test(jetons[j].value)) { textes.push(GABARIT_COMPOSE); break; }
        }
    });
    return textes;
}

function textesDuHtml(source) {
    return source.replace(/<!--[\s\S]*?-->/g, '').split('\n');
}

// Rend les occurrences trouvées : { fichier, texte, nb } par texte qui en porte.
function occurrences(fichier, textes) {
    return textes.flatMap(texte => {
        const nb = (texte.match(NOTE_PROVISOIRE) || []).length;
        return nb > 0 ? [{ fichier, texte, nb }] : [];
    });
}

function toutesLesOccurrences() {
    const js = fichiersJs(path.join(racine, 'js')).flatMap(chemin =>
        occurrences(path.relative(racine, chemin).split(path.sep).join('/'), [...textesDuJs(readFileSync(chemin, 'utf8')), ...textesComposesDuJs(readFileSync(chemin, 'utf8'))]));
    return [...js, ...occurrences('index.html', textesDuHtml(readFileSync(path.join(racine, 'index.html'), 'utf8')))];
}

describe('« note provisoire » : réservée aux pratiques alternatives', () => {
    const trouvees = toutesLesOccurrences();

    it('aucune occurrence à l\'écran hors des exceptions nommées', () => {
        const horsListe = trouvees.filter(o => !EXCEPTIONS.some(e => e.fichier === o.fichier && o.texte.includes(e.contient)));
        expect(horsListe.map(o => `${o.fichier} : ${o.texte.trim().slice(0, 160)}`)).toEqual([]);
    });

    it.each(EXCEPTIONS)('l\'exception $fichier, « $contient », existe encore, $nb fois', ({ fichier, contient, nb }) => {
        const vues = trouvees.filter(o => o.fichier === fichier && o.texte.includes(contient));
        expect(vues.reduce((somme, o) => somme + o.nb, 0)).toBe(nb);
    });

    it('le détecteur voit le mot sous toutes ses formes, et pas dans un commentaire', () => {
        const source = [
            '// note provisoire dans un commentaire',
            '/* Note provisoire dans un bloc */',
            'const a = \'Sa note provisoire\';',
            'const b = "Les notes provisoires";',
            'const c = `La Note&nbsp;provisoire ${a}`;',
            'const d = \'La note\\u00a0provisoire\';',
            'const noteProvisoire = true;',
        ].join('\n');
        expect(occurrences('témoin.js', textesDuJs(source)).length).toBe(4);
        expect(occurrences('témoin.html', textesDuHtml('<!-- note provisoire -->\n<p>Note provisoire</p>')).length).toBe(1);
    });

    it('le détecteur voit le mot composé par un gabarit, et pas ses voisins', () => {
        expect(textesComposesDuJs('const a = `Note ${f ? \'finale\' : \'provisoire\'} = 1`;')).toEqual([GABARIT_COMPOSE]);
        expect(textesComposesDuJs('const a = `Note ${f ? \'finale\' : \'de passage\'} = 1`;')).toEqual([]);
        expect(textesComposesDuJs('const a = `Note ${f} et ${g ? \'provisoire\' : \'x\'}`;')).toEqual([]);
    });
});

describe('#1207 — en sommative, « Note actuelle du cours » ; en pratique alternative, « note provisoire » reste', () => {
    const lire = f => readFileSync(path.join(racine, f), 'utf8');
    const sections = lire('js/profil-etudiant-sections-affichage.js');
    const COPIE = {
        id: 'E1', etudiantDA: '111', productionId: 'A1', grilleId: 'G1', echelleId: 'ECH', niveauFinal: 'D', noteFinale: 74,
        criteres: [{ critereId: 'c1', critereNom: 'Structure', niveauSelectionne: 'D', ponderation: 100 }]
    };

    /** Le PDF de bout en bout, de `construireFeedback` au rendu : la vraie porte de chaque famille. */
    function pdf({ famille, notesFinales = false, jetons = false, hybride = false }) {
        const sommative = famille === 'sommative';
        const categories = hybride ? { selection: { ponderation: 65 }, obligatoires: { ponderation: 35 } } : undefined;
        const productions = hybride
            ? [{ id: 'A1', titre: 'Artefact 1', type: 'artefact-portfolio', categorie: 'selection' }, { id: 'A9', titre: 'Artefact 9', type: 'artefact-portfolio', categorie: 'obligatoire' }]
            : [{ id: 'A1', titre: 'Artefact 1', type: 'artefact-portfolio' }];
        const copies = hybride ? [COPIE, { ...COPIE, id: 'E9', productionId: 'A9' }] : [COPIE];
        const retenus = copies.map((c) => ({ productionId: c.productionId, niveau: 'D', note: 74 }));
        const data = chargerScript('js/synthese-retroaction-data.js', {
            db: { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {}, setSync: () => {} },
            cle: (k) => 'test_' + k,
            obtenirEchelleResolue: () => null,
            obtenirDonneesSelonMode: (k) => (k === 'productions' ? productions : k === 'evaluationsSauvegardees' ? copies : []),
            obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
            obtenirEtudiantsCoursActif: () => [],
            obtenirGroupesCours: () => [],
            travauxStockage: { obtenirAnnotationFichier: () => null },
            travauxOutils: { AUTOCOLLANTS: [] },
            obtenirPreference: () => null,
            obtenirIdPratiqueActive: () => 'P1',
            obtenirConfigPratiqueActive: () => (sommative ? { notesFinales } : { configuration: { notesFinales, categories } }),
            jetonsDeclares: () => (jetons ? { actif: true } : null),
            calculerDetailsNoteFinale: () => (sommative ? null : { portfolio: { methodeSelection: hybride ? 'hybride' : 'meilleurs', moyenne: 74, nombreEvalues: copies.length, artefactsRetenus: retenus } }),
            simulerIndices: () => (sommative ? { recit: { famille: 'SOM', synthese: { noteFinale: 74 }, resultats: [{ sort: 'compte', label: 'Artefact 1', note: 74 }] } } : { recit: null })
        });
        const rendu = chargerScript('js/synthese-retroaction-rendu.js', {
            db: { getSync: (k, d) => (d !== undefined ? d : null) },
            cle: (k) => 'test_' + k,
            echapperHtml: (s) => String(s)
        });
        const html = rendu.syntheseRetroactionRendu.rendreSyntheseHTML(data.syntheseRetroactionData.construireFeedback(COPIE, { id: 'F1' }, null));
        return html.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, '\'').replace(/\s+/g, ' ');
    }

    it('PDF, sommative, sans jetons : le titre et la mention validés, plus aucun « provisoire »', () => {
        const t = pdf({ famille: 'sommative' });
        expect(t).toContain('Note actuelle du cours');
        expect(t).toContain('Cette note peut changer selon tes prochains travaux.');
        expect(t).not.toMatch(/provisoire/i);
    });

    it('PDF, sommative, avec jetons : la mention validée', () => {
        const t = pdf({ famille: 'sommative', jetons: true });
        expect(t).toContain('Cette note peut changer selon tes prochains travaux et l\'application de jetons.');
        expect(t).not.toMatch(/provisoire/i);
    });

    it('PDF, sommative aux notes finalisées : « Note finale », et aucune mention', () => {
        const t = pdf({ famille: 'sommative', notesFinales: true });
        expect(t).toContain('Note finale');
        expect(t).not.toContain('Note actuelle du cours');
        expect(t).not.toContain('peut changer');
    });

    it('PDF, pratique alternative, sans jetons : les trois mots d\'avant', () => {
        const t = pdf({ famille: 'standards' });
        expect(t).toContain('Note provisoire');
        expect(t).toContain('Note provisoire — peut changer selon tes prochains travaux.');
        expect(t).not.toContain('Note actuelle du cours');
    });

    it('PDF, pratique alternative, avec jetons : la mention d\'avant', () => {
        expect(pdf({ famille: 'standards', jetons: true })).toContain('Note provisoire — peut changer selon tes prochains travaux et l\'application de jetons.');
    });

    describe('la ligne de calcul reprend le mot du titre, ses deux formes', () => {
        it('sommative non finalisée : « Note actuelle = … »', () => {
            const t = pdf({ famille: 'sommative' });
            expect(t).toContain('Note actuelle = 74 %');
            expect(t).not.toContain('Note finale');
        });
        it('sommative finalisée : « Note finale = … »', () => {
            const t = pdf({ famille: 'sommative', notesFinales: true });
            expect(t).toContain('Note finale = 74 %');
            expect(t).not.toContain('Note actuelle');
        });
        it('pratique alternative non finalisée : « Note provisoire = … »', () => {
            const t = pdf({ famille: 'standards' });
            expect(t).toContain('Note provisoire = 74 %');
            expect(t).not.toContain('Note finale');
        });
        it('pratique alternative finalisée : « Note finale = … »', () => {
            const t = pdf({ famille: 'standards', notesFinales: true });
            expect(t).toContain('Note finale = 74 %');
            expect(t).not.toContain('Note provisoire');
        });
        it('forme avec contributions, non finalisée : « Note provisoire = … pts + … pts = … »', () => {
            const t = pdf({ famille: 'standards', hybride: true });
            expect(t).toMatch(/Note provisoire = 48,1 pts \+ 25,9 pts = 74 %/);
            expect(t).not.toContain('Note finale');
        });
        it('forme avec contributions, finalisée : « Note finale = … pts + … pts = … »', () => {
            const t = pdf({ famille: 'standards', hybride: true, notesFinales: true });
            expect(t).toMatch(/Note finale = 48,1 pts \+ 25,9 pts = 74 %/);
            expect(t).not.toContain('Note provisoire');
        });
    });

    describe('« Notes finalisées » : le réglage et le glossaire disent les deux titres', () => {
        it('le réglage, mot pour mot', () => {
            const html = lire('index.html');
            expect(html).toContain('Active le titre « Note finale » sur les PDF de rétroaction, à la place de « Note actuelle du cours » (pratique sommative) ou de « Note provisoire » (pratique alternative), et retire la liste « Artefacts à venir ». À activer en fin de session, quand les notes sont arrêtées.');
            expect(html).not.toContain('(au lieu de « Note provisoire »)');
        });
        it('le glossaire, mot pour mot, et le reste inchangé', () => {
            const terme = lire('js/accompagnement-contenu-terme.js');
            expect(terme).toContain('Une case de la pratique de notation, à cocher quand les notes sont arrêtées. Les PDF de rétroaction titrent alors « Note finale », à la place de « Note actuelle du cours » (pratique sommative) ou de « Note provisoire » (pratique alternative), et ne listent plus les « Artefacts à venir ». En mode « Hybride », une production obligatoire non remise compte alors pour zéro');
            expect(terme).not.toContain('« Note finale » au lieu de « Note provisoire »');
        });
    });

    it('l\'export garde « provisoire » dans toutes les pratiques : un état du fichier, décidé par Grégoire le 31 oct.', () => {
        expect(lire('js/export-resultats-finaux.js')).toContain("statut = (ctx.notesFinales === true && !(r.details && r.details.estProvisoire)) ? 'final' : 'provisoire';");
    });

    it('profil, sommative : le titre et la formule ; aucun « provisoire », hors du nom d\'une classe CSS', () => {
        const carte = tranche(sections, 'function _genererNoteSessionSommative(', '\n}\n');
        expect(carte).toContain("estFinale ? 'Note finale de session' : 'Note actuelle du cours'");
        expect(carte).toContain("estFinale ? 'Note finale' : 'Note actuelle'} = ");
        expect(carte.replace(/note-finale-message-provisoire/g, '')).not.toMatch(/provisoire/i);
    });

    it('profil, standards : les deux cartes gardent « Note provisoire de session »', () => {
        const avantLaSommative = tranche(sections, 'function genererSectionProductions(', 'htmlNoteFinale = _genererNoteSessionSommative(da)');
        expect(avantLaSommative.match(/'Note provisoire de session'/g)).toHaveLength(2);
    });

    it('la carte de la sommative ne s\'écrit que sans détail de portfolio : les deux autres ne la voient jamais', () => {
        expect(sections).toContain('if (!detailsNoteFinale) htmlNoteFinale = _genererNoteSessionSommative(da);');
        expect(lire('js/profil-etudiant-actions.js')).toContain('if (!estFamilleStandards) return null;');
    });
});

describe('Les mots qui la remplacent, aux surfaces du niveau RàI', () => {
    const lire = f => readFileSync(path.join(racine, f), 'utf8');

    it.each([
        ['js/profil-etudiant-calculs.js', 'Note du cours à ce jour sous le seuil minimal de réussite, avec une difficulté sur un critère de fondation.'],
        ['js/profil-etudiant-calculs.js', 'il fixe le niveau jusqu\\\'à ce que la note du cours s\\\'affiche.'],
        ['js/profil-etudiant-calculs.js', 'La note du cours ne s\\\'affiche pas encore : le niveau l\\\'attend.'],
        ['js/atelier-algo.js', 'Jusqu’à ce que la note du cours s’affiche. Ensuite,'],
        ['js/tableau-bord-apercu.js', 'en attente de sa note du cours.'],
        ['js/accompagnement-contenu-hover.js', 'd’après la note du cours à ce jour, devant le seuil'],
        ['js/accompagnement-contenu-popup.js', 'Niveau 1 (vert) — Note du cours à ce jour au seuil'],
        ['js/accompagnement-contenu-terme.js', 'Tant que la note du cours ne s’affiche pas, un signalement diagnostique'],
        ['js/guides-pedagogiques.js', 'Note du cours à ce jour sous ce seuil, palier 2'],
    ])('%s : « %s »', (fichier, mots) => {
        expect(lire(fichier)).toContain(mots);
    });
});

/*
 * BREAK-TESTS du #1207 (31 oct. 2026), chaque changement du code annulé après sa mesure ; rouges de cette sentinelle et de celle du portfolio :
 *   profil, titre sommative revenu à provisoire : 2
 *   profil, formule revenue à provisoire : 2
 *   profil, carte standards passée à actuelle : 2
 *   PDF, marque ignorée (tout provisoire) : 2
 *   PDF, marque ignorée (tout actuelle) : 2
 *   PDF, titre sommatif retouché : 1
 *   PDF, mention sans jetons retouchée : 1
 *   PDF, mention avec jetons retouchée : 1
 *   PDF, alternative retouchée sans jetons : 2
 *   PDF, alternative retouchée avec jetons : 2
 *   PDF, jetons inversés : 4
 *   PDF, données sans la marque sommative : 2
 *   PDF, mention sur les notes finalisées : 1
 *   PDF, titre sans la case finale : 2
 *   dans la spec WebKit 921, la formule revenue à provisoire : 1
 * Les relevés R1, R2 et R4 (31 oct. 2026), même méthode :
 *   ligne simple figée à « Note finale » : 2 ; ligne avec contributions figée à « Note finale » : 2 ; la case finale ignorée : 3 ; toujours « Note finale » : 4 ; sommative dite provisoire : 4 ; sommative au titre entier : 1 ; alternative dite actuelle : 4 ; réglage ancien : 3 ; réglage retouché : 1 ; glossaire ancien : 3 ; glossaire, le reste retouché : 1 ; export : « actuelle » en toutes pratiques : 1
 */
