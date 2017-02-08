"use strict";

exports["count_intra_clinic_posts"] = function(conn, req, res, cb){
	conn.query("select count(*) as c from post", function(err, result){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, +result[0].c);
	});
};

exports["count_intra_clinic_posts_older_than"] = function(conn, req, res, cb){
	var date = req.query.date;
	if( !/^\d{4}-\d{2}-\d{2}$/.test(date) ){
		cb("invalid request params");
		return;
	}
	conn.query("select count(*) as c from post where created_at > ?", [date], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, +result[0].c);
	})
};

exports["list_intra_clinic_posts"] = function(conn, req, res, cb){
	var offset = +req.query.offset;
	var n = +req.query.n;
	conn.query("select * from post order by id desc limit ?,?", [offset, n], cb);
};

exports["get_intra_clinic_post"] = function(conn, req, res, cb){
	var id = +req.query.id;
	conn.query("select * from post where id = ?", [id], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		if( result.length === 1 ){
			cb(undefined, result[0]);
		} else {
			cb("get_intra_clinic_post failed: " + result.lenght);
		}
	})
};

exports["enter_intra_clinic_post"] = function(conn, req, res, cb){
	var content = req.body.content;
	var createdAt = req.body.created_at;
	conn.query("insert into post set content = ?, created_at = ?", [content, createdAt], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, result.insertId);
	});
};

exports["update_intra_clinic_post"] = function(conn, req, res, cb){
	var id = +req.body.id;
	var content = req.body.content;
	if( !(id > 0) ){
		cb("invalid id");
		return;
	}
	conn.query("update post set content = ? where id = ?", [content, id], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		if( result.affectedRows === 1 ){
			cb(undefined, true);
		} else {
			cb("update post failed: " + result.affectedRows);
		}
	})
}

exports["delete_intra_clinic_post"] = function(conn, req, res, cb){
	var id = +req.body.id;
	if( !(id > 0) ){
		cb("invalid id");
		return;
	}
	conn.query("delete from post where id = ?", [id], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		if( result.affectedRows === 1 ){
			cb(undefined, true);
		} else {
			cb("delete post failed: " + result.affectedRows);
		}
	})
};

exports["enter_intra_clinic_comment"] = function(conn, req, res, cb){
	var name = req.body.name;
	var content = req.body.content;
	var postId = +req.body.post_id;
	var createdAt = req.body.created_at;
	conn.query("insert into comment set name = ?, content = ?, post_id = ?, created_at = ?",
		[name, content, postId, createdAt], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, result.insertId);
	})
};

exports["list_intra_clinic_comments"] = function(conn, req, res, cb){
	var postId = +req.query.post_id;
	conn.query("select * from comment where post_id = ? order by id", [postId], cb);
}