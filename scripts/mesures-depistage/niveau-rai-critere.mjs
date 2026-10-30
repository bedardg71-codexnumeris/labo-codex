// Le niveau RàI sur un critère, plus sur le groupe (lot 3 des seuils, consigne du 30 oct. 2026, 15 h 19) : le modèle en
// ligne (la vraie `determinerNiveauRaiPedagogique` du commit mesuré) à côté du modèle décidé, recalculé ici sans toucher
// au code. La ligne : le repère de suffisance de l'échelle, 60 % sans lui. Le résultat comparé : P, tel que la pratique
// le construit.
// Niveau 3 : P sous la ligne ET difficulté sur une fondation ; ou « Non-participation » ; ou diagnostic réglé à 3.
// Niveau 2 : P sous la ligne ; ou « Difficulté persistante » ; ou diagnostic réglé à 2. Niveau 1 : le reste.
// Suppositions déclarées, à redire dans chaque rapport :
// - la note provisoire : celle que l'écran montre, le minimum de la pratique atteint (`minimumCompletion`, les 4 artefacts
//   dont parle Grégoire) ; en variante (`code`), `noteConstructible`, vrai dès la première copie ;
// - la fondation : la moyenne d'un critère du suivi des fondations (`criteresSuiviFondations`) sous la ligne, sur les
//   mêmes copies que la détection des défis ; en variantes, sous le seuil du défi, sur la fenêtre des patterns, et la
//   persistance du suivi des fondations (`calculerIPB`, 2 puis 3 copies de suite) ;
// - avant la première note provisoire : diagnostic et non-participation seulement, sinon « En attente », pas le niveau 1 ;
//   en variante, combien « Difficulté persistante » y mettrait au niveau 2 ;
// - le diagnostic : aucun palier ne porte encore de niveau. Le stock rend donc 0 ; deux scénarios disent ce que rendrait
//   chaque palier déjà coché s'il était réglé à 2, ou à 3.
// Exige un commit qui porte `reperesPerformance`. Sort des effectifs seulement. Mode d'emploi : LISEZMOI.md.
import assert from 'node:assert/strict';
import { ouvrir, basculer, lireCodex, ecrireAgregat, PLANS } from './commun.mjs';

