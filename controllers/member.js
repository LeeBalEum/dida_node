//작성자 : 이밝음
//작성일 : 20200219
//용도 : 모바일API - 맴버 카테고리

let common = require('./common')
let connection = common.initDatabase();
//member.test(connection);

// 커뮤니티 리스트	community/getCommunityList
exports.getTestList = function (req, res, next) {
    let { userNo, page } = req.body;
    let query = "SELECT SQL_CALC_FOUND_ROWS Community.*, Member.userName, Member.userProfilePic "
    let query2 = "SELECT * FROM test"
    query += `, COUNT(DISTINCT Reaction.reactionNo) as reactionYn FROM Community  `;
    query += ` LEFT JOIN Member ON Member.userNo=Community.userNo `;

    //query += ` LEFT JOIN CommunityComment ON Community.communityNo = CommunityComment.communityNo `;

    if (userNo != null && userNo != "") {
        query += `LEFT JOIN Reaction ON Community.communityNo = Reaction.communityNo AND Reaction.userNo = '${userNo}'  AND Reaction.commentNo = 0  `;
    } else {
        query += `LEFT JOIN Reaction ON Community.communityNo = Reaction.communityNo AND Reaction.userNo LIKE '' AND Reaction.commentNo = 0  `;
    }

    query += "WHERE "
    query += ` Community.showYn = 1 AND `;
    //... so on
    if (query.trim().endsWith('AND')) query = query.slice(0, -4);  //마지막 AND
    if (query.trim().endsWith('WHERE')) query = query.slice(0, -6);  //마지막 AND

    query += `GROUP BY Community.communityNo HAVING`;

    if (query.trim().endsWith('AND')) {
        query = query.slice(0, -4);  //마지막 AND
    }
    if (query.trim().endsWith('HAVING')) {
        query = query.slice(0, -7);  //마지막 AND
    }

    query += ` ORDER BY Community.writeDate DESC `;
    if (page != null && page != "") {
        query += `LIMIT  ${(page - 1) * 10}, 10 `
    }
    query += "; SELECT FOUND_ROWS() AS rows;"

    console.log(query2)
    connection.query(query2, function (err, results) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "게시물 리스트",
                success: true,
                message: '메시지',
                communities: results
            }
            common.setResult(req, result);
            next();
        }
    })
}

// 커뮤니티 상세 불러오기	community/getCommunityDetail
exports.getCommunityDetail = function (req, res, next) {
    let { communityNo, userNo } = req.body;
    let query = ` UPDATE Community SET viewCount = viewCount+1 WHERE communityNo = '${communityNo}';`
    query += ` SELECT Community.*, Member.userName, Member.userProfilePic `;
    if (userNo != null && userNo != "") {
        query += ` , COUNT(DISTINCT Reaction.reactionNo) as reactionYn`;
    }
    query += ` FROM Community`
    query += ` LEFT JOIN Member ON Member.userNo = Community.userNo`
    if (userNo != null && userNo != "") {
        query += ` LEFT JOIN Reaction ON Community.communityNo = Reaction.communityNo AND Reaction.userNo = '${userNo}'  AND Reaction.commentNo = 0 `;
    }
    query += ` WHERE Community.communityNo = '${communityNo}';`

    console.log(query);
    connection.query(query, function (err, communities) {
        if (err) {
            return next(err);
        } else if (!communities[1][0].showYn) {
            return next(new Error("삭제된 게시물입니다."));
        } else {
            var result = {
                title: "게시물 상세 조회",
                success: true,
                message: '메시지',
                community: communities[1]
            }
            common.setResult(req, result);
            next();
        }
    })
}

// 커뮤니티 글쓰기	community/addCommunity
exports.addCommunity = function (req, res, next) {
    let { userNo, communityContents, communityPic } = req.body;
    console.log(req.body)


    var query = 'INSERT INTO Community (communityContents, userNo, communityPic ) ';
    query += `VALUES ( '${communityContents}', '${userNo}', '${communityPic ? communityPic : ""}') `;

    console.log(query);
    connection.query(query, function (err, sqlResult) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "게시글 등록 성공",
                success: true,
                message: '메시지',
                communityNo: sqlResult.insertId
            }
            common.setResult(req, result);
            //next();
            let pushTitle = "커뮤니티 새글 알림";
            let pushContents = `${req.session.member.userName} 님이 새로운 글을 올렸어요! \"${communityContents}\"`
            //exports.sendPushMessageToAll = function(subject, pushTitle, pushContents, recipeNo, communityNo, commentNo, campaignNo, eventNo, fromUserNo){
            common.sendPushMessageToAll('community', pushTitle, pushContents, '', sqlResult.insertId, '', '', '', userNo)
                .then(() => next())
                .catch(e => next(e));
        }
    })
}

