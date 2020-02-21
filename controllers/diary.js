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



// 다이어리 추가    diary/addDiary
exports.addDiary = function (req, res, next) {
    let { userNo, userCode, contents, score, diaryDate, isDeleteYn } = req.body;
    let query = `INSERT INTO diary (userCode, contents, score, diaryDate, isDeleteYn) VALUES ('${userCode}', '${contents}', ${score}, '${diaryDate}', 0)`

    console.log(query);
    connection.query(query, function (err, sqlResult) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "다이어리 추가 성공",
                success: true,
                message: '메시지'
            }
            common.setResult(req, result);
            next();
        }
    })
}

// 다이어리 추가    diary/updateDiary
exports.addDiary = function (req, res, next) {
    let { userNo, userCode, contents, score, diaryDate, isDeleteYn } = req.body;
    let query = `INSERT INTO diary (userCode, contents, score, diaryDate, isDeleteYn) VALUES ('${userCode}', '${contents}', ${score}, '${diaryDate}', 0)`

    console.log(query);
    connection.query(query, function (err, sqlResult) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "다이어리 추가 성공",
                success: true,
                message: '메시지'
            }
            common.setResult(req, result);
            next();
        }
    })
}

// 다이어리 수정    diary/updateDiary
exports.updateDiary = function (req, res, next) {
    let { userNo, userCode, contents, score, diaryDate, diaryNo } = req.body;
    let query = `UPDATE diary SET isDeleteYn = 0`

    if (contents != null) {
        query += `, contents = '${contents}'`
    }
    if (score != null) {
        query += `, score = '${score}'`
    }
    if (diaryDate != null) {
        query += `, diaryDate = '${diaryDate}'`
    }

    query += ` WHERE diaryNo = '${diaryNo}'`

    console.log(query);
    connection.query(query, function (err, sqlResult) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "다이어리 수정 성공",
                success: true,
                message: '메시지'
            }
            common.setResult(req, result);
            next();
        }
    })
}

// 다이어리 삭제    diary/deleteDiary
exports.deleteDiary = function (req, res, next) {
    let { userNo, diaryNo} = req.body;
    let query = `UPDATE diary SET isDeleteYn = 1`

    query += ` WHERE diaryNo = '${diaryNo}'`

    console.log(query);
    connection.query(query, function (err, sqlResult) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "다이어리 삭제 성공",
                success: true,
                message: '메시지'
            }
            common.setResult(req, result);
            next();
        }
    })
}


// 다이어리 리스트  diary/getDiaryList
exports.getDiaryList = function (req, res, next) {
    let { userNo, userCode } = req.body;
    let query = `SELECT * FROM diary WHERE diary.isDeleteYn = 0 AND diary.userCode = '${userCode}' OR diary.userCode = (`

    query += `SELECT member.partnerCode FROM member WHERE member.userCode = '${userCode}' ) `
    query += `ORDER BY diary.diaryDate DESC`

    
    console.log(query);
    connection.query(query, function (err, diaryList) {
        if (err) {
            return next(err);
        } else {
            var result = {
                title: "다이어리 리스트 성공",
                success: true,
                message: '메시지',
                diaryList: diaryList
            }
            common.setResult(req, result);
            next();
        }
    })
}


