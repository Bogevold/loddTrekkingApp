  var forste = true;
  var ferdig = true;
  var varTimer;
  var varTimer2;
  var varLoddene = [];
  var varVinnere = [];
  var varTrukket = 0;
  var antVinnere = 1;
  var vRad = 7;
  var vCol = 5;
  
  var vinnerListe;
  var varNavn = {};

  function saveNames() {
    var antLodd = document.getElementById('antallLodd').value;
    localStorage.setItem('loddNavn_' + antLodd, JSON.stringify(varNavn));
  }

  function loadNames() {
    var antLodd = document.getElementById('antallLodd').value;
    var data = localStorage.getItem('loddNavn_' + antLodd);
    varNavn = data ? JSON.parse(data) : {};
  }

  function clearNames() {
    var antLodd = document.getElementById('antallLodd').value;
    localStorage.removeItem('loddNavn_' + antLodd);
    varNavn = {};
    creDivLodd();
  }

  function creTable() {
    document.getElementById('Resultat').setAttribute('hidden', '');
    var hentLodd = document.getElementById('antallLodd');
    antLodd = hentLodd.value;
    loddNr = 1;
    var tblCont = document.getElementById('tblCont');
    tblCont.innerHTML = "";
    var tbl = document.createElement('table');
    var tblB = document.createElement('tbody');
    tbl.setAttribute('class', 'table-condensed');
    for (var i = 0; i < vRad; i++) {
        var tr = document.createElement('tr');
        for (var n = 0; n < vCol; n++) {
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(loddNr));
            td.setAttribute('id', "loddNr"+loddNr++);
            tr.appendChild(td);
            
        }
        tblB.appendChild(tr);
    }
    tbl.appendChild(tblB);
    tblCont.appendChild(tbl);
    document.getElementById('inVinnere').setAttribute('max', antLodd);
  }
  
  function creDivLodd() {
    document.getElementById('Resultat').setAttribute('hidden', '');
    var hentLodd = document.getElementById('antallLodd');
    antLodd = hentLodd.value;
    loddNr = 1;
    var tblCont = document.getElementById('tblCont');
    tblCont.style.maxWidth=maxBreddeLodd+"px";
    tblCont.innerHTML = "";
    loadNames();
    for (var i = 0; i < antLodd; i++) {
      var nr = loddNr++;
      var td = document.createElement('div');
      td.setAttribute('id', "loddNr"+nr);
      td.setAttribute('data-nr', nr);
      td.classList.add('lodd');
      if (varNavn[nr]) {
        td.classList.add('solgt');
        td.textContent = varNavn[nr].length > 6 ? varNavn[nr].substring(0,6) + '..' : varNavn[nr];
        td.title = varNavn[nr] + ' (lodd ' + nr + ')';
      } else {
        td.textContent = nr;
      }
      td.addEventListener('click', function() {
        var loddNum = this.getAttribute('data-nr');
        var eksNavn = varNavn[loddNum] || '';
        var navn = prompt('Navn for lodd ' + loddNum + ':', eksNavn);
        if (navn === null) return;
        if (navn.trim() === '') {
          delete varNavn[loddNum];
          this.classList.remove('solgt');
          this.textContent = loddNum;
          this.title = '';
        } else {
          varNavn[loddNum] = navn.trim();
          this.classList.add('solgt');
          this.textContent = navn.trim().length > 6 ? navn.trim().substring(0,6) + '..' : navn.trim();
          this.title = navn.trim() + ' (lodd ' + loddNum + ')';
        }
        saveNames();
      });
      tblCont.appendChild(td);
    }
    document.getElementById('inVinnere').setAttribute('max', antLodd);
  }  
  
  function nullAlleCeller() {
    var celler = document.getElementsByClassName('lodd');
    for (var i=0; i < celler.length; i++) {
        //celler[i].setAttribute('class', 'normal');
        celler[i].classList.add('normal');
        celler[i].classList.remove('valgt');
    }
  }

  function nullCeller() {
    for (var i=0; i < varLoddene.length; i++) {
        //varLoddene[i].setAttribute('class', 'normal');
        //console.log(celler[i].getAttribute('id'));
        varLoddene[i].classList.add('normal');
        varLoddene[i].classList.remove('valgt');
    }
  }  
  

  function trekk() {
    document.getElementById('Resultat').setAttribute('hidden', '');
    varLoddene = Array.prototype.slice.call(document.getElementsByClassName('lodd'));
    starTid = Date.now();
    varVinnere = [];
    varTrukket = 0;
    antVinnere = document.getElementById('inVinnere').value;
    varTimer = window.setInterval(velgLodd, 100);
    while (vinnerListe.firstChild) {
        vinnerListe.removeChild(vinnerListe.firstChild);
    }
  }  

  function velgLodd() {
    nullCeller();
    var nr = Math.floor(Math.random() * varLoddene.length);
    //varLoddene[nr].setAttribute('class', 'valgt');
    varLoddene[nr].classList.add('valgt');
    varLoddene[nr].classList.remove('normal')
    var varTid = Date.now() - starTid;
    var varIntervall = document.getElementById('inTid').value * 1000/antVinnere;
    console.log("Tid: " + varTid);
    console.log("Intervall: " + varIntervall);
    console.log("varTrukket: " + varTrukket);
    if (varTid  > varIntervall*(1+varTrukket) ) {
      varTrukket++;
      varVinnere.push(varLoddene[nr]);
      varLoddene.splice(nr,1);
      if (antVinnere==varTrukket) {
        window.clearInterval(varTimer);
      }
            
      var vinnerEl = varVinnere[varVinnere.length - 1];
      var vinnerLoddInn = vinnerEl.getAttribute('data-nr');
      console.log("Node value: " + vinnerLoddInn);

      var vinnerTekst;
      if (varNavn[vinnerLoddInn]) {
        vinnerTekst = "Vinner nr " + (varVinnere.length) + ": " + varNavn[vinnerLoddInn] + " (lodd nr " + vinnerLoddInn + ")";
      } else {
        vinnerTekst = "Vinner nr " + (varVinnere.length) + " ble lodd nr: " + vinnerLoddInn;
      }
      var punkt = document.createElement('li');
      punkt.appendChild(document.createTextNode(vinnerTekst));

      if (varTrukket == 1) {
        var res = document.getElementById('Resultat');
        res.removeAttribute('hidden');
        var vinnereTxt = document.createElement('div');
        vinnerListe = document.createElement('ul');
        vinnerListe.setAttribute('class', 'vinnere');

        vinnereTxt.appendChild(vinnerListe);
        res.appendChild(vinnereTxt);
      }

      vinnerListe.appendChild(punkt);

  
    }
    
  }
  
  
  
  function velgInn() {
    document.getElementById("tabInn").setAttribute('class', 'active');
    document.getElementById("tabTrekk").removeAttribute('class');
    document.getElementById("divInnstillinger").removeAttribute('hidden');
    document.getElementById("divTrekking").setAttribute('hidden', '');
  }

  function velgTrekk() {
    document.getElementById("tabTrekk").setAttribute('class', 'active');
    document.getElementById("tabInn").removeAttribute('class');
    document.getElementById("divTrekking").removeAttribute('hidden');
    document.getElementById("divInnstillinger").setAttribute('hidden', '');
  }
  
  function fBeregn() {
    vRad = document.getElementById('antallRader').value;
    vCol = document.getElementById('antallKol').value;
    var antLoddB = vRad * vCol;
    document.getElementById('antallLodd').value = antLoddB;
    creTable();
  }

  function fnyBeregn() {
    //vRad = document.getElementById('antallRader').value;
    //vCol = document.getElementById('antallKol').value;
    //var antLoddB = vRad * vCol;
    var antLoddB = document.getElementById('antallLodd').value;
    var sq = Math.round(Math.sqrt(antLoddB));
    maxBreddeLodd = 60*sq;
    creDivLodd();
  }
  
  var starTid;
  var maxBreddeLodd = 300;
  
  $(document).on('click', '.panel-heading span.clickable', function(e) {
    var $this = $(this);
    if (!$this.hasClass('panel-collapsed')) {
      $this.parents('.panel').find('.panel-body').slideUp();
      $this.addClass('panel-collapsed');
      $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
    } else {
      $this.parents('.panel').find('.panel-body').slideDown();
      $this.removeClass('panel-collapsed');
      $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
    }
  });

  
