var CronJob = require('cron').CronJob;
var mongoose = require('mongoose');
var rssSchedule = require('./services/rssScheduleSrv.js');

var appConfig = require('./appConfig.js');
var job = new CronJob({
	cronTime: '50 * * * * *', 
	onTick: function(){
        appConfig.bootstrapSchedule();

        var logger = appConfig.getScheduleLogger();
		rssSchedule.updateLatestRss(logger);
	},
	start: true,
	timeZone: 'Asia/Shanghai'
});

		









