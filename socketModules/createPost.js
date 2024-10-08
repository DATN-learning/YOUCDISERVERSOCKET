const axios = require('axios');
const API_URL = require('../types');
const stringSimilarity = require('string-similarity');
const datatest = [
    'Hôm nay trời nắng đẹp',
    'Tôi đang học lập trình Node.js',
    'Chào buổi sáng!',
    'Thời tiết hôm nay rất lạnh',
    'Tôi yêu công nghệ'
];


const suggestExercises = (token, idRoom, id_subject, id_class, suggestion, listText, io, socket) => {
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
    const data = id_subject > 0 ? {
        label: suggestion,
        class_room_id: id_class,
        subject_id: id_subject,
    } : {
        label: suggestion,
        class_room_id: id_class,
    }
    const res = axios.post(`${API_URL.API_URL}/api/manapost/getPostQuestionByLable`, data, config);
    if (res) {
        res.then((res) => {
            let ratingArr = [];
            res.data.data.map((item) => {
                let ratingFake = 0;
                console.log("-----------------");
                item.get_data_analytics.map((item2) => {
                    const matches = stringSimilarity.findBestMatch(item2.text_data, listText);
                    ratingFake += matches.bestMatch.rating;
                });
                const sumRating = ratingFake / item.get_data_analytics.length;
                ratingArr.push({
                    id: item.id,
                    rating: sumRating
                });
            });
            const sorted = ratingArr.sort((a, b) => b.rating - a.rating);
            const newArr = [];
            sorted.map((item) => {
                newArr.push(
                    res.data.data.find((item2) => item2.id === item.id)
                );
            });
            console.log(newArr);
            io.sockets.in(idRoom).emit('analyze_exercises', {
                data: newArr
            });

        }).catch((err) => {
            return null;
        });
    }
}

const createPost = (io, socket) => {
    socket.on('analyze_exercises', (data) => {
        console.log(data);
        const idRoom = socket.handshake.address + socket.handshake.query.token + 'analyze_exercises';
        socket.join(idRoom);
        suggestExercises(socket.handshake.query.token, idRoom, data.id_subject, data.id_class, data.suggestion, data.listText, io, socket);
    });

};

module.exports = createPost;