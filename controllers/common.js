exports.setResponse = function (req, res, next) {
    if (req.result == null) {
        req.result = {}
    }
    if (Object.keys(req.query).length != 0 && req.query != null) {
        req.result.query = req.query;
    }
    res.json(req.result);
}
exports.redirect = function (page) {
    return function (req, res, next) {
        res.redirect(page);
    }
}

exports.notImplementedError = function (req, res, next) {
    next(new Error('This method is not implemented'));
}
exports.setPage = function (req, res, next) {
    if (req.query == null) {
        req.query = {
            page: 1
        }
    }
    else if (req.query.page == null || req.query.page == "") {
        req.query.page = 1;
    }
    next();
}
exports.setResult = function (req, result) {
    if (req.result == undefined) {
        req.result = result;
        req.result.ogmeta = {
            title: "차일두-어린이 액티비티 플랫폼",
            description: "우리아이를 위한 특별한 경험을 원한다면 클릭!",
            image: "https://s3.ap-northeast-2.amazonaws.com/childo-golab/ogmeta/ogmeta-img.png",
        }
        req.result.userAgent = req.headers['user-agent'];
        req.result.needPopup = true;
    }
    else {
        req.result = Object.assign(req.result, result);
    }
}
exports.setTitle = function (title) {
    return function (req, res, next) {
        if (req.result == null) {
            req.result = {}
        }
        req.result.title = title;
        next();
    }
}
exports.setBody = function (key, value) {
    return function (req, res, next) {
        if (req.body == null) {
            req.body = {}
        }
        req.body[key] = value;
        next();
    }
}
exports.getErrorMessage = function (err) {
    var message = '';
    //요부분은 다시 작성해야할듯
    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'id already exists';
                break;
            default:
                message = 'Something went Wrong';
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) message = err.errors[errName].message;
        }
    }
    return message;
};

exports.initDatabase = function () {
    var mysql = require('mysql');
    var dbconfig = process.env.NODE_ENV == 'production' ? "real" : "dev"
    //console.log(dbconfig)
    var config = require('../config/env/db')[dbconfig];
    return mysql.createPool({
        multipleStatements: true,
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        charset: 'utf8mb4',
        connectionLimit: 40,
    })
}
exports.test = function (con) {
    con.connect(function (err) {
        if (err) {
            console.error('mysql connection error :' + err);
        } else {
            //console.info('mysql is connected successfully.');
        }
    })
}
