import Post from '../models/Posts.js';

export const createPost = async (req, res) =>{
    try{

        const newPost = new Post(req.body);

        const post = await newPost.save();
        
         // 3. Send the saved data back with a 201 (Created) status
        res.status(201).json(post);
        
    }catch(e){
        res.status(500).json({error:e});
    }
}