angular.module('autocomplete', []);
angular.module('autocomplete')
  .directive('autocomplete', function($compile, $http, $templateCache) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        minInputLength: '@minInput',
        remoteData: '&',
        source: '=',
        choiceTemplate: '=',
        selectedItemInfo:'=',
        placeholder: '@placeholder',
        restrictCombo: '@restrict',
        selectedItem: '=selectedItem',
        callback: '&'
      },
      compile: function compile(iElement, iAttrs, transclude) { 
        return { post: function postLink(scope, iElement, iAttrs, controller) {
          var choiceDisplay = (scope.choiceTemplate) ? scope.choiceTemplate : '{{choice.name}}'; 
          var template = angular.element(
            '<div class="dropdown search"  ng-class="{open: focused && _choices.length>0}">' + 
              '<input type="text" ng-model="searchTerm" placeholder="{{placeholder}}" ' + 
                'tabindex="1" accesskey="s" class="input-medium search-query" focused="focused"> ' + 
              '<ul class="dropdown-menu"> ' + 
                '<li ng-repeat="choice in _choices">' + 
                  '<a href="javascript:void(0);" ng-blur="unselectMe" ng-click="selectMe(choice)" class="autosuggest-result">'+choiceDisplay+'</a>'+
                '</li>' + 
              '</ul>' + 
              '<div class="autoSuggestLoading" ng-show="searching">' +
                '<img ng-show="searching" src="http://loadinggif.com/images/image-selection/2.gif" /> ' +
              '</div>' +
            '</div>');
          iElement.append(template);
          var templateFn = $compile(template);
          templateFn(scope);

      var searchInput = angular.element(iElement.children().find('input'));
          searchInput.bind('blur', function() {
            try {
            if (scope._choices.indexOf(scope.selectedItem) < 0) {
              scope.selectedItem = null;
              scope.searchTerm = '';
            }
            if (scope.searchTerm == '') {
              scope._choices = [];
            }
            } catch (e) { }
          });

          var dropDownMenu = iElement.children().find('ul');
          searchInput.bind('keydown', function(e){
            if(e.keyCode == 40) { // enter
              $('li:first','.dropdown-menu').find('a').focus();
              scope._bindSearchResults(dropDownMenu);
            }
            if (e.keyCode != 13) {
            }
          });

          scope._bindSearchResults = function(parent) {

          $('a', $(parent)).bind('keydown', function(e){
    if(e.keyCode == 40) { // down
        $(this).parent().next().find(".autosuggest-result").focus();
        return false; // stops the page from scrolling
    }
    if(e.keyCode == 38) { // up
        $(this).parent().prev().find(".autosuggest-result").focus();
        return false; // stops the page from scrolling
    }
    if(e.keyCode == 13) { // enter
        $(this).trigger('click');
  //      $(dropDownMenu).hide();
scope._choices = [];
    }
        });

        } }
      }},
      controller: function($scope, $element, $attrs) {
        $scope.selectMe = function(choice) {
          $scope.selectedItem = choice;
          $scope.searchTerm = $scope.lastSearchTerm = choice.label;
          $scope.selectedItemInfo= angular.copy(choice);
        };

        $scope.unselectMe = function() {
alert('hello');
        };
  
        $scope.UpdateSearch = function() {
          if ($scope.canRefresh()) {
            $scope.searching = true;
            $scope.lastSearchTerm = $scope.searchTerm;
            try {
              $scope.source.query({searchTerm: $scope.lastSearchTerm}, function(data) { 
                $scope.searching = false;
                $scope._choices = data;
              });
            } catch (ex) {
              $scope.searching = false;
            }
          }
        }
          
        $scope.$watch('searchTerm', $scope.UpdateSearch);
          
        $scope.canRefresh = function() {
          return ($scope.searchTerm !== "") && ($scope.searchTerm !== $scope.lastSearchTerm) && ($scope.searching != true);
        };
      }, //END of controller
      link: function(scope, iElement, iAttrs, controller) {

       /* scope._searchTerm = '';
        scope._lastSearchTerm = '';
        scope.searching = false;
        scope._choices = [];
*/
        if (iAttrs.restrict == 'true') {
          var searchInput = angular.element(iElement.children()[0])
          searchInput.bind('blur', function() {
            if (scope._choices.indexOf(scope.selectedItem) < 0) {
              scope.selectedItem = null;
              scope.searchTerm = '';
            }
          }); 
          
          var dropDownMenu = iElement.children().find('ul');
          searchInput.bind('keydown', function(e){
            if(e.keyCode == 40) { // enter
              $('li:first','.dropdown-menu').find('a').focus();          
              scope._bindSearchResults(dropDownMenu);
            }
            if (e.keyCode != 13) { 
            }
          });

          scope._bindSearchResults = function(parent) {

          $('a', $(parent)).bind('keydown', function(e){
    if(e.keyCode == 40) { // down
        $(this).parent().next().find(".autosuggest-result").focus();
        return false; // stops the page from scrolling
    }
    if(e.keyCode == 38) { // up
        $(this).parent().prev().find(".autosuggest-result").focus();
        return false; // stops the page from scrolling
    }
    if(e.keyCode == 13) { // enter
        $(this).trigger('click');
        //$(dropDownMenu).hide();
scope._choices = [];
    }
        });
      }
        }
      } //END of link
    }; //END of return
  }) //END of autocomplete directive
  .directive("focused", function($timeout) {
    return function(scope, element, attrs) {
      element[0].focus();
      element.bind('focus', function() {
        scope.$apply(attrs.focused + '=true');
      });
      element.bind('blur', function(e) {
        if ((!$(e.relatedTarget).hasClass('autosuggest-result')) || (e.relatedTarget==null)) {
          $timeout(function() {
            scope.$eval(attrs.focused + '=false');
          }, 200);
        }
      });
      scope.$eval(attrs.focused + '=true')
    } //END of return
  }); //END of focused directive
