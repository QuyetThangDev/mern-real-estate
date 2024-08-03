import { useSelector, useDispatch } from "react-redux"
import { app } from '../firebase'
import { AiFillWarning } from 'react-icons/ai'
import { useRef, useState, useEffect, Fragment } from "react"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signOutUserStart, signOutUserSuccess, signOutUserFailure } from '../redux/user/userSlice';

import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col } from "reactstrap";

export default function Profile() {
    const fileRef = useRef(null)
    const { currentUser, loading, error } = useSelector((state) => state.user)
    const [file, setFile] = useState(undefined)
    const [filePerc, setFilePerc] = useState(0)
    const [fileUploadError, setFileUploadError] = useState(false)
    const [formData, setFormData] = useState({})
    const [updateSuccess, setUpdateSuccess] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const dispatch = useDispatch();
    console.log(formData)

    useEffect(() => {
        if (file) {
            handleFileUpload(file)
        }
    }, [file])

    const handleFileUpload = (file) => {
        const storage = getStorage(app)
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setFilePerc(Math.round(progress))
            },

            //Callback function when we have errors
            (error) => {
                setFileUploadError(true)
            },
            //Callback function when the uploading is successful
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then
                    ((downloadURL) =>
                        setFormData({
                            ...formData, avatar: downloadURL
                        })
                    )
            }
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(updateUserStart());
            const res = await fetch(`/api/user/update/${currentUser._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json();
            if (data.success == false) {
                dispatch(updateUserFailure(data.message))
                return;
            }
            dispatch(updateUserSuccess(data));
            setUpdateSuccess(true)
            console.log(loading)
        } catch (error) {
            dispatch(updateUserFailure(error.message))
        }
    }

    const handleShowDeleteConfirmation = () => {
        setShowDeleteConfirmation(true)
        console.log(showDeleteConfirmation)
    }

    const handleHideDeleteConfirmation = () => {
        setShowDeleteConfirmation(false)
        console.log(showDeleteConfirmation)
    }
    const handleDeleteUserConfirmed = async () => {
        try {
            setShowDeleteConfirmation(false); // Ẩn modal xác nhận
            console.log(setShowDeleteConfirmation)
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success === false) {
                dispatch(deleteUserFailure(data.message));
                return;
            }
            dispatch(deleteUserSuccess(data));
        } catch (error) {
            dispatch(deleteUserFailure(error.message));
        }
    };

    const handleSignOut = async () => {
        dispatch(signOutUserStart())
        try {
            const res = await fetch(`/api/auth/signout`);
            const data = await res.json();
            if (data.success === false) {
                dispatch(signOutUserFailure(data.message))
                return;
            }
            dispatch(signOutUserSuccess(data))
        } catch (error) {
            dispatch(signOutUserFailure(data.message))
        }
    }
    return (
        <Fragment>

            <div className="max-w-sm mx-auto">
                {showDeleteConfirmation && (
                    <div className="fixed inset-0 flex items-center justify-center">
                        <div className="modal-overlay fixed inset-0 bg-black opacity-50"></div>
                        <div className=" modal-container bg-white w-96 h-46 rounded-lg shadow-lg z-50 overflow-hidden">
                            <div>
                                <AiFillWarning className='text-red-700 self-center text-4xl font-semibold mx-auto mt-2' />
                                <h5 className="text-center p-1 text-red-800 font-semibold" id="exampleModalLabel">Delete Confirmation</h5>
                            </div>
                            <div className="text-center p-1 text-slate-600 font-semibold">
                                <p>Are you sure you want to delete your account?</p>
                            </div>
                            <div className=" flex justify-between mx-10 my-3">
                                <button onClick={handleDeleteUserConfirmed} className="w-32 p-1 rounded-3xl bg-red-700 text-white">Confirm</button>
                                <button onClick={handleHideDeleteConfirmation} className="w-32 p-2 rounded-3xl bg-slate-700 text-white">Cancel</button>

                            </div>
                        </div>
                    </div>

                )}
                <h1 className='text-xl font-bold text-center my-4'>User Profile</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input onChange={(e) => setFile(e.target.files[0])} type="file" ref={fileRef} hidden accept="image/*" />
                    <img
                        onClick={() => fileRef.current.click()}
                        src={formData.avatar || currentUser.avatar}
                        alt="profile picture"
                        className="rounded-full w-16 h-16 object-cover self-center"
                    />
                    <p className="text-sm self-center">
                        {fileUploadError ?
                            (
                                <span className="text-red-700"> Error image upload! (Image must be less then 2 MB!)</span>
                            ) : filePerc > 0 && filePerc < 100 ?
                                (
                                    <span className="text-slate-700"> {`Uploading ${filePerc}%`}</span>
                                ) : filePerc === 100 ?
                                    (
                                        <span className="text-green-700">Image successfully uploaded!</span>
                                    ) :
                                    ("")
                        }
                    </p>
                    <input
                        type="text"
                        placeholder='username...'
                        defaultValue={currentUser.username}
                        onChange={handleChange}
                        className='border p-3 rounded-lg'
                        id='username'

                    />
                    <input
                        type="email"
                        placeholder='email...'
                        defaultValue={currentUser.email}
                        onChange={handleChange}
                        className='border p-3 rounded-lg'
                        id='email'

                    />
                    <input
                        type="password"
                        placeholder='password...'
                        onChange={handleChange}
                        className='border p-3 rounded-lg'
                        id='password'

                    />
                    <button
                        disabled={loading}
                        className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:shadow-lg hover:bg-slate-800 disabled:opacity-70'>
                        {loading ? 'loading...' : 'update'}

                    </button>
                </form>
                <div className="flex justify-between mt-3">
                    <span onClick={handleShowDeleteConfirmation} className="text-red-600 cursor-pointer hover:text-red-900 font-semibold">Delete account</span>
                    <span onClick={handleSignOut} className="text-slate-600 cursor-pointer hover:text-slate-900 font-semibold">Sign out</span>
                </div>
                <p className="text-red-700 mt-5">{error ? error : ''}</p>
                <p className="text-green-700 mt-5">{updateSuccess ? "User is updated successfully!" : ''}</p>
            </div>
        </Fragment >
    )
}
