const express = require("express");
const creatorRouter = express.Router();
require("dotenv").config();
const multer = require("multer");
const path = require("path")
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3"); // Package to interact with the s3 bucket
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner"); //Package for getting the url of files from s3 bucket
const { CourseModel } = require("./../models/course.model");

const accessKeyId = process.env.ACCESS_KEY_ID
const secretAccessKey = process.env.SECRET_ACCESS_KEY
const region = process.env.REGION
const bucket = process.env.BUCKET
const expiry = process.env.URL_EXPIRY

creatorRouter.use(express.json({ limit: "50mb" }));
creatorRouter.use(express.urlencoded({ limit: "50mb", extended: true }));

const s3 = new S3Client({          // Setting the credential of aws
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    }
})

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // Set the maximum file size to 50MB
    },
})
// const upload = multer();

creatorRouter.get("/creator", (req, res) => {
    res.sendFile(path.join(__dirname, "./../course.html"))  // Sending the course form
});

creatorRouter.get("/getcourse/:id", async (req, res) => {
    const { id } = req.params
    try {
        const courseExists = await CourseModel.findOne({ creatorId: id });
        // console.log(courseExists)
        if (!courseExists) return res.status(404).json({ message: "Course not found" });

        res.status(200).json(courseExists)
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "error": "Something went wrong" });
    }
});

creatorRouter.get("/singlecourse/:id", async (req, res) => {
    const {id} = req.params;
    try {
        const courseExists = await CourseModel.findOne({ _id: id })
        if (!courseExists) return res.status(404).json({ message: "Course not found" });

        res.status(200).json(courseExists)
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "error": "Something went wrong" });
    }
});

creatorRouter.get("/getcourses", async (req, res) => {
    try {
        const courseExists = await CourseModel.find();
        if (!courseExists[0]) return res.status(404).json({ message: "Courses not found" });

        res.status(200).json(courseExists)
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "error": "Something went wrong" });
    }
});

creatorRouter.post('/upload', upload.fields([{ name: 'image' }, { name: 'video' }]), async function (req, res, next) {

    const { title, description, language, course, creatorId, creatorName } = req.body

    try {

        const videoFile = req.files['video'][0];                    // Extract the uploaded video file from the request through frontend
        const videoName = 'videos/' + videoFile.originalname        // storing original file name
        const videoUrl = await handleAwsStore(videoFile, videoName) // storing file and generating the url with expirable lifetime

        const imageFile = req.files['image'][0];                    // Extract the uploaded image file from the request through frontend
        const thumbnailName = 'images/' + imageFile.originalname    // storing original file name
        const thumbnailURL = await handleAwsStore(imageFile, thumbnailName) // storing file and generating the url with expirable lifetime

        const content = [{                                          // creating videoInfo object
            videoName: videoName,
            videoUrl: videoUrl,
            thumbnailName: thumbnailName,
            thumbnailURL: thumbnailURL
        }]

        const addCourse = new CourseModel({ title, description, language, course, creatorId, creatorName, content });
        await addCourse.save();

        res.json({ message: 'Successfully Added Course' })

    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "error": "Something went wrong" });
    }


});

async function handleAwsStore(file, name) {
    const Params = {                        // setting params of putobject
        Bucket: bucket,
        Key: name,
        Body: file.buffer,
        ContentType: file.mimetype
    }

    const Command = new PutObjectCommand(Params)

    await s3.send(Command);                 // Sending the put Command to s3 buckt

    getObjectParams = {                     // Params to get the file:object from s3
        Bucket: bucket,
        Key: name,
    }

    const getCommand = new GetObjectCommand(getObjectParams);   // Creating get command
    const url = await getSignedUrl(s3, getCommand, { expiresIn: 3600 * expiry });  // generating the url with expirable lifetime
    // console.log(url)
    return url;
}

creatorRouter.delete("/deletecourse/:id", async (req, res) => {
    const { id } = req.params
    try {
        const course = await CourseModel.findOne({ creatorId: id })
        if (!course) return res.status(404).json({ message: "Course not found" });

        for (let item of course.content) {
            deleteFromAws(item.videoName);
            deleteFromAws(item.thumbnailName);
        }

        await CourseModel.findOneAndDelete({ creatorId: id });
        res.json({ message: 'Successfully Deleted', course })
    } catch (error) {
        console.log(error);
        res.status(500).send({ "error": "Something went wrong" });
    }
})

async function deleteFromAws(name) {
    const deleteParams = {                  // creating the delete params
        Bucket: bucket,
        Key: name,                          // name of the file to be deleted
    }
    const deleteCommand = new DeleteObjectCommand(deleteParams) // generating delete command

    await s3.send(deleteCommand);           // sending the delete request to s3
}


creatorRouter.patch("/update/like/:creatorId", async (req, res) => {
    const { creatorId } = req.params
    const { userid } = req.body;
    try {
        const courseExists = await CourseModel.findOne({ creatorId: creatorId });
        if (!courseExists) return res.status(404).json({ message: "Course not found" });


        const isAlreadyLiked = courseExists.content[0].likedBy.some(like => like.id === userid);  // returns true or false based on the condition

        if(isAlreadyLiked) return res.json({ message: "already liked!" });

        await CourseModel.findOneAndUpdate(
            { creatorId: creatorId },
            { $push: { 'content.0.likedBy': { id: userid } } }
        )
        res.status(200).json({
            message: "Liked"
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "error": "Something went wrong" });
    }
});

creatorRouter.patch("/update/comment/:creatorId", async (req, res) => {
    const { creatorId } = req.params
    const { commentBy, commentContent } = req.body;
    try {
        const courseExists = await CourseModel.findOne({ creatorId: creatorId });
        if (!courseExists) return res.status(404).json({ message: "Course not found" });

        await CourseModel.findOneAndUpdate(
            { creatorId: creatorId },
            { $push: { 'content.0.comments': { commentBy: commentBy, commentContent:commentContent } } }
        )
        res.status(200).json({
            message: "commented"
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "error": "Something went wrong" });
    }
});

module.exports = {
    creatorRouter
}