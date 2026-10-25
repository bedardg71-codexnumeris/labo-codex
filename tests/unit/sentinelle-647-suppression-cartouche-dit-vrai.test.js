import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE #647 (2 septembre 2026, soir) — LA SUPPRESSION D'UNE CARTOUCHE DIT
// VRAI, SUR SES QUATRE CHEMINS VIVANTS — ET LE CINQUIÈME, MORT, EST PARTI.
//
// `grep -rn "function supprimerCartouche" js/` rendait SIX déclarations. Cinq
// vivantes, de portées RÉELLEMENT différentes :
//   1. onglet Données (`donnees-v2.js`, `supprimerCartoucheDefinitivement`) —
//      n'écrit QUE la Bibliothèque ; la cartouche RESTE dans son ancrage
//      `cartouches_<grilleId>`, et les évaluations (qui lisent l'ancrage) ne
//      perdent rien. Rendu vrai le 31 août (183b515b), sans sentinelle jusqu'ici.
//   2. Conception › cartouches, la liste et la zone d'édition (`cartouches.js`,
//      `supprimerCartoucheConfirm`, aussi derrière `supprimerCartoucheActive`) —
//      l'ANCRAGE seul. C'est la fenêtre que Grégoire a sous les yeux : elle ne
//      disait ni la portée, ni l'irréversibilité. Mots arrêtés par lui le 2 sept.
//   3. Conception › cartouches, section 1 de la bibliothèque modale
//      (`supprimerCartoucheDefinitivement`) — le plus destructeur : ancrage ET
//      Bibliothèque. Ne disait que « irréversible » ; depuis le 3 sept., la grille
//      est nommée dans TOUS les cas (c'est l'ancrage qu'on vide), la Bibliothèque
//      seulement quand la cartouche y est.
//      ↻ #1155 (25 oct. 2026, décision de Grégoire pour les grilles, étendue par Cowork aux
//      cartouches) : ce chemin n'écrit plus que l'ANCRAGE ; l'exemplaire de la bibliothèque
//      reste, et la question le dit (« Son exemplaire de ta bibliothèque reste. ») quand la
//      relation des deux colonnes le lie (`id`, ou `idOriginal` après « ← Utiliser »).
//   4. Conception › cartouches, section 2 (`supprimerCartoucheDeBibliothequePartagee`)
//      — bibliothèque seulement, comme le chemin 1.
//   †  `supprimerCartouche()` — AUCUN appelant, aucun export : retirée, pas corrigée.
//
// ⚠ INVARIANT COUPLÉ. Un message n'est vrai que tant que la fonction fait ce
// qu'il annonce. Si une main future fait écrire l'ancrage au chemin 1 sans
// changer ses mots, le message ment dans l'autre sens. La sentinelle tient les
// deux bouts : les mots ET ce que la fonction touche.
//
// ⚠ TÉMOIN NÉGATIF. Une suppression complète et sans surprise se fait sans un
// mot de plus : les chemins 3 et 4, quand rien ne survit, posent EXACTEMENT la
// question d'avant. Le chemin 2 gagne la portée et l'irréversibilité qu'il
// n'avait pas — c'est le minimum, pas un mot de plus.
//
// Chaque essai instancie la VRAIE fonction, extraite du fichier de production.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racineProjet, rel), 'utf8');
const nettoyer = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const donneesV2 = nettoyer(lire('js/donnees-v2.js'));
const cartouchesJs = nettoyer(lire('js/cartouches.js'));
const biblioCartouches = nettoyer(lire('js/cartouches-bibliotheque.js'));

function corps(src, nom) {
    let i = src.indexOf('function ' + nom + '(');
    expect(i, nom + ' doit exister').toBeGreaterThan(-1);
    // Une fonction `async` garde son mot-clé : sans lui, ses `await` ne compilent pas.
    if (src.slice(Math.max(0, i - 6), i) === 'async ') i -= 6;
    let j = i, prof = 0, vu = false;
    for (; j < src.length; j++) {
        if (src[j] === '{') { prof++; vu = true; }
        else if (src[j] === '}') { prof--; if (vu && prof === 0) break; }
    }
    return src.slice(i, j + 1);
}

function instancier(src, nom, globaux) {
    const noms = Object.keys(globaux);
    const fabrique = new Function(...noms, corps(src, nom) + '\nreturn ' + nom + ';');
    return fabrique(...noms.map(n => globaux[n]));
}

