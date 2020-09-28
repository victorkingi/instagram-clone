import React, {useEffect, useState} from 'react';
import './App.css';
import Post from "./Post";
import {db, auth, storage} from "./firebase";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Button, Input } from "@material-ui/core";
import ImageUpload from "./ImageUpload";
import InstagramEmbed from "react-instagram-embed";
import "../node_modules/video-react/dist/video-react.css";

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: 200,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

function App() {
    const classes = useStyles();
    const [modalStyle] = React.useState(getModalStyle);

    const [posts, setPosts] = useState([]);
    const [open, setOpen] = useState(false);
    const [openSignIn, setOpenSignIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [user, setUser] = useState(null);
    const [image, setImage] = useState(null);

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    }


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
                console.log(authUser)

                if (authUser.displayName) {

                } else {
                    const uploadTask = storage.ref(`avatars/${image.name}`).put(image);
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = Math.round(
                                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                            );
                            console.log(progress)
                        },
                        (error) => {
                            console.log(error);
                            alert(error.message);
                        },
                        () => {
                            storage.ref("avatars").child(image.name)
                                .getDownloadURL()
                                .then(url => {
                                    return authUser.updateProfile({
                                        displayName: username,
                                        photoURL: url
                                    })
                                })
                        }
                    )
                }
            } else {
                setUser(null);
            }
        })

        return () => {
            unsubscribe();
        }
    }, [user, username, image]);

    useEffect(() => {

        db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            setPosts(snapshot.docs.map(doc => ({
                id: doc.id,
                post: doc.data()
            })));
        })

    }, []);

    const signUp = (event) => {
        event.preventDefault();

        auth.createUserWithEmailAndPassword(email, password).then(() => {
            setOpen(false);
        })
            .catch((error) => {
                alert(error.message)
            })
    }

    const signIn = (event) => {
        event.preventDefault();

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                setOpenSignIn(false);
            })
            .catch((error) => alert(error.message));
    }

    return (
        <div className="app">

            <Modal
                open={open}
                onClose={() => setOpen(false)}
            >
                <div style={modalStyle} className={classes.paper}>
                    <form className="app_signup">
                            <img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                                 alt="instagram_name"
                                 className="app_headerImage"
                            />
                        <h7>Choose a profile photo below</h7>
                        <input type="file" onChange={handleChange}/>

                        <Input
                            placeholder="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Input
                            placeholder="email"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            placeholder="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button type="submit" onClick={signUp}>Sign Up</Button>
                    </form>
                </div>
            </Modal>

            <Modal
                open={openSignIn}
                onClose={() => setOpenSignIn(false)}
            >
                <div style={modalStyle} className={classes.paper}>
                    <form className="app_signup">
                            <img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                                 alt="instagram_name"
                                 className="app_headerImage"
                            />
                        <Input
                            placeholder="email"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            placeholder="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button type="submit" onClick={signIn}>Sign In</Button>
                    </form>
                </div>
            </Modal>

            <div className="app_header">
                <img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt="instagram_name" className="app_headerImage"/>

                {user ? (
                    <Button type="submit" onClick={() => auth.signOut()}>Logout</Button>
                ) : (
                    <div className="app_login_container">
                        <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
                        <Button onClick={() => setOpen(true)}>Sign Up</Button>
                    </div>
                )}
            </div>

            <div className="app_posts">
                <div className="app_posts_left">
                    {
                        posts.map(({id, post}) => {
                            return (
                                post.imageUrl ? (
                                    <Post key={id} postId={id} user={user}  avatar={post.avatar} username={post.username} caption={post.caption} imageUrl={post.imageUrl}/>
                                ) : (
                                    <Post key={id} postId={id} user={user}  avatar={post.avatar} username={post.username} caption={post.caption} videoUrl={post.videoUrl} poster={post.poster}/>
                                )
                            )
                        })
                    }
                </div>
            </div>

            <div style={{padding: '20px', display: 'flex', justifyContent: 'center'}}>
                <InstagramEmbed
                    url="https://www.instagram.com/p/CEEJsPxDS8U/"
                    maxWidth={320}
                    hideCaption={false}
                    containerTagName='div'
                    protocol=''
                    injectScript
                    onLoading={() => {}}
                    onSuccess={() => {}}
                    onFailure={() => {}}
                />
            </div>


            {user?.displayName ? (
                <ImageUpload username={user.displayName} avatar={user.photoURL} />
            ) : (
                <h3>Sorry you need to login to upload</h3>
            )}

        </div>
  );
}

export default App;
