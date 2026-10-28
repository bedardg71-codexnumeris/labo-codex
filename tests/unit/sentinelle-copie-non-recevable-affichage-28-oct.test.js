// 28 oct. 2026 — UNE COPIE NON RECEVABLE MONTRE SON LIBELLÉ AU LIEU DE SA NOTE ET DE SES NIVEAUX (retouche de #1175).
// Verdict `plans de travail/VERDICT-RELECTURE-2026-10-28-copie-non-recevable-note.md`. Décisions de Grégoire du 28 oct. :
//   1. (6 h 46) sur le PDF de l'étudiant·e et sur le formulaire, la note et les niveaux cèdent leur place à
//      « Non recevable (Plagiat) » ou « Non recevable (IA non autorisée) », les libellés du menu « Intégrité académique » ;
//      la rétroaction écrite reste ; l'évaluation reste en base, et retirer le statut fait tout revenir ;
//   2. (6 h 49) l'avis du formulaire, mot pour mot ;
//   3. (6 h 49) la ligne de la procédure de l'Aide, mot pour mot.
// La copie du banc : E et M sur deux critères (87,5), chaque critère avec son commentaire écrit. Noms fictifs.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

const registre = chargerScript('js/pratiques/pratique-registre.js', {}, {});
const NIVEAUX = [{ code: 'I', nom: 'Incomplet', couleur: '#c33' }, { code: 'D', nom: 'en Développement', couleur: '#e93' },
    { code: 'M', nom: 'Maîtrisé', couleur: '#39c' }, { code: 'E', nom: 'Étendu', couleur: '#3a6' }];
const PRODUCTIONS = [
    { id: 'P1', titre: 'Dissertation fictive', type: 'artefact-portfolio', categorie: 'obligatoire' },
    { id: 'P2', titre: 'Examen fictif', type: 'artefact-portfolio', categorie: 'selection' }];

const copie = (extra) => Object.assign({
    id: 'EV1', etudiantDA: '1028001', productionId: 'P1', grilleId: 'G1028', echelleId: 'E1028',
    statutRemise: 'evalue', statutIntegrite: 'plagiat', dateEvaluation: '2026-10-20T08:00:00.000Z',
    noteFinale: 87.5, niveauFinal: 'M', verrouillee: true,
    criteres: [{ critereId: 'c1', critereNom: 'Analyse', niveauSelectionne: 'E', ponderation: 50, retroaction: 'Commentaire fictif sur l’analyse.' },
               { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'M', ponderation: 50, retroaction: 'Commentaire fictif sur la structure.' }],
    retroactionFinale: 'Rétroaction fictive.'
}, extra);
const AUTRE = { id: 'EV2', etudiantDA: '1028001', productionId: 'P2', grilleId: 'G1028', echelleId: 'E1028', statutRemise: 'evalue',
    statutIntegrite: 'recevable', dateEvaluation: '2026-10-22T08:00:00.000Z', noteFinale: 95, niveauFinal: 'E', verrouillee: true,
    criteres: [{ critereId: 'c1', critereNom: 'Analyse', niveauSelectionne: 'E', ponderation: 50 }, { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'E', ponderation: 50 }] };

function pdf(evaluations, { hybride = false } = {}) {
    const ecritures = [];
    const db = { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => { ecritures.push('set'); },
        setSync: (k) => { ecritures.push(k); } };
    const data = chargerScript('js/synthese-retroaction-data.js', {
        db, cle: (k) => 'test_' + k,
        libelleCopieNonRecevable: registre.libelleCopieNonRecevable,
        obtenirEchelleResolue: () => ({ id: 'E1028', niveaux: NIVEAUX }),
        // Les repères de l'échelle : sans eux, le bilan ne nommerait ni force ni critère à travailler, et le banc ne
        // verrait pas qu'il se lit sur la copie entière (mutation survivante au premier break-test).
        niveauDuCodeDansEchelle: (code) => { const rang = ['I', 'D', 'M', 'E'].indexOf(code); return rang < 0 ? null : { rang }; },
        zoneDuNiveau: (code) => ({ I: 'priorite', D: 'priorite', M: 'signale', E: 'acquis' })[code] || null,
        obtenirDonneesSelonMode: (k) => (k === 'productions' ? PRODUCTIONS : k === 'evaluationsSauvegardees' ? evaluations
            : k === 'grillesTemplates' ? [{ id: 'G1028', nom: 'Grille témoin', criteres: [{ id: 'c1', nom: 'Analyse', ponderation: 50 }, { id: 'c2', nom: 'Structure', ponderation: 50 }] }] : []),
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
        obtenirEtudiantsCoursActif: () => [], obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null }, travauxOutils: { AUTOCOLLANTS: [] },
        obtenirPreference: () => null,
        obtenirConfigPratiqueActive: () => (hybride ? { configuration: { categories: { selection: { ponderation: 65 }, obligatoires: { ponderation: 35 } } } } : null),
        calculerDetailsNoteFinale: () => (hybride ? { portfolio: { methodeSelection: 'hybride', moyenne: 61.75, nombreEvalues: 1,
            artefactsRetenus: [{ productionId: 'P2', niveau: 'E', note: 95 }] } } : null)
    }).syntheseRetroactionData;
    const rendu = chargerScript('js/synthese-retroaction-rendu.js', { db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s) }).syntheseRetroactionRendu;
    const avant = JSON.parse(JSON.stringify(evaluations));
    return {
        feedback: (ev) => data.construireFeedback(ev, { id: 'F1' }, null),
        texte: (ev) => rendu.rendreSyntheseHTML(data.construireFeedback(ev, { id: 'F1' }, null))
            .replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' '),
        intactes: () => { expect(ecritures, 'aucune écriture au rendu').toEqual([]); expect(evaluations).toEqual(avant); }
    };
}

