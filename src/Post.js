import React, {useEffect, useState} from "react";
import Avatar from "@material-ui/core/Avatar";
import {db} from "./firebase";
import * as firebase from "firebase";
import {Player} from "video-react";
import "./Post.css";

function Post({ postId, username, caption, user, imageUrl, videoUrl, avatar, poster }) {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');

    useEffect(() => {
        let unsubscribe;
        if (postId) {
            unsubscribe = db
                .collection("posts")
                .doc(postId)
                .collection("comments")
                .orderBy("timestamp", "desc")
                .onSnapshot((snapshot => {
                    setComments(snapshot.docs.map((doc) => ({
                        id: doc.id,
                        comment: doc.data()
                    })))
                }))
        }

        return () => {
            unsubscribe();
        };
    }, [postId]);

    const postComment = (event) => {
        event.preventDefault();

        db.collection("posts").doc(postId).collection("comments").add({
            text: comment,
            username: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        setComment('');

    }

    return (
        <div className="post">
            <div className="post_header">
                <Avatar
                    className="post_avatar"
                    alt="viczking"
                    src={avatar}
                />
                <h3>{username}</h3>
            </div>

            {imageUrl ? (
                <img className="post_image" src={imageUrl} alt="post"/>

            ) : (
                <Player
                    playsInline
                    poster={poster}
                    src={videoUrl}
                />
            )}

            <p className="post_text"><strong>{username} </strong>{caption}</p>
            
            <div className="post_comments">
                {
                    comments.map(({ id, comment}) => {
                        return (
                            <p key={id}><strong>{comment.username}</strong> {comment.text}</p>
                        )
                    })
                }
            </div>

            {
                user && (
                    <form className="post_comment_box">
                        <input
                            className="post_input"
                            type="text"
                            placeholder="Add a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <button
                            className="post_btn"
                            disabled={!comment}
                            type="submit"
                            onClick={postComment}
                        >
                            Post
                        </button>
                    </form>

                )
            }
        </div>
    );

}

export default Post;