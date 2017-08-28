$(document).ready(function () {
    var ignore = getUrlVars()["ignore"];
    if (ignore == 1) {
        getTimeTable(1);
    } else {
        getTimeTable();
    }
    
});

function getTimeTable(ignore) {
    var offLine = window.localStorage.getItem('offLine');
    var lang = getLanguage();
    var l = new Language(lang);
    var uid = window.localStorage.getItem('uid');
    //    User must login in order to get credentials
    if (uid === null) {
        window.location = 'login.html';
       var ignore = 1;
    }
    console.log(ignore);
    if (ignore == 1) {
        if (offLine == 0) {
            $('#spinner').addClass('fa-spin');
            var url = config.webServiceUrl + 'wstoken=' + config.webServiceToken + '&wsfunction=local_webapp_timetable&uid=' + uid + '&moodlewsrestformat=json';
            $.ajax({
                url: url,
                crossDomain: true,
                dataType: 'json',
                success: function (timeTable) {
                    console.log(timeTable);

                    window.localStorage.setItem('fall', b64DecodeUnicode(timeTable[0].fall));
                    window.localStorage.setItem('winter', b64DecodeUnicode(timeTable[0].winter));
                    window.localStorage.setItem('summer', b64DecodeUnicode(timeTable[0].summer));

                }
            });
            $('#spinner').removeClass('fa-spin');
        }
    }
}

function refreshCalendar(defaultDate, thisTerm, day) {
    term = JSON.parse(window.localStorage.getItem(thisTerm));
    console.log(term);
    addActive(day);
    $('#' + day).addClass('active');
    $('#calendar').fullCalendar('destroy');
    $('#calendar').fullCalendar({
        defaultDate: defaultDate,
        editable: false,
        defaultView: 'basicDay',
        weekends: true,
        slotDuration: '00:30:00',
        contentHeight: 'auto',
        minTime: '08:00:00',
        maxTime: '22:00:00',
        textColor: '#ffffff',
        header: {
            left: '',
            center: '',
            right: '',
        },
        events: term
    });
}


function addActive(day) {
    switch (day) {
    case 'm':
        $('#m').addClass('active');
        $('#t').removeClass('active');
        $('#w').removeClass('active');
        $('#r').removeClass('active');
        $('#f').removeClass('active');
        $('#s').removeClass('active');
        break
    case 't':
        $('#m').removeClass('active');
        $('#t').addClass('active');
        $('#w').removeClass('active');
        $('#r').removeClass('active');
        $('#f').removeClass('active');
        $('#s').removeClass('active');
        break;
    case 'w':
        $('#m').removeClass('active');
        $('#t').removeClass('active');
        $('#w').addClass('active');
        $('#r').removeClass('active');
        $('#f').removeClass('active');
        $('#s').removeClass('active');
        break;
    case 'r':
        $('#m').removeClass('active');
        $('#t').removeClass('active');
        $('#w').removeClass('active');
        $('#r').addClass('active');
        $('#f').removeClass('active');
        break;
    case 'f':
        $('#m').removeClass('active');
        $('#t').removeClass('active');
        $('#w').removeClass('active');
        $('#r').removeClass('active');
        $('#f').addClass('active');
        $('#s').removeClass('active');
        break;
    case 's':
        $('#m').removeClass('active');
        $('#t').removeClass('active');
        $('#w').removeClass('active');
        $('#r').removeClass('active');
        $('#f').removeClass('active');
        $('#s').addClass('active');
        break;
    }
}

function getLink() {
    var now = new Date();
    console.log(now);
    var link = '';
    switch (now.getMonth()) {
    case 0:
    case 1:
    case 2:
    case 3:
        link = 'winter.html';
        break;
    case 4:
    case 5:
    case 6:
      link  = 'summer.html';
        break;
    case 7:
    case 8: 
    case 9:
    case 10:
    case 11:
        link = 'fall.html';
        break;
    }

    return link;

}