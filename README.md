# NIBRS Explorer

This application is a rapid prototype designed to show some ideas around data visualization and interactivity for the FBI's UCR RFI. We've used the sample NIBRS data to show interesting graphs of incidents that can be filtered by type, time, and other attributes.

## Data assets used
* NIBRS 2014 [UCR](https://www.fbi.gov/about-us/cjis/ucr/ucr-program-data-collections) sample dataset, provided by the FBI in conjunction with the RFI release ([solicitation number 11420164073](https://www.fbo.gov/index?s=opportunity&mode=form&id=1339c757db4348143c01d9d47518b6e0&tab=core&_cview=1)).

In order to help the prototype load quickly in the absence of any backend services, we processed the sample dataset in the following ways:
 * Removed some unused data columns
 * Culled displayed time period to 30 days of data (June 2014), representing approximately 116,000 records instead of the full 600k+
 * Mapped location names and offense type names to a code to reduce text within the data.
 * Formatted as CSV for optimal compactness, versus XML or JSON

## Technologies used
* [Bootstrap](http://getbootstrap.com)
* [dc.js](http://dc-js.github.io/dc.js/)
* [crossfilter](http://square.github.io/crossfilter/)
* [lodash.js](https://lodash.com/)

### Development tools used
* [GitHub Pages](https://pages.github.com/)
* [npm](https://www.npmjs.com/)
* [bower](http://bower.io/)
* [gulp](http://gulpjs.com/)

### Development instructions

It should be sufficient to start from a clean checkout and issue:

    npm install
    bower install
    gulp

Serve the content locally out of the 'dist' directory.

When it comes time to publish to GitHub Pages, set the environment variable `GA_TRACKING_ID` to inject the correct info for the production instance and issue:

    gulp --env production deploy
