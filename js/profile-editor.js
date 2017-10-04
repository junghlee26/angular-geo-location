(function () {
    "use strict";

    // get a reference to the existing BlakWealth angular module
    var app = angular.module('BWProject');

    // register our configuration callback
    app.config(configure);

    configure.$inject = ['$stateProvider'];

    function configure($stateProvider) {
        // register the state that we will be providing
        $stateProvider.state({
            name: 'profileEditor',
            component: 'profileEditor',
            url: '/profile/edit'
        });
        $stateProvider.state({
            name: 'profilePage',
            component: 'profilePage',
            url: '/profile'
        });
        $stateProvider.state({
            name: 'otherUserProfile',
            component: 'otherUserProfile',
            url: '/profile/{userId}'
        });
    }

    // register our component
    app.component('profileEditor', {
        templateUrl: 'profile-editor/profile-editor.html',
        controller: 'profileController as pvm'
    });
    app.component('profilePage', {
        templateUrl: 'profile-editor/profile-page.html',
        controller: 'profileController as pvm'
    });
    app.component('otherUserProfile', {
        templateUrl: 'profile-editor/otherUserProfile.html',
        controller: 'profileController as pvm'
    });

    function exampleScreen() {
        this.message = 'hello from the exampleScreen controller!';
    }
})();

//----------Get profile information factory----------//
(function () {
    "use strict";
    angular.module('BWProject')
        .factory('getInfoService', getInfoService);

    getInfoService.$inject = ['$http'];

    function getInfoService($http) {

        function _getUser() {
            var settings = {
                url: "/api/profile/user"
                , method: "GET"
                , cache: false
                , responseType: "json"
                , contentType: "application/json; character=UTF-8"
                , withCredentials: true
            };
            return $http(settings);
        }
        return {
            getUser: _getUser
        };
    }
})();

//----------Update profile information factory----------//
(function () {
    "use strict";
    angular.module('BWProject')
        .factory('updateInfoService', updateInfoService);

    updateInfoService.$inject = ['$http'];

    function updateInfoService($http) {

        function _updateInfo(data) {
            var settings = {
                url: "/api/profile/updateinfo"
                , method: "PUT"
                , cache: false
                , responseType: "json"
                , contentType: "application/json; character=UTF-8"
                , data: data
                , withCredentials: true
            };
            return $http(settings);
        }
        return {
            updateInfo: _updateInfo
        };
    }
})();
//----------Update password factory----------//
(function () {
    "use strict";
    angular.module('BWProject')
        .factory('updatePasswordService', updatePasswordService);

    updatePasswordService.$inject = ['$http'];

    function updatePasswordService($http) {

        function _updatePassword(data) {
            var settings = {
                url: "/api/profile/changepassword"
                , method: "PUT"
                , cache: false
                , responseType: "json"
                , contentType: "application/json; character=UTF-8"
                , data: data
                , withCredentials: true
            };
            return $http(settings);
        }
        return {
            updatePassword: _updatePassword
        };
    }
})();