const cle = (k) => 'h2026_' + k;

// #1155 — la relation unique des deux colonnes, extraite de bibliotheque-ui.js (pas recopiée).
const DEBUT_RELATION = 'BibliothequeUI.lieeAExemplaire = function (item, exemplaire) {';
const lieeAExemplaire = new Function('item', 'exemplaire',
    tranche(nettoyer(lire('js/bibliotheque-ui.js')), DEBUT_RELATION, '\n    };', { longueurMin: 40 }).slice(DEBUT_RELATION.length));

// =============================================================================
// CHEMIN 1 — onglet Données : l'avertissement mesure la survivance, il ne la
// suppose pas.
// =============================================================================
function verifierDependances({ dansAncrage, evalsH2026 = [], evalsA2025 = [] }) {
    const lectures = [];
    const magasins = {
        'h2026_cartouches_G1': dansAncrage ? [{ id: 'C1', nom: 'Cartouche 1' }] : [],
        'h2026_evaluationsSauvegardees': evalsH2026,
        'a2025_evaluationsSauvegardees': evalsA2025
    };
    const db = {
        getSync: (k, defaut) => { lectures.push(k); return (k in magasins) ? magasins[k] : (defaut === undefined ? null : defaut); }
    };
    const fn = instancier(donneesV2, 'verifierDependancesCartouche', {
        db, cle, console,
        enumererTrimestres: () => [{ id: 'h2026' }, { id: 'a2025' }],
        obtenirToutesLesCartouchesBibliothequeSync: () => [{ id: 'C1', nom: 'Cartouche 1', grilleId: 'G1' }],
        obtenirNomGrilleAssociee: (gid) => (gid === 'G1' ? 'Grille A' : gid)
    });
    return { resultat: fn('C1'), lectures };
}

describe('#647 · chemin 1 (Données) — l\'avertissement décrit ce qui se passe réellement', () => {
    it('cartouche ancrée, 4 évaluations sur deux trimestres : elle reste, les rétroactions restent', () => {
        const { resultat } = verifierDependances({
            dansAncrage: true,
            evalsH2026: [{ cartoucheId: 'C1' }, { cartoucheId: 'C1' }, { cartoucheId: 'AUTRE' }, { cartoucheId: 'C1' }],
            evalsA2025: [{ cartoucheId: 'C1' }]
        });
        expect(resultat.resteDansGrille).toBe(true);
        expect(resultat.dependances).toEqual([]);
        expect(resultat.avertissements).toHaveLength(2);
        expect(resultat.avertissements[0]).toContain('reste attachée à la grille « Grille A »');
        expect(resultat.avertissements[1]).toMatch(/^4 évaluation\(s\)/);
        expect(resultat.avertissements[1]).toContain('restent intactes');
        expect(resultat.avertissements.join(' ')).not.toMatch(/perdu/);
    });

    it('cartouche absente de l\'ancrage : on le dit autrement, sans inventer de perte', () => {
        const { resultat } = verifierDependances({ dansAncrage: false, evalsH2026: [{ cartoucheId: 'C1' }, { cartoucheId: 'C1' }] });
        expect(resultat.resteDansGrille).toBe(false);
        expect(resultat.avertissements[0]).toContain('Aucune copie');
        expect(resultat.avertissements[1]).toMatch(/^2 évaluation\(s\)/);
        expect(resultat.avertissements[1]).toContain('ne change rien');
    });

    it('témoin négatif : sans évaluation, pas de ligne sur les évaluations', () => {
        const { resultat } = verifierDependances({ dansAncrage: true });
        expect(resultat.avertissements).toHaveLength(1);
    });

    it('la survivance est lue sur la clé EXACTE de l\'ancrage, pas sur un balayage de la famille', () => {
        const { lectures } = verifierDependances({ dansAncrage: true });
        expect(lectures.filter(k => k.includes('cartouches_'))).toEqual(['h2026_cartouches_G1']);
    });
});

