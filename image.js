const Clarifai = require('clarifai');
const { json } = require('express');


const app = new Clarifai.App({
    apiKey: 'b5be747d387444f3ba4fe867e39e197f'
});

const handleAPICall = (req, res) => {
    app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => {
        res.json(data);
    })
    .catch(err => res.status(400).json('unable to work with api'))
}

const handleImage = (req, res, db) => {
    const {id} = req.body;
    db('users')
    .where({id:id})
    .increment('entries', 1)
    .then(entries => {
        res.json(entries);
    })
    .catch(error => {
        res.json('failed');
    })
}
module.exports = {
    handleImage,
    handleAPICall
}