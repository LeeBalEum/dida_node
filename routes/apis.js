var express = require('express');
var router = express.Router();
var common = require('../controllers/common');

// var members = require('../controllers/members');
// var recipes = require('../controllers/recipes');

var test = require('../controllers/test');
var member = require('../controllers/member');
var diary = require('../controllers/diary');

/* GET users listing. */
router.post('/', function (req, res, next) {
    res.send('respond with a resource');
});

// 카톡 회원 체크	member/checkMemberKakao
router.route('/test')
    .all(function (req, res, next) { next(); })
    .post(test.getTestList, common.setResponse)

    // 컬러코드 가져오기    member/colorList
router.route('/member/colorList')
    .all(function (req, res, next) { next(); })
    .post(member.colorList, common.setResponse)

// 유저 정보	member/userInfo
router.route('/member/userInfo')
    .all(function (req, res, next) { next(); })
    .post(member.userInfo, common.setResponse)

// 사용자 추가	member/userInfo
router.route('/member/addMember')
    .all(function (req, res, next) { next(); })
    .post(member.addMember, common.setResponse)

// 사용자 정보 변경	member/updateMember
router.route('/member/updateMember')
    .all(function (req, res, next) { next(); })
    .post(member.updateMember, common.setResponse)


// 사용자 삭제 member/deleteMember
router.route('/member/deleteMember')
    .all(function (req, res, next) { next(); })
    .post(member.deleteMember, common.setResponse)


// 다이어리 작성  diary/addDiary
router.route('/diary/addDiary')
    .all(function (req, res, next) { next(); })
    .post(diary.addDiary, common.setResponse)

// 다이어리 수정  diary/updateDiary
router.route('/diary/updateDiary')
    .all(function (req, res, next) { next(); })
    .post(diary.updateDiary, common.setResponse)

// 다이어리 삭제  diary/deleteDiary
router.route('/diary/deleteDiary')
    .all(function (req, res, next) { next(); })
    .post(diary.deleteDiary, common.setResponse)

// 다이어리 리스트  diary/getDiaryList
router.route('/diary/getDiaryList')
    .all(function (req, res, next) { next(); })
    .post(diary.getDiaryList, common.setResponse)




// 카톡 회원가입	member/addMemberKakao
// router.route('/member/addMemberKakao')
//     .all(function (req, res, next) { next(); })
//     .post(members.addMember, members.checkMemberKakao, members.login, common.setResponse)

// // 페이스북 로그인	member/loginFacebook
// router.route('/member/loginFacebook')
//     .all(function (req, res, next) { next(); })
//     .post(members.checkMemberFacebook, members.login, common.setResponse)

module.exports = router;
