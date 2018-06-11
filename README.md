Usage: $("#breadcrumbContainer").breadcrumb({ options });
 Options:
    Name            Data Type   Description
---------------------------------------------------------------------------------------------
    levels          int         Total number of elements to display.
    showHome        bool        If true, will always display "home" as the first element. This does not                             count as a level for the option above.
    homeUrl         string      The url that clicking on home will redirect to.
    homeCssClass    string      The class to apply to the home breadcrumb.
    homeText        string      The text displayed on the home breadcrumb.
    titleElement    string      The class or id name of the element used to drive the title. 
                                If provided, the breadcrumb will look for this element's "title" attribute.
    storageKey      string      The key jStorage will use to store and retrieve saved breadcrumbs.
    animateCrumbs   string      Whether or not to animate (slide out) the crumbs after they're loaded.
    easing          string      Defines the easing for the animation. jQuery easing plugin required.
                                e.g. "easeOutElastic", "easeOutBounce", "swing"