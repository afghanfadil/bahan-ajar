(function(root){
'use strict';
const R=.287,cv=.718,cp=cv+R,gamma=cp/cv;
const metric=(label,value,unit='',digits=2)=>({label,value,unit,digits});
const fail=(condition,message)=>{if(condition)throw new Error(message)};
function interpolated(rows,T){
 fail(T<rows[0].t||T>rows[rows.length-1].t,'Temperatur di luar cuplikan 40–200 °C. Ekstrapolasi tidak dilakukan.');
 const exact=rows.find(r=>r.t===T);if(exact)return {...exact};
 const j=rows.findIndex(r=>r.t>T),a=rows[j-1],b=rows[j],f=(T-a.t)/(b.t-a.t),o={};
 Object.keys(a).forEach(k=>o[k]=a[k]+f*(b[k]-a[k]));return o;
}
function calculate(kind,d,steam=[],superheated=[]){
 let M=[],status='',warn=false,plot=null,header=null,rows=null,caption='';
 if(kind==='flow'){
  const dh=d.h2-d.h1,dk=(d.v2*d.v2-d.v1*d.v1)/2000,q=d.qdot/d.mdot,w=q-dh-dk,power=d.mdot*w;
  M=[metric('Kerja poros keluar wₛ',w,'kJ/kg'),metric('Daya poros keluar Ẇₛ',power,'kW'),metric('Perubahan entalpi Δh',dh,'kJ/kg'),metric('Perubahan energi kinetik',dk,'kJ/kg')];
  status=power>=0?'Daya keluar positif: model menghasilkan kerja poros.':'Daya keluar negatif: model memerlukan daya masuk sebesar '+fmt(-power)+' kW.';
  plot={type:'bars',labels:['h inlet','h outlet','q masuk','w keluar'],values:[d.h1,d.h2,q,w],unit:'kJ/kg'};caption='Nilai per kilogram; energi potensial diabaikan. Pemeriksaan: q − w = Δh + ΔKE.';
 }else if(kind==='closed'){
  const v1=d.m*R*d.t1/d.p1;let v2=v1*d.ratio,t2=d.t1,p2=d.p1,w=0;
  if(d.process==='isothermal'){p2=d.p1/d.ratio;w=d.m*R*d.t1*Math.log(d.ratio)}
  else if(d.process==='isobaric'){t2=d.t1*d.ratio;w=d.p1*(v2-v1)}
  else if(d.process==='isochoric'){v2=v1;t2=d.t1*d.tratio;p2=d.p1*d.tratio}
  else if(d.process==='adiabatic'){t2=d.t1*Math.pow(d.ratio,1-gamma);p2=d.p1*Math.pow(d.ratio,-gamma);w=d.m*cv*(d.t1-t2)}
  const du=d.m*cv*(t2-d.t1),q=du+w;
  M=[metric('Temperatur akhir',t2,'K'),metric('Tekanan akhir',p2,'kPa'),metric('Kerja oleh sistem W',w,'kJ'),metric('Perubahan U',du,'kJ'),metric('Kalor masuk Q',q,'kJ'),metric('Volume awal',v1,'m³',4)];
  const pts=Array.from({length:51},(_,i)=>{const f=i/50,v=v1+(v2-v1)*f;let p=d.p1;if(d.process==='isothermal')p=d.p1*v1/v;else if(d.process==='adiabatic')p=d.p1*Math.pow(v1/v,gamma);else if(d.process==='isochoric')p=d.p1+(p2-d.p1)*f;return [v,p]});
  plot={type:'line',series:[{points:pts,color:'#7659e7'}],x:'V total (m³)',y:'P absolut (kPa)'};
  status='Q − W − ΔU = '+fmt(q-w-du,6)+' kJ. '+(w>0?'Ekspansi menghasilkan kerja.':w<0?'Kompresi memerlukan kerja.':'Kerja batas nol.');caption='Lintasan gas ideal dengan kapasitas panas konstan. Isokhorik memakai rasio temperatur; lintasan lain memakai rasio volume.';
  warn=t2<200||t2>1000;if(warn)status+=' Temperatur akhir di luar 200–1000 K; pendekatan kapasitas panas konstan perlu dikritisi.';
 }else if(kind==='cycle'){
  fail(d.ph<=d.pl,'Tekanan tinggi harus lebih besar daripada tekanan rendah.');fail(d.vh<=d.vl,'Volume besar harus lebih besar daripada volume kecil.');
  const ps=[d.pl,d.ph,d.ph,d.pl],vs=[d.vl,d.vl,d.vh,d.vh],ts=ps.map((p,i)=>p*vs[i]/(d.m*R));let qi=0,qo=0,wt=0,ut=0;rows=[];const ws=[0,d.ph*(d.vh-d.vl),0,-d.pl*(d.vh-d.vl)];
  for(let i=0;i<4;i++){let j=(i+1)%4,du=d.m*cv*(ts[j]-ts[i]),q=du+ws[i];qi+=Math.max(q,0);qo+=Math.max(-q,0);wt+=ws[i];ut+=du;rows.push([`${i+1} → ${j+1}`,fmt(ts[i]),fmt(ts[j]),fmt(ws[i]),fmt(du),fmt(q)])}
  M=[metric('Kerja neto',wt,'kJ'),metric('Kalor masuk total',qi,'kJ'),metric('Kalor buang total',qo,'kJ'),metric('Efisiensi termal',wt/qi*100,'%'),metric('ΣΔU siklus',ut,'kJ',6)];header=['Proses','T awal (K)','T akhir (K)','W (kJ)','ΔU (kJ)','Q (kJ)'];
  plot={type:'line',series:[{points:[[d.vl,d.pl],[d.vl,d.ph],[d.vh,d.ph],[d.vh,d.pl],[d.vl,d.pl]],color:'#7659e7',fill:true}],x:'V total (m³)',y:'P absolut (kPa)',labels:[[d.vl,d.pl,'1'],[d.vl,d.ph,'2'],[d.vh,d.ph,'3'],[d.vh,d.pl,'4']]};
  status='Q neto − W neto = '+fmt(qi-qo-wt,6)+' kJ. Urutan 1→2→3→4→1 searah jarum jam.';warn=Math.max(...ts)>1000||Math.min(...ts)<200;if(warn)status+=' Ada temperatur di luar 200–1000 K: kapasitas panas konstan merupakan pendekatan kasar.';caption='Diagram berskala dari input. Kerja neto sama dengan luas siklus.';
 }else if(kind==='sensible'){
  fail(d.t2<=d.t1,'Untuk model pemanasan, temperatur akhir harus lebih besar dari awal.');const dh=d.a*(d.t2-d.t1)+d.b*(d.t2*d.t2-d.t1*d.t1)/2,q=d.m*dh,avg=dh/(d.t2-d.t1);
  M=[metric('Kalor ke bahan',q,'kJ'),metric('Energi sumber',q/d.eff,'kJ'),metric('cp rata-rata',avg,'kJ/(kg·K)',4),metric('Perubahan entalpi',dh,'kJ/kg')];
  plot={type:'line',series:[{points:Array.from({length:31},(_,i)=>{let t=d.t1+(d.t2-d.t1)*i/30;return[t,d.a+d.b*t]}),color:'#7659e7'}],x:'Temperatur (K)',y:'cp (kJ/(kg·K))'};
  status='cp akhir = '+fmt(d.a+d.b*d.t2,4)+' kJ/(kg·K). Energi sumber melebihi kalor bahan jika efisiensi < 1.';caption='Koefisien ilustratif. Integral cp dT memberi Δh, bukan langsung energi sumber.';
 }else if(kind==='latent'){
  const tc=647.1,tref=373.15,href=2256.9;fail(d.t2>=tc,'Temperatur Watson harus di bawah Tc = 647,1 K.');const h=href*Math.pow((1-d.t2/tc)/(1-tref/tc),.38),hr=d.water==='liquid'?-890.32:-802.30,q=d.rate*hr;
  M=[metric('hfg estimasi Watson',h,'kJ/kg'),metric('Kalor penguapan m·hfg',d.m*h,'kJ'),metric('Kalor reaksi standar',q,'kW'),metric('Pendinginan isotermal',-q,'kW')];
  plot={type:'line',series:[{points:Array.from({length:61},(_,i)=>{const t=273.16+(640-273.16)*i/60;return[t,href*Math.pow((1-t/tc)/(1-tref/tc),.38)]}),color:'#7659e7'}],x:'Temperatur jenuh (K)',y:'hfg (kJ/kg)',labels:[[d.t2,h,'T tujuan']]};
  status='Kalor laten dan reaksi adalah dua kasus terpisah. Nilai reaksi negatif berarti kalor perlu dikeluarkan untuk menjaga kondisi isotermal referensi.';caption='Watson merupakan korelasi empiris. Model reaksi ini tidak menghitung temperatur nyala.';
 }else if(kind==='phase'){
  const r=steam.find(a=>a.t===d.temp);fail(!r,'Pilih temperatur dari cuplikan tabel.');const rel=(d.p-r.p)/r.p,sat=Math.abs(rel)<=.001;let state=sat?'Kondisi jenuh':rel>0?'Cairan terkompresi':'Uap panas lanjut';
  M=[metric('Klasifikasi fase',state),metric('Psat pada T dipilih',r.p,'kPa'),metric('P − Psat',d.p-r.p,'kPa')];
  if(sat){const h=r.hf+d.x*r.hfg,v=r.vf+d.x*r.vfg;M.push(metric('h campuran dengan x',h,'kJ/kg'),metric('v campuran dengan x',v,'m³/kg',6));status='P dan T terkait di kejenuhan. x = '+fmt(d.x,3)+' adalah data tambahan, bukan dihitung dari P dan T.'}else status='x tidak dipakai pada keadaan satu fase. Properti h dan v memerlukan tabel fase yang sesuai.';
  plot={type:'line',series:[{points:steam.map(r=>[r.t,r.p]),color:'#7659e7'}],x:'Temperatur (°C)',y:'Tekanan absolut (kPa)',labels:[[d.temp,d.p,'Input']]};caption='Kurva cair–uap dari sembilan titik jenuh. Penghubung bukan formulasi presisi. Daerah padat dan superkritis tidak ditampilkan.';
 }else if(kind==='steam'){
  const r=interpolated(steam,d.temp),h=r.hf+d.x*r.hfg,s=r.sf+d.x*r.sfg,v=r.vf+d.x*r.vfg,qdot=d.mdot*(h-d.hin);
  M=[metric('Psat estimasi',r.p,'kPa'),metric('Entalpi campuran',h,'kJ/kg'),metric('Entropi campuran',s,'kJ/(kg·K)',4),metric('Volume spesifik',v,'m³/kg',6),metric('Kalor masuk pemanas',qdot,'kW')];
  status=steam.some(a=>a.t===d.temp)?'Temperatur tepat pada baris cuplikan tabel.':'Interpolasi linear kasar dengan interval 20 °C. Gunakan data lebih rapat untuk desain.';if(qdot<0)status+=' Kalor negatif berarti model mengeluarkan kalor dari aliran.';
  plot={type:'line',series:[{points:[[0,r.hf],[1,r.hg]],color:'#7659e7'}],x:'Kualitas massa uap x',y:'Entalpi (kJ/kg)',labels:[[d.x,h,'Campuran']]};caption='Pada T jenuh tetap, h linear terhadap x. Tidak berlaku untuk uap panas lanjut.';
 }else if(kind==='second'||kind==='carnot'){
  fail(d.th<=d.tc,'Reservoir panas harus lebih tinggi daripada reservoir dingin.');
  const ec=1-d.tc/d.th,eta=kind==='carnot'?ec:d.eta,w=d.qh*eta,qc=d.qh-w,sg=qc/d.tc-d.qh/d.th,ds=d.qh/d.th;
  M=[metric('Efisiensi '+(kind==='carnot'?'Carnot':'klaim'),eta*100,'%'),metric('Batas Carnot',ec*100,'%'),metric('Kerja neto',w,'kJ'),metric('Kalor buang',qc,'kJ'),metric('Generasi entropi',sg,'kJ/K',5)];
  warn=eta>ec+1e-10;status=warn?'Klaim melampaui Carnot dan menghasilkan S gen negatif: tidak mungkin untuk model dua reservoir.':kind==='carnot'?'Reversibel: QH/TH = QC/TC = '+fmt(ds,4)+' kJ/K; S gen = 0.':'Klaim memenuhi batas Carnot. Ini belum membuktikan rancangan peralatan dapat diwujudkan.';
  if(kind==='carnot'){plot={type:'line',series:[{points:[[0,d.th],[ds,d.th],[ds,d.tc],[0,d.tc],[0,d.th]],color:'#7659e7',fill:true}],x:'S − S awal (kJ/K)',y:'T (K)',labels:[[0,d.th,'1'],[ds,d.th,'2'],[ds,d.tc,'3'],[0,d.tc,'4']]};caption='Diagram T–S Carnot berskala. Luas = (TH−TC)ΔS = W neto.'}
  else{plot={type:'bars',labels:['Q masuk','W neto','Q buang'],values:[d.qh,w,qc],unit:'kJ'};caption='Neraca energi dapat seimbang meskipun klaim melanggar Hukum II.'}
 }else if(kind==='cop'){
  fail(d.th<=d.tc,'TH harus lebih besar dari TC.');const cr=d.tc/(d.th-d.tc),actual=d.fraction*cr,hp=actual+1,qc=actual*d.win,qh=qc+d.win;
  M=[metric('COP R Carnot',cr,'',3),metric('COP R model aktual',actual,'',3),metric('COP HP model aktual',hp,'',3),metric('Beban pendinginan QC',qc,'kW'),metric('Kalor ke sisi panas QH',qh,'kW')];
  status='QH − QC − Win = '+fmt(qh-qc-d.win,6)+' kW. COP HP = COP R + 1.';plot={type:'bars',labels:['Q dingin','W masuk','Q panas'],values:[qc,d.win,qh],unit:'kW'};caption='Kalor sisi panas mencakup kalor yang dipindahkan dan kerja masuk.';
 }else if(kind==='third'){
  const c=d.a*Math.pow(d.temp,3),s=c/3;
  M=[metric('Cp pada T akhir',c,'J/(mol·K)',5),metric('Entropi dari 0 K',s,'J/(mol·K)',5),metric('Acuan S(0)',0,'J/(mol·K)')];
  plot={type:'line',series:[{points:Array.from({length:51},(_,i)=>{const t=d.temp*i/50;return[t,d.a*t*t*t/3]}),color:'#7659e7'}],x:'T model (K)',y:'S − S0 (J/(mol·K))'};
  status='Integral Cp/T = AT³/3. Model kristal sempurna dengan S0 = 0, tanpa transisi fase; tidak ada pembagian dengan 0 K dalam evaluasi numerik.';caption='Cp model menuju nol. Rentang 1–30 K hanya demonstrasi.';
 }else if(kind==='entropy'){
  const thermal=cp*Math.log(d.t2/d.t1),pressure=-R*Math.log(d.p2/d.p1),ds=thermal+pressure;
  M=[metric('Perubahan entropi spesifik',ds,'kJ/(kg·K)',5),metric('Perubahan entropi total',d.m*ds,'kJ/K',5),metric('Kontribusi temperatur',thermal,'kJ/(kg·K)',5),metric('Kontribusi tekanan',pressure,'kJ/(kg·K)',5)];
  status='ΔS adalah perubahan sifat, bukan otomatis S gen. '+(ds<0?'Entropi sistem menurun; dapat terjadi bila entropi ditransfer keluar.':'Entropi sistem meningkat; neraca aktual memerlukan data transfer kalor dan massa.');
  plot={type:'bars',labels:['Suhu','Tekanan','Total Δs'],values:[thermal,pressure,ds],unit:'kJ/(kg·K)'};caption='Kapasitas panas udara dianggap konstan. Pasangan keadaan tidak menetapkan lintasan aktual.';
 }else if(kind==='rankine'||kind==='actual'){
  const r=steam.find(a=>a.t===d.cond),sup=superheated.find(a=>a.t===d.t3);fail(!r||!sup,'Kondisi tidak tersedia pada dataset.');const x4s=(sup.s-r.sf)/r.sfg;fail(x4s<0||x4s>1,'Outlet isentropik di luar kubah jenuh: tabel tambahan diperlukan.');
  const h4s=r.hf+x4s*r.hfg,wps=r.vf*(3000-r.p),etaT=kind==='actual'?d.etat:1,etaP=kind==='actual'?d.etap:1,wp=wps/etaP,h2=r.hf+wp,wt=etaT*(sup.h-h4s),h4=sup.h-wt,wn=wt-wp,qi=sup.h-h2,qo=h4-r.hf,x4=(h4-r.hf)/r.hfg,eff=wn/qi;
  fail(x4<0||x4>1,'Outlet aktual di luar campuran jenuh. Tabel panas lanjut tambahan diperlukan; ubah parameter.');
  const s4=r.sf+x4*r.sfg,idealEff=(sup.h-h4s-wps)/(sup.h-r.hf-wps);
  M=[metric('Kerja turbin',wt,'kJ/kg'),metric('Kerja pompa masuk',wp,'kJ/kg',4),metric('Kerja neto',wn,'kJ/kg'),metric('Kalor boiler',qi,'kJ/kg'),metric('Efisiensi siklus',eff*100,'%'),metric('Daya poros neto',wn*d.mdot,'kW'),metric('Kualitas outlet x₄',x4,'',5)];if(kind==='actual')M.push(metric('Efisiensi pembanding ideal',idealEff*100,'%'));
  rows=[['1 · outlet kondensor',fmt(r.p),fmt(r.t),fmt(r.hf),fmt(r.sf,4),'Cairan jenuh'],['2 · outlet pompa',fmt(3000),'—',fmt(h2),kind==='actual'?'Tidak dihitung':fmt(r.sf,4),'Cairan terkompresi'],['3 · inlet turbin',fmt(3000),fmt(sup.t),fmt(sup.h),fmt(sup.s,4),'Panas lanjut'],['4 · outlet turbin',fmt(r.p),fmt(r.t),fmt(h4),fmt(s4,4),'Campuran, x='+fmt(x4,4)]];
  header=['Titik','P (kPa)','T (°C)','h (kJ/kg)','s (kJ/(kg·K))','Fase'];status='Residual energi = '+fmt(qi-qo-wn,6)+' kJ/kg. '+(kind==='actual'?'s outlet pompa aktual tidak diperkirakan dari h; model hanya menghitung kerja dan entalpi pompa.':'Turbin isentropik: s4 = s3.');warn=x4<.9;if(warn)status+=' Kadar cairan outlet > 10% pada model ini; periksa risiko kelembapan dengan batas alat yang digunakan.';
  plot={type:'rankine',s1:r.sf,s3:sup.s,s4:s4,tc:r.T,th:sup.t+273.15,actual:kind==='actual'};caption='Skema T–s, tidak berskala; s2 aktual tidak diplot kuantitatif. Gunakan tabel titik untuk perhitungan.';
 }else throw new Error('Jenis simulasi tidak dikenal.');
 return{metrics:M,status,warn,plot,header,rows,caption};
}
function fmt(x,digits=2){return typeof x==='number'?x.toLocaleString('id-ID',{minimumFractionDigits:digits,maximumFractionDigits:digits}):String(x)}
const api={calculate,interpolated,fmt,R,cv,cp,gamma};root.Thermo=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
