// =======================================================================
// SENTINELLE DES PARCOURS « DÉCOUVRIR » ET « METTRE TA CLASSE EN PLACE » (JE REGARDE) — 16 NOVEMBRE 2026
// =======================================================================
// Consigne : `plans de travail/CONSIGNE-2026-11-16-parcours-je-regarde.md` (relais de Cowork, textes réécrits avec
// Grégoire le 16 nov., 8 h 47 à 9 h 46). Les seize bulles sont relues ICI contre la consigne, mot pour mot :
//   1. chaque titre, chaque phrase d'ouverture (l'objectif, la ligne qui confirme, ce qui suit la phrase du lieu, la
//      note) et chaque ligne de liste, dans l'ordre ; pour les bulles à bouton « Remplir », l'état d'avant puis
//      celui d'après ;
//   2. les boutons des deux fins, dans l'ordre, aucun mis en avant ;
//   3. le bouton « Remplir » et sa consigne ; « Suricate Loyal », jamais « Loyal Suricate » ;
//   4. les règles a à e du moteur, telles qu'il les écrit (leur comportement est jugé au navigateur :
//      tests/integration/parcours-je-regarde-2026-11-16.spec.js).
// CE QUE LA CONSIGNE ÉCRIT ET QUE LE CODE NE RECOPIE PAS, exprès : les noms du menu et des sections (« Tu es dans
// « X », à l'onglet « Y » »), que le moteur LIT à l'écran ; et « Pour revoir une étape, touche « 8 sur 8 » », que le
// moteur pose à la dernière bulle de tout parcours.
// REPRIS LE 16 NOV. APRÈS L'ESSAI DE GRÉGOIRE SUR L'IPAD (`plans de travail/CONSIGNE-2026-11-16-essai-ipad.md`) : ce
// relais change des mots de la consigne du matin. Ils sont déclarés ICI (`RETOUCHES`), un par un, chacun relu dans le
// relais de l'essai ; tout le reste se lit toujours dans la consigne du matin. La fin (« Objectif atteint : … », puis
// « Chaque parcours a son objectif… ») quitte les listes : le moteur la pose, d'après la définition.
// Break-test (16 nov.) : « Sa pondération » changé en « La pondération » dans js/parcours-classe.js → ROUGE (1) ;
// « de 93 % ou plus » changé en « de 93 % et plus » dans js/parcours-decouvrir.js → ROUGE (1) ; rétablis → vert.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-2026-11-16-parcours-je-regarde.md');
const ESSAI = lire('plans de travail/CONSIGNE-2026-11-16-essai-ipad.md');
const DECOUVRIR = lire('js/parcours-decouvrir.js');
const CLASSE = lire('js/parcours-classe.js');
const MOTEUR = lire('js/parcours-moteur.js');
const STYLES = lire('css/parcours.css');

// Les deux fichiers, chargés hors du navigateur : ce qu'ils exposent aux bancs.
// (Tous les parcours ouverts, comme sous les bancs : le verrou est jugé par sentinelle-parcours-verrou-2026-11-16.test.js.)
const fenetre = { Assistance: { enregistrer: () => {}, parcours: () => [{ id: 'classe', lancerModele: () => {} }], suivantDe: () => ({ lancerModele: () => {} }) } };
new Function('window', DECOUVRIR)(fenetre);
new Function('window', CLASSE)(fenetre);

// L'insécable des pourcentages (« 84\u00a0% », règle #1137) est de la typographie : la consigne porte des espaces ordinaires.
const plat = (t) => String(t).replace(/\u00a0/g, ' ');

/** Les huit bulles d'un bloc de la consigne : titre, phrases d'ouverture, liste d'avant, liste d'après, boutons. */
function bullesDe(debut, fin) {
    const bloc = tranche(CONSIGNE, debut, fin);
    const bulles = [];
    let b = null;
    bloc.split('\n').forEach((ligne) => {
        const tete = /^(\d) sur 8 — (.+)$/.exec(ligne);
        if (tete) { b = { n: Number(tete[1]), titre: tete[2], phrases: [], avant: [], apres: [], boutons: '', enApres: false }; bulles.push(b); return; }
        if (!b || !ligne.trim()) return;
        if (ligne === 'Après :') { b.enApres = true; return; }
        if (/^Trois boutons de même poids/.test(ligne)) { b.boutons = ligne; return; }
        if (ligne.indexOf('– ') === 0) { (b.enApres ? b.apres : b.avant).push(ligne.slice(2)); return; }
        b.phrases.push(ligne);
    });
    return bulles;
}

