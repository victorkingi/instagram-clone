import React, {useEffect, useState} from "react";
import Avatar from "@material-ui/core/Avatar";
import {db} from "./firebase";
import * as firebase from "firebase";
import {Player} from "video-react";

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
        <div className="post" style={{maxWidth: '500px', backgroundColor: 'white',
            border: '1px solid lightgray',
            marginBottom: '45px'
        }}>
            <div className="post_header" style={{  display: 'flex', alignItems: 'center', padding: '20px'}}>
                <Avatar
                    className="post_avatar"
                    style={{ marginRight: '10px'}}
                    alt="viczking"
                    src={avatar}
                />
                <h3>{username}</h3>
            </div>

            {imageUrl ? (
                <img className="post_image" style={{width: '100%', objectFit: 'contain',
                    borderTop: '1px solid lightgray', borderBottom: '1px solid lightgray'}} src={imageUrl} alt="post"/>

            ) : (
                <Player
                    playsInline
                    poster={poster}
                    src={videoUrl}
                />
            )}

            <p className="post_text" style={{fontWeight: 'normal', padding: '20px'}}><strong>{username} </strong>{caption}</p>
            
            <div className="post_comments" style={{padding: ''}}>
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
                    <form className="post_comment_box" style={{ display: 'flex', marginTop: '10px'}}>
                        <input
                            className="post_input"
                            style={{ flex: 1, border: 'none', padding: '10px', borderTop: '1px solid lightgray'}}
                            type="text"
                            placeholder="Add a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <button
                            className="post_btn"
                            style={{flex: 0}}
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