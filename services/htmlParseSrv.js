(function(htmlParseSrv) {

	var cheerio = require('cheerio');
    var httpRequest = require('./httpRequestSrv');

	htmlParseSrv.getImageSrc = getImageSrc;
	htmlParseSrv.getFavIconSrc = getFavIconSrc;

	function getImageSrc(html, website){
		var images = [];
		$ = cheerio.load(html);
		var regExp = /^[\/|\\]/gi;
		$('img').each(function(i, elem){
			var src = $(this).attr('src');
			if (regExp.test(src)) {
                var url = link + src;
                images.push(url);
            } 
            else {
                images.push(src);
            }
		});
		return images;
	}

	function getFavIconSrc(html, website){
		$ = cheerio.load(html);

		$('meta').each(function(i, elem){
			var property = $(this).attr('property');
			if(property.match('image')){
				return $(this).attr('content');
			}
		});

		$('link').each(function(i, elem){
			var rel = $(this).attr('rel');
			if(rel.match('icon')){
				return $(this).attr('href');
			}
		});

		return '';
	}


})(module.exports);