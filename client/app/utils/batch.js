const queue = [];
function purgeQueue() {
    let i = 0;
    while (queue.length) {
        const fn = queue.shift();
        fn(i++);
    }
}

export default function batch(fn) {
    queue.push(fn);
    requestAnimationFrame(purgeQueue);

    return {
        cancel() {
            const index = queue.indexOf(fn);
            if (index !== -1) {
                queue.splice(index, 1);
            }
        },
    };
}
