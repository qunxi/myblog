(function(UtilsService){
	var cheerio = require('cheerio');

	UtilsService.isErrorObject = function(obj){
		return !!obj && obj.hasOwnProperty('error');
	};

	UtilsService.isWarningObject = function(obj){
		return !!obj && obj.hasOwnProperty('warning');
	};


	UtilsService.formatImageUrl = function(content, link){
        var images = [];
        
        $ = cheerio.load(content);
      
        $('img').each(function(i, elem){
            var src = $(this).attr('src');
            regExp = /^[\/|\\]/gi;
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

        	regExp = /^[\/|\\]/gi;

        	if(regExp.text(href)){
        		var url = link + href;
        		$(this).attr('href', url);
        	}
        });

        return  {
            images: images,
            content: $.html()
        };
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

})(module.exports);