describe('#647 · chemin 1 — l\'invariant couplé : la fonction ne touche pas l\'ancrage que le message promet', () => {
    it('supprimerCartoucheDefinitivement (Données) ne lit ni n\'écrit aucune clé cartouches_<grilleId>', () => {
        const c = corps(donneesV2, 'supprimerCartoucheDefinitivement');
        expect(c).not.toContain('cartouches_');
        expect(c).not.toMatch(/db\.(set|setSync|modifier|remove|removeSync)\(/);
        expect(c).toContain('retirerCartoucheDeLaBibliotheque(');
    });

    it('retirerCartoucheDeLaBibliotheque n\'écrit que la Bibliothèque', () => {
        const c = corps(biblioCartouches, 'retirerCartoucheDeLaBibliotheque');
        expect(c).toContain('db.modifier(CLE_BIBLIOTHEQUE_CARTOUCHES');
        expect(c).not.toContain('cartouches_');
    });

    it('la modal change ses trois libellés ENSEMBLE, pilotés par la survivance mesurée', () => {
        const c = corps(donneesV2, 'ouvrirModalSuppressionRessource');
        expect(c).toContain('retirer de la Bibliothèque la');
        expect(c).toContain('la cartouche reste dans sa grille');
        expect(c).toContain("'Retirer de la bibliothèque'");
        expect((c.match(/cartoucheResteDansGrille/g) || []).length).toBeGreaterThanOrEqual(4);
        expect(donneesV2).not.toContain('seront perdues');
    });
});

// =============================================================================
// CHEMIN 2 — la liste et la zone d'édition : l'ancrage seul, et la question le
// dit, avec ce qui survit.
// =============================================================================
async function questionChemin2({ dansBibliotheque, evaluations = [], verrouille = false }) {
    const questions = [];
    const alertes = [];
    const modifier = vi.fn();
    const fn = instancier(cartouchesJs, 'supprimerCartoucheConfirm', {
        db: {
            get: async (k) => ({
                'h2026_cartouches_G1': [{ id: 'C1', nom: 'Cartouche 1', verrouille }],
                'h2026_grillesTemplates': [{ id: 'G1', nom: 'Grille A' }],
                'h2026_evaluationsSauvegardees': evaluations
            })[k] ?? null,
            modifier
        },
        cle,
        alert: (m) => alertes.push(m),
        confirm: (q) => { questions.push(q); return false; },
        window: {},
        obtenirToutesLesCartouchesBibliotheque: async () => (dansBibliotheque ? [{ id: 'C1', grilleId: 'G1' }] : []),
        afficherBanqueCartouches: vi.fn(),
        chargerCartouchesRetroaction: vi.fn()
    });
    await fn('C1', 'G1');
    // La question vient AVANT toute écriture : refuser ne détruit rien.
    expect(modifier).not.toHaveBeenCalled();
    return { questions, alertes };
}

describe('#647 · chemin 2 (liste et zone d\'édition) — la fenêtre que Grégoire a sous les yeux', () => {
    it('dans la bibliothèque aussi, employée par 2 évaluations : la portée, ce qui survit, l\'irréversibilité', async () => {
        const { questions } = await questionChemin2({ dansBibliotheque: true, evaluations: [{ cartoucheId: 'C1' }, { cartoucheId: 'C1' }, { cartoucheId: 'X' }] });
        expect(questions).toEqual([
            'Supprimer la cartouche «Cartouche 1» de sa grille « Grille A » ?\n\n'
            + 'Elle reste dans la Bibliothèque.\n'
            + "2 évaluation(s) l'emploient : leur rétroaction déjà rédigée est conservée.\n\n"
            + 'Cette action est irréversible.'
        ]);
    });

    it('nulle part ailleurs, employée par personne : la portée et l\'irréversibilité, rien de plus', async () => {
        const { questions } = await questionChemin2({ dansBibliotheque: false });
        expect(questions).toEqual(['Supprimer la cartouche «Cartouche 1» de sa grille « Grille A » ?\n\nCette action est irréversible.']);
    });

    it('employée mais pas dans la bibliothèque : les évaluations sont nommées, la bibliothèque non', async () => {
        const { questions } = await questionChemin2({ dansBibliotheque: false, evaluations: [{ cartoucheId: 'C1' }] });
        expect(questions[0]).not.toContain('Bibliothèque');
        expect(questions[0]).toContain("1 évaluation(s) l'emploient");
    });

    // ↻ #864 (14 sept. 2026) : le verrouillage des cartouches est retiré. Ce cas
    // exigeait l'alerte « Déverrouille ce cartouche » ; il exige désormais le
    // contraire. `verrouille: true` peut encore dormir dans un vieux stock ou un
    // fichier importé : il est INERTE — ni alerte ni refus, la question vient.
    it('#864 · verrouille: true en stock est inerte : aucune alerte, la question vient', async () => {
        const { questions, alertes } = await questionChemin2({ dansBibliotheque: false, verrouille: true });
        expect(alertes).toEqual([]);
        expect(questions).toEqual(['Supprimer la cartouche «Cartouche 1» de sa grille « Grille A » ?\n\nCette action est irréversible.']);
    });

    it('invariant couplé : ce chemin n\'écrit QUE l\'ancrage de la grille, jamais la bibliothèque', () => {
        const c = corps(cartouchesJs, 'supprimerCartoucheConfirm');
        expect(c).toMatch(/(?:db\.modifier|modifierEtAnnoncer)\(cle\(`cartouches_\$\{grilleId\}`\)/);   // lot E1 : la même file, annoncée
        expect(c).not.toContain('retirerCartoucheDeLaBibliotheque(');
    });

    it('l\'ancienne question, muette, est partie ; les deux délégués vivants passent toujours par ce chemin', () => {
        expect(cartouchesJs).not.toContain('Es-tu sûr de vouloir supprimer la cartouche');
        expect(corps(cartouchesJs, 'supprimerCartoucheActive')).toContain('supprimerCartoucheConfirm(');
    });
});

describe('#647 · † — le chemin sans appelant est retiré, pas corrigé', () => {
    it('supprimerCartouche() n\'est plus ni déclarée ni exportée', () => {
        expect(cartouchesJs).not.toMatch(/function supprimerCartouche\(/);
        expect(cartouchesJs).not.toContain('window.supprimerCartouche =');
    });
});

// =============================================================================
// CHEMIN 3 — section 1 de la bibliothèque modale : le plus destructeur, et il le
// dit — sans un mot de plus quand il n'y a rien à dire.
// =============================================================================
async function questionChemin3({ dansBibliotheque, evaluations = [], idOriginal }) {
    const questions = [];
    const retirer = vi.fn();
    const modifier = vi.fn();
    const fn = instancier(cartouchesJs, 'supprimerCartoucheDefinitivement', {
        // #1155 — la relation unique, la vraie (extraite de bibliotheque-ui.js plus bas).
        BibliothequeUI: { lieeAExemplaire },
        db: {
            get: async (k) => ({
                'h2026_cartouches_G1': [{ id: 'C1', nom: 'Cartouche 1', idOriginal }],
                'h2026_grillesTemplates': [{ id: 'G1', nom: 'Grille A' }],
                'h2026_evaluationsSauvegardees': evaluations
            })[k] ?? null,
            modifier
        },
        cle,
        confirm: (q) => { questions.push(q); return false; },
        window: {},
        obtenirToutesLesCartouchesBibliotheque: async () => (dansBibliotheque ? [{ id: idOriginal || 'C1', grilleId: 'G1' }] : []),
        retirerCartoucheDeLaBibliotheque: retirer,
        fermerModalBibliothequeCartouches: vi.fn(),
        afficherBanqueCartouches: vi.fn(),
        afficherBibliothequeCartouches: vi.fn()
    });
    await fn('C1', 'G1');
    expect(questions, 'la question doit être posée une fois').toHaveLength(1);
    expect(retirer).not.toHaveBeenCalled();
    expect(modifier).not.toHaveBeenCalled();
    return questions[0];
}

describe('#647 · chemin 3 (section 1) — la question dit d\'où part la cartouche, et ce qui reste', () => {
    it('dans la grille ET la bibliothèque, employée par 2 évaluations : tout est dit', async () => {
        const q = await questionChemin3({ dansBibliotheque: true, evaluations: [{ cartoucheId: 'C1' }, { cartoucheId: 'C1' }, { cartoucheId: 'X' }] });
        expect(q).toMatch(/^Supprimer définitivement la cartouche «Cartouche 1» de sa grille « Grille A » \?\n\n/);
        expect(q).toContain('Son exemplaire de ta bibliothèque reste.');
        expect(q).not.toContain('Elle part aussi de la Bibliothèque.');
        expect(q).toContain("2 évaluation(s) l'emploient : leur rétroaction déjà rédigée est conservée.");
        expect(q).toMatch(/\n\nCette action est irréversible\.$/);
    });

    it('#1155 · ramenée par « ← Utiliser » (id neuf, `idOriginal` = l\'exemplaire) : la phrase aussi', async () => {
        const q = await questionChemin3({ dansBibliotheque: true, idOriginal: 'C_BIBLIO' });
        expect(q).toBe('Supprimer définitivement la cartouche «Cartouche 1» de sa grille « Grille A » ?\n\n'
            + 'Son exemplaire de ta bibliothèque reste.\n\nCette action est irréversible.');
    });

    it('témoin négatif : dans sa grille seulement, employée par personne — la grille est nommée (3 sept.), rien de plus', async () => {
        const q = await questionChemin3({ dansBibliotheque: false });
        expect(q).toBe('Supprimer définitivement la cartouche «Cartouche 1» de sa grille « Grille A » ?\n\nCette action est irréversible.');
    });

    // ↻ #1155 : l'invariant change de sens — l'ancrage SEUL ; l'exemplaire de la bibliothèque reste.
    it('invariant couplé : ce chemin n\'écrit que l\'ancrage — la bibliothèque n\'est que lue, et la question le dit', () => {
        const c = corps(cartouchesJs, 'supprimerCartoucheDefinitivement');
        expect(c).toMatch(/(?:db\.modifier|modifierEtAnnoncer)\(cle\(`cartouches_\$\{grilleId\}`\)/);   // lot E1 : la même file, annoncée
        expect(c).not.toContain('retirerCartoucheDeLaBibliotheque(');
        expect(c).toContain("'Son exemplaire de ta bibliothèque reste.\\n'");
    });

    it('dans sa grille seulement, mais employée : la bibliothèque n\'est pas nommée, les évaluations le sont', async () => {
        const q = await questionChemin3({ dansBibliotheque: false, evaluations: [{ cartoucheId: 'C1' }] });
        expect(q).not.toContain('Bibliothèque');
        expect(q).toContain("1 évaluation(s) l'emploient");
    });
});

// =============================================================================
// CHEMIN 4 — section 2 : bibliothèque seulement, et la question le dit quand la
// cartouche reste dans sa grille.
// =============================================================================
async function questionChemin4({ dansAncrage }) {
    const questions = [];
    const retirer = vi.fn();
    const fn = instancier(cartouchesJs, 'supprimerCartoucheDeBibliothequePartagee', {
        db: {
            get: async (k) => ({
                'h2026_cartouches_G1': dansAncrage ? [{ id: 'C1' }] : [],
                'h2026_grillesTemplates': [{ id: 'G1', nom: 'Grille A' }]
            })[k] ?? null
        },
        cle,
        confirm: (q) => { questions.push(q); return false; },
        window: {},
        obtenirToutesLesCartouchesBibliotheque: async () => [{ id: 'C1', nom: 'Cartouche 1', grilleId: 'G1' }],
        retirerCartoucheDeLaBibliotheque: retirer,
        fermerModalBibliothequeCartouches: vi.fn(),
        afficherBibliothequeCartouches: vi.fn()
    });
    await fn('C1');
    expect(questions).toHaveLength(1);
    expect(retirer).not.toHaveBeenCalled();
    return questions[0];
}

describe('#647 · chemin 4 (section 2) — un retrait de bibliothèque qui dit ce qui survit', () => {
    it('la cartouche est aussi dans sa grille : « retirer », et elle y reste', async () => {
        const q = await questionChemin4({ dansAncrage: true });
        expect(q).toMatch(/^Retirer «Cartouche 1» de la Bibliothèque \?/);
        expect(q).toContain('la cartouche reste dans sa grille « Grille A »');
        expect(q).not.toContain('Supprimer définitivement');
    });

    it('invariant couplé : ce chemin n\'écrit QUE la bibliothèque — l\'ancrage n\'est que LU', () => {
        const c = corps(cartouchesJs, 'supprimerCartoucheDeBibliothequePartagee');
        expect(c).toContain('retirerCartoucheDeLaBibliotheque(');
        expect(c).not.toMatch(/db\.(set|setSync|modifier|remove|removeSync)\(/);
    });

    it('témoin négatif : nulle part ailleurs — la question d\'avant, mot pour mot', async () => {
        const q = await questionChemin4({ dansAncrage: false });
        expect(q).toBe('Supprimer définitivement «Cartouche 1» de la Bibliothèque ?\n\nCette action est irréversible.');
    });
});