const codex = await lireCodex();
const sortie = {}; let nbErr = 0;
for (const plan of PLANS) {
  const { b, page, erreurs } = await ouvrir(codex);
  await page.clock.setFixedTime(new Date('2026-10-30T12:00:00'));
  await basculer(page, plan.t);
  const info = await page.evaluate(({grilleNom}) => {
    window.__base = { ev: JSON.parse(JSON.stringify(db.getSync(cle('evaluationsSauvegardees'),[]))), pr: JSON.parse(JSON.stringify(db.getSync(cle('presences'),[]))) };
    // Le compte de la colonne « ≥ Min. » : même règle que `compterEvaluationsPourMinimum` (etudiants.js), privée à son module.
    window.__compterPourMinimum = (prods, evals) => { const pt=window.ProductionDiagnostique.filtrerProductions(prods); const ids=new Set(obtenirTypePratiqueActive()==='standards'?window.obtenirIdsPoolStdDuCorpus(pt):pt.filter(p=>p.type==='artefact-portfolio').map(p=>p.id)); const m=new Map(); evals.forEach(ev=>{if(ids.has(ev.productionId)&&!ev.remplaceeParId&&ev.noteFinale!==null&&ev.noteFinale!==undefined)m.set(ev.etudiantDA,(m.get(ev.etudiantDA)||0)+1);}); return m; };
    // Le modèle décidé, en un seul endroit. `diag` : 0 (aucun niveau réglé), 2 ou 3. Rend le niveau et sa source.
    window.__modele = ({P, ligne, persist, fond, np, diag}) => {
      const a = P !== null;
      const sous = a && P < ligne;
      if (np) return [3, 'np'];
      if (sous && fond) return [3, 'fondation'];
      if (diag === 3) return [3, 'diagnostic'];
      if (sous) return [2, 'note'];
      if (a && persist) return [2, 'persistante'];
      if (diag === 2) return [2, 'diagnostic'];
      return [a ? 1 : 0, a ? 'reste' : 'attente'];
    };
    if (grilleNom) { const prods=db.getSync(cle('productions'),[]); const gr=db.getSync(cle('grillesTemplates'),[]);
      const g=gr.filter(x=>String(x.nom).replace(/\s+/g,' ').trim()===grilleNom).sort((x,y)=>prods.filter(p=>p.grilleId===y.id).length-prods.filter(p=>p.grilleId===x.id).length)[0];
      db.setSync('preferencesUtilisateur', Object.assign({}, db.getSync('preferencesUtilisateur',{}), {grilleReferenceDepistage:g.id})); }
    const m=window.__modele, c=(P,o={})=>m(Object.assign({P,ligne:65,persist:false,fond:false,np:false,diag:0},o));
    // Ce qui peut lever un signalement, et ce que la fondation recouvre : des comptes et des noms de critères, aucun élève.
    const coche=g=>JSON.stringify(g).includes('"leveSignalement":true'), grilles=db.getSync(cle('grillesTemplates'),[])||[], prodsTous=db.getSync(cle('productions'),[])||[], ref=obtenirGrilleReferenceDepistage();
    const idsCoches=new Set(grilles.filter(coche).map(g=>g.id)), algo=window.__base.ev.filter(e=>e.donneesAlgorithmiques&&Object.keys(e.donneesAlgorithmiques).length);
    const cadre={grilles:grilles.length,grillesPalierCoche:idsCoches.size,evaluationsAlgo:algo.length,evaluationsAlgoGrilleCochee:algo.filter(e=>idsCoches.has(e.grilleId)).length,productionsDiagnostiques:prodsTous.length-window.ProductionDiagnostique.filtrerProductions(prodsTous).length,
      soloLu:etiquettesSOLOLuesParDepistage(),criteres:(ref&&ref.criteres||[]).map(c=>c.nom),surveilles:criteresSurveillesParDepistage(ref).map(c=>c.nom),fondations:criteresSuiviFondations(ref).map(c=>c.nom)};
    return { cadre, gcs: db.getSync(cle('groupesCours'),[]).map(g=>g.id), grille:(ref||{}).nom||null,
      temoin:[c(64),c(65),c(64,{fond:true}),c(65,{fond:true}),c(80,{persist:true}),c(null,{persist:true}),c(null,{np:true}),c(80,{np:true}),c(null,{diag:3}),c(null,{diag:2}),c(80,{diag:2}),c(64,{diag:2}),c(64,{diag:3}),c(null)].map(x=>x[0]) };
  }, {grilleNom: plan.grilleNom});
  // Chaque règle passe par la fonction du navigateur : la ligne stricte, la fondation seule ne suffit pas, la persistante au-dessus, l'attente, le diagnostic.
  assert.deepEqual(info.temoin, [2,1,3,1,2,0,3,3,3,2,2,2,3,0]);
  const lignes = [];
  for (const cut of plan.coupes) {
    await page.clock.setFixedTime(new Date(cut + 'T23:30:00'));
    lignes.push(await page.evaluate(async ({cut, gcs}) => {
      const f=window.__base.ev.filter(e=>(e.dateEvaluation||'').slice(0,10)<=cut).map(e=>Object.assign({},e));
      const ids=new Set(f.map(e=>e.id)), tous=new Set(window.__base.ev.map(e=>e.id));
      f.forEach(e=>{if(e.remplaceeParId&&!ids.has(e.remplaceeParId)&&tous.has(e.remplaceeParId)){delete e.remplaceeParId;delete e.dateRemplacement;}});
      db.setSync(cle('evaluationsSauvegardees'),f); db.setSync(cle('presences'),window.__base.pr.filter(p=>p.date<=cut));
      const acc=new Map(), groupes=[], grille=obtenirGrilleReferenceDepistage(), seuilDefi=obtenirSeuil('defiSpecifique');
      const fondations=new Set(criteresSuiviFondations(grille).map(c=>c.nom));
      const enDefi=(moy,seuil)=>diagnostiquerForcesChallenges(moy,seuil).defis.some(d=>fondations.has(d.nom));
      for(const gc of gcs){
        await changerGroupeCoursActifV2(gc); calculerEtSauvegarderIndicesAssiduite(); calculerEtStockerIndicesCP();
        const rep=reperesPerformance(), ligne=rep.suffisance!==null?rep.suffisance:rep.passage;
        const standards=obtenirTypePratiqueActive()==='standards', fenetre=obtenirNombreProductionsPourPatterns();
        const toutes=obtenirDonneesSelonMode('evaluationsSauvegardees')||[], grilles=db.getSync(cle('grillesTemplates'),[])||[];
        const portfolio=(obtenirConfigPratiqueActive()||{}).portfolio||{}, minimum=portfolio.minimumCompletion||3, evalsParDA=window.__compterPourMinimum(obtenirDonneesSelonMode('productions')||[],toutes);
        const ps=[];
        demarrerCacheLecture();
        try {
          for(const e of obtenirEtudiantsCoursActif().filter(x=>!estEtudiantExclu(x))){
            if(acc.has(e.da))continue;
            const r=determinerNiveauRaiPedagogique(e.da), i=calculerTousLesIndices(e.da);
            const Pcode=i.noteConstructible!==false?i.P:null;
            const P=(Pcode!==null&&(portfolio.actif===false||(evalsParDA.get(e.da)||0)>=minimum))?Pcode:null;
            const moy=standards?calculerMoyennesCriteresRecents(e.da):calculerMoyennesCriteres(e.da);
            const recentes=calculerMoyennesCriteresRecents(e.da,fenetre);
            const ipb=calculerIPB(e.da), defis=diagnostiquerForcesChallenges(moy,ligne/100).defis.filter(d=>fondations.has(d.nom)).map(d=>d.nom);
            const signal=window.SignalementDepistage.pourEleve(e.da,{evaluations:toutes,grilles}).length>0;
            acc.set(e.da,{P,Pcode,ligne,enLigne:r.niveau,persist:r.pattern==='Difficulté persistante',np:r.pattern==='Non-participation',
              fond:enDefi(moy,ligne/100),fondDefi:enDefi(moy,seuilDefi),fondRecent:enDefi(recentes,ligne/100),fondIPB2:!!ipb&&ipb.ipb>=2,fondIPB3:!!ipb&&ipb.ipb>=3,defis,signal});
            if(P!==null)ps.push(P);
          }
        } finally { terminerCacheLecture(); }
        groupes.push({ligne,minimum:portfolio.actif===false?null:minimum,suffisance:rep.suffisance,n:ps.length,sousLigne:ps.length>0&&ps.reduce((a,v)=>a+v,0)/ps.length<ligne});
      }
      const res=[...acc.values()], m=window.__modele;
      const compte=(diag,cle='fond',note='P')=>{ const n={0:0,1:0,2:0,3:0}, sources={2:{note:0,persistante:0,diagnostic:0},3:{fondation:0,np:0,diagnostic:0}};
        res.forEach(r=>{const [niv,src]=m({P:r[note],ligne:r.ligne,persist:r.persist,fond:r[cle],np:r.np,diag:r.signal?diag:0});n[niv]++;if(sources[niv])sources[niv][src]++;}); return {n,sources}; };
      const sous=res.filter(r=>r.P!==null&&r.P<r.ligne), sousCode=res.filter(r=>r.Pcode!==null&&r.Pcode<r.ligne);
      return {cut,effectif:res.length,avecNote:res.filter(r=>r.P!==null).length,
        enLigne:[0,1,2,3].map(v=>res.filter(r=>r.enLigne===v).length),
        decide:compte(0),diag2:compte(2),diag3:compte(3),code:compte(0,'fond','Pcode'),variantes:{seuilDefi:compte(0,'fondDefi').n,fenetrePatterns:compte(0,'fondRecent').n,ipb2:compte(0,'fondIPB2').n,ipb3:compte(0,'fondIPB3').n},
        parCritere:(()=>{const t={};sous.forEach(r=>r.defis.forEach(d=>{t[d]=(t[d]||0)+1;}));return t;})(),
        avecNoteCode:res.filter(r=>r.Pcode!==null).length,sousLigneCode:sousCode.length,sousCodeSansSignalEnLigne:sousCode.filter(r=>r.enLigne<2).length,
        // Le témoin du lot 3, sur un commit qui le porte : le code rend-il le modèle décidé (§ 3 bis, 1 C : la persistante donne le niveau 2 avant la note) ? Attendu : 0 à toutes les dates. Le diagnostic n'y entre pas : aucun palier réglé sur ce codex.
        ecartCodeModele:res.filter(r=>r.enLigne!==(r.P===null&&!r.np&&r.persist?2:m({P:r.P,ligne:r.ligne,persist:r.persist,fond:r.fond,np:r.np,diag:0})[0])).length,
        sousLigne:sous.length,sousSansSignalEnLigne:sous.filter(r=>r.enLigne<2).length,
        sousSansSignalDecide:sous.filter(r=>m({P:r.P,ligne:r.ligne,persist:r.persist,fond:r.fond,np:r.np,diag:0})[0]<2).length,
        persistanteAuDessus:res.filter(r=>r.P!==null&&r.P>=r.ligne&&r.persist&&!r.np).length,
        persistanteAvantNote:res.filter(r=>r.P===null&&r.persist&&!r.np).length,
        signales:res.filter(r=>r.signal).length,signalesEnAttente:res.filter(r=>r.signal&&r.P===null&&!r.np).length,
        groupes,groupesSousLigne:groupes.filter(g=>g.sousLigne).length};
    },{cut,gcs:info.gcs}));
  }
  sortie[plan.t]={info:{grille:info.grille,groupes:info.gcs.length,cadre:info.cadre},lignes}; nbErr+=erreurs(); await b.close();
  console.log('==',plan.t,info.grille,'groupes',info.gcs.length,JSON.stringify(info.cadre));
  lignes.forEach(l=>console.log(l.cut,'élèves',l.effectif,'notes écran',l.avecNote,'code',l.avecNoteCode,'| en ligne',l.enLigne.join('-'),'| décidé',[0,1,2,3].map(v=>l.decide.n[v]).join('-'),'| décidé (code)',[0,1,2,3].map(v=>l.code.n[v]).join('-'),'| N2',JSON.stringify(l.decide.sources[2]),'N3',JSON.stringify(l.decide.sources[3]),'| <ligne',l.sousLigne,'sans signal en ligne',l.sousSansSignalEnLigne,'décidé',l.sousSansSignalDecide,'| persist. au-dessus',l.persistanteAuDessus,'avant note',l.persistanteAvantNote,'| ipb2',[0,1,2,3].map(v=>l.variantes.ipb2[v]).join('-'),'ipb3',[0,1,2,3].map(v=>l.variantes.ipb3[v]).join('-'),JSON.stringify(l.parCritere),'| écart code-modèle',l.ecartCodeModele,'| signalés',l.signales,'| groupes <ligne',l.groupesSousLigne));
}
ecrireAgregat('niveau-rai-critere.json', sortie); console.log('erreurs',nbErr);