// Les niveaux de l'échelle, isolés : la rangée d'un critère et le bandeau impriment le code seul dans sa case.
const casesDeNiveau = (texte) => (texte.match(/(?:^|\s)[IDME](?=\s)/g) || []).map(s => s.trim());

describe('Le PDF de l’étudiant·e — une copie non recevable : le libellé, ni note ni niveaux ; la rétroaction écrite reste', () => {
    it('« Plagiat » : « Non recevable (Plagiat) » ; ni 87,5, ni E, ni M ; les deux commentaires écrits restent', () => {
        const ev = copie();
        const banc = pdf([ev]);
        const t = banc.texte(ev);
        expect(t).toContain('Non recevable (Plagiat)');
        expect(t).not.toMatch(/87[,.]5/);
        expect(casesDeNiveau(t)).toEqual([]);
        expect(t).not.toMatch(/Maîtrisé|Étendu/);
        expect(t).toContain('Commentaire fictif sur l’analyse.');
        expect(t).toContain('Commentaire fictif sur la structure.');
        banc.intactes();
    });

    it('« IA non autorisée » : son libellé, celui du menu', () => {
        const ev = copie({ statutIntegrite: 'ia' });
        const banc = pdf([ev]);
        const t = banc.texte(ev);
        expect(t).toContain('Non recevable (IA non autorisée)');
        expect(casesDeNiveau(t)).toEqual([]);
        banc.intactes();
    });

    it('la forme : aucun niveau dans le bandeau, la barre du trimestre ni les critères ; pas de portée ; un bilan sans niveaux', () => {
        const ev = copie();
        // TÉMOIN — la même copie recevable : la force (« Analyse », E) et le critère à consolider (« Structure », M).
        const temoin = pdf([ev]).feedback(Object.assign({}, ev, { statutIntegrite: 'recevable' }));
        expect(temoin.bilan.recurrents.force).not.toBe('');
        expect(temoin.bilan.concentration.signales.length).toBe(1);
        const f = pdf([ev]).feedback(ev);
        expect(f.overall).toMatchObject({ code: '', nonRecevable: 'Non recevable (Plagiat)' });
        expect(f.criteria.map(c => [c.code, c.points, c.comment])).toEqual([['', null, 'Commentaire fictif sur l’analyse.'], ['', null, 'Commentaire fictif sur la structure.']]);
        expect(f.trimestre.find(t => t.status === 'current').code).toBeNull();
        expect(f.portee).toBeNull();
        expect(f.bilan.recurrents.force).toBe('');
        expect(f.bilan.concentration.priorites.concat(f.bilan.concentration.signales)).toEqual([]);
    });

    it('RETIRER LE STATUT fait tout revenir : le bandeau M, les cases E et M, sans le libellé (aucune écriture entre les deux)', () => {
        const ev = copie();
        const banc = pdf([ev]);
        banc.texte(ev);
        const t = banc.texte(Object.assign({}, ev, { statutIntegrite: 'recevable' }));
        expect(t).not.toContain('Non recevable');
        expect(t).toMatch(/Niveau général · Maîtrisé/i);
        expect(pdf([ev]).feedback(Object.assign({}, ev, { statutIntegrite: 'recevable' })).criteria.map(c => c.code)).toEqual(['E', 'M']);
        banc.intactes();
    });

    it('le PDF d’une AUTRE copie : la case de la copie non recevable ne porte pas son niveau (« M ») ; témoin recevable, oui', () => {
        const ev = copie();
        const f = pdf([ev, AUTRE]).feedback(AUTRE);
        expect(f.trimestre.find(t => t.label === 'Dissertation fictive').code).toBeNull();
        const temoin = pdf([copie({ statutIntegrite: 'recevable' }), AUTRE]).feedback(AUTRE);
        expect(temoin.trimestre.find(t => t.label === 'Dissertation fictive').code).toBe('M');
    });

    it('HYBRIDE : l’obligatoire non recevable se lit « Non recevable (Plagiat) », sans note (87,5 parti) ; témoin recevable : « M, 87,5 % »', () => {
        const ev = copie();
        const f = pdf([ev, AUTRE], { hybride: true }).feedback(AUTRE);
        expect(f.bilan.note.obligatoires.map(o => [o.titre, o.niveau, o.note])).toEqual([['Dissertation fictive', 'Non recevable (Plagiat)', null]]);
        expect(pdf([ev, AUTRE], { hybride: true }).texte(AUTRE)).not.toMatch(/87[,.]5/);
        const temoin = pdf([copie({ statutIntegrite: 'recevable' }), AUTRE], { hybride: true }).feedback(AUTRE);
        expect(temoin.bilan.note.obligatoires.map(o => [o.niveau, o.note])).toEqual([['M', 87.5]]);
    });
});

