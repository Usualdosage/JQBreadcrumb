/*
* @author Matthew Martin
*
* Version 1.0
*
* Usage: $("#breadcrumbContainer").breadcrumb({ options });
* Options:
*          Name            Data Type   Description
* -----------------------------------------------------------------------------------------------------
*          levels          int         Total number of elements to display.
*          showHome        bool        If true, will always display "home" as the first element. This does not count as a level for the option above.
*          homeUrl         string      The url that clicking on home will redirect to.
*          homeCssClass    string      The class to apply to the home breadcrumb.
*          homeText        string      The text displayed on the home breadcrumb.
*          titleElement    string      The class or id name of the element used to drive the title. 
*                                      If provided, the breadcrumb will look for this element's "title" attribute.
*          storageKey      string      The key jStorage will use to store and retrieve saved breadcrumbs.
*          animateCrumbs   string      Whether or not to animate (slide out) the crumbs after they're loaded.
*          easing          string      Defines the easing for the animation. jQuery easing plugin required.
*                                      e.g. "easeOutElastic", "easeOutBounce", "swing"
*/

(function ($) {

    // Private variables
    var _options = {};
    var _container = {};

    // Public functions
    $.fn.breadcrumb = function (options) {
        _options = $.extend({
            levels: 2,
            showHome: false,
            homeUrl: '',
            homeCssClass: 'homeBreadcrumb',
            homeText: 'Home',
            titleElement: '#breadcrumb_title',
            storageKey: 'breadcrumb_trail',
            animateCrumbs: true,
            easing: 'swing'
        }, options);

        return this.each(function () {
            _container = $(this);
            configureBreadcrumb();
        });

    };

    // Private functions
    function configureBreadcrumb() {
        var pageUrl = $(location).attr('href');

        // Build the breadcrumb object, passing in the url. Title will be the title attribute of a
        // span with an id of "breadcrumb_title", or, if that isn't available, we will parse the view
        // name and use that as the breadcrumb.
        var breadcrumbObject = new Object();
        breadcrumbObject.url = pageUrl;
        breadcrumbObject.title = parseBreadcrumbTitle(pageUrl);

        // Get the array of breadcrumbObjects from jStorage
        var crumbArray = $.jStorage.get(_options.storageKey);

        if (crumbArray == null) { // Not found, so build a new array and add the object
            crumbArray = new Array();
            crumbArray[0] = breadcrumbObject;
        }
        else {
            // Check to see if the object already exists at the previous level. 
            // This indicates a refresh, and we don't want to add a duplicate for a refresh.
            var lastCrumb = crumbArray[crumbArray.length - 1];
            if (lastCrumb.url != breadcrumbObject.url)
                crumbArray.push(breadcrumbObject);
        }

        // Update the storage
        $.jStorage.set(_options.storageKey, crumbArray);

        // Create & fetch the unordered list
        _container.append("<ul></ul>");
        var ul = _container.find("ul");

        // Insert the home li if so desired
        if (_options.showHome) {
            ul.append("<li style='display: none' class='" + _options.homeCssClass + "'><a href='" + _options.homeUrl + "'>" + _options.homeText + "</a><div class='carat'></li>");
        }

        // Build the breadcrumbs from the array, using only the most recent [levels] items
        for (var x = (crumbArray.length - _options.levels), c; c = crumbArray[x]; x++) {
            ul.append("<li style='display: none'><a href='" + c.url + "'>" + c.title + "</a><div class='carat'></div></li>");
        }

        // Visual display to slide out the crumbs using the specified arguments
        if (_options.animateCrumbs) {
            if (_options.easing) {
                ul.find('li').animate({ width: 'toggle' }, { easing: _options.easing });
            }
            else {
                ul.find('li').animate({ width: 'toggle' });
            }
        }
        else { // No animation, so just show the crumb
            ul.find('li').css("display", "block");
        }
    }

    // Generates a user-friendly name for the breadcrumb's link. There are three possible case scenarios parsed in this order:
    // 1) A div specified in the options.titleElement exists on the page. In this case, we will grab that div's "title" attribute.
    // 2) We will get the name of the view, and put spaces between capital letters, so, "ProviderConfiguration" becomes "Provider Configuration".
    // 3) If there is no view (e.g. we are on the main landing page) we will parse the title of the document.
    function parseBreadcrumbTitle(pageUrl) {
        var titleObject = $(_options.titleElement);
        var crumbTitle;

        if (titleObject.length > 0 && titleObject.attr("title")) {
            crumbTitle = titleObject.attr("title");
        }
        else {
            // Strip out the first part of the url
            crumbTitle = pageUrl.replace(/^.*\/|\.[^.]*$/g, '');

            // Strip out the query string
            if (crumbTitle.indexOf("?") > 0)
                crumbTitle = crumbTitle.split('?')[0];

            // If we still have a question mark, this is probably the landing page, so just set to document title
            if (crumbTitle.indexOf("?") == 0) {
                crumbTitle = document.title;
            }

            // Check to see if it's a GUID or an int. In MVC, this indicates an edit, so we don't want to display
            // a GUID in the crumb. If we get either, display the previous View name (so, SecurityManager/User/EditUser/64918c0d-b024-4225-8607-d5b822cf52be
            // would become "Edit User" instead of "64918c0d-b024-4225-8607-d5b822cf52be"
            if (isGuid(crumbTitle) || isInt(crumbTitle)) {
                // split the url on the /, take the second to last entry
                var viewTitle = pageUrl.split('/');
                crumbTitle = viewTitle[viewTitle.length - 2];
            }
        }

        // Add spaces between capital letters to make it look purdy
        return crumbTitle.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    // Check if an input is a GUID
    function isGuid(g) {
        var regex = new RegExp("^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$");
        return regex.test(g);
    }

    // Check if an input is a number
    function isInt(n) {
        return typeof n == 'number';
    }
})(jQuery);