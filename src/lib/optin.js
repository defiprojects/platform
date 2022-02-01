function convertOptinString(optinString) {
    let lettersArr = optinString.split('');
    return Object.fromEntries(
        lettersArr
            .map((letter, index) => {
                if (index % 2 === 0) {
                    return [
                        letterToNotificationTypeOrLevel(letter),
                        letterToNotificationTypeOrLevel(lettersArr[index + 1])
                    ];
                }
            })
            .filter((entry) => !!entry)
    );
}

function letterToNotificationTypeOrLevel(letter) {
    switch (letter) {
        case 'g':
            return '📢';
        case 's':
            return '🚨';
        case 'v':
            return '🗳';
        case 'l':
            return '🚀';
        case 'p':
            return '👤';
        case 'b':
            return 'bundle';
        case 'd':
            return 'decline';
        case 'i':
            return 'instant';
    }
}

export {convertOptinString}