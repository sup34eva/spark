function format(obj) {
    switch (typeof obj) {
        case 'string':
            return '"%s"';
        case 'boolean':
        case 'undefined':
            return '%s';
        case 'number':
            return obj % 1 === 0 ? '%i' : '%f';
        default:
            return obj === null ? '%s' : '%O';
    }
}

export function wrapLogger(obj, name) {
    if (typeof obj === 'function') {
        return function (...args) {
            const group = `%c${name}(${args.map(format).join(', ')})`;
            try {
                console.groupCollapsed(group, 'color: #3f51b5', ...args);

                const result = obj(...args);
                if (result !== undefined) {
                    console.log(`%c=> ${format(result)}`, 'color: #3f51b5', result);
                }

                return loggerWrap(result, `${name}()`);
            } finally {
                console.groupEnd(group);
            }
        };
    }

    if (obj !== null && typeof obj === 'object' && (
        obj.constructor === Object ||
        !(obj.constructor.name in window)
    )) {
        return new Proxy(obj, {
            get(target, prop, proxy) {
                let path = `${name}.${prop}`;
                if (obj instanceof Array && !Number.isNaN(Number(prop))) {
                    path = `${name}[${prop}]`;
                }

                const field = target[prop];
                if (typeof field === 'function') {
                    return loggerWrap(field.bind(proxy), path);
                }

                console.log(`%c${path} -> ${format(field)}`, 'color: #1b5e20', field);
                return loggerWrap(field, path);
            },
            set(target, prop, value) {
                let path = `${name}.${prop}`;
                if (obj instanceof Array && !Number.isNaN(Number(prop))) {
                    path = `${name}[${prop}]`;
                }

                console.log(`%c${path} = ${format(value)}`, 'color: #b71c1c', value);

                // eslint-disable-next-line no-param-reassign
                target[prop] = value;
                return true;
            },
        });
    }

    return obj;
}