const textes = (lignes) => lignes.filter((l) => !l.note).map((l) => plat(l.texte));
const notes = (lignes) => lignes.filter((l) => l.note).map((l) => plat(l.texte));

/** Les phrases d'ouverture que le CODE porte, dans l'ordre de la bulle ; la phrase du lieu, par ce qui la suit. */
function ouvertureDe(def, etape, i, lignes) {
    const o = [];
    if (i === 0) o.push({ entier: def.objectif });
    if (etape.confirme) o.push({ entier: etape.confirme });
    if (etape.lieu || etape.nommeLaSection) o.push({ lieu: true, suite: etape.lieuSuite || '' });
    notes(lignes).forEach((n) => o.push({ entier: n }));
    return o;
}

function jugerOuverture(attendues, portees) {
    expect(portees).toHaveLength(attendues.length);
    attendues.forEach((phrase, k) => {
        const p = portees[k];
        if (!p.lieu) { expect(plat(p.entier)).toBe(phrase); return; }
        // « Tu es dans … » : les noms viennent de l'écran ; ce qui les suit est du code, mot pour mot.
        expect(phrase).toMatch(/^Tu es dans /);
        if (p.suite) expect(phrase.endsWith(p.suite.charAt(0) === ':' ? ' ' + p.suite : '. ' + p.suite)).toBe(true);
        else expect(phrase).toMatch(/^Tu es dans « [^»]+ », à l'onglet « [^»]+ »\.$/);
    });
}

const REVOIR = 'Pour revoir une étape, touche « 8 sur 8 »';
// La fin, que le moteur pose depuis le relais de l'essai (B.3) : ces lignes ne sont plus dans les listes des parcours.
const DE_LA_FIN = (l) => l === REVOIR || /^Objectif atteint : /.test(l) || /^Chaque parcours a son objectif\. /.test(l);

// LES RETOUCHES DU RELAIS DE L'ESSAI (16 nov. 2026, parties B.2, B.4 et B.6) : pour une bulle, les lignes de la
// consigne du matin qu'il remplace ou retire. Chaque ligne neuve est relue dans le relais de l'essai.
const RETOUCHES = {
    decouvrir: {
        2: { "Le point à l'écart, c'est Suricate Loyal": "Pose le doigt sur le point à l'écart : son nom apparaît",
             'Son assiduité est de 84 % ; celle des autres, de 93 % ou plus': "C'est Suricate Loyal. Son assiduité est de 84 % ; celle des autres, de 93 % ou plus" },
        8: { 'Tout repose ici : ton trimestre, tes cours, tes groupes': null }
    },
    classe: {
        6: { "Choisis dans l'en-tête le groupe que tu viens de créer": "Choisis dans l'en-tête le groupe que tu viens de créer : « 601-999-DM · gr. 00002 »" }
    }
};
function retoucher(parcours, n, lignes) {
    const r = RETOUCHES[parcours][n] || {};
    Object.keys(r).forEach((avant) => expect(lignes, `la consigne du matin porte « ${avant} »`).toContain(avant));
    return lignes.map((l) => (l in r ? r[l] : l)).filter((l) => l !== null);
}

// CORRIGÉ D'APRÈS L'ÉCRAN (16 nov. 2026), comme la consigne le demande (« Aux bulles 3 et 4 de « Découvrir », ajoute
// cette ligne si la page a changé ») : à la bulle 3, l'onglet du menu passe de « Groupe » à « Profils » ; à la bulle
// 4, on reste dans cet onglet. La phrase est celle que le moteur lit à l'écran (jugée au navigateur).
const LIEU_AJOUTE = { 3: "Tu es dans « Suivi », à l'onglet « Profils »." };

describe('« Découvrir » : les huit bulles du 16 nov., mot pour mot', () => {
    const consigne = bullesDe('LES TEXTES DE « DÉCOUVRIR »', 'LES TEXTES DE « METTRE TA CLASSE EN PLACE »');
    const etapes = fenetre.ParcoursDecouvrir.etapes;
    const def = fenetre.ParcoursDecouvrir.definition;

    it('huit bulles dans la consigne, huit étapes dans le code', () => {
        expect(consigne.map((b) => b.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(etapes).toHaveLength(8);
    });

    it.each(consigne.map((b) => [b.n, b.titre, b]))('%i sur 8, « %s » : le titre, l’ouverture et les lignes', (n, titre, b) => {
        const etape = etapes[n - 1];
        const lignes = etape.lignes();
        expect(etape.titre).toBe(titre);
        jugerOuverture(b.phrases.concat(LIEU_AJOUTE[n] ? [LIEU_AJOUTE[n]] : []), ouvertureDe(def, etape, n - 1, lignes));
        expect(!!etape.lieu).toBe([1, 3, 6, 7, 8].includes(n));
        expect(textes(lignes)).toEqual(retoucher('decouvrir', n, b.avant).filter((l) => !DE_LA_FIN(l)));
        expect(b.apres).toEqual([]);
        // Une bulle en lignes : ni paragraphe, ni ligne du geste à part.
        expect(etape.texte).toBeUndefined();
        expect(etape.geste).toBeUndefined();
    });

    it('la consigne d’une bulle est sa dernière ligne ; la dernière bulle n’en a pas (elle rappelle l’objectif)', () => {
        etapes.slice(0, 7).forEach((e) => {
            const l = e.lignes();
            expect(l.filter((x) => x.geste)).toHaveLength(1);
            expect(l[l.length - 1].geste).toBe(true);
        });
        expect(etapes[7].lignes().some((x) => x.geste)).toBe(false);
    });

    it('la fin : trois boutons de même poids, dans l’ordre de la consigne, aucun mis en avant', () => {
        const boutons = etapes[7].boutons;
        expect(boutons.map((x) => x.libelle)).toEqual(['Explorer la démo par moi-même', 'Voir le parcours suivant', 'Commencer avec ma classe']);
        boutons.forEach((x) => { expect(x.primaire).toBeUndefined(); expect(consigne[7].boutons).toContain('« ' + x.libelle + ' »'); });
        // « Voir le parcours suivant » lance le « Je regarde » de « Mettre ta classe en place » ; l'autre, son « Nous faisons ».
        expect(tranche(DECOUVRIR, 'function voirLeParcoursSuivant() {', '\n    }\n')).toContain('classe.lancerModele()');
        expect(tranche(DECOUVRIR, 'async function commencerAvecMaClasse() {', '\n    }\n')).toMatch(/classe\.lancer\(/);
    });

    it('l’objectif : dit par la première bulle, rappelé par la dernière, une seule écriture', () => {
        expect(def.objectif).toBe(consigne[0].phrases[0]);
        // La consigne du matin l'écrit en ligne de liste, sans point ; depuis l'essai, c'est une phrase, posée par le moteur.
        expect(def.objectifAtteint).toBe(consigne[7].avant.find((l) => /^Objectif atteint : /.test(l)) + '.');
        expect(def.objectif).toBe('À la fin de ce parcours, tu seras en mesure ' + def.objectifAtteint.slice('Objectif atteint : tu es en mesure '.length));
        expect(textes(etapes[7].lignes()).some(DE_LA_FIN)).toBe(false);
        expect(DECOUVRIR.match(/de repérer qui a besoin de toi sans attendre une main levée/g)).toHaveLength(1);
    });

    it('« Suricate Loyal », comme dans le pack de la démo ; « Loyal Suricate » n’est plus écrit nulle part', () => {
        expect(DECOUVRIR).not.toContain('Loyal Suricate');
        expect(DECOUVRIR).toContain("C'est Suricate Loyal. Son assiduité est de");
        expect(lire('js/pack-demo-10.js')).toContain('"etudiantNom": "Suricate Loyal"');
    });
});

describe('« Mettre ta classe en place », « Je regarde » : les huit bulles du 16 nov., mot pour mot', () => {
    const consigne = bullesDe('LES TEXTES DE « METTRE TA CLASSE EN PLACE », « JE REGARDE »', "À VÉRIFIER À L'ÉCRAN");
    const etapes = fenetre.ParcoursClasse.etapesModele;
    const def = fenetre.ParcoursClasse.definitionModele;
    const mots = fenetre.ParcoursClasse.mots;

    it('huit bulles dans la consigne, huit étapes dans le code', () => {
        expect(consigne.map((b) => b.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(etapes).toHaveLength(8);
    });

    it('le bouton s’appelle « Remplir », et sa consigne est celle du 16 nov.', () => {
        expect(mots.remplir).toBe('Remplir');
        expect(mots.toucheRemplir).toBe("Regarde l'exemple se remplir : touche « Remplir »");
        expect(CONSIGNE).toContain('Sa consigne : « ' + mots.toucheRemplir + ' ».');
        for (const f of ['js/parcours-classe.js', 'js/parcours-evaluer.js', 'js/parcours-moteur.js']) {
            expect(lire(f).replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, ''), f).not.toContain("Remplir avec l'exemple");
        }
    });

    it.each(consigne.map((b) => [b.n, b.titre, b]))('%i sur 8, « %s » : le titre, l’ouverture, les lignes d’avant et d’après', (n, titre, b) => {
        const etape = etapes[n - 1];
        expect(etape.titre).toBe(titre);
        if (typeof etape.etats === 'function') {
            // Une bulle à bouton « Remplir » : deux états. Après, la consigne « Remplir » reste, faite ; puis ce
            // qui vient d'apparaître, et le bouton de la page.
            const { avant, apres } = etape.etats();
            jugerOuverture(b.phrases, ouvertureDe(def, etape, n - 1, avant));
            expect(textes(avant)).toEqual(b.avant);
            expect(b.avant[b.avant.length - 1]).toBe(mots.toucheRemplir);
            expect(avant[avant.length - 1].geste).toBe(true);
            expect(textes(apres)).toEqual(b.avant.concat(b.apres));
            expect(apres[apres.length - 1].geste).toBe(true);
            expect(notes(apres)).toEqual(notes(avant));
        } else {
            const lignes = etape.lignes();
            jugerOuverture(b.phrases, ouvertureDe(def, etape, n - 1, lignes));
            // La dernière bulle : « Pour revoir une étape… » est posée par le moteur, pas par le parcours.
            expect(textes(lignes)).toEqual(retoucher('classe', n, b.avant).filter((l) => !DE_LA_FIN(l)));
            expect(b.apres).toEqual([]);
        }
    });

    it('cinq bulles à bouton « Remplir » (1 à 5, 7) ; « D’un groupe à l’autre » et la dernière n’en ont pas', () => {
        expect(etapes.map((e) => typeof e.etats === 'function')).toEqual([true, true, true, true, true, false, true, false]);
    });

    it('la fin : trois boutons de même poids, dans l’ordre de la consigne ; « Pour revoir une étape » vient du moteur', () => {
        const boutons = etapes[7].boutons;
        expect(boutons.map((x) => x.libelle)).toEqual(['Le refaire avec ma classe', 'Voir le parcours suivant', 'Terminer']);
        boutons.forEach((x) => { expect(x.primaire).toBeUndefined(); expect(consigne[7].boutons).toContain('« ' + x.libelle + ' »'); });
        expect(consigne[7].avant[consigne[7].avant.length - 1]).toBe(REVOIR);
        expect(MOTEUR).toContain("'Pour revoir une étape, touche « ' + n + ' sur ' + n + ' ».'");
    });

    it('l’objectif : dit par la première bulle, rappelé par la dernière, une seule écriture', () => {
        expect(def.objectif).toBe(consigne[0].phrases[0]);
        expect(def.objectifAtteint).toBe(consigne[7].avant.find((l) => /^Objectif atteint : /.test(l)) + '.');
        expect(def.objectif).toBe('À la fin de ce parcours, tu seras en mesure ' + def.objectifAtteint.slice('Objectif atteint : tu es en mesure '.length));
        expect(textes(etapes[7].lignes()).some(DE_LA_FIN)).toBe(false);
        expect(CLASSE.match(/d'expliquer ce que l'application te demande pour mettre une classe en place/g)).toHaveLength(1);
    });

    it('chaque bulle, sauf la première, s’ouvre sur le geste précédent confirmé (« C’est fait : … »)', () => {
        expect(etapes[0].confirme).toBeUndefined();
        etapes.slice(1).forEach((e) => expect(e.confirme).toMatch(/^C'est fait : /));
    });

    it('les sections du Cadre : déclarées aux cinq premières bulles, nommées quand la bulle y arrive', () => {
        expect(etapes.map((e) => typeof e.section === 'function')).toEqual([true, true, true, true, true, false, false, false]);
        // « Le cours de la liste » reste dans la section de la bulle d'avant : son nom garde le halo, la phrase n'est pas redite.
        expect(etapes.map((e) => !!e.nommeLaSection)).toEqual([true, true, false, true, true, false, false, false]);
        // La bonne section, et elle seule : les autres blocs du Cadre se referment (défaut vu le 15 nov.).
        const ouvrir = tranche(CLASSE, 'async function ouvrirBlocModele(idEtape, faite) {', '\n    }\n');
        expect(ouvrir).toMatch(/ETAPES_DU_CADRE\.forEach\(function \(autre\) \{[\s\S]*a !== acc && !a\.classList\.contains\('ferme'\)\) plier\(a, true\);/);
        // Sans écrire hors de la démo : la bascule de la page retient l'état des blocs (`etatsAccordeonsV2`), une
        // préférence de la personne ; le modèle plie et déplie à l'écran seulement (banc du confinement).
        expect(ouvrir).not.toContain('toggleAccordeonV2');
        expect(tranche(CLASSE, 'function plier(acc, fermer) {', '\n    }\n')).not.toMatch(/toggleAccordeonV2|setSync|sauvegarderEtatAccordeons/);
    });

    it('« Nous faisons » garde ses textes (hors de ce relais) : ses huit titres n’ont pas bougé', () => {
        const titres = [...tranche(CLASSE, 'var ETAPES = [', 'var DEF = ').matchAll(/titre: (?:'([^']*)'|"([^"]*)")/g)].map((m) => m[1] ?? m[2]);
        expect(titres).toEqual(['Ton trimestre', 'Ton cours', 'Ton profil', 'Ta classe', 'Ton horaire', 'Ton groupe-cours', 'Prendre les présences', "Ta classe d'un coup d'œil"]);
    });
});

describe('la place de la bulle : la section ne départage que des places égales (fonction pure)', () => {
    const fenetreMoteur = { matchMedia: () => ({ matches: false }) };
    new Function('window', 'document', MOTEUR)(fenetreMoteur, {});
    const { placerLoin } = fenetreMoteur.ParcoursMoteur.geometrie;
    const cadre = { gauche: 8, haut: 8, droite: 812, bas: 1100 };
    const rect = (left, top, right, bottom) => ({ left, top, right, bottom });
    const couvre = (p, r, bw, bh) => p.x < r.right && p.x + bw > r.left && p.y < r.bottom && p.y + bh > r.top;

    it('une place libre hors de la section est prise, plutôt qu’une place libre dans la section', () => {
        const section = rect(20, 300, 800, 1100), champ = rect(60, 400, 400, 440);
        const p = placerLoin([champ], 380, 250, cadre, [section]);
        expect(couvre(p, champ, 380, 250)).toBe(false);
        expect(couvre(p, section, 380, 250)).toBe(false);
    });

    it('un champ désigné n’est jamais couvert pour dégager la section', () => {
        // La section prend tout l'écran ; le champ occupe la gauche : la bulle va à droite, dans la section.
        const section = rect(0, 0, 820, 1180), champ = rect(20, 20, 400, 1090);
        const p = placerLoin([champ], 380, 400, cadre, [section]);
        expect(p.aire).toBe(0);
        expect(couvre(p, champ, 380, 400)).toBe(false);
    });

    it('sans section, la place est celle d’avant (le cinquième argument est facultatif)', () => {
        const champ = rect(60, 400, 400, 440);
        expect(placerLoin([champ], 380, 250, cadre)).toEqual(placerLoin([champ], 380, 250, cadre, []));
    });
});

describe('le moteur : les règles a à e, telles qu’il les écrit', () => {
    const ecrire = tranche(MOTEUR, 'function ecrireLignes(boite, etape) {', 'function majLignes(silence) {');

    it('a. l’objectif du parcours : sur la première bulle seulement, avant la confirmation, le lieu et les lignes', () => {
        const objectif = ecrire.indexOf("if (etat.i === 0) phrase('parcours-bulle-objectif', texteDe(etat.def.objectif));");
        expect(objectif).toBeGreaterThan(-1);
        // 18 nov. 2026 : la confirmation est posée au-dessus du titre (`poserConfirmation`), avant la phrase du lieu.
        expect(objectif).toBeLessThan(ecrire.indexOf('poserConfirmation(etape);'));
        expect(ecrire.indexOf('poserConfirmation(etape);')).toBeLessThan(ecrire.indexOf("phrase('parcours-bulle-lieu'"));
        expect(ecrire.indexOf("phrase('parcours-bulle-lieu'")).toBeLessThan(ecrire.indexOf('lignes.forEach(function (ligne) {'));
    });

    it('b. la page défile jusqu’à la section, et la bulle attend la fin du mouvement', () => {
        const aller = tranche(MOTEUR, 'async function allerA(i) {', 'function surTouche(ev) {');
        const cache = aller.indexOf('attendreLaPage(!!etape.section);');
        const page = aller.indexOf('await ouvrirLaPage(etape);');
        const montre = aller.indexOf('attendreLaPage(false);');
        expect(cache).toBeGreaterThan(-1);
        expect(cache).toBeLessThan(aller.indexOf('await preparer(etape, i);'));
        expect(page).toBeGreaterThan(cache);
        expect(montre).toBeGreaterThan(page);
        expect(tranche(MOTEUR, 'async function ouvrirLaPage(etape) {', 'if (aUnLieu(etape)) {')).toContain('await defilerVers(');
        expect(tranche(MOTEUR, 'function defilerVers(el) {', 'function attendreLaPage(oui) {')).toContain("behavior: mouvementReduit() ? 'auto' : 'smooth'");
        expect(STYLES).toContain('.parcours-bulle.est-en-attente { visibility: hidden; }');
        // À côté de la section : elle départage des places qui couvrent aussi peu ce que la bulle désigne ; son nom,
        // lui, est pesé comme le contour. La section n'est jamais une zone : ses champs ne s'y fondent pas.
        expect(tranche(MOTEUR, 'function placerBulleLoin(zones, prio) {', '\n    }\n')).toContain('s ? rectsDe([s.bloc]) : null');
        expect(tranche(MOTEUR, 'function prioritaires(c) {', '\n    }\n')).toContain('if (s && s.tete) autres = autres.concat([s.tete]);');
        // Dans ce que l'étape désigne, la section n'entre que par son NOM, pour la flèche d'avant « Remplir » (essai, B.5).
        expect(tranche(MOTEUR, 'function designe(etape) {', '\n    }\n')).not.toContain('sectionDe');
        expect(tranche(MOTEUR, 'function nomDeSectionAMontrer(etape, dejaDesignes) {', '\n    }\n')).toContain('return s && s.tete && visible(s.tete) ? [s.tete] : [];');
    });

    it('c. le nom de la section reçoit le halo des entrées du menu, et il est lu dans la page', () => {
        const marquer = tranche(MOTEUR, 'function marquerLieu(etape) {', '\n    }\n');
        expect(marquer).toContain('if (s && s.tete && visible(s.tete)) entrees = entrees.concat([s.tete]);');
        expect(marquer).toContain("e.classList.add('parcours-section-actuelle')");
        expect(tranche(MOTEUR, 'function sectionDe(etape) {', '\n    }\n')).toContain('copie.textContent');
        // Aucun nom de section du Cadre n'est recopié dans un parcours.
        const modele = tranche(CLASSE, 'var ETAPES_MODELE = [', 'var DEF_MODELE = ');
        ['Cours et services', "Groupe d'étudiant", '« Horaire »', '« Groupe-cours »', '« Étudiant'].forEach((nom) => expect(modele).not.toContain(nom));
        expect(tranche(DECOUVRIR, 'var ETAPES = [', 'var DEF = ')).not.toMatch(/Tu es dans/);
    });

    it('d. le triangle du compteur suit `aria-expanded` ; le texte du bouton reste « n sur N »', () => {
        // Le triangle des sections de l'application (essai, B.1) : le même signe, couché puis pointe en bas.
        expect(lire('index.html')).toMatch(/<span class="accordeon-chevron">▼<\/span>/);
        expect(lire('styles.css')).toMatch(/\.carte\.accordeon\.ferme \.accordeon-chevron \{\s*transform: rotate\(-90deg\);/);
        const triangle = tranche(STYLES, '.parcours-bulle-rang::after {', '}');
        expect(triangle).toContain("content: '\\25BC';");
        expect(triangle).toContain('transform: rotate(-90deg);');
        expect(triangle).toContain('font-size: 0.8rem;');
        expect(STYLES).toContain('.parcours-bulle-rang[aria-expanded="true"]::after { transform: none; }');
        expect(tranche(MOTEUR, 'function rangDeLEtape(total) {', '\n    }\n')).toContain("rang.textContent = (etat.i + 1) + ' sur ' + total;");
    });

    it('e. la ligne qui confirme : avant la phrase du lieu, telle que le parcours l’écrit (le moteur n’y ajoute rien)', () => {
        // 18 nov. 2026 (Grégoire, 14 h 11) : au-dessus du titre, dans son élément, posé avant la tête de la bulle.
        expect(ecrire).toContain('poserConfirmation(etape);');
        const poser = tranche(MOTEUR, 'function poserConfirmation(etape) {', '\n    }\n');
        expect(poser).toContain('var texte = texteDe(etape.confirme);');
        const rendre = tranche(MOTEUR, "confirme.className = 'parcours-bulle-confirme';", 'b.appendChild(tete);');
        expect(rendre).toContain('b.appendChild(confirme);');
        expect(MOTEUR).not.toMatch(/Bravo|Bien joué|Félicitations/);
    });
});

describe('les retouches de l’essai sur l’iPad (16 nov. 2026), telles que son relais les écrit', () => {
    const fenetreMoteur = { matchMedia: () => ({ matches: false }) };
    new Function('window', 'document', MOTEUR)(fenetreMoteur, {});
    const ecrire = tranche(MOTEUR, 'function ecrireLignes(boite, etape) {', 'function majLignes(silence) {');
    const dite = (nom) => new RegExp("var " + nom + " = '((?:[^'\\\\]|\\\\.)*)';").exec(MOTEUR)[1].replace(/\\'/g, "'");

    it('B.2, B.4, B.6 : chaque ligne neuve est celle du relais, mot pour mot', () => {
        Object.values(RETOUCHES).forEach((parcours) => Object.values(parcours).forEach((bulle) => {
            Object.entries(bulle).forEach(([avant, apres]) => expect(ESSAI).toContain('« ' + (apres || avant) + ' »'));
        }));
    });

    it('B.3 : la fin est posée par le moteur — l’objectif atteint dans la forme de l’objectif, puis la phrase de la suite', () => {
        expect(dite('PHRASE_DE_LA_SUITE')).toBe("Chaque parcours a son objectif. C'est toi qui choisis la suite.");
        expect(ESSAI).toContain('« ' + dite('PHRASE_DE_LA_SUITE') + ' »');
        expect(ecrire).toContain("{ texte: atteint, classe: 'parcours-bulle-objectif parcours-bulle-atteint' }");
        expect(ecrire).toContain("{ texte: PHRASE_DE_LA_SUITE, classe: 'parcours-bulle-suite' }");
        // « Pour revoir une étape », en petit, puis la clôture, puis seulement les consignes de la fin.
        expect(ecrire).toContain('lignes.slice(0, k).concat([revue], cloture, lignes.slice(k)');
        expect(STYLES).toMatch(/\.parcours-bulle-aide,\s*\.parcours-bulle-revue \{[^}]*font-size: 12\.5px;/);
    });

    it('B.7 : la première bulle de chaque parcours dit la poignée, sauf sur téléphone (la bulle n’y en a pas)', () => {
        expect(dite('PHRASE_DE_LA_POIGNEE')).toBe('Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.');
        expect(ESSAI).toContain('« ' + dite('PHRASE_DE_LA_POIGNEE') + ' »');
        expect(ecrire).toContain("if (etat.i === 0 && !etat.def.sansRang && !etat.telephone) phrase('parcours-bulle-aide', PHRASE_DE_LA_POIGNEE);");
    });

    it('9 : l’espace insécable devant « ; : ? ! », pour toutes les bulles', () => {
        const typographier = new Function(tranche(MOTEUR, 'function typographier(t) {', '\n    }\n') + '\n    }\n return typographier;')();
        expect(typographier('dix étudiant·es ; la bande « Assiduité » : qui ? toi !')).toBe('dix étudiant·es\u00a0; la bande «\u00a0Assiduité\u00a0»\u00a0: qui\u00a0? toi\u00a0!');
        expect(typographier('84\u00a0%\u00a0; rien')).toBe('84\u00a0%\u00a0; rien');
    });

    it('A : « Découvrir » choisit le premier groupe de la démo avant sa première bulle, à l’ouverture comme à la reprise', () => {
        const lancer = tranche(DECOUVRIR, 'async function lancer(depuis) {', '\n    }\n');
        expect(lancer.indexOf('await choisirLeGroupeDeLaDemo();')).toBeGreaterThan(-1);
        expect(lancer.indexOf('await choisirLeGroupeDeLaDemo();')).toBeLessThan(lancer.indexOf('M().lancer(DEF'));
        expect(DECOUVRIR).toContain("var GROUPE_DE_LA_DEMO = 'GC_DEMO';");
    });
});
