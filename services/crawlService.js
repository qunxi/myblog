(function(crawlService){
	'use strict';

	var httpRequest = require('./httpRequestSrv');
	var iconv = require('iconv-lite');
	var cheerio = require('cheerio');
	//var bookService = require('./bookService.js');
	var doubanBook = require('../models/doubanBook.js');
	var utils = require('./utilsSrv.js');

	crawlService.crawlBooksFromDouban = function(link) {

		var address = 'http://www.douban.com/j/tag/items?';
		var range = 'start=0&limit=0&';
		var searchType = 'topic_id=62155&topic_name=%E7%BC%96%E7%A8%8B&mod=book';
        link = address + range + searchType;
        var booklist = [];
		return httpRequest.request(link)
					.then(function(data){
	                    var buf= new Buffer(data, 'binary');
	                    var jsonData = JSON.parse(iconv.decode(buf, 'utf-8'));
	                    var limit = 10;
	          			for(var i = 0; i < jsonData.total; i += limit){
	          				link = address + 'start=' + i + '&limit=' + limit + '&' + searchType;
	          				console.log(link);
	          				httpRequest.request(link)
	          					.then(processBooksFromDouban(data));
	          				
	          				/*httpRequest.request(link)
	          					.then(function(data){
	          					 var buf= new Buffer(data, 'binary');
	          					 var jsonData = JSON.parse(iconv.decode(buf, 'utf-8'));
	          					 var ret = parseHtml2Json(jsonData.html);
	          				}, function(error){
	          					console.log('get link from ' + link + 'failed!');
	          				});*/
	          			}
					});
	};

	function processBooksFromDouban(data){
		return function(data){
			var buf= new Buffer(data, 'binary');
		    var jsonData = JSON.parse(iconv.decode(buf, 'utf-8'));
		    var ret = parseHtml2Json(jsonData.html);
		    doubanBook.bulkSaveBookList(ret)
		    	.then(function(data){
		    		if(!utils.isErrorObject(data)){
		    			console.log(data);
		    		}
		    	});
		    /*return bookService.bulkSaveBookList(ret)
		    			.then(function(data){
		    				if(!utils.isErrorObject(data)){
		    					console.log(data);
		    				}
		    			});*/
		    //console.log(ret);
		    //booklist.push(ret);
		    ///console.log(ret);
		};
	}

	function parseHtml2Json(html){
		var $ = cheerio.load(html);
		var ret = [];
		
		$('dl').each(function(i, e){
			var desc = $(e).find('.desc').text();
			desc = desc.replace(/\n| /g, '');
			var t = desc.split('/');
			var js = {
				imageUrl: $(e).find('img').attr('src'),
				doubanUrl: $(e).find('a').attr('href'),
				name: $(e).find('.title').text(),
				publish: t.length > 4 ? t[t.length - 3] : '',
				author: t.slice(0, t.length - 3).join(' / '),
				rating: Number($(e).find('.rating_nums').text())
			};

			if(js.rating >= 9){
				ret.push(js);
			}
		});

		return ret;
	}

})(module.exports);