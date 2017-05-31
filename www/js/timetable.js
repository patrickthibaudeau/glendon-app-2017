$(document).ready(function () {
    getTimeTable();
});

function getTimeTable() {
    var offLine = window.localStorage.getItem('offLine');
    var lang = getLanguage();
    var l = new Language(lang);
    if (offLine == 0) {
        var url = config.webServiceUrl + 'wstoken=' + config.webServiceToken + '&wsfunction=local_webapp_timetable&uid=gallantg&moodlewsrestformat=json';
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
    }
}

function refreshFallCalendar(defaultDate) {
    term = JSON.parse(b64DecodeUnicode(window.localStorage.getItem('fall')));
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
                    header: {
                        left: '',
                        center: '',
                        right: '',
                    },
                    events: term
                });
}

function refreshWinterCalendar(defaultDate) {
    term = JSON.parse(b64DecodeUnicode(window.localStorage.getItem('winter')));
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
                    header: {
                        left: '',
                        center: '',
                        right: '',
                    },
                    events: term
                });
}
function refreshSummerCalendar(defaultDate) {
    term = JSON.parse(b64DecodeUnicode(window.localStorage.getItem('summer')));
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
                    header: {
                        left: '',
                        center: '',
                        right: '',
                    },
                    events: term
                });
}