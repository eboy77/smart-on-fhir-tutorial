(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient; 
        var pt = patient.read();

         var obv = smart.patient.api.fetchAll({
           type: 'Observation',
           query: {
             code: {
               $or: ['http://loinc.org|63586-2', 'http://loinc.org|82589-3', 'http://loinc.org|67875-5']
             }
           }
         });

        console.log('patient:');
        console.log(patient);

        $.when(pt, obv).fail(onError);

        $.when(pt, obv).done(function(patient, obv) {
          var byCodes = smart.byCodes(obv, 'code');

          var gender = patient.gender;
          var maritalStatus = patient.maritalStatus.text;
          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family;
          }

          // Observations
          // lymph = byCodes('26478-8');
          var income = byCodes('63586-2');
          var education = byCodes('82589-3');
          var employment = byCodes('67875-5');

          var p = defaultPatient();
          p.birthdate = patient.birthDate;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.maritalStatus = maritalStatus;
          p.income = income;
          p.education = education;
          p.employment = employment;
          ret.resolve(p);
        });
      } else {
        onError();
      }
    }

    console.log(income);

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      maritalStatus: {value: ''},
      income: {value: ''},
      education: {value: ''},
      employment: {value: ''},
    };
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#maritalStatus').html(p.maritalStatus);
    if (!p.employment){
      $('#employment').html('<input type="text" id="inputEmployment">');
      handleMissingEmployment(p);
    } else {
      $('#employment').html(p.employment)
    }
    $('#income').html(p.income);

    $('#education').html(p.education);
    $('#employment').html(p.employment);

    function handleMissingEmployment(p){
      $('#inputEmployment').change(function(){
        p.employment = $(this).val();
      });
    }

  };

})(window);
