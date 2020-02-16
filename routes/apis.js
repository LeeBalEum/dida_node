var express = require('express');
var router = express.Router();
var common = require('../controllers/common');

// var members = require('../controllers/members');
// var recipes = require('../controllers/recipes');

var test = require('../controllers/test');

/* GET users listing. */
router.post('/', function (req, res, next) {
    res.send('respond with a resource');
});

// 카톡 회원 체크	member/checkMemberKakao
router.route('/test')
    .all(function (req, res, next) { next(); })
    .post(test.getTestList, common.setResponse)

// 카톡 회원가입	member/addMemberKakao
// router.route('/member/addMemberKakao')
//     .all(function (req, res, next) { next(); })
//     .post(members.addMember, members.checkMemberKakao, members.login, common.setResponse)

// // 페이스북 로그인	member/loginFacebook
// router.route('/member/loginFacebook')
//     .all(function (req, res, next) { next(); })
//     .post(members.checkMemberFacebook, members.login, common.setResponse)

module.exports = router;
