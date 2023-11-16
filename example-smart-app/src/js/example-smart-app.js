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
          var maritalStatus = patient.maritalStatus.coding[0].code;
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
    //$('#maritalStatus').html(p.maritalStatus);
    var maritalStatus_dropdown = '<select id = "inputMaritalStatus">' +
      '<option value = "">-Make a Selection-</option>' +
      '<option value = "UNK" '+ (p.maritalStatus === 'UNK' ? ' selected' : '') + '>Unknown</option>' +
      '<option value = "A" '+ (p.maritalStatus === 'A' ? ' selected' : '') + '>Annulled</option>' +
      '<option value = "D" '+ (p.maritalStatus === 'D' ? ' selected' : '') + '>Divorced</option>' +
      '<option value = "I" '+ (p.maritalStatus === 'I' ? ' selected' : '') + '>Interlocutory</option>' +
      '<option value = "L" '+ (p.maritalStatus === 'L' ? ' selected' : '') + '>Legally Separated</option>' +
      '<option value = "M" '+ (p.maritalStatus === 'M' ? ' selected' : '') + '>Married</option>' +
      '<option value = "P" '+ (p.maritalStatus === 'P' ? ' selected' : '') + '>Polygamous</option>' +
      '<option value = "S" '+ (p.maritalStatus === 'S' ? ' selected' : '') + '>Never Married</option>' +
      '<option value = "T" '+ (p.maritalStatus === 'T' ? ' selected' : '') + '>Domestic Partner</option>' +
      '<option value = "U" '+ (p.maritalStatus === 'U' ? ' selected' : '') + '>Unmarried</option>' +
      '<option value = "W" '+ (p.maritalStatus === 'W' ? ' selected' : '') + '>Widowed</option>' +
      '</select>';
    $('#maritalStatus').html(maritalStatus_dropdown);

    //$('#education').html(p.education);
    var education_dropdown = 'select id = "inputEducation">' +
      '<option value = "">-Make a Selection-</option>' +
      '<option value = "No_schooling" '+ (p.education === 'No schooling' ? ' selected' : '') + '>No Schooling</option>' +
      '<option value = "8th_grade/less" '+ (p.education === '8th grade/less' ? ' selected' : '') + '>8th Grade or Less</option>' +
      '<option value = "9-11_grades" '+ (p.education === '9-11 grades' ? ' selected' : '') + '>9-11 Grades</option>' +
      '<option value = "High_school" '+ (p.education=== 'High school' ? ' selected' : '') + '>High School</option>' +
      '<option value = "Technical_or_trade_school" '+ (p.education === 'Technical_or_trade_school' ? ' selected' : '') + '>Technical or Trade School</option>' +
      '<option value = "Some_college" '+ (p.education === 'Some college' ? ' selected' : '') + '>Some College</option>' +
      '<option value = "Associate_degree" '+ (p.education === 'Associate degree (e.g., AA, AS)' ? ' selected' : '') + '>Associate Degree (e.g., AA, AS)</option>' +
      '<option value = "Bachelor_degree" '+ (p.education === 'Bachelor\'s degree (e.g., BA, AB, BS)' ? ' selected' : '') + '>Bachelor\'s Degree (e.g., BA, AB, BS)</option>' +
      '<option value = "Master_degree" '+ (p.education === 'Master\'s degree (e.g., MA, MS, MEng, MEd, MSW, MBA)' ? ' selected' : '') + '>Master\'s Degree (e.g., MA, MS, MEng, MEd, MSW, MBA)</option>' +
      '<option value = "Doctoral_degree" '+ (p.education === 'Doctoral degree (e.g., PhD, EdD)' ? ' selected' : '') + '>Doctoral Degree (e.g., PhD, EdD)</option>' +
      '<option value = "Professional_degree" '+ (p.education === 'Professional degree (e.g., MD, DDS, DVM, LLB, JD)' ? ' selected' : '') + '>Professional Degree (e.g., MD, DDS, DVM, LLB, JD)</option>' +      
      '<option value = "Unknown" '+ (p.education === 'Unknown' ? ' selected' : '') + '>Unknown</option>' + 
      '</select>';
    $('#education').html(education_dropdown);

    //$('#employment').html(p.employment);
    var employment_dropdown = '<select id = "inputEmployment">' +
      '<option value = "">-Make a Selection-</option>' +
      '<option value = "Unemployed" '+ (p.employment === 'Unemployed' ? ' selected' : '') + '>Unemployed</option>' +
      '<option value = "Employed_full_time" '+ (p.employment === 'Employed full time' ? ' selected' : '') + '>Employed Full Time</option>' +
      '<option value = "Employed_part_time" '+ (p.employment === 'Employed part time' ? ' selected' : '') + '>Employed Part Time</option>' +
      '<option value = "Homemaker" '+ (p.employment === 'Homemaker' ? ' selected' : '') + '>Homemaker</option>' +
      '<option value = "Retired_due_to_age/preference" '+ (p.employment === 'Retired due to age/preference' ? ' selected' : '') + '>Retired due to Age/Preference</option>' +
      '<option value = "Retired_due_to_disability" '+ (p.employment === 'Retired due to disability' ? ' selected' : '') + '>Retired due to Disability</option>' +
      '<option value = "Medical_leave_of_absence" '+ (p.employment === 'Medical leave of absence' ? ' selected' : '') + '>Medical Leave of Absence</option>' +
      '<option value = "Student" '+ (p.employment === 'Student' ? ' selected' : '') + '>Student</option>' +
      '</select>';
    $('#employment').html(employment_dropdown);
  };

  var incomeTextbox = '<input type="text" id="inputIncome" value="' + (p.income!=='' ? p.income : 'type in yearly family income') + '">';
  $('#income').html(incomeTextbox);

})(window);