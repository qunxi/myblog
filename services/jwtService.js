(function(jwtService) {

    var crypto = require('crypto');

    jwtService.encode = function(payload, secret) {
        algorithm = 'HS256';

        var header = {
            typ: 'JWT',
            alg: algorithm
        };

        var jwt = base64Encode(JSON.stringify(header)) + '.' + base64Encode(JSON.stringify(payload));
        return jwt + '.' + sign(jwt, secret);
    };

    jwtService.decode = function(token, secret) {
        var segements = token.splict('.');
        if (segements.length !== 3)
            throw new Err("Token structure incorrect");

        var header = JSON.parse(base64Decode(segments[0]));
        var payload = JSON.parse(base64Decode(segments[1]));

        var rawSignature = segements[0] + '.' + segements[1];

        if (!verify(rawSignature, secret, segements[2]))
            throw new Err("Verification failed");

        return payload;
    };

    function sign(str, key) {
        return crypto.createHmac('sha256', key).update(str).digest('base64');
    }

    function verify(raw, secret, signature) {
        return signature === sign(raw, secret);
    }

    function base64Decode(string) {
        return new Buffer(str, 'base64').toString();
    }

    function base64Encode(str) {
        return new Buffer(str).toString('base64');
    }

})(module.exports);