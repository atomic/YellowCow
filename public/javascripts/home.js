/**
 * Created by atomic on 5/1/17.
 */

var id_selected = 0;
var voted = 0;
var current_pos;

$(document).ready(function (event) {

    var map = L.map('map', {
        zoom: 15,
        doubleClickZoom: false
    }).locate({setView: true, maxZoom: 16});
    map.on('locationfound', function (e) {
        current_pos = e.latlng;
        console.log('current_pos : ' + current_pos);
        $(".row").each(setupPosts);
        $(".map").hide();
    }).on('locationerror', function (e) {
        current_pos = new L.LatLng( coor_ucsd[0], coor_ucsd[1]); // ( coor_ucsd.slice().reverse() );
        $(".row").each(setupPosts);
        $(".map").hide();
    });


    // Get the button that opens the modal

    const modal = document.getElementById('myModal');
    var modalBody = $(".modal-body");
    var selected_id = 0;

    $(".btn-comments").each( function (index) {
        var $comments = $(this).closest('div.row').find('.comments');  // find the closest comments div

        $(this).on("click", function () {
            selected_id  = $comments.data('id');        // updating the selected_id for later use
            modal.style.display = "block";
            console.log($comments.html());
            console.log(selected_id);
            modalBody.html($comments.html());
        });
    })


    var commentShown = false;

    var newComment = $("#modal-cmt-add");
    $("#modal-btn-close").each(function () {
        $(this).on("click", function () {
            commentShown = false;                   // redundant if page is going to be reloaded anyway
            newComment.hide();
            modal.style.display = "none";
            location.reload();                      // TODO: this is temporary solution, later on use some kind of object representation to store different posts's data (Angular?)
        })
    });
    $("#modal-btn-add").each(function () {

        console.log('setup, id: ' + selected_id);

        $(this).off().on("click", function () {
            console.log('comment: ' + commentShown);
            console.log('id: ' + selected_id);

            if (commentShown) {

                $.post('/home/add_comments', { 'id': selected_id, 'comment': newComment.val() }, function (req, res) {
                    // alert('Comment Added!');
                    modalBody.first().append($('<p class="list-group-item">' + newComment.val() + '</p>'));
                    newComment.val("");
                });
                // newComment.hide();
                // modal.style.display = "none";
                // commentShown = false;
            } else {
                commentShown = true;
                newComment.show();
            }
        })
    });



// Get the <span> element that closes the modal
    const span = document.getElementsByClassName("close")[0];


/*********************************************************/
// When the user clicks on <span> (x), close the modal
    /*BUGGY---- TO-DO if user clicks (x) then the comments down refresh like how it does when the user clicks the "CLOSE" button */

    // span.onclick = function() {
    //     modal.style.display = "none";
    // };
/*********************************************************/

});

/**
 * Function that applies to each post
 * @param i     index of the post on home page
 * @param obj
 */
function setupPosts(i, obj) {
    var id = $(this).data('id');
    var coor = $(this).data('coordinate');
    var votes = parseInt($(this).data('votes'));
    coor = coor.split(',').map(parseFloat).reverse();

    // var dist = current_pos.distanceTo(features[i].geo.geometry.coordinates.slice().reverse());
    var dist = current_pos.distanceTo( coor.slice() );
    var rad = Math.abs(200 + 10.0*(votes));

    if (dist > rad) {
        $(this).hide();
    }
    // console.log('post :', id, ', rad: ' + rad, ', dist: ' + dist);



    var postmap = $('<div>', {
        "class": "map",
        "id": "map" + id,
        "style": "height: 200px; width: auto;"
    }).after('<hr>');
    $(this).append(postmap);

    var map = L.map('map' + id, {
            center: coor,
            zoom: 15,
            zoomControl: false,
            attributionControl: false,
            boxZoom: false,
            dragging: false,
            doubleClickZoom: false,
            scrollWheelZoom: false
        }
    );
    L.marker(coor).addTo(map);


    L.tileLayer(openstreetUrl, openstreetAttribution).addTo(map);
}

/**
 * funtion to show the map view when clicked
 * @param id
 */
function toggleMap(id) {
    $("#map" + id).slideToggle();
    $("#map").closest('.btn.showmap').text("Hide");
}



//    Vote implemented: see javascripts/util.js
/**
 * callback function for the upvote, downvote function
 * see related files: javascript/util.js and route/post.js (server)
 * @param result
 * @param status
 */
function updateVote(result, status) {
    $(`div.row[data-id=${result.id}]`).find('p.votes').text(result.voted + ' votes');
}

/**
 * function that remove a post (may be changed to automatic deletion later on
 *
 * @param result
 * @param status
 */
function removePost(id) {
    var del = confirm("Are you sure you want to delete this pintura?");
    if(del == true){
        deletePost(id, function (result) {
            $(`div.row[data-id=${id}]`).slideToggle();
        });
    }
}
