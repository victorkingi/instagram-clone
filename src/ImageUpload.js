import React, {useState} from "react";
import {Button} from "@material-ui/core";
import { db, storage } from "./firebase";
import * as firebase from "firebase";
import "./imageUpload.css";

function ImageUpload({ username, avatar }) {
    const [caption, setCaption] = useState('');
    const [progress, setProgress] = useState(0);
    const [image, setImage] = useState(null);
    const [poster, setPoster] = useState(null);

    const handleChange = (e) => {
        if (e.target.files[0]) {
            if (e.target.files[1]) {
                setPoster(e.target.files[0]);
            } else {
                setImage(e.target.files[0]);
            }
        }
        if (e.target.files[1]) {
            setImage(e.target.files[1]);
        }
    }

    const handleUpload = () => {
        const imgType = image.type;
        const type = imgType.substring(0, imgType.lastIndexOf('/'));
        console.log(type)

        if (type === "image") {
            const uploadTask = storage.ref(`images/${image.name}`).put(image);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    setProgress(progress);
                },
                (error) => {
                    console.log(error);
                    alert(error.message);
                },
                () => {
                    storage.ref("images").child(image.name)
                        .getDownloadURL()
                        .then(url => {
                            db.collection("posts").add({
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                caption: caption,
                                imageUrl: url,
                                username: username,
                                avatar: avatar
                            });

                            setProgress(0);
                            setCaption('');
                            setImage(null);
                        })
                }
            )

        } else if (type === "video") {
            const uploadTask = storage.ref(`videos/${image.name}`).put(image);
            const secondTask = storage.ref(`images/${poster.name}`).put(poster);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    setProgress(progress);
                },
                (error) => {
                    console.log(error);
                    alert(error.message);
                },
                () => {
                    storage.ref("videos").child(image.name)
                        .getDownloadURL()
                        .then(url => {

                            secondTask.on(
                                "state_changed",
                                (snapshot) => {
                                    const progress = Math.round(
                                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                                    );
                                    setProgress(progress);
                                },
                                (error) => {
                                    console.log(error);
                                    alert(error.message);
                                },
                                () => {
                                    storage.ref("images").child(poster.name)
                                        .getDownloadURL()
                                        .then(posterUrl => {
                                            db.collection("posts").add({
                                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                                caption: caption,
                                                videoUrl: url,
                                                username: username,
                                                avatar: avatar,
                                                poster: posterUrl
                                            });

                                            setProgress(0);
                                            setCaption('');
                                            setImage(null);
                                        })
                                }
                            )
                        })
                }
            )
        }

    }

    return (
        <div className="image_upload">
            <progress className="image_upload_progress" value={progress} max="100" />
            <input type="text" placeholder="Enter a caption..." onChange={event => setCaption(event.target.value)}/>
            <h6>When you upload a video, the first file selected is the thumbnail and the second is the
                actual video. <strong>CANNOT UPLOAD MORE THAN 1 PHOTO</strong></h6>
            <input type="file" multiple="multiple" onChange={handleChange} />
            <Button onClick={handleUpload}>
                Upload
            </Button>
        </div>
    )
}

export default ImageUpload;