(function(elektaService) {

    var Q = require('q');
    var Tester = require('../models/tester.js');
    var Test = require('../models/test.js');
   
    elektaService.verification = function(id){
        return Tester.findByTesterId(id)
            .then(function(data){
                var now = new Date();
                if(data.start > now || data.end < now){
                    return false;
                }
                return {time: data.end - now};
            }, function(error){
                return false;
            });
    };

    elektaService.addTester = function(name){
        console.log(name);
        return Tester.verifyTester(name)
                    .then(function(data){
                        if(data === null){
                            var tester = new Tester();
                            tester.name = name;
                            tester.save()
                            .then(function(data){

                            }, function(error){

                            });
                        }
                    });
    };


    elektaService.submitAnswer = function(id, answer, userId, name){
        
        return Tester.findByTesterId(userId)
                    .then(function(data){
                        var now = new Date();
                        if(data.start > now || data.end < now){
                            return {
                                status: 400,
                                error: 'times up'
                            };
                        }
                        
                        return Test.findAnswerById(id, userId)
                            .then(function(data){
                               
                                if(data !== null){
                                    
                                    data.answer = answer;
                                    
                                    data.updatedDate = new Date();
                                    
                                    data.save().then(
                                    function(ret){
                                        return {
                                            status: 200,
                                            data: 'updated'
                                        };
                                    }, function(error){
                                        return {
                                            status: 500,
                                            data: 'there are has error in server'
                                        };
                                    });
                                }
                                else{
                                    var test = new Test();
                                    test.id = id;
                                    test.answer = answer;
                                    test.userId = userId;
                                    test.name = name;
                                    test.createDate = new Date();
                                    test.updatedDate = new Date();
                                    test.save().then(
                                    function(data){
                                        console.log(data);
                                        return {
                                            status: 200,
                                            data: 'updated'
                                        };
                                    }, function(error){
                                        console.log(error);
                                        return {
                                            status: 500,
                                            data: 'there are has error in server'
                                        };
                                    });
                                }
                            }, function(error){
                                return {
                                    status: 500,
                                    error: 'there are has error in server'
                                };
                            });
                    }, function(error){
                        return {
                                    status: 500,
                                    error: 'there are has error in server'
                                };
                    });

    };

    elektaService.signIn = function(name) {
        
        return Tester.verifyTester(name)
            .then(function(tester) {
                
                if(tester === null){
                    return {
                        status: 400,
                        error: 'the account is not exist!'
                    };
                }
               
                if(!tester.start && !tester.end){
   
                    tester.start = new Date();
                    
                    tester.end = new Date(tester.start.getTime() + 1000*60*60*1.5);
                    
                    tester.save().then(function(data){
                        return {
                            status: 200,
                            data: tester
                        };
                    }, function(error){
                        return {
                            status: 500,
                            error: 'server occur a problem'
                        };
                    });
                }
                return {
                    status: 200,
                    data: tester
                };
            }, function(error) {
                return {
                    status: 500,
                    message: 'server occur a problem'
                };
            });
    };


   

})(module.exports);