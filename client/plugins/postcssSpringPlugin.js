const rebound = require('rebound');
const postcss = require('postcss');
const functions = require('postcss-functions');
const format = require('string-format');

const TIMESTEP = 1000 / 60;

module.exports = postcss.plugin('postcss-springs', () => {
    return root => {
        let count = 0;
        const replacer = functions({
            functions: {
                spring(prop, tension, friction, start, end, fmt = '{}') {
                    const name = `_spring_${prop}_${count++}`;
                    const anim = postcss.atRule({ name: 'keyframes', params: name });
                    root.prepend(anim);

                    const looper = new rebound.SteppingSimulationLooper();
                    const system = new rebound.SpringSystem(looper);
                    const spring = system.createSpring(Number(tension), Number(friction));
                    spring.setCurrentValue(Number(start), true);
                    spring.setEndValue(Number(end));

                    const frames = [
                        spring.getCurrentValue(),
                    ];

                    do {
                        looper.step(TIMESTEP);
                        frames.push(spring.getCurrentValue());
                    } while (!system.getIsIdle());

                    const length = frames.length - 1;
                    frames.forEach((val, index) => {
                        const progress = (index / length) * 100;
                        const rule = postcss.rule({ selector: `${progress}%` });
                        anim.append(rule);

                        const value = format(fmt, val);
                        const decl = postcss.decl({ prop, value });
                        rule.append(decl);
                    });

                    return `${name} ${length * TIMESTEP}ms`;
                },
            },
        });

        return replacer(root);
    };
});