describe('Le registre porte les libellés — ceux du menu « Intégrité académique », à la casse de l’écran', () => {
    it('plagiat, ia ; null pour recevable et soupçon', () => {
        const l = registre.libelleCopieNonRecevable;
        expect([l({ statutIntegrite: 'plagiat' }), l({ statutIntegrite: 'ia' }), l({ statutIntegrite: 'recevable' }), l({ statutIntegrite: 'soupcon' }), l(null)])
            .toEqual(['Non recevable (Plagiat)', 'Non recevable (IA non autorisée)', null, null, null]);
        const menu = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        expect(menu).toContain('<option value="plagiat">Non recevable (Plagiat)</option>');
        expect(menu).toContain('<option value="ia">Non recevable (IA non autorisée)</option>');
    });
});

// Le formulaire : le panneau réel de index.html (#travaux-eval-droite), le menu d'intégrité, le vrai module.
function formulaire() {
    const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
    const panneau = tranche(html, '<div id="travaux-eval-droite"', '<!-- fin travaux-eval-droite -->');
    const dom = new JSDOM(`<!doctype html><body>
        <select id="statutIntegrite"><option value="recevable">Recevable</option><option value="soupcon">Soupçon</option>
            <option value="plagiat">Plagiat</option><option value="ia">IA</option></select>
        <div id="divNotesIntegrite" class="u-hide"><textarea id="notesIntegrite"></textarea></div>
        ${panneau}</div></body>`);
    const document = dom.window.document;
    document.getElementById('noteProduction1').textContent = '87,5 %';
    document.getElementById('niveauProduction1').textContent = 'M';
    const evaluationEnCours = { statutIntegrite: 'recevable' };
    const win = chargerScript('js/evaluation-sauvegarde.js', {
        document, evaluationEnCours, libelleCopieNonRecevable: registre.libelleCopieNonRecevable,
        db: { getSync: (k, d) => d, setSync() {} }, cle: (k) => k,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} }
    });
    win.calculerNote = () => {};
    const poser = (statut) => { document.getElementById('statutIntegrite').value = statut; win.changerStatutIntegrite(); };
    return { document, poser, evaluationEnCours, panneau: document.getElementById('travaux-eval-droite') };
}

const AVIS = 'Travail non recevable Ton évaluation est gardée, mais la copie montre « Non recevable » au lieu de sa note et de ses niveaux, '
    + 'jusque sur le PDF de l’étudiant·e. Dans la note du cours, elle vaut ce que dit ta pratique : 0 en sommative, un travail non '
    + 'satisfaisant en spécifications, hors du portfolio en standards. Dans la complétion, elle compte comme non remise. Retirer le '
    + 'statut fait tout revenir.';
