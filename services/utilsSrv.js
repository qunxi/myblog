(function(UtilsService) {
    var cheerio = require('cheerio');

    UtilsService.isErrorObject = function(obj) {
        return !!obj && obj.hasOwnProperty('error');
    };

    UtilsService.isWarningObject = function(obj) {
        return !!obj && obj.hasOwnProperty('warning');
    };

    UtilsService.webErrorRender = function(res, data){
        switch(data.status){
            case 404:
            case 401:
            case 400:
                return res.render('404');
            case 500:
                return res.render('500');
        }
        return res.render('500');
    };

    UtilsService.httpResponse = function(res, data){
        
        return res.status(data.status).send(data.data);
    };

    UtilsService.failedResponse = function(res, data) {
        return res.status(500).send({
            error: data
        });
    };

    UtilsService.successResponse = function(res, data) {
        return res.status(200).send(data);
    };

    UtilsService.authenticateFailed = function(res, data) {
        return res.status(401).send({
            error: 'User authorized failed!'
        });
    };


    UtilsService.formatImageUrl = function(content, link) {
        if (typeof content !== 'string') {
            console.log('error!! the content not a string object');
        }

        return parseHtmlDome(content, link);
    };

    UtilsService.cutString = function(data, maxLength) {
        data = htmlToPlaintext(data);
        if (data.length > maxLength) {
            return data.substr(0, maxLength) + '...';
        }
        return data;
    };

    UtilsService.formatDate = function(date) {
        var newDate = new Date();

        if (!(date instanceof Date)) {
            var parseDate = Date.parse(date);
            if (!!parseDate) {
                newDate = new Date(parseDate);
            }
        } else {
            newDate = date;
        }

        return newDate.getUTCFullYear() + '-' +
            (newDate.getUTCMonth() + 1) + '-' + newDate.getUTCDate() +
            ' ' + newDate.getUTCHours() + ':' + newDate.getUTCMinutes() +
            ':' + newDate.getUTCSeconds();
    };

    function htmlToPlaintext(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }

    function parseHtmlDome(content, link) {
        var images = [];
        $ = cheerio.load(content);

        var regExp = /^[\/|\\]/gi;
        $('img').each(function(i, elem) {
            var src = $(this).attr('src');

            if (regExp.test(src)) {
                var url = link + src;
                $(this).attr('src', url);
                images.push(url);
            } else {
                images.push(src);
            }
        });

        $('a').each(function(i, elem) {
            var href = $(this).attr('href');
            if (regExp.test(href)) {
                var url = link + href;
                $(this).attr('href', url);
            }
        });

        return {
            images: images,
            content: $.html()
        };
    }

})(module.exports);