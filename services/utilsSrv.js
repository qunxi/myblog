(function(UtilsService){
	var cheerio = require('cheerio');

	UtilsService.isErrorObject = function(obj){
		return !!obj && obj.hasOwnProperty('error');
	};

	UtilsService.isWarningObject = function(obj){
		return !!obj && obj.hasOwnProperty('warning');
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
        return res.status(203).send({
            error: 'don\'t get authorization'
        });
    };


    UtilsService.formatImageUrl = function(content, link){
        if(typeof content !== 'string'){
            console.log('error!! the content not a string object');
        }

        return parseHtmlDome(content, link);
    };


    function parseHtmlDome(content, link){
        var images = [];
        $ = cheerio.load(content);

        var regExp = /^[\/|\\]/gi;
        $('img').each(function(i, elem){
            var src = $(this).attr('src');
            
            if(regExp.test(src)){
                var url = link + src;
                $(this).attr('src', url);
                images.push(url);
            }
            else{
                images.push(src);
            }
        });
        
        $('a').each(function(i, elem){
            var href = $(this).attr('href');
            if(regExp.test(href)){
                var url = link + href;
                $(this).attr('href', url);
            }
        });
        
        return  {
            images: images,
            content: $.html()
        };
    }

})(module.exports);