function CCSStylesheetRuleStyle(stylesheet, selectorText, style, value){
  /* returns the value of the element style of the rule in the stylesheet
  *  If no value is given, reads the value
  *  If value is given, the value is changed and returned
  *  If '' (empty string) is given, erases the value.
  *  The browser will apply the default one
  *
  * string stylesheet: part of the .css name to be recognized, e.g. 'default'
  * string selectorText: css selector, e.g. '#myId', '.myClass', 'thead td'
  * string style: camelCase element style, e.g. 'fontSize'
  * string value optionnal : the new value
  */
  var CCSstyle = undefined, rules;
  for(var m in document.styleSheets){
    if(document.styleSheets[m].href.indexOf(stylesheet) != -1){
     rules = document.styleSheets[m][document.all ? 'rules' : 'cssRules'];
     for(var n in rules){
       if(rules[n].selectorText == selectorText){
         CCSstyle = rules[n].style;
         break;
       }
     }
     break;
    }
  }
  if(value == undefined)
    return CCSstyle[style]
  else
    return CCSstyle[style] = value
};

function fStil(x) {
  console.log(x.value);
  var stil = x.value;
  CCSStylesheetRuleStyle('loddTrekking', ".valgt", "background-image", "url("+stil+"_30x30.png)");
  CCSStylesheetRuleStyle('loddTrekking', "ul.vinnere", "list-style-image", "url("+stil+"_12x12.png)");
}

function fValider() {
  console.log("fValider");
  if (document.getElementById("antallLodd").validity.valid &&
    document.getElementById("inTid").validity.valid &&
    document.getElementById("inVinnere").validity.valid ) {
    document.getElementById("bTrekk").disabled = false;
  }   else {
    document.getElementById("bTrekk").disabled = true;
  }
}
