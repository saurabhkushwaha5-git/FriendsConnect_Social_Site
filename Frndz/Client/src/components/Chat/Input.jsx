import React, { useContext, useState } from 'react'
import { BiImageAdd } from 'react-icons/bi'
import { GeneralContext } from '../../context/GeneralContextProvider'
import {v4 as uuid} from 'uuid';
import axios from 'axios';
//import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
//import { storage } from '../../firebase';


// ADD THESE CONSTANTS
const CLOUD_NAME = "********"; 
const UPLOAD_PRESET = "*********"; 
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

const Input = () => {

    const {socket, chatData} = useContext(GeneralContext);
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState();
    const userId = localStorage.getItem('userId');

    const handleSend = async () =>{
console.log("Current Chat ID being used:", chatData.chatId);
  if (!chatData.chatId) return alert("Please select a friend first!");
  let downloadURL = ""; // Added: variable to store the link
      if (file){
         const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('resource_type', 'auto'); // Added: specifically for video/any file

        try {
            const res = await axios.post(CLOUDINARY_URL, formData, {
                onUploadProgress: (p) => setUploadProgress((p.loaded / p.total) * 100)
            });
            downloadURL = res.data.secure_url; // Success! URL is now stored
        } catch (err) {
            console.error("Cloudinary Error:", err);
            return alert("Upload failed");
        }
      }
      try{
        let date = new Date() 
        await socket.emit('new-message', {chatId: chatData.chatId ,id: uuid(), 
                                            text: text,file: downloadURL, senderId: userId, date: date});
        setUploadProgress(null);
        setText('');
        setFile(null);
      }
      catch (err) {
        console.log("Socket error:", err);
    }
    }

  return (
    <div className='input' >
      <input type="text" placeholder='type something...' onChange={e => setText(e.target.value)} value={text} />
      <div className="send">
        <input type="file" style={{display : 'none'}} id='file' onChange={e=> setFile(e.target.files[0])} />
        <label htmlFor="file" style={{display:'flex'}}>
          <BiImageAdd />
          <p style={{fontSize: '12px'}}>{uploadProgress ? Math.floor(uploadProgress) + '%' : ''}</p>
        </label>
        <button onClick={handleSend} >Send</button>
      </div>
    </div>
  )
}

export default Input