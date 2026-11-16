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
const DECOUVRIR = lire('js/parcours-decouvrir.js');
const CLASSE = lire('js/parcours-classe.js');
const MOTEUR = lire('js/parcours-moteur.js');
const STYLES = lire('css/parcours.css');

// Les deux fichiers, chargés hors du navigateur : ce qu'ils exposent aux bancs.
const fenetre = { Assistance: { enregistrer: () => {}, parcours: () => [], suivantDe: () => ({ lancerModele: () => {} }) } };
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
        expect(textes(lignes)).toEqual(b.avant);
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
        const atteint = textes(etapes[7].lignes()).find((t) => t.indexOf('Objectif atteint : tu es en mesure ') === 0);
        expect(def.objectif).toBe('À la fin de ce parcours, tu seras en mesure ' + atteint.slice('Objectif atteint : tu es en mesure '.length) + '.');
        expect(DECOUVRIR.match(/de repérer qui a besoin de toi sans attendre une main levée/g)).toHaveLength(1);
    });

    it('« Suricate Loyal », comme dans le pack de la démo ; « Loyal Suricate » n’est plus écrit nulle part', () => {
        expect(DECOUVRIR).not.toContain('Loyal Suricate');
        expect(DECOUVRIR).toContain("Le point à l'écart, c'est Suricate Loyal");
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
            expect(textes(lignes)).toEqual(b.avant.filter((l) => l !== REVOIR));
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
        const atteint = textes(etapes[7].lignes()).find((t) => t.indexOf('Objectif atteint : tu es en mesure ') === 0);
        expect(def.objectif).toBe('À la fin de ce parcours, tu seras en mesure ' + atteint.slice('Objectif atteint : tu es en mesure '.length) + '.');
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
        expect(objectif).toBeLessThan(ecrire.indexOf("phrase('parcours-bulle-confirme'"));
        expect(ecrire.indexOf("phrase('parcours-bulle-confirme'")).toBeLessThan(ecrire.indexOf("phrase('parcours-bulle-lieu'"));
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
        expect(tranche(MOTEUR, 'function designe(etape) {', '\n    }\n')).not.toContain('sectionDe');
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
        expect(STYLES).toMatch(/\.parcours-bulle-rang::after \{\s*content: '\\25B8';/);
        expect(STYLES).toContain(".parcours-bulle-rang[aria-expanded=\"true\"]::after { content: '\\25BE'; }");
        expect(tranche(MOTEUR, 'function rangDeLEtape(total) {', '\n    }\n')).toContain("rang.textContent = (etat.i + 1) + ' sur ' + total;");
    });

    it('e. la ligne qui confirme : avant la phrase du lieu, telle que le parcours l’écrit (le moteur n’y ajoute rien)', () => {
        expect(ecrire).toContain("phrase('parcours-bulle-confirme', texteDe(etape.confirme));");
        expect(MOTEUR).not.toMatch(/Bravo|Bien joué|Félicitations/);
    });
});
