const handlePost = (io, socket) => {

    socket.on('open_post', (data) => {
        const {
            postID
        } = data;
        socket.join(postID);

        socket.on('create_comment', (data) => {
            const datapost = data.datapost;
            io.sockets.in(postID).emit('create_comment', {
                datapost
            });
        });

        socket.on('leave_post', () => {
            socket.leave(postID);
        });
    });
};

module.exports = handlePost;