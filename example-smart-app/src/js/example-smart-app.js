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
          var maritalStatus = patient.maritalStatus.code;
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

          console.log(income.length === 0);

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
    //var maritalStatus_dropdown = '<select id = "inputMaritalStatus">' +
    //  '<option value = "">-Make a Selection-</option>' +
    //  '<option value = "'
    $('#education').html(p.education);
    //$('#employment').html(p.employment);
    var employment_dropdown = '<select id = "inputEmployment">' +
      '<option value = "">-Make a Selection-</option>' +
      '<option value = "unemployed">Unemployed</option>' +
      '<option value = "employed_full_time">Employed Full Time</option>' +
      '</select>';
    $('#employment').html(employment_dropdown);
  };

})(window);

A	http://terminology.hl7.org/CodeSystem/v3-MaritalStatus	Annulled	Marriage contract has been declared null and to not have existed
D	http://terminology.hl7.org/CodeSystem/v3-MaritalStatus	Divorced	Marriage contract has been declared dissolved and inactive
I	http://terminology.hl7.org/CodeSystem/v3-MaritalStatus	Interlocutory	Subject to an Interlocutory Decree.
L	http://terminology.hl7.org/CodeSystem/v3-MaritalStatus	Legally Separated	Legally Separated
M	http://terminology.hl7.org/CodeSystem/v3-MaritalStatus	Married	A current marriage contract is active
P	http://terminology.hl7.org/CodeSystem/v3-MaritalStatus	Polygamous	More than 1 current spouse
S	http://terminology.hl7.org/CodeSystem/v3-MaritalStatus	Never Married	No marriage contract has ever been entered
T	http://terminology.hl7.org/CodeSystem/v3-MaritalStatus	Domestic partner	Person declares that a domestic partner relationship exists.
U	http://terminology.hl7.org/CodeSystem/v3-MaritalStatus	unmarried	Currently not in a marriage contract.
W	http://terminology.hl7.org/CodeSystem/v3-MaritalStatus	Widowed	The spouse has died
UNK	http://terminology.hl7.org/CodeSystem/v3-NullFlavor	unknown	Description:A proper value is applicable, but not known. Usage Notes: This means the actual value is not known. If the only thing that is unknown is how to properly express the value in the necessary constraints (value set, datatype, etc.), then the OTH or UNC flavor should be used. No properties should be included for a datatype with this property unless: Those properties themselves directly translate to a semantic of "unknown". (E.g. a local code sent as a translation that conveys 'unknown') Those properties further qualify the nature of what is unknown. (E.g. specifying a use code of "H" and a URL prefix of "tel:" to convey that it is the home phone number that is unknown.)