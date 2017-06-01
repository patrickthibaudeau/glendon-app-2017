$(document).ready(function () {
    getTimeTable();
});

function getTimeTable(ignore) {
    var offLine = window.localStorage.getItem('offLine');
    var lang = getLanguage();
    var l = new Language(lang);
    var uid = window.localStorage.getItem('uid');
//    User must login in order to get credentials
    if (uid === null) {
        window.location = 'login.html';
    }
    var fall = window.localStorage.getItem('fall');
//    perform webservice call only if needed.
    if (fall === null) {
        ignore = 1;
    }
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

                    window.localStorage.setItem('fall', timeTable[0].fall);
                    window.localStorage.setItem('winter', timeTable[0].winter);
                    window.localStorage.setItem('summer', timeTable[0].summer);
                   
                }
            });
            $('#spinner').removeClass('fa-spin'); 
        }
    }
}

function refreshFallCalendar(defaultDate, day) {
    term = JSON.parse(b64DecodeUnicode(window.localStorage.getItem('fall')));
    console.log(term);
    addActive(day);
    $('#' + day).addClass('active');
    $('#calendar').fullCalendar('destroy');
    $('#calendar').fullCalendar({
        defaultDate: defaultDate,
        editable: false,
        defaultView: 'basicDay',
        weekends: false,
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

function refreshWinterCalendar(defaultDate, day) {
    term = JSON.parse(b64DecodeUnicode(window.localStorage.getItem('winter')));
    addActive(day);
    console.log(term);
    $('#calendar').fullCalendar('destroy');
    $('#calendar').fullCalendar({
        defaultDate: defaultDate,
        editable: false,
        defaultView: 'basicDay',
        weekends: false,
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

function refreshSummerCalendar(defaultDate, day) {
    term = JSON.parse(b64DecodeUnicode(window.localStorage.getItem('summer')));
    addActive(day);
    console.log(term);
    $('#calendar').fullCalendar('destroy');
    $('#calendar').fullCalendar({
        defaultDate: defaultDate,
        editable: false,
        defaultView: 'basicDay',
        weekends: false,
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
        break
    case 't':
        $('#m').removeClass('active');
        $('#t').addClass('active');
        $('#w').removeClass('active');
        $('#r').removeClass('active');
        $('#f').removeClass('active');
        break;
    case 'w':
        $('#m').removeClass('active');
        $('#t').removeClass('active');
        $('#w').addClass('active');
        $('#r').removeClass('active');
        $('#f').removeClass('active');
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
        break;
    }
}