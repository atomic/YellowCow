
$(document).ready(function (event) {
    // http://stackoverflow.com/questions/34048093/submit-canvas-data-in-an-html-form
    var canvas = document.getElementById('myCanvas');

    $("#post_graffiti_form").submit( function(event) {
        event.preventDefault();

        /**
         * Using indirect post method to handle image upload separately
         * @type {*}
         */
        var $form = $(this);
        var dataURL = canvas.toDataURL('image/png');
        /* stop form from submitting (handle manually) */

        $.ajax({
            type: "POST",
            url: "/post/submit_canvas",
            data: {
                testSend: 'stuff',
                imgBase64: dataURL
            }
        }).done(function (data) { // data is undefined, not sending anything back
            console.log('image saved successfully');
            $.post( $form.attr('action'), $form.serialize() + '&lat=' + coor[1] + '&lng=' + coor[0],
                function (data) {
                    window.location.href = '/home';
                });
        }).fail(function (jqXHR, exception) {
            // Our error logic here
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        });


    });
    // $(document).on('submit', '#post_graffiti_form', function(event) {
    // });

    var coor = [-117.23758, 32.88044]; // UCSD default

    var map = L.map('map', {
        center: coor.slice().reverse(),
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        boxZoom: false,
        dragging: false,
        doubleClickZoom: false,
        scrollWheelZoom: false
    }).locate({setView: true, maxZoom: 16});

    var new_marker = L.icon({
        iconUrl: 'images/marker-new.png',
        iconSize: [45, 45]
    });

    L.tileLayer(openstreetUrl, openstreetAttribution).addTo(map);

    function onLocationFound(e) {
        coor = [e.latlng.lng, e.latlng.lat];

        var radius = e.accuracy / 2;

        L.marker(e.latlng, { icon: new_marker }).addTo(map).bindPopup("<h4>Your pintura will be posted here.</h4>").openPopup();

        console.log('location: e.latlng');
    }

    function onLocationError(e) {
        alert('Location cannot be found because of GPS error. Will center around UCSD');
        map.panTo( coor, 15);
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
});