//-----Controller for get info, update info, cancel edit, and update password-----//
(function () {
    "use strict";
    angular.module('BWProject')
        .controller('profileController', profileController);

    profileController.$inject = ['getInfoService', 'updateInfoService', 'updatePasswordService', '$window', 'userInfoService', '$scope', 'userService', '$state'];

    function profileController(getInfoService, updateInfoService, updatePasswordService, $window, userInfoService, $scope, userService, $state)
    {
        var pvm = this;        
        pvm.showPasswordBox = _showPasswordBox;
        pvm.showReset = true;
        pvm.getInfoService = getInfoService;
        pvm.$onInit = _init;
        pvm.updateInfoService = updateInfoService;
        pvm.saveProfile = _saveProfile;
        pvm.cancelEditBtn = _cancelEdit;
        pvm.editBtn = _editBtn;
        pvm.updatePasswordService = updatePasswordService;
        pvm.updatePassword = _updatePassword;
        pvm.btnBookmark = _btnBookmark;
        pvm.btnFollowingList = _btnFollowingList;
        pvm.btnFollowerList = _btnFollowerList;
        pvm.bookmarkList = false;
        pvm.followingList = true;
        pvm.followerList = false;
        pvm.getAddressBtn = _getAddressBtn;
        var geocoder = new google.maps.Geocoder();
        var lat;
        var lng;

        function _btnBookmark() {
            pvm.followingList = false;
            pvm.followerList = false;
            pvm.bookmarkList = true;
        }

        function _btnFollowingList() {
            pvm.followerList = false;
            pvm.bookmarkList = false;
            pvm.followingList = true;
        }

        function _btnFollowerList() {
            pvm.followingList = false;
            pvm.bookmarkList = false;
            pvm.followerList = true;
        }

        //Show password fields when reset link is clicked
        function _showPasswordBox() {
            pvm.passwordBox = true;
            pvm.showReset = null;
        }

        //Function to get user's info from the database to input fields
        function _init() {
            var Id = Id;
            pvm.Id = Id;
            pvm.getInfoService.getUser()
                .then(_getSuccessful, _getFailed);
            userService.getInfo();
        }
        function _getSuccessful(response) {
            console.log("User's info received");
            console.log(response);
            //Populate user's information
            populateViewModel(response.data.item);

            //pvm.originalData = response.data.item; (Use this to reverse any changes in the input fields when the cancel button is clicked.)
        }
        function populateViewModel(data) {
            pvm.id = data.id;
            pvm.firstName = data.firstName;
            pvm.lastName = data.lastName;
            pvm.userName = data.userName;
            pvm.bio = data.bio;
            pvm.email = data.email;
            pvm.phoneNumber = data.phoneNumber;
            pvm.location = data.city;
            pvm.userProfilePicture = data.userProfilePicture;
        }
        function _getFailed(response) {
            console.log("Failed to get user's info");
            return response;
        }

        //Save button function
        //Geocode will pass lat/lng
        function _saveProfile() {
            if (!lat) {

                geocoder.geocode({ 'address': pvm.location }, function (results, status) {

                    if (status == google.maps.GeocoderStatus.OK) {
                        lat = results[0].geometry.location.lat();
                        lng = results[0].geometry.location.lng();

                        pvm.userInfo = {
                            firstName: pvm.firstName,
                            lastName: pvm.lastName,
                            bio: pvm.bio,
                            email: pvm.email,
                            phoneNumber: pvm.phoneNumber,
                            oldPassword: pvm.oldPassword,
                            newPassword: pvm.newPassword,
                            confPassword: pvm.confirmNewPassword,
                            city: pvm.location,
                            latitude: lat,
                            longitude: lng
                        }

                        if (!pvm.userInfo.newPassword && !pvm.userInfo.oldPassword) {
                            pvm.updateInfoService.updateInfo(pvm.userInfo).then(_updateSuccessful, _updateFailed);
                        } else {
                            pvm.updatePasswordService.updatePassword(pvm.userInfo).then(_updateSuccessful, _updateFailed);
                        }
                    }
                });
            }
            else {
                pvm.userInfo = {
                    firstName: pvm.firstName,
                    lastName: pvm.lastName,
                    bio: pvm.bio,
                    email: pvm.email,
                    phoneNumber: pvm.phoneNumber,
                    oldPassword: pvm.oldPassword,
                    newPassword: pvm.newPassword,
                    confPassword: pvm.confirmNewPassword,
                    city: pvm.location,
                    latitude: lat,
                    longitude: lng
                }

                if (!pvm.userInfo.newPassword && !pvm.userInfo.oldPassword) {
                    pvm.updateInfoService.updateInfo(pvm.userInfo).then(_updateSuccessful, _updateFailed);
                } else {
                    pvm.updatePasswordService.updatePassword(pvm.userInfo).then(_updateSuccessful, _updateFailed);
                }
            }
        }

        //Popup Location Permission
        function _getAddressBtn() {
            $window.navigator.geolocation.getCurrentPosition(function (position) {
                lat = position.coords.latitude,
                lng = position.coords.longitude,
                userInfoService.getAddress(lat, lng).then(_success, _error)
            });
        }

        //getting user city name!
        function _success(response) {
            pvm.location = response.address_components[3].short_name;
            $scope.$apply();
        }

        function _error() {
            console.log('getting user location error');
        }

        //Update password function
        function _updatePassword() {
            pvm.userPassword = {
                oldPassword: pvm.oldPassword,
                newPassword: pvm.newPassword
            }
            //pvm.updatePasswordService.updatePassword(pvm.userPassword)
            //    .then(_updatePasswordSuccessful, _updatePasswordFailed);
        }
        function _updateSuccessful(response) {
            console.log("Information updated");
            console.log(response);
            $state.go("profilePage");
        }
        function _updateFailed(response) {
            console.log("Unable to update information");
            return (response);
        }

        function _updatePasswordSuccessful(response) {
            console.log("Password updated");
            console.log(response);
            $state.go("profilePage");
        }
        function _updatePasswordFailed(response) {
            console.log("Unable to update password");
            return (response);
        }

        //Cancel button function
        function _cancelEdit() {
            $state.go("profilePage");

            //populateViewModel(pvm.originalData); (This populates the original data back to the input field on click of the cancel button after any changes)
        }

        //Edit button on profile page (redirects to profile editor)
        function _editBtn() {
            $state.go("profileEditor");
        }
    }

//Putting phone number on profile page in (xxx)xxx-xxxx format
    angular.module('BWProject').filter('tel', function () {
        return function (tel) {
            if (!tel) { return ''; }

            var value = tel.toString().trim().replace(/^\+/, '');

            if (value.match(/[^0-9]/)) {
                return tel;
            }

            var country, city, number;

            switch (value.length) {
                case 10:
                    country = 1;
                    city = value.slice(0, 3);
                    number = value.slice(3);
                    break;

                case 11:
                    country = value[0];
                    city = value.slice(1, 4);
                    number = value.slice(4);
                    break;

                case 12:
                    country = value.slice(0, 3);
                    city = value.slice(3, 5);
                    number = value.slice(5);
                    break;

                default:
                    return tel;
            }

            if (country === 1) {
                country = "";
            }

            number = number.slice(0, 3) + '-' + number.slice(3);

            return (country + " (" + city + ") " + number).trim();
        };
    });
})();
