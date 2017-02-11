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
	conn.query("select count(*) as c from post where created_at < ?", [date], function(err, result){
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

exports["count_intra_clinic_search"] = function(conn, req, res, cb){
	var text = req.query.text;
	if( typeof text !== "string" ){
		cb("invalid search text");
		return;
	}
	text = text.trim();
	if( text === "" ){
		cb("empty search text");
		return;
	}
	conn.query("select count(*) as c from post where content like ?", ["%" + text + "%"], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, result[0].c);
	})
}

exports["search_intra_clinic"] = function(conn, req, res, cb){
	var text = req.query.text;
	var offset = +req.query.offset;
	var n = +req.query.n;
	if( typeof text !== "string" ){
		cb("invalid search text");
		return;
	}
	text = text.trim();
	if( text === "" ){
		cb("empty search text");
		return;
	}
	if( !(offset >= 0 && n >= 0) ){
		cb("invalid offset or n");
		return;
	}
	conn.query("select * from post where content like ? order by id desc limit ?,?", 
		["%" + text + "%", offset, n], cb);
}

exports["create_intra_clinic_tag"] = function(conn, req, res, cb){
	var name = req.body.name;
	if( typeof name !== "string" ){
		cb("invalid name");
		return;
	}
	name = name.trim();
	if( name === "" ){
		cb("empty tag name");
		return;
	}
	conn.query("insert into tag set name = ?",
		[name], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, result.insertId);
	})
}

exports["get_intra_clinic_tag"] = function(conn, req, res, cb){
	var id = +req.query.id;
	if( !(id > 0) ){
		cb("invalid tag id");
		return;
	}
	conn.query("select * from tag where id = ?", [id], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		if( result.length === 1 ){
			cb(undefined, result[0]);
		} else if( result.length === 0 ){
			cb("cannot find tag");
			return;
		} else {
			cb("too many tags found to get");
		}
	})
}

exports["list_intra_clinic_tag"] = function(conn, req, res, cb){
	conn.query("select * from tag order by id", [], cb);
}

exports["list_intra_clinic_tag_for_post"] = function(conn, req, res, cb){
	var postId = +req.query.post_id;
	if( !(postId > 0) ){
		cb("invalid post_id");
		return;
	}
	conn.query("select tag.* from tag, tag_post where tag_post.post_id = ? " +
		" and tag.id = tag_post.tag_id order by tag.id", [postId], cb);
}

exports["rename_intra_clinic_tag"] = function(conn, req, res, cb){
	var id = +req.body.id;
	var name = req.body.name;
	if( !(id > 0) ){
		cb("invalid tag id");
		return;
	}
	if( typeof name !== "string" ){
		cb("invalid name");
		return;
	}
	name = name.trim();
	if( name === "" ){
		cb("empty tag name");
		return;
	}
	conn.query("update tag set name = ? where id = ?", [name, id], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		if( result.affectedRows === 1 ){
			cb(undefined, true);
		} else {
			cb("rename tag failed: " + result.affectedRows);
		}
	})
}

exports["delete_intra_clinic_tag"] = function(conn, req, res, cb){
	var id = +req.body.id;
	if( !(id > 0) ){
		cb("invalid tag id");
		return;
	}
	conn.query("delete from tag where id = ? ", 
		[id], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		if( result.affectedRows === 1 ){
			cb(undefined, true);
		} else {
			cb("delete tag failed: " + result.affectedRows);
		}
	})
}

exports["add_intra_clinic_post_to_tag"] = function(conn, req, res, cb){
	var tag_id = +req.body.tag_id;
	var post_id = +req.body.post_id;
	if( !(tag_id > 0) ){
		cb("invalid tag_id");
		return;
	}
	if( !(post_id > 0) ){
		cb("invalid post_id");
		return;
	}
	conn.query("insert into tag_post set tag_id = ?, post_id = ? ",
		[tag_id, post_id], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, true);
	})
};

exports["remove_intra_clinic_post_from_tag"] = function(conn, req, res, cb){
	var tag_id = +req.body.tag_id;
	var post_id = +req.body.post_id;
	if( !(tag_id > 0) ){
		cb("invalid tag_id");
		return;
	}
	if( !(post_id > 0) ){
		cb("invalid post_id");
		return;
	}
	conn.query("delete from tag_post where tag_id = ? and post_id = ?", 
		[tag_id, post_id], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		if( result.affectedRows === 1 ){
			cb(undefined, true);
		} else {
			cb("remove post from tag failed: " + result.affectedRows);
		}
	})
}

exports["count_intra_clinic_tag_post"] = function(conn, req, res, cb){
	var tag_id = +req.query.tag_id;
	if( !(tag_id > 0) ){
		cb("invalid tag_id");
		return;
	}
	conn.query("select count(*) as c from post, tag_post where tag_post.tag_id = ? " +
			" and post.id = tag_post.post_id ", [tag_id], function(err, result){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, result[0].c);
	})
}

exports["list_intra_clinic_tag_post"] = function(conn, req, res, cb){
	var tag_id = +req.query.tag_id;
	var offset = +req.query.offset;
	var n = +req.query.n;
	if( !(tag_id > 0) ){
		cb("invalid tag_id");
		return;
	}
	if( !(offset >= 0 && n >= 0) ){
		cb("invalid offset or n");
		return;
	}
	conn.query("select post.* from post, tag_post where tag_post.tag_id = ? " + 
		" and post.id = tag_post.post_id order by post.id desc limit ?,?",
		[tag_id, offset, n], cb);
}
