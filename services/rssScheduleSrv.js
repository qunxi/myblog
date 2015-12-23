(function(rssScheduleService) {

    var _ = require('lodash');
    var httpRequest = require('./httpRequestSrv.js');
    var rssRequest = require('./rssRequestSrv.js');
    var rssPersistence = require('./rssPersistenceSrv.js');
    var utils = require('./utilsSrv.js');
    var RssCatelog = require('../models/rssCatelog.js');
    var RssItem = require('../models/rssItem.js');

    rssScheduleService.updateLatestRss = function(logger) {
        updateLatestRss(logger);
    };

    function updateLatestRss(logger) {
        RssCatelog.getAllOfCatelogs()
            .then(function(catelogs) {
                if (utils.isErrorObject(catelogs)) {
                    logger.error('getAllOfCatelogs has a problem: #error#' + catelogs);
                    return catelogs;
                }

                _.forEach(catelogs, function(n) {
                    if (!!n.link && !!n._id) {
                        rssRequest.requestRssResourceFrmNet(n.link)
                            .then(function(rss) {

                                if (utils.isErrorObject(rss)) {
                                    logger.error('requestRssResourceFrmNet access' + n.link + 'happened a problem #error#' + rss);
                                }

                                if (!rss.items) {
                                    logger.info('there has nothing items updated from ' + n.link);
                                }

                                rssPersistence.saveRssItems(n, rss.items)
                                    .then(function(data) {
                                        if (utils.isErrorObject(data)) {
                                            logger.error('saveRssItems has a problem the catelog is' + n + ' the rss items is ' + rss.items + ' #error# ' + data);
                                        }
                                    });
                            });
                    }
                });
            });
    }

})(module.exports);