(function(jobService) {

	var httpRequest = require('./httpRequestSrv.js');
	var _ = require('lodash');

	jobService.getJobsFromBaidu = function(query, city, page, limit){
		var url = 'http://zhaopin.baidu.com/api/async?';
		//query=%E7%99%BE%E5%BA%A6%E6%8B%9B%E8%81%98&salary=&welfare=&education=&sort_key=&sort_type=1&city=%E4%B8%8A%E6%B5%B7&district=&experience=&employertype=&jobfirstclass=&jobsecondclass=&jobthirdclass=&date=&detailmode=close&rn=30&pn=30'
		
		var date = getRangOfAWeek(); 
		var link = url + 'query='+ encodeURIComponent(query) + '&date=' + encodeURIComponent(date) + '&city=' + 
				   encodeURIComponent(city) + '&pn=' + encodeURIComponent(page) + '&rn=' + encodeURIComponent(limit);
		
		//link = url + encodeURIComponent(link);
		console.log(link);
		return httpRequest.request(link)
            .then(function(data) {
                var json = JSON.parse(data);
                return normalizeJobs(json.data.data);
            }, function(error) {
                console.log(error);
                return error;
            });		
	};

	function normalizeJobs(data){
		console.log(data);
		if(!!data && !!data.disp_data){
			var jobs = _.map(data.disp_data, function(n){
						return {
							city: n.city + ' ' + n.district,
							company: n.commonname || n.officialname,
							title: n.name,
							salary: n.ori_salary,
							source: n.source,
							description: n.description,
							url: n.wapurl || n.url,
							startdate: n.startdate,
							enddate: n.enddate
						};
					});
			return jobs;
		}
		else{
			return {
				'error': 'don\'t find any jobs match your query'
			};
		}
	}

	function getRangOfAWeek(){
		var now = new Date();
		
		var formatNow ='' + now.getFullYear() + (now.getMonth() + 1) + now.getDate();
		console.log(formatNow);
		var before7days = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
		var format7Days = '' + before7days.getFullYear() + (before7days.getMonth() + 1) + before7days.getDate();
		return format7Days + '_' + formatNow;
	}

})(module.exports);