const JETON = ' Un jeton de reprise peut être appliqué pour permettre une nouvelle remise.';
const net = (s) => s.replace(/\s+/g, ' ').trim().replace(/'/g, '’');
// Le titre, le saut de ligne, le paragraphe : un espace par nœud, comme l'écran les montre.
const lu = (avis) => [...avis.childNodes].map(n => n.textContent).join(' ');

describe('Le formulaire — la note et le niveau cèdent leur place au libellé ; l’avis de Grégoire, mot pour mot', () => {
    it('« Plagiat » : la classe du panneau, le libellé ; la note et le niveau restent écrits (masqués), pour la sauvegarde', () => {
        const f = formulaire();
        f.poser('plagiat');
        expect(f.panneau.classList.contains('copie-non-recevable')).toBe(true);
        const libelle = f.document.getElementById('libelleNonRecevable1');
        expect([libelle.textContent, libelle.classList.contains('u-hide')]).toEqual(['Non recevable (Plagiat)', false]);
        expect([f.document.getElementById('noteProduction1').textContent, f.document.getElementById('niveauProduction1').textContent]).toEqual(['87,5 %', 'M']);
    });

    it('l’avis : titre en gras, le paragraphe, et la phrase du jeton pour le plagiat seulement ; les insécables des guillemets et du deux-points', () => {
        const f = formulaire();
        f.poser('plagiat');
        const avis = f.document.getElementById('message-non-recevable');
        expect(avis.querySelector('strong').textContent).toBe('Travail non recevable');
        expect(net(lu(avis))).toBe(net(AVIS + JETON));
        expect(avis.textContent).toContain('« Non recevable »');
        expect(avis.textContent).toContain('ta pratique : 0');
        f.poser('ia');
        expect(f.document.querySelectorAll('#message-non-recevable')).toHaveLength(1);
        expect(net(lu(f.document.getElementById('message-non-recevable')))).toBe(net(AVIS));
        expect(f.document.getElementById('libelleNonRecevable1').textContent).toBe('Non recevable (IA non autorisée)');
    });

    it('RETIRER LE STATUT fait tout revenir : ni classe, ni libellé, ni avis ; « Soupçon à vérifier » n’est pas non recevable', () => {
        const f = formulaire();
        f.poser('plagiat');
        f.poser('recevable');
        expect(f.panneau.classList.contains('copie-non-recevable')).toBe(false);
        expect(f.document.getElementById('libelleNonRecevable1').classList.contains('u-hide')).toBe(true);
        expect(f.document.getElementById('message-non-recevable')).toBeNull();
        f.poser('soupcon');
        expect(f.panneau.classList.contains('copie-non-recevable')).toBe(false);
    });

    it('le CSS masque la note, le niveau, la portée et la ligne de la note remise sous la classe ; la couleur du niveau n’est pas posée', () => {
        const css = readFileSync(path.join(RACINE, 'styles.css'), 'utf8');
        expect(css).toMatch(/\.travaux-panneau-droite\.copie-non-recevable #noteFinale1 > \.u-flex-between,\s*\.travaux-panneau-droite\.copie-non-recevable #porteeNote1,\s*\.travaux-panneau-droite\.copie-non-recevable #noteRemise1 \{\s*display: none;/);
        const calcul = readFileSync(path.join(RACINE, 'js/evaluation-calcul.js'), 'utf8');
        expect(calcul).toContain("if (noteContainer && _niveauColorable(niveauGlobal, enPoints)) {");
        expect(calcul).toContain("return niveauGlobal !== '--' && !enPoints && !nonRecevable;");
    });
});

describe('L’aperçu de révision avant export (enseignant·e) dit ce que dira le PDF', () => {
    it('une copie non recevable : « Note : » suivi de son libellé, avant toute autre ligne de note', () => {
        const src = readFileSync(path.join(RACINE, 'js/travaux-export-pdf.js'), 'utf8');
        const corps = tranche(src, 'function _lignesNoteApercu(evaluation) {', 'function afficherRevisionExport(fichierId) {');
        expect(corps).toContain("const nonRecevablePreview = typeof libelleCopieNonRecevable === 'function' && libelleCopieNonRecevable(evaluation);");
        expect(corps).toMatch(/if \(nonRecevablePreview\) \{\s*lignes \+= `<p><strong>Note :<\/strong> \$\{echapperHtml\(nonRecevablePreview\)\}<\/p>`;\s*\} else if \(enPointsPreview\)/);
        expect(src).toContain('html += _lignesNoteApercu(evaluation);');
    });
});

describe('L’Aide — la ligne de la procédure, mot pour mot ; les quatre lignes par famille et le « 7/9 » ne bougent pas', () => {
    it('la ligne validée par Grégoire le 28 oct. à 6 h 49', () => {
        const aide = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        expect(aide).toContain('Non recevable, ton évaluation est gardée, mais la copie montre «&nbsp;Non recevable&nbsp;» au lieu de sa note et de ses niveaux, jusque sur le PDF&nbsp;; dans la note, elle vaut ce que dit la règle ci-dessus. Verrouille ensuite.');
        expect(aide).not.toContain('tes critères gardent ton évaluation');
    });
});