// 커뮤니티 수정	community/updateCommunity
exports.updateCommunity = function (req, res, next) {
    let { communityNo, communityContents, communityPic } = req.body
    var query = `UPDATE Community SET`
    query += ` communityContents = '${communityContents}'`

    if (communityPic != null) {
        query += ` , communityPic = '${communityPic}'`
    }

    query += ` WHERE communityNo = '${communityNo}'`

    console.log(query);
    connection.query(query, function (err, sqlResult) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "게시글 수정 성공",
                success: true,
                message: '메시지',
                communityNo: communityNo
            }
            common.setResult(req, result);
            next();
        }
    })
}

// 커뮤니티 삭제	community/deleteCommunity
exports.deleteCommunity = function (req, res, next) {
    let { communityNo } = req.body

    var query = `UPDATE Community SET showYn = 0 WHERE communityNo = '${communityNo}'`

    console.log(query);
    connection.query(query, function (err, sqlResult) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "게시글 삭제 성공",
                success: true,
                message: '메시지'
            }
            common.setResult(req, result);
            next();
        }
    })
}



// 컬러 값 가져오기    member/colorList
exports.colorList = function (req, res, next) {
    let { userNo } = req.body;
    let query = `SELECT * FROM color`
    

    console.log(query);
    connection.query(query, function (err, sqlResult) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "컬러 코드 성공",
                success: true,
                message: '메시지',
                colors: sqlResult
            }
            common.setResult(req, result);
            next();
        }
    })
}


// 사용자 정보  member/userInfo
exports.userInfo = function (req, res, next) {
    let { userNo, userCode } = req.body;
    let query = `SELECT * FROM member WHERE userCode = '${userCode}'`


    console.log(query);
    connection.query(query, function (err, sqlResult) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "사용자 정보 성공",
                success: true,
                message: '메시지',
                userInfo: sqlResult
            }
            common.setResult(req, result);
            next();
        }
    })
}


// 사용자 추가  member/addMember
exports.addMember = function (req, res, next) {
    let { userNo, userCode, deviceInfo } = req.body;
    let query = `INSERT INTO member (userCode, isDeleteYn, deviceInfo) VALUES ('${userCode}', 0, '${deviceInfo}')`;


    console.log(query);
    connection.query(query, function (err, sqlResult) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "사용자 추가 성공",
                success: true,
                message: '메시지'
            }
            common.setResult(req, result);
            next();
        }
    })
}

// 사용자 정보 변경  member/updateMember
exports.updateMember = function (req, res, next) {
    let { userNo, userCode, colorNum, partnerCode, firstDate } = req.body;
    let query = `UPDATE member SET `;

    if (partnerCode != null) {
        query += ` partnerCode = '${partnerCode}'`
    }


    if (colorNum != null) {
        query += ` colorNum = '${colorNum}'`
    }

    if (firstDate != null) {
        query += ` firstDate = '${firstDate}'`
    }


    query += ` WHERE userCode = '${userCode}'`


    console.log(query);
    connection.query(query, function (err, sqlResult) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "사용자 정보 변경 성공",
                success: true,
                message: '메시지'
            }
            common.setResult(req, result);
            next();
        }
    })
}


// 사용자 삭제  member/deleteMember
exports.deleteMember = function (req, res, next) {
    let { userNo, userCode } = req.body;
    let query = `UPDATE member SET userCode = '${userCode}!', isDeleteYn = 1 WHERE userCode = '${userCode}' `;

    console.log(query);
    connection.query(query, function (err, sqlResult) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "사용자 삭제 변경 성공",
                success: true,
                message: '메시지'
            }
            common.setResult(req, result);
            next();
        }
    })
}