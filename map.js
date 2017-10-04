(function () {

    var app = angular.module('BlakWealth');

    app.config(configure);

    configure.$inject = ['$stateProvider'];


    function configure($stateProvider) {

        $stateProvider.state({
            name: 'analytics.Map',
            component: 'userLocation',
            url: '/users/location'
        });
    }

    app.component('userLocation', {
        templateUrl: 'user-location/map.html',
        controller: 'userMapController as gm'
    })
})();


(function () {

    var app = angular.module('BlakWealth');

    app.controller('userMapController', userMapController);

    userMapController.$inject = ['userInfoService', '$window'];

    function userMapController(userInfoService, $window) {

        var gm = this;
        gm.$onChanges = _init;
        var geocoder;
        var map;
        var address = [];
        var locations = [];
        var markers = {};


        function _init() {
            initMap();
            userInfoService.getAllUserLocation().then(_getLocationSuccess, _getLocationError);
        }


        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                center: new google.maps.LatLng(37.0902, -95.7129),
                zoom: 4,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            map.setOptions({ minZoom: 2, maxZoom: 21 });
        }


        function _getLocationSuccess(response) {
            geocoder = new google.maps.Geocoder();

            for (var i = 0; i < response.data.items.length; i++) {
                var city = response.data.items[i].city;

                geocoder.geocode({
                    'address': city
                }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var lat = results[0].geometry.location.lat();
                        var lng = results[0].geometry.location.lng();
                        var latLng = ({ lat: lat, lng: lng });
                        locations.push(latLng);
                        var markers = locations.map(function (location) {
                            return new google.maps.Marker({
                                position: location
                            });
                        });

                        var markerCluster = new MarkerClusterer(map, markers,
                            { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
                    } else {
                        console.log("Geocode was not successful for the following reason: " + status);
                    }
                });

            }
        }


        function _getLocationError() {
            console.log("getting user location error");
        }



    }
})();